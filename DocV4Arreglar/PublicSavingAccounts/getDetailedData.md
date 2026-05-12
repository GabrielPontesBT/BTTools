---
title: Obtener Detailed Datos [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información detallada de una cuenta de ahorro.

**Nombre publicación:** PublicSavingAccounts.getDetailedData

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountData | [SdtsBTSAWSavingAccountData](#sdtsbtsawsavingaccountdata) | Información detallada de la cuenta de ahorro.

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

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
    "Token": "B2C4370CAA727E6B96067AB0"
  },
  "savingAccountGUID": "44a8b232-9376-451e-9553-2cb037254a3e"
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
    "Token": "B2C4370CAA727E6B96067AB0"
  },
  "savingAccountData": {
    "SavingAccountGUID": "44a8b232-9376-451e-9553-2cb037254a3e",
    "AccountStatementPreferences": {
      "RegulatorResumeFrequency": 0,
      "RegulatorResumeFrequencyDescription": "",
      "AccountingResumeFrequency": 0,
      "AccountingResumeFrequencyDescription": "",
      "ShipmentMethod": 1,
      "ShipmentMethodDescription": "Email",
      "AddressShipmentMethodId": 0,
      "AddressShipmentMethodDescription": "",
      "EmailShipmentMethodId": 0,
      "EmailShipmentMethodDescription": "",
      "BranchShipmentMethodId": 0,
      "BranchShipmentMethodDescription": "",
      "AvoidsAccountingResume": false
    },
    "Amount": 0,
    "AvailableAmount": "0.00",
    "BankCode": "36500101000002060473",
    "BoardTypeId": 44,
    "BoardTypeDescription": "Cuenta a mi favor",
    "BranchId": 1,
    "BranchDescription": "Sucursal Beta",
    "CancelationDate": "",
    "CancelationOriginId": 0,
    "CancelationOriginDescription": "",
    "CancelationReasonId": 0,
    "CancelationReasonDescription": "",
    "CancelationUser": "",
    "CancelationUserDescription": "",
    "CircularityFee": false,
    "ClassRateTypeId": 0,
    "ClassRateTypeDescription": "",
    "CounterpartyId": 5090,
    "CounterpartyDescription": "CRAMPET GUTIERREZ PEDRO PABLO",
    "CreationUser": "INSTALADOR",
    "CreationUserDescription": "INSTALADOR",
    "CreationDate": "2026-04-30",
    "GrouperId": 0,
    "GrouperDescription": "",
    "LowAverageFee": false,
    "LowAverageFeeId": 0,
    "LowAverageFeeDescription": "",
    "MovementFee": false,
    "OpeningFee": false,
    "PaymentMethod": 2,
    "PaymentMethodDescription": "Promedio",
    "PaymentPeriod": 0,
    "PaymentPeriodDescription": "",
    "PaysInterest": true,
    "RateType": 1,
    "StatusId": 0,
    "StatusDescription": "Normal",
    "SubStatusId": 0,
    "SubStatusDescription": "",
    "Product": {
      "ProductGUID": "28169aa2-61c3-43ca-9fa9-e12ff30d4b71",
      "ProductDescription": "CUENTA A MI FAVOR",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "CurrencySign": "$",
      "KindId": 0,
      "KindDescription": "Billete"
    },
    "ProductChanges": {
      "SdtsBTSAWProductChange": []
    },
    "StatusChanges": {
      "SdtsBTSAWStatusChange": []
    }
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-11",
    "Hora": "22:48:13",
    "Numero": 13459143,
    "Servicio": "PublicSavingAccounts.getDetailedData",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**
<!-- ABRE SDT -->
::: details SdtsBTSAWSavingAccountData

### SdtsBTSAWSavingAccountData

::: center
Los campos del tipo de dato estructurado SdtsBTSAWSavingAccountData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountStatementPreferences | [SdtsBTSAWAccountStatementPreferences](#sdtsbtsawaccountstatementpreferences) | Preferencias del estado de cuenta.
Amount | Double | Monto.
AvailableAmount | Double $<(length: 18)>$ | Monto disponible.
BankCode | String $<(length: 30)>$ | Código bancario.
BoardTypeId | Int $<(length: 5)>$ | Identificador del tipo de pizarra.
BoardTypeDescription | String $<(length: 20)>$ | Descripción del tipo de mesa.
BranchId | Int $<(length: 5)>$ | Identificador de sucursal.
BranchDescription | String $<(length: 30)>$ | Descripción de sucursal.
CancelationDate | Date $<(length: 8)>$ | Fecha de cancelación.
CancelationOriginId | Byte $<(length: 2)>$ | Identificador del origen de cancelación.
CancelationOriginDescription | String | Descripción del origen de cancelación.
CancelationReasonId | Byte $<(length: 2)>$ | Identificador del motivo de cancelación.
CancelationReasonDescription | String | Descripción del motivo de cancelación.
CancelationUser | String | Usuario de cancelación.
CancelationUserDescription | String | Descripción del usuario de cancelación.
CircularityFee | Boolean $<(length: 1)>$ | Comisión de circularidad.
ClassRateTypeId | Int $<(length: 5)>$ | Identificador del tipo de clase de tasa.
ClassRateTypeDescription | String $<(length: 20)>$ | Descripción del tipo de clase de tasa.
CounterpartyId | Int $<(length: 9)>$ | Identificador de contraparte.
CounterpartyDescription | String $<(length: 70)>$ | Descripción de contraparte.
CreationDate | Date $<(length: 8)>$ | Fecha de creación.
CreationUser | String | Usuario de creación.
CreationUserDescription | String | Descripción del usuario de creación.
GrouperId | Short | Identificador del agrupador.
GrouperDescription | String | Descripción del agrupador.
LowAverageFee | Boolean $<(length: 1)>$ | Comisión de saldo mínimo.
LowAverageFeeId | Int $<(length: 5)>$ | Identificador de comisión de saldo mínimo.
LowAverageFeeDescription | String $<(length: 30)>$ | Descripción de comisión de saldo mínimo.
MovementFee | Boolean $<(length: 1)>$ | Comisión por movimiento.
OpeningFee | Boolean $<(length: 1)>$ | Comisión de apertura.
PaymentMethod | Short | Método de pago.
PaymentMethodDescription | String | Descripción del método de pago.
PaymentPeriod | Long $<(length: 18)>$ | Período de pago.
PaymentPeriodDescription | String | Descripción del período de pago.
PaysInterest | Boolean $<(length: 1)>$ | Paga intereses.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
ProductChanges | [SdtsBTSAWProductChange](#sdtsbtsawproductchange) | Cambios de producto.
RateType | Long | Tipo de tasa.
SavingAccountGUID | String | GUID de cuenta de ahorro.
StatusChanges | [SdtsBTSAWStatusChange](#sdtsbtsawstatuschange) | Cambios de estado.
StatusId | Byte $<(length: 2)>$ | Identificador de estado.
StatusDescription | String | Descripción del estado.
SubStatusId | Int $<(length: 5)>$ | Identificador de subestado.
SubStatusDescription | String | Descripción del subestado.
:::

::: details SdtsBTSAWAccountStatementPreferences

### SdtsBTSAWAccountStatementPreferences

::: center
Los campos del tipo de dato estructurado SdtsBTSAWAccountStatementPreferences son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountingResumeFrequency | Long $<(length: 18)>$ | Frecuencia de resumen contable.
AccountingResumeFrequencyDescription | String | Descripción de la frecuencia de resumen contable.
AddressShipmentMethodId | Byte $<(length: 2)>$ | Identificador del método de envío a dirección.
AddressShipmentMethodDescription | String | Descripción del método de envío a dirección.
AvoidsAccountingResume | Boolean $<(length: 1)>$ | Evita resumen contable.
BranchShipmentMethodId | Int $<(length: 5)>$ | Identificador del método de envío a sucursal.
BranchShipmentMethodDescription | String | Descripción del método de envío a sucursal.
EmailShipmentMethodId | Byte $<(length: 2)>$ | Identificador del método de envío por correo.
EmailShipmentMethodDescription | String | Descripción del método de envío por correo.
RegulatorResumeFrequency | Long $<(length: 18)>$ | Frecuencia de resumen regulatorio.
RegulatorResumeFrequencyDescription | String | Descripción de la frecuencia de resumen regulatorio.
ShipmentMethod | Long $<(length: 18)>$ | Método de envío.
ShipmentMethodDescription | String | Descripción del método de envío.
:::

::: details SdtsBTPHWProduct

### SdtsBTPHWProduct

::: center
Los campos del tipo de dato estructurado SdtsBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CurrencyId | Short $<(length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(length: 6)>$ | Identificador del tipo.
KindDescription | String $<(length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(length: 36)>$ | GUID del producto.
:::

::: details SdtsBTSAWProductChange

### SdtsBTSAWProductChange

::: center
Los campos del tipo de dato estructurado SdtsBTSAWProductChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Event | Int $<(length: 5)>$ | Evento.
EventDate | Date $<(length: 8)>$ | Fecha del evento.
EventUser | String | Usuario del evento.
EventUserDescription | String $<(length: 30)>$ | Descripción del usuario del evento.
MovementGUID | String | GUID del movimiento.
PreviousProduct | Long $<(length: 18)>$ | Producto anterior.
PreviousProductDescription | String | Descripción del producto anterior.
ValidFrom | Date $<(length: 8)>$ | Válido desde.
:::

::: details SdtsBTSAWStatusChange

### SdtsBTSAWStatusChange

::: center
Los campos del tipo de dato estructurado SdtsBTSAWStatusChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ChangeDate | Date | Fecha de cambio.
Comments | String | Comentarios.
ConfirmationUserId | String | Identificador del usuario de confirmación.
ConfirmationUserDescription | String | Descripción del usuario de confirmación.
Correlative | Int | Correlativo.
CreationUserId | String | Identificador del usuario de creación.
CreationUserDescription | String | Descripción del usuario de creación.
IsReversedEntry | Boolean | ¿Es un asiento revertido?.
NewStatusId | Byte | Identificador del nuevo estado.
NewStatusDescription | String | Descripción del nuevo estado.
NewSubStatusId | Int | Identificador del nuevo subestado.
NewSubStatusDescription | String | Descripción del nuevo subestado.
PreviousStatusId | Byte | Identificador del estado anterior.
PreviousStatusDescription | String | Descripción del estado anterior.
PreviousSubStatusId | Int | Identificador del subestado anterior.
PreviousSubStatusDescription | String | Descripción del subestado anterior.
:::
<!-- CIERRA SDT -->
