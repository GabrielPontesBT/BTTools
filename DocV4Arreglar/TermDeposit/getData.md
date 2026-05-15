---
title: Get Data
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los datos de un depósito a plazo.

**Nombre publicación:** PublicTermDeposit.getData

**Módulo:** TermDeposit

**Programa:** PublicAPI.BTTDPA0003

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
termDepositGUID | String $<(length: 36)>$ | GUID (identificador único global) del depósito a plazo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
termDepositData | [SdtsBTTDWTermDepositData](#sdtsbttdwtermdepositdata) | Datos del depósito a plazo.

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
    "Token": "A8068BDF0E08AC754A7B94F5"
  },
  "termDepositGUID": "6d865a97-7cde-4b25-935d-a02bdeba9844"
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
  "termDepositData": {
    "AccountingAccountId": 162502000,
    "AccountingAccountDescription": "Dep.A Plazo Fijo Intran.No Reaj.Res",
    "Amount": "2000.00",
    "Balance": "2000.00",
    "CancellationDate": "",
    "DayType": 1,
    "DayTypeDescription": "Comerciales",
    "ExpandEndOfMonth": true,
    "ExpirationDate": "2028-02-02",
    "ExpirationType": "P",
    "ExpirationTypeDescription": "Día hábil posterior",
    "ForcesCommercialTerm": false,
    "IncludesTaxes": false,
    "InstallmentCount": 0,
    "InterestCalculationType": "C",
    "KindValue": "0E-8",
    "LastRevisionDay": "",
    "NextPaymentDate": "",
    "PayDate": "",
    "PaymentType": 1,
    "PaymentTypeDescription": "",
    "Period": 0,
    "PlusRate": "0.000000",
    "Rate": "13.000000",
    "RateClassId": 0,
    "RateClassDescription": "",
    "RateManagement": 0,
    "RateTypeId": 1,
    "RateTypeDescription": "Efectiva Anual",
    "RevisionDay": 0,
    "StatusId": 0,
    "StatusDescription": "Normal",
    "Term": 361,
    "TermDepositGUID": "6d865a97-7cde-4b25-935d-a02bdeba9844",
    "ValueDate": "2027-02-01",
    "YearType": 2,
    "YearTypeDescription": "365 - Año calendario",
    "Product": {
      "ProductGUID": "8fd31000-0027-4028-8a66-eede56e485dd",
      "ProductDescription": "DPF TIPO 1 - COMERCIAL 365 EFECTIVA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "CurrencySign": "$",
      "KindId": 0,
      "KindDescription": "Billete"
    },
    "Instructions": {
      "SdtsBTTDWInstruction": [
        {
          "Id": 1,
          "Description": "Cancelar y Acreditar al vto.",
          "Accounted": "S",
          "MovementGUID": "626e97c1-cc5b-4ee8-9c37-72ec5bf0cb2c",
          "AccountingAccountId": 102100000,
          "BranchId": 0,
          "CompanyId": 0,
          "CounterpartyId": 4612,
          "CurrencyId": 0,
          "KindId": 0,
          "ModuleId": 0,
          "OperationId": 0,
          "OperationTypeId": 0,
          "SuboperationId": 0,
          "Type": 0
        }
      ]
    },
    "Installments": {
      "SdtsBTTDWInstallment": []
    },
    "Events": {
      "SdtsBTTDWEvent": []
    }
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-15",
    "Hora": "14:07:35",
    "Numero": 13472659,
    "Servicio": "PublicTermDeposit.getData",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTTDWTermDepositData

### SdtsBTTDWTermDepositData

::: center
Los campos del tipo de dato estructurado SdtsBTTDWTermDepositData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountingAccountId | Long $<(length: 16)>$ | Identificador de cuenta contable.
AccountingAccountDescription | String | Descripción de cuenta contable.
Amount | Double $<(length: 18)>$ | Monto.
Balance | Double $<(length: 18)>$ | Saldo.
CancellationDate | Date $<(length: 8)>$ | Fecha de cancelación.
DayType | Byte $<(length: 1)>$ | Tipo de día.
DayTypeDescription | String $<(length: 40)>$ | Descripción del tipo de día.
Events | [SdtsBTTDWEvent](#sdtsbttdwevent) | Events.
ExpandEndOfMonth | Boolean $<(length: 1)>$ | Ampliar fin de mes.
ExpirationDate | Date $<(length: 8)>$ | Fecha de vencimiento.
ExpirationType | String $<(length: 1)>$ | Tipo de vencimiento.
ExpirationTypeDescription | String $<(length: 40)>$ | Descripción del tipo de vencimiento.
ForcesCommercialTerm | Boolean $<(length: 1)>$ | Fuerza plazo comercial.
IncludesTaxes | Boolean $<(length: 1)>$ | Incluye impuestos.
InstallmentCount | Int $<(length: 5)>$ | Cantidad de cuotas.
Installments | [SdtsBTTDWInstallment](#sdtsbttdwinstallment) | Cuotas.
Instructions | [SdtsBTTDWInstruction](#sdtsbttdwinstruction) | Instrucciones.
InterestCalculationType | String $<(length: 1)>$ | Tipo de cálculo de interés.
KindValue | Double $<(length: 15)>$ | Valor del tipo.
LastRevisionDay | Date $<(length: 8)>$ | Último día de revisión.
NextPaymentDate | Date $<(length: 8)>$ | Fecha del próximo pago.
PayDate | Date $<(length: 8)>$ | Fecha de pago.
PaymentType | Byte $<(length: 2)>$ | Tipo de pago.
PaymentTypeDescription | String | Descripción del tipo de pago.
Period | Int $<(length: 5)>$ | Período.
PlusRate | Double $<(length: 11)>$ | Tasa adicional.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
Rate | Double $<(length: 11)>$ | Tasa.
RateClassId | Int $<(length: 5)>$ | Identificador de clase de tasa.
RateClassDescription | String $<(length: 20)>$ | Descripción de la clase de tasa.
RateManagement | Byte $<(length: 1)>$ | Gestión de tasa.
RateTypeId | Byte $<(length: 1)>$ | Identificador del tipo de tasa.
RateTypeDescription | String $<(length: 20)>$ | Descripción del tipo de tasa.
RevisionDay | Int $<(length: 5)>$ | Día de revisión.
StatusId | Short | Identificador de estado.
StatusDescription | String | Descripción del estado.
Term | Int $<(length: 5)>$ | Plazo.
TermDepositGUID | String | GUID del depósito a plazo.
ValueDate | Date $<(length: 8)>$ | Fecha valor.
YearType | Byte $<(length: 1)>$ | Tipo de año.
YearTypeDescription | String $<(length: 40)>$ | Descripción del tipo de año.
:::

::: details SdtsBTTDWEvent

### SdtsBTTDWEvent

::: center
Los campos del tipo de dato estructurado SdtsBTTDWEvent son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Accounted | String $<(length: 1)>$ | Contabilizado.
Correlative | Long $<(length: 10)>$ | Correlativo.
EventDate | Date $<(length: 8)>$ | Fecha del evento.
Id | Int $<(length: 5)>$ | Identificador.
MovementGUID | String | GUID del movimiento.
Name | String | Nombre.
PlusRate | Double $<(length: 11)>$ | Tasa adicional.
Rate | Double $<(length: 11)>$ | Tasa.
RateTypeId | Byte $<(length: 1)>$ | Identificador del tipo de tasa.
RateTypeDescription | String $<(length: 20)>$ | Descripción del tipo de tasa.
ValueDate | Date $<(length: 8)>$ | Fecha valor.
:::

::: details SdtsBTTDWInstallment

### SdtsBTTDWInstallment

::: center
Los campos del tipo de dato estructurado SdtsBTTDWInstallment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Accounted | String $<(length: 1)>$ | Contabilizado.
BreachDate | Date $<(length: 8)>$ | Fecha de incumplimiento.
Capital | Double $<(length: 18)>$ | Capital.
CapitalTax | Double $<(length: 18)>$ | Impuesto sobre capital.
DecimalsNumber | Byte $<(length: 1)>$ | Número de decimales.
EndDate | Date $<(length: 8)>$ | Fecha de fin.
ExpectedPaymentDate | Date $<(length: 8)>$ | Fecha de pago esperado.
ExtendsTerm | Boolean $<(length: 1)>$ | Extiende plazo.
Interest | Double $<(length: 18)>$ | Interés.
InterestTax1 | Double $<(length: 18)>$ | Impuesto de interés 1.
InterestTax2 | Double $<(length: 18)>$ | Impuesto de interés 2.
InterestTax3 | Double $<(length: 18)>$ | Impuesto de interés 3.
InverseExpectedPaymentDate | Int $<(length: 8)>$ | Fecha de pago esperado inversa.
QuotaNumber | Short | Número de cuota.
QuotaStatus | String $<(length: 1)>$ | Estado de la cuota.
QuotaType | String $<(length: 1)>$ | Tipo de cuota.
QuotaValue | Double $<(length: 18)>$ | Valor de cuota.
RevenueTax | Double $<(length: 18)>$ | Impuesto a los ingresos.
RoundOff | Double $<(length: 18)>$ | Redondeo.
StartDate | Date $<(length: 8)>$ | Fecha de inicio.
SubTotal | Double $<(length: 18)>$ | Subtotal.
Taxes | Double $<(length: 18)>$ | Impuestos.
Term | Int $<(length: 5)>$ | Plazo.
Total | Double $<(length: 18)>$ | Total.
TransactionBranchId | Int $<(length: 5)>$ | Identificador de sucursal de transacción.
TransactionCompanyId | Short $<(length: 3)>$ | Identificador de empresa de transacción.
TransactionDate | Date $<(length: 8)>$ | Fecha de transacción.
TransactionEntryNum | Int $<(length: 9)>$ | Número de entrada de transacción.
TransactionId | Int $<(length: 5)>$ | Identificador de transacción.
TransactionModuleId | Int $<(length: 5)>$ | Identificador de módulo de transacción.
TransactionOrdinalId | Short $<(length: 3)>$ | Identificador ordinal de transacción.
TransactionSubordinalId | Short $<(length: 3)>$ | Identificador subordinal de transacción.
Type | String $<(length: 1)>$ | Type.
:::

::: details SdtsBTTDWInstruction

### SdtsBTTDWInstruction

::: center
Los campos del tipo de dato estructurado SdtsBTTDWInstruction son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Accounted | String $<(length: 1)>$ | Contabilizado.
AccountingAccountId | Long $<(length: 16)>$ | Identificador de cuenta contable.
BranchId | Int $<(length: 5)>$ | Identificador de sucursal.
CompanyId | Short $<(length: 3)>$ | Identificador de empresa.
CounterpartyId | Int $<(length: 9)>$ | Identificador de contraparte.
CurrencyId | Short $<(length: 4)>$ | Identificador de moneda.
Id | Short $<(length: 3)>$ | Identificador.
Description | String | Descripción.
KindId | Int $<(length: 6)>$ | Identificador del tipo.
ModuleId | Int $<(length: 5)>$ | Identificador de módulo.
MovementGUID | String | GUID del movimiento.
OperationId | Int $<(length: 9)>$ | Identificador de operación.
OperationTypeId | Short $<(length: 3)>$ | Identificador del tipo de operación.
SuboperationId | Int $<(length: 5)>$ | Identificador de suboperación.
Type | Byte $<(length: 2)>$ | Tipo.
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
<!-- CIERRA SDT -->
