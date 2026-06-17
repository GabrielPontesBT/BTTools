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
groupId | Int $<(length: 9)>$ | Identificador de grupo.
amount | Double $<(length: 18.2)>$ | Monto del pago.
date | Date | Fecha de pago.
payOffDate | Date | Fecha de la cuota hasta que hará el pago.
paymentOption | [SdtsBTLOWDisbursementOption](#sdtsbtlowdisbursementoption) | Forma de cobro.

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
    "Token": "C715B1A526B84ACC1C5CC8BB"
  },
  "groupId": "32",
  "amount": "7190.36",
  "date": "",
  "payOffDate": "",
  "paymentOption": {
    "amount": "7190.36",
    "branchId": "1",
    "counterpartyGUID": "",
    "currencyId": "0",
    "disbursementId": "15",
    "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15"
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
    "Token": "C715B1A526B84ACC1C5CC8BB"
  },
   "members": [
          {
            "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
            "movementGUID": "213f56ca-bab8-4fd6-bde4-66faa1b603e9",
            "loanGUID": "bf40755b-0868-4340-9397-a73f2e8e8627"
          },
          {
            "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
            "movementGUID": "64bc21f2-ffd5-4604-b5c0-f00fa662b32a",
            "loanGUID": "13e8ffc3-ce2a-43ca-a2ed-f47c67f7553c"
          },
          {
            "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
            "movementGUID": "454d7ec9-b45d-46f3-91f8-c35158c92de2",
            "loanGUID": "4568dbf1-4bbd-429b-9bdc-65ae7412ddd3"
          }
        ],
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
::: details SdtsBTLOWDisbursementOption

### SdtsBTLOWDisbursementOption

::: center
Los campos del tipo de dato estructurado SdtsBTLOWDisbursementOption son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(length: 18.2)>$ | amount
branchId | Int $<(length: 5)>$ | branchId
counterpartyGUID | String $<(length: 36)>$ | counterpartyGUID
currencyId | Short $<(length: 4)>$ | currencyId
disbursementId | Short $<(length: 3)>$ | disbursementId
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
