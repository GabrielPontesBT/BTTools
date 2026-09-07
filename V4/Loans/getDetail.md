---
title: Detail
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener el detalle del préstamo.

**Nombre publicación:** PublicLoans.detail

**Programa:** PublicAPI.BTLOPA0005

**Alcance:** Global

**Endpoint:** /public/Loans/v1/detail
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
queryDate | Date | Fecha de consulta.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanDetail | [loanDetail](#loandetail) | Datos del préstamo.

@tab Errores

No aplica.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/detail?loanGUID=4f9b92dc-ca6f-4ab7-9650-2ac67d8c420f&queryDate=' \
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
  "loanDetail": {
    "accountBalance": -12000,
    "accountingAccountId": 163302001,
    "accountingAccountDescription": "",
    "accruedArrearInterest": 0,
    "accruedInterest": 0,
    "accruedInterestResult": 0,
    "amortizationTypeId": 3,
    "amortizationTypeDescription": "",
    "arrearDays": 603,
    "arrearsRateTypeId": 0,
    "arrearsRateTypeDescription": "",
    "averageDaysInArrears": 498,
    "branchId": 1,
    "branchDescription": "Sucursal Beta",
    "dateOfLastTotalPayment": "",
    "dayTypeId": 1,
    "dayTypeDescription": "",
    "debt": 25459.07,
    "debtToDate": 28820.66,
    "economicActivityId": 97000,
    "economicActivityDescription": "",
    "expirationDate": "2026-06-12",
    "firstPaymentDate": "2025-11-12",
    "firstUnpaidDate": "2025-11-12",
    "installmentPeriodicity": 30,
    "installmentValue": 2390,
    "interestRate": 20,
    "iVACoefficient": 0,
    "loanGUID": "4f9b92dc-ca6f-4ab7-9650-2ac67d8c420f",
    "nextExpirationDate": "2025-11-12",
    "numberOfInstallments": 0,
    "originalAmount": 12000,
    "originalRate": 20,
    "plusRate": 0,
    "product": {
      "currencyId": 0,
      "currencyDescription": "Pesos Uruguayos",
      "currencySign": "$",
      "kindId": 0,
      "kindDescription": "Billete",
      "productDescription": "",
      "productGUID": "3b5af2fb-f6dc-42b6-8bd0-a112629868bb"
    },
    "rateClassId": 0,
    "rateClassDescription": "",
    "rateTypeId": 1,
    "rateTypeDescription": "",
    "reviewDays": 0,
    "statusId": 0,
    "statusDescription": "",
    "suspendedInterest": 0,
    "term": 263,
    "totalExpiredDebt": 25459.07,
    "totalExpiredInstallments": 8,
    "totalFinancedCost": 0,
    "totalMissedPaymentInstallments": 0,
    "totalOfInstallmentFees": 9555.84,
    "totalOfInsurances": 420,
    "totalOfInterest": 768.4,
    "totalOfInterestArrear": 6125.47,
    "totalOfPunitiveInterest": 0,
    "totalOfTaxes": 1347.61,
    "totalPaidInstallments": 0,
    "totalUnpaidInstallments": 8,
    "valueDate": "2025-09-19",
    "yearTypeId": 1,
    "yearTypeDescription": ""
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details loanDetail

### loanDetail

::: center
Los campos del tipo de dato estructurado loanDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
accountBalance | Double | accountBalance
accountingAccountId | Long | accountingAccountId
accountingAccountDescription | String | accountingAccountDescription
accruedArrearInterest | Double | accruedArrearInterest
accruedInterest | Double | accruedInterest
accruedInterestResult | Double | accruedInterestResult
amortizationTypeId | Byte | amortizationTypeId
amortizationTypeDescription | String | amortizationTypeDescription
arrearDays | Int | arrearDays
arrearsRateTypeId | Byte | arrearsRateTypeId
arrearsRateTypeDescription | String | arrearsRateTypeDescription
averageDaysInArrears | Int | averageDaysInArrears
branchId | Int | branchId
branchDescription | String | branchDescription
dateOfLastTotalPayment | Date | dateOfLastTotalPayment
dayTypeId | Byte | dayTypeId
dayTypeDescription | String | dayTypeDescription
debt | Double | debt
debtToDate | Double | debtToDate
economicActivityId | Long | economicActivityId
economicActivityDescription | String | economicActivityDescription
expirationDate | Date | expirationDate
firstPaymentDate | Date | firstPaymentDate
firstUnpaidDate | Date | firstUnpaidDate
installmentPeriodicity | Int | installmentPeriodicity
installmentValue | Double | installmentValue
interestRate | Double | interestRate
iVACoefficient | Double | iVACoefficient
loanGUID | String | loanGUID
nextExpirationDate | Date | nextExpirationDate
numberOfInstallments | Int | numberOfInstallments
originalAmount | Double | originalAmount
originalRate | Double | originalRate
plusRate | Double | plusRate
product | [product](#product) | product
rateClassId | Int | rateClassId
rateClassDescription | String | rateClassDescription
rateTypeId | Byte | rateTypeId
rateTypeDescription | String | rateTypeDescription
reviewDays | Int | reviewDays
statusId | Short | statusId
statusDescription | String | statusDescription
suspendedInterest | Double | suspendedInterest
tasaEfectiva_REVISAR | Double | tasaEfectiva_REVISAR
tasaMoraOriginal_REVISAR | Double | tasaMoraOriginal_REVISAR
tasaMoraVigente_REVISAR | Double | tasaMoraVigente_REVISAR
term | Int | term
totalExpiredDebt | Double | totalExpiredDebt
totalExpiredInstallments | Int | totalExpiredInstallments
totalFinancedCost | Double | totalFinancedCost
totalMissedPaymentInstallments | Int | totalMissedPaymentInstallments
totalOfInstallmentFees | Double | totalOfInstallmentFees
totalOfInsurances | Double | totalOfInsurances
totalOfInterest | Double | totalOfInterest
totalOfInterestArrear | Double | totalOfInterestArrear
totalOfPunitiveInterest | Double | totalOfPunitiveInterest
totalOfTaxes | Double | totalOfTaxes
totalPaidInstallments | Int | totalPaidInstallments
totalUnpaidInstallments | Int | totalUnpaidInstallments
valueDate | Date | valueDate
yearTypeId | Byte | yearTypeId
yearTypeDescription | String | yearTypeDescription
:::

::: details product

### product

::: center
Los campos del tipo de dato estructurado product son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
CurrencyId | Short $<(Length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(Length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(Length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(Length: 6)>$ | Identificador del tipo.
KindDescription | String $<(Length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(Length: 36)>$ | GUID del producto.
:::
<!-- CIERRA SDT -->
