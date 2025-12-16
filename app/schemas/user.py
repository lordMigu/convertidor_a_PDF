"""
Esquemas Pydantic para usuarios (validación de entrada/salida).
Usa Pydantic V2 con model_config.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """
    Esquema base para Usuario con campos comunes.
    """
    email: EmailStr = Field(..., description="Correo electrónico del usuario")
    role: str = Field(
        default="user",
        pattern="^(admin|user)$",
        description="Rol del usuario: 'admin' o 'user'"
    )


class UserCreate(UserBase):
    """
    Esquema para crear un nuevo usuario.
    Requiere email, password y opcionalmente role.
    """
    password: str = Field(
        ...,
        min_length=8,
        description="Contraseña del usuario (mínimo 8 caracteres)"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "usuario@example.com",
                "password": "micontraseña123",
                "role": "user"
            }
        }
    }


class UserLogin(BaseModel):
    """
    Esquema para login del usuario.
    Acepta email y password.
    """
    email: EmailStr = Field(..., description="Correo electrónico")
    password: str = Field(..., description="Contraseña")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "usuario@example.com",
                "password": "micontraseña123"
            }
        }
    }


class UserResponse(UserBase):
    """
    Esquema para la respuesta del usuario (lectura).
    No incluye password_hash por seguridad.
    """
    id: int = Field(..., description="ID único del usuario")
    is_active: bool = Field(
        default=True,
        description="Indica si el usuario está activo"
    )
    digital_signature_path: Optional[str] = Field(
        default=None,
        description="Ruta a la firma digital del usuario"
    )
    
    model_config = {
        "from_attributes": True,  # Pydantic V2 para ORM mode
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "usuario@example.com",
                "role": "user",
                "is_active": True,
                "digital_signature_path": None
            }
        }
    }
