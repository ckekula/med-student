from fastapi import APIRouter

from app.modules.osce.long_case.router import router as long_case_router
from app.modules.osce.long_case_attempt.router import router as long_case_attempt_router

router = APIRouter()
router.include_router(long_case_router)
router.include_router(long_case_attempt_router)
