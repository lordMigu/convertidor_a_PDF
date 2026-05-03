"""Script de comprobación de conexión a la base de datos.
Ejecutar: python scripts/check_db_connection.py
"""
import asyncio
from sqlalchemy import text
from app.db.session import engine


async def main():
    print("Probando conexión a la base de datos...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            scalar = result.scalar_one()
            print("Resultado de SELECT 1:", scalar)
    except Exception as e:
        print("Error al conectar a la base de datos:", repr(e))
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
