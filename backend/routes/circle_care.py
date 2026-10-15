import random
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db, CircleMember
    from ..schemas import (
        CircleMemberResponse, CircleInviteRequest,
        CirclePermissionsUpdateRequest, CircleMemberPermissions
    )
except (ImportError, ValueError):
    from database import get_db, CircleMember
    from schemas import (
        CircleMemberResponse, CircleInviteRequest,
        CirclePermissionsUpdateRequest, CircleMemberPermissions
    )

router = APIRouter(prefix="/api/circle-care", tags=["CircleCare"])

@router.get("", response_model=List[CircleMemberResponse])
def get_circle_members(db: Session = Depends(get_db)):
    members = db.query(CircleMember).filter(CircleMember.user_id == "usr_101").order_by(CircleMember.created_at.desc()).all()
    return [
        CircleMemberResponse(
            id=m.id,
            name=m.name,
            role=m.role,
            email=m.email,
            syncCode=m.sync_code,
            status=m.status,
            avatar=m.avatar,
            permissions=CircleMemberPermissions(
                phaseAndWindow=m.share_phase_and_window,
                emotionalState=m.share_emotional_state,
                specificSymptoms=m.share_specific_symptoms,
                privateNotes=m.share_private_notes
            )
        )
        for m in members
    ]

@router.post("/invite", response_model=CircleMemberResponse)
def invite_circle_member(req: CircleInviteRequest, db: Session = Depends(get_db)):
    code_digits = random.randint(1000, 9999)
    sync_code = f"FEM-{code_digits}"
    new_id = f"mem_{int(datetime.utcnow().timestamp() * 1000)}"

    avatar = "💖" if req.role == "Partner" else "🏡" if req.role == "Parent" else "🌸" if req.role == "Friend" else "🤝"

    perms = req.permissions or CircleMemberPermissions()

    member = CircleMember(
        id=new_id,
        user_id="usr_101",
        name=req.name or "Circle Member",
        role=req.role or "Partner",
        email=req.email or "partner@example.com",
        sync_code=sync_code,
        status="Connected & Syncing",
        avatar=avatar,
        share_phase_and_window=perms.phaseAndWindow,
        share_emotional_state=perms.emotionalState,
        share_specific_symptoms=perms.specificSymptoms,
        share_private_notes=perms.privateNotes
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return CircleMemberResponse(
        id=member.id,
        name=member.name,
        role=member.role,
        email=member.email,
        syncCode=member.sync_code,
        status=member.status,
        avatar=member.avatar,
        permissions=CircleMemberPermissions(
            phaseAndWindow=member.share_phase_and_window,
            emotionalState=member.share_emotional_state,
            specificSymptoms=member.share_specific_symptoms,
            privateNotes=member.share_private_notes
        )
    )

@router.patch("/{member_id}/permissions", response_model=CircleMemberResponse)
def update_member_permissions(
    member_id: str,
    req: CirclePermissionsUpdateRequest,
    db: Session = Depends(get_db)
):
    member = db.query(CircleMember).filter(CircleMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Circle member not found")

    perms = req.permissions
    member.share_phase_and_window = perms.phaseAndWindow
    member.share_emotional_state = perms.emotionalState
    member.share_specific_symptoms = perms.specificSymptoms
    member.share_private_notes = perms.privateNotes

    db.commit()
    db.refresh(member)

    return CircleMemberResponse(
        id=member.id,
        name=member.name,
        role=member.role,
        email=member.email,
        syncCode=member.sync_code,
        status=member.status,
        avatar=member.avatar,
        permissions=CircleMemberPermissions(
            phaseAndWindow=member.share_phase_and_window,
            emotionalState=member.share_emotional_state,
            specificSymptoms=member.share_specific_symptoms,
            privateNotes=member.share_private_notes
        )
    )

@router.delete("/{member_id}")
def delete_circle_member(member_id: str, db: Session = Depends(get_db)):
    member = db.query(CircleMember).filter(CircleMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Circle member not found")

    db.delete(member)
    db.commit()
    return {"message": "Circle member removed successfully", "id": member_id}
