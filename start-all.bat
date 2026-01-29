@echo off
setlocal enabledelayedexpansion

REM Racine du projet (chemin absolu du dossier où se trouve ce .bat)
set "ROOT=%~dp0"

echo ========================================
echo    Demarrage du projet BookShare
echo ========================================
echo.

REM Verification des dossiers
if not exist "%ROOT%backend" (
	echo [ERREUR] Dossier backend introuvable: "%ROOT%backend"
	pause
	goto :eof
)
if not exist "%ROOT%frontend" (
	echo [ERREUR] Dossier frontend introuvable: "%ROOT%frontend"
	pause
	goto :eof
)

REM ========================================
REM Configuration Backend
REM ========================================
echo [BACKEND] Configuration...

REM Verifier et creer le fichier .env s'il n'existe pas
if not exist "%ROOT%backend\.env" (
	echo [BACKEND] Creation du fichier .env depuis .env.example...
	copy "%ROOT%backend\.env.example" "%ROOT%backend\.env" >nul
	if errorlevel 1 (
		echo [ERREUR] Impossible de creer le fichier .env
		pause
		goto :eof
	)
	echo [BACKEND] Fichier .env cree avec succes
) else (
	echo [BACKEND] Fichier .env deja present
)

REM Verifier si le venv existe
if not exist "%ROOT%.venv\Scripts\activate.bat" (
	echo [BACKEND] Creation de l'environnement virtuel Python...
	python -m venv "%ROOT%.venv"
	if errorlevel 1 (
		echo [ERREUR] Impossible de creer l'environnement virtuel
		pause
		goto :eof
	)
)

REM Verifier si les dependances Python sont installees
echo [BACKEND] Verification des dependances Python...
call "%ROOT%.venv\Scripts\activate.bat"
pip show fastapi >nul 2>&1
if errorlevel 1 (
	echo [BACKEND] Installation des dependances Python...
	pip install -r "%ROOT%backend\requirements.txt"
	if errorlevel 1 (
		echo [ERREUR] Impossible d'installer les dependances Python
		pause
		goto :eof
	)
	echo [BACKEND] Dependances Python installees avec succes
) else (
	echo [BACKEND] Dependances Python deja installees
)

REM ========================================
REM Configuration Frontend
REM ========================================
echo.
echo [FRONTEND] Configuration...

REM Verifier si les dependances npm sont installees
if not exist "%ROOT%frontend\node_modules" (
	echo [FRONTEND] Installation des dependances npm...
	pushd "%ROOT%frontend"
	call npm install
	popd
	if errorlevel 1 (
		echo [ERREUR] Impossible d'installer les dependances npm
		pause
		goto :eof
	)
	echo [FRONTEND] Dependances npm installees avec succes
) else (
	echo [FRONTEND] Dependances npm deja installees
)

REM ========================================
REM Demarrage des serveurs
REM ========================================
echo.
echo ========================================
echo    Demarrage des serveurs...
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur Ctrl+C dans chaque fenetre pour arreter les serveurs
echo.

REM Lancer backend (FastAPI avec venv)
start "Backend - FastAPI (Port 8000)" cmd /k "cd /d ""%ROOT%"" && .venv\Scripts\activate.bat && cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Attendre 2 secondes avant de lancer le frontend
timeout /t 2 /nobreak >nul

REM Lancer frontend (Next.js)
start "Frontend - Next.js (Port 3000)" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo.
echo ========================================
echo    Serveurs demarres avec succes!
echo ========================================
echo.
echo Les fenetres de terminal ont ete ouvertes.
echo Fermez cette fenetre si vous le souhaitez.
echo.
pause

endlocal
