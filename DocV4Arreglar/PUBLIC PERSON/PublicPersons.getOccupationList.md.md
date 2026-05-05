---
title: Obtener Lista de Ocupaciones
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
::: note Método para obtener la lista de ocupaciones.
Este servicio devuelve el listado de ocupaciones y su tipo asociado (dependiente, independiente, otro).

**Nombre publicación:** PublicPersons.getOccupationList

**Módulo:** No informado

**Programa:** No informado

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
occupations | Array | Listado de ocupaciones.
OccupationId | Int | Identificador de ocupación.
OccupationDescription | String | Descripción de la ocupación.
OccupationTypeId | Int | Identificador del tipo de ocupación.
OccupationTypeDescription | String | Descripción del tipo de ocupación.

@tab Errores

Código | Descripción
:--------- | :-----------
<!-- SE DEBEN AGREGAR A MANO -->
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getOccupationList' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "5C76D6616CC01A47AC96F8CF"
  }
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
    "Token": "5C76D6616CC01A47AC96F8CF"
  },
  "occupations": {
    "occupationsItem": [
      {
        "OccupationId": "1",
        "OccupationDescription": "EMPLEADO",
        "OccupationTypeId": "1",
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": "2",
        "OccupationDescription": "OBRERO",
        "OccupationTypeId": "1",
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": "3",
        "OccupationDescription": "EMPRESARIO",
        "OccupationTypeId": "2",
        "OccupationTypeDescription": "INDEPENDIENTE"
      },
      {
        "OccupationId": "4",
        "OccupationDescription": "JUBILADO/PENSIONISTA",
        "OccupationTypeId": "3",
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": "5",
        "OccupationDescription": "AMA DE CASA",
        "OccupationTypeId": "3",
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": "6",
        "OccupationDescription": "MILITAR",
        "OccupationTypeId": "1",
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": "7",
        "OccupationDescription": "POLICÍA",
        "OccupationTypeId": "1",
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": "8",
        "OccupationDescription": "AGROPECUARIO",
        "OccupationTypeId": "2",
        "OccupationTypeDescription": "INDEPENDIENTE"
      },
      {
        "OccupationId": "9",
        "OccupationDescription": "ESTUDIANTE",
        "OccupationTypeId": "3",
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": "10",
        "OccupationDescription": "PROFESIONAL INDEPENDIENTE",
        "OccupationTypeId": "2",
        "OccupationTypeDescription": "INDEPENDIENTE"
      },
      {
        "OccupationId": "11",
        "OccupationDescription": "EMPLEADO DE LA INSTITUCION",
        "OccupationTypeId": "1",
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": "12",
        "OccupationDescription": "OTROS",
        "OccupationTypeId": "3",
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": "21",
        "OccupationDescription": "OTROS",
        "OccupationTypeId": "3",
        "OccupationTypeDescription": "OTRO"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-16",
    "Hora": "15:07:46",
    "Numero": "13004454",
    "Servicio": "PublicPersons.getOccupationList",
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
::: details occupation

### occupation

::: center
Los campos del tipo de dato estructurado occupation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
OccupationId | String |
OccupationDescription | String |
OccupationTypeId | String |
OccupationTypeDescription | String |
:::
<!-- CIERRA SDT -->
