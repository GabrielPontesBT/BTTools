---
title: Positions
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los cargos.

**Nombre publicación:** PublicPersonParameters.positions

**Programa:** PublicAPI.BTPEPA0010

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/positions
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
positionIdFilter | Short $<(Length: 4)>$ | Filtro por identificador de cargo.
positionDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de cargo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
positions | [position](#position) | Listado de cargos.

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
  '{{baseUrl}}/public/PersonParameters/v1/positions' \
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
  "positions": {
    "position": [
      {
        "multilateral": false,
        "positionDescription": "PRESIDENTE",
        "positionId": 1
      },
      {
        "multilateral": false,
        "positionDescription": "VICEPRESIDENTE",
        "positionId": 2
      },
      {
        "multilateral": false,
        "positionDescription": "PROSECRETARIO",
        "positionId": 3
      },
      {
        "multilateral": false,
        "positionDescription": "TESORERO",
        "positionId": 4
      },
      {
        "multilateral": true,
        "positionDescription": "DIRECTOR",
        "positionId": 5
      },
      {
        "multilateral": false,
        "positionDescription": "SECRETARIO",
        "positionId": 6
      },
      {
        "multilateral": false,
        "positionDescription": "PROTESORERO",
        "positionId": 7
      },
      {
        "multilateral": false,
        "positionDescription": "SOCIO",
        "positionId": 8
      },
      {
        "multilateral": false,
        "positionDescription": "GERENTE",
        "positionId": 9
      },
      {
        "multilateral": false,
        "positionDescription": "APODERADO",
        "positionId": 10
      },
      {
        "multilateral": false,
        "positionDescription": "AUTORIZADO",
        "positionId": 11
      },
      {
        "multilateral": false,
        "positionDescription": "ADMINISTRADOR",
        "positionId": 12
      },
      {
        "multilateral": false,
        "positionDescription": "VOCAL",
        "positionId": 13
      },
      {
        "multilateral": false,
        "positionDescription": "COOPERATIVISTA",
        "positionId": 14
      },
      {
        "multilateral": false,
        "positionDescription": "FIRMA SOLIDARIA",
        "positionId": 15
      },
      {
        "multilateral": false,
        "positionDescription": "SOCIO COMANDITADO",
        "positionId": 16
      },
      {
        "multilateral": false,
        "positionDescription": "SOCIO COMANDITARIO",
        "positionId": 17
      },
      {
        "multilateral": false,
        "positionDescription": "INTERVENTOR",
        "positionId": 18
      },
      {
        "multilateral": false,
        "positionDescription": "ACCIONISTA",
        "positionId": 19
      },
      {
        "multilateral": false,
        "positionDescription": "GERENTE GENERAL",
        "positionId": 20
      },
      {
        "multilateral": false,
        "positionDescription": "EMPLEADO",
        "positionId": 21
      },
      {
        "multilateral": false,
        "positionDescription": "PRESIDENTE",
        "positionId": 5558
      },
      {
        "multilateral": false,
        "positionDescription": "PRESIDENTE",
        "positionId": 5559
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details position

### position

::: center
Los campos del tipo de dato estructurado position son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
multilateral | Boolean | ¿Es multilateral?
positionId | Short $<(Length: 4)>$ | Identificador de cargo.
positionDescription | String $<(Length: 30)>$ | Descripción de cargo.
:::
<!-- CIERRA SDT -->
