---
title: Cycle Info
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la información de un ciclo de préstamo grupal.

**Nombre publicación:** PublicGroupLoans.cycleInfo

**Programa:** PublicAPI.BTLOPA0043

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/cycleInfo
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | Indica si existen más páginas disponibles.
cycleInfo | [cycleInfo](#cycleinfo) | Información del ciclo de crédito grupal.
groupLoanCycleMembers | [groupLoanCycleMember](#grouploancyclemember) | Listado de integrantes del ciclo.

@tab Errores

Código | Descripción
:--------- | :---------
120050010 | Debe ingresar el GUID de grupo.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/cycleInfo?offset=0&limit=15&groupId=33&cycleId=1' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "hasNext": false,
  "cycleInfo": {
    "cycleId": 1,
    "expirationDate": "2027-11-09",
    "groupId": 33,
    "installmentAmount": "1410.00000",
    "memberCount": 3,
    "rate": "20.00",
    "term": 109,
    "totalFinancialCost": "56.16",
    "totalOfCapital": "21000.00000"
  },
  "groupLoanCycleMembers": {
    "groupLoanCycleMember": [
      {
        "capital": "7000.00000",
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
        "counterpartyName": "FRANCELLA  JUAN",
        "disbursementAmount": "0.00",
        "installmentAmount": "470.00000",
        "intercycle": false,
        "loanGUID": "c3681d33-10e9-4f4e-b4fc-026975b8822f",
        "memberTypeId": 1,
        "memberTypeDescription": "Presidente",
        "movementGUID": "bb325d6e-e5dc-456b-ba19-1e6d263b781b",
        "rate": "20.000000",
        "simulationGUID": "ec26be68-2364-4686-95cf-4919210c2d80",
        "totalFinancialCost": "56.160000"
      },
      {
        "capital": "7000.00000",
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
        "counterpartyName": "RADA  RUBEN",
        "disbursementAmount": "0.00",
        "installmentAmount": "470.00000",
        "intercycle": false,
        "loanGUID": "9a7ffde0-71e7-4409-8c20-b5db01504254",
        "memberTypeId": 1,
        "memberTypeDescription": "Presidente",
        "movementGUID": "4a1877a0-4141-474d-bd5a-d45f22749a62",
        "rate": "20.000000",
        "simulationGUID": "7c499851-502f-43ff-8c32-0e7bc20150c6",
        "totalFinancialCost": "56.160000"
      },
      {
        "capital": "7000.00000",
        "counterpartyGUID": "b37c32b0-d455-4c91-9ff0-ce00638906d3",
        "counterpartyName": "BENAVIDES JUAREZ ROXANA",
        "disbursementAmount": "0.00",
        "installmentAmount": "470.00000",
        "intercycle": false,
        "loanGUID": "bfcf4446-d73a-4edd-a94b-ed3d152be591",
        "memberTypeId": 3,
        "memberTypeDescription": "Integrante",
        "movementGUID": "73de4f6f-5b17-4337-9092-8f529b77b887",
        "rate": "20.000000",
        "simulationGUID": "8ee44f5f-60af-4b60-9493-37364705065a",
        "totalFinancialCost": "56.160000"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details cycleInfo

### cycleInfo

::: center
Los campos del tipo de dato estructurado cycleInfo son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amortizationType | Byte $<(Length: 2)>$ | Tipo de amortización.
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
expirationDate | Date | Fecha de vencimiento.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
installmentAmount | Double $<(Length: 18)>$ | Valor cuota.
installmentPeriodicity | Int $<(Length: 5)>$ | Periodo entre cuotas.
memberCount | Short $<(Length: 3)>$ | Cantidad de miembros.
numberOfInstallments | Int $<(Length: 5)>$ | Número de cuotas.
productGUID | String $<(Length: 36)>$ | Identificador único global (GUID) del producto.
rate | Double $<(Length: 11)>$ | Tasa.
rateType | Byte $<(Length: 1)>$ | Tipo de tasa.
term | Int $<(Length: 5)>$ | Plazo.
totalFinancialCost | Double $<(Length: 11)>$ | Costo Financiero Total.
totalOfCapital | Double $<(Length: 18)>$ | Total de capital.
:::

::: details groupLoanCycleMember

### groupLoanCycleMember

::: center
Los campos del tipo de dato estructurado groupLoanCycleMember son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
capital | Double $<(Length: 18.5)>$ | Capital.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
counterpartyName | String $<(Length: 30)>$ | Nombre de contraparte.
debt | Double $<(Length: 18.2)>$ | Deuda.
disbursementAmount | Double $<(Length: 18.2)>$ | Monto de desembolso.
installmentAmount | Double $<(Length: 18.5)>$ | Monto de cuota.
intercycle | Boolean | Interciclo.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
memberTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de miembro.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.
rate | Double $<(Length: 11.6)>$ | Tasa.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.
totalFinancialCost | Double $<(Length: 11.6)>$ | Costo financiero total.
:::
<!-- CIERRA SDT -->
