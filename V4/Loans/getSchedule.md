---
title: Get Schedule
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el cronograma de cuotas de un préstamo.

**Nombre publicación:** PublicLoans.getSchedule

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0003

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
queryDate | Date | Fecha de consulta.
includePayments | Boolean | ¿Incluir pagos?
includeFuturePayments | Boolean | ¿Incluir pagos futuros?

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
installments | [SdtsBTLOWInstallment](#sdtsbtlowinstallment) | Listado de cuotas.

@tab Errores

Código | Descripción
:--------- | :-----------
120050001 | Debe ingresar el GUID de préstamo.
120020069 | La fecha de consulta es menor a la fecha valor de la operación.
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
    "Token": "TOKEN_AQUI"
  },
  "loanGUID": "",
  "queryDate": "2026-01-01",
  "includePayments": false,
  "includeFuturePayments": false
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
  "installments": {
    "installment": [
      {
        "ArrearDays": 0,
        "ArrearFee1": 0,
        "ArrearFee2": 0,
        "ArrearFee3": 0,
        "ArrearInterest": 0,
        "ArrearTax": 0,
        "Capital": 0,
        "CapitalConcessional": 0,
        "CapitalTax": 0,
        "CompensatoryInterest": 0,
        "CompensatoryInterestTax": 0,
        "Concessional": 0,
        "DecimalsNumber": "",
        "DefaultDate": "2026-01-01",
        "DeferredInterests": 0,
        "DeferredInterestTax1": 0,
        "DeferredInterestTax2": 0,
        "DeferredInterestTax3": 0,
        "DistributedInsurance1": 0,
        "DistributedInsurance2": 0,
        "DistributedInterest": 0,
        "DistributedInterestTax1": 0,
        "DistributedInterestTax2": 0,
        "DistributedInterestTax3": 0,
        "EndDate": "2026-01-01",
        "ExtendsTerm": false,
        "Fees": [
          {
            "Amount": 0,
            "AppliesToDisbursement": false,
            "CalculationBase": "",
            "ChargeBase": "",
            "Description": "",
            "DistributionForm": "",
            "Enabled": false,
            "ExcludesCapitalization": false,
            "FeeId": 0,
            "FeeTypeId": "",
            "MaximumAmount": 0,
            "MinimumAmount": 0,
            "Modifiable": false,
            "ModificationType": "",
            "Modified": false,
            "Percentage": 0,
            "SuggestsAmount": 0,
            "Tax": 0,
            "Total": 0,
            "TotalAmount": 0
          }
        ],
        "FeeTotal": 0,
        "GraceInQuota": false,
        "GraceReach": "",
        "InArrear": false,
        "InitialDate": "2026-01-01",
        "InstallmentNumber": 0,
        "InstallmentType": "",
        "InstallmentValue": 0,
        "Insurances": [
          {
            "AddedAmount": 0,
            "AllowsModification": false,
            "AssociatesInsurancePolicy": false,
            "ChargeTypeId": "",
            "CommercialValue": 0,
            "Description": "",
            "ExtraPremium": 0,
            "Id": 0,
            "ManagesExtraPremium": false,
            "Modified": false,
            "PercentageModified": 0,
            "PolicyEndDate": "2026-01-01",
            "PolicyNumber": "",
            "PolicyStartDate": "2026-01-01",
            "Total": 0
          }
        ],
        "InsurancesTotal": 0,
        "Interest": 0,
        "InterestTax1": 0,
        "InterestTax2": 0,
        "InterestTax3": 0,
        "InversePlannedPaymentDate": 0,
        "Payments": [
          {
            "AccountBalance": 0,
            "ArrearFee1": 0,
            "ArrearFee2": 0,
            "ArrearFee3": 0,
            "ArrearInterest": 0,
            "ArrearRate": 0,
            "ArrearTax": 0,
            "Capital": 0,
            "CapitalConcessional": 0,
            "CapitalTax": 0,
            "CompensatoryInterest": 0,
            "CompensatoryInterestTax": 0,
            "Concessional": 0,
            "DeferredInterest": 0,
            "DeferredInterestTax1": 0,
            "DeferredInterestTax2": 0,
            "DeferredInterestTax3": 0,
            "DistributedInsurance1": 0,
            "DistributedInsurance2": 0,
            "DistributedInterest": 0,
            "DistributedInterestTax1": 0,
            "DistributedInterestTax2": 0,
            "DistributedInterestTax3": 0,
            "Fees": [
              {
                "Amount": 0,
                "AppliesToDisbursement": false,
                "CalculationBase": "",
                "ChargeBase": "",
                "Description": "",
                "DistributionForm": "",
                "Enabled": false,
                "ExcludesCapitalization": false,
                "FeeId": 0,
                "FeeTypeId": "",
                "MaximumAmount": 0,
                "MinimumAmount": 0,
                "Modifiable": false,
                "ModificationType": "",
                "Modified": false,
                "Percentage": 0,
                "SuggestsAmount": 0,
                "Tax": 0,
                "Total": 0,
                "TotalAmount": 0
              }
            ],
            "FeeTotal": 0,
            "InstallmentNumber": 0,
            "InstallmentType": "",
            "Insurances": [
              {
                "AddedAmount": 0,
                "AllowsModification": false,
                "AssociatesInsurancePolicy": false,
                "ChargeTypeId": "",
                "CommercialValue": 0,
                "Description": "",
                "ExtraPremium": 0,
                "Id": 0,
                "ManagesExtraPremium": false,
                "Modified": false,
                "PercentageModified": 0,
                "PolicyEndDate": "2026-01-01",
                "PolicyNumber": "",
                "PolicyStartDate": "2026-01-01",
                "Total": 0
              }
            ],
            "InsurancesTotal": 0,
            "Interest": 0,
            "InterestModality": "",
            "InterestTax1": 0,
            "InterestTax2": 0,
            "InterestTax3": 0,
            "MovementGUID": "",
            "PaymentDate": "2026-01-01",
            "PaymentNumber": 0,
            "PlannedPaymentDate": "2026-01-01",
            "PunitiveInterest": 0,
            "PunitiveInterestTax": 0,
            "RoundOff": 0,
            "StatusId": "",
            "Subvention1": 0,
            "Subvention2": 0,
            "Subvention3": 0,
            "Taxes": 0,
            "Total": 0
          }
        ],
        "PlannedPaymentDate": "2026-01-01",
        "PunitiveInterest": 0,
        "PunitiveInterestTax": 0,
        "RoundOff": 0,
        "StatusId": "",
        "SubTotal": 0,
        "Subvention1": 0,
        "Subvention2": 0,
        "Subvention3": 0,
        "Taxes": 0,
        "TaxWithoutSubvention": 0,
        "Term": 0,
        "Total": 0
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
    "Servicio": "PublicLoans.getSchedule",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWInstallment

### SdtsBTLOWInstallment

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInstallment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ArrearDays | Int $<(length: 9)>$ | Días de mora.
ArrearFee1 | Double $<(length: 18.2)>$ | Comisión por mora 1.
ArrearFee2 | Double $<(length: 18.2)>$ | Comisión por mora 2.
ArrearFee3 | Double $<(length: 18.2)>$ | Comisión por mora 3.
ArrearInterest | Double $<(length: 18.2)>$ | Interés de mora.
ArrearTax | Double $<(length: 18.2)>$ | Impuesto sobre mora.
Capital | Double $<(length: 18.2)>$ | Capital.
CapitalConcessional | Double $<(length: 18.2)>$ | Capital concesional.
CapitalTax | Double $<(length: 18.2)>$ | Impuesto sobre capital.
CompensatoryInterest | Double $<(length: 18.2)>$ | Interés compensatorio.
CompensatoryInterestTax | Double $<(length: 18.2)>$ | Impuesto sobre interés compensatorio.
Concessional | Double $<(length: 18.2)>$ | Concesional.
DecimalsNumber | Byte $<(length: 1)>$ | Número de decimales.
DefaultDate | Date $<(length: 8)>$ | Fecha de incumplimiento.
DeferredInterests | Double $<(length: 18.2)>$ | Intereses diferidos.
DeferredInterestTax1 | Double $<(length: 18.2)>$ | Impuesto de interés diferido 1.
DeferredInterestTax2 | Double $<(length: 18.2)>$ | Impuesto de interés diferido 2.
DeferredInterestTax3 | Double $<(length: 18.2)>$ | Impuesto de interés diferido 3.
DistributedInsurance1 | Double $<(length: 18.2)>$ | Seguro distribuido 1.
DistributedInsurance2 | Double $<(length: 18.2)>$ | Seguro distribuido 2.
DistributedInterest | Double $<(length: 18.2)>$ | Interés distribuido.
DistributedInterestTax1 | Double $<(length: 18.2)>$ | Impuesto de interés distribuido 1.
DistributedInterestTax2 | Double $<(length: 18.2)>$ | Impuesto de interés distribuido 2.
DistributedInterestTax3 | Double $<(length: 18.2)>$ | Impuesto de interés distribuido 3.
EndDate | Date $<(length: 8)>$ | Fecha de fin.
ExtendsTerm | Boolean $<(length: 1)>$ | Extiende plazo.
Fees | [SdtsBTLOWFee](#sdtsbtlowfee) | Comisiones.
FeeTotal | Double $<(length: 18.2)>$ | Total de comisiones.
GraceInQuota | Boolean $<(length: 1)>$ | Gracia en cuota.
GraceReach | String $<(length: 1)>$ | Tipo de gracia.
InArrear | Boolean $<(length: 1)>$ | En mora.
InitialDate | Date $<(length: 8)>$ | Fecha inicial.
InstallmentNumber | Short | Número de cuota.
InstallmentType | String $<(length: 1)>$ | Tipo de cuota.
InstallmentValue | Double $<(length: 18.2)>$ | Valor de la cuota.
Insurances | [SdtsBTLOWInsurance](#sdtsbtlowinsurance) | Seguros.
InsurancesTotal | Double $<(length: 18.2)>$ | Total de seguros.
Interest | Double $<(length: 18.2)>$ | Interés.
InterestTax1 | Double $<(length: 18.2)>$ | Impuesto de interés 1.
InterestTax2 | Double $<(length: 18.2)>$ | Impuesto de interés 2.
InterestTax3 | Double $<(length: 18.2)>$ | Impuesto de interés 3.
InversePlannedPaymentDate | Int $<(length: 8)>$ | Fecha prevista de pago inversa.
Payments | [SdtsBTLOWPayment](#sdtsbtlowpayment) | Pagos.
PlannedPaymentDate | Date $<(length: 8)>$ | Fecha prevista de pago.
PunitiveInterest | Double $<(length: 18.2)>$ | Interés punitorio.
PunitiveInterestTax | Double $<(length: 18.2)>$ | Impuesto sobre interés punitorio.
RoundOff | Double $<(length: 18.2)>$ | Redondeo.
StatusId | String $<(length: 1)>$ | Identificador de estado.
SubTotal | Double $<(length: 18.2)>$ | Subtotal.
Subvention1 | Double $<(length: 18.2)>$ | Subvención 1.
Subvention2 | Double $<(length: 18.2)>$ | Subvención 2.
Subvention3 | Double $<(length: 18.2)>$ | Subvención 3.
Taxes | Double $<(length: 18.2)>$ | Impuestos.
TaxWithoutSubvention | Double $<(length: 18.2)>$ | Impuesto sin subvención.
Term | Int $<(length: 5)>$ | Plazo.
Total | Double $<(length: 18.2)>$ | Total.
:::

::: details SdtsBTLOWFee

### SdtsBTLOWFee

::: center
Los campos del tipo de dato estructurado SdtsBTLOWFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Amount | Double $<(length: 18.2)>$ | Monto.
AppliesToDisbursement | Boolean $<(length: 1)>$ | Aplica al desembolso.
CalculationBase | String $<(length: 1)>$ | Base de cálculo.
ChargeBase | String $<(length: 1)>$ | Base de cargo.
Description | String $<(length: 30)>$ | Descripción.
DistributionForm | String $<(length: 1)>$ | Forma de distribución.
Enabled | Boolean $<(length: 1)>$ | Habilitado.
ExcludesCapitalization | Boolean $<(length: 1)>$ | Excluye capitalización.
FeeId | Int $<(length: 5)>$ | Identificador de comisión.
FeeTypeId | String $<(length: 1)>$ | Identificador del tipo de comisión.
MaximumAmount | Double $<(length: 18.2)>$ | Monto máximo.
MinimumAmount | Double $<(length: 18.2)>$ | Monto mínimo.
Modifiable | Boolean $<(length: 1)>$ | Modificable.
ModificationType | Byte $<(length: 1)>$ | Tipo de modificación.
Modified | Boolean $<(length: 1)>$ | Modificado.
Percentage | Double $<(length: 11.6)>$ | Porcentaje.
SuggestsAmount | Double $<(length: 18.2)>$ | Sugiere monto.
Tax | Double $<(length: 18.2)>$ | Impuesto.
Total | Double $<(length: 18.2)>$ | Total.
TotalAmount | Double $<(length: 18.2)>$ | Monto total.
:::

::: details SdtsBTLOWInsurance

### SdtsBTLOWInsurance

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddedAmount | Double $<(length: 18.2)>$ | Monto agregado.
AllowsModification | Boolean $<(length: 1)>$ | Permite modificación.
AssociatesInsurancePolicy | Boolean $<(length: 1)>$ | Asocia póliza de seguro.
ChargeTypeId | String $<(length: 1)>$ | Identificador del tipo de cargo.
CommercialValue | Double $<(length: 18.2)>$ | Valor comercial.
Description | String | Descripción.
ExtraPremium | Double $<(length: 18.2)>$ | Prima adicional.
Id | Int $<(length: 9)>$ | Identificador.
ManagesExtraPremium | Boolean $<(length: 1)>$ | Gestiona prima adicional.
Modified | Boolean $<(length: 1)>$ | Modificado.
PercentageModified | Double $<(length: 11.6)>$ | Porcentaje modificado.
PolicyEndDate | Date $<(length: 8)>$ | Fecha de fin de póliza.
PolicyNumber | String $<(length: 20)>$ | Número de póliza.
PolicyStartDate | Date $<(length: 8)>$ | Fecha de inicio de póliza.
Total | Double $<(length: 18.2)>$ | Total.
:::

::: details SdtsBTLOWPayment

### SdtsBTLOWPayment

::: center
Los campos del tipo de dato estructurado SdtsBTLOWPayment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountBalance | Double $<(length: 18.2)>$ | Saldo contable.
ArrearFee1 | Double $<(length: 18.2)>$ | Comisión por mora 1.
ArrearFee2 | Double $<(length: 18.2)>$ | Comisión por mora 2.
ArrearFee3 | Double $<(length: 18.2)>$ | Comisión por mora 3.
ArrearInterest | Double $<(length: 18.2)>$ | Interés de mora.
ArrearRate | Double $<(length: 11.6)>$ | Tasa de mora.
ArrearTax | Double $<(length: 18.2)>$ | Impuesto sobre mora.
Capital | Double $<(length: 18.2)>$ | Capital.
CapitalConcessional | Double $<(length: 18.2)>$ | Capital concesional.
CapitalTax | Double $<(length: 18.2)>$ | Impuesto sobre capital.
CompensatoryInterest | Double $<(length: 18.2)>$ | Interés compensatorio.
CompensatoryInterestTax | Double $<(length: 18.2)>$ | Impuesto sobre interés compensatorio.
Concessional | Double $<(length: 18.2)>$ | Concesional.
DeferredInterest | Double $<(length: 18.2)>$ | Interés diferido.
DeferredInterestTax1 | Double $<(length: 18.2)>$ | Impuesto de interés diferido 1.
DeferredInterestTax2 | Double $<(length: 18.2)>$ | Impuesto de interés diferido 2.
DeferredInterestTax3 | Double $<(length: 18.2)>$ | Impuesto de interés diferido 3.
DistributedInsurance1 | Double $<(length: 18.2)>$ | Seguro distribuido 1.
DistributedInsurance2 | Double $<(length: 18.2)>$ | Seguro distribuido 2.
DistributedInterest | Double $<(length: 18.2)>$ | Interés distribuido.
DistributedInterestTax1 | Double $<(length: 18.2)>$ | Impuesto de interés distribuido 1.
DistributedInterestTax2 | Double $<(length: 18.2)>$ | Impuesto de interés distribuido 2.
DistributedInterestTax3 | Double $<(length: 18.2)>$ | Impuesto de interés distribuido 3.
Fees | [SdtsBTLOWFee](#sdtsbtlowfee) | Comisiones.
FeeTotal | Double $<(length: 18.2)>$ | Total de comisiones.
InstallmentNumber | Int $<(length: 5)>$ | Número de cuota.
InstallmentType | String $<(length: 1)>$ | Tipo de cuota.
Insurances | [SdtsBTLOWInsurance](#sdtsbtlowinsurance) | Seguros.
InsurancesTotal | Double $<(length: 18.2)>$ | Total de seguros.
Interest | Double $<(length: 18.2)>$ | Interés.
InterestModality | Byte $<(length: 2)>$ | Modalidad de interés.
InterestTax1 | Double $<(length: 18.2)>$ | Impuesto de interés 1.
InterestTax2 | Double $<(length: 18.2)>$ | Impuesto de interés 2.
InterestTax3 | Double $<(length: 18.2)>$ | Impuesto de interés 3.
MovementGUID | String | GUID del movimiento.
PaymentDate | Date $<(length: 8)>$ | Fecha de pago.
PaymentNumber | Short | Número de pago.
PlannedPaymentDate | Date $<(length: 8)>$ | Fecha prevista de pago.
PunitiveInterest | Double $<(length: 18.2)>$ | Interés punitorio.
PunitiveInterestTax | Double $<(length: 18.2)>$ | Impuesto sobre interés punitorio.
RoundOff | Double $<(length: 18.2)>$ | Redondeo.
StatusId | String $<(length: 1)>$ | Identificador de estado.
Subvention1 | Double $<(length: 18.2)>$ | Subvención 1.
Subvention2 | Double $<(length: 18.2)>$ | Subvención 2.
Subvention3 | Double $<(length: 18.2)>$ | Subvención 3.
Taxes | Double $<(length: 18.2)>$ | Impuestos.
Total | Double $<(length: 18.2)>$ | Total.
:::
<!-- CIERRA SDT -->
