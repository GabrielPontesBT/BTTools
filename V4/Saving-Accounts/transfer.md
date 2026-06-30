---
title: Transfer
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para realizar una transferencia entre cuentas.

**Nombre publicación:** PublicSavingAccounts.transfer

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA00010

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
transferData | [SdtsBTSAWTransferData](#sdtsbtsawtransferdata) | Datos de la transferencia.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
90132 | No existe un asiento relacionado a los datos ingresados.
104017 | Estado de la operación no permite operar.
104018 | Estado de la operación no permite créditos.
104019 | Estado de la operación no permite débitos.
40010004 | La persona no existe.
40020006 | Contraparte no existe.
14001010001 | Debe ingresar el GUID de la cuenta de ahorro.
14001010002 | Debe ingresar el GUID de la contraparte.
14001010005 | La cuenta de ahorro ingresada no pertenece a la contraparte.
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
    "Device": "MC",
    "Requerimiento": "1",
    "Token": "6232CBF14B2FB5FA8F8EFA72"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "transferData": {
    "reference": "PAGO ",
    "savingAccountGUIDPayment": "dba24b7e-c0c9-4005-b5dc-817f101d1c71",
    "currency": 0,
    "savingAccountGUIDOrigin": "a5b85da2-a28f-4701-875a-affb7ca17ea9",
    "amount": 1000
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
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "MC",
    "Requerimiento": "1",
    "Token": "6232CBF14B2FB5FA8F8EFA72"
  },
  "movementGUID": "a480efd4-d72b-4305-be14-ad81a7bd5266",
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-20",
    "Hora": "20:37:36",
    "Numero": "13496433",
    "Servicio": "PublicSavingAccounts.transfer",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTSAWTransferData

### SdtsBTSAWTransferData

::: center
Los campos del tipo de dato estructurado SdtsBTSAWTransferData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18)>$ | Importe.
currency | Short $<(Length: 4)>$ | Identificador de moneda.
reference | String $<(Length: 40)>$ | Referencia.
savingAccountGUIDOrigin | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de origen.
savingAccountGUIDPayment | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro de destino.
:::
<!-- CIERRA SDT -->
