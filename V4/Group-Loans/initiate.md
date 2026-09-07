---
title: Initiate
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para contratar un préstamo grupal.

**Nombre publicación:** PublicGroupLoans.initiate

**Programa:** PublicAPI.BTLOPA0044

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/initiate
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
accountingEntries | [accountingEntry](#accountingentry) | Listado de asientos por integrante.

@tab Errores

Código | Descripción
:--------- | :---------
120020061 | No existen datos de simulación
120050010 | Debe ingresar el GUID de grupo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/initiate' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 32,
  "cycleId": 1
}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "accountingEntries": {
    "accountingEntry": [
      {
        "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
        "movementGUID": "3178b150-2010-4572-8950-23c8677fa31f"
      },
      {
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
        "movementGUID": "0c59f71e-1668-4d89-b891-48346c9556dc"
      },
      {
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
        "movementGUID": "26c038cf-5617-45c7-9d0a-1d294e377f4b"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details accountingEntry

### accountingEntry

::: center
Los campos del tipo de dato estructurado accountingEntry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.
:::
<!-- CIERRA SDT -->
