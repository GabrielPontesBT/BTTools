---
title: Pay Installment
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para pagar una cuota de un préstamo.

**Nombre publicación:** PublicLoans.payInstallment

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0014

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double | Monto del pago.
reference | String | Referencia.
date | Date | Fecha.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
120050001 | Debe ingresar el GUID de préstamo.
120050002 | Debe ingresar el GUID de contraparte.
120050004 | Debe ingresar importe.
120050006 | El préstamo ingresado no pertenece al cliente.
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
  "loanGUID": "a10f0422-09ce-4015-a95b-cb4a8a98b6d8",
  "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
  "import": 15000,
  "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15",
  "reference": "",
  "date": ""
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
  "movementGUID": "fafb2ce5-9853-4831-b855-2e927320269f",
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:00:47",
    "Numero": 13547056,
    "Servicio": "PublicLoans.payInstallment",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
