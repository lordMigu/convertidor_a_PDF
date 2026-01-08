import os
import subprocess
import platform
import asyncio
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

# Importar librerías específicas según disponibilidad
try:
    if platform.system() == "Windows":
        import win32com.client
        import pythoncom
        from docx2pdf import convert as docx_to_pdf
        WINDOWS_LIBS_AVAILABLE = True
    else:
        WINDOWS_LIBS_AVAILABLE = False
except ImportError:
    WINDOWS_LIBS_AVAILABLE = False

class ConverterStrategy(ABC):
    @abstractmethod
    async def convert(self, source_path: Path, target_dir: Path) -> Path:
        """Convierte el archivo a PDF y devuelve la ruta del PDF resultante."""
        pass

class WindowsConverter(ConverterStrategy):
    def __init__(self):
        if not WINDOWS_LIBS_AVAILABLE:
            raise RuntimeError("Las librerías de Windows (pywin32, docx2pdf) no están instaladas")

    async def convert(self, source_path: Path, target_dir: Path) -> Path:
        ext = source_path.suffix.lower()
        pdf_path = target_dir / f"{source_path.stem}.pdf"
        
        if ext == ".docx":
            # docx2pdf usa Word internamente en Windows
            await self._convert_word(source_path, pdf_path)
        
        elif ext in [".xlsx", ".xls"]:
            await self._convert_excel(source_path, pdf_path)
            
        elif ext in [".pptx", ".ppt"]:
            await self._convert_powerpoint(source_path, pdf_path)
            
        else:
            raise ValueError(f"Extensión no soportada en Windows: {ext}")
            
        return pdf_path

    async def _convert_word(self, source_path: Path, pdf_path: Path):
        abs_source = str(source_path.absolute())
        abs_pdf = str(pdf_path.absolute())
        def _word_com():
            pythoncom.CoInitialize()
            try:
                docx_to_pdf(abs_source, abs_pdf)
            finally:
                pythoncom.CoUninitialize()
        
        await asyncio.to_thread(_word_com)

    async def _convert_excel(self, source_path: Path, pdf_path: Path):
        abs_source = str(source_path.absolute())
        abs_pdf = str(pdf_path.absolute())
        def _excel_com():
            pythoncom.CoInitialize()
            try:
                excel = win32com.client.DispatchEx("Excel.Application")
                excel.Visible = False
                wb = None
                try:
                    wb = excel.Workbooks.Open(abs_source)
                    # 57 = xlTypePDF
                    wb.ExportAsFixedFormat(0, abs_pdf)
                finally:
                    if wb:
                        wb.Close(SaveChanges=False)
                    excel.Quit()
            finally:
                pythoncom.CoUninitialize()
        
        await asyncio.to_thread(_excel_com)

    async def _convert_powerpoint(self, source_path: Path, pdf_path: Path):
        abs_source = str(source_path.absolute())
        abs_pdf = str(pdf_path.absolute())
        def _pp_com():
            pythoncom.CoInitialize()
            try:
                powerpoint = win32com.client.DispatchEx("Powerpoint.Application")
                # En PPT, el archivo se abre en la colección Presentations
                pres = None
                try:
                    pres = powerpoint.Presentations.Open(abs_source, WithWindow=False)
                    # 32 = ppSaveAsPDF
                    pres.SaveAs(abs_pdf, 32)
                finally:
                    if pres:
                        pres.Close()
                    powerpoint.Quit()
            finally:
                pythoncom.CoUninitialize()
        
        await asyncio.to_thread(_pp_com)

class LinuxConverter(ConverterStrategy):
    async def convert(self, source_path: Path, target_dir: Path) -> Path:
        # Usar LibreOffice headless
        # soffice --headless --convert-to pdf --outdir <target_dir> <source_path>
        cmd = [
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(target_dir),
            str(source_path)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise RuntimeError(f"Error de LibreOffice: {stderr.decode()}")
            
        # LibreOffice genera el archivo en target_dir con el mismo nombre y extensión .pdf
        expected_pdf = target_dir / f"{source_path.stem}.pdf"
        if not expected_pdf.exists():
             raise FileNotFoundError(f"LibreOffice no generó el archivo esperado: {expected_pdf}")
             
        return expected_pdf

class ConverterFactory:
    @staticmethod
    def get_converter() -> ConverterStrategy:
        sys_name = platform.system()
        if sys_name == "Windows":
            return WindowsConverter()
        elif sys_name == "Linux":
            return LinuxConverter()
        else:
            # Fallback a Linux si es Darwin/MacOS quizás LibreOffice también funcione
            # pero por ahora seguimos el requisito
            raise OSError(f"Sistema operativo no soportado: {sys_name}")
