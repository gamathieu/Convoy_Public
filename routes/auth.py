from fastapi import APIRouter, HTTPException
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from passlib.context import CryptContext
from email.message import EmailMessage
from jose import jwt
from datetime import datetime, timedelta, timezone

import os
import smtplib

from database import database, cursor
from schemas import ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
serializer = URLSafeTimedSerializer(SECRET_KEY)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg["Subject"] = "Reset your password"
    msg["From"] = os.getenv("EMAIL_USER")
    msg["To"] = to_email

    msg.set_content(f"""
You requested a password reset.

Click this link to reset your password:
{reset_link}

This link expires in 30 minutes.
""")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:

        smtp.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASSWORD"))
        smtp.send_message(msg)

# Endpoint to request a password reset link
#############################################################################################

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    try:
        cursor.execute(
            "SELECT id FROM users WHERE email = %s;",
            (request.email,)
        )

        user = cursor.fetchone()

        if user is None:
            return {"message": "If this email exists, a reset link has been sent."}

        token = serializer.dumps(request.email, salt="password-reset")

        reset_link = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"

        send_reset_email(request.email, reset_link)

        return {"message": "If this email exists, a reset link has been sent."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    

# Endpoint to reset password using the token
############################################################################################# 

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        email = serializer.loads(
            request.token,
            salt="password-reset",
            max_age=1800
        )

        hashed_password = pwd_context.hash(request.new_password)

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s
            WHERE email = %s;
            """,
            (hashed_password, email)
        )

        database.commit()

        return {"message": "Password reset successful."}

    except SignatureExpired:
        raise HTTPException(status_code=400, detail="Reset link expired.")

    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=500, detail=str(e))