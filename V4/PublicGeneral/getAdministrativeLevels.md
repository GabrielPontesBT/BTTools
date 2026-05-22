---
title: Get Administrative Levels
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
    "Token": "E7227F065D421A5B5267C8DB"
  },
  "countryId": 4,
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
    "Token": "E7227F065D421A5B5267C8DB"
  },
  "administrativeLevels": {
    "administrativeLevel": [
      {
        "Id": 1,
        "Description": "Primer"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-22",
    "Hora": "17:19:18",
    "Numero": 13506048,
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
