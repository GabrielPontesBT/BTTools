---
title: Cancel [REVISAR]
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
    "Token": "B2C4370CAA727E6B96067AB0"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "savingAccountGUID": "44a8b232-9376-451e-9553-2cb037254a3e",
  "cancellationOriginId": 1,
  "cancellationReasonId": 1,
  "paymentOrChargeAccountGUID": "d4c55780-98c1-43ab-bc6d-ccaab69807c3"
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
    "Token": "B2C4370CAA727E6B96067AB0"
  },
  "movementGUID": "00000000-0000-0000-0000-000000000000",
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 170049,
        "Severity": "E",
        "Target": "",
        "Description": "No existe registro con los datos ingresados en el histórico de saldos"
      },
      {
        "Code": 20010200,
        "Severity": "E",
        "Target": "",
        "Description": "No existe pizarra para los datos ingresados"
      }
    ]
  },
  "Btoutreq": {
    "Estado": "NEG_ERROR",
    "Fecha": "2026-05-11",
    "Hora": "22:48:28",
    "Numero": 13459148,
    "Servicio": "PublicSavingAccounts.cancel",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


