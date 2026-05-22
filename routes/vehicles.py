from fastapi import APIRouter, HTTPException

from database import database, cursor
from schemas import VehicleCreate, VehicleUpdate


router = APIRouter()

# ADD vehicle
############################################################################################
@router.post("/users/{user_id}/vehicles")
def add_vehicle(user_id: int, vehicle: VehicleCreate):
    try: 
        cursor.execute(
            """
            INSERT INTO vehicles (user_id, make, model, year)
            VALUES (%s, %s, %s, %s)
            RETURNING id; 
            """,
            (user_id, vehicle.make, vehicle.model, vehicle.year)
        )

        vehicle_id = cursor.fetchone()[0]
        database.commit()

        return {
            "message": "Vehicle added",
            "vehicle_id": vehicle_id
        }
    
    except Exception as e: 
        database.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# DELETE vehicle
############################################################################################
@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, user_id: int, requester_id: int):
    
    if requester_id != user_id: 
        raise HTTPException(status_code=403, detail="Not Allowed")
    
    cursor.execute(
        """
        DELETE FROM vehicles
        WHERE id = %s
        RETURNING id, user_id, make, model, year;
        """,
        (vehicle_id,)
    )

    deleted_vehicle = cursor.fetchone()
    database.commit()

    if not deleted_vehicle: 
        raise HTTPException(status_code=404, detail="Vehicle not Found.")
    
    return {
        "message": "Vehicle deleted",
        "vehicle": {
            "id": deleted_vehicle[0],
            "user_id": deleted_vehicle[1],
            "make": deleted_vehicle[2],
            "model": deleted_vehicle[3],
            "year": deleted_vehicle[4]
        }
    }


# UPDATE vehicle
############################################################################################
@router.put("/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: int, vehicle: VehicleUpdate):
    try:
        # make sure vehicle exists
        cursor.execute(
            "SELECT id FROM vehicles WHERE id = %s;",
            (vehicle_id,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        updates = []
        values = []

        if vehicle.make is not None:
            updates.append("make = %s")
            values.append(vehicle.make)

        if vehicle.model is not None:
            updates.append("model = %s")
            values.append(vehicle.model)

        if vehicle.year is not None:
            updates.append("year = %s")
            values.append(vehicle.year)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided")

        values.append(vehicle_id)

        query = f"""
            UPDATE vehicles
            SET {", ".join(updates)}
            WHERE id = %s;
        """

        cursor.execute(query, tuple(values))
        database.commit()

        return {
            "message": "Vehicle updated",
            "vehicle_id": vehicle_id
        }

    except HTTPException:
        raise

    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# See the garage
############################################################################################
@router.get("/users/{user_id}/vehicles")
def get_vehicles(user_id: int):
    cursor.execute(
        """
        SELECT id, user_id, make, model, year
        FROM vehicles
        WHERE user_id = %s; 
        """,
        (user_id,)
    )

    vehicles = cursor.fetchall()

    return {
        "user_id": user_id,
        "garage": [
            {
                "id": v[0],
                "user_id": v[1],
                "make": v[2],
                "model": v[3],
                "year": v[4]
            }
            for v in vehicles
        ]
    }