---
title: Get Person Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los productos de préstamo que una persona puede contratar.

**Nombre publicación:** PublicLoans.getPersonProducts

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
40050001 | Debe ingresar el GUID de persona.
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "personGUID": "68797e38-8bfa-43c1-9edb-5c86c12be48b"
}
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "products": [
    {
      "ProductDescription": "COMPRA DE VIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
    },
    {
      "ProductDescription": "COMPRA DE VIVIENDA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "c9d5bcd0-8872-41b3-b5a4-9dff8ac7e235"
    },
    {
      "ProductDescription": "REFACCIÓN DE VIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee"
    },
    {
      "ProductDescription": "REFACCIÓN DE VIVIENDA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "e83c667b-4887-4cac-bbc7-cfe85f179d33"
    },
    {
      "ProductDescription": "PRUEBA MIVIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "43a5c0ba-2740-42c9-8d5e-580135824b64"
    },
    {
      "ProductDescription": "PRUEBA MIVIVIENDA",
      "CurrencyId": 2222,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "USD",
      "ProductGUID": "1e1435cc-d848-4624-8f1f-e9a11639d479"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "3b5af2fb-f6dc-42b6-8bd0-a112629868bb"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 1115,
      "CurrencyDescription": "EURO BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "EU$",
      "ProductGUID": "7b903621-af39-46c2-bea9-7c741e8eb095"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "fdf41991-bde3-4cce-ae8e-502a02dec26b"
    },
    {
      "ProductDescription": "ADELANTO SOBRE SUELDOS",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
    },
    {
      "ProductDescription": "ADELANTO SOBRE SUELDOS",
      "CurrencyId": 1115,
      "CurrencyDescription": "EURO BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "EU$",
      "ProductGUID": "290672e7-a191-4c18-833a-2067420d8534"
    },
    {
      "ProductDescription": "ADELANTO SOBRE SUELDOS",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "3114426f-982e-4dd6-b4a7-749c8bdb926f"
    },
    {
      "ProductDescription": "CONSUMO VIAJES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "5769059c-28a8-4332-9ed3-4e70bd83bc03"
    },
    {
      "ProductDescription": "CONSUMO VIAJES",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "90862f65-0640-422e-b9d1-5eb259d2a07f"
    },
    {
      "ProductDescription": "FLEXIBLE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
    },
    {
      "ProductDescription": "VARIABLE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "a5fd93b0-558d-4841-a349-24685ae20201"
    },
    {
      "ProductDescription": "VARIABLE",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "07903ab3-3f18-4eb1-9bb2-ca2b49eba38a"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "14:16:21",
    "Numero": 13542602,
    "Servicio": "PublicLoans.getPersonProducts",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
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
