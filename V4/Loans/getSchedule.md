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
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.

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
ArrearDays | Int $<(Length: 9)>$ | Días de mora.
ArrearFee1 | Double $<(Length: 18.2)>$ | Comisión por mora 1.
ArrearFee2 | Double $<(Length: 18.2)>$ | Comisión por mora 2.
ArrearFee3 | Double $<(Length: 18.2)>$ | Comisión por mora 3.
ArrearInterest | Double $<(Length: 18.2)>$ | Interés de mora.
ArrearTax | Double $<(Length: 18.2)>$ | Impuesto sobre mora.
Capital | Double $<(Length: 18.2)>$ | Capital.
CapitalConcessional | Double $<(Length: 18.2)>$ | Capital concesional.
CapitalTax | Double $<(Length: 18.2)>$ | Impuesto sobre capital.
CompensatoryInterest | Double $<(Length: 18.2)>$ | Interés compensatorio.
CompensatoryInterestTax | Double $<(Length: 18.2)>$ | Impuesto sobre interés compensatorio.
Concessional | Double $<(Length: 18.2)>$ | Concesional.
DecimalsNumber | Byte $<(Length: 1)>$ | Número de decimales.
DefaultDate | Date $<(Length: 8)>$ | Fecha de incumplimiento.
DeferredInterests | Double $<(Length: 18.2)>$ | Intereses diferidos.
DeferredInterestTax1 | Double $<(Length: 18.2)>$ | Impuesto de interés diferido 1.
DeferredInterestTax2 | Double $<(Length: 18.2)>$ | Impuesto de interés diferido 2.
DeferredInterestTax3 | Double $<(Length: 18.2)>$ | Impuesto de interés diferido 3.
DistributedInsurance1 | Double $<(Length: 18.2)>$ | Seguro distribuido 1.
DistributedInsurance2 | Double $<(Length: 18.2)>$ | Seguro distribuido 2.
DistributedInterest | Double $<(Length: 18.2)>$ | Interés distribuido.
DistributedInterestTax1 | Double $<(Length: 18.2)>$ | Impuesto de interés distribuido 1.
DistributedInterestTax2 | Double $<(Length: 18.2)>$ | Impuesto de interés distribuido 2.
DistributedInterestTax3 | Double $<(Length: 18.2)>$ | Impuesto de interés distribuido 3.
EndDate | Date $<(Length: 8)>$ | Fecha de fin.
ExtendsTerm | Boolean | Extiende plazo.
Fees | [SdtsBTLOWFee](#sdtsbtlowfee) | Comisiones.
FeeTotal | Double $<(Length: 18.2)>$ | Total de comisiones.
GraceInQuota | Boolean | Gracia en cuota.
GraceReach | String $<(Length: 1)>$ | Tipo de gracia.
InArrear | Boolean | En mora.
InitialDate | Date $<(Length: 8)>$ | Fecha inicial.
InstallmentNumber | Short | Número de cuota.
InstallmentType | String $<(Length: 1)>$ | Tipo de cuota.
InstallmentValue | Double $<(Length: 18.2)>$ | Valor de la cuota.
Insurances | [SdtsBTLOWInsurance](#sdtsbtlowinsurance) | Seguros.
InsurancesTotal | Double $<(Length: 18.2)>$ | Total de seguros.
Interest | Double $<(Length: 18.2)>$ | Interés.
InterestTax1 | Double $<(Length: 18.2)>$ | Impuesto de interés 1.
InterestTax2 | Double $<(Length: 18.2)>$ | Impuesto de interés 2.
InterestTax3 | Double $<(Length: 18.2)>$ | Impuesto de interés 3.
InversePlannedPaymentDate | Int $<(Length: 8)>$ | Fecha prevista de pago inversa.
Payments | [SdtsBTLOWPayment](#sdtsbtlowpayment) | Pagos.
PlannedPaymentDate | Date $<(Length: 8)>$ | Fecha prevista de pago.
PunitiveInterest | Double $<(Length: 18.2)>$ | Interés punitorio.
PunitiveInterestTax | Double $<(Length: 18.2)>$ | Impuesto sobre interés punitorio.
RoundOff | Double $<(Length: 18.2)>$ | Redondeo.
StatusId | String $<(Length: 1)>$ | Identificador de estado.
SubTotal | Double $<(Length: 18.2)>$ | Subtotal.
Subvention1 | Double $<(Length: 18.2)>$ | Subvención 1.
Subvention2 | Double $<(Length: 18.2)>$ | Subvención 2.
Subvention3 | Double $<(Length: 18.2)>$ | Subvención 3.
Taxes | Double $<(Length: 18.2)>$ | Impuestos.
TaxWithoutSubvention | Double $<(Length: 18.2)>$ | Impuesto sin subvención.
Term | Int $<(Length: 5)>$ | Plazo.
Total | Double $<(Length: 18.2)>$ | Total.
:::

::: details SdtsBTLOWFee

### SdtsBTLOWFee

::: center
Los campos del tipo de dato estructurado SdtsBTLOWFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Amount | Double $<(Length: 18.2)>$ | Monto.
AppliesToDisbursement | Boolean | Aplica al desembolso.
CalculationBase | String $<(Length: 1)>$ | Base de cálculo.
ChargeBase | String $<(Length: 1)>$ | Base de cargo.
Description | String $<(Length: 30)>$ | Descripción.
DistributionForm | String $<(Length: 1)>$ | Forma de distribución.
Enabled | Boolean | Habilitado.
ExcludesCapitalization | Boolean | Excluye capitalización.
FeeId | Int $<(Length: 5)>$ | Identificador de comisión.
FeeTypeId | String $<(Length: 1)>$ | Identificador del tipo de comisión.
MaximumAmount | Double $<(Length: 18.2)>$ | Monto máximo.
MinimumAmount | Double $<(Length: 18.2)>$ | Monto mínimo.
Modifiable | Boolean | Modificable.
ModificationType | Byte $<(Length: 1)>$ | Tipo de modificación.
Modified | Boolean | Modificado.
Percentage | Double $<(Length: 11.6)>$ | Porcentaje.
SuggestsAmount | Double $<(Length: 18.2)>$ | Sugiere monto.
Tax | Double $<(Length: 18.2)>$ | Impuesto.
Total | Double $<(Length: 18.2)>$ | Total.
TotalAmount | Double $<(Length: 18.2)>$ | Monto total.
:::

::: details SdtsBTLOWInsurance

### SdtsBTLOWInsurance

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddedAmount | Double $<(Length: 18.2)>$ | Monto agregado.
AllowsModification | Boolean | Permite modificación.
AssociatesInsurancePolicy | Boolean | Asocia póliza de seguro.
ChargeTypeId | String $<(Length: 1)>$ | Identificador del tipo de cargo.
CommercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
Description | String | Descripción.
ExtraPremium | Double $<(Length: 18.2)>$ | Prima adicional.
Id | Int $<(Length: 9)>$ | Identificador.
ManagesExtraPremium | Boolean | Gestiona prima adicional.
Modified | Boolean | Modificado.
PercentageModified | Double $<(Length: 11.6)>$ | Porcentaje modificado.
PolicyEndDate | Date $<(Length: 8)>$ | Fecha de fin de póliza.
PolicyNumber | String $<(Length: 20)>$ | Número de póliza.
PolicyStartDate | Date $<(Length: 8)>$ | Fecha de inicio de póliza.
Total | Double $<(Length: 18.2)>$ | Total.
:::

::: details SdtsBTLOWPayment

### SdtsBTLOWPayment

::: center
Los campos del tipo de dato estructurado SdtsBTLOWPayment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountBalance | Double $<(Length: 18.2)>$ | Saldo contable.
ArrearFee1 | Double $<(Length: 18.2)>$ | Comisión por mora 1.
ArrearFee2 | Double $<(Length: 18.2)>$ | Comisión por mora 2.
ArrearFee3 | Double $<(Length: 18.2)>$ | Comisión por mora 3.
ArrearInterest | Double $<(Length: 18.2)>$ | Interés de mora.
ArrearRate | Double $<(Length: 11.6)>$ | Tasa de mora.
ArrearTax | Double $<(Length: 18.2)>$ | Impuesto sobre mora.
Capital | Double $<(Length: 18.2)>$ | Capital.
CapitalConcessional | Double $<(Length: 18.2)>$ | Capital concesional.
CapitalTax | Double $<(Length: 18.2)>$ | Impuesto sobre capital.
CompensatoryInterest | Double $<(Length: 18.2)>$ | Interés compensatorio.
CompensatoryInterestTax | Double $<(Length: 18.2)>$ | Impuesto sobre interés compensatorio.
Concessional | Double $<(Length: 18.2)>$ | Concesional.
DeferredInterest | Double $<(Length: 18.2)>$ | Interés diferido.
DeferredInterestTax1 | Double $<(Length: 18.2)>$ | Impuesto de interés diferido 1.
DeferredInterestTax2 | Double $<(Length: 18.2)>$ | Impuesto de interés diferido 2.
DeferredInterestTax3 | Double $<(Length: 18.2)>$ | Impuesto de interés diferido 3.
DistributedInsurance1 | Double $<(Length: 18.2)>$ | Seguro distribuido 1.
DistributedInsurance2 | Double $<(Length: 18.2)>$ | Seguro distribuido 2.
DistributedInterest | Double $<(Length: 18.2)>$ | Interés distribuido.
DistributedInterestTax1 | Double $<(Length: 18.2)>$ | Impuesto de interés distribuido 1.
DistributedInterestTax2 | Double $<(Length: 18.2)>$ | Impuesto de interés distribuido 2.
DistributedInterestTax3 | Double $<(Length: 18.2)>$ | Impuesto de interés distribuido 3.
Fees | [SdtsBTLOWFee](#sdtsbtlowfee) | Comisiones.
FeeTotal | Double $<(Length: 18.2)>$ | Total de comisiones.
InstallmentNumber | Int $<(Length: 5)>$ | Número de cuota.
InstallmentType | String $<(Length: 1)>$ | Tipo de cuota.
Insurances | [SdtsBTLOWInsurance](#sdtsbtlowinsurance) | Seguros.
InsurancesTotal | Double $<(Length: 18.2)>$ | Total de seguros.
Interest | Double $<(Length: 18.2)>$ | Interés.
InterestModality | Byte $<(Length: 2)>$ | Modalidad de interés.
InterestTax1 | Double $<(Length: 18.2)>$ | Impuesto de interés 1.
InterestTax2 | Double $<(Length: 18.2)>$ | Impuesto de interés 2.
InterestTax3 | Double $<(Length: 18.2)>$ | Impuesto de interés 3.
MovementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.
PaymentDate | Date $<(Length: 8)>$ | Fecha de pago.
PaymentNumber | Short | Número de pago.
PlannedPaymentDate | Date $<(Length: 8)>$ | Fecha prevista de pago.
PunitiveInterest | Double $<(Length: 18.2)>$ | Interés punitorio.
PunitiveInterestTax | Double $<(Length: 18.2)>$ | Impuesto sobre interés punitorio.
RoundOff | Double $<(Length: 18.2)>$ | Redondeo.
StatusId | String $<(Length: 1)>$ | Identificador de estado.
Subvention1 | Double $<(Length: 18.2)>$ | Subvención 1.
Subvention2 | Double $<(Length: 18.2)>$ | Subvención 2.
Subvention3 | Double $<(Length: 18.2)>$ | Subvención 3.
Taxes | Double $<(Length: 18.2)>$ | Impuestos.
Total | Double $<(Length: 18.2)>$ | Total.
:::
<!-- CIERRA SDT -->
