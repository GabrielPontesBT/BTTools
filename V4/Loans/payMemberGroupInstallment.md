---
title: Pay Member Group Installment
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para pagar cuotas de un grupo por miembro.

**Nombre publicación:** PublicLoans.payMemberGroupInstallment

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0052

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
date | Date | Fecha de cobro.
memberPayments | [SdtsBTLOWPaymentOptionByMember](#sdtsbtlowpaymentoptionbymember) | Cobros por miembro.

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
  "groupId": "35",
  "date": "",
  "memberPayments": [
    {
      "amount": "500",
      "branchId": "",
      "counterpartyGUID": "",
      "currencyId": "0",
      "loanGUID": "b9422a07-a698-4189-b6f6-5d9fa257cac0",
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
  "members": {
    "member": [
        {
          "loanGUID": "b9422a07-a698-4189-b6f6-5d9fa257cac0",
          "counterpartyGUID": "4100b799-9e33-44db-8312-6396cd2af91a",
          "movementGUID": "543fbd4b-3ad1-4388-978b-edee17c4651e"
        }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:38:50",
    "Numero": "13584973",
    "Servicio": "PublicLoans.payMemberGroupInstallment",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWPaymentOptionByMember

### SdtsBTLOWPaymentOptionByMember

::: center
Los campos del tipo de dato estructurado SdtsBTLOWPaymentOptionByMember son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto de la opción de pago.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
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
