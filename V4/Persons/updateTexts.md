---
title: Texts
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los textos de una persona.

**Nombre publicación:** PublicPersons.texts

**Programa:** PublicAPI.BTPEPA0021

**Alcance:** Global

**Endpoint:** /public/Persons/v1/texts
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
texts | [text](#text) | Listado de textos.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe.
40050001 | Debe ingresar el GUID de persona.
50090006 | Código de texto incorrecto.
50090007 | Debe ingresar un texto.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Persons/v1/texts?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
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
        "description": "",
        "id": "1",
        "text": "TEXTO DE PRUEBA"
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
