---
title: Cancelar Caja de Ahorro
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para cancelar una caja de ahorro.

Este servicio permite realizar la **cancelación de una cuenta de ahorro**, indicando el motivo y la cuenta asociada para el débito/crédito correspondiente.

**Nombre publicación:** PublicSavingAccounts.cancel

**Módulo:** SavingAccounts.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String | Identificador único de la contraparte.
savingAccountGUID | String | Identificador único de la cuenta de ahorro.
cancellationOriginId | Integer | Origen de la cancelación.
cancellationReasonId | Integer | Motivo de la cancelación.
paymentOrChargeAccountGUID | String | Cuenta utilizada para el pago o cobro.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String | Identificador del movimiento generado por la cancelación.

@tab Errores

Código | Descripción
:--------- | :-----------
<!-- SE DEBEN AGREGAR A MANO -->
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?cancel' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "GPONTES",
    "Requerimiento": "1",
    "Token": "F4D0C6E75AC71200736571C5"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "savingAccountGUID": "5dcd823d-1d93-438f-970f-f5faa34f8b4a",
  "cancellationOriginId": "1",
  "cancellationReasonId": "1",
  "paymentOrChargeAccountGUID": "cb66ae05-e823-4558-b374-89cab47524fe"
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
  "movementGUID": "2e4a0635-2a50-403b-9e44-ea7eb99ee6dc",
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
