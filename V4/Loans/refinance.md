---
title: Refinance
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para contratar una refinanciación.

**Nombre publicación:** PublicLoans.refinance

**Programa:** PublicAPI.BTLOPA0019

**Alcance:** Global

**Endpoint:** /public/Loans/v1/refinance
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
refinancingGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la refinanciación.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
geolocalization | [geolocalization](#geolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

No aplica.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Loans/v1/refinance?refinancingGUID=e7a3d240-91bc-4f82-b3e5-2a7c640d18f9&simulationGUID=a1d54c72-3f8b-4e20-91dc-6b83e5f029a4' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "geolocalization": {
    "latitude": -34.60376,
    "longitude": -58.38162,
    "timestamp": "2026-06-19T10:55:00.000000-03:00"
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
  "movementGUID": "f3c82b15-6a47-4d91-b0e2-8d51a930c7e6"
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