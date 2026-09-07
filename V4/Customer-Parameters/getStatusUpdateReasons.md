---
title: Status Update Reasons
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los posibles motivos de cambio de estado para una contraparte.

**Nombre publicación:** PublicCustomerParameters.statusUpdateReasons

**Programa:** PublicAPI.BTCPPA0011

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/statusUpdateReasons
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
reasonIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de motivo de cambio de estado.
reasonDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de motivo de cambio de estado.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
reasonsForStatusChange | [reasonForStatusChange](#reasonforstatuschange) | Listado de motivos de cambio de estado.

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
  '{{baseUrl}}/public/CustomerParameters/v1/statusUpdateReasons' \
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
  "reasonsForStatusChange": {
    "reasonForStatusChange": [
      {
        "reasonDescription": "EMBARGO",
        "reasonId": 1,
        "statusDescription": "INHABILITADA",
        "statusId": 2
      },
      {
        "reasonDescription": "EN JUICIO",
        "reasonId": 2,
        "statusDescription": "CERRADA",
        "statusId": 3
      },
      {
        "reasonDescription": "RETENCIONES",
        "reasonId": 3,
        "statusDescription": "ACTIVA",
        "statusId": 1
      },
      {
        "reasonDescription": "CIERRE",
        "reasonId": 4,
        "statusDescription": "CERRADA",
        "statusId": 3
      },
      {
        "reasonDescription": "REGULARIZACIÓN",
        "reasonId": 5,
        "statusDescription": "ACTIVA",
        "statusId": 1
      },
      {
        "reasonDescription": "FALLECIMIENTO",
        "reasonId": 7,
        "statusDescription": "ALTA INCONCLUSA (INST.FINANC.)",
        "statusId": 9
      },
      {
        "reasonDescription": "CIERRE",
        "reasonId": 8,
        "statusDescription": "ACTIVA",
        "statusId": 1
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details reasonForStatusChange

### reasonForStatusChange

::: center
Los campos del tipo de dato estructurado reasonForStatusChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
reasonId | Byte $<(Length: 2)>$ | Identificador de motivo de cambio de estado.
reasonDescription | String $<(Length: 30)>$ | Descripción de motivo de cambio de estado.
statusId | Byte $<(Length: 30)>$ | Identificador de estado.
statusDescription | String $<(Length: 2)>$ | Descripción de estado.
:::
<!-- CIERRA SDT -->
