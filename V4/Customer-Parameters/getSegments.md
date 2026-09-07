---
title: Segments
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de segmentos.

**Nombre publicación:** PublicCustomerParameters.segments

**Programa:** PublicAPI.BTCPPA0008

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/segments
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
segmentIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de segmento.
segmentDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de segmento.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
segments | [segment](#segment) | Listado de segmentos.

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
curl -X GET \
  '{{baseUrl}}/public/CustomerParameters/v1/segments' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "segments": {
    "segment": [
      {
        "segmentDescription": "DEPENDIENTE",
        "segmentId": 1
      },
      {
        "segmentDescription": "INDEPENDIENTE",
        "segmentId": 2
      },
      {
        "segmentDescription": "OTROS",
        "segmentId": 3
      },
      {
        "segmentDescription": "INSTITUCIONES FINANCIERAS",
        "segmentId": 4
      },
      {
        "segmentDescription": "EMPLEADO",
        "segmentId": 5
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details segment

### segment

::: center
Los campos del tipo de dato estructurado segment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
segmentId | Byte $<(Length: 2)>$ | Identificador de segmento.
segmentDescription | String $<(Length: 30)>$ | Descripción de segmento.
:::
<!-- CIERRA SDT -->
