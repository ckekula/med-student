from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth import get_current_user_id, require_org_admin
from app.db.session import get_db
from app.modules.user.models import User

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUserId = Annotated[str, Depends(get_current_user_id)]
AdminUser = Annotated[dict, Depends(require_org_admin)]


async def _get_user_by_clerk_id(db: AsyncSession, clerk_id: str) -> User | None:
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    return result.scalar_one_or_none()


async def get_current_db_user(user_id: CurrentUserId, db: DbSession) -> User:
    """
    Resolves the Clerk `sub` claim to the internal User row.

    Provisions a minimal row on first sight so requests that arrive before the
    `user.created` webhook don't fail. The webhook later fills in profile fields.
    """
    user = await _get_user_by_clerk_id(db, user_id)
    if user is None:
        await db.execute(
            insert(User)
            .values(clerk_id=user_id)
            .on_conflict_do_nothing(index_elements=[User.clerk_id])
        )
        await db.commit()
        user = await _get_user_by_clerk_id(db, user_id)

    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


CurrentDbUser = Annotated[User, Depends(get_current_db_user)]
