---
title: Get Renewal Amount
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el monto de renovación.

**Nombre publicación:** PublicLoans.getRenewalAmount

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0015

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
calculationDate | Date | Fecha de cálculo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
consolidationGUID | String $<(Length: 36)>$ | GUID de la consolidación.
cancellationAmount | Double $<(Length: 18.2)>$ | Monto de cancelación.

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
  "consolidationGUID": "c2f91a84-5e3d-4b70-a8f1-d93e720c64b5",
  "cancellationAmount": 48750.00,
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-19",
    "Hora": "10:52:37",
    "Numero": "10048329",
    "Servicio": "PublicLoans.getRenewalAmount",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->