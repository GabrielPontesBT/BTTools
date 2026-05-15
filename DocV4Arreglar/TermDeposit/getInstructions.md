---
title: Get Instructions
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener las instrucciones de un depósito a plazo.

**Nombre publicación:** PublicTermDeposit.getInstructions

**Módulo:** TermDeposit

**Programa:** PublicAPI.BTTDPA0004

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
instructions | [SdtsBTTDWInstruction](#sdtsbttdwinstruction) | Listado de instrucciones.

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
  "instructions": {
    "instruction": [
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
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-15",
    "Hora": "14:07:38",
    "Numero": 13472660,
    "Servicio": "PublicTermDeposit.getInstructions",
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
