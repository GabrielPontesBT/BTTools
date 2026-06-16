---
title: Get Group Loan Simulation
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la simulación de un integrante de un grupo.

**Nombre publicación:** PublicLoans.getGroupLoanSimulation

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0041

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
simulationGUID | String $<(length: 36)>$ | GUID (identificador único global) de la simulación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
currencyId | Short $<(length: 4)>$ | Código de moneda.
currencyDescription | String $<(length: 30)>$ | Descripción de moneda.
currencySign | String $<(length: 4)>$ | Símbolo de moneda.
general | [SdtsBTLOGeneralData](#sdtsbtlogeneraldata) | Información general de la simulación.
installmentDetails | [SdtsBTLOInstallmentDetail](#sdtsbtloinstallmentdetail) | Listado de detalles de cuotas.
disbursementFees | [SdtsBTLOFeeLoanOut](#sdtsbtlofeeloanout) | Listado de comisiones en desembolso.
installmentFees | [SdtsBTLOFeeLoanOut](#sdtsbtlofeeloanout) | Listado de comisiones por cuota.
insurancesAssociated | [SdtsBTLOInsuranceLoanOut](#sdtsbtloinsuranceloanout) | Listado de seguros.

@tab Errores

Código | Descripción
:--------- | :-----------
120050012 | Debe ingresar el GUID de la simulación.
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
  "simulationGUID": "6bad8760-206d-4eed-ad31-845081289d22"
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
  "currencyId": 0,
  "currencyDescription": "Pesos Uruguayos",
  "currencySign": "$",
  "general": {
    "QuotaPeriodicity": 7,
    "RateTypeDescription": "Efectiva Anual",
    "FirstPaymentDate": "2027-07-22",
    "TotalOfTerm": 82,
    "QuotaValue": 1813.0,
    "ProductDescription": "GRUPALES",
    "Amount": 15000.6,
    "AmortizationTypeId": 3,
    "QuotaNumber": 12,
    "RateTypeId": 1,
    "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
    "ExpirationDate": "2027-10-07",
    "Rate": 15.0,
    "Capital": 15000.0,
    "ValueDate": "2027-07-15",
    "Term": 82,
    "TotalFinancialCost": 0.0,
    "Total": 21755.4
  },
  "installmentDetails": [
    {
      "initialDate": "2027-07-15",
      "paymentDate": "2027-07-22",
      "term": 7,
      "capital": 1197.18,
      "interest": 40.82,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 75.0
        }
      ],
      "insurancesTotal": 75.0,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 1
    },
    {
      "initialDate": "2027-07-22",
      "paymentDate": "2027-07-29",
      "term": 7,
      "capital": 1206.43,
      "interest": 37.56,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 69.01
        }
      ],
      "insurancesTotal": 69.01,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 2
    },
    {
      "initialDate": "2027-07-29",
      "paymentDate": "2027-08-05",
      "term": 6,
      "capital": 1220.64,
      "interest": 29.38,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 62.98
        }
      ],
      "insurancesTotal": 62.98,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 3
    },
    {
      "initialDate": "2027-08-05",
      "paymentDate": "2027-08-12",
      "term": 7,
      "capital": 1225.16,
      "interest": 30.96,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 56.88
        }
      ],
      "insurancesTotal": 56.88,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 4
    },
    {
      "initialDate": "2027-08-12",
      "paymentDate": "2027-08-19",
      "term": 7,
      "capital": 1234.63,
      "interest": 27.62,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 50.75
        }
      ],
      "insurancesTotal": 50.75,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 5
    },
    {
      "initialDate": "2027-08-19",
      "paymentDate": "2027-08-26",
      "term": 7,
      "capital": 1244.16,
      "interest": 24.26,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 44.58
        }
      ],
      "insurancesTotal": 44.58,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 6
    },
    {
      "initialDate": "2027-08-26",
      "paymentDate": "2027-09-02",
      "term": 6,
      "capital": 1256.75,
      "interest": 17.89,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 38.36
        }
      ],
      "insurancesTotal": 38.36,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 7
    },
    {
      "initialDate": "2027-09-02",
      "paymentDate": "2027-09-09",
      "term": 7,
      "capital": 1263.46,
      "interest": 17.46,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 32.08
        }
      ],
      "insurancesTotal": 32.08,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 8
    },
    {
      "initialDate": "2027-09-09",
      "paymentDate": "2027-09-16",
      "term": 7,
      "capital": 1273.22,
      "interest": 14.02,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 25.76
        }
      ],
      "insurancesTotal": 25.76,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 9
    },
    {
      "initialDate": "2027-09-16",
      "paymentDate": "2027-09-23",
      "term": 7,
      "capital": 1283.06,
      "interest": 10.55,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 19.39
        }
      ],
      "insurancesTotal": 19.39,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 10
    },
    {
      "initialDate": "2027-09-23",
      "paymentDate": "2027-09-30",
      "term": 7,
      "capital": 1292.96,
      "interest": 7.06,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 12.98
        }
      ],
      "insurancesTotal": 12.98,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1813.0,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 11
    },
    {
      "initialDate": "2027-09-30",
      "paymentDate": "2027-10-07",
      "term": 7,
      "capital": 1302.35,
      "interest": 3.54,
      "deferredInterest": 0.0,
      "insurances": [
        {
          "insuranceId": 1,
          "description": "SEGURO 1",
          "amount": 6.51
        }
      ],
      "insurancesTotal": 6.51,
      "taxes": 0.0,
      "fees": [
        {
          "feeId": 3701,
          "feeName": "Comisión Estudio de Proyectos",
          "amount": 500.0,
          "taxes": 0.0,
          "total": 500.0
        }
      ],
      "feesTotal": 500.0,
      "total": 1812.4,
      "installmentType": "M",
      "typeOfGrace": "",
      "roundOff": 0.0,
      "installmentNumber": 12
    }
  ],
  "disbursementFees": [],
  "installmentFees": [
    {
      "installmentFee": ""
    }
  ],
  "insurancesAssociated": [
    {
      "InsuranceId": 1,
      "Description": "SEGURO 1",
      "PolicyStartDate": "",
      "PolicyEndDate": "",
      "Policy": "",
      "AdditionalAmount": 0.0,
      "Percentage": 0.5,
      "ExtraPrime": 0.0,
      "CommercialValue": 0.0,
      "ChargeTypeId": "S",
      "ManagesExtraPremium": false,
      "InsuranceTypeDescription": "VIDA"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "17:56:02",
    "Numero": 13546976,
    "Servicio": "PublicLoans.getGroupLoanSimulation",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOGeneralData

### SdtsBTLOGeneralData

::: center
Los campos del tipo de dato estructurado SdtsBTLOGeneralData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AmortizationTypeId | Byte $<(length: 2)>$ | Identificador del tipo de amortización.
AmortizationTypeDescription | String $<(length: 30)>$ | Descripción del tipo de amortización.
Amount | Double $<(length: 18.5)>$ | Monto.
Capital | Double $<(length: 18.5)>$ | Capital.
ExpirationDate | Date | Fecha de vencimiento.
FirstPaymentDate | Date | Fecha del primer pago.
ProductDescription | String $<(length: 30)>$ | Descripción del producto.
QuotaNumber | Int $<(length: 5)>$ | Número de cuota.
QuotaPeriodicity | Int $<(length: 5)>$ | Periodicidad de cuotas.
QuotaValue | Double $<(length: 18.5)>$ | Valor de cuota.
Rate | Double $<(length: 11.6)>$ | Tasa.
RateTypeId | Byte $<(length: 1)>$ | Identificador del tipo de tasa.
RateTypeDescription | String $<(length: 30)>$ | Descripción del tipo de tasa.
Term | Int $<(length: 5)>$ | Plazo.
Total | Double $<(length: 18.2)>$ | Total
TotalFinancialCost | Double $<(length: 11.6)>$ | Costo financiero total.
TotalOfTerm | Int $<(length: 5)>$ | Total del plazo.
ValueDate | Date | Fecha valor.
:::

::: details SdtsBTLOInstallmentDetail

### SdtsBTLOInstallmentDetail

::: center
Los campos del tipo de dato estructurado SdtsBTLOInstallmentDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
capital | Double | Capital.
deferredInterest | Double | Intereses diferidos.
fees | [SdtsBTLOFeeDetail](#sdtsbtlofeedetail) | Comisiones.
feesTotal | Double | Total de comisiones.
initialDate | Date | Fecha inicial.
installmentNumber | Short | Número de cuota.
installmentType | String | Tipo de cuota.
insurances | [SdtsBTLOInsuranceDetail](#sdtsbtloinsurancedetail) | Seguros.
insurancesTotal | Double | Total de seguros.
interest | Double | Interés.
paymentDate | Date | Fecha de fin.
roundOff | Double | Redondeo.
taxes | Double | Impuestos.
term | Int | Plazo.
total | Double | Total.
typeOfGrace | String $<(length: 1)>$ | Tipo de gracia.
:::

::: details SdtsBTLOFeeDetail

### SdtsBTLOFeeDetail

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(length: 18.2)>$ | Monto.
feeId | Int $<(length: 5)>$ | Identificador de comisión.
feeName | String $<(length: 30)>$ | Descripción.
taxes | Double $<(length: 18.2)>$ | Impuestos.
total | Double $<(length: 18.2)>$ | Total.
:::

::: details SdtsBTLOInsuranceDetail

### SdtsBTLOInsuranceDetail

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(length: 18.2)>$ | Prima.
description | String $<(length: 40)>$ | Descripción.
insuranceId | Int $<(length: 9)>$ | Identificador de seguro.
:::

::: details SdtsBTLOFeeLoanOut

### SdtsBTLOFeeLoanOut

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeLoanOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Amount | Double $<(length: 18.5)>$ | Importe.
Description | String $<(length: 30)>$ | Description.
FeeId | Int $<(length: 5)>$ | Id de comisión.
ModificationType | Byte $<(length: 1)>$ | Tipo de modificación.
Modified | Boolean | Modificado.
Percentage | Double $<(length: 11.6)>$ | Porcentaje.
:::

::: details SdtsBTLOFeeLoanOut

### SdtsBTLOFeeLoanOut

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeLoanOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Amount | Double $<(length: 18.5)>$ | Importe.
Description | String $<(length: 30)>$ | Description.
FeeId | Int $<(length: 5)>$ | Id de comisión.
ModificationType | Byte $<(length: 1)>$ | Tipo de modificación.
Modified | Boolean | Modificado.
Percentage | Double $<(length: 11.6)>$ | Porcentaje.
:::

::: details SdtsBTLOInsuranceLoanOut

### SdtsBTLOInsuranceLoanOut

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceLoanOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AdditionalAmount | Double $<(length: 18.2)>$ | Monto agregado.
ChargeTypeId | String $<(length: 1)>$ | Tipo de cobro
CommercialValue | Double $<(length: 18.2)>$ | Valor comercial.
Description | String $<(length: 30)>$ | Descripción.
ExtraPrime | Double $<(length: 11.6)>$ | Prima adicional.
InsuranceId | Int $<(length: 9)>$ | Identificador de seguro.
InsuranceTypeDescription | String $<(length: 40)>$ | Descripción de tipo de seguro
ManagesExtraPremium | Boolean | Incluye prima adicional?
Percentage | Double $<(length: 11.6)>$ | Porcentaje modificado.
Policy | String $<(length: 20)>$ | Número de póliza.
PolicyEndDate | Date | Fecha de fin de póliza.
PolicyStartDate | Date | Fecha de inicio de póliza.
:::
<!-- CIERRA SDT -->