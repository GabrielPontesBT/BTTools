---
title: Get Detail
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el detalle del préstamo.

**Nombre publicación:** PublicLoans.getDetail

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0005

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String $<(length: 36)>$ | GUID (identificador único global) del préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
queryDate | Date | Fecha de consulta. Si no se recibe, se toma la fecha del día.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanDetail | [SdtsBTLOWLoanDetail](#sdtsbtlowloandetail) | Detalles del préstamo.

@tab Errores

Código | Descripción
:--------- | :-----------
40050001 | Debe ingresar el GUID de persona.
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
  "loanGUID": "4f9b92dc-ca6f-4ab7-9650-2ac67d8c420f",
  "queryDate": ""
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
  "loanDetail": {
    "AccountBalance": -12000.0,
    "AccountingAccountId": 163302001,
    "AccountingAccountDescription": "",
    "AccruedArrearInterest": 0.0,
    "AccruedInterest": 0.0,
    "AccruedInterestResult": 0.0,
    "AmortizationTypeId": 3,
    "AmortizationTypeDescription": "",
    "ArrearDays": 603,
    "ArrearsRateTypeId": 0,
    "ArrearsRateTypeDescription": "",
    "AverageDaysInArrears": 498,
    "BranchId": 1,
    "BranchDescription": "Sucursal Beta",
    "DateOfLastTotalPayment": "",
    "DayTypeId": 1,
    "DayTypeDescription": "",
    "Debt": 25459.07,
    "DebtToDate": 28820.66,
    "EconomicActivityId": 97000,
    "EconomicActivityDescription": "",
    "ExpirationDate": "2026-06-12",
    "FirstPaymentDate": "2025-11-12",
    "FirstUnpaidDate": "2025-11-12",
    "InstallmentPeriodicity": 30,
    "InstallmentValue": 2390.0,
    "InterestRate": 20.0,
    "IVACoefficient": 0.0,
    "LoanGUID": "4f9b92dc-ca6f-4ab7-9650-2ac67d8c420f",
    "NextExpirationDate": "2025-11-12",
    "NumberOfInstallments": 0,
    "OriginalAmount": 12000.0,
    "OriginalRate": 20.0,
    "PlusRate": 0.0,
    "Product": {
      "ProductDescription": "",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "3b5af2fb-f6dc-42b6-8bd0-a112629868bb"
    },
    "RateClassId": 0,
    "RateClassDescription": "",
    "RateTypeId": 1,
    "RateTypeDescription": "",
    "ReviewDays": 0,
    "StatusId": 0,
    "StatusDescription": "",
    "SuspendedInterest": 0.0,
    "tasaEfectiva_REVISAR": 0.0,
    "tasaMoraOriginal_REVISAR": 0.0,
    "tasaMoraVigente_REVISAR": 0.0,
    "Term": 263,
    "TotalExpiredDebt": 25459.07,
    "TotalExpiredInstallments": 8,
    "TotalFinancedCost": 0.0,
    "TotalMissedPaymentInstallments": 0,
    "TotalOfInstallmentFees": 9555.84,
    "TotalOfInsurances": 420.0,
    "TotalOfInterest": 768.4,
    "TotalOfInterestArrear": 6125.47,
    "TotalOfPunitiveInterest": 0.0,
    "TotalOfTaxes": 1347.61,
    "TotalPaidInstallments": 0,
    "TotalUnpaidInstallments": 8,
    "ValueDate": "2025-09-19",
    "YearTypeId": 1,
    "YearTypeDescription": ""
  },
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "15:52:40",
    "Numero": 13545804,
    "Servicio": "PublicLoans.getDetail",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWLoanDetail

### SdtsBTLOWLoanDetail

::: center
Los campos del tipo de dato estructurado SdtsBTLOWLoanDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountBalance | Double $<(length: 18.2)>$ | Saldo de cuenta.
AccountingAccountId | Long $<(length: 16)>$ | Identificador de cuenta contable.
AccountingAccountDescription | String | Descripción de cuenta contable.
AccruedArrearInterest | Double $<(length: 18.2)>$ | Interés de mora acumulado.
AccruedInterest | Double $<(length: 18.2)>$ | Interés acumulado.
AccruedInterestResult | Double $<(length: 18.2)>$ | Resultado de interés acumulado.
AmortizationTypeId | Byte $<(length: 2)>$ | Identificador del tipo de amortización.
AmortizationTypeDescription | String $<(length: 256)>$ | Descripción del tipo de amortización.
ArrearDays | Int $<(length: 9)>$ | Días de mora.
ArrearsRateTypeId | Byte $<(length: 1)>$ | Identificador del tipo de tasa de mora.
ArrearsRateTypeDescription | String $<(length: 20)>$ | Descripción del tipo de tasa de mora.
AverageDaysInArrears | Int $<(length: 5)>$ | Días promedio en mora.
BranchId | Int $<(length: 5)>$ | Identificador de sucursal.
BranchDescription | String $<(length: 30)>$ | Descripción de sucursal.
DateOfLastTotalPayment | Date | Fecha del último pago total.
DayTypeId | Byte $<(length: 1)>$ | Identificador del tipo de día.
DayTypeDescription | String $<(length: 40)>$ | Descripción del tipo de día.
Debt | Double $<(length: 18.2)>$ | Deuda.
DebtToDate | Double | Deuda a la fecha.
EconomicActivityId | Long $<(length: 11)>$ | Identificador de actividad económica.
EconomicActivityDescription | String $<(length: 80)>$ | Descripción de actividad económica.
ExpirationDate | Date | Fecha de vencimiento.
FirstPaymentDate | Date | Fecha del primer pago.
FirstUnpaidDate | Date | Fecha del primer pago impago.
InstallmentPeriodicity | Int $<(length: 5)>$ | Periodicidad de cuotas.
InstallmentValue | Double $<(length: 18.2)>$ | Valor cuota.
InterestRate | Double $<(length: 11.6)>$ | Tasa de interés.
IVACoefficient | Double $<(length: 11.6)>$ | Coeficiente IVA.
LoanGUID | String $<(length: 36)>$ | GUID del préstamo.
NextExpirationDate | Date | Fecha del próximo vencimiento.
NumberOfInstallments | Int $<(length: 5)>$ | Número de cuotas.
OriginalAmount | Double $<(length: 18.2)>$ | Monto original.
OriginalRate | Double $<(length: 11.6)>$ | Tasa original.
PlusRate | Double $<(length: 11.6)>$ | Tasa adicional.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
RateClassId | Int $<(length: 5)>$ | Identificador de clase de tasa.
RateClassDescription | String $<(length: 20)>$ | Descripción de la clase de tasa.
RateTypeId | Byte $<(length: 1)>$ | Identificador del tipo de tasa.
RateTypeDescription | String $<(length: 20)>$ | Descripción del tipo de tasa.
ReviewDays | Int $<(length: 5)>$ | Días de revisión.
StatusId | Short $<(length: 4)>$ | Identificador de estado.
StatusDescription | String | Descripción del estado.
SuspendedInterest | Double $<(length: 18.2)>$ | Interés suspendido.
tasaEfectiva_REVISAR | Double $<(length: 11.6)>$ | Tasa efectiva (a revisar).
tasaMoraOriginal_REVISAR | Double $<(length: 11.6)>$ | Tasa de mora original (a revisar).
tasaMoraVigente_REVISAR | Double $<(length: 11.6)>$ | Tasa de mora vigente (a revisar).
Term | Int $<(length: 5)>$ | Plazo.
TotalExpiredDebt | Double | Deuda vencida total.
TotalExpiredInstallments | Int $<(length: 5)>$ | Cuotas vencidas totales.
TotalFinancedCost | Double $<(length: 11.6)>$ | Costo financiado total.
TotalMissedPaymentInstallments | Int $<(length: 5)>$ | Cuotas sin pago total.
TotalOfInstallmentFees | Double | Total de comisiones de cuotas.
TotalOfInsurances | Double | Total de seguros.
TotalOfInterest | Double $<(length: 18.2)>$ | Total de intereses.
TotalOfInterestArrear | Double $<(length: 18.2)>$ | Total de interés de mora.
TotalOfPunitiveInterest | Double $<(length: 18.2)>$ | Total de interés punitorio.
TotalOfTaxes | Double $<(length: 18.2)>$ | Total de impuestos.
TotalPaidInstallments | Int $<(length: 5)>$ | Cuotas pagadas totales.
TotalUnpaidInstallments | Int $<(length: 5)>$ | Cuotas impagas totales.
ValueDate | Date | Fecha valor.
YearTypeId | Byte $<(length: 1)>$ | Identificador del tipo de año.
YearTypeDescription | String $<(length: 40)>$ | Descripción del tipo de año.
:::

::: details SdtsBTPHWProduct

### SdtsBTPHWProduct

::: center
Los campos del tipo de dato estructurado SdtsBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CurrencyId | Short $<(length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(length: 6)>$ | Identificador del tipo.
KindDescription | String $<(length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.
:::
<!-- CIERRA SDT -->
