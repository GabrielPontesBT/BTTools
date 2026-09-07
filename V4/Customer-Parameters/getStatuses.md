---
title: Statuses
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los posibles estados de una contraparte.

**Nombre publicación:** PublicCustomerParameters.statuses

**Programa:** PublicAPI.BTCPPA0010

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/statuses
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
statusIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de estado.
statusDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de estado.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
statuses | [status](#status) | Listado de estados.

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
  '{{baseUrl}}/public/CustomerParameters/v1/statuses' \
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
  "statuses": {
    "status": [
      {
        "statusDescription": "ACTIVA",
        "statusId": 1
      },
      {
        "statusDescription": "INHABILITADA",
        "statusId": 2
      },
      {
        "statusDescription": "CERRADA",
        "statusId": 3
      },
      {
        "statusDescription": "ALTA INCONCLUSA (INST.FINANC.)",
        "statusId": 9
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details status

### status

::: center
Los campos del tipo de dato estructurado status son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
statusId | Byte $<(Length: 2)>$ | Identificador de estado.
statusDescription | String $<(Length: 30)>$ | Descripción de estado.
:::
<!-- CIERRA SDT -->
