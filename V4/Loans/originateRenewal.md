---
title: Originate Renewal
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contabilizar una renovación.

**Nombre publicación:** PublicLoans.originateRenewal

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0020

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
increaseGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación de las operaciones a cancelar.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.
disbursmentAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de desembolso.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto.
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
120050001 | Debe ingresar el GUID de préstamo.
180040003 | Debe ingresar el GUID de la cuenta de débito.
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
    "Token": "23B342928917607ECECF65BD"
  },
  "increaseGUID": "c2f91a84-5e3d-4b70-a8f1-d93e720c64b5",
  "simulationGUID": "a1d54c72-3f8b-4e20-91dc-6b83e5f029a4",
  "disbursmentAccountGUID": "d6e20c53-8b1f-4a97-b72e-3f94c810d5a1",
  "amount": 50000.00,
  "geolocalization": {
    "latitude": -34.60376,
    "longitude": -58.38162,
    "timestamp": "2026-06-19T11:03:00.000000-03:00"
  }
}
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
    "Token": "23B342928917607ECECF65BD"
  },
  "movementGUID": "b72f3e91-4c58-4d02-a6b8-1e95d720f4c3",
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-19",
    "Hora": "11:03:18",
    "Numero": "10048365",
    "Servicio": "PublicLoans.originateRenewal",
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
