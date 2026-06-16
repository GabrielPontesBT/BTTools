---
title: Get Loan Disbursement Options
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las opciones de desembolso.

**Nombre publicación:** PublicLoanParameters.getLoanDisbursementOptions

**Módulo:** Loans

**Programa:** PublicAPI.ABTLOPA0024

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String | GUID (identificador único global) del producto.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
disbursementOptions | [SdtsBTLoanDisbursementOption](#sdtsbtloandisbursementoption) | Listado de opciones de desembolso.

@tab Errores

Código | Descripción
:--------- | :-----------
120050009 | Debe ingresar el GUID de producto.
120050013 | El producto no pertenece al sistema de préstamos.
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
    "Token": "15A37FA9852954F6770E9868"
  },
  "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
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
    "Token": "15A37FA9852954F6770E9868"
  },
  "disbursementOptions": {
    "disbursementOption": [
      {
        "optionId": 15,
        "description": "CAJA DE AHORROS PRODUCTO (COMÚN)",
        "asksSavingAccount": true,
        "asksBranch": false,
        "asksCurrency": false,
        "asksCounterparty": false
      },
      {
        "optionId": 25,
        "description": "ORDEN DE PAGO",
        "asksSavingAccount": false,
        "asksBranch": false,
        "asksCurrency": false,
        "asksCounterparty": true
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:36:14",
    "Numero": 13568709,
    "Servicio": "PublicLoanParameters.getLoanDisbursementOptions",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLoanDisbursementOption

### SdtsBTLoanDisbursementOption

::: center
Los campos del tipo de dato estructurado SdtsBTLoanDisbursementOption son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
asksBranch | Boolean | Requiere ingresar sucursal.
asksCounterparty | Boolean | Requiere ingresar contraparte.
asksCurrency | Boolean | Requiere ingresar moneda.
asksSavingAccount | Boolean | Requiere ingresar cuenta vista.
description | String $<(length: 40)>$ | Descripción de opción de desembolso.
optionId | Short $<(length: 3)>$ | Identificador de opción de desembolso.
:::
<!-- CIERRA SDT -->
