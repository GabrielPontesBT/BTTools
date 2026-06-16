---
title: Get Group Loan Cycle Info
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información de un ciclo de préstamo grupal.

**Nombre publicación:** PublicLoans.getGroupLoanCycleInfo

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0043

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
offset | Long $<(length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
groupId | Int $<(length: 9)>$ | Identificador de grupo.
cycleId | Int $<(length: 9)>$ | Identificador del ciclo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
cycleInfo | [SdtsBTMGLoanGroupCycleOut](#sdtsbtmgloangroupcycleout) | Información de ciclo de crédito grupal.
groupLoanCycleMembers | [SdtsBTMGGroupLoanCycleMemberOut](#sdtsbtmggrouploancyclememberout) | Listado de integrantes del ciclo.

@tab Errores

Código | Descripción
:--------- | :-----------
120050010 | Debe ingresar el GUID de grupo.
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
  "offset": 0,
  "limit": 20,
  "groupId": 1,
  "cycleId": 3
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
  "hasNext": false,
  "cycleInfo": {
    "groupId": 1,
    "cycleId": 3,
    "totalOfCapital": 48000.0,
    "memberCount": 3,
    "expirationDate": "2027-10-30",
    "term": 110,
    "installmentAmount": 4582.0,
    "totalFinancialCost": 0.0
  },
  "groupLoanCycleMembers": [
    {
      "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
      "counterpartyName": "BENAVENTE GARCIA YADIRA",
      "memberTypeId": 3,
      "memberTypeDescription": "Integrante",
      "capital": 12600.0,
      "installmentAmount": 1309.0,
      "rate": 18.5,
      "intercycle": false,
      "simulationGUID": "7dd0aeb8-ef82-4cb7-a2e6-ced58aa3c30e",
      "movementGUID": "0103a9df-dfd3-4a7b-8068-4b23bf332d46",
      "totalFinancialCost": 0.0
    },
    {
      "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
      "counterpartyName": "FRANCELLA JUAN",
      "memberTypeId": 1,
      "memberTypeDescription": "Presidente",
      "capital": 14400.0,
      "installmentAmount": 1422.0,
      "rate": 16.6,
      "intercycle": false,
      "simulationGUID": "8b84a39e-0fd9-43ef-8b44-2143002097bf",
      "movementGUID": "e4c53f2c-f82b-4b9c-b6df-3ff3cf980dc3",
      "totalFinancialCost": 0.0
    },
    {
      "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
      "counterpartyName": "RADA RUBEN",
      "memberTypeId": 3,
      "memberTypeDescription": "Integrante",
      "capital": 21000.0,
      "installmentAmount": 1851.0,
      "rate": 20.0,
      "intercycle": false,
      "simulationGUID": "73828175-269f-4340-8b08-37ed53019a0e",
      "movementGUID": "5adbaf0e-6b7e-4669-ba6f-bbec07edd656",
      "totalFinancialCost": 0.0
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "13:37:47",
    "Numero": 13542359,
    "Servicio": "PublicLoans.getGroupLoanCycleInfo",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGLoanGroupCycleOut

### SdtsBTMGLoanGroupCycleOut

::: center
Los campos del tipo de dato estructurado SdtsBTMGLoanGroupCycleOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cycleId | Int $<(length: 9)>$ | Identificador de ciclo.
expirationDate | Date | Fecha de vencimiento.
groupId | Int $<(length: 9)>$ | Identificador del grupo.
installmentAmount | Double $<(length: 18.5)>$ | Valor cuota.
memberCount | Short $<(length: 3)>$ | Cantidad de miembros.
term | Int $<(length: 5)>$ | Plazo.
totalFinancialCost | Double $<(length: 11.2)>$ | Costo Financiero Total.
totalOfCapital | Double $<(length: 18.5)>$ | Total de capital.
:::

::: details SdtsBTMGGroupLoanCycleMemberOut

### SdtsBTMGGroupLoanCycleMemberOut

::: center
Los campos del tipo de dato estructurado SdtsBTMGGroupLoanCycleMemberOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
capital | Double $<(length: 18.5)>$ | Capital.
counterpartyGUID | String | GUID de contraparte.
counterpartyName | String $<(length: 30)>$ | Nombre de contraparte.
installmentAmount | Double $<(length: 18.5)>$ | Monto de cuota.
intercycle | Boolean | Interciclo.
memberTypeId | Byte $<(length: 2)>$ | Identificador del tipo de miembro.
memberTypeDescription | String $<(length: 30)>$ | Descripción del tipo de miembro.
movementGUID | String | GUID del asiento de desembolso.
rate | Double $<(length: 11.6)>$ | Tasa.
simulationGUID | String | GUID de simulación.
totalFinancialCost | Double $<(length: 11.6)>$ | GUID de simulación.
:::
<!-- CIERRA SDT -->
