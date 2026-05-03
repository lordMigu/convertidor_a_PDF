"""
Configuración de la sesión asíncrona con SQLAlchemy y SQLite.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import get_settings

settings = get_settings()

# Crear el engine asíncrono. Soporta MySQL via aiomysql (mysql+aiomysql://...)
# No usamos check_same_thread (propio de SQLite). Se deja pool por defecto o NullPool según se necesite.
engine = create_async_engine(
    settings.database_url,
    echo=settings.db_echo,
    future=True,
    poolclass=NullPool,
)

# Crear el sessionmaker asíncrono
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    Dependencia de FastAPI que proporciona una sesión de base de datos.
    Se usa en los endpoints para acceder a la DB de forma asíncrona.
    
    Yields:
        AsyncSession: Sesión de base de datos asíncrona
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
