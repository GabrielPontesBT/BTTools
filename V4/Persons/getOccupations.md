---
title: Get Occupations
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las ocupaciones de una persona.

**Nombre publicación:** PublicPersons.getOccupations

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0033

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
occupations | [SdtsBTPEWOccupation](#sdtsbtpewoccupation) | Listado de ocupaciones.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.

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
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9"
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
  "occupations": {
    "occupation": [
      {
        "Correlative": 1,
        "OccupationId": 1,
        "OccupationDescription": "EMPLEADO",
        "JobTitleId": 19,
        "JobTitleDescription": "ACCIONISTA",
        "Multilateral": false,
        "CompanyDocument": "",
        "CompanyName": "DIENTE LOPEZ",
        "StartDate": "2024-01-01",
        "EndDate": "",
        "EconomicActivityId": 97000,
        "EconomicActivityDescription": "FAMILIAS",
        "EconomicActivityTypeId": 65,
        "EconomicActivityTypeDescription": "FAMILIAS",
        "MainOccupation": true,
        "Imports": false,
        "Exports": false,
        "EstablishmentTypeId": 2,
        "EstablishmentTypeDescription": "ESTABLECIMIENTO / LOCAL",
        "OccupationTypeId": 1,
        "OccupationTypeDescription": "DEPENDIENTE",
        "Income": "90000.00"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:12",
    "Numero": 13469354,
    "Servicio": "PublicPersons.getOccupations",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWOccupation

### SdtsBTPEWOccupation

::: center
Los campos del tipo de dato estructurado SdtsBTPEWOccupation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CompanyDocument | String $<(Length: 25)>$ | Documento de empresa.
CompanyName | String $<(Length: 70)>$ | Nombre de empresa.
Correlative | Byte $<(Length: 2)>$ | Correlativo.
EconomicActivityId | Long $<(Length: 11)>$ | Identificador de actividad económica.
EconomicActivityDescription | String $<(Length: 80)>$ | Descripción de actividad económica.
EconomicActivityTypeId | Long $<(Length: 15)>$ | Identificador del tipo de actividad económica.
EconomicActivityTypeDescription | String $<(Length: 60)>$ | Descripción del tipo de actividad económica.
EndDate | Date $<(Length: 8)>$ | Fecha de fin.
EstablishmentTypeId | Int $<(Length: 6)>$ | Identificador del tipo de establecimiento.
EstablishmentTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de establecimiento.
Exports | Boolean | Exporta.
Imports | Boolean | Importa.
Income | Double $<(Length: 18)>$ | Ingresos.
JobTitleId | Short $<(Length: 4)>$ | Identificador del cargo.
JobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo.
MainOccupation | Boolean | Ocupación principal.
Multilateral | Boolean | Multilateral.
OccupationId | Int $<(Length: 5)>$ | Identificador de ocupación.
OccupationDescription | String $<(Length: 30)>$ | Descripción de la ocupación.
OccupationTypeId | Short | Identificador del tipo de ocupación.
OccupationTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de ocupación.
StartDate | Date $<(Length: 8)>$ | Fecha de inicio.
:::
<!-- CIERRA SDT -->
