---
title: Cancel
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para cancelar un préstamo.

**Nombre publicación:** PublicSavingAccounts.cancel

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0004

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.
savingAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
cancellationOriginId | Short $<(length: 4)>$ | Identificador del origen de cancelación.
cancellationReasonId | Byte $<(length: 2)>$ | Identificador del motivo de cancelación.
paymentOrChargeAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de cobro o desembolso.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "counterpartyGUID": "",
  "savingAccountGUID": "00000000-0000-0000-0000-000000000000",
  "cancellationOriginId": 1,
  "cancellationReasonId": 1,
  "paymentOrChargeAccountGUID": ""
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
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "movementGUID": "00000000-0000-0000-0000-000000000000",
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 500,
        "Severity": "",
        "Target": "",
        "Description": "API internal error"
      },
      {
        "Code": 99990010000,
        "Severity": "",
        "Target": "",
        "Description": "Namespace no catalogado"
      },
      {
        "Code": 99990010000,
        "Severity": "",
        "Target": "",
        "Description": "Namespace no catalogado"
      }
    ]
  },
  "Btoutreq": {
    "Estado": "NEG_INFO",
    "Fecha": "2026-05-22",
    "Hora": "15:56:54",
    "Numero": 13505903,
    "Servicio": "PublicSavingAccounts.cancel",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


