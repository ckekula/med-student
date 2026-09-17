from enum import Enum


class Specialty(Enum):
    MEDICINE = "Medicine"
    SURGERY = "Surgery"
    PAEDIATRICS = "Paediatrics"
    GYNOBS = "GynObs"
    PSYCHIATRY = "Psychiatry"


class DifficultyLevel(Enum):
    EASY = "easy"
    MODERATE = "moderate"
    HARD = "hard"


class HistoryItemCategory(Enum):
    PC = "presenting_complaint"
    HOPC = "history_of_presenting_complaint" # rules for obs
    PMH = "past_medical_history"
    PSH = "past_surgical_history"
    MEDICATION_HISTORY = "medication_history"
    ALLERGY_HISTORY = "allergy_history"
    FAMILY_HISTORY = "family_history"
    SOCIAL_HISTORY = "social_history"

    ANTINATAL_HISTORY = "antinatal history" # paed
    BIRTH_HISTORY = "birth history" # paed
    DEVELOPMENTAL_HISTORY = "developmental history" # paed
    NUTRITION_HISTORY = "nutrition history" # paed

    VACCINATION_HISTORY = "vaccination history" # paed
    PGH = "past_gynaecological_history" # gyn/obs
    POH = "past_obstetric_history" # obs/gyn
    MENSTRUAL_HISTORY = "past_menstrual_history" # gyn/obs


class EvaluationMethod(Enum):
    STRING_MATCH = "string_match"
    LLM_JUDGE = "llm_judge"


class InvestigationCategory(Enum):
    BLOOD = "blood"
    IMAGING = "imaging"
    BEDSIDE = "bedside"
    URINE = "urine"
    OTHER = "other"


class AttemptStatus(Enum):
    IN_PROGRESS_HISTORY = "in_progress_history"
    HISTORY_COMPLETE = "history_complete"
    IN_PROGRESS_EXAMINATION = "in_progress_examination"
    EXAMINATION_COMPLETE = "examination_complete"
    SUMMARY_COMPLETE = "summary_complete"
    EVALUATED = "evaluated"


class MessageSender(Enum):
    STUDENT = "student"
    PATIENT = "patient"
