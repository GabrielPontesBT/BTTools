---
title: Obtener Actividades
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el listado de actividades según el tipo de actividad.
Este servicio devuelve las actividades asociadas a un `activityTypeId`.

**Nombre publicación:** PublicPersons.getActivities

**Programa:** No aplica

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
activityTypeId | Integer | Identificador del tipo de actividad.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
activities | Array | Lista de actividades.

@tab Errores

Código | Descripción
:--------- | :-----------
10011 | Sesión inválida.
10002 | Error en la ejecución del programa.
<!-- SE PUEDEN AGREGAR MÁS A MANO SEGÚN PRUEBAS -->
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getActivities' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "3EC694B13A51DE074F8EC7FC"
  },
  "activityTypeId": "1"
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "3EC694B13A51DE074F8EC7FC"
  },
  "activities": {
    "activitiesItem": [
      {
        "ActivityId": "1111",
        "ActivityDescription": "ARROZ",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1112",
        "ActivityDescription": "TRIGO",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1113",
        "ActivityDescription": "OLEAGINOSOS",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1114",
        "ActivityDescription": "CEBADA",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1120",
        "ActivityDescription": "CUL.DE HORT.Y LEG.,ESPECIALI. HORTICOL. Y PRO.DE VIVERO",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1131",
        "ActivityDescription": "FRUTICUL.(EXC. VITICUL.),PLANTAS PARA PREP.BEB.Y ESPEC.",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1132",
        "ActivityDescription": "VITICULTURA",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityId": "1133",
        "ActivityDescription": "OTROS CULTIVOS",
        "ActivityTypeId": "1",
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-16",
    "Hora": "13:54:20",
    "Numero": "13003807",
    "Servicio": "PublicPersons.getActivities",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details activity

### activity

::: center
Los campos del tipo de dato estructurado activity son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ActivityId | String |
ActivityDescription | String |
ActivityTypeId | String |
ActivityTypeDescription | String |
:::
<!-- CIERRA SDT -->
