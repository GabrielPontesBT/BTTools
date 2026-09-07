---
title: Texts
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los textos de una contraparte.

**Nombre publicación:** PublicCustomers.texts

**Programa:** PublicAPI.BTCPPA0023

**Alcance:** Global

**Endpoint:** /public/Customers/v1/texts
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
texts | [text](#text) | Listado de textos a actualizar.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40050100 | Debe ingresar el GUID de contraparte.
50090006 | Código de texto incorrecto
50090007 | Debe ingresar un texto
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Customers/v1/texts?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "texts": {
    "text": [
      {
        "id": 1,
        "description": "TEXTO DE EJEMPLO",
        "text": "CONTENIDO DEL TEXTO"
      }
    ]
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
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details text

### text

::: center
Los campos del tipo de dato estructurado text son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
id | Int $<(Length: 5)>$ | Identificador del texto.
description | String $<(Length: 60)>$ | Descripción del texto.
text | String $<(Length: 5000)>$ | Texto.
:::
<!-- CIERRA SDT -->
