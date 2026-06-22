---
title: Currency Exchange
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para realizar cambio de moneda.

**Nombre publicación:** PublicSavingAccounts.currencyExchange

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0014

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
originData | [SdtsBTSAPAOriginData](#sdtsbtsapaorigindata) | Datos del origen.
exchangeRate | Double $<(Length: 15.8)>$ | Tipo de cambio.
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

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
    "Token": "AD704D941B64FADDB9349539"
  },
  "counterpartyGUID": "eb862bab-1233-48d2-8a36-7e37f8f2ae67",
  "originData": {
    "amout": "3000",
    "reference": "Cambio moneda",
    "savingAccountGUIDOrigin": "1923a066-cf5b-452c-8cf2-a2b2d8b5a0c3"
  },
  "exchangeRate": "40.56",
  "geolocalization": {
    "latitude": "-21.542233",
    "longitude": "-39.542133",
    "timestamp": "2026-06-19T13:02:00UTC-3"
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
    "Token": "AD704D941B64FADDB9349539"
  },
  "movementGUID": "d7890f4f-4569-4d33-b0b1-25a4d66e8150",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-19",
    "Hora": "16:01:20",
    "Numero": 13603444,
    "Servicio": "PublicSavingAccounts.currencyExchange",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTSAPAOriginData

### SdtsBTSAPAOriginData

::: center
Los campos del tipo de dato estructurado SdtsBTSAPAOriginData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amout | Double $<(Length: 18.2)>$ | Importe.
reference | String $<(Length: 40)>$ | Referencia.
savingAccountGUIDOrigin | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de origen.
:::

::: details SdtsBTGeolocalization

### SdtsBTGeolocalization

::: center
Los campos del tipo de dato estructurado SdtsBTGeolocalization son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
latitude | Double | Latitud.
longitude | Double $<(Length: 11.8)>$ | Longitud.
timestamp | String $<(Length: 35)>$ | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM.
:::
<!-- CIERRA SDT -->
