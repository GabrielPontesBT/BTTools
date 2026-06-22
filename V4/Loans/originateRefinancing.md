---
title: Originate Refinancing
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contabilizar una refinanciación.

**Nombre publicación:** PublicLoans.originateRefinancing

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0019

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
refinancingGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la refinanciación.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
120020061 | No existen datos de simulación.
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
  "refinancingGUID": "e7a3d240-91bc-4f82-b3e5-2a7c640d18f9",
  "simulationGUID": "a1d54c72-3f8b-4e20-91dc-6b83e5f029a4",
  "geolocalization": {
    "latitude": -34.60376,
    "longitude": -58.38162,
    "timestamp": "2026-06-19T10:55:00.000000-03:00"
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
  "movementGUID": "f3c82b15-6a47-4d91-b0e2-8d51a930c7e6",
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-19",
    "Hora": "10:55:12",
    "Numero": "10048347",
    "Servicio": "PublicLoans.originateRefinancing",
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
