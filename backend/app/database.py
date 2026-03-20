"""Engine de base de datos, sesiones async, y routing multi-tenant."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and not settings.is_production,
    pool_size=20,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """Dependencia FastAPI: sesión de BD sin tenant (schema public)."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_tenant_db(schema_name: str) -> AsyncSession:
    """Sesión de BD con search_path seteado al schema del tenant."""
    async with AsyncSessionLocal() as session:
        await session.execute(text(f"SET search_path TO {schema_name}, public"))
        try:
            yield session
        finally:
            await session.close()
