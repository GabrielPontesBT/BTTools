---
title: Ownership Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de titularidad dentro de una contraparte.

**Nombre publicación:** PublicCustomerParameters.ownershipTypes

**Programa:** PublicAPI.BTCPPA0015

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/ownershipTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
ownershipIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de tipo de titularidad.
ownershipDescriptionFilter | String $<(Length: 20)>$ | Filtro por descripción de tipo de titularidad.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
ownershipTypes | [ownershipType](#ownershiptype) | Listado de tipos de titularidad.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/CustomerParameters/v1/ownershipTypes?offset=0&limit=10' \
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
  "hasNext": false,
  "ownershipTypes": {
    "ownershipType": [
      {
        "ownershipTypeDescription": "TITULAR REPRESENTAT.",
        "ownershipTypeId": 1
      },
      {
        "ownershipTypeDescription": "TITULAR NO REPRESENT",
        "ownershipTypeId": 2
      },
      {
        "ownershipTypeDescription": "FIADOR SOLIDARIO",
        "ownershipTypeId": 4
      },
      {
        "ownershipTypeDescription": "APODERADO",
        "ownershipTypeId": 5
      },
      {
        "ownershipTypeDescription": "COTITULAR",
        "ownershipTypeId": 6
      },
      {
        "ownershipTypeDescription": "ACCIONISTA",
        "ownershipTypeId": 7
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details ownershipType

### ownershipType

::: center
Los campos del tipo de dato estructurado ownershipType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
ownershipTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de titularidad.
ownershipTypeDescription | String $<(Length: 20)>$ | Descripción de tipo de titularidad.
:::
<!-- CIERRA SDT -->
