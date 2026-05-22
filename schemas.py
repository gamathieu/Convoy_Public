# Module used to verify incoming request data for the API endpoints.
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# Schemas define the structure of the data that is expected in the API requests.
# Those need to be imported by each routes when needed. 
# Used to clean the program.  

# USERS
############################################################################################

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    starting_location: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    starting_location: Optional[str] = None


class LoginRequest(BaseModel): 
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# VEHICLES
############################################################################################

class VehicleCreate(BaseModel):
    make: str
    model: str
    year: int = Field(..., ge=1000, le=9999)


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=1000, le=9999)


# CONVOYS
############################################################################################

class ConvoyCreate(BaseModel):
    leader_id: int
    name: str


class JoinConvoy(BaseModel):
    user_id: int


class LeaveConvoy(BaseModel):
    user_id: int


class TransferConvoyLead(BaseModel):
    current_leader_id: int
    new_leader_id: int


# DRIVES
############################################################################################

class DriveCreate(BaseModel):
    name: str
    starting_location: str
    destination: str
    date_time: str
    creator_id: int


class DriveJoin(BaseModel):
    user_id: int