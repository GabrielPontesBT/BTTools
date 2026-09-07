---
title: Pay Installment
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para pagar cuotas de un grupo.

**Nombre publicación:** PublicGroupLoans.payInstallment

**Programa:** PublicAPI.BTLOPA0051

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/payInstallment
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
date | Date | Fecha de pago.
paymentOption | [paymentOption](#paymentoption) | Forma de cobro.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
members | [member](#member) | Listado de asiento por integrante.

@tab Errores

Código | Descripción
:--------- | :---------
120050010 | Debe ingresar el GUID de grupo.
120060131 | El importe a pagar no coincide con alguna cuota del grupo
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/payInstallment' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 12,
  "date": "",
  "paymentOption": {
    "branchId": 1,
    "amount": 4608.02,
    "savingAccountGUID": "95f6c6fb-6028-4ec5-b6c5-41612225ae15",
    "paymentId": 15,
    "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
    "currencyId": 0
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
        "counterpartyGUID": "a6e25e76-c448-4b28-9231-978611764c27",
        "loanGUID": "798cd979-1763-4113-a58a-0eb8e467f4fb",
        "movementGUID": "d7be1959-df05-4cce-804e-9e3e75530142"
      },
      {
        "counterpartyGUID": "c5d5ac06-dae6-445f-8d4e-0c6d9cd86a61",
        "loanGUID": "d058c6a1-259e-4c5b-84cd-8ac26b7b3b4a",
        "movementGUID": "7fbd19b2-610c-454c-ab52-5bcbef9cc1a4"
      },
      {
        "counterpartyGUID": "13bbff6b-2a97-4463-bcd9-68c427f60237",
        "loanGUID": "cac2a75d-3261-49f6-ad8a-81c949cab573",
        "movementGUID": "badb7b6b-1d47-4947-a936-80bb9b15dfad"
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
