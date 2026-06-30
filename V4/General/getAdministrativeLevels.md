---
title: Get Administrative Levels
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener las divisiones administrativas de un país de forma jerárquica. Si se ingresa únicamente el país, retorna el listado de primeros niveles administrativos correspondientes. Si se ingresa el país y el primer nivel, retorna los segundos niveles correspondientes. Si se ingresan los tres parámetros, retorna los terceros niveles correspondientes.

**Nombre publicación:** PublicGeneral.getAdministrativeLevels

**Programa:** PublicAPI.BTCNPA0002

**Alcance:** Global

**Endpoint:** /public/General/v1/getAdministrativeLevels
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
administrativeLevels | [SdtsBTCNWAdministrativeLevel](#sdtsbtcnwadministrativelevel) | Listado de niveles administrativos.

@tab Errores

Código | Descripción
:--------- | :---------
50020018 | El país no se encuentra registrado.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/getAdministrativeLevels?countryId=484&firstLevel=9&secondLevel=0' \
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
        "Description": "Azcapotzalco",
        "Id": 2
      },
      {
        "Description": "Coyoacan",
        "Id": 3
      },
      {
        "Description": "Cuajimalpa de Morelos",
        "Id": 4
      },
      {
        "Description": "Gustavo A. Madero",
        "Id": 5
      },
      {
        "Description": "Iztacalco",
        "Id": 6
      },
      {
        "Description": "Iztapalapa",
        "Id": 7
      },
      {
        "Description": "La Magdalena Contreras",
        "Id": 8
      },
      {
        "Description": "Milpa Alta",
        "Id": 9
      },
      {
        "Description": "alvaro Obregon",
        "Id": 10
      },
      {
        "Description": "Tlahuac",
        "Id": 11
      },
      {
        "Description": "Tlalpan",
        "Id": 12
      },
      {
        "Description": "Xochimilco",
        "Id": 13
      },
      {
        "Description": "Benito Juarez",
        "Id": 14
      },
      {
        "Description": "Cuauhtemoc",
        "Id": 15
      },
      {
        "Description": "Miguel Hidalgo",
        "Id": 16
      },
      {
        "Description": "Venustiano Carranza",
        "Id": 17
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCNWAdministrativeLevel

### SdtsBTCNWAdministrativeLevel

::: center
Los campos del tipo de dato estructurado SdtsBTCNWAdministrativeLevel son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Id | Int $<(Length: 9)>$ | Identificador del nivel administrativo.
Description | String $<(Length: 30)>$ | Descripción del nivel administrativo.
:::
<!-- CIERRA SDT -->
