---
title: Establishment Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de establecimiento.

**Nombre publicación:** PublicPersonParameters.establishmentTypes

**Programa:** PublicAPI.BTPEPA0005

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/establishmentTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
establishmentTypeIdFilter | Int $<(Length: 6)>$ | Filtro por identificador de tipo de establecimiento.
establishmentTypeDescriptionFilter | String $<(Length: 50)>$ | Filtro por descripción de tipo de establecimiento.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
establishmentTypes | [establishmentType](#establishmenttype) | Listado de tipos de establecimiento.

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
  '{{baseUrl}}/public/PersonParameters/v1/establishmentTypes' \
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
  "establishmentTypes": {
    "establishmentType": [
      {
        "establishmentTypeDescription": "MERCADO",
        "establishmentTypeId": 1
      },
      {
        "establishmentTypeDescription": "ESTABLECIMIENTO / LOCAL",
        "establishmentTypeId": 2
      },
      {
        "establishmentTypeDescription": "ASOCIACIÓN",
        "establishmentTypeId": 3
      },
      {
        "establishmentTypeDescription": "GALERÍA",
        "establishmentTypeId": 4
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details establishmentType

### establishmentType

::: center
Los campos del tipo de dato estructurado establishmentType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
establishmentTypeId | Int $<(Length: 6)>$ | Identificador de tipo de establecimiento.
establishmentTypeDescription | String $<(Length: 50)>$ | Descripción de tipo de establecimiento.
:::
<!-- CIERRA SDT -->
