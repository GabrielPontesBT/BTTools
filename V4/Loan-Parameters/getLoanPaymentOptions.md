---
title: Get Loan Payment Options
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las opciones de cobro.

**Nombre publicación:** PublicLoanParameters.getLoanPaymentOptions

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0024

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
paymentOptions | [SdtsBTLoanDisbursementOption](#sdtsbtloandisbursementoption) | Listado de opciones de cobro.

@tab Errores

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
    "Token": "4DA0C1E4009B6706B0882690"
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
    "Token": "4DA0C1E4009B6706B0882690"
  },
  "paymentOptions": {
    "paymentOption": [
      {
        "optionId": 15,
        "description": "CAJA DE AHORROS PRODUCTO (COMÚN)",
        "asksSavingAccount": true,
        "asksBranch": false,
        "asksCurrency": false,
        "asksCounterparty": false
      },
      {
        "optionId": 65,
        "description": "CTAS. POR PAGAR - GRUPALES",
        "asksSavingAccount": true,
        "asksBranch": false,
        "asksCurrency": false,
        "asksCounterparty": false
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:33:11",
    "Numero": 13584898,
    "Servicio": "PublicLoanParameters.getLoanPaymentOptions",
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
description | String $<(Length: 40)>$ | Descripción de la opción de desembolso.
optionId | Short $<(Length: 3)>$ | Identificador.
:::
<!-- CIERRA SDT -->
