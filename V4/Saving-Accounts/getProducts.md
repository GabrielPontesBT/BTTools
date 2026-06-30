---
title: Get Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de productos.

**Nombre publicación:** PublicSavingAccounts.getProducts

**Módulo:** Configuration.ProductsHub

**Programa:** PublicAPI.BTPHPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Listado de productos.

@tab Errores

Código | Descripción
:--------- | :-----------
No aplica.

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
    "Token": "8EE696AD86E93556C39DD2CC"
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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "products": {
    "product": [
      {
        "ProductGUID": "dd98b54d-73d9-4248-b760-5e62b24617ac",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "01fc8f86-e7f4-463c-ba8c-b3c4244583d3",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 50,
        "KindDescription": "Unidad Indexada"
      },
      {
        "ProductGUID": "1e4f6d65-4611-43c1-ad84-29b598e1e390",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": 1111,
        "CurrencyDescription": "EURO",
        "CurrencySign": "EUR",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "ccfaa85e-3420-451f-b98f-0bcf5f811f43",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": 2222,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "00d62e30-d932-4797-ba3e-bdc4cad6e8e1",
        "ProductDescription": "CAJA DE AHORRO PF",
        "CurrencyId": 2225,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "CurrencySign": "U$D",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "3cf07632-e5f7-421f-86b3-d3b75e9ffcad",
        "ProductDescription": "CAJA DE AHORRO PJ",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "d60cf435-9618-40f4-aa7f-99d3891edc93",
        "ProductDescription": "CAJA DE AHORRO PJ",
        "CurrencyId": 1111,
        "CurrencyDescription": "EURO",
        "CurrencySign": "EUR",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "910ecfbd-20e9-4702-8e33-0455babf3245",
        "ProductDescription": "CAJA DE AHORRO PJ",
        "CurrencyId": 2222,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "28169aa2-61c3-43ca-9fa9-e12ff30d4b71",
        "ProductDescription": "CUENTA A MI FAVOR",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "57a29eb2-f783-41dd-87a2-c53c2edcdf6e",
        "ProductDescription": "MIS AHORROS COMPARTAMOS",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "9034c46c-a46f-499d-a46a-d83fec424956",
        "ProductDescription": "CAJAS DE AHORRO KIDS",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "4b5a3ef3-b958-493c-b6a9-f7cfe848b12e",
        "ProductDescription": "CAJAS DE AHORRO SUELDOS",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "65e5cf42-3e10-47be-b703-d1252f3711ec",
        "ProductDescription": "CAJAS DE AHORRO JUBILACIONES",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "8b96d720-56ed-45dd-a8e8-54105c51017b",
        "ProductDescription": "CAJAS DE AHORRO SUELDO DE EMPLEADOS",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "8ace4641-72fb-4b0b-92b0-1a972b0f44d1",
        "ProductDescription": "CAJAS DE AHORRO SUELDO DE EMPLEADOS",
        "CurrencyId": 2222,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": 0,
        "KindDescription": "Billete"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:53:48",
    "Numero": 13466296,
    "Servicio": "PublicSavingAccounts.getProducts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPHWProduct

### SdtsBTPHWProduct

::: center
Los campos del tipo de dato estructurado SdtsBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CurrencyId | Short $<(Length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(Length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(Length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(Length: 6)>$ | Identificador del tipo.
KindDescription | String $<(Length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.
:::
<!-- CIERRA SDT -->
