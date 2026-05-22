---
title: Get Person Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los productos de préstamo que una persona puede contratar.

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
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "personGUID": ""
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
  "products": {
    "product": []
  },
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 40050001,
        "Severity": "E",
        "Target": "",
        "Description": ""
      }
    ]
  },
  "Btoutreq": {
    "Estado": "NEG_ERROR",
    "Fecha": "2026-05-22",
    "Hora": "15:56:32",
    "Numero": 13505890,
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
CurrencyId | Short $<(length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(length: 6)>$ | Identificador del tipo.
KindDescription | String $<(length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(length: 36)>$ | GUID del producto.
:::
<!-- CIERRA SDT -->
