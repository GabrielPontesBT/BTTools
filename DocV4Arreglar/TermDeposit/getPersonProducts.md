---
title: Get Person Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los productos de depósito a plazo que una persona puede contratar.

**Nombre publicación:** PublicTermDeposit.getPersonProducts

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
personGUID | String $<(length: 36)>$ | GUID (identificador único global) de la persona.

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
  },
  "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d"
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
        "ProductGUID": "24786555-83a8-477a-8a8c-29e912c3fbfc",
        "ProductDescription": "INVERSION COMPARTAMOS",
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
    "Hora": "14:07:32",
    "Numero": 13472658,
    "Servicio": "PublicTermDeposit.getPersonProducts",
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
