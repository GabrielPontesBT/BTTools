---
title: Housing Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de vivienda.

**Nombre publicación:** PublicPersonParameters.housingTypes

**Programa:** PublicAPI.BTPEPA0004

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/housingTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
housingTypeIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de tipo de vivienda.
housingTypeDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de tipo de vivienda.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
housingTypes | [housingType](#housingtype) | Listado de tipos de vivienda.

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
  '{{baseUrl}}/public/PersonParameters/v1/housingTypes' \
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
  "housingTypes": {
    "housingType": [
      {
        "housingTypeDescription": "PROPIETARIO",
        "housingTypeId": 1,
        "requiresOwnerInformation": false
      },
      {
        "housingTypeDescription": "INQUILINO",
        "housingTypeId": 2,
        "requiresOwnerInformation": true
      },
      {
        "housingTypeDescription": "BHU",
        "housingTypeId": 3,
        "requiresOwnerInformation": false
      },
      {
        "housingTypeDescription": "USUFRUCTO",
        "housingTypeId": 4,
        "requiresOwnerInformation": false
      },
      {
        "housingTypeDescription": "FAMILIAR",
        "housingTypeId": 5,
        "requiresOwnerInformation": false
      },
      {
        "housingTypeDescription": "OTROS",
        "housingTypeId": 6,
        "requiresOwnerInformation": false
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details housingType

### housingType

::: center
Los campos del tipo de dato estructurado housingType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
housingTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de vivienda.
housingTypeDescription | String $<(Length: 30)>$ | Descripción de tipo de vivienda.
requiresOwnerInformation | Boolean | ¿Requiere información del propietario?
:::
<!-- CIERRA SDT -->
