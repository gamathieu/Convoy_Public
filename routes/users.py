from fastapi import APIRouter, HTTPException
import psycopg2

from database import database, cursor
from routes.auth import create_access_token
from schemas import UserCreate, UserUpdate, LoginRequest
from utils import hash_password, verify_password

# DEBUG-REMOVE: temporary timing logger to diagnose register timeout.
import time
def _dbg(stage: str, t0: float):
    print(f"[DEBUG /users] {stage} t+{(time.time() - t0) * 1000:.0f}ms", flush=True)
# END DEBUG-REMOVE


# Create Router that app.py will import.
router = APIRouter()

# Create a new User
############################################################################################

# Call the router now, not the app object.
@router.post("/users")

#specify the type of the user parameter to be UserCreate, which is a Pydantic model defined in schemas.py.
def create_user(user: UserCreate):

    # DEBUG-REMOVE
    _t0 = time.time()
    _dbg(f"received email={user.email}", _t0)
    # END DEBUG-REMOVE

    try: 
        
        # The new hashed_password is created by the function "hash_password" in utils.py.
        # the .password is inherited from the UserCreate model, which has a password field.
        hashed_password = hash_password(user.password)
        _dbg("hashed password", _t0)  # DEBUG-REMOVE
        
        # SQL Query to add a new user to the database. 
        # The table headers are name, email, password_hash, and starting_location. 
        # We are inserting the values from the user parameter, which is of type UserCreate.
        # We use %s as placeholders for the values we want to insert, and then we pass the actual values as a tuple in the second argument of cursor.execute(). This helps prevent SQL injection attacks.
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash, starting_location)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (user.name, user.email, hashed_password, user.starting_location)
        )
        _dbg("execute INSERT done", _t0)  # DEBUG-REMOVE

        # cursor.fetchone() is used to retrieve the id of the newly created user
        # which is returned by the SQL query and store it in user_id.
        user_id = cursor.fetchone()[0]

        # After executing the SQL query, we need to commit the 
        # transaction to save the changes to the database.
        database.commit()
        _dbg(f"committed user_id={user_id}", _t0)  # DEBUG-REMOVE

        return {
            "message": f"You have created a new user: {user.name}",
            "user_id": user_id
        }
    
    # error handling for when a user tries to create an account with an email that already exists in the database.
    # The psycopg2.errors.UniqueViolation error is raised when there is a violation of a unique constraint in the database
    # which in this case would be the email field in the users table.
    # "email" UNIQUE has been set in the database when I created it. 
    except psycopg2.errors.UniqueViolation:
        database.rollback()
        _dbg("UniqueViolation -> 400", _t0)  # DEBUG-REMOVE
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    # DEBUG-REMOVE: catch-all so we can see any other failure with timing
    except Exception as e:
        database.rollback()
        _dbg(f"EXCEPTION: {type(e).__name__}: {e}", _t0)
        raise
    # END DEBUG-REMOVE


# See user profile
############################################################################################

# The {user_id} will be passed by the frontend when they want to see a specific user's profile.
@router.get("/users/{user_id}")

# This says this API will only accept an integer as the user_id parameter. 
def get_user(user_id: int):

    # This SQL query is used to Select the information fetchone() will retrieve from the table. 
    cursor.execute( 
        """
        SELECT id, name, email, starting_location
        FROM users
        WHERE id = %s;
        """,
        (user_id,)
    )

    # fetchone() is used to retrieve the selection made in the SQL query. 
    user = cursor.fetchone()


    # if fetchone() failed and was not able to set a value for user, 
    # then raise an HTTPException with a 404 status code and a detail message of "User not found".
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    

    # This SQL query is used to select all the vehicles that belong to the user with the specified user_id.
    cursor.execute(
        """ 
        SELECT id, make, model, year
        FROM vehicles
        WHERE user_id = %s;
        """,
        (user_id,)
    )


    # fetchall() is used to retrieve all the rows returned by the SQL query and store them in the vehicles variable.
    # vehicle is a list of tuples
    vehicles = cursor.fetchall()

    # vehicle_list is a list of dictionaries that is created by iterating over the vehicles list of tuples and 
    # converting each tuple into a dictionary with keys "id", "make", "model", and "year".
    vehicle_list = [ 
        {
            "id": v[0],
            "make": v[1],
            "model": v[2],
            "year": v[3]
        }
        for v in vehicles
    ]

    return {
        "id": user[0],
        "name": user[1],
        "email": user[2],
        "starting_location": user[3],
        "vehicles": vehicle_list
    }


# Delete a User
############################################################################################
@router.delete("/users/{user_id}")
def delete_user(user_id: int, requester_id: int):
    if requester_id != user_id:
        raise HTTPException(status_code=403, detail="Not Allowed")
    

    # the order in which we delete the user is quite important because of the foreign key constraints in the database.
    # we cannot delete something that is being referenced by another table.
    try:
        cursor.execute(
            """
            DELETE FROM convoy_members
            WHERE user_id = %s;
            """,
            (user_id,)
        )

        cursor.execute(
            """
            DELETE FROM drive_members
            WHERE user_id = %s;
            """,
            (user_id,)
        )

        cursor.execute(
            """
            DELETE FROM vehicles
            WHERE user_id = %s;
            """,
            (user_id,)
        )

        cursor.execute(
            """
            DELETE FROM users
            WHERE id = %s
            RETURNING id, name;
            """,
            (user_id,)
        )

        deleted_user = cursor.fetchone()
        database.commit()

        if not deleted_user:
            raise HTTPException(status_code=404, detail="User not Found")
        
        return { 
            "message": f"user deleted: {deleted_user[1]}",
            "user_id": deleted_user[0]
        }

    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=400, detail=str(e))



# Edit a User
############################################################################################

##### DYNAMIC SQL QUERY #####
#depening on what the user wants to update.
@router.put("/users/{user_id}")
def edit_user(user_id: int, user: UserUpdate):

    # create two empty lists. 
    fields = []
    values = []


    # if the front end returns a user.name in the body of the request
    # then append the name to fields and make it = %s. 
    # then append the value of the actual user.name to the values list. 
    if user.name is not None: 
        fields.append("name = %s")
        values.append(user.name)

    if user.email is not None: 
        fields.append("email = %s")
        values.append(user.email)

    if user.starting_location is not None: 
        fields.append("starting_location = %s")
        values.append(user.starting_location)


    
    # if no fields were updated.
    if not fields: 
        raise HTTPException(status_code=400, detail="No fields to update")
    

    # this is the last %s specified value because it's the last thing in the SQL query.
    values.append(user_id)


    # .join() takes the elements of the fields list and joins them into a single string, with ", " as the separator.
    # we want to join all the "email = %s", "name = %s", etc. into one string that can be used in the SQL query.
    query = f"""
        UPDATE users
        SET {', '.join(fields)}
        WHERE id = %s
        RETURNING id;
    """

    # this is the actually SQL command. 
    # after the query, we always had a comma and then we specified the values %s.
    cursor.execute(query, tuple(values))

    # cursor.execute(
    #         """
    #         DELETE FROM users
    #         WHERE id = %s
    #         RETURNING id, name;
    #         """,
    #         (user_id,)
    #     )

    # fetch the last return value of the SQL query. user_id.
    updated = cursor.fetchone()
    database.commit()

    if not updated: 
        raise HTTPException(status_code=404, detail="User not found.")
    
    return { 
        "message": "User updated.",
        "user_id": updated[0]
    }


# Login
############################################################################################
@router.post("/login")
def login(data: LoginRequest):


    #fetching the email variable from the data object which is of type LoginRequest, which is a Pydantic model defined in schemas.py.
    # only return something out of a query if we edit or delete something. 
    cursor.execute(
        """
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = %s;
        """,
        (data.email,)
    )

    # user is stored with id, name, email, and password_hash.
    user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    stored_password = user[3]

    # verify_password is a function in utils.py. 
    # Here we just feed the arguments. 
    # this will return True or False
    if not verify_password(data.password, stored_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user[0]),
            "email": user[2]
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2]
            }
        }