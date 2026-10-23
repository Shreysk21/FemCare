import os
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from passlib.hash import pbkdf2_sha256

try:
    from ..database import get_db, UserProfile, Cycle, HydrationLog
    from ..schemas import LoginRequest, SignupRequest, AuthResponse, UserProfileResponse
except (ImportError, ValueError):
    from database import get_db, UserProfile, Cycle, HydrationLog
    from schemas import LoginRequest, SignupRequest, AuthResponse, UserProfileResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "femcare-super-secret-jwt-key-2026-secure")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days session

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

def get_current_user_id(authorization: str = Header(None)) -> str:
    """Strictly extracts user_id from Authorization: Bearer <token>. Unauthenticated requests raise 401."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in."
        )
    token = authorization.split(" ")[1].strip()
    payload = decode_access_token(token)
    uid = payload.get("sub")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload."
        )
    return uid

def to_profile_response(p: UserProfile) -> UserProfileResponse:
    last_p = str(p.last_period_start_date) if getattr(p, "last_period_start_date", None) else None
    return UserProfileResponse(
        id=p.id,
        name=p.name,
        email=p.email,
        avgCycleLength=p.avg_cycle_length or 28,
        avgPeriodDuration=p.avg_period_duration or 5,
        lastPeriodStartDate=last_p,
        theme=p.theme or "light",
        textSize=p.text_size or "normal",
        privacyMode=p.privacy_mode or "discreet",
        language=getattr(p, "language", "en") or "en",
        trackPcod=bool(getattr(p, "track_pcod", False)),
        trackMigraine=bool(getattr(p, "track_migraine", False)),
        locationApproved=bool(p.location_approved),
        city=p.city or "San Francisco, CA",
        joinedDate=str(p.joined_date or datetime.utcnow().strftime("%Y-%m-%d"))
    )

@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing = db.query(UserProfile).filter(UserProfile.email.ilike(email_clean)).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists. Please sign in.")

    pw_hash = pbkdf2_sha256.hash(req.password)
    user_id = f"usr_{int(datetime.utcnow().timestamp() * 1000)}"
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    new_user = UserProfile(
        id=user_id,
        name=req.name.strip() or "FemCare User",
        email=email_clean,
        password_hash=pw_hash,
        avg_cycle_length=28,
        avg_period_duration=5,
        last_period_start_date=None,  # Brand new user starts with 0 health records
        theme="light",
        text_size="normal",
        privacy_mode="discreet",
        language="en",
        track_pcod=False,
        track_migraine=False,
        location_approved=True,
        city="San Francisco, CA",
        joined_date=today_str
    )
    db.add(new_user)
    # Zero initial records created: new users start with an empty dashboard
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    return AuthResponse(
        token=token,
        user=to_profile_response(new_user),
        message=f"Welcome to FemCare, {new_user.name}! 🌸"
    )

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    
    # Support demo login alias
    if email_clean in ("demo@femcare.com", "demo@example.com"):
        user = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    else:
        user = db.query(UserProfile).filter(UserProfile.email.ilike(email_clean)).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    is_valid = False
    if user.password_hash:
        try:
            is_valid = pbkdf2_sha256.verify(req.password, user.password_hash)
        except Exception:
            is_valid = False
    elif req.password in ("password123", "password"):
        # Initial demo account backward-compatibility
        is_valid = True
        user.password_hash = pbkdf2_sha256.hash(req.password)
        db.commit()

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.id, "email": user.email})
    return AuthResponse(
        token=token,
        user=to_profile_response(user),
        message=f"Welcome back, {user.name}! 🌸"
    )

@router.get("/me", response_model=UserProfileResponse)
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    token = authorization.split(" ")[1].strip()
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return to_profile_response(user)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
