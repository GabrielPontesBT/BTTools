---
title: Waive
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para condonar conceptos de un préstamo.

**Nombre publicación:** PublicLoans.waive

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0055

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
date | Date | Fecha.
waivedConcepts | [SdtsBTLOWaivedConcepts](#sdtsbtlowaivedconcepts) | Conceptos a condonar.
paymentOptions | [SdtsBTLOWPaymentOption](#sdtsbtlowpaymentoption) | Formas de cobro.

@tab Datos de Salida

No aplica.

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
    "Token": "23B342928917607ECECF65BD"
  },
  "loanGUID": "bfcf4446-d73a-4edd-a94b-ed3d152be591",
  "date": "2026-01-01",
  "waivedConcepts": {
    "arrearInterest": "",
    "capital": "1500",
    "fees": "",
    "insurances": "",
    "interest": "",
    "others": ""
  },
  "paymentOptions": [
    {
      "amount": "4206.91",
      "branchId": "0",
      "counterpartyGUID": "",
      "currencyId": "0",
      "paymentId": "15",
      "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15"
    }
  ]
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
    "Token": "23B342928917607ECECF65BD"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:38:50",
    "Numero": "13584973",
    "Servicio": "PublicLoans.waive",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWaivedConcepts

### SdtsBTLOWaivedConcepts

::: center
Los campos del tipo de dato estructurado SdtsBTLOWaivedConcepts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
arrearInterest | Double $<(Length: 18.2)>$ | Interés de mora.
capital | Double $<(Length: 18.2)>$ | Capital.
fees | Double $<(Length: 18.2)>$ | Comisiones.
insurances | Double $<(Length: 18.2)>$ | Seguros.
interest | Double $<(Length: 18.2)>$ | Interés.
others | Double $<(Length: 18.2)>$ | Otros.
:::

::: details SdtsBTLOWPaymentOption

### SdtsBTLOWPaymentOption

::: center
Los campos del tipo de dato estructurado SdtsBTLOWPaymentOption son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto de la opción de pago.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
paymentId | Short $<(Length: 3)>$ | Forma de cobro.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorros.
:::
<!-- CIERRA SDT -->
