---
title: Pay Member Installment
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para pagar cuotas de un grupo por miembro.

**Nombre publicación:** PublicGroupLoans.payMemberInstallment

**Programa:** PublicAPI.BTLOPA0052

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/payMemberInstallment
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
date | Date | Fecha de cobro.
memberPayments | [memberPayment](#memberpayment) | Cobros por miembro.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
members | [member](#member) | Listado de asiento por integrante.

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
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/payMemberInstallment' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": "35",
  "date": "",
  "memberPayments": {
    "memberPayment": [
      {
        "amount": "500",
        "branchId": "",
        "counterpartyGUID": "",
        "currencyId": "0",
        "loanGUID": "b9422a07-a698-4189-b6f6-5d9fa257cac0",
        "paymentId": "15",
        "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15"
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
  "members": {
    "member": [
      {
        "counterpartyGUID": "4100b799-9e33-44db-8312-6396cd2af91a",
        "loanGUID": "b9422a07-a698-4189-b6f6-5d9fa257cac0",
        "movementGUID": "543fbd4b-3ad1-4388-978b-edee17c4651e"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details member

### member

::: center
Los campos del tipo de dato estructurado member son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.
:::
<!-- CIERRA SDT -->
