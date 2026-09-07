---
title: Status
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la situación de un crédito grupal.

**Nombre publicación:** PublicGroupLoans.status

**Programa:** PublicAPI.BTLOPA0049

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/status
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
queryDate | Date | Fecha de consulta.
interestModality | Byte $<(Length: 2)>$ | Modalidad de interés.
queryMode | String $<(Length: 3)>$ | Modo de consulta.
includePayments | Boolean | Indica si se incluyen los pagos.
includeFuturePayments | Boolean | Indica si se incluyen pagos futuros.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
totalDebt | Double $<(Length: 18.2)>$ | Deuda total.
totalOfCapital | Double $<(Length: 18.2)>$ | Total de capital.
totalOfCapitalTaxes | Double $<(Length: 18.2)>$ | Total de impuestos sobre capital.
totalOfInterest | Double $<(Length: 18.2)>$ | Total de interés.
totalOfInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos sobre interés.
totalOfDeferredInterest | Double $<(Length: 18.2)>$ | Total de interés diferido.
totalOfDeferredInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos sobre interés diferido.
totalOfDistributedInterest | Double $<(Length: 18.2)>$ | Total de interés distribuido.
totalOfDistributedInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos sobre interés distribuido.
totalOfInterestArrears | Double $<(Length: 18.2)>$ | Total de interés por mora.
totalOfInterestArrearsTaxes | Double $<(Length: 18.2)>$ | Total de impuestos sobre interés por mora.
totalOfInterestArrearsFees | Double $<(Length: 18.2)>$ | Total de comisiones sobre interés por mora.
totalOfCompensatoryInterest | Double $<(Length: 18.2)>$ | Total de interés compensatorio.
totalOfCompensatoryInterestFees | Double $<(Length: 18.2)>$ | Total de comisiones sobre interés compensatorio.
totalOfPunitiveInterest | Double $<(Length: 18.2)>$ | Total de interés punitorio.
totalOfPunitiveInterestFees | Double $<(Length: 18.2)>$ | Total de comisiones sobre interés punitorio.
totalOfTaxes | Double $<(Length: 18.2)>$ | Total de impuestos.
totalOfInsurances | Double $<(Length: 18.2)>$ | Total de seguros.
totalOfDistributedInsurances | Double $<(Length: 18.2)>$ | Total de seguros distribuidos.
totalOfConcessional | Double $<(Length: 18.2)>$ | Total de montos concesionales.
totalOfCapitalConcessional | Double $<(Length: 18.2)>$ | Total de capital concesional.
totalOfFees | Double $<(Length: 18.2)>$ | Total de comisiones.
totalTaxesOnFeesInQuotas | Double $<(Length: 18.2)>$ | Total de impuestos sobre comisiones en cuotas.
totalOfCancelationFee | Double $<(Length: 18.2)>$ | Total de comisión por cancelación.
totalOfTaxesInCancelationFee | Double $<(Length: 18.2)>$ | Total de impuestos en comisión por cancelación.
totalOfRoundOff | Double $<(Length: 18.2)>$ | Total de redondeo.
daysInArrears | Int $<(Length: 9)>$ | Días de atraso.
kindValue | Double $<(Length: 15.8)>$ | Precio de especie.
installmentSchedule | [installmentScheduleItem](#installmentscheduleitem) | Listado de cuotas.

@tab Errores

Código | Descripción
:--------- | :---------
120050010 | Debe ingresar el GUID de grupo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/status?groupId=70&queryDate=2027-07-30&interestModality=2&queryMode=QRY&includePayments=true&includeFuturePayments=true' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "totalDebt": 24425.82,
  "totalOfCapital": 24000,
  "totalOfCapitalTaxes": 0,
  "totalOfInterest": 0,
  "totalOfInterestTaxes": 0,
  "totalOfDeferredInterest": 0,
  "totalOfDeferredInterestTaxes": 0,
  "totalOfDistributedInterest": 0,
  "totalOfDistributedInterestTaxes": 0,
  "totalOfInterestArrears": 0,
  "totalOfInterestArrearsTaxes": 0,
  "totalOfInterestArrearsFees": 0,
  "totalOfCompensatoryInterest": 0,
  "totalOfCompensatoryInterestFees": 0,
  "totalOfPunitiveInterest": 0,
  "totalOfPunitiveInterestFees": 0,
  "totalOfTaxes": 0,
  "totalOfInsurances": 425.82,
  "totalOfDistributedInsurances": 0,
  "totalOfConcessional": 0,
  "totalOfCapitalConcessional": 0,
  "totalOfFees": 0,
  "totalTaxesOnFeesInQuotas": 0,
  "totalOfCancelationFee": 0,
  "totalOfTaxesInCancelationFee": 0,
  "totalOfRoundOff": 0,
  "daysInArrears": 0,
  "kindValue": 0,
  "installmentSchedule": {
    "installmentScheduleItem": [
      {
        "arrearDays": 0,
        "arrearFee1": "0.00",
        "arrearFee2": "0.00",
        "arrearFee3": "0.00",
        "arrearInterest": "0.00",
        "arrearTax": "0.00",
        "capital": "3835.85",
        "capitalConcessional": "0.00",
        "capitalTax": "0.00",
        "compensatoryInterest": "0.00",
        "compensatoryInterestTax": "0.00",
        "concessional": "0.00",
        "decimalsNumber": 0,
        "defaultDate": "",
        "deferredInterests": "0.00",
        "deferredInterestTax1": "0.00",
        "deferredInterestTax2": "0.00",
        "deferredInterestTax3": "0.00",
        "distributedInsurance1": "0.00",
        "distributedInsurance2": "0.00",
        "distributedInterest": "0.00",
        "distributedInterestTax1": "0.00",
        "distributedInterestTax2": "0.00",
        "distributedInterestTax3": "0.00",
        "endDate": "2027-08-30",
        "extendsTerm": false,
        "fees": {
          "SdtsBTLOPAFee": []
        },
        "feeTotal": "0.00",
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2027-07-30",
        "installmentNumber": 1,
        "installmentType": "M",
        "installmentValue": "0.00",
        "insurances": {
          "SdtsBTLOPAInsurance": [
            {
              "description": "SEGURO 1",
              "id": 1,
              "total": "120.00"
            }
          ]
        },
        "insurancesTotal": "120.00",
        "interest": "0.00",
        "interestTax1": "0.00",
        "interestTax2": "0.00",
        "interestTax3": "0.00",
        "inversePlannedPaymentDate": 79729169,
        "payments": {
          "SdtsBTLOPAPayment": []
        },
        "plannedPaymentDate": "2027-08-30",
        "punitiveInterest": "0.00",
        "punitiveInterestTax": "0.00",
        "roundOff": "0.00",
        "statusId": "",
        "subTotal": "3955.85",
        "subvention1": "0.00",
        "subvention2": "0.00",
        "subvention3": "0.00",
        "taxes": "0.00",
        "taxWithoutSubvention": "0.00",
        "term": 30,
        "total": "3955.85"
      },
      {
        "arrearDays": 0,
        "arrearFee1": "0.00",
        "arrearFee2": "0.00",
        "arrearFee3": "0.00",
        "arrearInterest": "0.00",
        "arrearTax": "0.00",
        "capital": "3899.95",
        "capitalConcessional": "0.00",
        "capitalTax": "0.00",
        "compensatoryInterest": "0.00",
        "compensatoryInterestTax": "0.00",
        "concessional": "0.00",
        "decimalsNumber": 0,
        "defaultDate": "",
        "deferredInterests": "0.00",
        "deferredInterestTax1": "0.00",
        "deferredInterestTax2": "0.00",
        "deferredInterestTax3": "0.00",
        "distributedInsurance1": "0.00",
        "distributedInsurance2": "0.00",
        "distributedInterest": "0.00",
        "distributedInterestTax1": "0.00",
        "distributedInterestTax2": "0.00",
        "distributedInterestTax3": "0.00",
        "endDate": "2027-09-30",
        "extendsTerm": false,
        "fees": {
          "SdtsBTLOPAFee": []
        },
        "feeTotal": "0.00",
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2027-08-30",
        "installmentNumber": 2,
        "installmentType": "M",
        "installmentValue": "0.00",
        "insurances": {
          "SdtsBTLOPAInsurance": [
            {
              "description": "SEGURO 1",
              "id": 1,
              "total": "100.83"
            }
          ]
        },
        "insurancesTotal": "100.83",
        "interest": "0.00",
        "interestTax1": "0.00",
        "interestTax2": "0.00",
        "interestTax3": "0.00",
        "inversePlannedPaymentDate": 79729069,
        "payments": {
          "SdtsBTLOPAPayment": []
        },
        "plannedPaymentDate": "2027-09-30",
        "punitiveInterest": "0.00",
        "punitiveInterestTax": "0.00",
        "roundOff": "0.00",
        "statusId": "",
        "subTotal": "7956.63",
        "subvention1": "0.00",
        "subvention2": "0.00",
        "subvention3": "0.00",
        "taxes": "0.00",
        "taxWithoutSubvention": "0.00",
        "term": 30,
        "total": "4000.78"
      },
      {
        "arrearDays": 0,
        "arrearFee1": "0.00",
        "arrearFee2": "0.00",
        "arrearFee3": "0.00",
        "arrearInterest": "0.00",
        "arrearTax": "0.00",
        "capital": "3965.14",
        "capitalConcessional": "0.00",
        "capitalTax": "0.00",
        "compensatoryInterest": "0.00",
        "compensatoryInterestTax": "0.00",
        "concessional": "0.00",
        "decimalsNumber": 0,
        "defaultDate": "",
        "deferredInterests": "0.00",
        "deferredInterestTax1": "0.00",
        "deferredInterestTax2": "0.00",
        "deferredInterestTax3": "0.00",
        "distributedInsurance1": "0.00",
        "distributedInsurance2": "0.00",
        "distributedInterest": "0.00",
        "distributedInterestTax1": "0.00",
        "distributedInterestTax2": "0.00",
        "distributedInterestTax3": "0.00",
        "endDate": "2027-10-31",
        "extendsTerm": false,
        "fees": {
          "SdtsBTLOPAFee": []
        },
        "feeTotal": "0.00",
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2027-09-30",
        "installmentNumber": 3,
        "installmentType": "M",
        "installmentValue": "0.00",
        "insurances": {
          "SdtsBTLOPAInsurance": [
            {
              "description": "SEGURO 1",
              "id": 1,
              "total": "81.32"
            }
          ]
        },
        "insurancesTotal": "81.32",
        "interest": "0.00",
        "interestTax1": "0.00",
        "interestTax2": "0.00",
        "interestTax3": "0.00",
        "inversePlannedPaymentDate": 79728968,
        "payments": {
          "SdtsBTLOPAPayment": []
        },
        "plannedPaymentDate": "2027-10-31",
        "punitiveInterest": "0.00",
        "punitiveInterestTax": "0.00",
        "roundOff": "0.00",
        "statusId": "",
        "subTotal": "12003.09",
        "subvention1": "0.00",
        "subvention2": "0.00",
        "subvention3": "0.00",
        "taxes": "0.00",
        "taxWithoutSubvention": "0.00",
        "term": 30,
        "total": "4046.46"
      },
      {
        "arrearDays": 0,
        "arrearFee1": "0.00",
        "arrearFee2": "0.00",
        "arrearFee3": "0.00",
        "arrearInterest": "0.00",
        "arrearTax": "0.00",
        "capital": "4031.42",
        "capitalConcessional": "0.00",
        "capitalTax": "0.00",
        "compensatoryInterest": "0.00",
        "compensatoryInterestTax": "0.00",
        "concessional": "0.00",
        "decimalsNumber": 0,
        "defaultDate": "",
        "deferredInterests": "0.00",
        "deferredInterestTax1": "0.00",
        "deferredInterestTax2": "0.00",
        "deferredInterestTax3": "0.00",
        "distributedInsurance1": "0.00",
        "distributedInsurance2": "0.00",
        "distributedInterest": "0.00",
        "distributedInterestTax1": "0.00",
        "distributedInterestTax2": "0.00",
        "distributedInterestTax3": "0.00",
        "endDate": "2027-11-30",
        "extendsTerm": false,
        "fees": {
          "SdtsBTLOPAFee": []
        },
        "feeTotal": "0.00",
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2027-10-31",
        "installmentNumber": 4,
        "installmentType": "M",
        "installmentValue": "0.00",
        "insurances": {
          "SdtsBTLOPAInsurance": [
            {
              "description": "SEGURO 1",
              "id": 1,
              "total": "61.49"
            }
          ]
        },
        "insurancesTotal": "61.49",
        "interest": "0.00",
        "interestTax1": "0.00",
        "interestTax2": "0.00",
        "interestTax3": "0.00",
        "inversePlannedPaymentDate": 79728869,
        "payments": {
          "SdtsBTLOPAPayment": []
        },
        "plannedPaymentDate": "2027-11-30",
        "punitiveInterest": "0.00",
        "punitiveInterestTax": "0.00",
        "roundOff": "0.00",
        "statusId": "",
        "subTotal": "16096.00",
        "subvention1": "0.00",
        "subvention2": "0.00",
        "subvention3": "0.00",
        "taxes": "0.00",
        "taxWithoutSubvention": "0.00",
        "term": 30,
        "total": "4092.91"
      },
      {
        "arrearDays": 0,
        "arrearFee1": "0.00",
        "arrearFee2": "0.00",
        "arrearFee3": "0.00",
        "arrearInterest": "0.00",
        "arrearTax": "0.00",
        "capital": "4098.81",
        "capitalConcessional": "0.00",
        "capitalTax": "0.00",
        "compensatoryInterest": "0.00",
        "compensatoryInterestTax": "0.00",
        "concessional": "0.00",
        "decimalsNumber": 0,
        "defaultDate": "",
        "deferredInterests": "0.00",
        "deferredInterestTax1": "0.00",
        "deferredInterestTax2": "0.00",
        "deferredInterestTax3": "0.00",
        "distributedInsurance1": "0.00",
        "distributedInsurance2": "0.00",
        "distributedInterest": "0.00",
        "distributedInterestTax1": "0.00",
        "distributedInterestTax2": "0.00",
        "distributedInterestTax3": "0.00",
        "endDate": "2027-12-30",
        "extendsTerm": false,
        "fees": {
          "SdtsBTLOPAFee": []
        },
        "feeTotal": "0.00",
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2027-11-30",
        "installmentNumber": 5,
        "installmentType": "M",
        "installmentValue": "0.00",
        "insurances": {
          "SdtsBTLOPAInsurance": [
            {
              "description": "SEGURO 1",
              "id": 1,
              "total": "41.34"
            }
          ]
        },
        "insurancesTotal": "41.34",
        "interest": "0.00",
        "interestTax1": "0.00",
        "interestTax2": "0.00",
        "interestTax3": "0.00",
        "inversePlannedPaymentDate": 79728769,
        "payments": {
          "SdtsBTLOPAPayment": []
        },
        "plannedPaymentDate": "2027-12-30",
        "punitiveInterest": "0.00",
        "punitiveInterestTax": "0.00",
        "roundOff": "0.00",
        "statusId": "",
        "subTotal": "20236.15",
        "subvention1": "0.00",
        "subvention2": "0.00",
        "subvention3": "0.00",
        "taxes": "0.00",
        "taxWithoutSubvention": "0.00",
        "term": 30,
        "total": "4140.15"
      },
      {
        "arrearDays": 0,
        "arrearFee1": "0.00",
        "arrearFee2": "0.00",
        "arrearFee3": "0.00",
        "arrearInterest": "0.00",
        "arrearTax": "0.00",
        "capital": "4168.83",
        "capitalConcessional": "0.00",
        "capitalTax": "0.00",
        "compensatoryInterest": "0.00",
        "compensatoryInterestTax": "0.00",
        "concessional": "0.00",
        "decimalsNumber": 0,
        "defaultDate": "",
        "deferredInterests": "0.00",
        "deferredInterestTax1": "0.00",
        "deferredInterestTax2": "0.00",
        "deferredInterestTax3": "0.00",
        "distributedInsurance1": "0.00",
        "distributedInsurance2": "0.00",
        "distributedInterest": "0.00",
        "distributedInterestTax1": "0.00",
        "distributedInterestTax2": "0.00",
        "distributedInterestTax3": "0.00",
        "endDate": "2028-01-30",
        "extendsTerm": false,
        "fees": {
          "SdtsBTLOPAFee": []
        },
        "feeTotal": "0.00",
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2027-12-30",
        "installmentNumber": 6,
        "installmentType": "M",
        "installmentValue": "0.00",
        "insurances": {
          "SdtsBTLOPAInsurance": [
            {
              "description": "SEGURO 1",
              "id": 1,
              "total": "20.84"
            }
          ]
        },
        "insurancesTotal": "20.84",
        "interest": "0.00",
        "interestTax1": "0.00",
        "interestTax2": "0.00",
        "interestTax3": "0.00",
        "inversePlannedPaymentDate": 79719869,
        "payments": {
          "SdtsBTLOPAPayment": []
        },
        "plannedPaymentDate": "2028-01-30",
        "punitiveInterest": "0.00",
        "punitiveInterestTax": "0.00",
        "roundOff": "0.00",
        "statusId": "",
        "subTotal": "24425.82",
        "subvention1": "0.00",
        "subvention2": "0.00",
        "subvention3": "0.00",
        "taxes": "0.00",
        "taxWithoutSubvention": "0.00",
        "term": 30,
        "total": "4189.67"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details installmentScheduleItem

### installmentScheduleItem

::: center
Los campos del tipo de dato estructurado installmentScheduleItem son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
arrearDays | Int | arrearDays
arrearFee1 | Double | arrearFee1
arrearFee2 | Double | arrearFee2
arrearFee3 | Double | arrearFee3
arrearInterest | Double | arrearInterest
arrearTax | Double | arrearTax
capital | Double | capital
capitalConcessional | Double | capitalConcessional
capitalTax | Double | capitalTax
compensatoryInterest | Double | compensatoryInterest
compensatoryInterestTax | Double | compensatoryInterestTax
concessional | Double | concessional
decimalsNumber | Byte | decimalsNumber
defaultDate | Date | defaultDate
deferredInterests | Double | deferredInterests
deferredInterestTax1 | Double | deferredInterestTax1
deferredInterestTax2 | Double | deferredInterestTax2
deferredInterestTax3 | Double | deferredInterestTax3
distributedInsurance1 | Double | distributedInsurance1
distributedInsurance2 | Double | distributedInsurance2
distributedInterest | Double | distributedInterest
distributedInterestTax1 | Double | distributedInterestTax1
distributedInterestTax2 | Double | distributedInterestTax2
distributedInterestTax3 | Double | distributedInterestTax3
endDate | Date | endDate
extendsTerm | Boolean | extendsTerm
fees | [SdtsBTLOPAFee](#sdtsbtlopafee) | fees
feeTotal | Double | feeTotal
graceInQuota | Boolean | graceInQuota
graceReach | String | graceReach
inArrear | Boolean | inArrear
initialDate | Date | initialDate
installmentNumber | Short | installmentNumber
installmentType | String | installmentType
installmentValue | Double | installmentValue
insurances | [SdtsBTLOPAInsurance](#sdtsbtlopainsurance) | insurances
insurancesTotal | Double | insurancesTotal
interest | Double | interest
interestTax1 | Double | interestTax1
interestTax2 | Double | interestTax2
interestTax3 | Double | interestTax3
inversePlannedPaymentDate | Int | inversePlannedPaymentDate
payments | [SdtsBTLOPAPayment](#sdtsbtlopapayment) | payments
plannedPaymentDate | Date | plannedPaymentDate
punitiveInterest | Double | punitiveInterest
punitiveInterestTax | Double | punitiveInterestTax
roundOff | Double | roundOff
statusId | String | statusId
subTotal | Double | subTotal
subvention1 | Double | subvention1
subvention2 | Double | subvention2
subvention3 | Double | subvention3
taxes | Double | taxes
taxWithoutSubvention | Double | taxWithoutSubvention
term | Int | term
total | Double | total
:::

::: details SdtsBTLOPAFee

### SdtsBTLOPAFee

::: center
Los campos del tipo de dato estructurado SdtsBTLOPAFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double | amount
appliesToDisbursement | Boolean | appliesToDisbursement
calculationBase | String | calculationBase
chargeBase | String | chargeBase
description | String | description
distributionForm | String | distributionForm
enabled | Boolean | enabled
excludesCapitalization | Boolean | excludesCapitalization
feeId | Int | feeId
feeTypeId | String | feeTypeId
maximumAmount | Double | maximumAmount
minimumAmount | Double | minimumAmount
modifiable | Boolean | modifiable
modificationType | Byte | modificationType
modified | Boolean | modified
percentage | Double | percentage
suggestsAmount | Double | suggestsAmount
tax | Double | tax
total | Double | total
totalAmount | Double | totalAmount
:::

::: details SdtsBTLOPAInsurance

### SdtsBTLOPAInsurance

::: center
Los campos del tipo de dato estructurado SdtsBTLOPAInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
addedAmount | Double | addedAmount
allowsModification | Boolean | allowsModification
associatesInsurancePolicy | Boolean | associatesInsurancePolicy
chargeTypeId | String | chargeTypeId
commercialValue | Double | commercialValue
description | String | description
extraPremium | Double | extraPremium
id | Int | id
managesExtraPremium | Boolean | managesExtraPremium
modified | Boolean | modified
percentageModified | Double | percentageModified
policyEndDate | Date | policyEndDate
policyNumber | String | policyNumber
policyStartDate | Date | policyStartDate
total | Double | total
:::

::: details SdtsBTLOPAPayment

### SdtsBTLOPAPayment

::: center
Los campos del tipo de dato estructurado SdtsBTLOPAPayment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
accountBalance | Double | accountBalance
arrearFee1 | Double | arrearFee1
arrearFee2 | Double | arrearFee2
arrearFee3 | Double | arrearFee3
arrearInterest | Double | arrearInterest
arrearRate | Double | arrearRate
arrearTax | Double | arrearTax
capital | Double | capital
capitalConcessional | Double | capitalConcessional
capitalTax | Double | capitalTax
compensatoryInterest | Double | compensatoryInterest
compensatoryInterestTax | Double | compensatoryInterestTax
concessional | Double | concessional
deferredInterest | Double | deferredInterest
deferredInterestTax1 | Double | deferredInterestTax1
deferredInterestTax2 | Double | deferredInterestTax2
deferredInterestTax3 | Double | deferredInterestTax3
distributedInsurance1 | Double | distributedInsurance1
distributedInsurance2 | Double | distributedInsurance2
distributedInterest | Double | distributedInterest
distributedInterestTax1 | Double | distributedInterestTax1
distributedInterestTax2 | Double | distributedInterestTax2
distributedInterestTax3 | Double | distributedInterestTax3
fees | [SdtsBTLOPAFee](#sdtsbtlopafee) | fees
feeTotal | Double | feeTotal
installmentNumber | Int | installmentNumber
installmentType | String | installmentType
insurances | [SdtsBTLOPAInsurance](#sdtsbtlopainsurance) | insurances
insurancesTotal | Double | insurancesTotal
interest | Double | interest
interestModality | Byte | interestModality
interestTax1 | Double | interestTax1
interestTax2 | Double | interestTax2
interestTax3 | Double | interestTax3
movementGUID | String $<(Length: 36)>$ | movementGUID
paymentDate | Date | paymentDate
paymentNumber | Short | paymentNumber
plannedPaymentDate | Date | plannedPaymentDate
punitiveInterest | Double | punitiveInterest
punitiveInterestTax | Double | punitiveInterestTax
roundOff | Double | roundOff
statusId | String | statusId
subvention1 | Double | subvention1
subvention2 | Double | subvention2
subvention3 | Double | subvention3
taxes | Double | taxes
total | Double | total
:::
<!-- CIERRA SDT -->
