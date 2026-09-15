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
Completar manualmente | Completar manualmente

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/documentTypes' \
  -H 'Authorization: Bearer {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "path": "/api/publicapi/public/General/v1/documentTypes",
  "status": 404,
  "error": "Not Found",
  "timestamp": "2026-09-11T14:19:14.05272784",
  "messages": {
    "global": "No static resource public/General/v1/documentTypes for request '/api/publicapi/public/General/v1/documentTypes'."
  }
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
