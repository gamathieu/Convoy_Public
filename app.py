from fastapi import FastAPI

# After each request, roll back the DB transaction on this worker thread so the next
# request does not inherit a half-finished transaction (see database.reset_connection_state).
from database import reset_connection_state

# Go get router from users and rename user_router
# The routers are actually created in each routes. 
from routes.users import router as users_router
from routes.vehicles import router as vehicles_router
from routes.convoys import router as convoys_router
from routes.drives import router as drives_router
from routes.auth import router as auth_router


# Create FastAPI app
# This is what makes this file the MASTER FILE.
app = FastAPI()


# Middleware runs around every HTTP request — we use it only for DB cleanup, not auth.
@app.middleware("http")
async def db_request_cleanup(request, call_next):
    try:
        return await call_next(request)
    finally:
        reset_connection_state()


# Include the routers to each routes.
app.include_router(users_router)
app.include_router(vehicles_router)
app.include_router(convoys_router)
app.include_router(drives_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "Convoy API is running"}



# Every python file has a __name__ variable that is set to "__main__" when the file is run directly.
# By running directly, it means that we are running this file (app.py) and not importing it from another file.
# From there we import our uvicorn server and run it. 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)