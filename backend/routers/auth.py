from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError

from database import get_db
from models.athlete import Athlete
from schemas.athlete import AthleteCreate, AthleteResponse, Token
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_athlete(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
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
        full_name=athlete.full_name
    )
    db.add(new_athlete)
    await db.commit()
    await db.refresh(new_athlete)
    
    access_token = create_access_token(data={"sub": new_athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Athlete).filter(Athlete.email == form_data.username))
    athlete = result.scalars().first()
    if not athlete or not verify_password(form_data.password, athlete.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=AthleteResponse)
async def read_users_me(current_athlete: Athlete = Depends(get_current_athlete)):
    return current_athlete
