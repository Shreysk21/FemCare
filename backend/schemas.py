from typing import List, Optional, Dict, Any, Union
from datetime import date
from pydantic import BaseModel, Field

# --- User Profile Schemas ---

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avgCycleLength: Optional[int] = None
    avgPeriodDuration: Optional[int] = None
    lastPeriodStartDate: Optional[Union[str, date]] = None
    theme: Optional[str] = None
    textSize: Optional[str] = None
    privacyMode: Optional[str] = None
    language: Optional[str] = None
    trackPcod: Optional[bool] = None
    trackMigraine: Optional[bool] = None
    locationApproved: Optional[bool] = None
    city: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    avgCycleLength: int
    avgPeriodDuration: int
    lastPeriodStartDate: Union[str, date]
    theme: str
    textSize: str
    privacyMode: str
    language: str = "en"
    trackPcod: bool = False
    trackMigraine: bool = False
    locationApproved: bool
    city: Optional[str] = None
    joinedDate: Optional[Union[str, date]] = None

# --- Cycle & Flow Schemas ---

class FlowLogItem(BaseModel):
    date: Union[str, date]
    flow: str
    icon: Optional[str] = "🩸"

class CycleLogFlowRequest(BaseModel):
    startDate: str
    flow: str = "Medium"
    optionalMood: Optional[Dict[str, Any]] = None
    optionalSymptoms: Optional[List[Dict[str, Any]]] = None

class CycleResponse(BaseModel):
    id: str
    startDate: Union[str, date]
    endDate: Optional[Union[str, date]] = None
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
    date: Union[str, date]
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
    date: Union[str, date]
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
    date: Union[str, date]
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

# --- Feedback Schemas ---

class FeedbackCreateRequest(BaseModel):
    category: str = "user"  # "user" or "doctor"
    rating: int = Field(ge=1, le=5)
    usabilityFeedback: Optional[str] = ""
    problemsEncountered: Optional[str] = ""
    suggestions: Optional[str] = ""
    comments: Optional[str] = ""
    doctorSpecialty: Optional[str] = ""
    doctorClinicAffiliation: Optional[str] = ""
    clinicalPresentationFeedback: Optional[str] = ""

class FeedbackResponse(BaseModel):
    id: str
    userId: str
    category: str
    rating: int
    usabilityFeedback: Optional[str] = ""
    problemsEncountered: Optional[str] = ""
    suggestions: Optional[str] = ""
    comments: Optional[str] = ""
    doctorSpecialty: Optional[str] = ""
    doctorClinicAffiliation: Optional[str] = ""
    clinicalPresentationFeedback: Optional[str] = ""
    isVerified: bool = False
    status: str = "Submitted"
    createdAt: str

# --- Special Health Condition Schemas (PCOD/PCOS & Migraine) ---

class ConditionPrefsUpdateRequest(BaseModel):
    trackPcod: Optional[bool] = None
    trackMigraine: Optional[bool] = None

class MigraineLogCreateRequest(BaseModel):
    date: Optional[str] = None
    durationHours: Optional[int] = 2
    severity: Optional[str] = "Moderate"
    hasAura: Optional[bool] = False
    hasNausea: Optional[bool] = False
    sensitivityLight: Optional[bool] = False
    triggers: Optional[str] = ""
    medicationTaken: Optional[str] = ""
    notes: Optional[str] = ""

class MigraineLogResponse(BaseModel):
    id: str
    userId: str
    date: str
    durationHours: int
    severity: str
    hasAura: bool
    hasNausea: bool
    sensitivityLight: bool
    triggers: Optional[str] = ""
    medicationTaken: Optional[str] = ""
    notes: Optional[str] = ""
    createdAt: str

class MigraineLogUpdateRequest(BaseModel):
    date: Optional[str] = None
    durationHours: Optional[int] = None
    severity: Optional[str] = None
    hasAura: Optional[bool] = None
    hasNausea: Optional[bool] = None
    sensitivityLight: Optional[bool] = None
    triggers: Optional[str] = None
    medicationTaken: Optional[str] = None
    notes: Optional[str] = None

class PcodLogCreateRequest(BaseModel):
    date: Optional[str] = None
    severity: Optional[str] = "Moderate"
    symptoms: Optional[str] = ""
    flowPattern: Optional[str] = "Irregular"
    triggers: Optional[str] = ""
    notes: Optional[str] = ""

class PcodLogUpdateRequest(BaseModel):  
    date: Optional[str] = None
    severity: Optional[str] = None
    symptoms: Optional[str] = None
    flowPattern: Optional[str] = None
    triggers: Optional[str] = None
    notes: Optional[str] = None

class PcodLogResponse(BaseModel):
    id: str
    userId: str
    date: str
    severity: str
    symptoms: Optional[str] = ""
    flowPattern: Optional[str] = "Irregular"
    triggers: Optional[str] = ""
    notes: Optional[str] = ""
    createdAt: str

# --- Symptom-Based Prediction & Insight Schemas ---

class PhaseSymptomItem(BaseModel):
    symptomName: str
    phase: str
    count: int
    percentage: int
    message: str

class PredictionInsightsResponse(BaseModel):
    nextPeriodEstimatedDate: str
    estimatedCycleLength: int
    historicalCycleCount: int
    isSufficientData: bool
    confidenceNote: str
    recurringPhaseSymptoms: List[PhaseSymptomItem] = []
    migraineCyclePatterns: List[Dict[str, Any]] = []
    disclaimer: str
    nextEstimatedPeriodDate: Optional[str] = None
    estimatedCycleLengthDays: Optional[int] = None

# --- Smart Health Alert Schemas ---

class SmartHealthAlertItem(BaseModel):
    id: str
    level: str  # "concerning" or "urgent"
    title: str
    message: str
    recommendation: Optional[str] = ""
    patternType: str  # "worsening_pain", "persistent_symptom", "frequent_migraine", "emergency_pain", "emergency_neurological", "emergency_bleeding"
    detectedOn: str
    signature: str
    symptomName: Optional[str] = None
    frequency: Optional[int] = None
    severity: Optional[str] = None
    actions: List[str] = ["view_details", "dismiss"]

class SmartHealthAlertsResponse(BaseModel):
    hasAlert: bool
    status: str  # "insufficient_data", "normal", "concerning", "urgent"
    alert: Optional[SmartHealthAlertItem] = None
    totalLogsEvaluated: int
    dataConfidence: str
    clinicalDisclaimer: str

# --- Authentication Schemas ---

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: UserProfileResponse
    message: str = "Success"


