"""
Configuración de la aplicación usando pydantic-settings.
Variables de entorno y configuraciones globales.
"""

from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Configuración global de la aplicación.
    Las variables se pueden sobrescribir mediante variables de entorno.
    """
    
    # Información de la aplicación
    app_name: str = "Sistema de Gestión Documental"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Base de datos
    database_url: str = "sqlite+aiosqlite:///./gestion_documental.db"
    db_echo: bool = False  # Log de sentencias SQL (útil en debug)
    
    # Seguridad - JWT
    secret_key: str = "tu-clave-secreta-super-segura-cambiar-en-produccion-32-caracteres-minimo"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10
    
    # CORS (para frontend)
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # Directorio de subidas
    upload_dir: str = "uploads"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False
    }


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna la instancia cacheada de Settings.
    Útil para evitar cargar múltiples veces las variables de entorno.
    """
    return Settings()
