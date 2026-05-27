@echo off
cd /d "%~dp0"
title Generador MD

:: ============================================================
:: 1. VERIFICAR NODE.JS
:: ============================================================
where node >nul 2>&1
if %errorlevel% == 0 goto check_deps

if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=%PATH%;C:\Program Files\nodejs"
    goto check_deps
)

echo.
echo  Node.js no encontrado. Instalando...
echo  (puede tardar unos minutos la primera vez)
echo.
winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: No se pudo instalar Node.js automaticamente.
    echo  Instalalo manualmente desde https://nodejs.org
    echo  y volvé a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)
set "PATH=%PATH%;C:\Program Files\nodejs"

:: Verificar que node sea accesible tras la instalacion
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  Node.js se instalo correctamente.
    echo  Cierra y volvé a abrir este archivo para continuar.
    echo.
    pause
    exit /b 0
)

:: ============================================================
:: 2. INSTALAR DEPENDENCIAS NPM SI FALTAN
:: ============================================================
:check_deps
if not exist "V3\node_modules" (
    echo.
    echo  Instalando dependencias V3 ^(SQL Server^)...
    echo  ^(esto puede tardar unos minutos la primera vez^)
    cd V3
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Fallo la instalacion de dependencias V3.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo  Dependencias V3 instaladas correctamente.
)

if not exist "V4\node_modules" (
    echo.
    echo  Instalando dependencias V4 ^(Oracle^)...
    echo  ^(esto puede tardar unos minutos la primera vez^)
    cd V4
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Fallo la instalacion de dependencias V4.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo  Dependencias V4 instaladas correctamente.
)

:: ============================================================
:: 3. CREAR ACCESO DIRECTO EN EL ESCRITORIO (solo la primera vez)
:: ============================================================
set "SHORTCUT=%USERPROFILE%\Desktop\Generador MD.lnk"
if not exist "%SHORTCUT%" (
    powershell -noprofile -command ^
        "$s = (New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT%');" ^
        "$s.TargetPath = 'cmd.exe';" ^
        "$s.Arguments = '/c \""%~f0"\"';" ^
        "$s.WorkingDirectory = '%~dp0';" ^
        "$s.IconLocation = '%~dp0icon.ico';" ^
        "$s.WindowStyle = 7;" ^
        "$s.Description = 'Generador de documentacion Bantotal';" ^
        "$s.Save()"
)

:: ============================================================
:: 4. ARRANCAR SERVIDOR Y ABRIR NAVEGADOR
:: ============================================================
curl -sf http://localhost:3777 >nul 2>&1
if %errorlevel% == 0 goto abrir

start "Generador MD" /min node setup.js

set /a intentos=0
:esperar
timeout /t 1 /nobreak >nul
curl -sf http://localhost:3777 >nul 2>&1
if %errorlevel% == 0 goto abrir
set /a intentos+=1
if %intentos% lss 15 goto esperar

:abrir
start "" http://localhost:3777
