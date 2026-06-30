---
title: Group Loan Individual Resimulation
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para resimular un préstamo individual dentro de un grupo.

**Nombre publicación:** PublicLoans.groupLoanIndividualResimulation

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0042

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital | Double $<(Length: 18.2)>$ | Capital del préstamo.
rate | Double $<(Length: 11.6)>$ | Tasa.
keepFeesAndInsurances | Boolean | ¿Mantiene seguros y comisiones del preseteo o simulación anterior?
inputDisbursementFees | [SdtsBTLOFeeIn](#sdtsbtlofeein) | Comisiones en desembolso.
inputInstallmentFees | [SdtsBTLOFeeIn](#sdtsbtlofeein) | Comisiones por cuota.
inputInsurances | [SdtsBTLOInsuranceIn](#sdtsbtloinsurancein) | Seguros.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
rateTypeId | Byte $<(Length: 1)>$ | Identificador de tipo de tasa.
rate | Double $<(Length: 11.6)>$ | Tasa.
finantialTotalCostRate | Double $<(Length: 11.6)>$ | Tasa de costo financiero total.
firstPaymentDate | Date | Fecha de primer pago.
totalOfCapital | Double $<(Length: 18.2)>$ | Total de capital.
disbursementAmount | Double $<(Length: 18.2)>$ | Importe a desembolsar.
expirationDate | Date | Fecha de vencimiento de la operación.
term | Int $<(Length: 5)>$ | Plazo total.
totalOfInterest | Double $<(Length: 18.2)>$ | Total de interés.
totalOfFees | Double $<(Length: 18.2)>$ | Total de comisiones.
totalOfFeeTaxes | Double $<(Length: 18.2)>$ | Total de impuestos sobre comisiones.
totalOfTaxes | Double $<(Length: 18.2)>$ | Total de impuestos.
totalOfInsurances | Double $<(Length: 18.2)>$ | Total de seguros.
loan | [SdtsBTLOGLoanSimulation](#sdtsbtlogloansimulation) | Detalle de cuotas.
outputDisbursementFees | [SdtsBTLOFeeOut](#sdtsbtlofeeout) | Comisiones en desembolso.
outputInstallmentFees | [SdtsBTLOFeeOut](#sdtsbtlofeeout) | Comisiones por cuota.
outputInsurances | [SdtsBTLOInsuranceOut](#sdtsbtloinsuranceout) | Seguros.
installmentValue | Double $<(Length: 18.2)>$ | Valor Cuota.

@tab Errores

Código | Descripción
:--------- | :-----------
120020061 | No existen datos de simulación.
120060123 | El capital solicitado por el grupo es menor al mínimo permitido.
120060124 | El capital solicitado por el grupo es mayor al máximo permitido.
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
  "simulationGUID": "6bad8760-206d-4eed-ad31-845081289d22",
  "capital": 2000,
  "rate": 15,
  "keepFeesAndInsurances": true,
  "inputDisbursementFees": [
    {
      "feeId": "",
      "modified": "",
      "modificationType": "",
      "amount": "",
      "percentage": ""
    }
  ],
  "inputInstallmentFees": [
    {
      "feeId": "",
      "modified": "",
      "modificationType": "",
      "amount": "",
      "percentage": ""
    }
  ],
  "inputInsurances": [
    {
      "insuranceId": "",
      "modified": "",
      "policyStartDate": "",
      "policyEndDate": "",
      "policyNumber": "",
      "amount": "",
      "percentage": "",
      "extraPremium": "",
      "commercialValue": ""
    }
  ]
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
  "rateTypeId": 1,
  "rate": 15.0,
  "finantialTotalCostRate": 0.0,
  "firstPaymentDate": "2027-07-22",
  "totalOfCapital": 2000.0,
  "disbursementAmount": 2000.0,
  "expirationDate": "2027-10-07",
  "term": 82,
  "totalOfInterest": 34.83,
  "totalOfFees": 6000.0,
  "totalOfFeeTaxes": 0.0,
  "totalOfTaxes": 0.0,
  "totalOfInsurances": 65.93,
  "loan": {
    "productId": 9800104001,
    "currencyId": 0,
    "kindId": 0,
    "totalOfCapital": 2000.0,
    "installments": [
      {
        "initialDate": "2027-07-15",
        "paymentDate": "2027-07-22",
        "term": 7,
        "capital": 159.56,
        "interest": 5.44,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 10.0
          }
        ],
        "insurancesTotal": 10.0,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 1
      },
      {
        "initialDate": "2027-07-22",
        "paymentDate": "2027-07-29",
        "term": 7,
        "capital": 160.79,
        "interest": 5.01,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 9.2
          }
        ],
        "insurancesTotal": 9.2,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 2
      },
      {
        "initialDate": "2027-07-29",
        "paymentDate": "2027-08-05",
        "term": 6,
        "capital": 162.68,
        "interest": 3.92,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 8.4
          }
        ],
        "insurancesTotal": 8.4,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 3
      },
      {
        "initialDate": "2027-08-05",
        "paymentDate": "2027-08-12",
        "term": 7,
        "capital": 163.29,
        "interest": 4.13,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 7.58
          }
        ],
        "insurancesTotal": 7.58,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 4
      },
      {
        "initialDate": "2027-08-12",
        "paymentDate": "2027-08-19",
        "term": 7,
        "capital": 164.55,
        "interest": 3.68,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 6.77
          }
        ],
        "insurancesTotal": 6.77,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 5
      },
      {
        "initialDate": "2027-08-19",
        "paymentDate": "2027-08-26",
        "term": 7,
        "capital": 165.81,
        "interest": 3.24,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 5.95
          }
        ],
        "insurancesTotal": 5.95,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 6
      },
      {
        "initialDate": "2027-08-26",
        "paymentDate": "2027-09-02",
        "term": 6,
        "capital": 167.49,
        "interest": 2.39,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 5.12
          }
        ],
        "insurancesTotal": 5.12,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 7
      },
      {
        "initialDate": "2027-09-02",
        "paymentDate": "2027-09-09",
        "term": 7,
        "capital": 168.39,
        "interest": 2.33,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 4.28
          }
        ],
        "insurancesTotal": 4.28,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 8
      },
      {
        "initialDate": "2027-09-09",
        "paymentDate": "2027-09-16",
        "term": 7,
        "capital": 169.69,
        "interest": 1.87,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 3.44
          }
        ],
        "insurancesTotal": 3.44,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 9
      },
      {
        "initialDate": "2027-09-16",
        "paymentDate": "2027-09-23",
        "term": 7,
        "capital": 171.0,
        "interest": 1.41,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 2.59
          }
        ],
        "insurancesTotal": 2.59,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 10
      },
      {
        "initialDate": "2027-09-23",
        "paymentDate": "2027-09-30",
        "term": 7,
        "capital": 172.33,
        "interest": 0.94,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 1.73
          }
        ],
        "insurancesTotal": 1.73,
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
        "total": 675.0,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 11
      },
      {
        "initialDate": "2027-09-30",
        "paymentDate": "2027-10-07",
        "term": 7,
        "capital": 174.42,
        "interest": 0.47,
        "deferredInterest": 0.0,
        "insurances": [
          {
            "insuranceId": 1,
            "description": "SEGURO 1",
            "amount": 0.87
          }
        ],
        "insurancesTotal": 0.87,
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
        "total": 675.76,
        "installmentType": "M",
        "typeOfGrace": "",
        "roundOff": 0.0,
        "installmentNumber": 12
      }
    ],
    "insurances": [],
    "fees": []
  },
  "outputDisbursementFees": [],
  "outputInstallmentFees": [
    {
      "feeId": 3701,
      "description": "Comisión Estudio de Proyectos",
      "modifiable": true,
      "distributionForm": "C",
      "amount": 500.0,
      "percentage": 0.0,
      "tax": 0.0,
      "total": 500.0,
      "minimumAmount": 0.0,
      "maximumAmount": 0.0
    }
  ],
  "outputInsurances": [
    {
      "insuranceId": 1,
      "description": "SEGURO 1",
      "insuranceTypeId": 1,
      "insuranceTypeDescription": "",
      "policyStartDate": "",
      "policyEndDate": "",
      "policyNumber": "",
      "allowsModification": true,
      "chargeTypeId": "S",
      "hasExtraPremium": false,
      "amount": 0.0,
      "percentage": 0.5,
      "extraPremium": 0.0,
      "commercialValue": 0.0
    }
  ],
  "installmentValue": 675.0,
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:04:55",
    "Numero": 13547109,
    "Servicio": "PublicLoans.groupLoanIndividualResimulation",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOFeeIn

### SdtsBTLOFeeIn

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeIn son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
modificationType | Byte $<(Length: 1)>$ | Tipo de modificación.
modified | Boolean | Modificado.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
:::

::: details SdtsBTLOFeeIn

### SdtsBTLOFeeIn

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeIn son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
modificationType | Byte $<(Length: 1)>$ | Tipo de modificación.
modified | Boolean | Modificado.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
:::

::: details SdtsBTLOInsuranceIn

### SdtsBTLOInsuranceIn

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceIn son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto agregado.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje modificado.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

::: details SdtsBTLOGLoanSimulation

### SdtsBTLOGLoanSimulation

::: center
Los campos del tipo de dato estructurado SdtsBTLOGLoanSimulation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
fees | [SdtsBTLODisbursementFee](#sdtsbtlodisbursementfee) | Comisiones.
installments | [SdtsBTLOInstallmentDetail](#sdtsbtloinstallmentdetail) | Cuotas.
insurances | [SdtsBTLODisbursementInsurance](#sdtsbtlodisbursementinsurance) | Seguros.
kindId | Int $<(Length: 6)>$ | Identificador del tipo.
productId | Long $<(Length: 18)>$ | Identificador del producto.
totalOfCapital | Double $<(Length: 18.2)>$ | Total de capital.
:::

::: details SdtsBTLODisbursementFee

### SdtsBTLODisbursementFee

::: center
Los campos del tipo de dato estructurado SdtsBTLODisbursementFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
calculationBase | String $<(Length: 1)>$ | Base de cálculo.
editable | Boolean | ¿Editable?.
feeId | Int | Identificador de comisión.
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
typeOfGrace | String $<(Length: 1)>$ | Tipo de gracia.
:::

::: details SdtsBTLOFeeDetail

### SdtsBTLOFeeDetail

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
feeName | String $<(Length: 30)>$ | Descripción.
taxes | Double $<(Length: 18.2)>$ | Impuestos.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details SdtsBTLOInsuranceDetail

### SdtsBTLOInsuranceDetail

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Prima.
description | String $<(Length: 40)>$ | Descripción.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
:::

::: details SdtsBTLODisbursementInsurance

### SdtsBTLODisbursementInsurance

::: center
Los campos del tipo de dato estructurado SdtsBTLODisbursementInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double | Prima.
description | String | Descripción.
insuranceId | Int | Identificador de seguro.
:::

::: details SdtsBTLOFeeOut

### SdtsBTLOFeeOut

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto.
description | String $<(Length: 30)>$ | Descripción.
distributionForm | String $<(Length: 1)>$ | Forma de distribución.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
maximumAmount | Double $<(Length: 18.2)>$ | Monto máximo.
minimumAmount | Double $<(Length: 18.2)>$ | Monto mínimo.
modifiable | Boolean | Modificable.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
tax | Double $<(Length: 18.2)>$ | Impuesto.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details SdtsBTLOFeeOut

### SdtsBTLOFeeOut

::: center
Los campos del tipo de dato estructurado SdtsBTLOFeeOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto.
description | String $<(Length: 30)>$ | Descripción.
distributionForm | String $<(Length: 1)>$ | Forma de distribución.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
maximumAmount | Double $<(Length: 18.2)>$ | Monto máximo.
minimumAmount | Double $<(Length: 18.2)>$ | Monto mínimo.
modifiable | Boolean | Modificable.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
tax | Double $<(Length: 18.2)>$ | Impuesto.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details SdtsBTLOInsuranceOut

### SdtsBTLOInsuranceOut

::: center
Los campos del tipo de dato estructurado SdtsBTLOInsuranceOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
allowsModification | Boolean | Permite modificación.
amount | Double $<(Length: 18.2)>$ | Monto agregado.
chargeTypeId | String $<(Length: 1)>$ | Identificador del tipo de cargo.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
description | String $<(Length: 30)>$ | Descripción.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
hasExtraPremium | Boolean | Tiene prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
insuranceTypeId | Int $<(Length: 5)>$ | Identificador del tipo de seguro.
insuranceTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje modificado.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::
<!-- CIERRA SDT -->
