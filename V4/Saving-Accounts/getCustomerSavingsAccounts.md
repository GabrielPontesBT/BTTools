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
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingsAccounts | [SdtsBTSAProduct](#sdtsbtsaproduct) | Listado de cuentas de ahorro.

@tab Errores

Código | Descripción
:--------- | :-----------
14001010002 | Debe ingresar el GUID de la contraparte.
40020006 | Contraparte no existe.

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
    "Token": "9CAA9F8022504584A5E8DED9"
  },
  "counterpartyGUID": "8ac8ff85-69bc-406b-92fd-c48a674283df0"
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
    "Device": "GPONTES",
    "Requerimiento": "1",
    "Token": "15BE97FEFB54603E9455AF48"
  },
  "savingsAccounts": {
    "savingsAccount": [
      {
        "availableBalance": 0.0,
        "balance": 19840.9,
        "currencyDescription": "Pesos Uruguayos",
        "currencyId": 0,
        "currencySign": "$",
        "kindDescription": "Billete",
        "kindId": 0,
        "kindSign": "-",
        "savingsAccountGUID": "971a3810-9097-4f7c-a220-1c160691d2d2",
        "statusDescription": "Normal",
        "statusId": 0,
        "subAccountDescription": "CUENTA SUELDO",
      },
      {
        "availableBalance": 0.0,
        "balance": 47000.0,
        "currencyDescription": "Pesos Uruguayos",
        "currencyId": 0,
        "currencySign": "$",
        "kindDescription": "Billete",
        "kindId": 0,
        "kindSign": "-",
        "savingsAccountGUID": "647740db-fe95-4b6a-8d12-abc55d34bcb8",
        "statusDescription": "Normal",
        "statusId": 0,
        "subAccountDescription": "CUENTA PARA AHORRAR",
      },
      {
        "availableBalance": 0.0,
        "balance": 54039.27,
        "currencyDescription": "Pesos Uruguayos",
        "currencyId": 0,
        "currencySign": "$",
        "kindDescription": "Billete",
        "kindId": 0,
        "kindSign": "-",
        "savingsAccountGUID": "9037bb24-f99a-42e1-93cf-a42bb5af3f37",
        "statusDescription": "Normal",
        "statusId": 0,
        "subAccountDescription": "CUENTA GASTOS",
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-20",
    "Hora": "19:00:41",
    "Numero": 13495841,
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
availableBalance | Double $<(Length: 18)>$ | Saldo disponible.
balance | Double $<(Length: 18)>$ | Saldo.
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
currencyDescription | String $<(Length: 30)>$ | Descripción de moneda.
currencySign | String $<(Length: 5)>$ | Signo de moneda.
kindId | Int $<(Length: 6)>$ | Identificador de papel.
kindDescription | String $<(Length: 30)>$ | Descripción de papel.
kindSign | String $<(Length: 5)>$ | Signo de papel.
savingsAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
statusId | Byte $<(Length: 2)>$ | Identificador de estado.
statusDescription | String $<(Length: 40)>$ | Descripción de estado.
subAccountDescription | String $<(Length: 40)>$ | Nombre de subcuenta.
:::
<!-- CIERRA SDT -->
