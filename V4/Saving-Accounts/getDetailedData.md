---
title: Get Detailed Data
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
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountData | [SdtsBTSAWSavingAccountData](#sdtsbtsawsavingaccountdata) | Datos de la cuenta de ahorro.

@tab Errores

Código | Descripción
:--------- | :-----------
50050003 | No se encuentra la empresa
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
  "savingAccountGUID": "92b2ce1f-34e7-4606-bdd4-e62bde656979"
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
  "savingAccountData": {
    "SavingAccountGUID": "92b2ce1f-34e7-4606-bdd4-e62bde656979",
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
    "BankCode": "36500101000002060678",
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
    "CreationDate": "2027-04-30",
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
    "Fecha": "2026-05-13",
    "Hora": "20:53:59",
    "Numero": 13466299,
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
AvailableAmount | Double $<(Length: 18)>$ | Monto disponible.
BankCode | String $<(Length: 30)>$ | Código bancario.
BoardTypeId | Int $<(Length: 5)>$ | Identificador del tipo de pizarra.
BoardTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de mesa.
BranchId | Int $<(Length: 5)>$ | Identificador de sucursal.
BranchDescription | String $<(Length: 30)>$ | Descripción de sucursal.
CancelationDate | Date $<(Length: 8)>$ | Fecha de cancelación.
CancelationOriginId | Byte $<(Length: 2)>$ | Identificador del origen de cancelación.
CancelationOriginDescription | String | Descripción del origen de cancelación.
CancelationReasonId | Byte $<(Length: 2)>$ | Identificador del motivo de cancelación.
CancelationReasonDescription | String | Descripción del motivo de cancelación.
CancelationUser | String | Usuario de cancelación.
CancelationUserDescription | String | Descripción del usuario de cancelación.
CircularityFee | Boolean | Comisión de circularidad.
ClassRateTypeId | Int $<(Length: 5)>$ | Identificador del tipo de clase de tasa.
ClassRateTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de clase de tasa.
CounterpartyId | Int $<(Length: 9)>$ | Identificador de contraparte.
CounterpartyDescription | String $<(Length: 70)>$ | Descripción de contraparte.
CreationDate | Date $<(Length: 8)>$ | Fecha de creación.
CreationUser | String | Usuario de creación.
CreationUserDescription | String | Descripción del usuario de creación.
GrouperId | Short | Identificador del agrupador.
GrouperDescription | String | Descripción del agrupador.
LowAverageFee | Boolean | Comisión de saldo mínimo.
LowAverageFeeId | Int $<(Length: 5)>$ | Identificador de comisión de saldo mínimo.
LowAverageFeeDescription | String $<(Length: 30)>$ | Descripción de comisión de saldo mínimo.
MovementFee | Boolean | Comisión por movimiento.
OpeningFee | Boolean | Comisión de apertura.
PaymentMethod | Short | Método de pago.
PaymentMethodDescription | String | Descripción del método de pago.
PaymentPeriod | Long $<(Length: 18)>$ | Período de pago.
PaymentPeriodDescription | String | Descripción del período de pago.
PaysInterest | Boolean | Paga intereses.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
ProductChanges | [SdtsBTSAWProductChange](#sdtsbtsawproductchange) | Cambios de producto.
RateType | Long | Tipo de tasa.
SavingAccountGUID | String | GUID (identificador único global) de cuenta de ahorro.
StatusChanges | [SdtsBTSAWStatusChange](#sdtsbtsawstatuschange) | Cambios de estado.
StatusId | Byte $<(Length: 2)>$ | Identificador de estado.
StatusDescription | String | Descripción del estado.
SubStatusId | Int $<(Length: 5)>$ | Identificador de subestado.
SubStatusDescription | String | Descripción del subestado.
:::

::: details SdtsBTSAWAccountStatementPreferences

### SdtsBTSAWAccountStatementPreferences

::: center
Los campos del tipo de dato estructurado SdtsBTSAWAccountStatementPreferences son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountingResumeFrequency | Long $<(Length: 18)>$ | Frecuencia de resumen contable.
AccountingResumeFrequencyDescription | String | Descripción de la frecuencia de resumen contable.
AddressShipmentMethodId | Byte $<(Length: 2)>$ | Identificador del método de envío a dirección.
AddressShipmentMethodDescription | String | Descripción del método de envío a dirección.
AvoidsAccountingResume | Boolean | Evita resumen contable.
BranchShipmentMethodId | Int $<(Length: 5)>$ | Identificador del método de envío a sucursal.
BranchShipmentMethodDescription | String | Descripción del método de envío a sucursal.
EmailShipmentMethodId | Byte $<(Length: 2)>$ | Identificador del método de envío por correo.
EmailShipmentMethodDescription | String | Descripción del método de envío por correo.
RegulatorResumeFrequency | Long $<(Length: 18)>$ | Frecuencia de resumen regulatorio.
RegulatorResumeFrequencyDescription | String | Descripción de la frecuencia de resumen regulatorio.
ShipmentMethod | Long $<(Length: 18)>$ | Método de envío.
ShipmentMethodDescription | String | Descripción del método de envío.
:::

::: details SdtsBTGeolocalization

### SdtsBTGeolocalization

::: center
Los campos del tipo de dato estructurado SdtsBTGeolocalization son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
latitude | Double | Latitud.
longitude | Double  | Longitud.
timestamp | String | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM
:::

::: details SdtsBTPHWProduct

### SdtsBTPHWProduct

::: center
Los campos del tipo de dato estructurado SdtsBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CurrencyId | Short $<(Length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(Length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(Length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(Length: 6)>$ | Identificador del tipo.
KindDescription | String $<(Length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.
:::

::: details SdtsBTSAWProductChange

### SdtsBTSAWProductChange

::: center
Los campos del tipo de dato estructurado SdtsBTSAWProductChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Event | Int $<(Length: 5)>$ | Evento.
EventDate | Date $<(Length: 8)>$ | Fecha del evento.
EventUser | String | Usuario del evento.
EventUserDescription | String $<(Length: 30)>$ | Descripción del usuario del evento.
MovementGUID | String | GUID (identificador único global) del movimiento.
PreviousProduct | Long $<(Length: 18)>$ | Producto anterior.
PreviousProductDescription | String | Descripción del producto anterior.
ValidFrom | Date $<(Length: 8)>$ | Válido desde.
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
