# import uuid
# from decimal import Decimal
# from typing import TYPE_CHECKING

# from app.db.base import Base
# from app.modules.osce.long_case.enums import *
# from sqlalchemy import (
#     ARRAY,
#     Boolean,
#     CheckConstraint,
#     Enum,
#     Float,
#     ForeignKey,
#     Numeric,
#     String,
#     Text,
#     UniqueConstraint,
# )
# from sqlalchemy.orm import Mapped, mapped_column, relationship

# if TYPE_CHECKING:
#     # Only needed for the type checker. Otherwise causes circular import
#     from app.modules.osce.long_case_attempt.models import LongCaseAttempt


# class LongCase(Base):
#     __tablename__ = "short_cases"

#     title: Mapped[str] = mapped_column(String(255), nullable=False)
#     specialty: Mapped[Specialty] = mapped_column(Enum(Specialty), nullable=False, index=True)
#     category: Mapped[ShortCaseCategory] = mapped_column(Enum(ShortCaseCategory), nullable=False)
#     difficulty: Mapped[DifficultyLevel] = mapped_column(Enum(DifficultyLevel), nullable=False)
#     description: Mapped[str | None] = mapped_column(Text)
    
#     patient_age: Mapped[int] = mapped_column(Integer, nullable=False)
#     patient_sex: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)
