# Sistema de Gestión Documental - Backend FastAPI

Backend moderno y escalable para un Sistema de Gestión Documental usando **FastAPI** y **SQLite**.

## 📋 Stack Tecnológico

- **Python 3.11+**
- **FastAPI** - Framework web asincrónico
- **SQLAlchemy 2.0** - ORM para base de datos
- **SQLite + aiosqlite** - Base de datos con soporte asincrónico
- **JWT (python-jose)** - Autenticación con tokens
- **passlib + bcrypt** - Hash seguro de contraseñas
- **Pydantic V2** - Validación de datos

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd proyecto
```

### 2. Crear entorno virtual
```bash
python -m venv venv

# En Windows
venv\Scripts\activate

# En Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
```

### 5. Ejecutar la aplicación
```bash
uvicorn app.main:app --reload
```

La aplicación estará disponible en: `http://localhost:8000`

## 📚 Documentación de la API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Estructura del Proyecto

```
proyecto/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   └── endpoints/
│   │   │       └── auth.py          # Endpoints de autenticación
│   │   └── deps.py                  # Dependencias inyectables
│   ├── core/
│   │   ├── config.py                # Configuración (settings)
│   │   ├── security.py              # Hash y JWT
│   │   └── __init__.py
│   ├── db/
│   │   ├── base.py                  # Clase base ORM
│   │   ├── session.py               # Configuración de sesión
│   │   └── __init__.py
│   ├── models/
│   │   ├── user.py                  # Modelo User
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── user.py                  # Esquemas de Usuario
│   │   ├── token.py                 # Esquemas de Token
│   │   └── __init__.py
│   ├── main.py                      # Punto de entrada
│   └── __init__.py
├── tests/                           # Tests (futuro)
├── .env.example                     # Variables de entorno (ejemplo)
├── .gitignore                       # Git ignore
├── requirements.txt                 # Dependencias Python
└── README.md                        # Este archivo
```

## 🔐 Autenticación

### Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/v1/auth/register | Registro de usuario |
| POST | /api/v1/auth/login | Login con JSON (email y password) |
| POST | /api/v1/auth/login/access-token | Login con form-data (OAuth2PasswordRequestForm) |
| GET | /api/v1/auth/me | Obtener usuario actual (requiere token) |
| POST | /api/v1/auth/password-recovery | Solicitar restablecimiento de contraseña |
| POST | /api/v1/auth/reset-password | Restablecer contraseña con token |

### Registro de Usuario

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "micontraseña123",
    "role": "user"
  }'
```

### Login - Obtener Token

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "micontraseña123"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Usar Token en Rutas Protegidas

```bash
curl -X GET "http://localhost:8000/api/v1/protected-route" \
  -H "Authorization: Bearer <access_token>"
```

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de la aplicación
APP_NAME=Sistema de Gestión Documental
DEBUG=False

# Base de datos
DATABASE_URL=sqlite+aiosqlite:///./gestion_documental.db
DB_ECHO=False

# Seguridad JWT
SECRET_KEY=tu-clave-secreta-super-segura-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:5500"]
```

⚠️ **IMPORTANTE**: Cambia `SECRET_KEY` por una clave segura en producción.

Genera una clave segura con:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## 🧪 Testing

Para agregar tests, crea archivos en la carpeta `tests/`:

```bash
pytest
```

## 🔄 Ciclo de Vida de la Aplicación

1. **Startup**: Crea automáticamente las tablas de la BD
2. **Runtime**: Maneja requests y autenticación
3. **Shutdown**: Cierra conexiones a la BD

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| fastapi | 0.104.1 | Framework web |
| uvicorn | 0.24.0 | Servidor ASGI |
| sqlalchemy | 2.0.23 | ORM |
| aiosqlite | 0.19.0 | Driver async SQLite |
| pydantic | 2.5.0 | Validación |
| python-jose | 3.3.0 | JWT |
| passlib | 1.7.4 | Hash de passwords |

## 🛠️ Desarrollo

### Agregar nuevos endpoints

1. Crea un archivo en `app/api/v1/endpoints/`
2. Define el router con `APIRouter()`
3. Importa en `app/api/v1/endpoints/__init__.py`
4. Incluye en `app/main.py` con `app.include_router()`

### Agregar nuevos modelos

1. Crea la clase en `app/models/`
2. Crea los esquemas en `app/schemas/`
3. Hereda de `Base` en los modelos ORM

## 📄 Licencia

MIT License

## 👨‍💻 Autor

Desarrollado como parte del Proyecto de Titulación.

---

**Última actualización**: 15 de diciembre de 2025
