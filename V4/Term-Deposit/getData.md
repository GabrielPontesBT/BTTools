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
termDepositGUID | String $<(Length: 36)>$ | GUID (identificador único global) del depósito a plazo.

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
Completar manualmente | Completar manualmente| 60001 | No existe la moneda ingresada |
| 90031 | El código contable no existe |
| 90120 | Cuenta contable no tiene tipo |
| 90121 | Cuenta contable no puede ser 0 |
| 90132 | No existe un asiento relacionado a los datos ingresados |
| 90142 | No existe registro de saldo |
| 90161 | La fecha de contabilización del asiento a anular es mayor a la fecha de apertura |
| 180006 | No existe registro pagos para la operación ingresada |
| 180069 | La fecha de consulta es menor a la fecha valor de la operación |
| 990070 | El sistema no se encuentra definido |
| 990071 | El parámetro no se encuentra definido |
| 20010005 | No existe la clase de tasa ingresada |
| 20010014 | No existe el tipo de tasa ingresado |
| 40010004 | La persona no existe |
| 40010084 | Ocupación incorrecta |
| 40010138 | No existe el Nivel de Datos |
| 40010184 | El Cargo no existe |
| 40010342 | El tipo de documento no aplica para el país |
| 40010343 | Número de documento no válido |
| 40010349 | Primer nivel asociado al país de nacimiento incorrecto |
| 40010350 | Segundo nivel asociado al país de nacimiento incorrecto |
| 40010353 | Existe inconsistencia de datos con el campo ? en la RNG ?? |
| 40020006 | Contraparte no existe |
| 40020012 | El número de contraparte no existe |
| 40020017 | La persona ingresada no existe |
| 40050001 | Debe ingresar el GUID de persona. |
| 50060003 | No existe el módulo ingresado |
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
AccountingAccountId | Long $<(Length: 16)>$ | Identificador de cuenta contable.
AccountingAccountDescription | String | Descripción de cuenta contable.
Amount | Double $<(Length: 18)>$ | Monto.
Balance | Double $<(Length: 18)>$ | Saldo.
CancellationDate | Date $<(Length: 8)>$ | Fecha de cancelación.
DayType | Byte $<(Length: 1)>$ | Tipo de día.
DayTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de día.
Events | [SdtsBTTDWEvent](#sdtsbttdwevent) | Events.
ExpandEndOfMonth | Boolean | Ampliar fin de mes.
ExpirationDate | Date $<(Length: 8)>$ | Fecha de vencimiento.
ExpirationType | String $<(Length: 1)>$ | Tipo de vencimiento.
ExpirationTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de vencimiento.
ForcesCommercialTerm | Boolean | Fuerza plazo comercial.
IncludesTaxes | Boolean | Incluye impuestos.
InstallmentCount | Int $<(Length: 5)>$ | Cantidad de cuotas.
Installments | [SdtsBTTDWInstallment](#sdtsbttdwinstallment) | Cuotas.
Instructions | [SdtsBTTDWInstruction](#sdtsbttdwinstruction) | Instrucciones.
InterestCalculationType | String $<(Length: 1)>$ | Tipo de cálculo de interés.
KindValue | Double $<(Length: 15)>$ | Valor del tipo.
LastRevisionDay | Date $<(Length: 8)>$ | Último día de revisión.
NextPaymentDate | Date $<(Length: 8)>$ | Fecha del próximo pago.
PayDate | Date $<(Length: 8)>$ | Fecha de pago.
PaymentType | Byte $<(Length: 2)>$ | Tipo de pago.
PaymentTypeDescription | String | Descripción del tipo de pago.
Period | Int $<(Length: 5)>$ | Período.
PlusRate | Double $<(Length: 11)>$ | Tasa adicional.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
Rate | Double $<(Length: 11)>$ | Tasa.
RateClassId | Int $<(Length: 5)>$ | Identificador de clase de tasa.
RateClassDescription | String $<(Length: 20)>$ | Descripción de la clase de tasa.
RateManagement | Byte $<(Length: 1)>$ | Gestión de tasa.
RateTypeId | Byte $<(Length: 1)>$ | Identificador del tipo de tasa.
RateTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de tasa.
RevisionDay | Int $<(Length: 5)>$ | Día de revisión.
StatusId | Short | Identificador de estado.
StatusDescription | String | Descripción del estado.
Term | Int $<(Length: 5)>$ | Plazo.
TermDepositGUID | String | GUID (identificador único global) del depósito a plazo.
ValueDate | Date $<(Length: 8)>$ | Fecha valor.
YearType | Byte $<(Length: 1)>$ | Tipo de año.
YearTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de año.
:::

::: details SdtsBTTDWEvent

### SdtsBTTDWEvent

::: center
Los campos del tipo de dato estructurado SdtsBTTDWEvent son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Accounted | String $<(Length: 1)>$ | Contabilizado.
Correlative | Long $<(Length: 10)>$ | Correlativo.
EventDate | Date $<(Length: 8)>$ | Fecha del evento.
Id | Int $<(Length: 5)>$ | Identificador.
MovementGUID | String | GUID (identificador único global) del movimiento.
Name | String | Nombre.
PlusRate | Double $<(Length: 11)>$ | Tasa adicional.
Rate | Double $<(Length: 11)>$ | Tasa.
RateTypeId | Byte $<(Length: 1)>$ | Identificador del tipo de tasa.
RateTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de tasa.
ValueDate | Date $<(Length: 8)>$ | Fecha valor.
:::

::: details SdtsBTTDWInstallment

### SdtsBTTDWInstallment

::: center
Los campos del tipo de dato estructurado SdtsBTTDWInstallment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
breachDate | Date | Fecha de incumplimiento.
capital | Numeric $<(Length: 18, dec: 2)>$ | Capital de la cuota.
capitalTax | Numeric $<(Length: 18, dec: 2)>$ | Impuesto sobre el capital.
endDate | Date | Fecha de fin del período.
expectedPaymentDate | Date | Fecha esperada de pago.
extendsTerm | Boolean | Indica si la cuota extiende el plazo del depósito.
installmentNumber | Numeric | Número de cuota.
installmentStatus | Character $<(Length: 1)>$ | Estado de la cuota.
installmentType | Character $<(Length: 1)>$ | Tipo de cuota.
installmentValue | Numeric $<(Length: 18, dec: 2)>$ | Valor de la cuota.
interest | Numeric $<(Length: 18, dec: 2)>$ | Intereses de la cuota.
interestTax1 | Numeric $<(Length: 18, dec: 2)>$ | Impuesto sobre intereses 1.
interestTax2 | Numeric $<(Length: 18, dec: 2)>$ | Impuesto sobre intereses 2.
interestTax3 | Numeric $<(Length: 18, dec: 2)>$ | Impuesto sobre intereses 3.
revenueTax | Numeric $<(Length: 18, dec: 2)>$ | Impuesto a la renta.
roundOff | Numeric $<(Length: 18, dec: 2)>$ | Diferencia de redondeo.
startDate | Date | Fecha de inicio del período.
subTotal | Numeric $<(Length: 18, dec: 2)>$ | Subtotal de la cuota.
taxes | Numeric $<(Length: 18, dec: 2)>$ | Total de impuestos de la cuota.
term | Numeric $<(Length: 5)>$ | Plazo de la cuota.
total | Numeric $<(Length: 18, dec: 2)>$ | Total de la cuota.
type | Character $<(Length: 1)>$ | Tipo de movimiento (P - Pago, I - Incremento, D - Decremento).
:::

::: details SdtsBTTDWInstruction

### SdtsBTTDWInstruction

::: center
Los campos del tipo de dato estructurado SdtsBTTDWInstruction son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Accounted | String $<(Length: 1)>$ | Contabilizado.
AccountingAccountId | Long $<(Length: 16)>$ | Identificador de cuenta contable.
BranchId | Int $<(Length: 5)>$ | Identificador de sucursal.
CompanyId | Short $<(Length: 3)>$ | Identificador de empresa.
CounterpartyId | Int $<(Length: 9)>$ | Identificador de contraparte.
CurrencyId | Short $<(Length: 4)>$ | Identificador de moneda.
Id | Short $<(Length: 3)>$ | Identificador.
Description | String | Descripción.
KindId | Int $<(Length: 6)>$ | Identificador del tipo.
ModuleId | Int $<(Length: 5)>$ | Identificador de módulo.
MovementGUID | String | GUID (identificador único global) del movimiento.
OperationId | Int $<(Length: 9)>$ | Identificador de operación.
OperationTypeId | Short $<(Length: 3)>$ | Identificador del tipo de operación.
SuboperationId | Int $<(Length: 5)>$ | Identificador de suboperación.
Type | Byte $<(Length: 2)>$ | Tipo.
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
<!-- CIERRA SDT -->
