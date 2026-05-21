# Generador de Documentación MD — Bantotal V3

Genera archivos `.md` de documentación para servicios Bantotal V3 consultando la base de datos SQL Server.

## Requisitos

- Node.js
- Acceso a la base de datos SQL Server de Bantotal V3

## Instalación

```bash
npm install
```

## Configuración

Crear o editar el archivo `.env` en esta carpeta:

```env
# Base de datos SQL Server
DB_SERVER=SQLSERVER1
DB_PORT=1433
DB_DATABASE=ProductoGx16
DB_USER=productogx16
DB_PASSWORD=prodGx16

# URL base para los links de documentación
BASE_URL=https://pioneroapp2:6004

# API para ejecución real (--ejecutar)
API_BASE_URL=https://pioneroapp2:6004/productogx16
API_AUTH_URL=https://pioneroapp2:6004/productogx16/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1
API_USER=INSTALADOR
API_PASSWORD=Bantotal2015
```

## Uso

### Generar un método

```bash
node generar_md.js <Servicio> <Metodo>
```

```bash
node generar_md.js BTPartners ObtenerMarcas
```

Los archivos se generan en una carpeta con el nombre del servicio (`BTPartners/ObtenerMarcas.md`).

### Generar todos los métodos de un servicio

```bash
node generar_md.js <Servicio>
```

```bash
node generar_md.js BTPartners
```

### Generar con ejemplos reales (`--ejecutar`)

Llama al servicio real para obtener una respuesta real en el JSON de ejemplo.

```bash
node generar_md.js BTPartners ObtenerMarcas --ejecutar
```

### Pasar parámetros de entrada (`--params`)

Útil cuando el servicio requiere IDs u otros valores específicos.

```bash
# Desde un archivo JSON
node generar_md.js BTPartners ObtenerModelos --ejecutar --params params.json

# Inline
node generar_md.js BTPartners ObtenerModelos --ejecutar --params "{\"marcaUId\": 1}"
```

Formato de `params.json`:
```json
{
  "marcaUId": 1,
  "vendedorUId": 123
}
```

### Modo workflow

Ejecuta varios métodos en secuencia, permitiendo pasar datos de un paso al siguiente.

```bash
node generar_md.js --workflow workflow.json
```

Formato de `workflow.json`:
```json
{
  "service": "BTPartners",
  "folder": "BTPartners",
  "steps": [
    {
      "method": "ObtenerMarcas"
    },
    {
      "method": "ObtenerModelos",
      "params": {
        "marcaUId": 1
      },
      "extract": [
        { "path": "sdtModelos.sBTModelo[0].modeloUId", "as": "modeloUId" }
      ]
    },
    {
      "method": "ObtenerVersiones",
      "extract": ["versionUId"]
    }
  ]
}
```

**Campos de cada paso:**

| Campo | Descripción |
|-------|-------------|
| `method` | Nombre del método a ejecutar |
| `params` | Parámetros fijos para este paso |
| `extract` | Campos a extraer de la respuesta y pasar al siguiente paso |

**Formato de `extract`:**

```json
// Extrae un campo directo de la respuesta
"extract": ["vendedorUId"]

// Extrae un campo anidado y lo renombra
"extract": [
  { "path": "sdtModelos.sBTModelo[0].modeloUId", "as": "modeloUId" }
]
```

## Scripts de apoyo (Python)

| Script | Descripción |
|--------|-------------|
| `generate_structured_data_docs.py` | Extrae SDTs desde los JSON de ejemplo |
| `flatten_json_text_values.py` | Normaliza wrappers `{"__text": ...}` en los JSON |
| `redistribute_input_body_tabs.py` | Reorganiza tabs de entrada/body en el MD |
| `remove_xml_examples.py` | Elimina bloques XML de ejemplo |
| `rewrite_md_json_to_curl.py` | Convierte bloques JSON a comandos cURL |
