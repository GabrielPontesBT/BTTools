---
title: Save Disbursement Options In Group Loans
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para guardar las opciones de desembolso de un préstamo grupal.

**Nombre publicación:** PublicLoans.saveDisbursementOptionsInGroupLoans

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0045

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
disbursementOptionsByMember | [SdtsBTLOWDisbursementOptionByMember](#sdtsbtlowdisbursementoptionbymember) | Listado de opciones por integrante.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
120050010 | Debe ingresar el identificador de grupo.
120060120 | El grupo/ciclo ingresados no corresponden a una solicitud en trámite.
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
  "cycleId": 1,
  "disbursementOptionsByMember": [
    {
      "simulationGUID": "6bad8760-206d-4eed-ad31-845081289d22",
      "disbursementOptions": [
        {
          "disbursementId": 25,
          "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
          "savingAccountGUID": "",
          "branchId": 1,
          "currencyId": 0,
          "amount": 2000
        }
      ]
    },
    {
      "simulationGUID": "776aed72-0744-4f54-a2a1-cf4fff0746e8",
      "disbursementOptions": [
        {
          "disbursementId": 25,
          "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
          "savingAccountGUID": "",
          "branchId": 1,
          "currencyId": 0,
          "amount": 20000
        }
      ]
    },
    {
      "simulationGUID": "14257adc-63ae-4138-bc6b-f093b0ef43b2",
      "disbursementOptions": [
        {
          "disbursementId": 25,
          "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
          "savingAccountGUID": "",
          "branchId": 1,
          "currencyId": 0,
          "amount": 35000
        }
      ]
    }
  ]
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
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:10:12",
    "Numero": 13547119,
    "Servicio": "PublicLoans.saveDisbursementOptionsInGroupLoans",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWDisbursementOptionByMember

### SdtsBTLOWDisbursementOptionByMember

::: center
Los campos del tipo de dato estructurado SdtsBTLOWDisbursementOptionByMember son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
disbursementOptions | [SdtsBTLOWDisbursementOption](#sdtsbtlowdisbursementoption) | Opciones de desembolso.
simulationGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la simulación.
:::

::: details SdtsBTLOWDisbursementOption

### SdtsBTLOWDisbursementOption

::: center
Los campos del tipo de dato estructurado SdtsBTLOWDisbursementOption son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
amount | Double $<(Length: 18.2)>$ | Monto.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
disbursementId | Short $<(Length: 3)>$ | Identificador de opción de desembolso.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
:::
<!-- CIERRA SDT -->
