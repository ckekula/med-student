from enum import Enum

__all__ = [
    "DifficultyLevel",
    "ExaminationName",
    "HistoryItemCategory",
    "InvestigationName",
    "LongCaseCategory",
    "Sex",
    "Specialty",
]


class Specialty(Enum):
    MEDICINE = "medicine"
    SURGERY = "surgery"
    PAEDIATRICS = "paediatrics"
    GYNOBS = "gynobs"
    PSYCHIATRY = "psychiatry"


class LongCaseCategory(Enum):
    # medicine
    ACUTE_FEVER = "acute_fever"
    PROLONGED_FEVER_PUO = "prolonged_fever_PUO"
    DIABETES_MELLITUS = "diabetes_mellitus"
    HYPERTENSION = "hypertension"
    CHEST_PAIN = "chest_pain"
    SHORTNESS_OF_BREATH = "shortness_of_breath"
    FEVER_WITH_RESPIRATORY_SYMPTOMS_RTI = "fever_with_respiratory_symptoms_RTI"
    CHRONIC_COUGH_AND_HEMOPTYSIS = "chronic_cough_and_hemoptysis"
    SWELLING_OF_THE_BODY_EDEMA = "swelling_of_the_body_edema"
    JAUNDICE = "jaundice"
    CLCD = "CLCD"
    JOINT_PAIN = "joint_pain"
    BLEEDING_DISORDERS = "bleeding_disorders"
    CHRONIC_KIDNEY_DISEASE = "chronic_kidney_disease"
    LOWER_LIMB_WEAKNESS = "lower_limb_weakness"
    HEMIPARESIS = "hemiparesis"
    CONNECTIVE_TISSUE_DISEASE = "connective_tissue_disease"
    ANEMIA = "anemia"
    STROKE = "stroke"
    CHRONIC_DIARRHEA = "chronic_diarrhea"
    # Surgery
    THYROID_DISORDERS = "thyroid_disorders"
    BREAST_CARCINOMA = "breast_carcinoma"
    UPPER_GASTROENTEROLOGY = "upper_gastroenterology"
    HEPATOPANCREATOBILIARY = "hepatopancreatobiliary"
    COLORECTAL = "colorectal"
    VASCULAR = "vascular"
    UROLOGY = "urology"
    # Psychiatry
    DEPRESSION = "depression"
    ANXIETY_DISORDERS = "anxiety_disorders"
    PSYCHOSIS = "psychosis"
    BIPOLAR_DISORDER = "bipolar_disorder"
    SUBSTANCE_USE_DISORDERS = "substance_use_disorders"
    # Paediatrics
    NEONATAL_DISORDERS = "neonatal_disorders"
    INFECTIOUS_DISEASES = "infectious_diseases"
    RESPIRATORY_DISORDERS = "respiratory_disorders"
    GASTROINTESTINAL_DISORDERS = "gastrointestinal_disorders"
    NEUROLOGICAL_DISORDERS = "neurological_disorders"
    # GynObs
    OBSTETRIC_COMPLICATIONS = "obstetric_complications"
    GYNECOLOGICAL_DISORDERS = "gynecological_disorders"
    REPRODUCTIVE_HEALTH_ISSUES = "reproductive_health_issues"


class ExaminationName(Enum):
    GENERAL_EXAMINATION = "general_examination"
    SYSTEMIC_EXAMINATION = "systemic_examination"


class DifficultyLevel(Enum):
    FINAL_MBBS = "final_mbbs"
    PG = "post_graduate"


class HistoryItemCategory(Enum):
    PC = "presenting_complaint"
    HOPC = "history_of_presenting_complaint" # rules for obs
    PMH = "past_medical_history"
    PSH = "past_surgical_history"
    MEDICATION_HISTORY = "medication_history"
    ALLERGY_HISTORY = "allergy_history"
    FAMILY_HISTORY = "family_history"
    SOCIAL_HISTORY = "social_history"
    # paediatrics
    ANTINATAL_HISTORY = "antinatal_history" # paed
    BIRTH_HISTORY = "birth_history" # paed
    DEVELOPMENTAL_HISTORY = "developmental_history" # paed
    NUTRITION_HISTORY = "nutrition_history" # paed
    VACCINATION_HISTORY = "vaccination_history" # paed
    # gyn/obs
    PGH = "past_gynaecological_history" # gyn/obs
    POH = "past_obstetric_history" # obs/gyn
    MENSTRUAL_HISTORY = "past_menstrual_history" # gyn/obs


class InvestigationName(Enum):
    FBC = "full_blood_count"
    XRAY = "x_ray"
    CT = "ct_scan"

class Sex(Enum):
    MALE = "male"
    FEMALE = "female"
