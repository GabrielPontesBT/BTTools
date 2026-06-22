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
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
memberSimulationInput | [SdtsBTMGMemberSimulationIn](#sdtsbtmgmembersimulationin) | Datos de entrada para simular un integrante.
keepInsurancesFees | Boolean | Indica si se mantienen los seguros del preseteo.
insurancesInput | [SdtsBTLOInsuranceIn](#sdtsbtloinsurancein) | Listado de seguros de entrada para la simulación.
disbursementOptions | [SdtsBTLOWDisbursementOption](#sdtsbtlowdisbursementoption) | Listado de opciones de desembolso.

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
    "Token": "TOKEN_AQUI"
  },
  "accountingEntry": {
    "counterpartyGUID": "0b4dc6b9-388c-44b9-b637-a03f66111fb3",
    "loanGUID": "a157764e-8d23-44a9-8fa6-9392608c9e4d",
    "movementGUID": "c35e28db-0fcd-451e-9cfd-e4b24791662a"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
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
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
disbursementDate | Date | Fecha de desembolso.
firstPaymentDate | Date | Fecha del primer pago.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
rate | Double $<(Length: 11.6)>$ | Tasa.
requestedLoanAmount | Double $<(Length: 18.2)>$ | Monto de préstamo solicitado.
:::

::: details SdtsBTLOInsuranceIn

### SdtsBTLOInsuranceIn

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceIn son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

::: details SdtsBTLOWDisbursementOption

### SdtsBTLOWDisbursementOption

::: center
Los campos del tipo de dato estructurado SdtsBTLOWDisbursementOption son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto de la opción de desembolso.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
disbursementId | Short $<(Length: 3)>$ | Identificador de desembolso.
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
