import os
from datetime import datetime, date
from sqlalchemy import (
    create_engine, Column, String, Integer, Boolean, Date, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

# Dual Engine: Use Supabase / PostgreSQL if DATABASE_URL provided, else fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Ensure backend directory exists for SQLite
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "femcare.db")
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Fix standard Postgres prefix if needed (e.g. postgres:// to postgresql://)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- ORM MODELS ---

class UserProfile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default="usr_101")
    name = Column(String, nullable=False, default="Shreya Patel")
    email = Column(String, nullable=False, default="shreya.patel@example.com")
    avg_cycle_length = Column(Integer, default=28)
    avg_period_duration = Column(Integer, default=5)
    last_period_start_date = Column(String, default="2026-09-17")
    theme = Column(String, default="light")
    text_size = Column(String, default="normal")
    privacy_mode = Column(String, default="discreet")
    language = Column(String, default="en")
    track_pcod = Column(Boolean, default=False)
    track_migraine = Column(Boolean, default=False)
    location_approved = Column(Boolean, default=True)
    city = Column(String, default="San Francisco, CA")
    joined_date = Column(String, default="2026-01-15")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cycles = relationship("Cycle", back_populates="user", cascade="all, delete-orphan")
    symptoms = relationship("SymptomLog", back_populates="user", cascade="all, delete-orphan")
    moods = relationship("MoodLog", back_populates="user", cascade="all, delete-orphan")
    hydration_logs = relationship("HydrationLog", back_populates="user", cascade="all, delete-orphan")
    circle_members = relationship("CircleMember", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("FeedbackSubmission", back_populates="user", cascade="all, delete-orphan")
    migraine_logs = relationship("MigraineLog", back_populates="user", cascade="all, delete-orphan")
    pcod_logs = relationship("PcodLog", back_populates="user", cascade="all, delete-orphan")


class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)
    length = Column(Integer, default=28)
    period_duration = Column(Integer, default=5)
    status = Column(String, default="current")
    phase = Column(String, default="Follicular Phase")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="cycles")
    flow_logs = relationship("CycleFlowLog", back_populates="cycle", cascade="all, delete-orphan")


class CycleFlowLog(Base):
    __tablename__ = "cycle_flow_logs"

    id = Column(String, primary_key=True)
    cycle_id = Column(String, ForeignKey("cycles.id", ondelete="CASCADE"), nullable=False)
    date = Column(String, nullable=False)
    flow = Column(String, nullable=False, default="Medium")
    icon = Column(String, default="🩸")
    created_at = Column(DateTime, default=datetime.utcnow)

    cycle = relationship("Cycle", back_populates="flow_logs")


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    date = Column(String, nullable=False)
    symptom_id = Column(String, nullable=False)
    symptom_name = Column(String, nullable=False)
    category = Column(String, default="Pain & Discomfort")
    severity = Column(String, default="Moderate")
    time_logged = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="symptoms")


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    date = Column(String, nullable=False)
    mood_id = Column(String, nullable=False)
    label = Column(String, nullable=False)
    emoji = Column(String, nullable=False)
    time = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="moods")


class HydrationLog(Base):
    __tablename__ = "hydration_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    date = Column(String, nullable=False)
    current_ml = Column(Integer, default=0)
    goal_ml = Column(Integer, default=2000)
    glasses = Column(Integer, default=0)
    target_glasses = Column(Integer, default=8)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserProfile", back_populates="hydration_logs")
    entries = relationship("HydrationEntry", back_populates="hydration_log", cascade="all, delete-orphan")


class HydrationEntry(Base):
    __tablename__ = "hydration_entries"

    id = Column(String, primary_key=True)
    hydration_log_id = Column(String, ForeignKey("hydration_logs.id", ondelete="CASCADE"), nullable=False)
    time = Column(String, nullable=False)
    amount_ml = Column(Integer, default=250)
    created_at = Column(DateTime, default=datetime.utcnow)

    hydration_log = relationship("HydrationLog", back_populates="entries")


class CircleMember(Base):
    __tablename__ = "circle_members"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Partner")
    email = Column(String, nullable=False)
    sync_code = Column(String, nullable=False)
    status = Column(String, default="Connected & Syncing")
    avatar = Column(String, default="💖")
    share_phase_and_window = Column(Boolean, default=True)
    share_emotional_state = Column(Boolean, default=True)
    share_specific_symptoms = Column(Boolean, default=False)
    share_private_notes = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="circle_members")


class FeedbackSubmission(Base):
    __tablename__ = "feedbacks"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    category = Column(String, nullable=False)  # "user" or "doctor"
    rating = Column(Integer, nullable=False)  # 1 to 5
    usability_feedback = Column(Text, nullable=True)
    problems_encountered = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)
    doctor_specialty = Column(String, nullable=True)
    doctor_clinic_affiliation = Column(String, nullable=True)
    clinical_presentation_feedback = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)  # Unverified until verified by system
    status = Column(String, default="Submitted")  # "Submitted", "Under Review", "Acknowledged"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="feedbacks")


class MigraineLog(Base):
    __tablename__ = "migraine_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    date = Column(String, nullable=False)
    duration_hours = Column(Integer, default=2)
    severity = Column(String, default="Moderate")  # "Mild", "Moderate", "Severe"
    has_aura = Column(Boolean, default=False)
    has_nausea = Column(Boolean, default=False)
    sensitivity_light = Column(Boolean, default=False)
    triggers = Column(String, nullable=True)  # Comma separated e.g. "Poor Sleep, Stress"
    medication_taken = Column(String, nullable=True)  # e.g. "Ibuprofen 400mg"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="migraine_logs")


class PcodLog(Base):
    __tablename__ = "pcod_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), default="usr_101")
    date = Column(String, nullable=False)
    severity = Column(String, default="Moderate")  # "Mild", "Moderate", "Severe"
    symptoms = Column(String, nullable=True)  # Comma-separated: "Acne, Excessive Fatigue, Pelvic Heaviness"
    flow_pattern = Column(String, nullable=True)  # "Irregular", "Delayed Flow", "Prolonged Flow", "Spotting", "Consistent"
    triggers = Column(String, nullable=True)  # Comma-separated: "Poor Sleep, High Sugar Diet, High Stress"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="pcod_logs")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    # Lightweight schema auto-migration for SQLite / PostgreSQL
    with engine.connect() as conn:
        try:
            # Check if columns exist in profiles table
            from sqlalchemy import text
            existing_cols = []
            if "sqlite" in str(engine.url):
                res = conn.execute(text("PRAGMA table_info(profiles)"))
                existing_cols = [row[1] for row in res.fetchall()]
            else:
                res = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'"
                ))
                existing_cols = [row[0] for row in res.fetchall()]

            if "language" not in existing_cols:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN language VARCHAR DEFAULT 'en'"))
            if "track_pcod" not in existing_cols:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN track_pcod BOOLEAN DEFAULT 0"))
            if "track_migraine" not in existing_cols:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN track_migraine BOOLEAN DEFAULT 0"))
            conn.commit()
        except Exception as e:
            # Table might be freshly created or already up to date
            pass
