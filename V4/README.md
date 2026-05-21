# Generador de Documentación MD — Bantotal V4

Genera archivos `.md` de documentación para servicios Bantotal V4 consultando la base de datos Oracle.

## Requisitos

- Node.js
- Oracle Instant Client (requerido por `oracledb`)
- Acceso a la base de datos Oracle de Bantotal V4

## Instalación

```bash
npm install
```

## Configuración

Crear o editar el archivo `.env` en esta carpeta:

```env
# Base de datos Oracle
DB_USER=btdesav23
DB_PASSWORD=Bantotal$2020
DB_CONNECT_STRING=10.0.0.4:1521/btv4db

# URL base para los links de documentación
BASE_URL=https://servidor-v4:puerto

# API para ejecución real (--ejecutar)
API_BASE_URL=http://10.0.0.5:8445/btv4core
API_USER=INSTALADOR
API_PASSWORD=Bantotal2015
```

## Uso

### Generar un método

```bash
node generar_md.js <Servicio> <Metodo>
```

```bash
node generar_md.js PublicSavingAccounts getDetailedData
```

Los archivos se generan en una carpeta con el nombre del servicio (`PublicSavingAccounts/getDetailedData.md`).

### Generar todos los métodos de un servicio

```bash
node generar_md.js <Servicio>
```

```bash
node generar_md.js PublicSavingAccounts
```

### Generar con ejemplos reales (`--ejecutar`)

Llama al servicio real para obtener una respuesta real en el JSON de ejemplo.

```bash
node generar_md.js PublicSavingAccounts getDetailedData --ejecutar
```

### Pasar parámetros de entrada (`--params`)

Útil cuando el servicio requiere IDs u otros valores específicos.

```bash
# Desde un archivo JSON
node generar_md.js PublicSavingAccounts getDetailedData --ejecutar --params params.json

# Inline
node generar_md.js PublicSavingAccounts getDetailedData --ejecutar --params "{\"savingAccountGUID\": \"abc-123\"}"
```

Formato de `params.json`:
```json
{
  "savingAccountGUID": "abc-123-def-456"
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
  "service": "PublicSavingAccounts",
  "folder": "PublicSavingAccounts",
  "steps": [
    {
      "method": "getProducts"
    },
    {
      "method": "getPersonProducts",
      "params": {
        "personGUID": "183f5194-f5a9-4590-9aff-b43de58c263d"
      },
      "extract": [
        { "path": "products.product[5].ProductGUID", "as": "productGUID" }
      ]
    },
    {
      "method": "create",
      "params": {
        "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
        "subAccountName": "Cuenta de Ahorro",
        "branchId": 1,
        "signatureType": "A"
      },
      "extract": ["savingAccountGUID"]
    },
    {
      "method": "getDetailedData"
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
"extract": ["savingAccountGUID"]

// Extrae un campo anidado y lo renombra
"extract": [
  { "path": "products.product[0].ProductGUID", "as": "productGUID" }
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
