---
title: Create
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contratar una cuenta de ahorro.

**Nombre publicación:** PublicSavingAccounts.create

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.
productGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.
subAccountName | String $<(length: 255)>$ | Nombre de la subcuenta.
branchId | Int $<(length: 5)>$ | Identificador de sucursal.
signatureType | String $<(length: 1)>$ | Tipo de integración.
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | Datos de geolocalización.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

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
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "counterpartyGUID": "",
  "productGUID": "dd98b54d-73d9-4248-b760-5e62b24617ac",
  "subAccountName": "",
  "branchId": 0,
  "signatureType": "",
  "geolocalization": {
    "latitude": 0,
    "longitude": 0,
    "timestamp": ""
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
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "savingAccountGUID": "00000000-0000-0000-0000-000000000000",
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 140010005,
        "Severity": "E",
        "Target": "",
        "Description": "Debe ingresar la contraparte"
      }
    ]
  },
  "Btoutreq": {
    "Estado": "NEG_ERROR",
    "Fecha": "2026-05-22",
    "Hora": "15:56:37",
    "Numero": 13505892,
    "Servicio": "PublicSavingAccounts.create",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTGeolocalization

### SdtsBTGeolocalization

::: center
Los campos del tipo de dato estructurado SdtsBTGeolocalization son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
latitude | Double | Latitud.
longitude | Double $<(length: 11)>$ | Longitud.
timestamp | String $<(length: 35)>$ | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM
:::
<!-- CIERRA SDT -->
