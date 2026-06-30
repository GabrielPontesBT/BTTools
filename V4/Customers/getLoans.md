---
title: Get Loans
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los préstamos de un cliente.

**Nombre publicación:** PublicCustomers.getLoans

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
cancelledLoans | Boolean | Incluir préstamos cancelados.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
customerLoan | [SdtsBTLOWCustomerLoan](#sdtsbtlowcustomerloan) | Listado de préstamos del cliente.

@tab Errores

Código | Descripción
:--------- | :-----------
40020012 | El número de contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.

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
    "Token": "444B674391BCA7676279700A"
  },
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0",
  "cancelledLoans": false
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
    "Token": "444B674391BCA7676279700A"
  },
  "customerLoan": {
    "customerLoan": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:58",
    "Numero": 13468828,
    "Servicio": "PublicCustomers.getLoans",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWCustomerLoan

### SdtsBTLOWCustomerLoan

::: center
Los campos del tipo de dato estructurado SdtsBTLOWCustomerLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountBalance | Double | Saldo de cuenta.
AmortizationTypeId | Byte | Identificador del tipo de amortización.
AmortizationTypeDescription | String | Descripción del tipo de amortización.
BranchId | Int | Identificador de sucursal.
BranchDescription | String | Descripción de sucursal.
DateOfLastTotalPayment | Date | Fecha del último pago total.
ExpirationDate | Date | Fecha de vencimiento.
FirstUnpaidDate | Date | Fecha del primer pago impago.
InstallmentPeriodicity | Int | Periodicidad de cuotas.
InstallmentValue | Double | Valor cuota.
InterestRate | Double | Tasa de interés.
LoanGUID | String | GUID (identificador único global) del préstamo.
NumberOfInstallments | Int | Número de cuotas.
OriginalAmount | Double | Monto original.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
StatusId | Short | Identificador de estado.
StatusDescription | String | Descripción del estado.
Term | Int | Plazo.
TotalPaidInstallments | Int | Cuotas pagadas totales.
ValueDate | Date | Fecha valor.
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
