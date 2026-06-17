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
groupId | Int $<(length: 9)>$ | Identificador de grupo.
date | Date | Fecha de cobro.
memberPayments | [SdtsBTLOWPaymentOptionByMember](#sdtsbtlowpaymentoptionbymember) | Cobros por miembro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
members | [SdtsBTMGMemberAccountingEntry](#sdtsbtmgmemberaccountingentry) | Listado de asiento por integrante.

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
    "Token": "TOKEN_AQUI"
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
    "Token": "TOKEN_AQUI"
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
amount | Double $<(length: 18.2)>$ | amount
branchId | Int $<(length: 5)>$ | branchId
counterpartyGUID | String $<(length: 36)>$ | counterpartyGUID
currencyId | Short $<(length: 4)>$ | currencyId
loanGUID | String $<(length: 36)>$ | loanGUID
paymentId | Short $<(length: 3)>$ | paymentId
savingAccountGUID | String $<(length: 36)>$ | savingAccountGUID
:::

::: details SdtsBTMGMemberAccountingEntry

### SdtsBTMGMemberAccountingEntry

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberAccountingEntry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID de contraparte.
loanGUID | String $<(length: 36)>$ | Identificador único (GUID) del préstamo.
movementGUID | String $<(length: 36)>$ | GUID del asiento contable.
:::
<!-- CIERRA SDT -->
