# Generador Automático de Documentación MD — Bantotal

Herramienta que genera archivos `.md` de documentación para servicios Bantotal consultando directamente la base de datos (SQL Server para V3, Oracle para V4).

## Requisitos previos

Antes de instalar, asegurate de tener lo siguiente:

| Requisito | Versión mínima | Cómo verificar |
|---|---|---|
| [Node.js](https://nodejs.org) | 18 o superior | `node --version` |
| [Python](https://www.python.org/downloads/) | 3.8 o superior | `python --version` |
| Acceso a BD SQL Server | — | Solo para V3 |
| Acceso a BD Oracle + [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html) | — | Solo para V4 |

> **Nota para V4 (Oracle):** El driver `oracledb` requiere Oracle Instant Client instalado en el sistema. Descargalo desde el link de arriba y seguí las instrucciones de tu sistema operativo.

---

## Configuración inicial (recomendado)

Ejecutá el asistente de configuración. Se abre automáticamente en el navegador y te guía paso a paso:

```bash
node setup.js
```

El wizard te pregunta:
1. **Versión** — V3 o V4
2. **Plataforma** — SQL Server (JavaSQL) u Oracle
3. **Datos de la base de datos** — con botón para probar la conexión
4. **Datos de la API** — URLs y credenciales del ambiente Bantotal

Al finalizar genera el `.env` listo para usar.

---

## Instalación de dependencias

### Windows

```powershell
.\install.ps1
```

### Linux / macOS

```bash
chmod +x install.sh
./install.sh
```

Los scripts instalan las dependencias npm y crean el `.env` a partir del template.

---

## Instalación manual

Si preferís instalar manualmente, seguí estos pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/facupais/DOCUMENTACION-V3-V4.git
cd DOCUMENTACION-V3-V4
```

### 2. Instalar dependencias de Node.js

**Para V3 (SQL Server):**
```bash
cd V3
npm install
cd ..
```

**Para V4 (Oracle):**
```bash
cd V4
npm install
cd ..
```

### 3. Configurar variables de entorno

Cada versión tiene su propio archivo `.env`. Copiá el template y editalo con tus datos:

**Para V3:**
```bash
cp V3/.env.example V3/.env
```
Editá `V3/.env` con los datos de tu entorno:
```env
DB_SERVER=tu-servidor-sql
DB_PORT=1433
DB_DATABASE=nombre-base-de-datos
DB_USER=usuario
DB_PASSWORD=contraseña

BASE_URL=https://tu-servidor:puerto
API_BASE_URL=https://tu-servidor:puerto/nombrebd
API_AUTH_URL=https://tu-servidor:puerto/nombrebd/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1
API_USER=INSTALADOR
API_PASSWORD=tu-contraseña-api
```

**Para V4:**
```bash
cp V4/.env.example V4/.env
```
Editá `V4/.env` con los datos de tu entorno:
```env
DB_USER=usuario-oracle
DB_PASSWORD=contraseña-oracle
DB_CONNECT_STRING=ip-servidor:1521/nombre-servicio

BASE_URL=https://tu-servidor-v4:puerto
API_BASE_URL=http://ip-servidor:puerto/nombre-core
API_USER=INSTALADOR
API_PASSWORD=tu-contraseña-api
```

### 4. Verificar la conexión

```bash
# V3
cd V3 && node -e "require('./generar_md.js')" 2>&1 | head -5

# V4
cd V4 && node -e "require('./generar_md.js')" 2>&1 | head -5
```

---

## Uso básico

### Generar documentación de un método

```bash
# V3
cd V3
node generar_md.js <Servicio> <Metodo>

# Ejemplo
node generar_md.js BTPartners ObtenerMarcas
```

```bash
# V4
cd V4
node generar_md.js <Servicio> <Metodo>

# Ejemplo
node generar_md.js PublicSavingAccounts getDetailedData
```

### Generar todos los métodos de un servicio

```bash
node generar_md.js <Servicio>
```

### Generar con ejemplos reales (llama a la API)

```bash
node generar_md.js <Servicio> <Metodo> --ejecutar
```

Los archivos se generan en una carpeta con el nombre del servicio (`BTPartners/ObtenerMarcas.md`).

---

## Documentación detallada

- [Guía completa V3 (SQL Server)](V3/README.md) — workflows, parámetros, scripts Python
- [Guía completa V4 (Oracle)](V4/README.md) — workflows, parámetros, scripts Python

---

## Estructura del repositorio

```
DOCUMENTACION-V3-V4/
├── V3/                     # Generador para Bantotal V3 (SQL Server)
│   ├── generar_md.js          # Generador principal
│   ├── generar_todos.js       # Genera todos los métodos de un servicio
│   ├── generar_workflow.js    # Ejecución en modo workflow
│   ├── validar_md.js          # Validador de calidad del MD generado
│   ├── *.py                   # Scripts de post-procesamiento
│   ├── .env.example           # Template de configuración
│   └── README.md              # Documentación detallada V3
│
├── V4/             # Generador para Bantotal V4 (Oracle)
│   ├── generar_md.js
│   ├── generar_todos.js
│   ├── generar_workflow.js
│   ├── generar_sdt.js
│   ├── validar_md.js
│   ├── *.py
│   ├── .env.example
│   └── README.md              # Documentación detallada V4
│
├── install.ps1                # Script de instalación para Windows
├── install.sh                 # Script de instalación para Linux/macOS
└── README.md                  # Este archivo
```

---

## Problemas frecuentes

### `Cannot find module 'mssql'` o `Cannot find module 'oracledb'`
Faltó ejecutar `npm install` en la carpeta correspondiente. Corré el script de instalación o seguí la instalación manual.

### Error de conexión a la base de datos
Verificá que:
- El servidor de BD es accesible desde tu red
- Las credenciales en `.env` son correctas
- El puerto no está bloqueado por firewall

### `DPI-1047: Cannot locate a 64-bit Oracle Client library` (V4)
Oracle Instant Client no está instalado o no está en el PATH del sistema. Seguí las instrucciones en [oracle.com/instant-client](https://www.oracle.com/database/technologies/instant-client.html).

### El archivo `.env` no se carga
Asegurate de estar ejecutando el comando **desde la carpeta del generador** (`V3/` o `V4/`), no desde la raíz del repo.
