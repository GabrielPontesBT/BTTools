---
title: Get Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los productos de depósito a plazo.

**Nombre publicación:** PublicTermDeposit.getProducts

**Módulo:** Configuration.ProductsHub

**Programa:** PublicAPI.BTPHPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Listado de productos.

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
    "Token": "A8068BDF0E08AC754A7B94F5"
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
    "Token": "A8068BDF0E08AC754A7B94F5"
  },
  "products": {
    "product": [
      {
        "ProductGUID": "8fd31000-0027-4028-8a66-eede56e485dd",
        "ProductDescription": "DPF TIPO 1 - COMERCIAL 365 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "659d329f-3ad4-4984-aaa8-a3fe1561b512",
        "ProductDescription": "DPF TIPO 1 - COMERCIAL 365 EFECTIVA",
        "CurrencyId": 2222,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "55dbadfa-6056-4d88-8779-c530a291bc1b",
        "ProductDescription": "DPF TIPO 2 - COMERCIAL 360 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "ac1ab7da-04da-4ef6-8361-cc1f3d680705",
        "ProductDescription": "DPF TIPO 2 - COMERCIAL 360 EFECTIVA",
        "CurrencyId": 2222,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "8dbfe86d-577e-4a69-be2b-d996dff99393",
        "ProductDescription": "DPF TIPO 3 - CALENDARIO 360 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "8f7f241a-2158-4f84-bf4e-b44d1542bcba",
        "ProductDescription": "DPF TIPO 4 - CALENDARIO 365 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "3d0accc0-d927-4d2f-9836-447aa94c55d4",
        "ProductDescription": "DPF TIPO 5 - COMERCIAL 365 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "9e247cf8-8432-45cc-ae58-f53a6dc026d6",
        "ProductDescription": "DPF TIPO 6 - COMERCIAL 360 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "71a52072-8bc2-4a7e-b651-b54101e4b399",
        "ProductDescription": "DPF TIPO 7 - CALENDARIO 360 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "c682ad09-f728-4c98-bde7-e173fcc0aa4c",
        "ProductDescription": "DPF TIPO 8 - CALENDARIO 365 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "24786555-83a8-477a-8a8c-29e912c3fbfc",
        "ProductDescription": "INVERSION COMPARTAMOS",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "5c4f2881-c106-410b-a81c-ec4b5a71ad10",
        "ProductDescription": "DPF PP TIPO 20 - COMERCIAL 365 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "3d695110-9c7a-4dff-ba21-372c5809812f",
        "ProductDescription": "DPF PP TIPO 21 - COMERCIAL 360 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "bc3b7a65-7c3a-4cf3-b56f-f5de008951c5",
        "ProductDescription": "DPF PP TIPO 22 - CALENDARIO 360 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "bf53c34a-6351-4d3f-b664-a47b4d73997d",
        "ProductDescription": "DPF PP TIPO 22 - CALENDARIO 360 EFECTIVA",
        "CurrencyId": 2222,
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "94f94f76-449b-444a-a168-a3539a08f555",
        "ProductDescription": "DPF PP TIPO 23 - CALENDARIO 365 EFECTIVA",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "c9acda29-02d1-448a-be60-807ac89ecc2e",
        "ProductDescription": "DPF PP TIPO 24 - COMERCIAL 365 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "a67b834d-6799-4fcf-b421-b9b8ee982a5f",
        "ProductDescription": "DPF PP TIPO 25 - COMERCIAL 360 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "a2e23b98-dd3a-4bbd-9ff9-448a97030e36",
        "ProductDescription": "DPF PP TIPO 26 - CALENDARIO 360 LINEAL",
        "CurrencyId": 0,
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": 0,
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "22fb01a7-ebf9-4b98-bee3-a8877e312a3a",
        "ProductDescription": "DPF PP TIPO 27 - CALENDARIO 365 LINEAL",
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
    "Fecha": "2026-05-15",
    "Hora": "14:07:29",
    "Numero": 13472657,
    "Servicio": "PublicTermDeposit.getProducts",
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
CurrencyId | Short $<(length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(length: 6)>$ | Identificador del tipo.
KindDescription | String $<(length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(length: 36)>$ | GUID del producto.
:::
<!-- CIERRA SDT -->
