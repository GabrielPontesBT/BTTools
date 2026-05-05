---
title: Obtener Productos de Cajas de Ahorro
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
::: note Método para obtener el catálogo de productos de Cajas de Ahorro (Saving Accounts).
Este servicio permite consultar el listado de productos disponibles para Cajas de Ahorro.

**Nombre publicación:** PublicSavingAccounts.getProducts

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | Array | Lista de productos disponibles.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?getProducts' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "GP",
    "Requerimiento": "1",
    "Token": "70B7DC4F2B958AA47946867A"
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
    "Device": "GP",
    "Requerimiento": "1",
    "Token": "70B7DC4F2B958AA47946867A"
  },
  "products": {
    "product": [
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
        "ProductGUID": "3cf07632-e5f7-421f-86b3-d3b75e9ffcad",
        "ProductDescription": "CAJA DE AHORRO PJ",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "d60cf435-9618-40f4-aa7f-99d3891edc93",
        "ProductDescription": "CAJA DE AHORRO PJ",
        "CurrencyId": "1111",
        "CurrencyDescription": "EURO",
        "CurrencySign": "EUR",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "910ecfbd-20e9-4702-8e33-0455babf3245",
        "ProductDescription": "CAJA DE AHORRO PJ",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
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
      },
      {
        "ProductGUID": "8b96d720-56ed-45dd-a8e8-54105c51017b",
        "ProductDescription": "CAJAS DE AHORRO SUELDO DE EMPLEADOS",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "8ace4641-72fb-4b0b-92b0-1a972b0f44d1",
        "ProductDescription": "CAJAS DE AHORRO SUELDO DE EMPLEADOS",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": "0",
        "KindDescription": "Billete"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-30",
    "Hora": "11:30:39",
    "Numero": "13072110",
    "Servicio": "PublicSavingAccounts.getProducts",
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
::: details product

### product

::: center
Los campos del tipo de dato estructurado product son los siguientes:

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
