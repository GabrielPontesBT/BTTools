---
title: Obtener Administrative Levels [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los niveles administrativos de un país.

**Nombre publicación:** PublicGeneral.getAdministrativeLevels

**Módulo:** General

**Programa:** PublicAPI.BTCNPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
countryId | Short $<(length: 3)>$ | Identificador de país.
firstLevel | Int $<(length: 5)>$ | Identificador de primer nivel administrativo.
secondLevel | Int $<(length: 5)>$ | Identificador de segundo nivel administrativo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
administrativeLevels | [SdtsBTCNWAdministrativeLevel](#sdtsbtcnwadministrativelevel) | Listado de niveles administrativos.

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

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
    "Token": "907FDCD8173D3FB297F702B1"
  },
  "countryId": 484,
  "firstLevel": 0,
  "secondLevel": 0
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
    "Token": "907FDCD8173D3FB297F702B1"
  },
  "administrativeLevels": {
    "administrativeLevel": [
      {
        "Id": 1,
        "Description": "AGUASCALIENTES"
      },
      {
        "Id": 2,
        "Description": "BAJA CALIFORNIA"
      },
      {
        "Id": 3,
        "Description": "BAJA CALIFORNIA SUR"
      },
      {
        "Id": 4,
        "Description": "CAMPECHE"
      },
      {
        "Id": 5,
        "Description": "COAHUILA DE ZARAGOZA"
      },
      {
        "Id": 6,
        "Description": "COLIMA"
      },
      {
        "Id": 7,
        "Description": "CHIAPAS"
      },
      {
        "Id": 8,
        "Description": "CHIHUAHUA"
      },
      {
        "Id": 9,
        "Description": "CIUDAD DE MÉXICO"
      },
      {
        "Id": 10,
        "Description": "DURANGO"
      },
      {
        "Id": 11,
        "Description": "GUANAJUATO"
      },
      {
        "Id": 12,
        "Description": "GUERRERO"
      },
      {
        "Id": 13,
        "Description": "HIDALGO"
      },
      {
        "Id": 14,
        "Description": "JALISCO"
      },
      {
        "Id": 15,
        "Description": "ESTADO DE MÉXICO"
      },
      {
        "Id": 16,
        "Description": "MICHOACAN DE OCAMPO"
      },
      {
        "Id": 17,
        "Description": "MORELOS"
      },
      {
        "Id": 18,
        "Description": "NAYARIT"
      },
      {
        "Id": 19,
        "Description": "NUEVO LEON"
      },
      {
        "Id": 20,
        "Description": "OAXACA"
      },
      {
        "Id": 21,
        "Description": "PUEBLA"
      },
      {
        "Id": 22,
        "Description": "QUERETARO"
      },
      {
        "Id": 23,
        "Description": "QUINTANA ROO"
      },
      {
        "Id": 24,
        "Description": "SAN LUIS POTOSI"
      },
      {
        "Id": 25,
        "Description": "SINALOA"
      },
      {
        "Id": 26,
        "Description": "SONORA"
      },
      {
        "Id": 27,
        "Description": "TABASCO"
      },
      {
        "Id": 28,
        "Description": "TAMAULIPAS"
      },
      {
        "Id": 29,
        "Description": "TLAXCALA"
      },
      {
        "Id": 30,
        "Description": "VERACRUZ"
      },
      {
        "Id": 31,
        "Description": "YUCATAN"
      },
      {
        "Id": 32,
        "Description": "ZACATECAS"
      },
      {
        "Id": 33,
        "Description": "EXTRANJERO"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:19:10",
    "Numero": 13466219,
    "Servicio": "PublicGeneral.getAdministrativeLevels",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**
<!-- ABRE SDT -->
::: details SdtsBTCNWAdministrativeLevel

### SdtsBTCNWAdministrativeLevel

::: center
Los campos del tipo de dato estructurado SdtsBTCNWAdministrativeLevel son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Int $<(length: 9)>$ | Identificador.
Description | String $<(length: 30)>$ | Descripción.
:::
<!-- CIERRA SDT -->
