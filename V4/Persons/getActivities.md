---
title: Get Activities
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las actividades.

**Nombre publicación:** PublicPersons.getActivities

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0025

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
activityTypeId | Long $<(Length: 15)>$ | Identificador de tipo de actividad.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
activities | [SdtsBTPEWActivity](#sdtsbtpewactivity) | Listado de actividades.

@tab Errores

Código | Descripción
:--------- | :-----------
No aplica.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "activityTypeId": 1
}'
```
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "activities": {
    "activity": [
      {
        "ActivityId": 1111,
        "ActivityDescription": "ARROZ",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1112,
        "ActivityDescription": "TRIGO",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1113,
        "ActivityDescription": "OLEAGINOSOS",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1114,
        "ActivityDescription": "CEBADA",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1120,
        "ActivityDescription": "CUL.DE HORT.Y LEG.,ESPECIALI. HORTICOL. Y PRO.DE VIVERO",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1131,
        "ActivityDescription": "FRUTICUL.(EXC. VITICUL.),PLANTAS PARA PREP.BEB.Y ESPEC.",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1132,
        "ActivityDescription": "VITICULTURA",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": 1133,
        "ActivityDescription": "OTROS CULTIVOS",
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:33",
    "Numero": 13469365,
    "Servicio": "PublicPersons.getActivities",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWActivity

### SdtsBTPEWActivity

::: center
Los campos del tipo de dato estructurado SdtsBTPEWActivity son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ActivityId | Long $<(Length: 11)>$ | Identificador de la actividad.
ActivityDescription | String $<(Length: 80)>$ | Descripción de la actividad.
ActivityTypeId | Long $<(Length: 15)>$ | Identificador del tipo de actividad.
ActivityTypeDescription | String $<(Length: 60)>$ | Descripción del tipo de actividad.
:::
<!-- CIERRA SDT -->
