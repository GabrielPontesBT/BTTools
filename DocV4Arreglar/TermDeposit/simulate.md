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
productGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital |  Double $<(length: 18.2)>$ | Importe de capital.
plazo | Int $<(length: 5)>$ | Plazo.
periodicidad | Int $<(length: 5)>$ | Periodicidad.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
simulation | [SdtsBTTDWSimulation](#sdtsbttdwsimulation) | Datos de la simulación.

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
  "instructions": {
    "instruction": []
  },
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 40050001,
        "Severity": "E",
        "Target": "",
        "Description": ""
      }
    ]
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
<!-- CIERRA SDT -->
