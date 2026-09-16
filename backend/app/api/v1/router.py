from backend.app.api.v1.endpoints import cases, chat
from fastapi import APIRouter

from backend.app.api.v1.endpoints import personas

api_router = APIRouter()
api_router.include_router(cases.router)
api_router.include_router(personas.router)
api_router.include_router(chat.router)
