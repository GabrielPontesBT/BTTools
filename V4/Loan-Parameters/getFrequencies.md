---
title: Frequencies
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la periodicidad de cuotas de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.frequencies

**Programa:** PublicAPI.BTLOPA0028

**Alcance:** Global

**Endpoint:** /public/LoanParameters/v1/frequencies
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
frequencies | [frequency](#frequency) | Listado de frecuencias de pago.

@tab Errores

Código | Descripción
:--------- | :---------
120050009 | Debe ingresar el GUID de producto.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/LoanParameters/v1/frequencies?productGUID=bf0d7e10-dce6-4bd4-b866-9984556613ec' \
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
  "frequencies": {
    "frequency": [
      {
        "description": "SEMANAL",
        "id": 7,
        "valueByDefect": true
      },
      {
        "description": "BISEMANAL",
        "id": 15,
        "valueByDefect": false
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details frequency

### frequency

::: center
Los campos del tipo de dato estructurado frequency son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
id | Int $<(Length: 5)>$ | Identificador del parámetro.
description | String $<(Length: 256)>$ | Descripción del parámetro.
valueByDefect | Boolean | Valor por defecto.
:::
<!-- CIERRA SDT -->
