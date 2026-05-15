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


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
administrativeLevels | [SdtsBTCNWAdministrativeLevel](#sdtsbtcnwadministrativelevel) | Listado de niveles administrativos.

@tab Errores

Código | Descripción
:--------- | :-----------
50020021 | No existe el Id de primer nivel ingresado
50020028 | No existe el Id de segundo nivel ingresado
50020034 | No existe el Id de tercer nivel ingresado

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
    "Token": "3985F17F736C68B94646C7E6"
  },
  "countryId": 484,
  "firstLevel": "1",
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
    "Token": "3985F17F736C68B94646C7E6"
  },
  "administrativeLevels": {
    "administrativeLevel": [
      {
        "Id": 1,
        "Description": "Aguascalientes"
      },
      {
        "Id": 2,
        "Description": "Asientos"
      },
      {
        "Id": 3,
        "Description": "Calvillo"
      },
      {
        "Id": 4,
        "Description": "Cosio"
      },
      {
        "Id": 5,
        "Description": "Jesus Maria"
      },
      {
        "Id": 6,
        "Description": "Pabellon de Arteaga"
      },
      {
        "Id": 7,
        "Description": "Rincon de Romo"
      },
      {
        "Id": 8,
        "Description": "San Jose de Gracia"
      },
      {
        "Id": 9,
        "Description": "Tepezala"
      },
      {
        "Id": 10,
        "Description": "El Llano"
      },
      {
        "Id": 11,
        "Description": "San Francisco de los Romo"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:42:55",
    "Numero": 13466265,
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
