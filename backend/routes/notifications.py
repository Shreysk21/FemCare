import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from ..database import get_db, InAppNotification, UserProfile
    from ..schemas import InAppNotificationResponse
    from .auth import get_current_user_id
except (ImportError, ValueError):
    from database import get_db, InAppNotification, UserProfile
    from schemas import InAppNotificationResponse
    from routes.auth import get_current_user_id

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

def _format_notification(n: InAppNotification, db: Session) -> InAppNotificationResponse:
    sender_name = None
    sender_email = None
    if n.sender_id:
        sender = db.query(UserProfile).filter(UserProfile.id == n.sender_id).first()
        if sender:
            sender_name = sender.name
            sender_email = sender.email

    data_dict = None
    if n.data:
        try:
            data_dict = json.loads(n.data)
        except Exception:
            data_dict = {}

    return InAppNotificationResponse(
        id=n.id,
        userId=n.user_id,
        senderId=n.sender_id,
        senderName=sender_name,
        senderEmail=sender_email,
        type=n.type,
        title=n.title,
        message=n.message,
        referenceId=n.reference_id,
        status=n.status,
        data=data_dict,
        createdAt=n.created_at.isoformat() if n.created_at else ""
    )

@router.get("", response_model=List[InAppNotificationResponse])
def get_user_notifications(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get in-app notifications for current user (e.g. partner sharing invites, acceptances, alerts).
    """
    notifs = db.query(InAppNotification).filter(
        InAppNotification.user_id == user_id
    ).order_by(InAppNotification.created_at.desc()).all()

    return [_format_notification(n, db) for n in notifs]

@router.patch("/{notification_id}/read", response_model=InAppNotificationResponse)
def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Mark an in-app notification as read.
    """
    notif = db.query(InAppNotification).filter(
        InAppNotification.id == notification_id,
        InAppNotification.user_id == user_id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notif.status = "read"
    db.commit()
    db.refresh(notif)
    return _format_notification(notif, db)

@router.post("/read-all")
def mark_all_notifications_read(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications for current user as read.
    """
    db.query(InAppNotification).filter(
        InAppNotification.user_id == user_id,
        InAppNotification.status == "unread"
    ).update({"status": "read"})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Dismiss or delete an in-app notification.
    """
    notif = db.query(InAppNotification).filter(
        InAppNotification.id == notification_id,
        InAppNotification.user_id == user_id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted successfully", "id": notification_id}
