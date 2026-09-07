---
title: Initiate
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para contratar un préstamo.

**Nombre publicación:** PublicLoans.initiate

**Programa:** PublicAPI.BTLOPA0013

**Alcance:** Global

**Endpoint:** /public/Loans/v1/initiate
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.
savingAccountAccreditationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de acreditación.
savingAccountCollectionGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de cobro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
geolocalization | [geolocalization](#geolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :---------
120020061 | No existen datos de simulación
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Loans/v1/initiate?simulationGUID=a1699f90-88ea-441e-af8a-e0f24e6007d0&savingAccountAccreditationGUID=886acfe3-5d00-4dca-b6b3-e99282489697&savingAccountCollectionGUID=0413e9fa-801f-40e4-b6ef-8396eebed5a8' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "geolocalization": {
    "latitude": -34.9058916,
    "longitude": -56.1913095,
    "timestamp":"2024-12-13T11:59:27.904674-03:00",
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
  "loanGUID": "1e82feda-bff9-4b3d-af54-c36ac65e7b9b",
  "movementGUID": "bba5fbe6-de9f-4c8d-854b-8adfcb32af09"
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
