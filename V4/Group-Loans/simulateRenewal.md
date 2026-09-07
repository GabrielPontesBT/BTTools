---
title: Simulate Renewal
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para simular la renovación de un préstamo grupal.

**Nombre publicación:** PublicGroupLoans.simulateRenewal

**Programa:** PublicAPI.BTLOPA0046

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/simulateRenewal
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
renewingMembers | [renewingMember](#renewingmember) | Listado de integrantes que renuevan.
newMembers | [newMember](#newmember) | Listado de nuevos integrantes.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupLoan | [groupLoan](#grouploan) | Datos del crédito grupal simulado.
members | [member](#member) | Listado de integrantes del crédito grupal.

@tab Errores

Código | Descripción
:--------- | :---------
120050002 | Debe ingresar el GUID de contraparte.
120050009 | Debe ingresar el GUID de producto.
120050010 | Debe ingresar el GUID de grupo.
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
  '{{baseUrl}}/public/GroupLoans/v1/simulateRenewal?productGUID=bf0d7e10-dce6-4bd4-b866-9984556613ec' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 4,
  "simulationData": {
    "amortizationTypeId": "3",
    "clearanceTypeId": "1",
    "firstPaymentDate": "",
    "installmentPeriodicity": 30,
    "numberOfInstallments": 10,
    "rateTypeId": "1",
    "valueDate": "2027-09-21"
  },
  "renewingMembers": {
    "renewingMember": [
      {
        "counterpartyGUID": "46a24688-e781-4b26-af46-989275e55266",
        "rate": 15,
        "requestedLoanAmount": 22000
      },
      {
        "counterpartyGUID": "72888c65-1d41-4eaf-97e3-620ff1c2b538",
        "rate": 15,
        "requestedLoanAmount": 22000
      },
      {
        "counterpartyGUID": "2eb7f4a7-88df-4601-a5a8-5efc0760a2d8",
        "rate": 15,
        "requestedLoanAmount": 22000
      }
    ]
  },
  "newMembers": {
    "newMember": [
      {
        "counterpartyGUID": "88c8643e-d0bf-45d6-a919-547812e1bb6a",
        "memberTypeId": "3",
        "rate": 15,
        "requestedLoanAmount": 12000
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
    "cycleId": 2,
    "expirationDate": "2028-07-21",
    "groupId": 4,
    "installmentAmount": 8534,
    "memberCount": 4,
    "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec",
    "rate": 15,
    "term": 300,
    "totalFinancialCost": 22.01,
    "totalOfCapital": 78000
  },
  "members": {
    "member": [
      {
        "capital": 22000,
        "counterpartyGUID": "46a24688-e781-4b26-af46-989275e55266",
        "disbursementAmount": 606.11,
        "installmentAmount": 2407,
        "simulationGUID": "b24e7ab4-5db7-46e5-9c6d-bee8d6595778",
        "totalFinancialCost": 22.01
      },
      {
        "capital": 22000,
        "counterpartyGUID": "72888c65-1d41-4eaf-97e3-620ff1c2b538",
        "disbursementAmount": 606.11,
        "installmentAmount": 2407,
        "simulationGUID": "acf7f61e-20ea-4f05-bfe6-cabe8e01354b",
        "totalFinancialCost": 22.01
      },
      {
        "capital": 22000,
        "counterpartyGUID": "2eb7f4a7-88df-4601-a5a8-5efc0760a2d8",
        "disbursementAmount": 606.11,
        "installmentAmount": 2407,
        "simulationGUID": "bc8ab99b-d418-40ab-89ba-d5b459ccc5ed",
        "totalFinancialCost": 22.01
      },
      {
        "capital": 12000,
        "counterpartyGUID": "88c8643e-d0bf-45d6-a919-547812e1bb6a",
        "disbursementAmount": 12000,
        "installmentAmount": 1313,
        "simulationGUID": "56331d88-9b07-4b99-b479-06209db760f0",
        "totalFinancialCost": 22.01
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
amortizationTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de amortización.
clearanceTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de despeje.
firstPaymentDate | Date | Fecha del primer pago.
installmentPeriodicity | Int $<(Length: 5)>$ | Periodicidad de cuotas.
numberOfInstallments | Int $<(Length: 5)>$ | Número de cuotas.
rateTypeId | Byte $<(Length: 1)>$ | Identificador del tipo de tasa.
valueDate | Date | Fecha valor.
:::

::: details renewingMember

### renewingMember

::: center
Los campos del tipo de dato estructurado renewingMember son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
rate | Double $<(Length: 11.6)>$ | Tasa.
requestedLoanAmount | Double $<(Length: 18.2)>$ | Monto de préstamo solicitado.
:::

::: details newMember

### newMember

::: center
Los campos del tipo de dato estructurado newMember son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
rate | Double $<(Length: 11)>$ | Tasa.
requestedLoanAmount | Double $<(Length: 18)>$ | Monto de préstamo solicitado.
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

::: details member

### member

::: center
Los campos del tipo de dato estructurado member son los siguientes:

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
