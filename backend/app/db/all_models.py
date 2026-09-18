"""
Central import point so Alembic's autogenerate can see every model.
"""

from app.modules.osce.long_case.models import (  # noqa: F401
    HistoryItem,
    LongCase,
    LongCaseExamination,
    LongCaseInvestigation,
    PatientProfile,
)
from app.modules.osce.long_case_attempt.models import (  # noqa: F401
    LongCaseAttempt,
    LongCaseAttemptExaminationLog,
    LongCaseAttemptHistoryResult,
    LongCaseAttemptMessage,
)
from app.modules.user.models import User  # noqa: F401
