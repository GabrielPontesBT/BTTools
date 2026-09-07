---
title: Occupations
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de las ocupaciones.

**Nombre publicación:** PublicPersonParameters.occupations

**Programa:** PublicAPI.BTPEPA0023

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/occupations
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
occupationIdFilter | Int $<(Length: 5)>$ | Filtro por identificador de ocupación.
occupationDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de ocupación.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
occupations | [occupation](#occupation) | Listado de ocupaciones.

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
  '{{baseUrl}}/public/PersonParameters/v1/occupations' \
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
  "occupations": {
    "occupation": [
      {
        "occupationDescription": "EMPLEADO",
        "occupationId": 1,
        "occupationTypeDescription": "DEPENDIENTE",
        "occupationTypeId": 1
      },
      {
        "occupationDescription": "OBRERO",
        "occupationId": 2,
        "occupationTypeDescription": "DEPENDIENTE",
        "occupationTypeId": 1
      },
      {
        "occupationDescription": "EMPRESARIO",
        "occupationId": 3,
        "occupationTypeDescription": "INDEPENDIENTE",
        "occupationTypeId": 2
      },
      {
        "occupationDescription": "JUBILADO/PENSIONISTA",
        "occupationId": 4,
        "occupationTypeDescription": "OTRO",
        "occupationTypeId": 3
      },
      {
        "occupationDescription": "AMA DE CASA",
        "occupationId": 5,
        "occupationTypeDescription": "OTRO",
        "occupationTypeId": 3
      },
      {
        "occupationDescription": "MILITAR",
        "occupationId": 6,
        "occupationTypeDescription": "DEPENDIENTE",
        "occupationTypeId": 1
      },
      {
        "occupationDescription": "POLICÍA",
        "occupationId": 7,
        "occupationTypeDescription": "DEPENDIENTE",
        "occupationTypeId": 1
      },
      {
        "occupationDescription": "AGROPECUARIO",
        "occupationId": 8,
        "occupationTypeDescription": "INDEPENDIENTE",
        "occupationTypeId": 2
      },
      {
        "occupationDescription": "ESTUDIANTE",
        "occupationId": 9,
        "occupationTypeDescription": "OTRO",
        "occupationTypeId": 3
      },
      {
        "occupationDescription": "PROFESIONAL INDEPENDIENTE",
        "occupationId": 10,
        "occupationTypeDescription": "INDEPENDIENTE",
        "occupationTypeId": 2
      },
      {
        "occupationDescription": "EMPLEADO DE LA INSTITUCION",
        "occupationId": 11,
        "occupationTypeDescription": "DEPENDIENTE",
        "occupationTypeId": 1
      },
      {
        "occupationDescription": "OTROS",
        "occupationId": 12,
        "occupationTypeDescription": "OTRO",
        "occupationTypeId": 3
      },
      {
        "occupationDescription": "OTROS",
        "occupationId": 21,
        "occupationTypeDescription": "OTRO",
        "occupationTypeId": 3
      },
      {
        "occupationDescription": "TECNICO ESPECIALIZADO",
        "occupationId": 22,
        "occupationTypeDescription": "INDEPENDIENTE",
        "occupationTypeId": 2
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details occupation

### occupation

::: center
Los campos del tipo de dato estructurado occupation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
occupationId | Int $<(Length: 5)>$ | Identificador de ocupación.
occupationDescription | String $<(Length: 30)>$ | Descripción de ocupación.
occupationTypeId | Short $<(Length: 4)>$ | Identificador de tipo de ocupación.
occupationTypeDescription | String $<(Length: 30)>$ | Descripción de tipo de ocupación.
:::
<!-- CIERRA SDT -->
