---
title: Get Installment Payments
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el detalle de pago de una cuota específica de un préstamo.

**Nombre publicación:** PublicLoans.getInstallmentPayments

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0009

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String $<(length: 36)>$ | GUID (identificador único global) del préstamo.
installmentNumber | Int | Número de cuota.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
payments | [SdtsBTLOWInstallmentPayment](#sdtsbtlowinstallmentpayment) | Listado de pagos.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
120050001 | Debe ingresar el GUID de préstamo. | BTLOPA0009
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
  "installmentNumber": 0
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
  "payments": {
    "payment": [
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
            "Description": "",
            "FeeId": 0,
            "Tax": 0,
            "Total": 0
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
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
    "Servicio": "PublicLoans.getInstallmentPayments",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWInstallmentPayment

### SdtsBTLOWInstallmentPayment

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInstallmentPayment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountBalance | Double | Saldo de cuenta.
ArrearFee1 | Double | Comisión por mora 1.
ArrearFee2 | Double | Comisión por mora 2.
ArrearFee3 | Double | Comisión por mora 3.
ArrearInterest | Double | Interés de mora.
ArrearRate | Double | Tasa de mora.
ArrearTax | Double | Impuesto sobre mora.
Capital | Double | Capital.
CapitalConcessional | Double | Capital concesional.
CapitalTax | Double | Impuesto sobre capital.
CompensatoryInterest | Double | Interés compensatorio.
CompensatoryInterestTax | Double | Impuesto sobre interés compensatorio.
Concessional | Double | Concesional.
DeferredInterest | Double | Interés diferido.
DeferredInterestTax1 | Double | Impuesto de interés diferido 1.
DeferredInterestTax2 | Double | Impuesto de interés diferido 2.
DeferredInterestTax3 | Double | Impuesto de interés diferido 3.
DistributedInsurance1 | Double | Seguro distribuido 1.
DistributedInsurance2 | Double | Seguro distribuido 2.
DistributedInterest | Double | Interés distribuido.
DistributedInterestTax1 | Double | Impuesto de interés distribuido 1.
DistributedInterestTax2 | Double | Impuesto de interés distribuido 2.
DistributedInterestTax3 | Double | Impuesto de interés distribuido 3.
Fees | [SdtsBTLOWLoanFee](#sdtsbtlowloanfee) | Comisiones.
FeeTotal | Double | Total de comisiones.
InstallmentNumber | Int | Número de cuota.
InstallmentType | String | Tipo de cuota.
Insurances | [SdtsBTLOWInsurance](#sdtsbtlowinsurance) | Seguros.
InsurancesTotal | Double | Total de seguros.
Interest | Double | Interés.
InterestModality | Byte | Modalidad de interés.
InterestTax1 | Double | Impuesto de interés 1.
InterestTax2 | Double | Impuesto de interés 2.
InterestTax3 | Double | Impuesto de interés 3.
MovementGUID | String | GUID del movimiento.
PaymentDate | Date | Fecha de pago.
PaymentNumber | Short | Número de pago.
PlannedPaymentDate | Date | Fecha de pago planificado.
PunitiveInterest | Double | Interés punitorio.
PunitiveInterestTax | Double | Impuesto sobre interés punitorio.
RoundOff | Double | Redondeo.
StatusId | String | Identificador de estado.
Subvention1 | Double | Subvención 1.
Subvention2 | Double | Subvención 2.
Subvention3 | Double | Subvención 3.
Taxes | Double | Impuestos.
Total | Double | Total.
:::

::: details SdtsBTLOWLoanFee

### SdtsBTLOWLoanFee

::: center
Los campos del tipo de dato estructurado SdtsBTLOWLoanFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Amount | Double | Monto.
Description | String | Descripción.
FeeId | Int | Identificador de comisión.
Tax | Double | Impuesto.
Total | Double | Total.
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
Description | String | Descripción.
ExtraPremium | Double $<(length: 18.2)>$ | Prima adicional.
Id | Int $<(length: 9)>$ | Identificador.
Id | Int $<(length: 9)>$ | Identificador.
ManagesExtraPremium | Boolean $<(length: 1)>$ | Gestiona prima adicional.
Modified | Boolean $<(length: 1)>$ | Modificado.
PercentageModified | Double $<(length: 11.6)>$ | Porcentaje modificado.
PolicyEndDate | Date $<(length: 8)>$ | Fecha de fin de póliza.
PolicyNumber | String $<(length: 20)>$ | Número de póliza.
PolicyStartDate | Date $<(length: 8)>$ | Fecha de inicio de póliza.
Total | Double $<(length: 18.2)>$ | Total.
Total | Double $<(length: 18.2)>$ | Total.
:::
<!-- CIERRA SDT -->
