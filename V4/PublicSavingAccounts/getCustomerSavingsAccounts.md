---
title: Get Customer Savings Accounts
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las cuentas de ahorro de una contraparte.

**Nombre publicación:** PublicSavingAccounts.getCustomerSavingsAccounts

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0007

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingsAccounts | [SdtsBTSAProduct](#sdtsbtsaproduct) | Listado de cuentas de ahorro.

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
  "counterpartyGUID": ""
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
  "savingsAccounts": {
    "savingsAccount": []
  },
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 500,
        "Severity": "",
        "Target": "",
        "Description": "API internal error"
      }
    ]
  },
  "Btoutreq": {
    "Estado": "NEG_INFO",
    "Fecha": "2026-05-22",
    "Hora": "15:56:50",
    "Numero": 13505901,
    "Servicio": "PublicSavingAccounts.getCustomerSavingsAccounts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTSAProduct

### SdtsBTSAProduct

::: center
Los campos del tipo de dato estructurado SdtsBTSAProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
availableBalance | Double $<(length: 18)>$ | Saldo disponible.
balance | Double $<(length: 18)>$ | Saldo.
currencyId | Short $<(length: 4)>$ | Identificador de moneda.
currencyDescription | String $<(length: 30)>$ | Descripción de moneda.
currencySign | String $<(length: 5)>$ | Signo de moneda.
kindId | Int $<(length: 6)>$ | Identificador de papel.
kindDescription | String $<(length: 30)>$ | Descripción de papel.
kindSign | String $<(length: 5)>$ | Signo de papel.
savingsAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
statusId | Byte $<(length: 2)>$ | Identificador de estado.
statusDescription | String $<(length: 40)>$ | Descripción de estado.
subAccountDescription | String $<(length: 40)>$ | Nombre de subcuenta.
:::
<!-- CIERRA SDT -->
