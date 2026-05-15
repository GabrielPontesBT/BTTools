---
title: Actualizar Dirección [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar los datos del domicilio de una persona.

**Nombre publicación:** PublicPersons.updateAddress

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0015

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(length: 36)>$ | GUID (identificador único global) de la persona.


@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
address | [SdtsBTPEWAddress](#sdtsbtpewaddress) | Domicilio.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40010008 | País incorrecto
40010043 | No existe el domicilio ingresado
40010046 | La fecha de ubicación no puede ser mayor a la fecha de apertura
40010047 | Debe ingresar un país para el domicilio
40010048 | Debe ingresar un departamento para el domicilio
40010049 | Debe ingresar una ciudad para el domicilio
40010053 | La latitud debe ser un valor entre -90 y 90
40010054 | La longitud debe ser un valor entre -90 y 90
40010055 | Tercer nivel de división administrativa inexistente
40010056 | Segundo nivel de división administrativa inexistente
40010057 | Primer nivel de división administrativa inexistente
40010067 | Cuarto nivel de agrupación inexistente
40010068 | Tercer nivel de agrupación inexistente
40010069 | Segundo nivel de agrupación inexistente
40010070 | Primer nivel de agrupación inexistente
40010092 | Debe ingresar un correlativo de domicilio
40010237 | Debe ingresar un código de Tipo de Domicilio comprendido entre 1 y 99
40010241 | El Tipo de Domicilio no existe
40010251 | El Tipo de Vivienda no existe
40010353 | Existe inconsistencia de datos con el campo ? en la RNG ??
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
40050001 | Debe ingresar el GUID de persona.
40050100 | Debe ingresar el GUID de contraparte.
50050003 | No se encuentra la empresa
99990010006 | No se pudo resolver el usuario
99990010007 | No se pudo resolver la empresa

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
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9",
  "address": {
    "AddressCorrelative": 1,
    "AddressTypeId": 1,
    "AddressTypeDescription": "RESIDENCIA",
    "HousingTypeId": 5,
    "HousingTypeDescription": "FAMILIAR",
    "IsABusiness": true,
    "SinceDate": "2022-01-01",
    "Level1Id": 1,
    "Level1Description": "AVENIDA",
    "Level1Data": "JOSE BENITO LAMAS",
    "Level2Id": 1,
    "Level2Description": "NO. PUERTA",
    "Level2Data": "2233",
    "Level3Id": 1,
    "Level3Description": "APTO",
    "Level3Data": "14",
    "Level4Id": 1,
    "Level4Description": "X",
    "Level4Data": "",
    "Address": "AVENIDA JOSE BENITO LAMAS NO. PUERTA 2233 APTO 14 X",
    "References": "",
    "Latitude": "0.000000",
    "Longitude": "0.000000",
    "CountryId": 604,
    "CountryDescription": "México",
    "DepartmentId": 1,
    "DepartmentDescription": "Amazonas",
    "CityId": 101,
    "CityDescription": "Chachapoyas",
    "DistrictId": 10119,
    "DistrictDescription": "San Isidro de Maino",
    "ColonyId": 0,
    "GeographicalUbication": "",
    "PostalCode": "9999",
    "SettlementType": 0,
    "StatusId": "H",
    "MainAddress": true
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
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:56:07",
    "Numero": 13469379,
    "Servicio": "PublicPersons.updateAddress",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWAddress

### SdtsBTPEWAddress

::: center
Los campos del tipo de dato estructurado SdtsBTPEWAddress son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address | String $<(length: 140)>$ | Dirección.
AddressCorrelative | Short $<(length: 3)>$ | Correlativo de dirección.
AddressTypeId | Byte $<(length: 2)>$ | Identificador del tipo de dirección.
AddressTypeDescription | String $<(length: 20)>$ | Descripción del tipo de dirección.
CityId | Int $<(length: 5)>$ | Identificador de la ciudad.
CityDescription | String | Descripción de la ciudad.
ColonyId | Int $<(length: 9)>$ | Identificador de la colonia.
CountryId | Short $<(length: 3)>$ | Identificador del país.
CountryDescription | String | Descripción del país.
DepartmentId | Int $<(length: 5)>$ | Identificador del departamento.
DepartmentDescription | String | Descripción del departamento.
DistrictId | Int $<(length: 9)>$ | Identificador del distrito.
DistrictDescription | String | Descripción del distrito.
GeographicalUbication | String $<(length: 6)>$ | Ubicación geográfica.
HousingTypeId | Byte $<(length: 2)>$ | Identificador del tipo de vivienda.
HousingTypeDescription | String | Descripción del tipo de vivienda.
IsABusiness | Boolean $<(length: 1)>$ | ¿Es un negocio?.
Latitude | Double $<(length: 10)>$ | Latitud.
Level1Data | String $<(length: 30)>$ | Datos del nivel 1.
Level1Id | Short $<(length: 3)>$ | Identificador del nivel 1.
Level1Description | String $<(length: 35)>$ | Descripción del nivel 1.
Level2Data | String $<(length: 30)>$ | Datos del nivel 2.
Level2Id | Short $<(length: 3)>$ | Identificador del nivel 2.
Level2Description | String $<(length: 35)>$ | Descripción del nivel 2.
Level3Data | String $<(length: 30)>$ | Datos del nivel 3.
Level3Id | Short $<(length: 3)>$ | Identificador del nivel 3.
Level3Description | String $<(length: 35)>$ | Descripción del nivel 3.
Level4Data | String $<(length: 30)>$ | Datos del nivel 4.
Level4Id | Short $<(length: 3)>$ | Identificador del nivel 4.
Level4Description | String $<(length: 35)>$ | Descripción del nivel 4.
Longitude | Double $<(length: 10)>$ | Longitud.
MainAddress | Boolean $<(length: 1)>$ | Dirección principal.
PostalCode | String $<(length: 8)>$ | Código postal.
References | String $<(length: 140)>$ | Referencias.
SettlementType | Short $<(length: 3)>$ | Tipo de asentamiento.
SinceDate | Date $<(length: 8)>$ | Fecha desde.
StatusId | String $<(length: 1)>$ | Identificador de estado.
:::
<!-- CIERRA SDT -->