---
title: Get Cancellation Total Concepts
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los totales de conceptos de cancelación.

**Nombre publicación:** PublicLoans.getcancellationTotalConcepts

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0017

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) de préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
calculationDate | Date | Fecha de cálculo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
refinancingGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la refinanciación.
totalConcepts | [SdtsBTLOTotalConcepts](#sdtsbtlototalconcepts) | Totales de conceptos financieros.

@tab Errores

Código | Descripción 
:--------- | :----------- 
120050002 | Debe ingresar el GUID de contraparte.
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
    "Token": "23B342928917607ECECF65BD"
  },
  "counterpartyGUID": "3a7f2d91-bc14-4e58-9f3a-d2c18b450e77",
  "loanGUID": "b84e1c60-73d2-4a91-8f5e-cf920a371d24",
  "calculationDate": "2026-06-19"
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
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "23B342928917607ECECF65BD"
  },
  "refinancingGUID": "e7a3d240-91bc-4f82-b3e5-2a7c640d18f9",
  "totalConcepts": {
    "debt": 48750.00,
    "kindValue": 0.00,
    "otherConcepts": 320.50,
    "roundOff": 0.12,
    "totalOfArrearFees": 180.00,
    "totalOfArrearTax": 32.40,
    "totalOfCancellationFee": 250.00,
    "totalOfCancellationFeeTaxes": 45.00,
    "totalOfCapital": 45000.00,
    "totalOfCapitalConcessional": 0.00,
    "totalOfCapitalTaxes": 0.00,
    "totalOfCompensatoryInterest": 1250.75,
    "totalOfCompensatoryInterestTaxes": 225.14,
    "totalOfConcessional": 0.00,
    "totalOfDeferredInterest": 0.00,
    "totalOfDeferredInterestTaxes": 0.00,
    "totalOfDistributedInsurances": 420.00,
    "totalOfDistributedInterest": 875.30,
    "totalOfDistributedInterestTaxes": 157.55,
    "totalOfInsurances": 420.00,
    "totalOfInterest": 3750.00,
    "totalOfInterestArrear": 215.60,
    "totalOfInterestTaxes": 675.00,
    "totalOfPunitiveInterest": 0.00,
    "totalOfPunitiveInterestTaxes": 0.00,
    "totalOfQuotaFees": 300.00,
    "totalOfQuotaFeesTaxes": 54.00,
    "totalOfTaxes": 1189.09,
    "totalOfUnpaidRoundOff": 0.12
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-19",
    "Hora": "10:35:22",
    "Numero": "10048291",
    "Servicio": "PublicLoans.getcancellationTotalConcepts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOTotalConcepts

### SdtsBTLOTotalConcepts

::: center
Los campos del tipo de dato estructurado SdtsBTLOTotalConcepts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
debt | Double $<(Length: 18.2)>$ | Deuda.
kindValue | Double $<(Length: 15.8)>$ | Valor en especie.
otherConcepts | Double $<(Length: 18.2)>$ | Otros conceptos.
roundOff | Double $<(Length: 18.2)>$ | Redondeo.
totalOfArrearFees | Double $<(Length: 18.2)>$ | Total de gastos de mora.
totalOfArrearTax | Double $<(Length: 18.2)>$ | Total de impuesto de mora.
totalOfCancellationFee | Double $<(Length: 18.2)>$ | Total de gasto de cancelación.
totalOfCancellationFeeTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del gasto de cancelación.
totalOfCapital | Double $<(Length: 18.2)>$ | Total de capital.
totalOfCapitalConcessional | Double $<(Length: 18.2)>$ | Total de capital concesional.
totalOfCapitalTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del capital.
totalOfCompensatoryInterest | Double $<(Length: 18.2)>$ | Total de interés compensatorio.
totalOfCompensatoryInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del interés compensatorio.
totalOfConcessional | Double $<(Length: 18.2)>$ | Total concesional.
totalOfDeferredInterest | Double $<(Length: 18.2)>$ | Total de interés diferido.
totalOfDeferredInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del interés diferido.
totalOfDistributedInsurances | Double $<(Length: 18.2)>$ | Total de seguros distribuidos.
totalOfDistributedInterest | Double $<(Length: 18.2)>$ | Total de interés distribuido.
totalOfDistributedInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del interés distribuido.
totalOfInsurances | Double $<(Length: 18.2)>$ | Total de seguros.
totalOfInterest | Double $<(Length: 18.2)>$ | Total de interés.
totalOfInterestArrear | Double $<(Length: 18.2)>$ | Total de interés de mora.
totalOfInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del interés.
totalOfPunitiveInterest | Double $<(Length: 18.2)>$ | Total de interés punitorio.
totalOfPunitiveInterestTaxes | Double $<(Length: 18.2)>$ | Total de impuestos del interés punitorio.
totalOfQuotaFees | Double $<(Length: 18.2)>$ | Total de gastos de cuota.
totalOfQuotaFeesTaxes | Double $<(Length: 18.2)>$ | Total de impuestos de gastos de cuota.
totalOfTaxes | Double $<(Length: 18.2)>$ | Total de impuestos.
totalOfUnpaidRoundOff | Double $<(Length: 18.2)>$ | Total de redondeo impago.
:::
<!-- CIERRA SDT -->