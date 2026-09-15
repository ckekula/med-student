from typing import Annotated

from app.auth import get_current_user_id
from app.db.session import get_db
from app.redis.client import get_redis
from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

DbSession = Annotated[AsyncSession, Depends(get_db)]
RedisClient = Annotated[Redis, Depends(get_redis)]
CurrentUserId = Annotated[str, Depends(get_current_user_id)]
