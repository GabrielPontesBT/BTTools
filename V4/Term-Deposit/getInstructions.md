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
termDepositGUID | String $<(Length: 36)>$ | GUID (identificador único global) del depósito a plazo.

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
| 90031 | El código contable no existe |
| 90120 | Cuenta contable no tiene tipo |
| 90121 | Cuenta contable no puede ser 0 |
| 90132 | No existe un asiento relacionado a los datos ingresados |
| 90142 | No existe registro de saldo |
| 90161 | La fecha de contabilización del asiento a anular es mayor a la fecha de apertura |
| 110005 | El prefijo del identificador del atributo debe indicar un tipo de valor válido |
| 180006 | No existe registro pagos para la operación ingresada |
| 180069 | La fecha de consulta es menor a la fecha valor de la operación |
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
<!-- CIERRA SDT -->
