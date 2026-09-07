---
title: Refinance Amount
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener el monto de refinanciación.

**Nombre publicación:** PublicLoans.refinanceAmount

**Programa:** PublicAPI.BTLOPA0018

**Alcance:** Global

**Endpoint:** /public/Loans/v1/refinanceAmount
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
refinancingGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la refinanciación.
waivedConcepts | [waivedConcepts](#waivedconcepts) | Conceptos a condonar.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
newCapital | Double $<(Length: 18.2)>$ | Nuevo monto de capital.

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
  '{{baseUrl}}/public/Loans/v1/refinanceAmount?counterpartyGUID=3a7f2d91-bc14-4e58-9f3a-d2c18b450e77&refinancingGUID=e7a3d240-91bc-4f82-b3e5-2a7c640d18f9&waivedConcepts={"arrearInterest":215.6,"capital":0,"fee1":0,"fees":0,"insurance1":0,"insurances":0,"interest":0,"interestArrearPayment":215.6,"others":0}' \
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
  "newCapital": 47250.75
}
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
