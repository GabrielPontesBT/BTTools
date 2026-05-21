#!/usr/bin/env bash
# ============================================================
# Instalador del Generador Automatico de Documentacion MD
# Bantotal V3 (SQL Server) y/o V4 (Oracle)
# ============================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() { echo -e "\n${CYAN}>> $1${NC}"; }
ok()   { echo -e "   ${GREEN}OK: $1${NC}"; }
warn() { echo -e "   ${YELLOW}ATENCION: $1${NC}"; }
fail() { echo -e "   ${RED}ERROR: $1${NC}"; exit 1; }

echo ""
echo "============================================"
echo " Generador Automatico de Documentacion MD  "
echo "============================================"

# ── 1. Verificar Node.js ──────────────────────────────────
step "Verificando Node.js..."
if ! command -v node &>/dev/null; then
    fail "Node.js no encontrado. Descargalo en: https://nodejs.org"
fi
NODE_MAJOR=$(node --version | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
    fail "Node.js $(node --version) encontrado, pero se requiere v18 o superior. Descargalo en: https://nodejs.org"
fi
ok "Node.js $(node --version)"

# ── 2. Verificar Python ───────────────────────────────────
step "Verificando Python..."
if command -v python3 &>/dev/null; then
    ok "$(python3 --version)"
elif command -v python &>/dev/null; then
    ok "$(python --version)"
else
    warn "Python no encontrado. Los scripts de post-procesamiento no estaran disponibles."
    echo -e "   Descargalo en: ${YELLOW}https://www.python.org/downloads/${NC}"
fi

# ── 3. Elegir version ─────────────────────────────────────
echo ""
echo "Que version de Bantotal vas a documentar?"
echo "  [1] V3 - SQL Server"
echo "  [2] V4 - Oracle"
echo "  [3] Ambas"
echo ""
read -rp "Ingresa una opcion (1/2/3): " opcion

instalar_v3=false
instalar_v4=false

case "$opcion" in
    1) instalar_v3=true ;;
    2) instalar_v4=true ;;
    3) instalar_v3=true; instalar_v4=true ;;
    *) fail "Opcion no valida. Ejecuta el script nuevamente." ;;
esac

# ── 4. Instalar V3 ────────────────────────────────────────
if [ "$instalar_v3" = true ]; then
    step "Instalando dependencias de V3 (SQL Server)..."
    cd DocV3
    npm install --silent
    ok "Dependencias de V3 instaladas."

    if [ ! -f ".env" ]; then
        cp .env.example .env
        warn "Se creo DocV3/.env a partir del template. Editalo con tus datos antes de usar."
    else
        ok "DocV3/.env ya existe, no se sobreescribio."
    fi
    cd ..
fi

# ── 5. Instalar V4 ────────────────────────────────────────
if [ "$instalar_v4" = true ]; then
    step "Instalando dependencias de V4 (Oracle)..."

    warn "V4 requiere Oracle Instant Client instalado en el sistema."
    echo -e "   Si aun no lo tenes, descargalo en:"
    echo -e "   ${YELLOW}https://www.oracle.com/database/technologies/instant-client.html${NC}"
    echo ""
    read -rp "   Continuar con npm install de V4? (s/n): " continuar
    if [ "$continuar" != "s" ]; then
        warn "Instalacion de V4 omitida. Podes ejecutar 'cd DocV4Arreglar && npm install' cuando estes listo."
    else
        cd DocV4Arreglar
        npm install --silent
        ok "Dependencias de V4 instaladas."

        if [ ! -f ".env" ]; then
            cp .env.example .env
            warn "Se creo DocV4Arreglar/.env a partir del template. Editalo con tus datos antes de usar."
        else
            ok "DocV4Arreglar/.env ya existe, no se sobreescribio."
        fi
        cd ..
    fi
fi

# ── 6. Resumen final ──────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Instalacion completada!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Proximos pasos:"

if [ "$instalar_v3" = true ]; then
    echo "  1. Edita DocV3/.env con los datos de tu base de datos SQL Server y tu API."
    echo "  2. Ejecuta: cd DocV3 && node generar_md.js <Servicio> <Metodo>"
fi
if [ "$instalar_v4" = true ]; then
    echo "  1. Edita DocV4Arreglar/.env con los datos de tu base de datos Oracle y tu API."
    echo "  2. Ejecuta: cd DocV4Arreglar && node generar_md.js <Servicio> <Metodo>"
fi

echo ""
echo -e "  Documentacion completa: ${CYAN}README.md${NC}"
echo ""
