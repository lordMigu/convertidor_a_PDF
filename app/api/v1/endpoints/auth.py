"""
Endpoints de autenticación (login y registro).
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import get_settings
from app.api import deps

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
    responses={404: {"description": "No encontrado"}}
)

settings = get_settings()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    Endpoint para registrar un nuevo usuario.
    
    Parámetros:
    - **email**: Correo electrónico único
    - **password**: Contraseña (mínimo 8 caracteres)
    - **role**: Rol del usuario ('admin' o 'user', por defecto 'user')
    
    Retorna:
    - Datos del usuario creado (sin contraseña)
    
    Excepciones:
    - 400: Email ya existe
    """
    
    # Verificar si el usuario ya existe
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario con password hasheado
    hashed_password = hash_password(user_data.password)
    
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        is_active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return UserResponse.from_orm(new_user)


@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Endpoint para login y obtención de JWT access token.
    Utiliza OAuth2PasswordRequestForm estándar.
    
    Parámetros:
    - **username**: Email del usuario (OAuth2PasswordRequestForm usa 'username')
    - **password**: Contraseña
    
    Retorna:
    - Token JWT en formato {"access_token": "...", "token_type": "bearer"}
    
    Excepciones:
    - 401: Credenciales inválidas
    """
    
    # Buscar usuario por email (form_data.username contiene el email)
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    # Validar usuario y contraseña
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Crear access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.email,
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Token)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Endpoint alternativo de login con JSON en lugar de form-data.
    Acepta email y password en JSON.
    
    Parámetros (JSON):
    - **email**: Email del usuario
    - **password**: Contraseña
    
    Retorna:
    - Token JWT en formato {"access_token": "...", "token_type": "bearer"}
    
    Excepciones:
    - 401: Credenciales inválidas
    """
    
    # Buscar usuario por email
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    # Validar usuario y contraseña
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Crear access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.email,
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(deps.get_current_user)):
    """
    Obtiene la información del usuario actual.
    """
    return current_user
