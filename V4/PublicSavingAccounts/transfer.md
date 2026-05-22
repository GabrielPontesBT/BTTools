---
title: Transfer
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para realizar una transferencia entre cuentas.

**Nombre publicación:** PublicSavingAccounts.transfer

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.ABTSAPA00010

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.
transferData | [SdtsBTSAWTransferData](#sdtsbtsawtransferdata) | Datos de la transferencia.

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
  "transferData": {
    "amount": 0,
    "currency": 0,
    "reference": "",
    "savingAccountGUIDOrigin": "",
    "savingAccountGUIDPayment": ""
  }
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
  "movementGUID": "",
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 10002,
        "Severity": "E",
        "Target": "",
        "Description": "Error en la ejecución del programa"
      }
    ]
  },
  "Btoutreq": {
    "Estado": "BTS_PLAT_ERROR",
    "Fecha": "2026-05-22",
    "Hora": "15:56:52",
    "Numero": 13505902,
    "Servicio": "PublicSavingAccounts.transfer",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTSAWTransferData

### SdtsBTSAWTransferData

::: center
Los campos del tipo de dato estructurado SdtsBTSAWTransferData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(length: 18)>$ | Importe.
currency | Short $<(length: 4)>$ | Identificador de moneda.
reference | String $<(length: 40)>$ | Referencia.
savingAccountGUIDOrigin | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de origen.
savingAccountGUIDPayment | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de destino.
:::
<!-- CIERRA SDT -->
