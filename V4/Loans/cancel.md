---
title: Cancel
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para cancelar un préstamo.

**Nombre publicación:** PublicLoans.cancel

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0016

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
  "loanGUID": "441b5348-c5d7-4a4c-903e-311ae720a130",
  "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
  "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15",
  "reference": "Cancelación de préstamo",
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
  "movementGUID": "f5173f26-0642-4c61-8164-6e257f1956a9",
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "17:39:52",
    "Numero": 13546654,
    "Servicio": "PublicLoans.cancel",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
