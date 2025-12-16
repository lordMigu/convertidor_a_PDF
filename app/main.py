"""
Punto de entrada principal de la aplicación FastAPI.
Inicializa la app, configura rutas y base de datos.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.session import engine
from app.db.base import Base
from app.api.v1.endpoints import auth_router

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona el ciclo de vida de la aplicación.
    Crea las tablas al iniciar y las elimina al cerrar (solo en desarrollo).
    """
    # Startup: Crear todas las tablas
    logger.info("🚀 Iniciando aplicación...")
    logger.info(f"Ambiente: {'DEBUG' if settings.debug else 'PRODUCCIÓN'}")
    
    async with engine.begin() as conn:
        logger.info("📊 Creando tablas en la base de datos...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Tablas creadas exitosamente")
    
    yield
    
    # Shutdown
    logger.info("🛑 Cerrando aplicación...")
    await engine.dispose()
    logger.info("✅ Aplicación cerrada")


# Crear instancia de FastAPI
app = FastAPI(
    title=settings.app_name,
    description="Backend para Sistema de Gestión Documental - Semana 1",
    version=settings.app_version,
    lifespan=lifespan
)

# --- CONFIGURACIÓN DE CORS ---
origins = [
    "http://127.0.0.1:5500",  # <--- Con LiveServer
    "http://localhost:5500"  # Es buena práctica poner también localhost
]

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router)


# Rutas básicas
@app.get("/", tags=["root"])
async def read_root():
    """
    Endpoint raíz de prueba.
    """
    return {
        "message": "Bienvenido al Sistema de Gestión Documental",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint de health check.
    Verifica que la aplicación está activa.
    """
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )
