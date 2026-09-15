from functools import lru_cache

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient, PyJWTError

from app.config import get_settings

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)
bearer_credentials = Depends(bearer_scheme)

@lru_cache
def _jwks_client() -> PyJWKClient:
    if not settings.CLERK_JWKS_URL:
        raise RuntimeError("CLERK_JWKS_URL is not configured")
    return PyJWKClient(settings.CLERK_JWKS_URL)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = bearer_credentials,
) -> str:
    """Verifies the Clerk-issued JWT sent by the frontend and returns the Clerk user id (`sub`).

    Set AUTH_ENABLED=false in local/.env to bypass this during early development.
    """
    if not settings.AUTH_ENABLED:
        return "dev-user"

    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    token = credentials.credentials
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER or None,
            audience=settings.CLERK_AUDIENCE,
            options={"verify_aud": settings.CLERK_AUDIENCE is not None},
        )
    except (PyJWTError, httpx.HTTPError) as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {exc}") from exc

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token missing 'sub' claim")
    return sub
