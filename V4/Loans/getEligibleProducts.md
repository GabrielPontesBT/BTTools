---
title: Eligible Products
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los productos de préstamo que una persona puede contratar.

**Nombre publicación:** PublicLoans.eligibleProducts

**Programa:** PublicAPI.BTPHPA0001

**Alcance:** Global

**Endpoint:** /public/Loans/v1/eligibleProducts
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
products | [product](#product) | Listado de productos.

@tab Errores

No aplica.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/eligibleProducts?personGUID=68797e38-8bfa-43c1-9edb-5c86c12be48b' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "products": {
    "product": [
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "COMPRA DE VIVIENDA",
        "productGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "COMPRA DE VIVIENDA",
        "productGUID": "c9d5bcd0-8872-41b3-b5a4-9dff8ac7e235"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "REFACCIÓN DE VIVIENDA",
        "productGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "REFACCIÓN DE VIVIENDA",
        "productGUID": "e83c667b-4887-4cac-bbc7-cfe85f179d33"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA MIVIVIENDA",
        "productGUID": "43a5c0ba-2740-42c9-8d5e-580135824b64"
      },
      {
        "currencyId": 2222,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE",
        "currencySign": "USD",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA MIVIVIENDA",
        "productGUID": "1e1435cc-d848-4624-8f1f-e9a11639d479"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "3b5af2fb-f6dc-42b6-8bd0-a112629868bb"
      },
      {
        "currencyId": 1115,
        "currencyDescription": "EURO BILLETE",
        "currencySign": "EU$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "7b903621-af39-46c2-bea9-7c741e8eb095"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "fdf41991-bde3-4cce-ae8e-502a02dec26b"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "ADELANTO SOBRE SUELDOS",
        "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
      },
      {
        "currencyId": 1115,
        "currencyDescription": "EURO BILLETE",
        "currencySign": "EU$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "ADELANTO SOBRE SUELDOS",
        "productGUID": "290672e7-a191-4c18-833a-2067420d8534"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "ADELANTO SOBRE SUELDOS",
        "productGUID": "3114426f-982e-4dd6-b4a7-749c8bdb926f"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "CONSUMO VIAJES",
        "productGUID": "5769059c-28a8-4332-9ed3-4e70bd83bc03"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "CONSUMO VIAJES",
        "productGUID": "90862f65-0640-422e-b9d1-5eb259d2a07f"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "FLEXIBLE",
        "productGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "VARIABLE",
        "productGUID": "a5fd93b0-558d-4841-a349-24685ae20201"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "VARIABLE",
        "productGUID": "07903ab3-3f18-4eb1-9bb2-ca2b49eba38a"
      }
    ]
  }
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
:--------- | :--------- | :---------
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
currencyDescription | String $<(Length: 30)>$ | Descripción de moneda.
currencySign | String $<(Length: 5)>$ | Signo de moneda.
kindId | Int $<(Length: 6)>$ | Identificador del papel.
kindDescription | String $<(Length: 30)>$ | Descripción del papel.
productDescription | String $<(Length: 30)>$ | Descripción del producto.
productGUID | String $<(Length: 36)>$ | Identificador único global (GUID) del producto.
:::
<!-- CIERRA SDT -->
