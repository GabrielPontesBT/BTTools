---
title: Cancel
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para cancelar un préstamo.

**Nombre publicación:** PublicSavingAccounts.cancel

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0004

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
paymentOrChargeAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de cobro o desembolso.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
cancellationOriginId | Short $<(Length: 4)>$ | Identificador del origen de cancelación.
cancellationReasonId | Byte $<(Length: 2)>$ | Identificador del motivo de cancelación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
90132 | No existe un asiento relacionado a los datos ingresados
90139 | Debe ingresar una contraparte
90142 | No existe registro de saldo
90143 | Opción de pago/cobro inválida
90151 | El importe de las formas de pago/cobro no coinciden con el total
90152 | El importe de las formas de desembolso recibidas no puede ser 0
90153 | El módulo y tipo de operación recibidos no coinciden con los del subproducto asociado
90160 | El importe de las formas de cobro recibidas no puede ser 0
90161 | La fecha de contabilización del asiento a anular es mayor a la fecha de apertura
90162 | El ID de la forma de pago/cobro no puede ser 0
170011 | No existe el registro
170054 | Debe ingresar el GUID
40020006 | Contraparte no existe
40020012 | El número de contraparte no existe
50050003 | No se encuentra la empresa
140010020 | La operación tiene tarjetas de débito asociadas
140010021 | La operación tiene bloqueos
140010022 | La operación está asociada a instrucción/es de depósito a plazo fijo
140010023 | La operación está asociada a instrucción/es de préstamo/s
140010025 | Deben ingresarse la/s forma/s de cobro y/o pago
140010026 | No se pudo resolver módulo/transacción a ejecutar
140010027 | Debe ingresar el origen de cierre
140010028 | Debe ingresar la razón de cierre
140010029 | El producto a liquidar no puede definirse como forma de pago/cobro
140010030 | No puede definirse una forma de pago/cobro que no pertenezca a la contraparte
140010031 | La moneda de la operación a liquidar y la moneda de las formas de pago/cobro deben ser la misma
140010032 | No se pudo resolver número de relación
14001010001 | Debe ingresar el GUID de la cuenta de ahorro.
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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "savingAccountGUID": "92b2ce1f-34e7-4606-bdd4-e62bde656979",
  "cancellationOriginId": 1,
  "cancellationReasonId": 1,
  "paymentOrChargeAccountGUID": "d4c55780-98c1-43ab-bc6d-ccaab69807c3"
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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "movementGUID": "9f8c499f-c014-480b-84b2-0fddda6b0054",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:54:15",
    "Numero": 13466304,
    "Servicio": "PublicSavingAccounts.cancel",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
