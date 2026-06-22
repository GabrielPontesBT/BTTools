---
title: Get Group Loan Cycle Info
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información de un ciclo de crédito grupal

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
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | Indica si existen más páginas disponibles.
cycleInfo | [SdtsBTMGLoanGroupCycleOut](#sdtsbtmgloangroupcycleout) | Información del ciclo de crédito grupal.
groupLoanCycleMembers | [SdtsBTMGGroupLoanCycleMemberOut](#sdtsbtmggrouploancyclememberout) | Listado de integrantes del ciclo.

@tab Errores

No aplica.

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
    "Token": "FEA6099887C1B4D7C79A7DE0"
  },
  "offset": "0",
  "limit": "15",
  "groupId": "33",
  "cycleId": "1"
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
    "Token": "FEA6099887C1B4D7C79A7DE0"
  },
  "hasNext": false,
  "cycleInfo": {
    "groupId": 33,
    "cycleId": 1,
    "totalOfCapital": "21000.00000",
    "memberCount": 3,
    "expirationDate": "2027-11-09",
    "term": 109,
    "installmentAmount": "1410.00000",
    "totalFinancialCost": "56.16",
    "rate": "20.00"
  },
  "groupLoanCycleMembers": {
    "groupLoanCycleMember": [
      {
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
        "counterpartyName": "FRANCELLA  JUAN",
        "memberTypeId": 1,
        "memberTypeDescription": "Presidente",
        "capital": "7000.00000",
        "installmentAmount": "470.00000",
        "rate": "20.000000",
        "intercycle": false,
        "simulationGUID": "ec26be68-2364-4686-95cf-4919210c2d80",
        "movementGUID": "bb325d6e-e5dc-456b-ba19-1e6d263b781b",
        "totalFinancialCost": "56.160000",
        "disbursementAmount": "0.00",
        "loanGUID": "c3681d33-10e9-4f4e-b4fc-026975b8822f"
      },
      {
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
        "counterpartyName": "RADA  RUBEN",
        "memberTypeId": 1,
        "memberTypeDescription": "Presidente",
        "capital": "7000.00000",
        "installmentAmount": "470.00000",
        "rate": "20.000000",
        "intercycle": false,
        "simulationGUID": "7c499851-502f-43ff-8c32-0e7bc20150c6",
        "movementGUID": "4a1877a0-4141-474d-bd5a-d45f22749a62",
        "totalFinancialCost": "56.160000",
        "disbursementAmount": "0.00",
        "loanGUID": "9a7ffde0-71e7-4409-8c20-b5db01504254"
      },
      {
        "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
        "counterpartyName": "BENAVIDES JUAREZ ROXANA",
        "memberTypeId": 3,
        "memberTypeDescription": "Integrante",
        "capital": "7000.00000",
        "installmentAmount": "470.00000",
        "rate": "20.000000",
        "intercycle": false,
        "simulationGUID": "8ee44f5f-60af-4b60-9493-37364705065a",
        "movementGUID": "73de4f6f-5b17-4337-9092-8f529b77b887",
        "totalFinancialCost": "56.160000",
        "disbursementAmount": "0.00",
        "loanGUID": "bfcf4446-d73a-4edd-a94b-ed3d152be591"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:38:50",
    "Numero": 13584972,
    "Servicio": "PublicLoans.getGroupLoanCycleInfo",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
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
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
expirationDate | Date | Fecha de vencimiento.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
installmentAmount | Double $<(Length: 18.5)>$ | Monto de cuota.
memberCount | Short $<(Length: 3)>$ | Cantidad de miembros.
rate | Double $<(Length: 11.2)>$ | Tasa.
term | Int $<(Length: 5)>$ | Plazo.
totalFinancialCost | Double $<(Length: 11.2)>$ | Costo financiero total.
totalOfCapital | Double $<(Length: 18.5)>$ | Total de capital.
:::

::: details SdtsBTMGGroupLoanCycleMemberOut

### SdtsBTMGGroupLoanCycleMemberOut

::: center
Los campos del tipo de dato estructurado SdtsBTMGGroupLoanCycleMemberOut son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
capital | Double $<(Length: 18.5)>$ | Capital.
counterpartyGUID | String | GUID (identificador único global) de la contraparte.
counterpartyName | String $<(Length: 30)>$ | Nombre de contraparte.
disbursementAmount | Double $<(Length: 18.2)>$ | Monto de desembolso.
installmentAmount | Double $<(Length: 18.5)>$ | Monto de cuota.
intercycle | Boolean | Interciclo.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
memberTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de miembro.
movementGUID | String | GUID (identificador único global) del movimiento.
rate | Double $<(Length: 11.6)>$ | Tasa.
simulationGUID | String | GUID (identificador único global) de la simulación.
totalFinancialCost | Double $<(Length: 11.6)>$ | Costo financiero total.
:::
<!-- CIERRA SDT -->
