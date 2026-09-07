---
title: Products
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de productos de préstamo grupal.

**Nombre publicación:** PublicGroupLoans.products

**Programa:** PublicAPI.BTLOPA0057

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/products
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

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
  '{{baseUrl}}/public/GroupLoans/v1/products' \
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
        "currencyDescription": "PESO MEXICANO",
        "currencyId": 0,
        "currencySign": "$",
        "kindDescription": "Billete",
        "kindId": 0,
        "productDescription": "GRUPALES - SEGUROS EN LAS CUOTAS",
        "productGuid": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
      },
      {
        "currencyDescription": "PESO MEXICANO",
        "currencyId": 0,
        "currencySign": "$",
        "kindDescription": "Billete",
        "kindId": 0,
        "productDescription": "GRUPALES - CON CAPITALIZACIÓN DE SEGUROS",
        "productGuid": "951c9591-4438-445e-bf43-6b46c271338a"
      },
      {
        "currencyDescription": "PESO MEXICANO",
        "currencyId": 0,
        "currencySign": "$",
        "kindDescription": "Billete",
        "kindId": 0,
        "productDescription": "CRÉDITO ADICIONAL PLUS (GRUPAL)",
        "productGuid": "31b7b05c-b051-450e-ac68-4d85edeb2085"
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
currencyDescription | String $<(Length: 30)>$ | Descripción de la moneda.
currencySign | String $<(Length: 4)>$ | Símbolo de la moneda.
kindId | Int $<(Length: 6)>$ | Identificador del tipo.
kindDescription | String $<(Length: 30)>$ | Descripción del tipo.
productDescription | String | Descripción del producto.
productGuid | String $<(Length: 36)>$ | GUID del producto.
:::
<!-- CIERRA SDT -->
