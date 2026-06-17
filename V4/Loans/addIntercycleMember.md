---
title: Add Intercycle Member
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para agregar un integrante como interciclo.

**Nombre publicación:** PublicLoans.addIntercycleMember

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0048

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(length: 9)>$ | Identificador de grupo.
memberSimulationInput | [SdtsBTMGMemberSimulationIn](#sdtsbtmgmembersimulationin) | Datos de entrada para simular un integrante.
keepInsurancesFees | Boolean | Mantiene los seguros del preseteo.
insurancesInput | [SdtsBTLOInsuranceIn](#sdtsbtloinsurancein) | Listado de seguros de entrada que se consideran al simular.
disbursementOptions | [SdtsBTLOWDisbursementOption](#sdtsbtlowdisbursementoption) | Listado de opciones de desembolso.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
accountingEntry | [SdtsBTMGMemberAccountingEntry](#sdtsbtmgmemberaccountingentry) | Asiento de desembolso.

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
  "groupId": "70",
  "memberSimulationInput": {
    "counterpartyGUID": "0b4dc6b9-388c-44b9-b637-a03f66111fb3",
    "disbursementDate": "2027-07-30",
    "firstPaymentDate": "2027-08-30",
    "memberTypeId": "3",
    "rate": "15",
    "requestedLoanAmount": "7500"
  },
  "keepInsurancesFees": "false",
  "insurancesInput": [
    {
      "amount": "5",
      "commercialValue": "",
      "extraPremium": "",
      "insuranceId": "1",
      "percentage": "0.05",
      "policyEndDate": "",
      "policyNumber": "",
      "policyStartDate": ""
    }
  ],
  "disbursementOptions": [
    {
      "amount": "7500",
      "branchId": "1",
      "counterpartyGUID": "0b4dc6b9-388c-44b9-b637-a03f66111fb3",
      "currencyId": "0",
      "disbursementId": "25",
      "savingAccountGUID": ""
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
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "",
    "Hora": "",
    "Numero": 0,
    "Servicio": "PublicLoans.addIntercycleMember",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGMemberSimulationIn

### SdtsBTMGMemberSimulationIn

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberSimulationIn son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID de contraparte.
disbursementDate | Date | Fecha de desembolso.
firstPaymentDate | Date | Fecha de primer pago.
memberTypeId | Byte $<(length: 2)>$ | Tipo de integrante.
rate | Double $<(length: 11.6)>$ | Tasa.
requestedLoanAmount | Double $<(length: 18.2)>$ | Monto de préstamo solicitado.
:::

::: details SdtsBTLOInsuranceIn

### SdtsBTLOInsuranceIn

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceIn son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(length: 18.2)>$ | Monto agregado.
commercialValue | Double $<(length: 18.2)>$ | Valor comercial.
extraPremium | Double $<(length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(length: 9)>$ | Identificador de seguro.
percentage | Double $<(length: 11.6)>$ | Porcentaje modificado.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

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
