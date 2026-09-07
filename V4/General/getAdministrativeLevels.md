---
title: Administrative Levels
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los niveles administrativos de un país.

**Nombre publicación:** PublicGeneral.administrativeLevels

**Programa:** PublicAPI.BTCNPA0002

**Alcance:** Global

**Endpoint:** /public/General/v1/administrativeLevels
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
countryId | Short $<(Length: 3)>$ | Identificador de país.
firstLevel | Int $<(Length: 5)>$ | Identificador de primer nivel administrativo.
secondLevel | Int $<(Length: 5)>$ | Identificador de segundo nivel administrativo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
administrativeLevels | [administrativeLevel](#administrativelevel) | Listado de niveles administrativos.

@tab Errores

Código | Descripción
:--------- | :---------
50020018 | El país no se encuentra registrado.
99990010002 | Datos de Paginación Incorrectos.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/administrativeLevels?countryId=484' \
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
  "administrativeLevels": {
    "administrativeLevel": [
      {
        "administrativeLevelDescription": "AGUASCALIENTES",
        "administrativeLevelId": 1
      },
      {
        "administrativeLevelDescription": "BAJA CALIFORNIA",
        "administrativeLevelId": 2
      },
      {
        "administrativeLevelDescription": "BAJA CALIFORNIA SUR",
        "administrativeLevelId": 3
      },
      {
        "administrativeLevelDescription": "CAMPECHE",
        "administrativeLevelId": 4
      },
      {
        "administrativeLevelDescription": "COAHUILA DE ZARAGOZA",
        "administrativeLevelId": 5
      },
      {
        "administrativeLevelDescription": "COLIMA",
        "administrativeLevelId": 6
      },
      {
        "administrativeLevelDescription": "CHIAPAS",
        "administrativeLevelId": 7
      },
      {
        "administrativeLevelDescription": "CHIHUAHUA",
        "administrativeLevelId": 8
      },
      {
        "administrativeLevelDescription": "CIUDAD DE MÉXICO",
        "administrativeLevelId": 9
      },
      {
        "administrativeLevelDescription": "DURANGO",
        "administrativeLevelId": 10
      },
      {
        "administrativeLevelDescription": "GUANAJUATO",
        "administrativeLevelId": 11
      },
      {
        "administrativeLevelDescription": "GUERRERO",
        "administrativeLevelId": 12
      },
      {
        "administrativeLevelDescription": "HIDALGO",
        "administrativeLevelId": 13
      },
      {
        "administrativeLevelDescription": "JALISCO",
        "administrativeLevelId": 14
      },
      {
        "administrativeLevelDescription": "ESTADO DE MÉXICO",
        "administrativeLevelId": 15
      },
      {
        "administrativeLevelDescription": "MICHOACAN DE OCAMPO",
        "administrativeLevelId": 16
      },
      {
        "administrativeLevelDescription": "MORELOS",
        "administrativeLevelId": 17
      },
      {
        "administrativeLevelDescription": "NAYARIT",
        "administrativeLevelId": 18
      },
      {
        "administrativeLevelDescription": "NUEVO LEON",
        "administrativeLevelId": 19
      },
      {
        "administrativeLevelDescription": "OAXACA",
        "administrativeLevelId": 20
      },
      {
        "administrativeLevelDescription": "PUEBLA",
        "administrativeLevelId": 21
      },
      {
        "administrativeLevelDescription": "QUERETARO",
        "administrativeLevelId": 22
      },
      {
        "administrativeLevelDescription": "QUINTANA ROO",
        "administrativeLevelId": 23
      },
      {
        "administrativeLevelDescription": "SAN LUIS POTOSI",
        "administrativeLevelId": 24
      },
      {
        "administrativeLevelDescription": "SINALOA",
        "administrativeLevelId": 25
      },
      {
        "administrativeLevelDescription": "SONORA",
        "administrativeLevelId": 26
      },
      {
        "administrativeLevelDescription": "TABASCO",
        "administrativeLevelId": 27
      },
      {
        "administrativeLevelDescription": "TAMAULIPAS",
        "administrativeLevelId": 28
      },
      {
        "administrativeLevelDescription": "TLAXCALA",
        "administrativeLevelId": 29
      },
      {
        "administrativeLevelDescription": "VERACRUZ",
        "administrativeLevelId": 30
      },
      {
        "administrativeLevelDescription": "YUCATAN",
        "administrativeLevelId": 31
      },
      {
        "administrativeLevelDescription": "ZACATECAS",
        "administrativeLevelId": 32
      },
      {
        "administrativeLevelDescription": "EXTRANJERO",
        "administrativeLevelId": 33
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details administrativeLevel

### administrativeLevel

::: center
Los campos del tipo de dato estructurado administrativeLevel son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
administrativeLevelId | Int | Identificador del nivel administrativo.
administrativeLevelDescription | String | Descripción del nivel administrativo.
:::
<!-- CIERRA SDT -->
