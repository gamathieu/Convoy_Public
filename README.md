# Convoy

Full-stack convoy and group driving application built with FastAPI, PostgreSQL, and React Native.

---

# Features

- User authentication with JWT
- Password reset via email
- Create and join convoys
- Create and join drives
- Vehicle management system
- PostgreSQL relational database
- REST API architecture
- Cloud deployed backend
- React Native mobile frontend

---

# Tech Stack

## Backend
- Python
- FastAPI
- PostgreSQL
- psycopg2
- JWT Authentication
- Passlib / bcrypt
- Uvicorn

## Frontend
- React Native
- Expo

## Deployment
- Render

---

# Architecture

The backend follows a modular REST API architecture:

- `app.py` initializes the FastAPI application
- `routes/` contains separated API route modules
- `database.py` manages PostgreSQL connections
- `schemas.py` handles request validation using Pydantic
- JWT tokens are used for persistent authentication
- Password reset tokens are handled using itsdangerous

Frontend requests communicate with the deployed FastAPI backend through REST endpoints.

---

# Project Structure

```text
Convoy/
├── frontend/
├── routes/
├── app.py
├── database.py
├── schemas.py
├── utils.py
├── requirements.txt
```

---

# API Features

## Authentication
- Register user
- Login user
- Password reset flow

## Vehicles
- Add vehicle
- Edit vehicle
- Delete vehicle

## Convoys
- Create convoy
- Join convoy
- View convoy members

## Drives
- Create drive
- Join drive
- View drive information

---

# Running Locally

## Backend

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

## Frontend

```bash
npm install
npx expo start
```

---

# Environment Variables

Create a `.env` file using `.env.example`.

Example:

```env
SECRET_KEY=your_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

FRONTEND_URL=http://localhost:8081

DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

---

# Deployment

- PostgreSQL database hosted on Render
- FastAPI backend deployed on Render
- Frontend connected through Expo / React Native

---

# Live Backend

API:
https://convoy-v2.onrender.com

Swagger Documentation:
https://convoy-v2.onrender.com/docs

---

# Future Improvements

- Real-time convoy tracking
- Live location sharing
- Messaging system
- Push notifications
- Production mobile deployment

---

# Screenshots

Add screenshots of:
- Mobile application
- Login screen
- Swagger API docs
- PostgreSQL database
- Convoy creation flow

Example:

```md
![App Screenshot](screenshots/app.png)
```

---

# Author

Gabriel Mathieu