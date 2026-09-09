from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional

from database import get_db
from models.athlete import Athlete
from schemas.athlete import AthleteCreate, AthleteResponse, Token, AthleteLogin
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_athlete(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(Athlete).filter(Athlete.email == email))
    athlete = result.scalars().first()
    if athlete is None:
        raise credentials_exception
    return athlete


@router.post("/register", response_model=Token)
async def register(athlete: AthleteCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Athlete).filter(Athlete.email == athlete.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_athlete = Athlete(
        email=athlete.email,
        hashed_password=get_password_hash(athlete.password),
        full_name=athlete.full_name,
    )
    db.add(new_athlete)
    await db.commit()
    await db.refresh(new_athlete)

    access_token = create_access_token(data={"sub": new_athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(
    login_data: Optional[AthleteLogin] = None,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(lambda: None),
    db: AsyncSession = Depends(get_db),
):
    # Support both JSON payload and Form data
    email = None
    password = None

    if login_data and login_data.email:
        email = login_data.email
        password = login_data.password
    elif form_data and form_data.username:
        email = form_data.username
        password = form_data.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    result = await db.execute(select(Athlete).filter(Athlete.email == email))
    athlete = result.scalars().first()
    if not athlete or not verify_password(password, athlete.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=AthleteResponse)
async def read_users_me(current_athlete: Athlete = Depends(get_current_athlete)):
    return current_athlete
