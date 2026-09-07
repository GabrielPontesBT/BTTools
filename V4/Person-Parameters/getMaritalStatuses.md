---
title: Marital Statuses
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los estados civiles.

**Nombre publicación:** PublicPersonParameters.maritalStatuses

**Programa:** PublicAPI.BTPEPA0006

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/maritalStatuses
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
maritalStatusIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de estado civil.
maritalStatusDescriptionFilter | String $<(Length: 20)>$ | Filtro por descripción de estado civil.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
maritalStatuses | [maritalStatus](#maritalstatus) | Listado de estados civiles.

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
  '{{baseUrl}}/public/PersonParameters/v1/maritalStatuses?offset=0&limit=10' \
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
  "maritalStatuses": {
    "maritalStatus": [
      {
        "maritalStatusDescription": "SOLTERO/A",
        "maritalStatusId": 1,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "CASADO/A",
        "maritalStatusId": 2,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "SEPARADO/A",
        "maritalStatusId": 3,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "VIUDO/A",
        "maritalStatusId": 4,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "DIVORCIADO/A",
        "maritalStatusId": 5,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "CONCUBINO/A",
        "maritalStatusId": 6,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "CASADO C/SEP.DE BIEN",
        "maritalStatusId": 7,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "UNIÓN LIBRE",
        "maritalStatusId": 8,
        "requiresSpouse": false
      },
      {
        "maritalStatusDescription": "OTROS",
        "maritalStatusId": 9,
        "requiresSpouse": false
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details maritalStatus

### maritalStatus

::: center
Los campos del tipo de dato estructurado maritalStatus son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
maritalStatusId | Byte $<(Length: 2)>$ | Identificador de estado civil.
maritalStatusDescription | String $<(Length: 20)>$ | Descripción de estado civil?
requiresSpouse | Boolean | ¿Requiere cónyuge?
:::
<!-- CIERRA SDT -->
