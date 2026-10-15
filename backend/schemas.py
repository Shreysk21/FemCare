from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- User Profile Schemas ---

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avgCycleLength: Optional[int] = None
    avgPeriodDuration: Optional[int] = None
    lastPeriodStartDate: Optional[str] = None
    theme: Optional[str] = None
    textSize: Optional[str] = None
    privacyMode: Optional[str] = None
    locationApproved: Optional[bool] = None
    city: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    avgCycleLength: int
    avgPeriodDuration: int
    lastPeriodStartDate: str
    theme: str
    textSize: str
    privacyMode: str
    locationApproved: bool
    city: Optional[str] = None
    joinedDate: Optional[str] = None

# --- Cycle & Flow Schemas ---

class FlowLogItem(BaseModel):
    date: str
    flow: str
    icon: Optional[str] = "🩸"

class CycleLogFlowRequest(BaseModel):
    startDate: str
    flow: str = "Medium"
    optionalMood: Optional[Dict[str, Any]] = None
    optionalSymptoms: Optional[List[Dict[str, Any]]] = None

class CycleResponse(BaseModel):
    id: str
    startDate: str
    endDate: Optional[str] = None
    length: int
    periodDuration: int
    status: str
    phase: str
    notes: Optional[str] = None
    flowLogs: List[FlowLogItem] = []

# --- Symptom Schemas ---

class SymptomCreateRequest(BaseModel):
    symptomName: str
    category: Optional[str] = "Pain & Discomfort"
    severity: Optional[str] = "Moderate"
    notes: Optional[str] = ""

class SymptomUpdateRequest(BaseModel):
    severity: str
    notes: Optional[str] = ""

class SymptomResponse(BaseModel):
    id: str
    date: str
    symptomId: str
    symptomName: str
    category: str
    severity: str
    timeLogged: str
    notes: Optional[str] = ""

# --- Mood Schemas ---

class MoodCreateRequest(BaseModel):
    moodObj: Dict[str, Any]
    note: Optional[str] = ""

class MoodResponse(BaseModel):
    id: str
    date: str
    moodId: str
    label: str
    emoji: str
    time: str
    note: Optional[str] = ""

# --- Hydration Schemas ---

class HydrationHistoryItem(BaseModel):
    time: str
    amountMl: int

class HydrationResponse(BaseModel):
    date: str
    currentMl: int
    goalMl: int
    glasses: int
    targetGlasses: int
    history: List[HydrationHistoryItem] = []

class HydrationAddRequest(BaseModel):
    mlAmount: int = 250

# --- Circle Care Schemas ---

class CircleMemberPermissions(BaseModel):
    phaseAndWindow: bool = True
    emotionalState: bool = True
    specificSymptoms: bool = False
    privateNotes: bool = False

class CircleInviteRequest(BaseModel):
    name: str
    role: str = "Partner"
    email: str
    permissions: Optional[CircleMemberPermissions] = None

class CirclePermissionsUpdateRequest(BaseModel):
    permissions: CircleMemberPermissions

class CircleMemberResponse(BaseModel):
    id: str
    name: str
    role: str
    email: str
    syncCode: str
    status: str
    avatar: str
    permissions: CircleMemberPermissions
