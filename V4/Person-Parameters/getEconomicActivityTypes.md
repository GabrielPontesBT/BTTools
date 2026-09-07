---
title: Economic Activity Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de actividades económicas.

**Nombre publicación:** PublicPersonParameters.economicActivityTypes

**Programa:** PublicAPI.BTPEPA0024

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/economicActivityTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
economicActivityTypeIdFilter | Long $<(Length: 15)>$ | Filtro por identificador de tipo de actividad económica.
economicActivityTypeDescriptionFilter | String $<(Length: 60)>$ | Filtro por descripción de tipo de actividad económica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
economicActivityTypes | [economicActivityType](#economicactivitytype) | Listado de tipos de actividades economicas.

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
  '{{baseUrl}}/public/PersonParameters/v1/economicActivityTypes?offset=0&limit=10' \
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
  "economicActivityTypes": {
    "economicActivityType": [
      {
        "economicActivityTypeDescription": "PRODUCCIÓN VEGETAL",
        "economicActivityTypeId": 1
      },
      {
        "economicActivityTypeDescription": "PRODUCCION ANIMAL",
        "economicActivityTypeId": 2
      },
      {
        "economicActivityTypeDescription": "EXPLOTACION AGRICOLA-GANADERA",
        "economicActivityTypeId": 3
      },
      {
        "economicActivityTypeDescription": "OTROS SERVICIOS AGROPECUARIOS",
        "economicActivityTypeId": 4
      },
      {
        "economicActivityTypeDescription": "CAZA Y REPOBLAC.ANIM. DE CAZA Y SERV.CONEXOS",
        "economicActivityTypeId": 5
      },
      {
        "economicActivityTypeDescription": "SILVICULT.,EXTRACC.DE MADERA Y SERV. CONEXOS",
        "economicActivityTypeId": 6
      },
      {
        "economicActivityTypeDescription": "PESCA, EXPLOT.CRIAD.PECES,SERV.RELAC.PESCA",
        "economicActivityTypeId": 7
      },
      {
        "economicActivityTypeDescription": "EXTRAC. CARBON, LIGNITO Y TURBA",
        "economicActivityTypeId": 8
      },
      {
        "economicActivityTypeDescription": "EXTRAC. PETROLEO CRUDO Y GAS NATURAL",
        "economicActivityTypeId": 9
      },
      {
        "economicActivityTypeDescription": "EXTRAC. DE MINERALES DE URANIO Y TORIO",
        "economicActivityTypeId": 10
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
::: details economicActivityType

### economicActivityType

::: center
Los campos del tipo de dato estructurado economicActivityType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
economicActivityTypeId | Long $<(Length: 15)>$ | Identificador de tipo de actividad económica.
economicActivityTypeDescription | String $<(Length: 60)>$ | Descripción de tipo de actividad económica.
:::
<!-- CIERRA SDT -->
