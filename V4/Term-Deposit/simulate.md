---
title: Simulate
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para simular la contratación de un depósito a plazo.

**Nombre publicación:** PublicTermDeposit.simulate

**Módulo:** TermDeposit

**Programa:** PublicAPI.BTTDPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount |  Double $<(Length: 18.2)>$ | Importe de capital.
term | Int $<(Length: 5)>$ | Plazo.
frequency | Int $<(Length: 5)>$ | Periodicidad.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
simulation | [SdtsBTTDWSimulation](#sdtsbttdwsimulation) | Datos de la simulación.

@tab Errores

Código | Descripción
:--------- | :-----------
180011 | Debe ingresar un capital
180017 | La cantidad de cuotas indicada no se encuentra en el Hub de Productos
180018 | La Cantidad de Cuotas indicada es menor al mínimo permitido
180019 | La Cantidad de Cuotas indicada es mayor al máximo permitido
180020 | Cantidad de Cuotas incorrecta
180021 | El período entre cuotas indicado no se encuentra en el Hub de Productos
180022 | El período entre cuotas indicado es menor al mínimo permitido
180023 | El período entre cuotas indicado es mayor al máximo permitido
180024 | El Capital indicado es menor al mínimo permitido
180025 | El Capital indicado es mayor al máximo permitido
180026 | El Plazo Total de la Operación es mayor al máximo permitido
180027 | El Plazo Total de la Operación es menor al mínimo permitido
180028 | Contraparte incorrecta
180036 | Debe ingresar un plazo
180066 | Producto o subproducto incorrecto
980003 | No existe el producto ingresado
980066 | El producto ingresado no pertenece a Hub de Productos
980083 | La moneda y/o papel no está asociada al producto
980096 | El subproducto se encuentra inhabilitado
980097 | El subproducto no se encuentra vigente
980098 | Debe ingresar un subproducto
980125 | No existen valores generales para el subproducto
980126 | El producto no está habilitado para la venta
40020006 | Contraparte no existe
40020009 | Debe ingresar número de contraparte
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
50010041 | Debe ingresar un valor válido de tipo de plazo
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
  "productGUID": "8fd31000-0027-4028-8a66-eede56e485dd",
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "capital": 40000.00,
  "plazo": 365,
  "periodicidad": 30
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
  "simulation": {
    "baseRate": 5.500000,
    "capital": 40000.00,
    "depositType": 1,
    "expirationDate": "2026-07-14",
    "firstReviewDate": "0001-01-01",
    "fixedRateRateTypeId": 0,
    "installmentCount": 2,
    "installmentPeriodicity": 30,
    "installments": {
      "sBTTDWInstallment": [
        {
          "breachDate": "0001-01-01",
          "capital": 0.00,
          "capitalTax": 0.00,
          "endDate": "2026-06-14",
          "expectedPaymentDate": "2026-06-14",
          "extendsTerm": false,
          "installmentNumber": 1,
          "installmentStatus": "V",
          "installmentType": "I",
          "installmentValue": 180.82,
          "interest": 180.82,
          "interestTax1": 37.97,
          "interestTax2": 0.00,
          "interestTax3": 0.00,
          "revenueTax": 0.00,
          "roundOff": 0.00,
          "startDate": "2026-05-15",
          "subTotal": 180.82,
          "taxes": 37.97,
          "term": 30,
          "total": 142.85,
          "type": "P"
        },
        {
          "breachDate": "0001-01-01",
          "capital": 40000.00,
          "capitalTax": 0.00,
          "endDate": "2026-07-14",
          "expectedPaymentDate": "2026-07-14",
          "extendsTerm": false,
          "installmentNumber": 2,
          "installmentStatus": "V",
          "installmentType": "I",
          "installmentValue": 40180.82,
          "interest": 180.82,
          "interestTax1": 37.97,
          "interestTax2": 0.00,
          "interestTax3": 0.00,
          "revenueTax": 0.00,
          "roundOff": 0.00,
          "startDate": "2026-06-14",
          "subTotal": 40180.82,
          "taxes": 37.97,
          "term": 30,
          "total": 40142.85,
          "type": "P"
        }
      ]
    },
    "liquidCapital": false,
    "operationExpirationDate": "2026-07-14",
    "plusRate": 0.000000,
    "plusRateRateTypeId": 0,
    "rate": 5.500000,
    "rateClassId": 1,
    "rateTypeId": 1,
    "recordsSimulation": false,
    "reviewDays": 0,
    "term": 60,
    "totalGeneral": 40285.70,
    "totalInterest": 361.64,
    "totalTaxes": 75.94,
    "totalTerm": 60,
    "valueDate": "2026-05-15"
  },
  "instructions": {
    "instruction": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-15",
    "Hora": "14:07:38",
    "Numero": 13472660,
    "Servicio": "PublicTermDeposit.simulate",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTTDWSimulation

### SdtsBTTDWSimulation

::: center
Los campos del tipo de dato estructurado SdtsBTTDWSimulation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
baseRate | Double $<(Length: 11, 6)>$ | Tasa base.
capital | Double $<(Length: 18, 2)>$ | Capital del depósito.
depositType | Byte $<(Length: 2)>$ | Tipo de depósito.
expirationDate | Date | Fecha de vencimiento.
firstReviewDate | Date | Fecha de la primera revisión de tasa.
fixedRateRateTypeId | Int $<(Length: 5)>$ | Identificador del tipo de tasa fija.
installmentCount | Int $<(Length: 5)>$ | Cantidad de cuotas.
installmentPeriodicity | Int $<(Length: 5)>$ | Periodicidad de las cuotas.
installments | [SdtsBTTDWInstallment](#sdtsbttdwinstallment) | Colección de cuotas de la simulación.
liquidCapital | Boolean | Indica si el capital es líquido.
operationExpirationDate | Date | Fecha de vencimiento de la operación.
plusRate | Double $<(Length: 11, 6)>$ | Tasa adicional (spread).
plusRateRateTypeId | Int $<(Length: 5)>$ | Identificador del tipo de tasa adicional.
rate | Double $<(Length: 11, 6)>$ | Tasa de interés.
rateClassId | Int $<(Length: 5)>$ | Identificador de la clase de tasa.
rateTypeId | Byte $<(Length: 1)>$ | Identificador del tipo de tasa.
recordsSimulation | Boolean | Indica si se deben registrar los datos de la simulación.
reviewDays | Short $<(Length: 4)>$ | Días de revisión de tasa.
term | Int $<(Length: 5)>$ | Plazo del depósito.
totalGeneral | Double $<(Length: 18, 2)>$ | Total general (capital + intereses + impuestos).
totalInterest | Double $<(Length: 18, 2)>$ | Total de intereses generados.
totalTaxes | Double $<(Length: 18, 2)>$ | Total de impuestos aplicados.
totalTerm | Int $<(Length: 5)>$ | Plazo total del depósito.
valueDate | Date | Fecha valor.
:::

::: details SdtsBTTDWInstallment

### SdtsBTTDWInstallment

::: center
Los campos del tipo de dato estructurado SdtsBTTDWInstallment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
breachDate | Date | Fecha de incumplimiento.
capital | Double $<(Length: 18, 2)>$ | Capital de la cuota.
capitalTax | Double $<(Length: 18, 2)>$ | Impuesto sobre el capital.
endDate | Date | Fecha de fin del período.
expectedPaymentDate | Date | Fecha esperada de pago.
extendsTerm | Boolean | Indica si la cuota extiende el plazo del depósito.
installmentNumber | Short $<(Length: 4)>$ | Número de cuota.
installmentStatus | Character $<(Length: 1)>$ | Estado de la cuota.
installmentType | Character $<(Length: 1)>$ | Tipo de cuota.
installmentValue | Double $<(Length: 18, 2)>$ | Valor de la cuota.
interest | Double $<(Length: 18, 2)>$ | Intereses de la cuota.
interestTax1 | Double $<(Length: 18, 2)>$ | Impuesto sobre intereses 1.
interestTax2 | Double $<(Length: 18, 2)>$ | Impuesto sobre intereses 2.
interestTax3 | Double $<(Length: 18, 2)>$ | Impuesto sobre intereses 3.
revenueTax | Double $<(Length: 18, 2)>$ | Impuesto a la renta.
roundOff | Double $<(Length: 18, 2)>$ | Diferencia de redondeo.
startDate | Date | Fecha de inicio del período.
subTotal | Double $<(Length: 18, 2)>$ | Subtotal de la cuota.
taxes | Double $<(Length: 18, 2)>$ | Total de impuestos de la cuota.
term | Int $<(Length: 5)>$ | Plazo de la cuota.
total | Double $<(Length: 18, 2)>$ | Total de la cuota.
type | Character $<(Length: 1)>$ | Tipo de movimiento (P - Pago, I - Incremento, D - Decremento).
:::
<!-- CIERRA SDT -->
