from fastapi import APIRouter, HTTPException

from database import database, cursor
from schemas import DriveCreate, DriveJoin


router = APIRouter()


# Create a Drive inside a Convoy using its id
############################################################################################
@router.post("/convoys/{convoy_id}/drives")
def create_drive(convoy_id: int, drive: DriveCreate):
    try:
        cursor.execute(
            "SELECT id FROM convoys WHERE id = %s;",
            (convoy_id,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Convoy not found")

        cursor.execute(
            """
            INSERT INTO drives (convoy_id, name, starting_location, destination, date_time)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (
                convoy_id,
                drive.name,
                drive.starting_location,
                drive.destination,
                drive.date_time
            )
        )

        drive_id = cursor.fetchone()[0]

        cursor.execute(
            """
            INSERT INTO drive_members (drive_id, user_id)
            VALUES (%s, %s);
            """,
            (drive_id, drive.creator_id)
        )

        database.commit()

        return {
            "message": "Drive created",
            "drive_id": drive_id
        }

    except HTTPException:
        raise

    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# View a drive
############################################################################################
@router.get("/drives/{drive_id}")
def view_drive(drive_id: int):
    try:
        # Get drive info
        cursor.execute(
            """
            SELECT id, convoy_id, name, starting_location, destination, date_time
            FROM drives
            WHERE id = %s;
            """,
            (drive_id,)
        )

        drive = cursor.fetchone()

        if drive is None:
            raise HTTPException(status_code=404, detail="Drive not found")

        # Get drive members
        cursor.execute(
            """
            SELECT users.id, users.name, users.email
            FROM drive_members
            JOIN users
            ON drive_members.user_id = users.id
            WHERE drive_members.drive_id = %s;
            """,
            (drive_id,)
        )

        members = cursor.fetchall()

        return {
            "id": drive[0],
            "convoy_id": drive[1],
            "name": drive[2],
            "starting_location": drive[3],
            "destination": drive[4],
            "date_time": drive[5],

            "members": [
                {
                    "id": m[0],
                    "name": m[1],
                    "email": m[2]
                }
                for m in members
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# List all drives inside a convoy
############################################################################################

# The {convoy_id} will be passed by the frontend when opening a convoy detail screen,
# so that we can show all of the drives that have been planned inside that convoy.
@router.get("/convoys/{convoy_id}/drives")
def list_convoy_drives(convoy_id: int):

    # This SQL query selects every drive that belongs to the given convoy.
    # We order by date_time ASC so upcoming drives appear first.
    cursor.execute(
        """
        SELECT id, convoy_id, name, starting_location, destination, date_time
        FROM drives
        WHERE convoy_id = %s
        ORDER BY date_time ASC;
        """,
        (convoy_id,)
    )

    # fetchall() returns a list of tuples, one tuple per drive.
    drives = cursor.fetchall()

    # Convert each tuple into a dictionary the frontend can consume.
    return {
        "convoy_id": convoy_id,
        "drives": [
            {
                "id": d[0],
                "convoy_id": d[1],
                "name": d[2],
                "starting_location": d[3],
                "destination": d[4],
                "date_time": d[5]
            }
            for d in drives
        ]
    }


# List all drives that a user has joined (across every convoy)
############################################################################################

# The {user_id} will be passed by the frontend on the global Drives tab,
# so the user can see every drive they are part of regardless of convoy.
@router.get("/users/{user_id}/drives")
def list_user_drives(user_id: int):

    # This SQL query joins the drives table with drive_members so that we only
    # return drives the given user has actually joined.
    # We order by date_time ASC so upcoming drives appear first.
    cursor.execute(
        """
        SELECT d.id, d.convoy_id, d.name, d.starting_location, d.destination, d.date_time
        FROM drives d
        JOIN drive_members dm ON dm.drive_id = d.id
        WHERE dm.user_id = %s
        ORDER BY d.date_time ASC;
        """,
        (user_id,)
    )

    # fetchall() returns a list of tuples, one tuple per drive.
    drives = cursor.fetchall()

    # Convert each tuple into a dictionary the frontend can consume.
    return {
        "user_id": user_id,
        "drives": [
            {
                "id": d[0],
                "convoy_id": d[1],
                "name": d[2],
                "starting_location": d[3],
                "destination": d[4],
                "date_time": d[5]
            }
            for d in drives
        ]
    }


# Join a drive
############################################################################################
@router.post("/drives/{drive_id}/join")
def join_drive(drive_id: int, join: DriveJoin):
    try:
        cursor.execute(
            "SELECT id FROM drives WHERE id = %s;",
            (drive_id,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Drive not found")

        cursor.execute(
            "SELECT id FROM users WHERE id = %s;",
            (join.user_id,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute(
            """
            SELECT id FROM drive_members
            WHERE drive_id = %s AND user_id = %s;
            """,
            (drive_id, join.user_id)
        )

        if cursor.fetchone() is not None:
            raise HTTPException(status_code=400, detail="User already joined this drive")

        cursor.execute(
            """
            INSERT INTO drive_members (drive_id, user_id)
            VALUES (%s, %s)
            RETURNING id;
            """,
            (drive_id, join.user_id)
        )

        drive_member_id = cursor.fetchone()[0]
        database.commit()

        return {
            "message": "User joined drive",
            "drive_member_id": drive_member_id
        }

    except HTTPException:
        raise

    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=400, detail=str(e))