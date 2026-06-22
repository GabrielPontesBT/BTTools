---
title: Transfer Section Balance
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para transferir desde o hacia un apartado.

**Nombre publicación:** PublicSavingAccounts.transferSectionBalance

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0012

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sectionGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Saldo.
reference | String $<(Length: 40)>$ | Referencia.
transferMode | String $<(Length: 3)>$ | Modo de transferencia.
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | Datos de geolocalización.

@tab Datos de Salida

No aplica.

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
    "Token": "C004FACBFC2507D9B6B9A13E"
  },
  "sectionGUID": "0a1b8daf-ace1-40b9-a5fe-366c1e117193",
  "amount": "50",
  "reference": "Ahorros",
  "transferMode": "INC",
  "geolocalization": {
    "latitude": -45.123456,
    "longitude": -33.123455,
    "timestamp": "2026-06-14T12:16:00UTC-3"
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
    "Token": "C004FACBFC2507D9B6B9A13E"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:45:56",
    "Numero": 13585059,
    "Servicio": "PublicSavingAccounts.transferSectionBalance",
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
longitude | Double $<(Length: 11.8)>$ | Longitud.
timestamp | String $<(Length: 35)>$ | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM.
:::
<!-- CIERRA SDT -->
