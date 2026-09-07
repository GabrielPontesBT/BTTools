---
title: Simulate
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para simular un préstamo.

**Nombre publicación:** PublicLoans.simulate

**Programa:** PublicAPI.BTLOPA0012

**Alcance:** Global

**Endpoint:** /public/Loans/v1/simulate
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
simulationInput | [simulationInput](#simulationinput) | Datos de entrada para la simulación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
simulationOutput | [simulationOutput](#simulationoutput) | Datos de salida de la simulación.

@tab Errores

Código | Descripción
:--------- | :---------
980003 | No existe el producto ingresado
120050009 | Debe ingresar el GUID de producto.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Loans/v1/simulate?counterpartyGUID=a0f1dc41-1624-49dd-91a5-f28bf91e5d2c&productGUID=204db26d-f2f0-453e-b167-2b8496fc6cca' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
    "simulationInput": {
        "branchId": 1,
        "capital": 50000,
        "fees": {
            "fee": [
                {
                    "amount": 18500.5,
                    "percentage": 12.5,
                    "modified": false,
                    "modificationType": 0,
                    "feeId": 0
                }
            ]
        },
        "insurances": {
            "insurance": [
                {
                    "amount": 18500.5,
                    "commercialValue": 0,
                    "percentage": 12.5,
                    "policyNumber": "0",
                    "insuranceId": 0,
                    "policyEndDate": "2026-09-07",
                    "policyStartDate": "2026-08-08",
                    "extraPremium": 0
                }
            ]
        },
        "gracePeriodsDefinition": {},
        "firstPaymentDate": "2027-01-01",
        "economicActivityId": 0,
        "valueDate": "2026-09-07",
        "clearanceTypeId": 1,
        "rateClassTypeId": 0,
        "expirationDay": 0,
        "isResimulation": false,
        "rate": 20,
        "installmentCount": 12,
        "savesSimulation": false,
        "term": 0,
        "installmentPeriodicity": 30,
        "installmentValue": 5000,
        "expirationDate": "2027-09-07"
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
    "simulationOutput": {
        "accountingAccountDescription": "",
        "accountingAccountId": 0,
        "amortizationTypeDescription": "",
        "amortizationTypeId": 3,
        "amount": 50579.08,
        "capital": 50000.0,
        "clearanceTypeDescription": "",
        "clearanceTypeId": 1,
        "dateFirstPayment": "2026-10-30",
        "dateNextExpiration": "2027-09-30",
        "dayTypeDescription": "",
        "dayTypeId": 2,
        "disbursementInsurances": {
            "SdtsBTLOInsurance": []
        },
        "economicActivityDescription": "",
        "economicActivityId": 97000,
        "expirationDate": "2027-09-30",
        "expirationType": "P",
        "expirationTypeDescription": "",
        "fees": {
            "SdtsBTLOFee": [
                {
                    "amount": 500.0,
                    "description": "Empleados - Importe Fijo",
                    "distributionForm": "",
                    "feeId": 111,
                    "maximumAmount": 10000.0,
                    "minimumAmount": 0.0,
                    "modifiable": false,
                    "percentage": 1.0,
                    "tax": 80.0,
                    "total": 580.0
                }
            ]
        },
        "financedConcepts": {
            "SdtsBTLOConceptToFinance": [
                {
                    "amount": 50000.0,
                    "conceptDescription": "CAPITAL SOLICITADO",
                    "conceptId": 0,
                    "conceptItemDescription": "",
                    "conceptItemId": 0
                },
                {
                    "amount": 500.0,
                    "conceptDescription": "COMISIONES",
                    "conceptId": 4,
                    "conceptItemDescription": "Empleados - Importe Fijo",
                    "conceptItemId": 111
                },
                {
                    "amount": 80.0,
                    "conceptDescription": "IMPUESTO COMISIÓN DESEMBOLSO",
                    "conceptId": 5,
                    "conceptItemDescription": "Empleados - Importe Fijo",
                    "conceptItemId": 111
                }
            ]
        },
        "gracePeriodsDefinition": {
            "SdtsBTLODefinitionOfGracePeriod": []
        },
        "installmentFee1Description": "",
        "installmentFee2Description": "",
        "installmentFee3Description": "",
        "installmentFeeId1": 0,
        "installmentFeeId2": 0,
        "installmentFeeId3": 0,
        "installmentNumber": 12,
        "installmentPeriodicity": 30,
        "installmentValue": 4787.0,
        "installments": {
            "Installment": [
                {
                    "capital": 3190.79,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2026-09-07",
                    "installmentNumber": 1,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 1376.04,
                    "paymentDate": "2026-10-30",
                    "roundOff": 0.0,
                    "taxes": 220.17,
                    "term": 53,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 3917.14,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2026-10-30",
                    "installmentNumber": 2,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 749.88,
                    "paymentDate": "2026-11-30",
                    "roundOff": 0.0,
                    "taxes": 119.98,
                    "term": 31,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4014.99,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2026-11-30",
                    "installmentNumber": 3,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 665.53,
                    "paymentDate": "2026-12-30",
                    "roundOff": 0.0,
                    "taxes": 106.48,
                    "term": 30,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4039.18,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2026-12-30",
                    "installmentNumber": 4,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 644.67,
                    "paymentDate": "2027-01-31",
                    "roundOff": 0.0,
                    "taxes": 103.15,
                    "term": 32,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4200.25,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-01-31",
                    "installmentNumber": 5,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 505.82,
                    "paymentDate": "2027-02-28",
                    "roundOff": 0.0,
                    "taxes": 80.93,
                    "term": 28,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4232.6,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-02-28",
                    "installmentNumber": 6,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 477.93,
                    "paymentDate": "2027-03-30",
                    "roundOff": 0.0,
                    "taxes": 76.47,
                    "term": 30,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4291.67,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-03-30",
                    "installmentNumber": 7,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 427.01,
                    "paymentDate": "2027-04-30",
                    "roundOff": 0.0,
                    "taxes": 68.32,
                    "term": 31,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4383.99,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-04-30",
                    "installmentNumber": 8,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 347.42,
                    "paymentDate": "2027-05-30",
                    "roundOff": 0.0,
                    "taxes": 55.59,
                    "term": 30,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4450.92,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-05-30",
                    "installmentNumber": 9,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 289.72,
                    "paymentDate": "2027-06-30",
                    "roundOff": 0.0,
                    "taxes": 46.36,
                    "term": 31,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4540.88,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-06-30",
                    "installmentNumber": 10,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 212.17,
                    "paymentDate": "2027-07-30",
                    "roundOff": 0.0,
                    "taxes": 33.95,
                    "term": 30,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4615.97,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-07-30",
                    "installmentNumber": 11,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 147.44,
                    "paymentDate": "2027-08-30",
                    "roundOff": 0.0,
                    "taxes": 23.59,
                    "term": 31,
                    "total": 4787.0,
                    "typeOfGrace": ""
                },
                {
                    "capital": 4701.62,
                    "deferredInterest": 0.0,
                    "fees": {
                        "fee": []
                    },
                    "feesTotal": 0.0,
                    "initialDate": "2027-08-30",
                    "installmentNumber": 12,
                    "installmentType": "M",
                    "insurances": {
                        "insurance": []
                    },
                    "insurancesTotal": 0.0,
                    "interest": 74.4,
                    "paymentDate": "2027-09-30",
                    "roundOff": -0.92,
                    "taxes": 11.9,
                    "term": 31,
                    "total": 4787.0,
                    "typeOfGrace": ""
                }
            ]
        },
        "insuranceId1": 0,
        "insuranceId2": 0,
        "insuranceId3": 0,
        "insuranceId4": 0,
        "insuranceId5": 0,
        "interestCalculationType": "",
        "liquidCapital": true,
        "operationExpirationDate": "2027-09-30",
        "plusRate": 0.0,
        "product": {
            "currencyDescription": "PESO MEXICANO",
            "currencyId": 0,
            "currencySign": "$",
            "kindDescription": "Billete",
            "kindId": 0,
            "productDescription": "",
            "productGUID": "204db26d-f2f0-453e-b167-2b8496fc6cca"
        },
        "rate": 20.0,
        "rateClassDescription": "",
        "rateClassTypeId": 0,
        "rateTypeDescription": "",
        "rateTypeId": 1,
        "reviewDays": 0,
        "roundOff": 0,
        "simulationGUID": "a1699f90-88ea-441e-af8a-e0f24e6007d0",
        "statusDescription": "",
        "statusId": 0,
        "term": 388,
        "total": 57444.0,
        "totalFinancedCost": 25.94,
        "totalOfFeeTaxes": 0.0,
        "totalOfInstallmentFeeTaxes": 0.0,
        "totalOfInstallmentFees": 0.0,
        "totalOfInsurances": 0.0,
        "totalOfInterest": 5918.03,
        "totalOfTaxes": 946.89,
        "totalOfTerm": 388,
        "valueDate": "2026-09-07",
        "yearTypeDescription": "",
        "yearTypeId": 1
    }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details simulationInput

### simulationInput

::: center
Los campos del tipo de dato estructurado simulationInput son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
branchId | Int | Identificador de sucursal.
capital | Double | Capital.
clearanceTypeId | Byte | Identificador de tipo de liquidación.
economicActivityId | Long | Identificador de actividad económica.
expirationDate | Date | Fecha de vencimiento.
expirationDay | Int | Día de vencimiento.
fees | [fee](#fee) | Comisiones de la cuota.
firstPaymentDate | Date | Fecha del primer pago.
gracePeriodsDefinition | [gracePeriodDefinition](#graceperioddefinition) | Definición de los períodos de gracia.
installmentCount | Int | Cantidad de cuotas.
installmentPeriodicity | Int | Periodicidad de las cuotas.
installmentValue | Double | Valor de la cuota.
insurances | [insurance](#insurance) | Seguros.
isResimulation | Boolean | Indica si es una resimulación.
rate | Double | Tasa.
rateClassTypeId | Int | Identificador de tipo de clase de tasa.
savesSimulation | Boolean | Indica si guarda la simulación.
term | Int | Plazo.
valueDate | Date | Fecha de valor.
:::

::: details fee

### fee

::: center
Los campos del tipo de dato estructurado fee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
modificationType | Byte $<(Length: 1)>$ | Tipo de modificación.
modified | Boolean | Modificado.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
:::

::: details gracePeriodDefinition

### gracePeriodDefinition

::: center
Los campos del tipo de dato estructurado gracePeriodDefinition son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
extendTerm | Boolean | ExtendTerm
fixedMonth | Short | FixedMonth
initialPeriodOrFixedMonth | Short | InitialPeriodOrFixedMonth
installmentCount | Short | NumberQuotas
outreach | String | Outreach
:::

::: details insurance

### insurance

::: center
Los campos del tipo de dato estructurado insurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

::: details simulationOutput

### simulationOutput

::: center
Los campos del tipo de dato estructurado simulationOutput son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
accountingAccountId | Long | Identificador de cuenta contable.
accountingAccountDescription | String | Descripción de la cuenta contable.
amortizationTypeId | Byte | Identificador de tipo de amortización.
amortizationTypeDescription | String | Descripción del tipo de amortización.
amount | Double | Monto.
capital | Double | Capital.
clearanceTypeId | Byte | Identificador de tipo de liquidación.
clearanceTypeDescription | String | Descripción del tipo de liquidación.
dateFirstPayment | Date | Fecha del primer pago.
dateNextExpiration | Date | Fecha del próximo vencimiento.
dayTypeId | Byte | Identificador de tipo de día.
dayTypeDescription | String | Descripción del tipo de día.
disbursementInsurances | [disbursementInsurance](#disbursementinsurance) | Seguros del desembolso.
economicActivityId | Long | Identificador de actividad económica.
economicActivityDescription | String | Descripción de la actividad económica.
expirationDate | Date | Fecha de vencimiento.
expirationType | String | Tipo de vencimiento.
expirationTypeDescription | String | Descripción del tipo de vencimiento.
fees | [fee](#sdtsbtlofee) | Comisiones.
financedConcepts | [financedConcept](#financedconcept) | Conceptos financiados.
firstReviewDate | Date | Fecha de la primera revisión.
gracePeriodsDefinition | [gracePeriodDefinition](#graceperioddefinition) | Definición de los períodos de gracia.
installmentFee1Description | String | Descripción de comisión de cuota 1.
installmentFee2Description | String | Descripción de comisión de cuota 2.
installmentFee3Description | String | Descripción de comisión de cuota 3.
installmentFeeId1 | Int | Identificador de comisión de cuota 1.
installmentFeeId2 | Int | Identificador de comisión de cuota 2.
installmentFeeId3 | Int | Identificador de comisión de cuota 3.
installmentNumber | Int | Número de cuota.
installmentPeriodicity | Int | Periodicidad de las cuotas.
installments | [installment](#installment) | Cuotas.
installmentValue | Double | Valor de la cuota.
insuranceId1 | Int | Identificador de seguro 1.
insuranceId2 | Int | Identificador de seguro 2.
insuranceId3 | Int | Identificador de seguro 3.
insuranceId4 | Int | Identificador de seguro 4.
insuranceId5 | Int | Identificador de seguro 5.
interestCalculationType | String | Tipo de cálculo de interés.
lastReviewDay | Date | Último día de revisión.
liquidCapital | Boolean | Indica si el capital es líquido.
operationExpirationDate | Date | Fecha de vencimiento de la operación.
plusRate | Double | Tasa adicional.
product | [product](#product) | Producto.
rate | Double | Tasa.
rateClassDescription | String | Descripción de la clase de tasa.
rateClassTypeId | Int | Identificador de tipo de clase de tasa.
rateTypeId | Byte | Identificador de tipo de tasa.
rateTypeDescription | String | Descripción del tipo de tasa.
reviewDays | Int | Días de revisión.
roundOff | Byte | Redondeo.
simulationGUID | String | GUID de la simulación.
statusId | Short | Identificador de estado.
statusDescription | String | Descripción del estado.
term | Int | Plazo.
total | Double | Total.
totalFinancedCost | Double | Costo financiero total.
totalOfFeeTaxes | Double | Total de impuestos de comisiones.
totalOfInstallmentFees | Double | Total de comisiones de cuota.
totalOfInstallmentFeeTaxes | Double | Total de impuestos de comisiones de cuota.
totalOfInsurances | Double | Total de seguros.
totalOfInterest | Double | Total de interés.
totalOfTaxes | Double | Total de impuestos.
totalOfTerm | Int | Total del plazo.
valueDate | Date | Fecha de valor.
yearTypeId | Byte | Identificador de tipo de año.
yearTypeDescription | String | Descripción del tipo de año.
:::

::: details disbursementInsurance

### disbursementInsurance

::: center
Los campos del tipo de dato estructurado disbursementInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
allowsModification | Boolean | Permite modificación.
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
chargeTypeId | String $<(Length: 1)>$ | Identificador del tipo de cargo.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
description | String $<(Length: 30)>$ | Descripción del seguro.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
hasExtraPremium | Boolean | Tiene prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
insuranceTypeId | Int $<(Length: 5)>$ | Identificador del tipo de seguro.
insuranceTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

::: details fee

### fee

::: center
Los campos del tipo de dato estructurado fee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
description | String $<(Length: 30)>$ | Descripción de la comisión.
distributionForm | String $<(Length: 1)>$ | Forma de distribución.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
maximumAmount | Double $<(Length: 18.2)>$ | Monto máximo.
minimumAmount | Double $<(Length: 18.2)>$ | Monto mínimo.
modifiable | Boolean | Modificable.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
tax | Double $<(Length: 18.2)>$ | Impuesto.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details financedConcept

### financedConcept

::: center
Los campos del tipo de dato estructurado financedConcept son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double | Monto del concepto a financiar.
conceptId | Long | Identificador del concepto.
conceptDescription | String | Descripción del concepto.
conceptItemId | Int | Identificador del ítem de concepto.
conceptItemDescription | String | Descripción del ítem de concepto.
:::

::: details gracePeriodDefinition

### gracePeriodDefinition

::: center
Los campos del tipo de dato estructurado gracePeriodDefinition son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
extendTerm | Boolean | ExtendTerm
fixedMonth | Short | FixedMonth
initialPeriodOrFixedMonth | Short | InitialPeriodOrFixedMonth
installmentCount | Short | NumberQuotas
outreach | String | Outreach
:::

::: details installment

### installment

::: center
Los campos del tipo de dato estructurado Installment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital | Double $<(Length: 18.2)>$ | Capital.
deferredInterest | Double $<(Length: 18.2)>$ | Intereses diferidos.
fees | [fee](#fee) | Comisiones.
feesTotal | Double $<(Length: 18.2)>$ | Total de comisiones.
initialDate | Date | Fecha inicial.
installmentNumber | Short $<(Length: 2)>$ | Número de cuota.
installmentType | String $<(Length: 1)>$ | Tipo de cuota.
insurances | [insurance](#insurance) | Seguros.
insurancesTotal | Double $<(Length: 18.2)>$ | Total de seguros.
interest | Double $<(Length: 18.2)>$ | Interés.
paymentDate | Date | Fecha de pago.
roundOff | Double $<(Length: 18.2)>$ | Redondeo.
taxes | Double $<(Length: 18.2)>$ | Impuestos.
term | Int $<(Length: 5)>$ | Plazo.
total | Double | Total.
typeOfGrace | String $<(Length: 1)>$ | Tipo de gracia.
:::

::: details fee

### fee

::: center
Los campos del tipo de dato estructurado fee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
feeName | String $<(Length: 30)>$ | Descripción.
taxes | Double $<(Length: 18.2)>$ | Impuestos.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details insurance

### insurance

::: center
Los campos del tipo de dato estructurado insurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
description | String $<(Length: 40)>$ | Descripción del seguro.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
:::

::: details product

### product

::: center
Los campos del tipo de dato estructurado product son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
currencyDescription | String $<(Length: 30)>$ | Descripción de moneda.
currencySign | String $<(Length: 5)>$ | Signo de moneda.
kindId | Int $<(Length: 6)>$ | Identificador del papel.
kindDescription | String $<(Length: 30)>$ | Descripción del papel.
productDescription | String $<(Length: 30)>$ | Descripción del producto.
productGUID | String $<(Length: 36)>$ | Identificador único global (GUID) del producto.
:::
<!-- CIERRA SDT -->
