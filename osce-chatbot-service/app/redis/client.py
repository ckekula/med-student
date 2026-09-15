from redis.asyncio import ConnectionPool, Redis

from app.config import get_settings

settings = get_settings()

_pool = ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)


def get_redis() -> Redis:
    """FastAPI dependency returning a Redis client bound to the shared pool."""
    return Redis(connection_pool=_pool)
