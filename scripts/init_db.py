"""Inicializa las tablas de la base de datos usando SQLAlchemy.
Ejecutar: python scripts/init_db.py
"""
import asyncio
from app.db.base import Base
from app.db.session import engine


async def main():
    print("Inicializando tablas en la base de datos usando:")
    print(" ", engine.url)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Tablas creadas correctamente.")
    except Exception as e:
        print("Error al crear tablas:", repr(e))
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
