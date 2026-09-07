---
title: Simulate
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para simular un préstamo grupal.

**Nombre publicación:** PublicGroupLoans.simulate

**Programa:** PublicAPI.BTLOPA0040

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/simulate
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
simulationData | [simulationData](#simulationdata) | Datos de entrada para la simulación.
membersSimulation | [memberSimulation](#membersimulation) | Listado de integrantes para la simulación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupLoan | [groupLoan](#grouploan) | Datos generales del crédito grupal.
memberLoan | [memberLoan](#memberloan) | Datos del préstamo del miembro.

@tab Errores

Código | Descripción
:--------- | :---------
120050002 | Debe ingresar el GUID de contraparte.
120050009 | Debe ingresar el GUID de producto.
120050010 | Debe ingresar el GUID de grupo.
120050011 | Debe ingresar al menos un integrante para simular.
120060101 | El grupo no existe
120060126 | No existe configuración para el ciclo
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/simulate?productGUID=8fc7a34d-eace-448e-aab5-2c4a2c4fe4b9' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 33,
  "simulationData": {
    "amortizationTypeId": 1,
    "clearanceTypeId": 1,
    "firstPaymentDate": "2027-08-02",
    "installmentPeriodicity": 30,
    "numberOfInstallments": 12,
    "rateTypeId": 1,
    "valueDate": ""
  },
  "membersSimulation": {
    "memberSimulation": [
      {
        "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
        "rate": 15,
        "requestedLoanAmount": 50000
      },
      {
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
        "rate": 15,
        "requestedLoanAmount": 10000
      },
      {
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
        "rate": 15,
        "requestedLoanAmount": 10000
      }
    ]
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
  "groupLoan": {
    "cycleId": 1,
    "expirationDate": "2028-07-30",
    "groupId": 33,
    "installmentAmount": 10714.39,
    "memberCount": 3,
    "term": 375,
    "totalFinancialCost": 0,
    "totalOfCapital": 73660
  },
  "memberLoan": {
    "memberLoan": [
      {
        "capital": 51380,
        "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
        "installmentAmount": 6163.13,
        "simulationGUID": "b77a8b9e-2ef6-4428-b302-68d31a98a84b"
      },
      {
        "capital": 11140,
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
        "installmentAmount": 2275.63,
        "simulationGUID": "956daef1-6658-489e-ba0c-6b4a71ac47c9"
      },
      {
        "capital": 11140,
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
        "installmentAmount": 2275.63,
        "simulationGUID": "fb5ad0db-6a7f-42a3-b821-0ea8bdfa4b8f"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details simulationData

### simulationData

::: center
Los campos del tipo de dato estructurado simulationData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amortizationTypeId | Byte | Identificador del tipo de amortización.
clearanceTypeId | Byte | Identificador del tipo de despeje.
firstPaymentDate | Date | Fecha del primer pago.
installmentPeriodicity | Int | Periodicidad de cuotas.
numberOfInstallments | Int | Número de cuotas.
rateTypeId | Byte | Identificador del tipo de tasa.
valueDate | Date | Fecha valor.
:::

::: details memberSimulation

### memberSimulation

::: center
Los campos del tipo de dato estructurado memberSimulation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
rate | Double $<(Length: 11.6)>$ | Tasa.
requestedLoanAmount | Double $<(Length: 18.2)>$ | Monto de préstamo solicitado.
:::

::: details groupLoan

### groupLoan

::: center
Los campos del tipo de dato estructurado groupLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amortizationType | Byte $<(Length: 2)>$ | Tipo de amortización.
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
expirationDate | Date | Fecha de vencimiento.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
installmentAmount | Double $<(Length: 18)>$ | Valor cuota.
installmentPeriodicity | Int $<(Length: 5)>$ | Periodo entre cuotas.
memberCount | Short $<(Length: 3)>$ | Cantidad de miembros.
numberOfInstallments | Int $<(Length: 5)>$ | Número de cuotas.
productGUID | String $<(Length: 36)>$ | Identificador único global (GUID) del producto.
rate | Double $<(Length: 11)>$ | Tasa.
rateType | Byte $<(Length: 1)>$ | Tipo de tasa.
term | Int $<(Length: 5)>$ | Plazo.
totalFinancialCost | Double $<(Length: 11)>$ | Costo Financiero Total.
totalOfCapital | Double $<(Length: 18)>$ | Total de capital.
:::

::: details memberLoan

### memberLoan

::: center
Los campos del tipo de dato estructurado memberLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital | Double $<(Length: 18.2)>$ | Capital.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
disbursementAmount | Double $<(Length: 18.2)>$ | Monto de desembolso.
installmentAmount | Double $<(Length: 18.2)>$ | Monto de cuota.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.
totalFinancialCost | Double $<(Length: 11.6)>$ | Costo financiero total.
:::
<!-- CIERRA SDT -->
