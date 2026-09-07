---
title: Member Simulation
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la simulación de un integrante de un grupo.

**Nombre publicación:** PublicGroupLoans.memberSimulation

**Programa:** PublicAPI.BTLOPA0041

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/memberSimulation
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
currencyDescription | String $<(Length: 30)>$ | Descripción de moneda.
currencySign | String $<(Length: 4)>$ | Símbolo de moneda.
general | [general](#general) | Información general de la simulación.
installmentDetails | [installmentDetail](#installmentdetail) | Listado de detalles de cuotas.
disbursementFees | [disbursementFee](#disbursementfee) | Listado de comisiones en desembolso.
installmentFees | [installmentFee](#installmentfee) | Listado de comisiones por cuota.
insurancesAssociated | [insurance](#insurance) | Listado de seguros.

@tab Errores

Código | Descripción
:--------- | :---------
120050012 | Debe ingresar el GUID de la simulación.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/memberSimulation?simulationGUID=6bad8760-206d-4eed-ad31-845081289d22' \
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
  "currencyId": 0,
  "currencyDescription": "Pesos Uruguayos",
  "currencySign": "$",
  "general": {
    "amortizationTypeId": 3,
    "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
    "amount": 15000.6,
    "capital": 15000,
    "expirationDate": "2027-10-07",
    "firstPaymentDate": "2027-07-22",
    "productDescription": "GRUPALES",
    "quotaNumber": 12,
    "quotaPeriodicity": 7,
    "quotaValue": 1813,
    "rate": 15,
    "rateTypeId": 1,
    "rateTypeDescription": "Efectiva Anual",
    "term": 82,
    "total": 21755.4,
    "totalFinancialCost": 0,
    "totalOfTerm": 82,
    "valueDate": "2027-07-15"
  },
  "installmentDetails": {
    "installmentDetail": [
      {
        "capital": 1197.18,
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
              "amount": 75,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 75,
        "interest": 40.82,
        "paymentDate": "2027-07-22",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1206.43,
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
              "amount": 69.01,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 69.01,
        "interest": 37.56,
        "paymentDate": "2027-07-29",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1220.64,
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
              "amount": 62.98,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 62.98,
        "interest": 29.38,
        "paymentDate": "2027-08-05",
        "roundOff": 0,
        "taxes": 0,
        "term": 6,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1225.16,
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
              "amount": 56.88,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 56.88,
        "interest": 30.96,
        "paymentDate": "2027-08-12",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1234.63,
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
              "amount": 50.75,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 50.75,
        "interest": 27.62,
        "paymentDate": "2027-08-19",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1244.16,
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
              "amount": 44.58,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 44.58,
        "interest": 24.26,
        "paymentDate": "2027-08-26",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1256.75,
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
              "amount": 38.36,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 38.36,
        "interest": 17.89,
        "paymentDate": "2027-09-02",
        "roundOff": 0,
        "taxes": 0,
        "term": 6,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1263.46,
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
              "amount": 32.08,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 32.08,
        "interest": 17.46,
        "paymentDate": "2027-09-09",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1273.22,
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
              "amount": 25.76,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 25.76,
        "interest": 14.02,
        "paymentDate": "2027-09-16",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1283.06,
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
              "amount": 19.39,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 19.39,
        "interest": 10.55,
        "paymentDate": "2027-09-23",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1292.96,
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
              "amount": 12.98,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 12.98,
        "interest": 7.06,
        "paymentDate": "2027-09-30",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1813,
        "typeOfGrace": ""
      },
      {
        "capital": 1302.35,
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
              "amount": 6.51,
              "description": "SEGURO 1",
              "insuranceId": 1
            }
          ]
        },
        "insurancesTotal": 6.51,
        "interest": 3.54,
        "paymentDate": "2027-10-07",
        "roundOff": 0,
        "taxes": 0,
        "term": 7,
        "total": 1812.4,
        "typeOfGrace": ""
      }
    ]
  },
  "disbursementFees": {
    "disbursementFee": []
  },
  "installmentFees": {
    "installmentFee": [
      {
        "installmentFee": ""
      }
    ]
  },
  "insurancesAssociated": {
    "insurance": [
      {
        "additionalAmount": 0,
        "chargeTypeId": "S",
        "commercialValue": 0,
        "description": "SEGURO 1",
        "extraPrime": 0,
        "insuranceId": 1,
        "insuranceTypeDescription": "VIDA",
        "managesExtraPremium": false,
        "percentage": 0.5,
        "policy": "",
        "policyEndDate": "",
        "policyStartDate": ""
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details general

### general

::: center
Los campos del tipo de dato estructurado general son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amortizationTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de amortización.
amortizationTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de amortización.
amount | Double $<(Length: 18.5)>$ | Monto del préstamo.
capital | Double $<(Length: 18.5)>$ | Capital.
expirationDate | Date | Fecha de vencimiento.
firstPaymentDate | Date | Fecha del primer pago.
productDescription | String $<(Length: 30)>$ | Descripción del producto.
quotaNumber | Int $<(Length: 5)>$ | Número de cuota.
quotaPeriodicity | Int $<(Length: 5)>$ | Periodicidad de cuotas.
quotaValue | Double $<(Length: 18.5)>$ | Valor de cuota.
rate | Double $<(Length: 11.6)>$ | Tasa.
rateTypeId | Byte $<(Length: 1)>$ | Identificador del tipo de tasa.
rateTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de tasa.
term | Int $<(Length: 5)>$ | Plazo.
total | Double $<(Length: 18.2)>$ | Total.
totalFinancialCost | Double $<(Length: 11.6)>$ | Costo financiero total.
totalOfTerm | Int $<(Length: 5)>$ | Total del plazo.
valueDate | Date | Fecha valor.
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
additionalAmount | Double $<(Length: 18.2)>$ | Monto agregado.
chargeTypeId | String $<(Length: 1)>$ | Identificador del tipo de cobro.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
description | String $<(Length: 30)>$ | Descripción del seguro.
extraPrime | Double $<(Length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
insuranceTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de seguro.
managesExtraPremium | Boolean | Gestiona prima adicional.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policy | String $<(Length: 20)>$ | Número de póliza.
policyEndDate | Date | Fecha de fin de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::
<!-- CIERRA SDT -->
