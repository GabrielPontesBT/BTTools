# ============================================================
# Instalador del Generador Automatico de Documentacion MD
# Bantotal V3 (SQL Server) y/o V4 (Oracle)
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Step { param([string]$msg) Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok   { param([string]$msg) Write-Host "   OK: $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "   ATENCION: $msg" -ForegroundColor Yellow }
function Write-Fail { param([string]$msg) Write-Host "   ERROR: $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "============================================" -ForegroundColor White
Write-Host " Generador Automatico de Documentacion MD  " -ForegroundColor White
Write-Host "============================================" -ForegroundColor White

# ── 1. Verificar Node.js ──────────────────────────────────
Write-Step "Verificando Node.js..."
try {
    $nodeVersion = node --version 2>&1
    $major = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($major -lt 18) {
        Write-Fail "Node.js $nodeVersion encontrado, pero se requiere v18 o superior."
        Write-Host "   Descargalo en: https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }
    Write-Ok "Node.js $nodeVersion"
} catch {
    Write-Fail "Node.js no encontrado. Descargalo en: https://nodejs.org"
    exit 1
}

# ── 2. Verificar Python ───────────────────────────────────
Write-Step "Verificando Python..."
try {
    $pyVersion = python --version 2>&1
    Write-Ok "$pyVersion"
} catch {
    Write-Warn "Python no encontrado. Los scripts de post-procesamiento no estaran disponibles."
    Write-Host "   Descargalo en: https://www.python.org/downloads/" -ForegroundColor Yellow
}

# ── 3. Elegir version ─────────────────────────────────────
Write-Host ""
Write-Host "Que version de Bantotal vas a documentar?" -ForegroundColor White
Write-Host "  [1] V3 - SQL Server"
Write-Host "  [2] V4 - Oracle"
Write-Host "  [3] Ambas"
Write-Host ""
$opcion = Read-Host "Ingresa una opcion (1/2/3)"

$instalarV3 = $opcion -eq "1" -or $opcion -eq "3"
$instalarV4 = $opcion -eq "2" -or $opcion -eq "3"

if (-not $instalarV3 -and -not $instalarV4) {
    Write-Fail "Opcion no valida. Ejecuta el script nuevamente."
    exit 1
}

# ── 4. Instalar V3 ────────────────────────────────────────
if ($instalarV3) {
    Write-Step "Instalando dependencias de V3 (SQL Server)..."
    Push-Location V3
    npm install --silent
    if ($LASTEXITCODE -ne 0) { Write-Fail "npm install fallo en V3."; Pop-Location; exit 1 }
    Write-Ok "Dependencias de V3 instaladas."

    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Warn "Se creo V3\.env a partir del template. Editalo con tus datos antes de usar."
    } else {
        Write-Ok "V3\.env ya existe, no se sobreescribio."
    }
    Pop-Location
}

# ── 5. Instalar V4 ────────────────────────────────────────
if ($instalarV4) {
    Write-Step "Instalando dependencias de V4 (Oracle)..."

    Write-Warn "V4 requiere Oracle Instant Client instalado en el sistema."
    Write-Host "   Si aun no lo tenes, descargalo en:" -ForegroundColor Yellow
    Write-Host "   https://www.oracle.com/database/technologies/instant-client.html" -ForegroundColor Yellow
    Write-Host ""
    $continuar = Read-Host "   Continuar con npm install de V4? (s/n)"
    if ($continuar -ne "s") {
        Write-Warn "Instalacion de V4 omitida. Podes ejecutar 'cd V4 && npm install' cuando estes listo."
    } else {
        Push-Location V4
        npm install --silent
        if ($LASTEXITCODE -ne 0) { Write-Fail "npm install fallo en V4."; Pop-Location; exit 1 }
        Write-Ok "Dependencias de V4 instaladas."

        if (-not (Test-Path ".env")) {
            Copy-Item ".env.example" ".env"
            Write-Warn "Se creo V4\.env a partir del template. Editalo con tus datos antes de usar."
        } else {
            Write-Ok "V4\.env ya existe, no se sobreescribio."
        }
        Pop-Location
    }
}

# ── 6. Resumen final ──────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Instalacion completada!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White

if ($instalarV3) {
    Write-Host "  1. Edita V3\.env con los datos de tu base de datos SQL Server y tu API."
    Write-Host "  2. Ejecuta: cd V3 && node generar_md.js <Servicio> <Metodo>"
}
if ($instalarV4) {
    Write-Host "  1. Edita V4\.env con los datos de tu base de datos Oracle y tu API."
    Write-Host "  2. Ejecuta: cd V4 && node generar_md.js <Servicio> <Metodo>"
}

Write-Host ""
Write-Host "  Documentacion completa: README.md" -ForegroundColor Cyan
Write-Host ""
