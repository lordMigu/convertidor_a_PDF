"""
Endpoints para firma electrónica y validación de PDFs con pyHanko.
"""

import os
import shutil
import uuid
import asyncio
import tempfile
from pathlib import Path
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

# Importaciones de pyHanko
from pyhanko.sign import signers, fields
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko.pdf_utils.reader import PdfFileReader

from app.db.session import get_db
from app.api import deps
from app.models import User, Document, Version
from app.schemas.document import VersionResponse, SignatureValidationResponse
from app.core.config import get_settings

router = APIRouter(
    prefix="/documents",
    tags=["signatures"]
)

settings = get_settings()
# Asegurar que el directorio de subidas existe
UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(exist_ok=True)


def _sign_pdf_task(
    input_pdf_path: str,
    output_pdf_path: str,
    p12_bytes: bytes,
    password: str
):
    """
    Función síncrona para firmar el PDF que será ejecutada en un threadpool.
    Utiliza pyhanko para realizar la firma.
    """
    # Crear archivo temporal para el certificado
    
    # Usar un archivo temporal seguro que se cierra automáticamente
    # pero persistente (delete=False) para que pyHanko pueda abrirlo por path
    tmp_p12_path = None # Initialize to None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".p12") as tmp_p12:
            tmp_p12.write(p12_bytes)
            tmp_p12_path = tmp_p12.name

        # DEBUG: Inspeccionar qué es SigSeedSubFilter eliminados para limpieza
        
        # Cargar firmante usando el PATH del archivo temporal
        signer = signers.SimpleSigner.load_pkcs12(
            pfx_file=tmp_p12_path,
            passphrase=password.encode() if password else None
        )
    except Exception as e:
        # Manejo de error específico si la contraseña es incorrecta o el archivo está dañado
        raise ValueError(f"Error al cargar certificado (posible contraseña incorrecta): {e}")
    finally:
        # Asegurar limpieza del archivo temporal
        if tmp_p12_path and os.path.exists(tmp_p12_path):
            try:
                os.unlink(tmp_p12_path)
            except Exception as e:
                print(f"WARNING: No se pudo eliminar el archivo temporal {tmp_p12_path}: {e}")

    with open(input_pdf_path, 'rb') as inf:
        # strict=False es necesario para soportar PDFs generados por herramientas comunes (LibreOffice, etc)
        # que usan tablas XRef híbridas.
        w = IncrementalPdfFileWriter(inf, strict=False)

        # No llamamos a append_signature_field manualmente porque SigSeedSubFilter está dando problemas.
        # Dejamos que signers.sign_pdf intente manejarlo o que falle si no existe el campo.
        
        # Realizar la firma en un nuevo documento
        with open(output_pdf_path, 'wb') as outf:
            signers.sign_pdf(
                w, signers.PdfSignatureMetadata(field_name='Signature1'),
                signer=signer,
                output=outf,
            )


@router.post("/sign", response_model=VersionResponse)
async def sign_document(
    document_id: int = Form(...),
    p12_file: UploadFile = File(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Firma un documento existente usando un certificado P12/PFX.
    Crea una nueva versión del documento.
    """
    # 1. Verificar Permisos (Mínimo Editor para crear nueva versión)
    # Se usa la dependencia verify_document_access implementada anteriormente
    await deps.verify_document_access(document_id, db, current_user, "editor")

    # 2. Obtener la última versión del documento
    stmt = (
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.versions))
    )
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    # Buscar la versión marcada como latest
    latest_version = next((v for v in document.versions if v.is_latest), None)
    if not latest_version:
        # Fallback: tomar la más reciente por fecha
        versions_sorted = sorted(document.versions, key=lambda x: x.created_at, reverse=True)
        if versions_sorted:
            latest_version = versions_sorted[0]
        else:
             raise HTTPException(status_code=404, detail="El documento no tiene versiones para firmar")

    source_path = Path(latest_version.file_path)
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="Archivo físico no encontrado")

    # 3. Preparar nuevo archivo firmado
    file_ext = source_path.suffix
    unique_filename = f"{uuid.uuid4()}_signed{file_ext}"
    output_path = UPLOAD_DIR / unique_filename

    # Leer el P12 en memoria para pasarlo a la función de firma
    p12_bytes = await p12_file.read()

    # 4. Ejecutar firma (CPU bound) en threadpool para no bloquear el loop
    try:
        await run_in_threadpool(
            _sign_pdf_task,
            str(source_path),
            str(output_path),
            p12_bytes,
            password
        )
    except ValueError as e:
        print(f"ERROR ValueError en pyHanko: {e}")
        # Capturar error de contraseña y devolver 400 Bad Request
        raise HTTPException(status_code=400, detail=f"Error validando certificado o contraseña: {str(e)}")
    except Exception as e:
        print(f"ERROR Exception general en firma: {e}")
        # Limpiar archivo si falló
        if output_path.exists():
            output_path.unlink()
        raise HTTPException(status_code=500, detail=f"Error al firmar PDF: {str(e)}")

    # 5. Crear nueva versión en DB
    # Desmarcar anteriores como latest
    await db.execute(
        update(Version).where(Version.document_id == document_id).values(is_latest=False)
    )

    # Calcular nuevo número de versión
    new_v_num = "v1.0-signed"
    try:
        v_parts = latest_version.version_number.replace('v', '').split('.')
        major = int(v_parts[0])
        minor = int(v_parts[1]) if len(v_parts) > 1 else 0
        new_v_num = f"v{major}.{minor + 1}-signed"
    except:
        pass

    file_size = output_path.stat().st_size

    new_version = Version(
        document_id=document_id,
        version_number=new_v_num,
        file_path=str(output_path),
        file_size=file_size,
        mime_type="application/pdf",
        is_latest=True
    )
    
    db.add(new_version)
    await db.commit()
    await db.refresh(new_version)

    return new_version


def _validate_pdf_task(file_path: str) -> dict:
    """
    Valida las firmas de un PDF de forma síncrona.
    """
    result_data = {
        "is_valid": False,
        "trusted": False,
        "signer_name": None,
        "timestamp": None
    }
    
    try:
        with open(file_path, 'rb') as f:
            r = PdfFileReader(f)
            # Verificar si hay firmas incrustadas
            if not r.embedded_signatures:
                return result_data

            # Validar la última firma encontrada
            sig_status = validate_pdf_signature(r.embedded_signatures[-1])
            
            result_data["is_valid"] = sig_status.intact
            result_data["trusted"] = sig_status.trusted
            
            if sig_status.signer_cert:
                # Extraer CN (Common Name) del certificado
                subject = sig_status.signer_cert.subject
                
                # Intentar obtener CN de forma robusta
                for attribute in subject:
                     if attribute.oid._name == "commonName":
                         result_data["signer_name"] = attribute.value
                         break
                
                if not result_data["signer_name"]:
                    # Fallback
                    result_data["signer_name"] = str(subject.rfc4514_string())

            if sig_status.signing_time:
                result_data["timestamp"] = sig_status.signing_time

    except Exception as e:
        print(f"Error validando firma: {e}")
        # En caso de error, retornamos estructura por defecto (inválido)
        
    return result_data


@router.post("/validate", response_model=SignatureValidationResponse)
async def validate_signature(
    file: UploadFile = File(...)
):
    """
    Valida las firmas electrónicas de un archivo PDF subido.
    Retorna información sobre la validez, firmante y fecha.
    """
    # Guardar temporalmente para analisis
    temp_filename = f"validate_{uuid.uuid4()}.pdf"
    temp_path = UPLOAD_DIR / temp_filename
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Ejecutar validación en threadpool
        result = await run_in_threadpool(_validate_pdf_task, str(temp_path))
        
        return SignatureValidationResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validando PDF: {str(e)}")
    finally:
        # Limpieza de archivo temporal
        if temp_path.exists():
            temp_path.unlink()
