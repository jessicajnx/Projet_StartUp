@echo off
setlocal

REM Racine du projet (chemin absolu du dossier où se trouve ce .bat)
set "ROOT=%~dp0"

echo ROOT=%ROOT%
if not exist "%ROOT%backend" (
	echo Dossier backend introuvable: "%ROOT%backend"
	pause
	goto :eof
)
if not exist "%ROOT%frontend" (
	echo Dossier frontend introuvable: "%ROOT%frontend"
	pause
	goto :eof
)

REM Lancer backend (FastAPI)
start "backend" cmd /k "pushd ""%ROOT%backend"" && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

REM Lancer frontend (Next.js)
start "frontend" cmd /k "pushd ""%ROOT%frontend"" && npm run dev"

endlocal
