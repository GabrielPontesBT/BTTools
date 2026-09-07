---
title: Collection Options
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de las opciones de cobro de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.collectionOptions

**Programa:** PublicAPI.BTLOPA0024

**Alcance:** Global

**Endpoint:** /public/LoanParameters/v1/collectionOptions
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
paymentOptions | [paymentOption](#paymentoption) | Listado de opciones de cobro.

@tab Errores

Código | Descripción
:--------- | :---------
120050009 | Debe ingresar el GUID de producto.
120050013 | El producto no pertenece al sistema de préstamos.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/LoanParameters/v1/collectionOptions?productGUID=bf0d7e10-dce6-4bd4-b866-9984556613ec' \
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
  "paymentOptions": {
    "paymentOption": [
      {
        "asksBranch": false,
        "asksCounterparty": false,
        "asksCurrency": false,
        "asksSavingAccount": true,
        "description": "CAJA DE AHORROS",
        "optionId": 20
      },
      {
        "asksBranch": false,
        "asksCounterparty": false,
        "asksCurrency": false,
        "asksSavingAccount": true,
        "description": "CTAS. POR PAGAR - GRUPALES",
        "optionId": 65
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details paymentOption

### paymentOption

::: center
Los campos del tipo de dato estructurado paymentOption son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
asksBranch | Boolean | ¿Requiere ingresar sucursal?
asksCounterparty | Boolean | ¿Requiere ingresar contraparte?
asksCurrency | Boolean | ¿Requiere ingresar moneda?
asksSavingAccount | Boolean | ¿Requiere ingresar cuenta vista?
description | String $<(Length: 40)>$ | Descripción de la opción de cobro.
optionId | Short $<(Length: 3)>$ | Identificador de la opción de cobro.
:::
<!-- CIERRA SDT -->
