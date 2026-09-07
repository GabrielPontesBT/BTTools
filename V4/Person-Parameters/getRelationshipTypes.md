---
title: Relationship Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de vínculo entre personas.

**Nombre publicación:** PublicPersonParameters.relationshipTypes

**Programa:** PublicAPI.BTPEPA0003

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/relationshipTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
relationshipIdFilter | Short $<(Length: 4)>$ | Filtro por identificador de vínculo.
relationshipDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de vínculo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
relationships | [relationship](#relationship) | Listado de vínculos.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/PersonParameters/v1/relationshipTypes?offset=0&limit=10' \
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
  "hasNext": false,
  "relationships": {
    "relationship": [
      {
        "bidirectional": true,
        "multilateral": false,
        "relationshipDescription": "CÓNYUGE",
        "relationshipId": 40,
        "relationshipType": "A"
      },
      {
        "bidirectional": false,
        "multilateral": false,
        "relationshipDescription": "PADRE DE:",
        "relationshipId": 41,
        "relationshipType": "C"
      },
      {
        "bidirectional": false,
        "multilateral": false,
        "relationshipDescription": "MADRE DE:",
        "relationshipId": 42,
        "relationshipType": "C"
      },
      {
        "bidirectional": false,
        "multilateral": true,
        "relationshipDescription": "HIJO DE:",
        "relationshipId": 43,
        "relationshipType": "C"
      },
      {
        "bidirectional": false,
        "multilateral": false,
        "relationshipDescription": "NO CORRESPONDE",
        "relationshipId": 99,
        "relationshipType": "A"
      },
      {
        "bidirectional": false,
        "multilateral": true,
        "relationshipDescription": "Amigo",
        "relationshipId": 100,
        "relationshipType": "A"
      },
      {
        "bidirectional": false,
        "multilateral": true,
        "relationshipDescription": "ABUELO DE:",
        "relationshipId": 1234,
        "relationshipType": "C"
      },
      {
        "bidirectional": false,
        "multilateral": true,
        "relationshipDescription": "AFINIDAD",
        "relationshipId": 2222,
        "relationshipType": "A"
      },
      {
        "bidirectional": false,
        "multilateral": true,
        "relationshipDescription": "CONOCIDO",
        "relationshipId": 5555,
        "relationshipType": "A"
      }
    ]
  }
}
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
multilateral | Boolean | ¿Es multilateral?
relationshipId | Short $<(Length: 4)>$ | Identificador de vínculo.
relationshipDescription | String $<(Length: 30)>$ | Descripción de vínculo.
relationshipType | String $<(Length: 1)>$ | Tipo de vínculo (A: Afinidad, C: Consanguinidad).
:::
<!-- CIERRA SDT -->
