---
title: Add Intercycle Member
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para agregar un integrante como interciclo.

**Nombre publicación:** PublicGroupLoans.addIntercycleMember

**Programa:** PublicAPI.BTLOPA0048

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/addIntercycleMember
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
memberSimulationInput | [memberSimulationInput](#membersimulationinput) | Datos de entrada para simular un integrante.
keepInsurancesFees | Boolean | Indica si se mantienen los seguros del preseteo.
insurancesInput | [insuranceInput](#insuranceinput) | Listado de seguros de entrada para la simulación.
disbursementOptions | [disbursementOption](#disbursementoption) | Listado de opciones de desembolso.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
accountingEntry | [accountingEntry](#accountingentry) | Asiento de desembolso.

@tab Errores

Código | Descripción
:--------- | :---------
120050002 | Debe ingresar el GUID de contraparte.
120050010 | Debe ingresar el GUID de grupo.
120060127 | El grupo/ciclo no existe
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/addIntercycleMember' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": "70",
  "memberSimulationInput": {
    "counterpartyGUID": "0b4dc6b9-388c-44b9-b637-a03f66111fb3",
    "disbursementDate": "2027-07-30",
    "firstPaymentDate": "2027-08-30",
    "memberTypeId": "3",
    "rate": "15",
    "requestedLoanAmount": "7500"
  },
  "keepInsurancesFees": "false",
  "insurancesInput": {
    "insuranceInput": [
      {
        "amount": "5",
        "commercialValue": "",
        "extraPremium": "",
        "insuranceId": "1",
        "percentage": "0.05",
        "policyEndDate": "",
        "policyNumber": "",
        "policyStartDate": ""
      }
    ]
  },
  "disbursementOptions": {
    "disbursementOption": [
      {
        "amount": "7500",
        "branchId": "1",
        "counterpartyGUID": "0b4dc6b9-388c-44b9-b637-a03f66111fb3",
        "currencyId": "0",
        "disbursementId": "25",
        "savingAccountGUID": ""
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
{
  "accountingEntry": {
    "counterpartyGUID": "0b4dc6b9-388c-44b9-b637-a03f66111fb3",
    "loanGUID": "a157764e-8d23-44a9-8fa6-9392608c9e4d",
    "movementGUID": "c35e28db-0fcd-451e-9cfd-e4b24791662a"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details memberSimulationInput

### memberSimulationInput

::: center
Los campos del tipo de dato estructurado memberSimulationInput son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
disbursementDate | Date | Fecha de desembolso.
firstPaymentDate | Date | Fecha del primer pago.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
rate | Double $<(Length: 11.6)>$ | Tasa.
requestedLoanAmount | Double $<(Length: 18.2)>$ | Monto de préstamo solicitado.
:::

::: details insuranceInput

### insuranceInput

::: center
Los campos del tipo de dato estructurado insuranceInput son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
amount | Double $<(Length: 18.2)>$ | Monto del seguro.
commercialValue | Double $<(Length: 18.2)>$ | Valor comercial.
extraPremium | Double $<(Length: 11.6)>$ | Prima adicional.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
percentage | Double $<(Length: 11.6)>$ | Porcentaje.
policyEndDate | Date | Fecha de fin de póliza.
policyNumber | String $<(Length: 20)>$ | Número de póliza.
policyStartDate | Date | Fecha de inicio de póliza.
:::

::: details accountingEntry

### accountingEntry

::: center
Los campos del tipo de dato estructurado accountingEntry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.
:::
<!-- CIERRA SDT -->
