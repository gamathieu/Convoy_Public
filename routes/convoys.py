from fastapi import APIRouter, HTTPException

from database import database, cursor
from schemas import ConvoyCreate, JoinConvoy, LeaveConvoy, TransferConvoyLead


router = APIRouter()

# Create a Convoy
############################################################################################
@router.post("/convoys")
def create_convoy(convoy: ConvoyCreate):
    try:
        cursor.execute(
            """
            INSERT INTO convoys (leader_id, name)
            VALUES (%s, %s)
            RETURNING id, leader_id, name, created_at;
            """,
            (convoy.leader_id, convoy.name)
        )

        new_convoy = cursor.fetchone()

        cursor.execute(
            """
            INSERT INTO convoy_members (convoy_id, user_id)
            VALUES (%s, %s);
            """,
            (new_convoy[0], convoy.leader_id)
        )

        database.commit()

        return {
            "message": "Convoy created",
            "convoy": {
                "id": new_convoy[0],
                "leader_id": new_convoy[1],
                "name": new_convoy[2],
                "created_at": new_convoy[3]
            }
        }

    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# Find a Convoy using its Convoy_Id
############################################################################################
@router.get("/convoys/{convoy_id}")
def find_convoy(convoy_id: int):
    cursor.execute(
        """
        SELECT id, leader_id, name, created_at
        FROM convoys
        WHERE id = %s;
        """,
        (convoy_id,)
    )

    convoy = cursor.fetchone()

    if not convoy: 
        raise HTTPException(status_code=404, detail="Convoy not Found.")
    
    # Join users so the frontend can show member names instead of only user ids.
    cursor.execute(
        """
        SELECT users.id, users.name
        FROM convoy_members
        JOIN users ON convoy_members.user_id = users.id
        WHERE convoy_members.convoy_id = %s;
        """,
        (convoy_id,)
    )

    members = cursor.fetchall()

    return { 
        "convoy": { 
            "id": convoy[0],
            "leader_id": convoy[1],
            "name": convoy[2],
            "created_at": convoy[3],
            "members": [
                {
                    "id": m[0],
                    "name": m[1]
                }
                for m in members
            ]
        }
    }


# List all convoys for a user (the ones they lead or are a member of)
############################################################################################

# The {user_id} will be passed by the frontend when they want to see
# all the convoys that a given user belongs to.
@router.get("/users/{user_id}/convoys")
def list_user_convoys(user_id: int):

    # This SQL query joins the convoys table with the convoy_members table
    # so that we only return the convoys this user is actually a member of.
    # We also compute two helpful fields directly in SQL:
    #   - is_leader: true if this user created/leads the convoy
    #   - member_count: total number of members in that convoy
    # We order by created_at DESC so the most recently created convoys show first.
    cursor.execute(
        """
        SELECT c.id, c.leader_id, c.name, c.created_at,
               (c.leader_id = %s) AS is_leader,
               (SELECT COUNT(*) FROM convoy_members cm2 WHERE cm2.convoy_id = c.id) AS member_count
        FROM convoys c
        JOIN convoy_members cm ON cm.convoy_id = c.id
        WHERE cm.user_id = %s
        ORDER BY c.created_at DESC;
        """,
        (user_id, user_id)
    )

    # fetchall() returns a list of tuples, one tuple per row.
    convoys = cursor.fetchall()

    # We then transform that list of tuples into a list of dictionaries,
    # which is the shape the frontend expects.
    return {
        "user_id": user_id,
        "convoys": [
            {
                "id": c[0],
                "leader_id": c[1],
                "name": c[2],
                "created_at": c[3],
                "is_leader": c[4],
                "member_count": c[5]
            }
            for c in convoys
        ]
    }


# Join a convoy using its id
############################################################################################
@router.post("/convoys/{convoy_id}/join")
def join_convoy(convoy_id: int, data: JoinConvoy):
    cursor.execute(
        "SELECT id FROM convoys WHERE id = %s;",
        (convoy_id,)
    )

    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Convoy not found")

    cursor.execute(
        "SELECT id FROM users WHERE id = %s;",
        (data.user_id,)
    )

    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute(
        """
        SELECT 1 FROM convoy_members
        WHERE convoy_id = %s AND user_id = %s;
        """,
        (convoy_id, data.user_id)
    )

    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already in convoy")

    cursor.execute(
        """
        INSERT INTO convoy_members (convoy_id, user_id)
        VALUES (%s, %s)
        RETURNING convoy_id, user_id;
        """,
        (convoy_id, data.user_id)
    )

    new_member = cursor.fetchone()
    database.commit()

    return {
        "message": "Joined convoy",
        "convoy_id": new_member[0],
        "user_id": new_member[1]
    }


# Transfer convoy leadership to another member
############################################################################################
@router.post("/convoys/{convoy_id}/transfer-leadership")
def transfer_convoy_leadership(convoy_id: int, data: TransferConvoyLead):
    cursor.execute(
        "SELECT id, leader_id FROM convoys WHERE id = %s;",
        (convoy_id,)
    )

    convoy = cursor.fetchone()

    if not convoy:
        raise HTTPException(status_code=404, detail="Convoy not found")


# Only the current leader can transfer leadership, so we check that first.
    if convoy[1] != data.current_leader_id:
        raise HTTPException(status_code=403, detail="Only the current leader can transfer leadership")


# The new leader must be a different member of the convoy, so we check that next.
    if data.current_leader_id == data.new_leader_id:
        raise HTTPException(status_code=400, detail="New leader must be a different member")


# Check if the new leader exists in the convoy. 
    cursor.execute(
        "SELECT id FROM users WHERE id = %s;",
        (data.new_leader_id,)
    )

    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute(
        """
        SELECT 1 FROM convoy_members
        WHERE convoy_id = %s AND user_id = %s;
        """,
        (convoy_id, data.new_leader_id)
    )

    if not cursor.fetchone():
        raise HTTPException(status_code=400, detail="New leader must already be in the convoy")

    cursor.execute(
        """
        UPDATE convoys
        SET leader_id = %s
        WHERE id = %s
        RETURNING id, leader_id;
        """,
        (data.new_leader_id, convoy_id)
    )

    updated = cursor.fetchone()
    database.commit()

    return {
        "message": "Leadership transferred",
        "convoy_id": updated[0],
        "leader_id": updated[1]
    }


# Leave a convoy using its id
############################################################################################
@router.post("/convoys/{convoy_id}/leave")
def leave_convoy(convoy_id: int, data: LeaveConvoy):

    # Check if the convoy exists. 
    cursor.execute(
        "SELECT id, leader_id FROM convoys WHERE id = %s;",
        (convoy_id,)
    )

    convoy = cursor.fetchone()

    if not convoy:
        raise HTTPException(status_code=404, detail="Convoy not found")
    

    # Check if the User exists. 
    cursor.execute(
        "SELECT id FROM users WHERE id = %s;",
        (data.user_id,)
    )

    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")


    # Check if the user is part of the convoy
    # Also Checking if this user is the leader. 
    cursor.execute(
        """
        SELECT 1 FROM convoy_members
        WHERE convoy_id = %s AND user_id = %s;
        """,
        (convoy_id, data.user_id)
    )

    if not cursor.fetchone():
        raise HTTPException(status_code=400, detail="User is not in this convoy")

    # Leader cannot leave until leadership is transferred to someone else.
    if convoy[1] == data.user_id:
        cursor.execute(
            """
            SELECT COUNT(*) FROM convoy_members
            WHERE convoy_id = %s;
            """,
            (convoy_id,)
        )

        member_count = cursor.fetchone()[0]

        if member_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="You are the only member. Transfer leadership is not possible."
            )

        else: 
            raise HTTPException(
            status_code=400,
            detail="Leader must transfer leadership before leaving"
            )

    cursor.execute(
        """
        DELETE FROM convoy_members
        WHERE convoy_id = %s AND user_id = %s
        RETURNING convoy_id, user_id;
        """,
        (convoy_id, data.user_id)
    )

    removed = cursor.fetchone()
    database.commit()

    return {
        "message": "Left convoy",
        "convoy_id": removed[0],
        "user_id": removed[1]
    }