from fastapi import APIRouter

from app.api.v1.endpoints import cases, chat, personas

api_router = APIRouter()
api_router.include_router(cases.router)
api_router.include_router(personas.router)
api_router.include_router(chat.router)
