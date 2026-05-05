---
title: Obtener Productos de Personas
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
::: note Método para obtener los productos (cajas de ahorro) asociados a una persona.
Este servicio permite consultar el listado de productos de Ahorro (Saving Accounts) asociados a una persona, identificado por su **personGUID**.

**Nombre publicación:** PublicSavingAccounts.getPersonProducts

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String | Identificador único de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sBTPHWProducts | Array | Lista de productos asociados a la persona.

@tab Errores

Código | Descripción
:--------- | :-----------
10002 | Error en la ejecución del programa.
10011 | Sesión inválida.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?getPersonProducts' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "6DB6625A62A4A985089AA60D"
  },
  "personGUID": "2165a369-4856-4dae-81fe-2a5ac804e005"
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "6DB6625A62A4A985089AA60D"
  },
  "sBTPHWProducts": {
    "sBTPHWProduct": [
      {
        "ProductGUID": "dd98b54d-73d9-4248-b760-5e62b24617ac",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "01fc8f86-e7f4-463c-ba8c-b3c4244583d3",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "50",
        "KindDescription": "Unidad Indexada"
      },
      {
        "ProductGUID": "1e4f6d65-4611-43c1-ad84-29b598e1e390",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": "1111",
        "CurrencyDescription": "EURO",
        "CurrencySign": "EUR",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "ccfaa85e-3420-451f-b98f-0bcf5f811f43",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "00d62e30-d932-4797-ba3e-bdc4cad6e8e1",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": "2225",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "CurrencySign": "U$D",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "9034c46c-a46f-499d-a46a-d83fec424956",
        "ProductDescription": "CAJAS DE AHORRO KIDS",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "4b5a3ef3-b958-493c-b6a9-f7cfe848b12e",
        "ProductDescription": "CAJAS DE AHORRO SUELDOS",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "65e5cf42-3e10-47be-b703-d1252f3711ec",
        "ProductDescription": "CAJAS DE AHORRO JUBILACIONES",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-28",
    "Hora": "13:34:17",
    "Numero": "13054381",
    "Servicio": "PublicSavingAccounts.getPersonProducts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTPHWProduct

### sBTPHWProduct

::: center
Los campos del tipo de dato estructurado sBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ProductGUID | String |
ProductDescription | String |
CurrencyId | String |
CurrencyDescription | String |
CurrencySign | String |
KindId | String |
KindDescription | String |
:::
<!-- CIERRA SDT -->
