---
title: Get Person Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los productos que una persona puede contratar.

**Nombre publicación:** PublicSavingAccounts.getPersonProducts

**Módulo:** Configuration.ProductsHub

**Programa:** PublicAPI.BTPHPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Listado de productos.

@tab Errores

Código | Descripción
:--------- | :-----------
40050001 | Debe ingresar el GUID de la persona.
40010004 | La persona no existe.

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
  },
  "personGUID": "183f5194-f5a9-4590-9aff-b43de58c263d"
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
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:53:52",
    "Numero": 13466297,
    "Servicio": "PublicSavingAccounts.getPersonProducts",
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
