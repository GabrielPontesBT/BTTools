---
title: Cancellation Total Concepts
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los totales de conceptos de cancelación.

**Nombre publicación:** PublicLoans.cancellationTotalConcepts

**Programa:** PublicAPI.BTLOPA0017

**Alcance:** Global

**Endpoint:** /public/Loans/v1/cancellationTotalConcepts
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
calculationDate | Date | Fecha de cálculo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
refinancingGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la refinanciación.
totalConcepts | [totalConcepts](#totalconcepts) | Totales de conceptos financieros.

@tab Errores

Código | Descripción
:--------- | :---------
120050002 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/cancellationTotalConcepts?counterpartyGUID=3a7f2d91-bc14-4e58-9f3a-d2c18b450e77&loanGUID=b84e1c60-73d2-4a91-8f5e-cf920a371d24&calculationDate=2026-06-19' \
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
  "refinancingGUID": "e7a3d240-91bc-4f82-b3e5-2a7c640d18f9",
  "totalConcepts": {
    "debt": 48750,
    "kindValue": 0,
    "otherConcepts": 320.5,
    "roundOff": 0.12,
    "totalOfArrearFees": 180,
    "totalOfArrearTax": 32.4,
    "totalOfCancellationFee": 250,
    "totalOfCancellationFeeTaxes": 45,
    "totalOfCapital": 45000,
    "totalOfCapitalConcessional": 0,
    "totalOfCapitalTaxes": 0,
    "totalOfCompensatoryInterest": 1250.75,
    "totalOfCompensatoryInterestTaxes": 225.14,
    "totalOfConcessional": 0,
    "totalOfDeferredInterest": 0,
    "totalOfDeferredInterestTaxes": 0,
    "totalOfDistributedInsurances": 420,
    "totalOfDistributedInterest": 875.3,
    "totalOfDistributedInterestTaxes": 157.55,
    "totalOfInsurances": 420,
    "totalOfInterest": 3750,
    "totalOfInterestArrear": 215.6,
    "totalOfInterestTaxes": 675,
    "totalOfPunitiveInterest": 0,
    "totalOfPunitiveInterestTaxes": 0,
    "totalOfQuotaFees": 300,
    "totalOfQuotaFeesTaxes": 54,
    "totalOfTaxes": 1189.09,
    "totalOfUnpaidRoundOff": 0.12
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details totalConcepts

### totalConcepts

::: center
Los campos del tipo de dato estructurado totalConcepts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
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