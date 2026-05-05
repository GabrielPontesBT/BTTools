---
title: Obtener Pagos de una Cuota
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
::: note Método para obtener el detalle de pagos asociados a una cuota de un préstamo.
Este servicio permite consultar los pagos realizados (y su desglose) para una cuota específica de un préstamo, identificado por su **loanGUID** y el **installmentNumber**.

**Nombre publicación:** PublicLoans.getInstallmentPayments

**Módulo:** (No informado)

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String | Identificador único del préstamo.
installmentNumber | Integer | Número de cuota a consultar.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
payments | Array | Lista de pagos asociados a la cuota.

@tab Errores

Código | Descripción
:--------- | :-----------
<!-- SE DEBEN AGREGAR A MANO -->
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicLoans_v1?getInstallmentPayments' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "GP",
    "Requerimiento": "1",
    "Token": "0BB5FB2C45DF407C00FCF3A3"
  },
  "loanGUID": "3e790c8b-137a-4852-909d-bfc93583f83d",
  "installmentNumber": "1"
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
    "Token": "0BB5FB2C45DF407C00FCF3A3"
  },
  "payments": {
    "payment": {
      "InstallmentNumber": "1",
      "InstallmentType": "M",
      "PlannedPaymentDate": "2025-08-12",
      "PaymentNumber": "1",
      "PaymentDate": "2025-08-12",
      "Capital": "771.79",
      "CapitalTax": "0.0",
      "AccountBalance": "0.0",
      "Interest": "0.0",
      "InterestModality": "1",
      "InterestTax1": "0.0",
      "InterestTax2": "0.0",
      "InterestTax3": "0.0",
      "FeeTotal": "1215.0",
      "Total": "2046.79",
      "RoundOff": "0.0",
      "Taxes": "0.0",
      "DeferredInterest": "0.0",
      "DeferredInterestTax1": "0.0",
      "DeferredInterestTax2": "0.0",
      "DeferredInterestTax3": "0.0",
      "DistributedInterest": "0.0",
      "DistributedInterestTax1": "0.0",
      "DistributedInterestTax2": "0.0",
      "DistributedInterestTax3": "0.0",
      "DistributedInsurance1": "0.0",
      "DistributedInsurance2": "0.0",
      "Subvention1": "0.0",
      "Subvention2": "0.0",
      "Subvention3": "0.0",
      "Concessional": "0.0",
      "CapitalConcessional": "0.0",
      "ArrearRate": "0.0",
      "ArrearInterest": "0.0",
      "ArrearTax": "0.0",
      "ArrearFee1": "0.0",
      "ArrearFee2": "0.0",
      "ArrearFee3": "0.0",
      "CompensatoryInterest": "0.0",
      "CompensatoryInterestTax": "0.0",
      "PunitiveInterest": "0.0",
      "PunitiveInterestTax": "0.0",
      "StatusId": "T",
      "MovementGUID": "f70e3788-b4c2-4c4c-9f0b-d6371941e8b8",
      "InsurancesTotal": "60.0",
      "Fees": {
        "SdtsBTLOWFee": [
          {
            "FeeId": "3701",
            "Description": "Comisión Estudio de Proyectos",
            "Amount": "1200.0",
            "Tax": "0.0",
            "Total": "1200.0"
          },
          {
            "FeeId": "3840",
            "Description": "Comisión Tasaciones",
            "Amount": "15.0",
            "Tax": "0.0",
            "Total": "15.0"
          }
        ]
      },
      "Insurances": {
        "SdtsBTLOWInsurance": {
          "Id": "1",
          "Description": "SEGURO 1",
          "Total": "60.0"
        }
      }
    }
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-11",
    "Hora": "15:28:12",
    "Numero": "13111215",
    "Servicio": "PublicLoans.getInstallmentPayments",
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
::: details Fee

### Fee

::: center
Los campos del tipo de dato estructurado Fee son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
FeeId | String |
Description | String |
Amount | String |
Tax | String |
Total | String |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details SdtsBTLOWInsurance

### SdtsBTLOWInsurance

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInsurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
Total | String |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details Insurances

### Insurances

::: center
Los campos del tipo de dato estructurado Insurances son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
SdtsBTLOWInsurance | SdtsBTLOWInsurance |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details payment

### payment

::: center
Los campos del tipo de dato estructurado payment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
InstallmentNumber | String |
InstallmentType | String |
PlannedPaymentDate | Date |
PaymentNumber | String |
PaymentDate | Date |
Capital | String |
CapitalTax | String |
AccountBalance | String |
Interest | String |
InterestModality | String |
InterestTax1 | String |
InterestTax2 | String |
InterestTax3 | String |
FeeTotal | String |
Total | String |
RoundOff | String |
Taxes | String |
DeferredInterest | String |
DeferredInterestTax1 | String |
DeferredInterestTax2 | String |
DeferredInterestTax3 | String |
DistributedInterest | String |
DistributedInterestTax1 | String |
DistributedInterestTax2 | String |
DistributedInterestTax3 | String |
DistributedInsurance1 | String |
DistributedInsurance2 | String |
Subvention1 | String |
Subvention2 | String |
Subvention3 | String |
Concessional | String |
CapitalConcessional | String |
ArrearRate | String |
ArrearInterest | String |
ArrearTax | String |
ArrearFee1 | String |
ArrearFee2 | String |
ArrearFee3 | String |
CompensatoryInterest | String |
CompensatoryInterestTax | String |
PunitiveInterest | String |
PunitiveInterestTax | String |
StatusId | String |
MovementGUID | String |
InsurancesTotal | String |
Fees | List[Fee] |
Insurances | Insurances |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details payments

### payments

::: center
Los campos del tipo de dato estructurado payments son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
payment | payment |
:::
<!-- CIERRA SDT -->
