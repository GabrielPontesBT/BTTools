---
title: Get Group Query
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para consultar situación de un crédito grupal

**Nombre publicación:** PublicLoans.getGroupQuery

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0049

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(length: 9)>$ | Identificador de grupo.
queryDate | Date | Fecha de consulta.
interestModality | Byte $<(length: 2)>$ | Modalidad de interés.
queryMode | String $<(length: 3)>$ | Modo de consulta.
includePayments | Boolean | ¿Incluir Pagos?
includeFuturePayments | Boolean | ¿Incluir pagos futuros?

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
totalDebt | Double $<(length: 18.2)>$ | Deuda total.
totalOfCapital | Double $<(length: 18.2)>$ | Total de capital.
totalOfCapitalTaxes | Double $<(length: 18.2)>$ | Total de impuestos sobre capital.
totalOfInterest | Double $<(length: 18.2)>$ | Total de interés.
totalOfInterestTaxes | Double $<(length: 18.2)>$ | Total de impuestos sobre interés.
totalOfDeferredInterest | Double $<(length: 18.2)>$ | Total de interés diferido.
totalOfDeferredInterestTaxes | Double $<(length: 18.2)>$ | Total de impuestos sobre interés diferido.
totalOfDistributedInterest | Double $<(length: 18.2)>$ | Total de interés distribuido.
totalOfDistributedInterestTaxes | Double $<(length: 18.2)>$ | Total de impuestos sobre interés distribuido..
totalOfInterestArrears | Double $<(length: 18.2)>$ | Total de interés por mora.
totalOfInterestArrearsTaxes | Double $<(length: 18.2)>$ | Total de impuestos sobre interés por mora.
totalOfInterestArrearsFees | Double $<(length: 18.2)>$ | Total de comisiones sobre interés por mora.
totalOfCompensatoryInterest | Double $<(length: 18.2)>$ | Total de interés compensatorio.
totalOfCompensatoryInterestFees | Double $<(length: 18.2)>$ | Total de comisiones sobre interés compensatorio.
totalOfPunitiveInterest | Double $<(length: 18.2)>$ | Total de interés punitorio.
totalOfPunitiveInterestFees | Double $<(length: 18.2)>$ | Total de comisiones sobre interés punitorio.
totalOfTaxes | Double $<(length: 18.2)>$ | Total de impuestos.
totalOfInsurances | Double $<(length: 18.2)>$ | Total de seguros.
totalOfDistributedInsurances | Double $<(length: 18.2)>$ | Total de seguros distribuidos.
totalOfConcessional | Double $<(length: 18.2)>$ | Total de montos concesionales.
totalOfCapitalConcessional | Double $<(length: 18.2)>$ | Total de capital concesional.
totalOfFees | Double $<(length: 18.2)>$ | Total de comisiones.
totalTaxesOnFeesInQuotas | Double $<(length: 18.2)>$ | Total de impuestos sobre comisiones en cuotas.
totalOfCancelationFee | Double $<(length: 18.2)>$ | Total de comisión por cancelación.
totalOfTaxesInCancelationFee | Double $<(length: 18.2)>$ | Total de impuestos en comisión por cancelación.
totalOfRoundOff | Double $<(length: 18.2)>$ | Total de redondeo.
daysInArrears | Int $<(length: 9)>$ | Días de atraso.
kindValue | Double $<(length: 15.8)>$ | Precio de especie.
installmentSchedule | [SdtsBTLOWInstallment](#sdtsbtlowinstallment) | Lista de cuotas.

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

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
    "Token": "E7548E743C3DEA2739C8011D"
  },
  "groupId": "70",
  "queryDate": "2027-07-30",
  "interestModality": "2",
  "queryMode": "QRY",
  "includePayments": "true",
  "includeFuturePayments": "true"
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
    "Token": "E7548E743C3DEA2739C8011D"
  },
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
        "InsurancesTotal": "120.00",
        "InitialDate": "2027-07-30",
        "ArrearDays": 0,
        "Insurances": {
          "Insurance": [
            {
              "Id": 1,
              "Description": "SEGURO 1",
              "Total": "120.00"
            }
          ]
        },
        "ArrearInterest": "0.00",
        "TaxWithoutSubvention": "0.00",
        "CapitalConcessional": "0.00",
        "DistributedInsurance2": "0.00",
        "DistributedInsurance1": "0.00",
        "FeeTotal": "0.00",
        "DistributedInterest": "0.00",
        "ExtendsTerm": false,
        "CapitalTax": "0.00",
        "GraceInQuota": false,
        "Total": "3955.85",
        "EndDate": "2027-08-30",
        "Concessional": "0.00",
        "Term": 30,
        "InstallmentType": "M",
        "Capital": "3835.85",
        "InstallmentValue": "0.00",
        "RoundOff": "0.00",
        "CompensatoryInterestTax": "0.00",
        "InstallmentNumber": 1,
        "Interest": "0.00",
        "InArrear": false,
        "CompensatoryInterest": "0.00",
        "Subvention3": "0.00",
        "PunitiveInterestTax": "0.00",
        "Subvention2": "0.00",
        "ArrearTax": "0.00",
        "ArrearFee3": "0.00",
        "InversePlannedPaymentDate": 79729169,
        "ArrearFee2": "0.00",
        "Subvention1": "0.00",
        "ArrearFee1": "0.00",
        "GraceReach": "",
        "DistributedInterestTax3": "0.00",
        "DistributedInterestTax2": "0.00",
        "DistributedInterestTax1": "0.00",
        "PunitiveInterest": "0.00",
        "SubTotal": "3955.85",
        "DecimalsNumber": 0,
        "DefaultDate": "",
        "Taxes": "0.00",
        "PlannedPaymentDate": "2027-08-30",
        "Payments": {
          "Payment": []
        },
        "InterestTax3": "0.00",
        "InterestTax2": "0.00",
        "InterestTax1": "0.00",
        "DeferredInterestTax3": "0.00",
        "Fees": {
          "Fee": []
        },
        "DeferredInterestTax2": "0.00",
        "DeferredInterestTax1": "0.00",
        "DeferredInterests": "0.00",
        "StatusId": ""
      },
      {
        "InsurancesTotal": "100.83",
        "InitialDate": "2027-08-30",
        "ArrearDays": 0,
        "Insurances": {
          "Insurance": [
            {
              "Id": 1,
              "Description": "SEGURO 1",
              "Total": "100.83"
            }
          ]
        },
        "ArrearInterest": "0.00",
        "TaxWithoutSubvention": "0.00",
        "CapitalConcessional": "0.00",
        "DistributedInsurance2": "0.00",
        "DistributedInsurance1": "0.00",
        "FeeTotal": "0.00",
        "DistributedInterest": "0.00",
        "ExtendsTerm": false,
        "CapitalTax": "0.00",
        "GraceInQuota": false,
        "Total": "4000.78",
        "EndDate": "2027-09-30",
        "Concessional": "0.00",
        "Term": 30,
        "InstallmentType": "M",
        "Capital": "3899.95",
        "InstallmentValue": "0.00",
        "RoundOff": "0.00",
        "CompensatoryInterestTax": "0.00",
        "InstallmentNumber": 2,
        "Interest": "0.00",
        "InArrear": false,
        "CompensatoryInterest": "0.00",
        "Subvention3": "0.00",
        "PunitiveInterestTax": "0.00",
        "Subvention2": "0.00",
        "ArrearTax": "0.00",
        "ArrearFee3": "0.00",
        "InversePlannedPaymentDate": 79729069,
        "ArrearFee2": "0.00",
        "Subvention1": "0.00",
        "ArrearFee1": "0.00",
        "GraceReach": "",
        "DistributedInterestTax3": "0.00",
        "DistributedInterestTax2": "0.00",
        "DistributedInterestTax1": "0.00",
        "PunitiveInterest": "0.00",
        "SubTotal": "7956.63",
        "DecimalsNumber": 0,
        "DefaultDate": "",
        "Taxes": "0.00",
        "PlannedPaymentDate": "2027-09-30",
        "Payments": {
          "Payment": []
        },
        "InterestTax3": "0.00",
        "InterestTax2": "0.00",
        "InterestTax1": "0.00",
        "DeferredInterestTax3": "0.00",
        "Fees": {
          "Fee": []
        },
        "DeferredInterestTax2": "0.00",
        "DeferredInterestTax1": "0.00",
        "DeferredInterests": "0.00",
        "StatusId": ""
      },
      {
        "InsurancesTotal": "81.32",
        "InitialDate": "2027-09-30",
        "ArrearDays": 0,
        "Insurances": {
          "Insurance": [
            {
              "Id": 1,
              "Description": "SEGURO 1",
              "Total": "81.32"
            }
          ]
        },
        "ArrearInterest": "0.00",
        "TaxWithoutSubvention": "0.00",
        "CapitalConcessional": "0.00",
        "DistributedInsurance2": "0.00",
        "DistributedInsurance1": "0.00",
        "FeeTotal": "0.00",
        "DistributedInterest": "0.00",
        "ExtendsTerm": false,
        "CapitalTax": "0.00",
        "GraceInQuota": false,
        "Total": "4046.46",
        "EndDate": "2027-10-31",
        "Concessional": "0.00",
        "Term": 30,
        "InstallmentType": "M",
        "Capital": "3965.14",
        "InstallmentValue": "0.00",
        "RoundOff": "0.00",
        "CompensatoryInterestTax": "0.00",
        "InstallmentNumber": 3,
        "Interest": "0.00",
        "InArrear": false,
        "CompensatoryInterest": "0.00",
        "Subvention3": "0.00",
        "PunitiveInterestTax": "0.00",
        "Subvention2": "0.00",
        "ArrearTax": "0.00",
        "ArrearFee3": "0.00",
        "InversePlannedPaymentDate": 79728968,
        "ArrearFee2": "0.00",
        "Subvention1": "0.00",
        "ArrearFee1": "0.00",
        "GraceReach": "",
        "DistributedInterestTax3": "0.00",
        "DistributedInterestTax2": "0.00",
        "DistributedInterestTax1": "0.00",
        "PunitiveInterest": "0.00",
        "SubTotal": "12003.09",
        "DecimalsNumber": 0,
        "DefaultDate": "",
        "Taxes": "0.00",
        "PlannedPaymentDate": "2027-10-31",
        "Payments": {
          "Payment": []
        },
        "InterestTax3": "0.00",
        "InterestTax2": "0.00",
        "InterestTax1": "0.00",
        "DeferredInterestTax3": "0.00",
        "Fees": {
          "Fee": []
        },
        "DeferredInterestTax2": "0.00",
        "DeferredInterestTax1": "0.00",
        "DeferredInterests": "0.00",
        "StatusId": ""
      },
      {
        "InsurancesTotal": "61.49",
        "InitialDate": "2027-10-31",
        "ArrearDays": 0,
        "Insurances": {
          "Insurance": [
            {
              "Id": 1,
              "Description": "SEGURO 1",
              "Total": "61.49"
            }
          ]
        },
        "ArrearInterest": "0.00",
        "TaxWithoutSubvention": "0.00",
        "CapitalConcessional": "0.00",
        "DistributedInsurance2": "0.00",
        "DistributedInsurance1": "0.00",
        "FeeTotal": "0.00",
        "DistributedInterest": "0.00",
        "ExtendsTerm": false,
        "CapitalTax": "0.00",
        "GraceInQuota": false,
        "Total": "4092.91",
        "EndDate": "2027-11-30",
        "Concessional": "0.00",
        "Term": 30,
        "InstallmentType": "M",
        "Capital": "4031.42",
        "InstallmentValue": "0.00",
        "RoundOff": "0.00",
        "CompensatoryInterestTax": "0.00",
        "InstallmentNumber": 4,
        "Interest": "0.00",
        "InArrear": false,
        "CompensatoryInterest": "0.00",
        "Subvention3": "0.00",
        "PunitiveInterestTax": "0.00",
        "Subvention2": "0.00",
        "ArrearTax": "0.00",
        "ArrearFee3": "0.00",
        "InversePlannedPaymentDate": 79728869,
        "ArrearFee2": "0.00",
        "Subvention1": "0.00",
        "ArrearFee1": "0.00",
        "GraceReach": "",
        "DistributedInterestTax3": "0.00",
        "DistributedInterestTax2": "0.00",
        "DistributedInterestTax1": "0.00",
        "PunitiveInterest": "0.00",
        "SubTotal": "16096.00",
        "DecimalsNumber": 0,
        "DefaultDate": "",
        "Taxes": "0.00",
        "PlannedPaymentDate": "2027-11-30",
        "Payments": {
          "Payment": []
        },
        "InterestTax3": "0.00",
        "InterestTax2": "0.00",
        "InterestTax1": "0.00",
        "DeferredInterestTax3": "0.00",
        "Fees": {
          "Fee": []
        },
        "DeferredInterestTax2": "0.00",
        "DeferredInterestTax1": "0.00",
        "DeferredInterests": "0.00",
        "StatusId": ""
      },
      {
        "InsurancesTotal": "41.34",
        "InitialDate": "2027-11-30",
        "ArrearDays": 0,
        "Insurances": {
          "Insurance": [
            {
              "Id": 1,
              "Description": "SEGURO 1",
              "Total": "41.34"
            }
          ]
        },
        "ArrearInterest": "0.00",
        "TaxWithoutSubvention": "0.00",
        "CapitalConcessional": "0.00",
        "DistributedInsurance2": "0.00",
        "DistributedInsurance1": "0.00",
        "FeeTotal": "0.00",
        "DistributedInterest": "0.00",
        "ExtendsTerm": false,
        "CapitalTax": "0.00",
        "GraceInQuota": false,
        "Total": "4140.15",
        "EndDate": "2027-12-30",
        "Concessional": "0.00",
        "Term": 30,
        "InstallmentType": "M",
        "Capital": "4098.81",
        "InstallmentValue": "0.00",
        "RoundOff": "0.00",
        "CompensatoryInterestTax": "0.00",
        "InstallmentNumber": 5,
        "Interest": "0.00",
        "InArrear": false,
        "CompensatoryInterest": "0.00",
        "Subvention3": "0.00",
        "PunitiveInterestTax": "0.00",
        "Subvention2": "0.00",
        "ArrearTax": "0.00",
        "ArrearFee3": "0.00",
        "InversePlannedPaymentDate": 79728769,
        "ArrearFee2": "0.00",
        "Subvention1": "0.00",
        "ArrearFee1": "0.00",
        "GraceReach": "",
        "DistributedInterestTax3": "0.00",
        "DistributedInterestTax2": "0.00",
        "DistributedInterestTax1": "0.00",
        "PunitiveInterest": "0.00",
        "SubTotal": "20236.15",
        "DecimalsNumber": 0,
        "DefaultDate": "",
        "Taxes": "0.00",
        "PlannedPaymentDate": "2027-12-30",
        "Payments": {
          "Payment": []
        },
        "InterestTax3": "0.00",
        "InterestTax2": "0.00",
        "InterestTax1": "0.00",
        "DeferredInterestTax3": "0.00",
        "Fees": {
          "Fee": []
        },
        "DeferredInterestTax2": "0.00",
        "DeferredInterestTax1": "0.00",
        "DeferredInterests": "0.00",
        "StatusId": ""
      },
      {
        "InsurancesTotal": "20.84",
        "InitialDate": "2027-12-30",
        "ArrearDays": 0,
        "Insurances": {
          "Insurance": [
            {
              "Id": 1,
              "Description": "SEGURO 1",
              "Total": "20.84"
            }
          ]
        },
        "ArrearInterest": "0.00",
        "TaxWithoutSubvention": "0.00",
        "CapitalConcessional": "0.00",
        "DistributedInsurance2": "0.00",
        "DistributedInsurance1": "0.00",
        "FeeTotal": "0.00",
        "DistributedInterest": "0.00",
        "ExtendsTerm": false,
        "CapitalTax": "0.00",
        "GraceInQuota": false,
        "Total": "4189.67",
        "EndDate": "2028-01-30",
        "Concessional": "0.00",
        "Term": 30,
        "InstallmentType": "M",
        "Capital": "4168.83",
        "InstallmentValue": "0.00",
        "RoundOff": "0.00",
        "CompensatoryInterestTax": "0.00",
        "InstallmentNumber": 6,
        "Interest": "0.00",
        "InArrear": false,
        "CompensatoryInterest": "0.00",
        "Subvention3": "0.00",
        "PunitiveInterestTax": "0.00",
        "Subvention2": "0.00",
        "ArrearTax": "0.00",
        "ArrearFee3": "0.00",
        "InversePlannedPaymentDate": 79719869,
        "ArrearFee2": "0.00",
        "Subvention1": "0.00",
        "ArrearFee1": "0.00",
        "GraceReach": "",
        "DistributedInterestTax3": "0.00",
        "DistributedInterestTax2": "0.00",
        "DistributedInterestTax1": "0.00",
        "PunitiveInterest": "0.00",
        "SubTotal": "24425.82",
        "DecimalsNumber": 0,
        "DefaultDate": "",
        "Taxes": "0.00",
        "PlannedPaymentDate": "2028-01-30",
        "Payments": {
          "Payment": []
        },
        "InterestTax3": "0.00",
        "InterestTax2": "0.00",
        "InterestTax1": "0.00",
        "DeferredInterestTax3": "0.00",
        "Fees": {
          "Fee": []
        },
        "DeferredInterestTax2": "0.00",
        "DeferredInterestTax1": "0.00",
        "DeferredInterests": "0.00",
        "StatusId": ""
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "18:50:44",
    "Numero": 13584288,
    "Servicio": "PublicLoans.getGroupQuery",
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
Amount | Double | Monto.
AppliesToDisbursement | Boolean | Aplica al desembolso.
CalculationBase | String | Base de cálculo.
ChargeBase | String | Base imponible del cargo.
Description | String | Descripción.
DistributionForm | String | Forma de distribución.
Enabled | Boolean | Habilitado.
ExcludesCapitalization | Boolean | Excluye capitalización.
FeeId | Int | Identificador de comisión.
FeeTypeId | String | Tipo de comisión.
MaximumAmount | Double | Monto máximo.
MinimumAmount | Double | Monto mínimo.
Modifiable | Boolean | Editable.
ModificationType | Byte | Tipo de modificación.
Modified | Boolean | Modificado.
Percentage | Double | Porcentaje.
SuggestsAmount | Double | Monto sugerido.
Tax | Double | Impuesto.
Total | Double | Total
TotalAmount | Double | Monto total.
:::

::: details SdtsBTLOWInsurance

### SdtsBTLOWInsurance

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddedAmount | Double | Monto adicional.
AllowsModification | Boolean | Permite modificación.
AssociatesInsurancePolicy | Boolean | Asocia póliza de seguro.
ChargeTypeId | String | Identificador de tipo de cargo.
CommercialValue | Double | Valor comercial.
Description | String $<(length: 40)>$ | Descripción.
Description | String | Descripción
ExtraPremium | Double | Prima adicional.
Id | Int $<(length: 9)>$ | Identificador
Id | Int | Identificador
ManagesExtraPremium | Boolean | Maneja prima adicional.
Modified | Boolean | Modificado
PercentageModified | Double | Porcentaje modificado.
PolicyEndDate | Date | Fecha de vencimiento de póliza
PolicyNumber | String | Número de póliza.
PolicyStartDate | Date | Fecha de inicio de póliza
Total | Double | Total
Total | Double $<(length: 18.2)>$ | Total
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
