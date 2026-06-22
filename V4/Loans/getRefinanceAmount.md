---
title: Get Refinance Amount
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el monto de refinanciación.

**Nombre publicación:** PublicLoans.getRefinanceAmount

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0018

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
refinancingGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la refinanciación.
waivedConcepts | [SdtsBTLOWaivedConcepts](#sdtsbtlowaivedconcepts) | Conceptos a condonar.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
newCapital | Double $<(Length: 18.2)>$ | Nuevo monto de capital.

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
  "refinancingGUID": "e7a3d240-91bc-4f82-b3e5-2a7c640d18f9",
  "waivedConcepts": {
    "arrearInterest": 215.60,
    "capital": 0.00,
    "fee1": 0.00,
    "fees": 0.00,
    "insurance1": 0.00,
    "insurances": 0.00,
    "interest": 0.00,
    "interestArrearPayment": 215.60,
    "others": 0.00
  }
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
  "newCapital": 47250.75,
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-19",
    "Hora": "10:41:05",
    "Numero": "10048312",
    "Servicio": "PublicLoans.getRefinanceAmount",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWaivedConcepts

### SdtsBTLOWaivedConcepts

::: center
Los campos del tipo de dato estructurado SdtsBTLOWaivedConcepts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
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
