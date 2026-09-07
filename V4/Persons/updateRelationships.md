---
title: Relationships
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar las relaciones de una persona.

**Nombre publicación:** PublicPersons.relationships

**Programa:** PublicAPI.BTPEPA0037

**Alcance:** Global

**Endpoint:** /public/Persons/v1/relationships
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
relationships | [relationship](#relationship) | Listado de vínculos.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010095 | Relación no existe
40010100 | No puede relacionarse a sí mismo
40010141 | Código de vínculo no existe
40010143 | Debe ingresar un código de vínculo comprendido entre 1 y 9999
40050001 | Debe ingresar el GUID de persona.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Persons/v1/relationships?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "relationships": {
    "relationship": [
      {
        "bidirectional": false,
        "integrantName": "",
        "percentage": 100,
        "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
        "relationshipId": 1,
        "relationshipDescription": ""
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
::: details relationship

### relationship

::: center
Los campos del tipo de dato estructurado relationship son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
bidirectional | Boolean | ¿Es bidireccional?
integrantName | String | Nombre del integrante.
percentage | Double $<(Length: 11)>$ | Porcentaje.
personGUID | String $<(Length: 10)>$ | GUID (identificador único global) de la persona.
relationshipId | Short $<(Length: 4)>$ | Identificador de vínculo.
relationshipDescription | String $<(Length: 30)>$ | Descripción de vínculo.
:::
<!-- CIERRA SDT -->
