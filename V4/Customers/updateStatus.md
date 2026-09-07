---
title: Status
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar el estado de una contraparte.

**Nombre publicación:** PublicCustomers.status

**Programa:** PublicAPI.BTCPPA0012

**Alcance:** Global

**Endpoint:** /public/Customers/v1/status
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
statusId | Byte $<(Length: 2)>$ | Identificador del estado.
reasonForStatusChangeId | Byte $<(Length: 2)>$ | Identificador del motivo de cambio de estado.
comment | String $<(Length: 500)>$ | Comentario.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40020001 | Debe ingresar un Código de estado comprendido entre 1 y 99
40020006 | Contraparte no existe
40020008 | El Código de estado no existe
40020049 | Debe ingresar un código de Motivo comprendido entre 1 y 99
40020053 | El código de Motivo no existe
40020056 | La contraparte ya se encuentra en ese estado
40020057 | El Motivo no corresponde al estado ingresado
40020058 | Debe ingresar otro Motivo
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Customers/v1/status?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "statusId": 1,
  "reasonForStatusChangeId": 1,
  "comment": "ACTUALIZACIÓN DE ESTADO"
}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->