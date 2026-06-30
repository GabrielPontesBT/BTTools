---
title: Create
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contratar un depósito a plazo.

**Nombre publicación:** PublicTermDeposit.create

**Módulo:** TermDeposit

**Programa:** PublicAPI.BTTDPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación del depósito a plazo.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
expirationAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de destino al vencimiento.
recurringPaymentAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de destino del pago periódico.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
expirationInstruction | Short $<(Length: 3)>$ | Identificador de la instrucción al vencimiento.
recurringPaymentInstruction | Short $<(Length: 3)>$ | Identificador de la instrucción de pago periódico.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
termDepositGUID | String $<(Length: 36)>$ | GUID (identificador único global) del depósito a plazo.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
90139 | Debe ingresar una contraparte
90143 | Opción de pago/cobro inválida
90151 | El importe de las formas de pago/cobro no coinciden con el total
90152 | El importe de las formas de desembolso recibidas no puede ser 0
90160 | El importe de las formas de cobro recibidas no puede ser 0
90162 | El ID de la forma de pago/cobro no puede ser 0
170054 | Debe ingresar el GUID
180061 | No existen datos de simulación
980003 | No existe el producto ingresado
980096 | El subproducto se encuentra inhabilitado
980097 | El subproducto no se encuentra vigente
40020006 | Contraparte no existe
40020009 | Debe ingresar número de contraparte
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
120020061 | No existen datos de simulación
120020078 | Debe ingresar instrucciones de débito
180040001 | Debe ingresar el GUID de contraparte.
180040002 | Debe ingresar el GUID de la simulación.
180040003 | Debe ingresar el GUID de la cuenta de débito.
99990010006 | No se pudo resolver el usuario
99990010007 | No se pudo resolver la empresa
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
    "Token": "A8068BDF0E08AC754A7B94F5"
  },
  "simulationGUID": "3f47a1b2-8c5e-4d9a-b6f1-2e8d3c7a4051",
  "counterpartyGUID": "7a2b9c4d-1e6f-4830-a5d2-9b3c8e1f6742",
  "expirationAccountGUID": "1d5e8f2a-3b7c-4960-8e1d-5a2f9b4c7d83",
  "recurringPaymentAccountGUID": "",
  "expirationInstruction": 1,
  "recurringPaymentInstruction": 
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
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "A8068BDF0E08AC754A7B94F5"
  },
  "termDepositGUID": "2e8b5c1a-7d3f-4a92-b6e4-1c9d7f5a8b36",
  "movementGUID": "6f1d4b8e-2a5c-4739-9b3e-4d7c1f8a5b92",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-15",
    "Hora": "14:07:38",
    "Numero": 13472661,
    "Servicio": "PublicTermDeposit.create",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}'
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
