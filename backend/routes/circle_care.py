import json
import random
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

try:
    from ..database import (
        get_db, CircleMember, UserProfile, InAppNotification,
        Cycle, CycleFlowLog, SymptomLog, MoodLog
    )
    from ..schemas import (
        CircleMemberResponse, CircleInviteRequest,
        CirclePermissionsUpdateRequest, CircleMemberPermissions,
        CircleShareRespondRequest, SharedHealthDataResponse
    )
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import (
        get_db, CircleMember, UserProfile, InAppNotification,
        Cycle, CycleFlowLog, SymptomLog, MoodLog
    )
    from schemas import (
        CircleMemberResponse, CircleInviteRequest,
        CirclePermissionsUpdateRequest, CircleMemberPermissions,
        CircleShareRespondRequest, SharedHealthDataResponse
    )
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/circle-care", tags=["CircleCare"])

def _format_member(m: CircleMember) -> CircleMemberResponse:
    # Normalize legacy status "Connected & Syncing" to "accepted" for display
    status = m.status
    if status == "Connected & Syncing":
        status = "accepted"

    return CircleMemberResponse(
        id=m.id,
        userId=m.user_id,
        recipientId=m.recipient_id,
        name=m.name,
        role=m.role,
        email=m.email,
        syncCode=m.sync_code,
        status=status,
        avatar=m.avatar or "💖",
        permissions=CircleMemberPermissions(
            phaseAndWindow=bool(m.share_phase_and_window),
            emotionalState=bool(m.share_emotional_state),
            specificSymptoms=bool(m.share_specific_symptoms),
            privateNotes=bool(m.share_private_notes)
        ),
        createdAt=m.created_at.isoformat() if m.created_at else None
    )

@router.get("", response_model=List[CircleMemberResponse])
def get_circle_members(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """
    Get all circle members / sharing invites sent by the current user.
    """
    members = db.query(CircleMember).filter(CircleMember.user_id == user_id).order_by(CircleMember.created_at.desc()).all()
    return [_format_member(m) for m in members]

@router.post("/invite", response_model=CircleMemberResponse)
def invite_circle_member(
    req: CircleInviteRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Share health data with a partner or sisterhood member by verified email.
    Verifies that recipient exists as a registered FemCare account before creating request.
    """
    email_clean = (req.email or "").strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    # 1. Fetch Sender
    sender = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="User profile not found.")

    # 2. Check if recipient exists in registered FemCare accounts
    recipient = db.query(UserProfile).filter(func.lower(UserProfile.email) == email_clean).first()
    if not recipient:
        raise HTTPException(
            status_code=400,
            detail=f"No registered FemCare account found for '{email_clean}'. Please ask your partner/sister to sign up for FemCare first."
        )

    # 3. Disallow self-sharing
    if recipient.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot send a sharing request to yourself.")

    perms = req.permissions or CircleMemberPermissions()
    avatar = "💖" if req.role == "Partner" else "🏡" if req.role == "Parent" else "🌸" if req.role == "Friend" else "🤝"

    # 4. Check for existing request between sender and recipient
    existing = db.query(CircleMember).filter(
        CircleMember.user_id == user_id,
        CircleMember.recipient_id == recipient.id
    ).first()

    if existing:
        # Re-activate / update existing invite to pending
        existing.status = "pending"
        existing.name = req.name or recipient.name
        existing.role = req.role or "Partner"
        existing.email = recipient.email
        existing.share_phase_and_window = perms.phaseAndWindow
        existing.share_emotional_state = perms.emotionalState
        existing.share_specific_symptoms = perms.specificSymptoms
        existing.share_private_notes = perms.privateNotes
        existing.updated_at = datetime.utcnow()
        member = existing
    else:
        code_digits = random.randint(1000, 9999)
        sync_code = f"FEM-{code_digits}"
        new_id = f"mem_{int(datetime.utcnow().timestamp() * 1000)}"

        member = CircleMember(
            id=new_id,
            user_id=user_id,
            recipient_id=recipient.id,
            name=req.name or recipient.name or "Partner",
            role=req.role or "Partner",
            email=recipient.email,
            sync_code=sync_code,
            status="pending",
            avatar=avatar,
            share_phase_and_window=perms.phaseAndWindow,
            share_emotional_state=perms.emotionalState,
            share_specific_symptoms=perms.specificSymptoms,
            share_private_notes=perms.privateNotes
        )
        db.add(member)

    db.flush()

    # 5. Create in-app notification for the recipient
    notif_id = f"notif_{int(datetime.utcnow().timestamp() * 1000)}_{random.randint(100, 999)}"
    notif_payload = {
        "shareId": member.id,
        "senderId": sender.id,
        "senderName": sender.name,
        "senderEmail": sender.email,
        "role": member.role,
        "permissions": {
            "phaseAndWindow": member.share_phase_and_window,
            "emotionalState": member.share_emotional_state,
            "specificSymptoms": member.share_specific_symptoms,
            "privateNotes": member.share_private_notes
        }
    }

    notification = InAppNotification(
        id=notif_id,
        user_id=recipient.id,
        sender_id=sender.id,
        type="partner_share_request",
        title=f"Partner Care Request from {sender.name}",
        message=f"{sender.name} ({sender.email}) invited you to sync and view their shared health insights as their {member.role}.",
        reference_id=member.id,
        status="unread",
        data=json.dumps(notif_payload)
    )
    db.add(notification)

    db.commit()
    db.refresh(member)
    return _format_member(member)

@router.post("/{member_id}/respond", response_model=CircleMemberResponse)
def respond_to_share_request(
    member_id: str,
    req: CircleShareRespondRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Recipient accepts or declines an incoming health sharing request.
    """
    action = (req.action or "").strip().lower()
    if action not in ["accept", "decline"]:
        raise HTTPException(status_code=400, detail="Action must be either 'accept' or 'decline'.")

    # Member record where current_user is recipient
    member = db.query(CircleMember).filter(
        CircleMember.id == member_id,
        CircleMember.recipient_id == user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Sharing request not found or unauthorized.")

    recipient = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    recipient_name = recipient.name if recipient else "Partner"

    if action == "accept":
        member.status = "accepted"
        notif_title = f"{recipient_name} accepted your Circle Care invite"
        notif_msg = f"{recipient_name} accepted your invitation to sync health insights."
    else:
        member.status = "declined"
        notif_title = f"{recipient_name} declined your Circle Care invite"
        notif_msg = f"{recipient_name} declined your health sharing request."

    member.updated_at = datetime.utcnow()

    # Mark recipient's notification as read
    inbound_notifs = db.query(InAppNotification).filter(
        InAppNotification.user_id == user_id,
        InAppNotification.reference_id == member_id
    ).all()
    for n in inbound_notifs:
        n.status = "read"

    # Send response notification back to Sender
    sender_notif = InAppNotification(
        id=f"notif_{int(datetime.utcnow().timestamp() * 1000)}_{random.randint(100, 999)}",
        user_id=member.user_id,
        sender_id=user_id,
        type="share_response",
        title=notif_title,
        message=notif_msg,
        reference_id=member.id,
        status="unread",
        data=json.dumps({"action": action, "recipientId": user_id, "recipientName": recipient_name})
    )
    db.add(sender_notif)

    db.commit()
    db.refresh(member)
    return _format_member(member)

@router.post("/{member_id}/revoke", response_model=CircleMemberResponse)
def revoke_share_access(
    member_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Sender revokes sharing permissions. Shared data is immediately cut off.
    """
    member = db.query(CircleMember).filter(
        CircleMember.id == member_id,
        CircleMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Sharing record not found or unauthorized.")

    member.status = "revoked"
    member.updated_at = datetime.utcnow()

    # If recipient is registered, notify them of revocation
    if member.recipient_id:
        sender = db.query(UserProfile).filter(UserProfile.id == user_id).first()
        sender_name = sender.name if sender else "Member"

        revocation_notif = InAppNotification(
            id=f"notif_{int(datetime.utcnow().timestamp() * 1000)}_{random.randint(100, 999)}",
            user_id=member.recipient_id,
            sender_id=user_id,
            type="share_revoked",
            title="Shared Health Access Revoked",
            message=f"{sender_name} has revoked shared health access.",
            reference_id=member.id,
            status="unread",
            data=json.dumps({"shareId": member.id, "senderId": user_id})
        )
        db.add(revocation_notif)

    db.commit()
    db.refresh(member)
    return _format_member(member)

@router.get("/shared-with-me", response_model=List[SharedHealthDataResponse])
def get_shared_with_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Fetch authorized health data shared with current user by partners/sisterhood members.
    Enforces strict user-level data isolation:
    - Only returns records with status == 'accepted'.
    - Returns ONLY specifically permitted data fields.
    """
    active_shares = db.query(CircleMember).filter(
        CircleMember.recipient_id == user_id,
        CircleMember.status.in_(["accepted", "Connected & Syncing"])
    ).all()

    results: List[SharedHealthDataResponse] = []

    for share in active_shares:
        sender = db.query(UserProfile).filter(UserProfile.id == share.user_id).first()
        if not sender:
            continue

        perms = CircleMemberPermissions(
            phaseAndWindow=bool(share.share_phase_and_window),
            emotionalState=bool(share.share_emotional_state),
            specificSymptoms=bool(share.share_specific_symptoms),
            privateNotes=bool(share.share_private_notes)
        )

        phase_data = None
        actions_list = []

        # 1. Menstrual Phase & Next Period Window (if permitted)
        if perms.phaseAndWindow:
            avg_cycle = sender.avg_cycle_length or 28
            # Compute current cycle day
            last_date = sender.last_period_start_date
            if isinstance(last_date, str):
                try:
                    last_date = datetime.strptime(last_date.split("T")[0], "%Y-%m-%d").date()
                except Exception:
                    last_date = date.today()
            elif isinstance(last_date, datetime):
                last_date = last_date.date()
            elif not last_date:
                last_date = date.today()

            days_diff = (date.today() - last_date).days
            cycle_day = (days_diff % avg_cycle) + 1 if avg_cycle > 0 else 1

            if cycle_day <= 5:
                phase_name = "Menstrual Phase"
                phase_desc = "Menstrual flow active. Energy levels may be lower, rest encouraged."
                phase_badge = "🩸 Menstruation"
            elif cycle_day <= 13:
                phase_name = "Follicular Phase"
                phase_desc = "Estrogen rising. Energy, mental clarity and optimism increasing."
                phase_badge = "🌱 Follicular"
            elif cycle_day <= 17:
                phase_name = "Ovulatory Phase"
                phase_desc = "Peak energy and social vitality during fertility window."
                phase_badge = "✨ Ovulation"
            else:
                phase_name = "Luteal Phase"
                phase_desc = "Progesterone dominant. Calmer pace and extra comfort beneficial."
                phase_badge = "🌙 Luteal"

            next_period_start = last_date + timedelta(days=avg_cycle * ((days_diff // avg_cycle) + 1))
            next_period_window = f"{next_period_start.strftime('%b %d')} – {(next_period_start + timedelta(days=4)).strftime('%b %d')}"

            phase_data = {
                "cycleDay": cycle_day,
                "totalDays": avg_cycle,
                "phaseName": phase_name,
                "phaseDescription": phase_desc,
                "phaseBadge": phase_badge,
                "nextPeriodWindow": next_period_window
            }

            # Empathetic partner action suggestions
            if cycle_day <= 5 or cycle_day >= 21:
                actions_list = [
                    {"icon": "🫖", "title": "Warm Tea or Heat Pad", "desc": "Offer a soothing warm beverage or heating pad without waiting to be asked."},
                    {"icon": "🛋️", "title": "Encourage Low-Key Evening", "desc": "Support quiet downtime, as natural progesterone shifts increase physical fatigue."},
                    {"icon": "🍲", "title": "Handle Dinner or Meal Prep", "desc": "Nutritious warm soup or comfort food reduces domestic pressure today."}
                ]
            else:
                actions_list = [
                    {"icon": "🌸", "title": "Affirmation & Connection", "desc": "Great time for engaging walks, date nights, or supportive conversations."},
                    {"icon": "💧", "title": "Hydration Reminder", "desc": "Keep a water bottle handy and support healthy daily routines."}
                ]

        # 2. Emotional State / Mood (if permitted)
        emotional_data = None
        if perms.emotionalState:
            latest_mood = db.query(MoodLog).filter(
                MoodLog.user_id == sender.id
            ).order_by(MoodLog.date.desc(), MoodLog.created_at.desc()).first()

            if latest_mood:
                note_to_show = latest_mood.note if perms.privateNotes else None
                emotional_data = {
                    "label": latest_mood.label,
                    "emoji": latest_mood.emoji,
                    "time": latest_mood.time,
                    "date": str(latest_mood.date),
                    "note": note_to_show
                }
            else:
                emotional_data = {
                    "label": "Peaceful & Calibrated",
                    "emoji": "🌸",
                    "time": "Today",
                    "date": str(date.today()),
                    "note": None
                }

        # 3. Specific Symptoms (if permitted)
        recent_symptoms = None
        if perms.specificSymptoms:
            cutoff = date.today() - timedelta(days=7)
            symptoms = db.query(SymptomLog).filter(
                SymptomLog.user_id == sender.id,
                SymptomLog.date >= cutoff
            ).order_by(SymptomLog.date.desc()).limit(10).all()

            recent_symptoms = []
            for s in symptoms:
                recent_symptoms.append({
                    "symptomName": s.symptom_name,
                    "category": s.category,
                    "severity": s.severity,
                    "date": str(s.date),
                    "notes": s.notes if perms.privateNotes else None
                })

        # 4. Private Notes (strictly isolated)
        private_notes_list = None
        if perms.privateNotes:
            private_notes_list = []
            if emotional_data and emotional_data.get("note"):
                private_notes_list.append(emotional_data["note"])

        results.append(SharedHealthDataResponse(
            shareId=share.id,
            senderId=sender.id,
            senderName=sender.name,
            senderEmail=sender.email,
            role=share.role,
            status=share.status,
            permissions=perms,
            currentPhase=phase_data,
            emotionalState=emotional_data,
            recentSymptoms=recent_symptoms,
            privateNotes=private_notes_list,
            recommendedPartnerActions=actions_list
        ))

    return results

@router.patch("/{member_id}/permissions", response_model=CircleMemberResponse)
def update_member_permissions(
    member_id: str,
    req: CirclePermissionsUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update granular sharing permissions for a circle member.
    """
    member = db.query(CircleMember).filter(
        CircleMember.id == member_id,
        CircleMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Circle member not found or unauthorized.")

    perms = req.permissions
    member.share_phase_and_window = perms.phaseAndWindow
    member.share_emotional_state = perms.emotionalState
    member.share_specific_symptoms = perms.specificSymptoms
    member.share_private_notes = perms.privateNotes
    member.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(member)
    return _format_member(member)

@router.delete("/{member_id}")
def delete_circle_member(
    member_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Remove member from Circle Care (accessible by sender or recipient).
    """
    member = db.query(CircleMember).filter(
        CircleMember.id == member_id,
        ((CircleMember.user_id == user_id) | (CircleMember.recipient_id == user_id))
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Circle member not found or unauthorized.")

    db.delete(member)
    db.commit()
    return {"message": "Circle member removed successfully", "id": member_id}
