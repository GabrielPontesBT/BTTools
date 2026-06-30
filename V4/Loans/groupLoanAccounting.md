---
title: Group Loan Accounting
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contabilizar un préstamo grupal.

**Nombre publicación:** PublicLoans.groupLoanAccounting

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0044

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
accountingEntries | [SdtsBTMGMemberAccountingEntry](#sdtsbtmgmemberaccountingentry) | Listado de asientos por integrante.

@tab Errores

Código | Descripción
:--------- | :-----------
120050010 | Debe ingresar el identificador de grupo.
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "groupId": 32,
  "cycleId": 1
}
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "accountingEntries": [
    {
      "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
      "movementGUID": "3178b150-2010-4572-8950-23c8677fa31f"
    },
    {
      "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
      "movementGUID": "0c59f71e-1668-4d89-b891-48346c9556dc"
    },
    {
      "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
      "movementGUID": "26c038cf-5617-45c7-9d0a-1d294e377f4b"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:11:30",
    "Numero": 13547120,
    "Servicio": "PublicLoans.groupLoanAccounting",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGMemberAccountingEntry

### SdtsBTMGMemberAccountingEntry

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberAccountingEntry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de contraparte.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del asiento contable.
:::
<!-- CIERRA SDT -->
