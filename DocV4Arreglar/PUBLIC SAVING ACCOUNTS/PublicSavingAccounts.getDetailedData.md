---
title: Obtener Datos Detallados de Caja de Ahorro
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el detalle completo de una caja de ahorro.
Este servicio permite consultar los datos detallados de una caja de ahorro (Saving Account), identificada por su **savingAccountGUID**, incluyendo preferencias de estado de cuenta, saldos, producto asociado y cambios de estado.

**Nombre publicación:** PublicSavingAccounts.getDetailedData

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String | Identificador único de la caja de ahorro.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sBTSAWSavingAccountData | Object | Información detallada de la caja de ahorro.
sBTSAWSavingAccountData.SavingAccountGUID | String | Identificador único de la caja de ahorro.
sBTSAWSavingAccountData.AccountStatementPreferences | Object | Preferencias de envío y frecuencia de resúmenes/estados de cuenta.
sBTSAWSavingAccountData.AccountStatementPreferences.RegulatorResumeFrequency | Integer | Frecuencia del resumen regulatorio.
sBTSAWSavingAccountData.AccountStatementPreferences.RegulatorResumeFrequencyDescription | String | Descripción de la frecuencia del resumen regulatorio.
sBTSAWSavingAccountData.AccountStatementPreferences.AccountingResumeFrequency | Integer | Frecuencia del resumen contable.
sBTSAWSavingAccountData.AccountStatementPreferences.AccountingResumeFrequencyDescription | String | Descripción de la frecuencia del resumen contable.
sBTSAWSavingAccountData.AccountStatementPreferences.ShipmentMethod | Integer | Método de envío configurado.
sBTSAWSavingAccountData.AccountStatementPreferences.ShipmentMethodDescription | String | Descripción del método de envío.
sBTSAWSavingAccountData.AccountStatementPreferences.AddressShipmentMethodId | Integer | Identificador de dirección para envío (si aplica).
sBTSAWSavingAccountData.AccountStatementPreferences.AddressShipmentMethodDescription | String | Descripción de la dirección para envío.
sBTSAWSavingAccountData.AccountStatementPreferences.EmailShipmentMethodId | Integer | Identificador de email para envío (si aplica).
sBTSAWSavingAccountData.AccountStatementPreferences.EmailShipmentMethodDescription | String | Descripción del email para envío.
sBTSAWSavingAccountData.AccountStatementPreferences.BranchShipmentMethodId | Integer | Identificador de sucursal para retiro/envío (si aplica).
sBTSAWSavingAccountData.AccountStatementPreferences.BranchShipmentMethodDescription | String | Descripción de la sucursal para retiro/envío.
sBTSAWSavingAccountData.AccountStatementPreferences.AvoidsAccountingResume | Boolean | Indica si evita el resumen contable.

sBTSAWSavingAccountData.Amount | Decimal | Saldo/importe de la caja de ahorro.
sBTSAWSavingAccountData.AvailableAmount | Decimal | Saldo disponible.
sBTSAWSavingAccountData.BankCode | String | Código bancario (CBU/IBAN u otro identificador según país).
sBTSAWSavingAccountData.BoardTypeId | Integer | Identificador del tipo de tablero/junta (si aplica).
sBTSAWSavingAccountData.BoardTypeDescription | String | Descripción del tipo de tablero/junta.
sBTSAWSavingAccountData.BranchId | Integer | Identificador de sucursal.
sBTSAWSavingAccountData.BranchDescription | String | Descripción de sucursal.

sBTSAWSavingAccountData.CancelationDate | Date | Fecha de cancelación (si aplica).
sBTSAWSavingAccountData.CancelationOriginId | Integer | Identificador de origen de cancelación (si aplica).
sBTSAWSavingAccountData.CancelationOriginDescription | String | Descripción del origen de cancelación.
sBTSAWSavingAccountData.CancelationReasonId | Integer | Identificador del motivo de cancelación (si aplica).
sBTSAWSavingAccountData.CancelationReasonDescription | String | Descripción del motivo de cancelación.
sBTSAWSavingAccountData.CancelationUser | String | Usuario que canceló (si aplica).
sBTSAWSavingAccountData.CancelationUserDescription | String | Descripción del usuario que canceló.

sBTSAWSavingAccountData.CircularityFee | Boolean | Indica si aplica comisión de circularidad.
sBTSAWSavingAccountData.ClassRateTypeId | Integer | Identificador de clase de tasa.
sBTSAWSavingAccountData.ClassRateTypeDescription | String | Descripción de clase de tasa.

sBTSAWSavingAccountData.CounterpartyId | Integer | Identificador de contraparte/titular.
sBTSAWSavingAccountData.CounterpartyDescription | String | Descripción de la contraparte/titular.
sBTSAWSavingAccountData.CreationUser | String | Usuario de creación.
sBTSAWSavingAccountData.CreationUserDescription | String | Descripción del usuario de creación.
sBTSAWSavingAccountData.CreationDate | Date | Fecha de creación.

sBTSAWSavingAccountData.GrouperId | Integer | Identificador de agrupador (si aplica).
sBTSAWSavingAccountData.GrouperDescription | String | Descripción del agrupador.

sBTSAWSavingAccountData.LowAverageFee | Boolean | Indica si aplica comisión por bajo promedio.
sBTSAWSavingAccountData.LowAverageFeeId | Integer | Identificador de la comisión por bajo promedio.
sBTSAWSavingAccountData.LowAverageFeeDescription | String | Descripción de la comisión por bajo promedio.

sBTSAWSavingAccountData.MovementFee | Boolean | Indica si aplica comisión por movimientos.
sBTSAWSavingAccountData.OpeningFee | Boolean | Indica si aplica comisión de apertura.

sBTSAWSavingAccountData.PaymentMethod | Integer | Método de cálculo/pago de intereses/comisiones.
sBTSAWSavingAccountData.PaymentMethodDescription | String | Descripción del método de cálculo/pago.
sBTSAWSavingAccountData.PaymentPeriod | Integer | Período de pago.
sBTSAWSavingAccountData.PaymentPeriodDescription | String | Descripción del período de pago.
sBTSAWSavingAccountData.PaysInterest | Boolean | Indica si la cuenta paga intereses.
sBTSAWSavingAccountData.RateType | Integer | Tipo de tasa.

sBTSAWSavingAccountData.StatusId | Integer | Identificador del estado de la cuenta.
sBTSAWSavingAccountData.StatusDescription | String | Descripción del estado de la cuenta.
sBTSAWSavingAccountData.SubStatusId | Integer | Identificador del subestado.
sBTSAWSavingAccountData.SubStatusDescription | String | Descripción del subestado.

sBTSAWSavingAccountData.Product | Object | Producto asociado a la caja de ahorro.
sBTSAWSavingAccountData.Product.ProductGUID | String | Identificador único del producto.
sBTSAWSavingAccountData.Product.ProductDescription | String | Descripción del producto.
sBTSAWSavingAccountData.Product.CurrencyId | Integer | Identificador de la moneda.
sBTSAWSavingAccountData.Product.CurrencyDescription | String | Descripción de la moneda.
sBTSAWSavingAccountData.Product.CurrencySign | String | Símbolo/signo de la moneda.
sBTSAWSavingAccountData.Product.KindId | Integer | Identificador del tipo (por ejemplo, Billete / Unidad Indexada).
sBTSAWSavingAccountData.Product.KindDescription | String | Descripción del tipo.

sBTSAWSavingAccountData.ProductChanges | Array | Lista de cambios de producto (si aplica).
sBTSAWSavingAccountData.StatusChanges | Array | Lista de cambios de estado.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.Correlative | Integer | Correlativo del cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.ChangeDate | Date | Fecha del cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.Comments | String | Comentarios del cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.CreationUserId | String | Usuario que generó el cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.CreationUserDescription | String | Descripción del usuario que generó el cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.ConfirmationUserId | String | Usuario que confirmó el cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.ConfirmationUserDescription | String | Descripción del usuario que confirmó el cambio.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.IsReversedEntry | Boolean | Indica si el cambio fue reversado.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.NewStatusId | Integer | Identificador del nuevo estado.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.NewStatusDescription | String | Descripción del nuevo estado.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.NewSubStatusId | Integer | Identificador del nuevo subestado.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.NewSubStatusDescription | String | Descripción del nuevo subestado.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.PreviousStatusId | Integer | Identificador del estado anterior.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.PreviousStatusDescription | String | Descripción del estado anterior.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.PreviousSubStatusId | Integer | Identificador del subestado anterior.
sBTSAWSavingAccountData.StatusChanges.SdtsBTSAWStatusChange.PreviousSubStatusDescription | String | Descripción del subestado anterior.

@tab Errores

Código | Descripción
:--------- | :-----------
10002 | Error en la ejecución del programa.
10011 | Sesión inválida.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?getDetailedData' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "GP",
    "Requerimiento": "1",
    "Token": "70B7DC4F2B958AA47946867A"
  },
  "savingAccountGUID": "dba24b7e-c0c9-4005-b5dc-817f101d1c71"
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
    "Device": "GP",
    "Requerimiento": "1",
    "Token": "70B7DC4F2B958AA47946867A"
  },
  "sBTSAWSavingAccountData": {
    "SavingAccountGUID": "dba24b7e-c0c9-4005-b5dc-817f101d1c71",
    "AccountStatementPreferences": {
      "RegulatorResumeFrequency": "9",
      "RegulatorResumeFrequencyDescription": "Cuatrimestral",
      "AccountingResumeFrequency": "4",
      "AccountingResumeFrequencyDescription": "Mensual",
      "ShipmentMethod": "1",
      "ShipmentMethodDescription": "Email",
      "AddressShipmentMethodId": "0",
      "AddressShipmentMethodDescription": "",
      "EmailShipmentMethodId": "1",
      "EmailShipmentMethodDescription": "pcrampet@bantotal.com",
      "BranchShipmentMethodId": "1",
      "BranchShipmentMethodDescription": "Sucursal Beta",
      "AvoidsAccountingResume": "false"
    },
    "Amount": "3200.0",
    "AvailableAmount": "3200.0",
    "BankCode": "36500101000002016771",
    "BoardTypeId": "0",
    "BoardTypeDescription": "",
    "BranchId": "1",
    "BranchDescription": "Sucursal Beta",
    "CancelationDate": "",
    "CancelationOriginId": "0",
    "CancelationOriginDescription": "",
    "CancelationReasonId": "0",
    "CancelationReasonDescription": "",
    "CancelationUser": "",
    "CancelationUserDescription": "",
    "CircularityFee": "true",
    "ClassRateTypeId": "3",
    "ClassRateTypeDescription": "PRIME",
    "CounterpartyId": "5090",
    "CounterpartyDescription": "CRAMPET GUTIERREZ PEDRO PABLO",
    "CreationUser": "INSTALADOR",
    "CreationUserDescription": "INSTALADOR",
    "CreationDate": "2025-01-08",
    "GrouperId": "0",
    "GrouperDescription": "",
    "LowAverageFee": "true",
    "LowAverageFeeId": "962",
    "LowAverageFeeDescription": "Comisión bajo promedio",
    "MovementFee": "true",
    "OpeningFee": "true",
    "PaymentMethod": "1",
    "PaymentMethodDescription": "Saldos diarios",
    "PaymentPeriod": "4",
    "PaymentPeriodDescription": "Mensual",
    "PaysInterest": "true",
    "RateType": "2",
    "StatusId": "12",
    "StatusDescription": "Bloqueo PSP",
    "SubStatusId": "0",
    "SubStatusDescription": "",
    "Product": {
      "ProductGUID": "dd98b54d-73d9-4248-b760-5e62b24617ac",
      "ProductDescription": "CAJA DE AHORRO PF",
      "CurrencyId": "0",
      "CurrencyDescription": "Pesos Uruguayos",
      "CurrencySign": "$",
      "KindId": "0",
      "KindDescription": "Billete"
    },
    "ProductChanges": "",
    "StatusChanges": {
      "SdtsBTSAWStatusChange": [
        {
          "Correlative": "1",
          "ChangeDate": "2026-01-28",
          "Comments": "Bloqueo",
          "CreationUserId": "INSTALADOR",
          "CreationUserDescription": "",
          "ConfirmationUserId": "INSTALADOR",
          "ConfirmationUserDescription": "",
          "IsReversedEntry": "false",
          "NewStatusId": "12",
          "NewStatusDescription": "Bloqueo PSP",
          "NewSubStatusId": "0",
          "NewSubStatusDescription": "",
          "PreviousStatusId": "12",
          "PreviousStatusDescription": "Bloqueo PSP",
          "PreviousSubStatusId": "0",
          "PreviousSubStatusDescription": ""
        },
        {
          "Correlative": "2",
          "ChangeDate": "2026-01-20",
          "Comments": "Desbloqueo",
          "CreationUserId": "INSTALADOR",
          "CreationUserDescription": "INSTALADOR",
          "ConfirmationUserId": "INSTALADOR",
          "ConfirmationUserDescription": "INSTALADOR",
          "IsReversedEntry": "false",
          "NewStatusId": "0",
          "NewStatusDescription": "Normal",
          "NewSubStatusId": "0",
          "NewSubStatusDescription": "",
          "PreviousStatusId": "12",
          "PreviousStatusDescription": "Bloqueo PSP",
          "PreviousSubStatusId": "0",
          "PreviousSubStatusDescription": ""
        },
        {
          "Correlative": "1",
          "ChangeDate": "2026-01-20",
          "Comments": "Bloqueo",
          "CreationUserId": "INSTALADOR",
          "CreationUserDescription": "INSTALADOR",
          "ConfirmationUserId": "INSTALADOR",
          "ConfirmationUserDescription": "INSTALADOR",
          "IsReversedEntry": "false",
          "NewStatusId": "12",
          "NewStatusDescription": "Bloqueo PSP",
          "NewSubStatusId": "0",
          "NewSubStatusDescription": "",
          "PreviousStatusId": "0",
          "PreviousStatusDescription": "Normal",
          "PreviousSubStatusId": "0",
          "PreviousSubStatusDescription": ""
        }
      ]
    }
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-30",
    "Hora": "10:47:25",
    "Numero": "13071663",
    "Servicio": "PublicSavingAccounts.getDetailedData",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details AccountStatementPreferences

### AccountStatementPreferences

::: center
Los campos del tipo de dato estructurado AccountStatementPreferences son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
RegulatorResumeFrequency | String |
RegulatorResumeFrequencyDescription | String |
AccountingResumeFrequency | String |
AccountingResumeFrequencyDescription | String |
ShipmentMethod | String |
ShipmentMethodDescription | String |
AddressShipmentMethodId | String |
AddressShipmentMethodDescription | String |
EmailShipmentMethodId | String |
EmailShipmentMethodDescription | String |
BranchShipmentMethodId | String |
BranchShipmentMethodDescription | String |
AvoidsAccountingResume | String |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details Product

### Product

::: center
Los campos del tipo de dato estructurado Product son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ProductGUID | String |
ProductDescription | String |
CurrencyId | String |
CurrencyDescription | String |
CurrencySign | String |
KindId | String |
KindDescription | String |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details StatusChange

### StatusChange

::: center
Los campos del tipo de dato estructurado StatusChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | String |
ChangeDate | Date |
Comments | String |
CreationUserId | String |
CreationUserDescription | String |
ConfirmationUserId | String |
ConfirmationUserDescription | String |
IsReversedEntry | String |
NewStatusId | String |
NewStatusDescription | String |
NewSubStatusId | String |
NewSubStatusDescription | String |
PreviousStatusId | String |
PreviousStatusDescription | String |
PreviousSubStatusId | String |
PreviousSubStatusDescription | String |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details sBTSAWSavingAccountData

### sBTSAWSavingAccountData

::: center
Los campos del tipo de dato estructurado sBTSAWSavingAccountData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
SavingAccountGUID | String |
AccountStatementPreferences | AccountStatementPreferences |
Amount | String |
AvailableAmount | String |
BankCode | String |
BoardTypeId | String |
BoardTypeDescription | String |
BranchId | String |
BranchDescription | String |
CancelationDate | String |
CancelationOriginId | String |
CancelationOriginDescription | String |
CancelationReasonId | String |
CancelationReasonDescription | String |
CancelationUser | String |
CancelationUserDescription | String |
CircularityFee | String |
ClassRateTypeId | String |
ClassRateTypeDescription | String |
CounterpartyId | String |
CounterpartyDescription | String |
CreationUser | String |
CreationUserDescription | String |
CreationDate | Date |
GrouperId | String |
GrouperDescription | String |
LowAverageFee | String |
LowAverageFeeId | String |
LowAverageFeeDescription | String |
MovementFee | String |
OpeningFee | String |
PaymentMethod | String |
PaymentMethodDescription | String |
PaymentPeriod | String |
PaymentPeriodDescription | String |
PaysInterest | String |
RateType | String |
StatusId | String |
StatusDescription | String |
SubStatusId | String |
SubStatusDescription | String |
Product | Product |
ProductChanges | String |
StatusChanges | List[StatusChange] |
:::
<!-- CIERRA SDT -->
