"""
Dependencias inyectables de FastAPI.
Incluye get_current_user para proteger rutas.
"""

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.core.security import decode_token
from app.schemas.token import TokenData

# Esquema de seguridad HTTP Bearer
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependencia para obtener el usuario actual a partir del JWT token.
    Valida el token y consulta el usuario en la base de datos.
    
    Args:
        credentials: Credenciales HTTP Bearer (token JWT)
        db: Sesión de base de datos asíncrona
        
    Returns:
        Usuario autenticado del tipo User
        
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    token = credentials.credentials
    
    # Decodificar el token
    email = decode_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = TokenData(email=email)
    
    # Buscar el usuario en la base de datos
    stmt = select(User).where(User.email == token_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependencia para obtener un usuario admin autenticado.
    Se usa en rutas que requieren permisos de administrador.
    
    Args:
        current_user: Usuario autenticado (obtenido de get_current_user)
        
    Returns:
        Usuario autenticado con rol 'admin'
        
    Raises:
        HTTPException: Si el usuario no tiene rol de admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes. Se requiere rol de administrador."
        )
    
    return current_user
