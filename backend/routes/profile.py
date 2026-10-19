from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, UserProfile
    from ..schemas import UserProfileResponse, UserProfileUpdate
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, UserProfile
    from schemas import UserProfileResponse, UserProfileUpdate
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=UserProfileResponse)
def get_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not profile:
        profile = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfileResponse(
        id=profile.id,
        name=profile.name,
        email=profile.email,
        avgCycleLength=profile.avg_cycle_length,
        avgPeriodDuration=profile.avg_period_duration,
        lastPeriodStartDate=profile.last_period_start_date,
        theme=profile.theme,
        textSize=profile.text_size,
        privacyMode=profile.privacy_mode,
        language=getattr(profile, "language", "en") or "en",
        trackPcod=bool(getattr(profile, "track_pcod", False)),
        trackMigraine=bool(getattr(profile, "track_migraine", False)),
        locationApproved=profile.location_approved,
        city=profile.city,
        joinedDate=profile.joined_date
    )

@router.put("", response_model=UserProfileResponse)
def update_profile(update_data: UserProfileUpdate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not profile:
        profile = UserProfile(id=user_id)
        db.add(profile)

    if update_data.name is not None:
        profile.name = update_data.name
    if update_data.email is not None:
        profile.email = update_data.email
    if update_data.avgCycleLength is not None:
        profile.avg_cycle_length = update_data.avgCycleLength
    if update_data.avgPeriodDuration is not None:
        profile.avg_period_duration = update_data.avgPeriodDuration
    if update_data.lastPeriodStartDate is not None:
        profile.last_period_start_date = update_data.lastPeriodStartDate
    if update_data.theme is not None:
        profile.theme = update_data.theme
    if update_data.textSize is not None:
        profile.text_size = update_data.textSize
    if update_data.privacyMode is not None:
        profile.privacy_mode = update_data.privacyMode
    if update_data.language is not None:
        profile.language = update_data.language
    if update_data.trackPcod is not None:
        profile.track_pcod = update_data.trackPcod
    if update_data.trackMigraine is not None:
        profile.track_migraine = update_data.trackMigraine
    if update_data.locationApproved is not None:
        profile.location_approved = update_data.locationApproved
    if update_data.city is not None:
        profile.city = update_data.city

    db.commit()
    db.refresh(profile)

    return UserProfileResponse(
        id=profile.id,
        name=profile.name,
        email=profile.email,
        avgCycleLength=profile.avg_cycle_length,
        avgPeriodDuration=profile.avg_period_duration,
        lastPeriodStartDate=profile.last_period_start_date,
        theme=profile.theme,
        textSize=profile.text_size,
        privacyMode=profile.privacy_mode,
        language=getattr(profile, "language", "en") or "en",
        trackPcod=bool(getattr(profile, "track_pcod", False)),
        trackMigraine=bool(getattr(profile, "track_migraine", False)),
        locationApproved=profile.location_approved,
        city=profile.city,
        joinedDate=profile.joined_date
    )

