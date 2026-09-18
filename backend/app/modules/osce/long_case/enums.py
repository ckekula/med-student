from enum import Enum

__all__ = [
    "DifficultyLevel",
    "GeneralHistoryItemCategory",
    "GynObsExaminationName",
    "GynObsHistoryItemCategory",
    "GynObsLongCaseCategory",
    "InvestigationName",
    "MedicineExaminationName",
    "MedicineLongCaseCategory",
    "PaedHistoryItemCategory",
    "PaediatricsExaminationName",
    "PaediatricsLongCaseCategory",
    "PsychiatryExaminationName",
    "PsychiatryLongCaseCategory",
    "Specialty",
    "SurgeryExaminationName",
    "SurgeryLongCaseCategory",
]


class Specialty(Enum):
    MEDICINE = "Medicine"
    SURGERY = "Surgery"
    PAEDIATRICS = "Paediatrics"
    GYNOBS = "GynObs"
    PSYCHIATRY = "Psychiatry"


class MedicineLongCaseCategory(Enum):
    ACUTE_FEVER = "Acute Fever"
    PROLONGED_FEVER_PUO = "Prolonged fever/ PUO"
    DIABETES_MELLITUS = "Diabetes mellitus"
    HYPERTENSION = "Hypertension"
    CHEST_PAIN = "Chest pain"
    SHORTNESS_OF_BREATH = "Shortness of breath"
    FEVER_WITH_RESPIRATORY_SYMPTOMS_RTI = "Fever with respiratory symptoms/ RTI"
    CHRONIC_COUGH_AND_HEMOPTYSIS = "Chronic cough & hemoptysis"
    SWELLING_OF_THE_BODY_EDEMA = "Swelling of the body / Edema"
    JAUNDICE = "Jaundice"
    CLCD = "CLCD"
    JOINT_PAIN = "Joint pain"
    BLEEDING_DISORDERS = "Bleeding disorders"
    CHRONIC_KIDNEY_DISEASE = "Chronic kidney disease"
    LOWER_LIMB_WEAKNESS = "Lower limb weakness"
    HEMIPARESIS = "Hemiparesis"
    CONNECTIVE_TISSUE_DISEASE = "Connective tissue disease"
    ANEMIA = "Anemia"
    STROKE = "Stroke"
    CHRONIC_DIARRHEA = "Chronic diarrhea"


class SurgeryLongCaseCategory(Enum):
    THYROID_DISORDERS = "Thyroid Disorders"
    BREAST_CARCINOMA = "Breast Carcinoma"
    UPPER_GASTROENTEROLOGY = "Upper Gastroenterology"
    HEPATOPANCREATOBILIARY = "Hepatopancreatobiliary"
    COLORECTAL = "Colorectal"
    VASCULAR = "Vascular"
    UROLOGY = "Urology"


class PsychiatryLongCaseCategory(Enum):
    DEPRESSION = "Depression"
    ANXIETY_DISORDERS = "Anxiety Disorders"
    PSYCHOSIS = "Psychosis"
    BIPOLAR_DISORDER = "Bipolar Disorder"
    SUBSTANCE_USE_DISORDERS = "Substance Use Disorders"


class PaediatricsLongCaseCategory(Enum):
    NEONATAL_DISORDERS = "Neonatal Disorders"
    INFECTIOUS_DISEASES = "Infectious Diseases"
    RESPIRATORY_DISORDERS = "Respiratory Disorders"
    GASTROINTESTINAL_DISORDERS = "Gastrointestinal Disorders"
    NEUROLOGICAL_DISORDERS = "Neurological Disorders"


class GynObsLongCaseCategory(Enum):
    OBSTETRIC_COMPLICATIONS = "Obstetric Complications"
    GYNECOLOGICAL_DISORDERS = "Gynecological Disorders"
    REPRODUCTIVE_HEALTH_ISSUES = "Reproductive Health Issues"


class MedicineExaminationName(Enum):
    GENERAL_EXAMINATION = "General Examination"
    SYSTEMIC_EXAMINATION = "Systemic Examination"


class SurgeryExaminationName(Enum):
    GENERAL_EXAMINATION = "General Examination"
    SYSTEMIC_EXAMINATION = "Systemic Examination"


class PaediatricsExaminationName(Enum):
    GENERAL_EXAMINATION = "General Examination"
    SYSTEMIC_EXAMINATION = "Systemic Examination"


class GynObsExaminationName(Enum):
    GENERAL_EXAMINATION = "General Examination"
    SYSTEMIC_EXAMINATION = "Systemic Examination"


class PsychiatryExaminationName(Enum):
    MENTAL_STATE_EXAMINATION = "Mental State Examination"
    PSYCHIATRIC_ASSESSMENT = "Psychiatric Assessment"



class DifficultyLevel(Enum):
    EASY = "easy"
    MODERATE = "moderate"
    HARD = "hard"


class GeneralHistoryItemCategory(Enum):
    PC = "presenting_complaint"
    HOPC = "history_of_presenting_complaint" # rules for obs
    PMH = "past_medical_history"
    PSH = "past_surgical_history"
    MEDICATION_HISTORY = "medication_history"
    ALLERGY_HISTORY = "allergy_history"
    FAMILY_HISTORY = "family_history"
    SOCIAL_HISTORY = "social_history"


class PaedHistoryItemCategory(Enum):
    ANTINATAL_HISTORY = "antinatal history" # paed
    BIRTH_HISTORY = "birth history" # paed
    DEVELOPMENTAL_HISTORY = "developmental history" # paed
    NUTRITION_HISTORY = "nutrition history" # paed
    VACCINATION_HISTORY = "vaccination history" # paed



class GynObsHistoryItemCategory(Enum):
    PGH = "past_gynaecological_history" # gyn/obs
    POH = "past_obstetric_history" # obs/gyn
    MENSTRUAL_HISTORY = "past_menstrual_history" # gyn/obs


class InvestigationName(Enum):
    FBC = "Full Blood Count"
    XRAY = "X Ray"
    CT = "CT Scan"
