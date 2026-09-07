---
title: Schedule
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener el cronograma de cuotas de un préstamo.

**Nombre publicación:** PublicLoans.schedule

**Programa:** PublicAPI.BTLOPA0003

**Alcance:** Global

**Endpoint:** /public/Loans/v1/schedule
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
queryDate | Date | Fecha de consulta.
includePayments | Boolean | Indica si se incluyen los pagos.
includeFuturePayments | Boolean | Indica si se incluyen pagos futuros.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
installments | [installment](#installment) | Listado de cuotas.

@tab Errores

Código | Descripción
:--------- | :---------
120050001 | Debe ingresar el GUID de préstamo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/schedule?loanGUID=e8c4649f-2ed6-4845-8619-ed9778d0560e&queryDate=2026-01-01&includePayments=false&includeFuturePayments=false' \
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
  "installments": {
    "installment": [
      {
        "arrearDays": 0,
        "arrearFee1": 0,
        "arrearFee2": 0,
        "arrearFee3": 0,
        "arrearInterest": 0,
        "arrearTax": 0,
        "capital": 0,
        "capitalConcessional": 0,
        "capitalTax": 0,
        "compensatoryInterest": 0,
        "compensatoryInterestTax": 0,
        "concessional": 0,
        "decimalsNumber": "",
        "defaultDate": "2026-01-01",
        "deferredInterests": 0,
        "deferredInterestTax1": 0,
        "deferredInterestTax2": 0,
        "deferredInterestTax3": 0,
        "distributedInsurance1": 0,
        "distributedInsurance2": 0,
        "distributedInterest": 0,
        "distributedInterestTax1": 0,
        "distributedInterestTax2": 0,
        "distributedInterestTax3": 0,
        "endDate": "2026-01-01",
        "extendsTerm": false,
        "fees": {
          "fee": [
            {
              "amount": 0,
              "appliesToDisbursement": false,
              "calculationBase": "",
              "chargeBase": "",
              "description": "",
              "distributionForm": "",
              "enabled": false,
              "excludesCapitalization": false,
              "feeId": 0,
              "feeTypeId": "",
              "maximumAmount": 0,
              "minimumAmount": 0,
              "modifiable": false,
              "modificationType": "",
              "modified": false,
              "percentage": 0,
              "suggestsAmount": 0,
              "tax": 0,
              "total": 0,
              "totalAmount": 0
            }
          ]
        },
        "feeTotal": 0,
        "graceInQuota": false,
        "graceReach": "",
        "inArrear": false,
        "initialDate": "2026-01-01",
        "installmentNumber": 0,
        "installmentType": "",
        "installmentValue": 0,
        "insurances": {
          "insurance": [
            {
              "addedAmount": 0,
              "allowsModification": false,
              "associatesInsurancePolicy": false,
              "chargeTypeId": "",
              "commercialValue": 0,
              "description": "",
              "extraPremium": 0,
              "id": 0,
              "managesExtraPremium": false,
              "modified": false,
              "percentageModified": 0,
              "policyEndDate": "2026-01-01",
              "policyNumber": "",
              "policyStartDate": "2026-01-01",
              "total": 0
            }
          ]
        },
        "insurancesTotal": 0,
        "interest": 0,
        "interestTax1": 0,
        "interestTax2": 0,
        "interestTax3": 0,
        "inversePlannedPaymentDate": 0,
        "payments": {
          "payment": [
            {
              "accountBalance": 0,
              "arrearFee1": 0,
              "arrearFee2": 0,
              "arrearFee3": 0,
              "arrearInterest": 0,
              "arrearRate": 0,
              "arrearTax": 0,
              "capital": 0,
              "capitalConcessional": 0,
              "capitalTax": 0,
              "compensatoryInterest": 0,
              "compensatoryInterestTax": 0,
              "concessional": 0,
              "deferredInterest": 0,
              "deferredInterestTax1": 0,
              "deferredInterestTax2": 0,
              "deferredInterestTax3": 0,
              "distributedInsurance1": 0,
              "distributedInsurance2": 0,
              "distributedInterest": 0,
              "distributedInterestTax1": 0,
              "distributedInterestTax2": 0,
              "distributedInterestTax3": 0,
              "fees": {
                "fee": [
                  {
                    "amount": 0,
                    "appliesToDisbursement": false,
                    "calculationBase": "",
                    "chargeBase": "",
                    "description": "",
                    "distributionForm": "",
                    "enabled": false,
                    "excludesCapitalization": false,
                    "feeId": 0,
                    "feeTypeId": "",
                    "maximumAmount": 0,
                    "minimumAmount": 0,
                    "modifiable": false,
                    "modificationType": "",
                    "modified": false,
                    "percentage": 0,
                    "suggestsAmount": 0,
                    "tax": 0,
                    "total": 0,
                    "totalAmount": 0
                  }
                ]
              },
              "feeTotal": 0,
              "installmentNumber": 0,
              "installmentType": "",
              "insurances": {
                "insurance": [
                  {
                    "addedAmount": 0,
                    "allowsModification": false,
                    "associatesInsurancePolicy": false,
                    "chargeTypeId": "",
                    "commercialValue": 0,
                    "description": "",
                    "extraPremium": 0,
                    "id": 0,
                    "managesExtraPremium": false,
                    "modified": false,
                    "percentageModified": 0,
                    "policyEndDate": "2026-01-01",
                    "policyNumber": "",
                    "policyStartDate": "2026-01-01",
                    "total": 0
                  }
                ]
              },
              "insurancesTotal": 0,
              "interest": 0,
              "interestModality": "",
              "interestTax1": 0,
              "interestTax2": 0,
              "interestTax3": 0,
              "movementGUID": "",
              "paymentDate": "2026-01-01",
              "paymentNumber": 0,
              "plannedPaymentDate": "2026-01-01",
              "punitiveInterest": 0,
              "punitiveInterestTax": 0,
              "roundOff": 0,
              "statusId": "",
              "subvention1": 0,
              "subvention2": 0,
              "subvention3": 0,
              "taxes": 0,
              "total": 0
            }
          ]
        },
        "plannedPaymentDate": "2026-01-01",
        "punitiveInterest": 0,
        "punitiveInterestTax": 0,
        "roundOff": 0,
        "statusId": "",
        "subTotal": 0,
        "subvention1": 0,
        "subvention2": 0,
        "subvention3": 0,
        "taxes": 0,
        "taxWithoutSubvention": 0,
        "term": 0,
        "total": 0
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details installment

### installment

::: center
Los campos del tipo de dato estructurado installment son los siguientes:

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
movementGUID | String | movementGUID
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
