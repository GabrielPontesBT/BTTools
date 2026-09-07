---
title: Renew
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para contratar una renovación.

**Nombre publicación:** PublicLoans.renew

**Programa:** PublicAPI.BTLOPA0020

**Alcance:** Global

**Endpoint:** /public/Loans/v1/renew
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
increaseGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación de las operaciones a cancelar.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.
disbursementAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de desembolso.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto.
geolocalization | [geolocalization](#geolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :---------
120050001 | Debe ingresar el GUID de préstamo.
180040003 | Debe ingresar el GUID de la cuenta de débito.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Loans/v1/renew?increaseGUID=c2f91a84-5e3d-4b70-a8f1-d93e720c64b5&simulationGUID=a1d54c72-3f8b-4e20-91dc-6b83e5f029a4&disbursementAccountGUID=95f6c6fb-6028-4ec5-b6c5-41612225ae15' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "amount": 50000,
  "geolocalization": {
    "latitude": -34.60376,
    "longitude": -58.38162,
    "timestamp": "2026-06-19T11:03:00.000000-03:00"
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
  "movementGUID": "b72f3e91-4c58-4d02-a6b8-1e95d720f4c3"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details geolocalization

### geolocalization

::: center
Los campos del tipo de dato estructurado geolocalization son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
latitude | Double $<(Length: 11.8)>$ | Latitud.
longitude | Double $<(Length: 11.8)>$ | Longitud.
timestamp | String $<(Length: 35)>$ | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM.
:::
<!-- CIERRA SDT -->
