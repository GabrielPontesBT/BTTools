---
title: Resimulate Member
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para resimular un préstamo individual dentro de un grupo.

**Nombre publicación:** PublicGroupLoans.resimulateMember

**Programa:** PublicAPI.BTLOPA0042

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/resimulateMember
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital | Double $<(Length: 18.2)>$ | Capital.
rate | Double $<(Length: 11.6)>$ | Tasa.
keepFeesAndInsurances | Boolean | Indica si se mantienen seguros y comisiones.
inputDisbursementFees | [inputDisbursementFee](#inputdisbursementfee) | Comisiones en desembolso.
inputInstallmentFees | [inputInstallmentFee](#inputinstallmentfee) | Comisiones por cuota.
inputInsurances | [inputInsurance](#inputinsurance) | Seguros a ingresar.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
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
loan | [loan](#loan) | Detalle de cuotas.
outputDisbursementFees | [outputDisbursementFee](#outputdisbursementfee) | Comisiones en desembolso.
outputInstallmentFees | [outputInstallmentFee](#outputinstallmentfee) | Comisiones por cuota.
outputInsurances | [outputInsurance](#outputinsurance) | Seguros.
installmentValue | Double $<(Length: 18.2)>$ | Valor de la cuota.

@tab Errores

Código | Descripción
:--------- | :---------
120020061 |	No existen datos de simulación.
120060123 |	El capital solicitado por el grupo es menor al mínimo permitido.
120060124 |	El capital solicitado por el grupo es mayor al máximo permitido.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/resimulateMember?simulationGUID=6bad8760-206d-4eed-ad31-845081289d22' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "capital": 2000,
  "rate": 15,
  "keepFeesAndInsurances": true,
  "inputDisbursementFees": {
    "inputDisbursementFee": [
      {
        "amount": "",
        "feeId": "",
        "modificationType": "",
        "modified": "",
        "percentage": ""
      }
    ]
  },
  "inputInstallmentFees": {
    "inputInstallmentFee": [
      {
        "amount": "",
        "feeId": "",
        "modificationType": "",
        "modified": "",
        "percentage": ""
      }
    ]
  },
  "inputInsurances": {
    "inputInsurance": [
      {
        "amount": "",
        "commercialValue": "",
        "extraPremium": "",
        "insuranceId": "",
        "percentage": "",
        "policyEndDate": "",
        "policyNumber": "",
        "policyStartDate": ""
      }
    ]
  }
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
  "rateTypeId": 1,
  "rate": 15,
  "finantialTotalCostRate": 0,
  "firstPaymentDate": "2027-07-22",
  "totalOfCapital": 2000,
  "disbursementAmount": 2000,
  "expirationDate": "2027-10-07",
  "term": 82,
  "totalOfInterest": 34.83,
  "totalOfFees": 6000,
  "totalOfFeeTaxes": 0,
  "totalOfTaxes": 0,
  "totalOfInsurances": 65.93,
  "loan": {
    "currencyId": 0,
    "fees": {
      "fee": []
    },
    "installments": {
      "installmentDetail": [
        {
          "capital": 159.56,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-07-15",
          "installmentNumber": 1,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 10,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 10,
          "interest": 5.44,
          "paymentDate": "2027-07-22",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 160.79,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-07-22",
          "installmentNumber": 2,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 9.2,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 9.2,
          "interest": 5.01,
          "paymentDate": "2027-07-29",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 162.68,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-07-29",
          "installmentNumber": 3,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 8.4,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 8.4,
          "interest": 3.92,
          "paymentDate": "2027-08-05",
          "roundOff": 0,
          "taxes": 0,
          "term": 6,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 163.29,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-08-05",
          "installmentNumber": 4,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 7.58,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 7.58,
          "interest": 4.13,
          "paymentDate": "2027-08-12",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 164.55,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-08-12",
          "installmentNumber": 5,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 6.77,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 6.77,
          "interest": 3.68,
          "paymentDate": "2027-08-19",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 165.81,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-08-19",
          "installmentNumber": 6,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 5.95,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 5.95,
          "interest": 3.24,
          "paymentDate": "2027-08-26",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 167.49,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-08-26",
          "installmentNumber": 7,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 5.12,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 5.12,
          "interest": 2.39,
          "paymentDate": "2027-09-02",
          "roundOff": 0,
          "taxes": 0,
          "term": 6,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 168.39,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-09-02",
          "installmentNumber": 8,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 4.28,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 4.28,
          "interest": 2.33,
          "paymentDate": "2027-09-09",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 169.69,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-09-09",
          "installmentNumber": 9,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 3.44,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 3.44,
          "interest": 1.87,
          "paymentDate": "2027-09-16",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 171,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-09-16",
          "installmentNumber": 10,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 2.59,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 2.59,
          "interest": 1.41,
          "paymentDate": "2027-09-23",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 172.33,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-09-23",
          "installmentNumber": 11,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 1.73,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 1.73,
          "interest": 0.94,
          "paymentDate": "2027-09-30",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675,
          "typeOfGrace": ""
        },
        {
          "capital": 174.42,
          "deferredInterest": 0,
          "fees": {
            "fee": [
              {
                "amount": 500,
                "feeId": 3701,
                "feeName": "Comisión Estudio de Proyectos",
                "taxes": 0,
                "total": 500
              }
            ]
          },
          "feesTotal": 500,
          "initialDate": "2027-09-30",
          "installmentNumber": 12,
          "installmentType": "M",
          "insurances": {
            "insurance": [
              {
                "amount": 0.87,
                "description": "SEGURO 1",
                "insuranceId": 1
              }
            ]
          },
          "insurancesTotal": 0.87,
          "interest": 0.47,
          "paymentDate": "2027-10-07",
          "roundOff": 0,
          "taxes": 0,
          "term": 7,
          "total": 675.76,
          "typeOfGrace": ""
        }
      ]
    },
    "insurances": {
      "insurance": []
    },
    "kindId": 0,
    "productId": 9800104001,
    "totalOfCapital": 2000
  },
  "outputDisbursementFees": {
    "outputDisbursementFee": []
  },
  "outputInstallmentFees": {
    "outputInstallmentFee": [
      {
        "amount": 500,
        "description": "Comisión Estudio de Proyectos",
        "distributionForm": "C",
        "feeId": 3701,
        "maximumAmount": 0,
        "minimumAmount": 0,
        "modifiable": true,
        "percentage": 0,
        "tax": 0,
        "total": 500
      }
    ]
  },
  "outputInsurances": {
    "outputInsurance": [
      {
        "allowsModification": true,
        "amount": 0,
        "chargeTypeId": "S",
        "commercialValue": 0,
        "description": "SEGURO 1",
        "extraPremium": 0,
        "hasExtraPremium": false,
        "insuranceId": 1,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "",
        "percentage": 0.5,
        "policyEndDate": "",
        "policyNumber": "",
        "policyStartDate": ""
      }
    ]
  },
  "installmentValue": 675
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details inputDisbursementFee

### inputDisbursementFee

::: center
Los campos del tipo de dato estructurado inputDisbursementFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
modificationType | Byte $<(Length: 1)>$ | Tipo de modificación.
modified | Boolean | Modificado.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
:::

::: details inputInstallmentFee

### inputInstallmentFee

::: center
Los campos del tipo de dato estructurado inputInstallmentFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
modificationType | Byte $<(Length: 1)>$ | Tipo de modificación.
modified | Boolean | Modificado.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
:::

::: details inputInsurance

### inputInsurance

::: center
Los campos del tipo de dato estructurado inputInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

::: details loan

### loan

::: center
Los campos del tipo de dato estructurado loan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
fees | [fee](#fee) | Comisiones.
installments | [installmentDetail](#installmentdetail) | Cuotas.
insurances | [insurance](#insurance) | Seguros.
kindId | Int | Identificador del tipo.
productId | Long | Identificador del producto.
totalOfCapital | Double | Total de capital.
:::

::: details fee

### fee

::: center
Los campos del tipo de dato estructurado fee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
calculationBase | String $<(Length: 1)>$ | Base de cálculo.
editable | Boolean | ¿Editable?.
feeId | Int | Identificador de comisión.
:::

::: details installmentDetail

### installmentDetail

::: center
Los campos del tipo de dato estructurado installmentDetail son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital | Double | Capital.
deferredInterest | Double | Intereses diferidos.
fees | [fee](#fee) | Comisiones.
feesTotal | Double | Total de comisiones.
initialDate | Date | Fecha inicial.
installmentNumber | Short | Número de cuota.
installmentType | String | Tipo de cuota.
insurances | [insurance](#insurance) | Seguros.
insurancesTotal | Double | Total de seguros.
interest | Double | Interés.
paymentDate | Date | Fecha de fin.
roundOff | Double | Redondeo.
taxes | Double | Impuestos.
term | Int | Plazo.
total | Double | Total.
typeOfGrace | String $<(Length: 1)>$ | Tipo de gracia.
:::

::: details fee

### fee

::: center
Los campos del tipo de dato estructurado fee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
feeName | String $<(Length: 30)>$ | Descripción.
taxes | Double $<(Length: 18.2)>$ | Impuestos.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details insurance

### insurance

::: center
Los campos del tipo de dato estructurado insurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
description | String $<(Length: 40)>$ | Descripción del seguro.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
:::

::: details insurance

### insurance

::: center
Los campos del tipo de dato estructurado insurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double | Monto del seguro de desembolso.
description | String | Descripción del seguro de desembolso.
insuranceId | Int | Identificador de seguro.
:::

::: details outputDisbursementFee

### outputDisbursementFee

::: center
Los campos del tipo de dato estructurado outputDisbursementFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
description | String $<(Length: 30)>$ | Descripción de la comisión.
distributionForm | String $<(Length: 1)>$ | Forma de distribución.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
maximumAmount | Double $<(Length: 18.2)>$ | Monto máximo.
minimumAmount | Double $<(Length: 18.2)>$ | Monto mínimo.
modifiable | Boolean | Modificable.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
tax | Double $<(Length: 18.2)>$ | Impuesto.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details outputInstallmentFee

### outputInstallmentFee

::: center
Los campos del tipo de dato estructurado outputInstallmentFee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto de la comisión.
description | String $<(Length: 30)>$ | Descripción de la comisión.
distributionForm | String $<(Length: 1)>$ | Forma de distribución.
feeId | Int $<(Length: 5)>$ | Identificador de comisión.
maximumAmount | Double $<(Length: 18.2)>$ | Monto máximo.
minimumAmount | Double $<(Length: 18.2)>$ | Monto mínimo.
modifiable | Boolean | Modificable.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
tax | Double $<(Length: 18.2)>$ | Impuesto.
total | Double $<(Length: 18.2)>$ | Total.
:::

::: details outputInsurance

### outputInsurance

::: center
Los campos del tipo de dato estructurado outputInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
allowsModification | Boolean | Permite modificación.
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
chargeTypeId | String $<(Length: 1)>$ | Identificador del tipo de cargo.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
description | String $<(Length: 30)>$ | Descripción del seguro.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
hasExtraPremium | Boolean | Tiene prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
insuranceTypeId | Int $<(Length: 5)>$ | Identificador del tipo de seguro.
insuranceTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::
<!-- CIERRA SDT -->
