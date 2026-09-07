---
title: Save Disbursement Options
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para guardar las opciones de desembolso de un préstamo grupal.

**Nombre publicación:** PublicGroupLoans.saveDisbursementOptions

**Programa:** PublicAPI.BTLOPA0045

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/saveDisbursementOptions
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
disbursementOptionsByMember | [disbursementOptionByMember](#disbursementoptionbymember) | Listado de opciones de desembolso por integrante.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
120050010 | Debe ingresar el GUID de grupo.
120060120	El grupo/ciclo ingresados no corresponden a una solicitud en trámite.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/saveDisbursementOptions' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 32,
  "cycleId": 1,
  "disbursementOptionsByMember": {
    "disbursementOptionByMember": [
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
}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->