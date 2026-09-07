---
title: Document Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de tipos los de documento.

**Nombre publicación:** PublicGeneral.documentTypes

**Programa:** PublicAPI.BTDTPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/documentTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
appliesTo | String $<(Length: 1)>$ | Tipo de persona para el que aplica (F:Física, J:Jurídica, A:Ambas).

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | Indica si existen más páginas disponibles.
documentTypes | [documentType](#documenttype) | Listados de tipos de documento.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/documentTypes?offset=0&limit=10&appliesTo=F' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "documentTypes": {
    "documentType": [
      {
        "appliesToFI": "N",
        "documentTypeDescription": "CURP",
        "documentTypeId": 1,
        "format": "A",
        "mainDocument": true,
        "maximumLength": 18,
        "minimumLength": 18,
        "personType": "F",
        "shortDescription": "CURP"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "PASAPORTE",
        "documentTypeId": 3,
        "format": "A",
        "mainDocument": true,
        "maximumLength": 18,
        "minimumLength": 6,
        "personType": "F",
        "shortDescription": "PAS"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "LIBRETA DE ENROLAMIE",
        "documentTypeId": 6,
        "format": "N",
        "mainDocument": false,
        "maximumLength": 99,
        "minimumLength": 1,
        "personType": "F",
        "shortDescription": "LEN"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "CIA(ARGENT.C.DE ID.)",
        "documentTypeId": 7,
        "format": "N",
        "mainDocument": false,
        "maximumLength": 99,
        "minimumLength": 1,
        "personType": "F",
        "shortDescription": "CIA"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "Cadastro de Pessoas",
        "documentTypeId": 9,
        "format": "N",
        "mainDocument": true,
        "maximumLength": 99,
        "minimumLength": 1,
        "personType": "F",
        "shortDescription": "CPF"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "CIP(PARAG.C.DE ID.)",
        "documentTypeId": 10,
        "format": "N",
        "mainDocument": false,
        "maximumLength": 99,
        "minimumLength": 1,
        "personType": "F",
        "shortDescription": "CIP"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "D.N.I.",
        "documentTypeId": 11,
        "format": "N",
        "mainDocument": true,
        "maximumLength": 8,
        "minimumLength": 8,
        "personType": "F",
        "shortDescription": "DNI"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "III(OTRS.DOC.REST.P.",
        "documentTypeId": 12,
        "format": "N",
        "mainDocument": false,
        "maximumLength": 9,
        "minimumLength": 1,
        "personType": "F",
        "shortDescription": "III"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "LIBRETA CÍVICA",
        "documentTypeId": 13,
        "format": "N",
        "mainDocument": true,
        "maximumLength": 9,
        "minimumLength": 1,
        "personType": "F",
        "shortDescription": "LCI"
      },
      {
        "appliesToFI": "N",
        "documentTypeDescription": "Carnet Extranjería",
        "documentTypeId": 14,
        "format": "A",
        "mainDocument": true,
        "maximumLength": 12,
        "minimumLength": 9,
        "personType": "F",
        "shortDescription": "C.E."
      }
    ]
  },
  "hasNext": true
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details documentType

### documentType

::: center
Los campos del tipo de dato estructurado documentType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
appliesToFI | String $<(Length: 1)>$ | ¿Aplica para instituciones financieras? (S: Si, N: No, E: Exclusivo de instituciones financieras).
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
format | String $<(Length: 1)>$ | Formato.
mainDocument | Boolean | ¿Es documento principal?
maximumLength | Short $<(Length: 4)>$ | Largo máximo.
minimumLength | Byte $<(Length: 2)>$ | Largo mínimo.
personType | String $<(Length: 1)>$ | Tipo de persona (F: Física, J: Jurídica, A: Ambas).
shortDescription | String $<(Length: 5)>$ | Descripción corta del tipo de documento.
:::
<!-- CIERRA SDT -->
