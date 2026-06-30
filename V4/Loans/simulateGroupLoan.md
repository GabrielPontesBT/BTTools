---
title: Simulate Group Loan
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para simular un préstamo grupal.

**Nombre publicación:** PublicLoans.simulateGroupLoan

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0040

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
simulationData | [SdtsBTMGGroupSimulationData](#sdtsbtmggroupsimulationdata) | Datos de la simulación.
membersSimulation | [SdtsBTMGMemberSimulation](#sdtsbtmgmembersimulation) | Listado de integrantes para la simulación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupLoan | [SdtsBTMGLoanGroupCycleOut](#sdtsbtmgloangroupcycleout) | Datos generales del crédito grupal
memberLoan | [SdtsBTMGMemberLoanSimulationOut](#sdtsbtmgmemberloansimulationout) | Miembros del préstamo.

@tab Errores

Código | Descripción
:--------- | :-----------
980003 | No existe el producto ingresado.
20010014 | No existe el tipo de tasa ingresado.
40020006 | Contraparte no existe.
120050002 | Debe ingresar el GUID de contraparte.
120050009 | Debe ingresar el GUID de producto.
120050010 | Debe ingresar el identificador de grupo.
120050011 | Debe ingresar al menos un integrante para simular.
120060101 | El grupo no existe.
120060102 | El número de integrantes del grupo es menor al permitido.
120060110 | El número de integrantes del grupo es mayor al permitido.
120060134 | El capital solicitado del integrante no puede ser menor al adeudado.
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "groupId": 33,
  "productGUID": "8fc7a34d-eace-448e-aab5-2c4a2c4fe4b9",
  "simulationData": {
    "amortizationTypeId": 1,
    "clearanceTypeId": 1,
    "valueDate": "",
    "firstPaymentDate": "2027-08-02",
    "numberOfInstallments": 12,
    "installmentPeriodicity": 30,
    "rateTypeId": 1
  },
  "membersSimulation": [
    {
      "requestedLoanAmount": 50000,
      "rate": 15,
      "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3"
    },
    {
      "requestedLoanAmount": 10000,
      "rate": 15,
      "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960"
    },
    {
      "requestedLoanAmount": 10000,
      "rate": 15,
      "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f"
    }
  ]
}
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "groupLoan": {
    "groupId": 33,
    "cycleId": 1,
    "totalOfCapital": 73660.0,
    "memberCount": 3,
    "expirationDate": "2028-07-30",
    "term": 375,
    "installmentAmount": 10714.39,
    "totalFinancialCost": 0.0
  },
  "memberLoan": [
    {
      "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
      "capital": 51380.0,
      "installmentAmount": 6163.13,
      "simulationGUID": "b77a8b9e-2ef6-4428-b302-68d31a98a84b"
    },
    {
      "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
      "capital": 11140.0,
      "installmentAmount": 2275.63,
      "simulationGUID": "956daef1-6658-489e-ba0c-6b4a71ac47c9"
    },
    {
      "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
      "capital": 11140.0,
      "installmentAmount": 2275.63,
      "simulationGUID": "fb5ad0db-6a7f-42a3-b821-0ea8bdfa4b8f"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:23:06",
    "Numero": 13547158,
    "Servicio": "PublicLoans.simulateGroupLoan",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGGroupSimulationData

### SdtsBTMGGroupSimulationData

::: center
Los campos del tipo de dato estructurado SdtsBTMGGroupSimulationData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amortizationTypeId | Byte | Identificador del tipo de amortización.
clearanceTypeId | Byte | Identificador de la forma de despeje.
firstPaymentDate | Date | Fecha del primer pago.
installmentPeriodicity | Int | Periodicidad de cuotas.
numberOfInstallments | Int | Número de cuotas.
rateTypeId | Byte | Identificador del tipo de tasa.
valueDate | Date | Fecha valor.
:::

::: details SdtsBTMGMemberSimulation

### SdtsBTMGMemberSimulation

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberSimulation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de contraparte.
rate | Double $<(Length: 11.6)>$ | Tasa.
requestedLoanAmount | Double $<(Length: 18.2)>$ | Monto de préstamo solicitado.
:::

::: details SdtsBTMGLoanGroupCycleOut

### SdtsBTMGLoanGroupCycleOut

::: center
Los campos del tipo de dato estructurado SdtsBTMGLoanGroupCycleOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
expirationDate | Date | Fecha de vencimiento.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
installmentAmount | Double $<(Length: 18.5)>$ | Valor cuota.
memberCount | Short $<(Length: 3)>$ | Cantidad de miembros.
term | Int $<(Length: 5)>$ | Plazo.
totalFinancialCost | Double $<(Length: 11.2)>$ | Costo Financiero Total.
totalOfCapital | Double $<(Length: 18.5)>$ | Total de capital.
:::

::: details SdtsBTMGMemberLoanSimulationOut

### SdtsBTMGMemberLoanSimulationOut

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberLoanSimulationOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
capital | Double | Capital.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de contraparte.
installmentAmount | Double $<(Length: 18.2)>$ | Monto de cuota.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de simulación.
:::
<!-- CIERRA SDT -->
