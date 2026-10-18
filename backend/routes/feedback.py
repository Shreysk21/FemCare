from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, FeedbackSubmission, UserProfile
    from ..schemas import FeedbackCreateRequest, FeedbackResponse
except (ImportError, ValueError):
    from database import get_db, FeedbackSubmission, UserProfile
    from schemas import FeedbackCreateRequest, FeedbackResponse

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.get("/my", response_model=List[FeedbackResponse])
def get_my_feedback(db: Session = Depends(get_db)):
    """Retrieve all feedback submissions submitted by the user."""
    feedbacks = db.query(FeedbackSubmission).filter(
        FeedbackSubmission.user_id == "usr_101"
    ).order_by(FeedbackSubmission.created_at.desc()).all()

    return [
        FeedbackResponse(
            id=f.id,
            userId=f.user_id,
            category=f.category,
            rating=f.rating,
            usabilityFeedback=f.usability_feedback or "",
            problemsEncountered=f.problems_encountered or "",
            suggestions=f.suggestions or "",
            comments=f.comments or "",
            doctorSpecialty=f.doctor_specialty or "",
            doctorClinicAffiliation=f.doctor_clinic_affiliation or "",
            clinicalPresentationFeedback=f.clinical_presentation_feedback or "",
            isVerified=bool(f.is_verified),
            status=f.status or "Submitted",
            createdAt=f.created_at.strftime("%Y-%m-%d %I:%M %p") if f.created_at else ""
        )
        for f in feedbacks
    ]

@router.post("", response_model=FeedbackResponse)
def submit_feedback(req: FeedbackCreateRequest, db: Session = Depends(get_db)):
    """
    Submit user or healthcare professional feedback with role validation.
    Doctor submissions are stored with is_verified=False (unverified by default)
    to prevent unauthorized clinical claims.
    """
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    clean_category = req.category.strip().lower()
    if clean_category not in ["user", "doctor"]:
        raise HTTPException(status_code=400, detail="Feedback category must be 'user' or 'doctor'")

    # Ensure profile exists
    profile = db.query(UserProfile).filter(UserProfile.id == "usr_101").first()
    if not profile:
        profile = UserProfile(id="usr_101")
        db.add(profile)
        db.flush()

    new_id = f"fb_{int(datetime.utcnow().timestamp() * 1000)}"

    feedback = FeedbackSubmission(
        id=new_id,
        user_id="usr_101",
        category=clean_category,
        rating=req.rating,
        usability_feedback=req.usabilityFeedback or "",
        problems_encountered=req.problemsEncountered or "",
        suggestions=req.suggestions or "",
        comments=req.comments or "",
        doctor_specialty=req.doctorSpecialty if clean_category == "doctor" else "",
        doctor_clinic_affiliation=req.doctorClinicAffiliation if clean_category == "doctor" else "",
        clinical_presentation_feedback=req.clinicalPresentationFeedback if clean_category == "doctor" else "",
        is_verified=False,  # Unverified until verified by medical review board
        status="Submitted",
        created_at=datetime.utcnow()
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        userId=feedback.user_id,
        category=feedback.category,
        rating=feedback.rating,
        usabilityFeedback=feedback.usability_feedback or "",
        problemsEncountered=feedback.problems_encountered or "",
        suggestions=feedback.suggestions or "",
        comments=feedback.comments or "",
        doctorSpecialty=feedback.doctor_specialty or "",
        doctorClinicAffiliation=feedback.doctor_clinic_affiliation or "",
        clinicalPresentationFeedback=feedback.clinical_presentation_feedback or "",
        isVerified=bool(feedback.is_verified),
        status=feedback.status,
        createdAt=feedback.created_at.strftime("%Y-%m-%d %I:%M %p")
    )
