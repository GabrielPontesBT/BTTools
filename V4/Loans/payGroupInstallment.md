---
title: Pay Group Installment
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para para cuotas de un grupo.

**Nombre publicación:** PublicLoans.payGroupInstallment

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0051

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
date | Date | Fecha de pago.
paymentOption | [SdtsBTLOWPaymentOption](#sdtsbtlowpaymentoption) | Forma de cobro.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
members | [SdtsBTMGMemberAccountingEntry](#sdtsbtmgmemberaccountingentry) | Listado de asiento por integrante.

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
  "date": "",
  "groupId": 12,
  "paymentOption": {
    "branchId": 1,
    "amount": 4608.02,
    "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15",
    "paymentId": 15,
    "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
    "currencyId": 0
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
    "Token": "23B342928917607ECECF65BD"
  },
  "members": {
    "member": [
      {
        "loanGUID": "798cd979-1763-4113-a58a-0eb8e467f4fb",
        "counterpartyGUID": "a6e25e76-c448-4b28-9231-978611764c27",
        "movementGUID": "d7be1959-df05-4cce-804e-9e3e75530142"
      },
      {
        "loanGUID": "d058c6a1-259e-4c5b-84cd-8ac26b7b3b4a",
        "counterpartyGUID": "c5d5ac06-dae6-445f-8d4e-0c6d9cd86a61",
        "movementGUID": "7fbd19b2-610c-454c-ab52-5bcbef9cc1a4"
      },
      {
        "loanGUID": "cac2a75d-3261-49f6-ad8a-81c949cab573",
        "counterpartyGUID": "13bbff6b-2a97-4463-bcd9-68c427f60237",
        "movementGUID": "badb7b6b-1d47-4947-a936-80bb9b15dfad"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:57:33",
    "Numero": 13585252,
    "Servicio": "PublicLoans.payGroupInstallment",
    "Requerimiento": 1,
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
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

::: details SdtsBTMGMemberAccountingEntry

### SdtsBTMGMemberAccountingEntry

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberAccountingEntry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.
:::
<!-- CIERRA SDT -->
