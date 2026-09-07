---
title: Waive
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para condonar conceptos de un préstamo.

**Nombre publicación:** PublicLoans.waive

**Programa:** PublicAPI.BTLOPA0055

**Alcance:** Global

**Endpoint:** /public/Loans/v1/waive
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
date | Date | Fecha.
waivedConcepts | [waivedConcepts](#waivedconcepts) | Conceptos a condonar.
paymentOptions | [paymentOption](#paymentoption) | Formas de cobro.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
120050001 | Debe ingresar el GUID de préstamo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Loans/v1/waive?loanGUID=bfcf4446-d73a-4edd-a94b-ed3d152be591' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "date": "2026-01-01",
  "waivedConcepts": {
    "arrearInterest": "",
    "capital": "1500",
    "fees": "",
    "insurances": "",
    "interest": "",
    "others": ""
  },
  "paymentOptions": {
    "paymentOption": [
      {
        "amount": "4206.91",
        "branchId": "0",
        "counterpartyGUID": "",
        "currencyId": "0",
        "paymentId": "15",
        "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15"
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
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details waivedConcepts

### waivedConcepts

::: center
Los campos del tipo de dato estructurado waivedConcepts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
arrearInterest | Double $<(Length: 18.2)>$ | Interés de mora.
capital | Double $<(Length: 18.2)>$ | Capital.
fee1 | Double $<(Length: 18.5)>$ | Gasto 1.
fees | Double $<(Length: 18.2)>$ | Comisiones.
insurance1 | Double $<(Length: 18.5)>$ | Seguro 1.
insurances | Double $<(Length: 18.2)>$ | Seguros.
interest | Double $<(Length: 18.2)>$ | Interés.
interestArrearPayment | Double $<(Length: 18.5)>$ | Pago de interés de mora.
others | Double $<(Length: 18.2)>$ | Otros.
:::
<!-- CIERRA SDT -->
