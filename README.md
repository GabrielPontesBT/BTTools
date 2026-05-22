# Generador Automático de Documentación MD — Bantotal

Herramienta que genera archivos `.md` de documentación para servicios Bantotal consultando directamente la base de datos (SQL Server para V3, Oracle para V4).

---

## Inicio rápido

La forma más sencilla de usar la herramienta es con el acceso directo incluido:

1. Hacé doble clic en **`iniciar.bat`**
2. La primera vez instala automáticamente Node.js y las dependencias npm si no las tenés
3. Se abre el navegador con el asistente de configuración

> **Excepción para V4 (Oracle):** el driver `oracledb` requiere **Oracle Instant Client** instalado en el sistema, lo cual no puede automatizarse desde el `.bat`. Descargalo desde [oracle.com/instant-client](https://www.oracle.com/database/technologies/instant-client.html) e instalalo antes de usar la herramienta con Oracle.

Para crear el acceso directo en el escritorio: click derecho sobre `iniciar.bat` → **Enviar a** → **Escritorio (crear acceso directo)**.

---

## Requisitos previos

| Requisito | Versión mínima | Cómo verificar |
|---|---|---|
| [Node.js](https://nodejs.org) | 18 o superior | `node --version` |
| Acceso a BD SQL Server | — | Solo para V3 |
| Acceso a BD Oracle + [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html) | — | Solo para V4 |

---

## El asistente de configuración (wizard)

Al abrir la herramienta aparece un asistente en el navegador que guía la configuración en 6 pasos:

1. **Versión** — V3 (Bantotal SQL Server) o V4 (Bantotal Oracle)
2. **Plataforma** — motor de base de datos del ambiente
3. **Base de datos** — credenciales, con botón para probar la conexión
4. **API** — URLs y credenciales del ambiente Bantotal
5. **Servicios** — selección de los servicios y métodos a documentar
6. **Generación** — ejecuta el proceso y muestra el resultado en tiempo real

### Funcionalidades del wizard

- **Modo workflow** — cuando se selecciona "Todos los métodos" de un servicio, el wizard analiza las dependencias entre métodos y propone un orden de ejecución. Se puede reordenar arrastrando, y al confirmar el orden aparecen los parámetros que no se pueden resolver automáticamente de la cadena de llamados.
- **Parámetros SDT** — los parámetros de tipo complejo (SDT) muestran un textarea con la estructura JSON de ejemplo pre-cargada desde la base de datos.
- **Advertencia antes de generar** — si hay campos SDT con el valor de ejemplo sin modificar, el wizard avisa antes de proceder.
- **Estado de archivos** — la lista de servicios muestra si el `.md` ya fue generado anteriormente, con fecha y hora de la última generación.

---

## Instalación manual

Si preferís no usar `iniciar.bat`, podés instalar y arrancar manualmente:

### 1. Instalar dependencias npm

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

### 2. Arrancar el servidor

```bash
node setup.js
```

Luego abrí el navegador en `http://localhost:3777`.

---

## Instalación de variables de entorno (manual)

Si necesitás configurar el `.env` a mano sin pasar por el wizard:

**Para V3:**
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
```env
DB_USER=usuario-oracle
DB_PASSWORD=contraseña-oracle
DB_CONNECT_STRING=ip-servidor:1521/nombre-servicio

BASE_URL=https://tu-servidor-v4:puerto
API_BASE_URL=http://ip-servidor:puerto/nombre-core
API_USER=INSTALADOR
API_PASSWORD=tu-contraseña-api
```

---

## Uso por línea de comandos

El wizard genera los `.md` automáticamente, pero también podés correr los generadores directamente:

```bash
# Un método específico
node generar_md.js <Servicio> <Metodo>

# Todos los métodos de un servicio
node generar_md.js <Servicio>

# Con ejemplos reales (llama a la API Bantotal)
node generar_md.js <Servicio> <Metodo> --ejecutar

# Modo workflow (ejecuta la cadena de dependencias completa)
node generar_md.js <Servicio> --workflow <Servicio>_workflow.json --ejecutar
```

Los archivos se generan en `V3/<Servicio>/<Metodo>.md` o `V4/<Servicio>/<Metodo>.md`.

---

## Estructura del repositorio

```
DOCUMENTACION-V3-V4/
├── V3/                        # Generador para Bantotal V3 (SQL Server)
│   ├── generar_md.js          # Generador principal
│   ├── generar_workflow.js    # Análisis y ejecución de workflows
│   ├── .env                   # Configuración del ambiente (generado por wizard)
│   ├── .env.example           # Template de configuración
│   └── <Servicio>/            # Carpeta por servicio con los .md generados
│
├── V4/                        # Generador para Bantotal V4 (Oracle)
│   ├── generar_md.js
│   ├── generar_workflow.js
│   ├── .env
│   ├── .env.example
│   └── <Servicio>/
│
├── setup.js                   # Servidor del asistente de configuración
├── iniciar.bat                # Acceso directo con instalación automática
└── README.md                  # Este archivo
```

---

## Problemas frecuentes

### `Cannot find module 'mssql'` o `Cannot find module 'oracledb'`
Faltó ejecutar `npm install` en la carpeta correspondiente. Usá `iniciar.bat` o corré `npm install` manualmente en `V3/` o `V4/`.

### `DPI-1047: Cannot locate a 64-bit Oracle Client library` (V4)
Oracle Instant Client no está instalado o no está en el PATH del sistema. Este es el único requisito que **no se puede instalar automáticamente** con `iniciar.bat`. Seguí las instrucciones en [oracle.com/instant-client](https://www.oracle.com/database/technologies/instant-client.html).

### Error de conexión a la base de datos
Verificá que:
- El servidor de BD es accesible desde tu red
- Las credenciales en `.env` son correctas
- El puerto no está bloqueado por firewall

### El servidor ya está corriendo (al abrir `iniciar.bat` dos veces)
No es un problema — el `.bat` detecta si el servidor ya responde y simplemente abre el navegador sin arrancar una segunda instancia.
