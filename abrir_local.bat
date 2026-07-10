@echo off
REM Servidor local para el tablero Unimagdalena en Cifras
cd /d "%~dp0"
echo Abriendo http://localhost:8000 ...
start "" http://localhost:8000
python -m http.server 8000
