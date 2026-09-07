---
title: Economic Activities
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de las actividades económicas.

**Nombre publicación:** PublicPersonParameters.economicActivities

**Programa:** PublicAPI.BTPEPA0025

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/economicActivities
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
economicActivityIdFilter | Long $<(Length: 11)>$ | Filtro por identificador de actividad económica.
economicActivityDescriptionFilter | String $<(Length: 80)>$ | Filtro por descripción de actividad económica.
economicActivityTypeId | Long $<(Length: 15)>$ | Identificador de tipo de actividad económica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
economicActivities | [economicActivity](#economicactivity) | Listado de actividades económicas.

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
  '{{baseUrl}}/public/PersonParameters/v1/economicActivities?offset=0&limit=10' \
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
  "economicActivities": {
    "economicActivity": [
      {
        "economicActivityDescription": "ARROZ",
        "economicActivityId": 1111,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "TRIGO",
        "economicActivityId": 1112,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "OLEAGINOSOS",
        "economicActivityId": 1113,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "CEBADA",
        "economicActivityId": 1114,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "CUL.DE HORT.Y LEG.,ESPECIALI. HORTICOL. Y PRO.DE VIVERO",
        "economicActivityId": 1120,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "FRUTICUL.(EXC. VITICUL.),PLANTAS PARA PREP.BEB.Y ESPEC.",
        "economicActivityId": 1131,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "VITICULTURA",
        "economicActivityId": 1132,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "OTROS CULTIVOS",
        "economicActivityId": 1133,
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityDescription": "EXPLOTACION GANADERA (EXCEPTO LECHERIA)",
        "economicActivityId": 1211,
        "economicActivityTypeDescription": "PRODUCCION ANIMAL",
        "economicActivityTypeId": 2
      },
      {
        "economicActivityDescription": "EXPLOTACION LECHERA",
        "economicActivityId": 1212,
        "economicActivityTypeDescription": "PRODUCCION ANIMAL",
        "economicActivityTypeId": 2
      }
    ]
  },
  "hasNext": false
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details economicActivity

### economicActivity

::: center
Los campos del tipo de dato estructurado economicActivity son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
economicActivityId | Long $<(Length: 11)>$ | Identificador de actividad.
economicActivityDescription | String $<(Length: 80)>$ | Descripción de actividad económica.
economicActivityTypeId | Long $<(Length: 15)>$ | Identificador de tipo de actividad económica.
economicActivityTypeDescription | String $<(Length: 60)>$ | Descripción de tipo de actividad económica.
:::
<!-- CIERRA SDT -->
