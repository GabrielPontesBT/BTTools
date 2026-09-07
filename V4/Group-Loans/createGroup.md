---
title: Create Group
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para crear un grupo.

**Nombre publicación:** PublicGroupLoans.createGroup

**Programa:** PublicAPI.BTLOPA0030

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/createGroup
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupData | [groupData](#groupdata) | Información del grupo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

@tab Errores

Código | Descripción
:--------- | :---------
40020006	| Contraparte no existe.
40020012	| El número de contraparte no existe.
40020020	| Código de ejecutivo Incorrecto.
40030005	| Tipo de integrante incorrecto.
120050002	| Debe ingresar el GUID de contraparte.
120060103	| El día de reunión ingresado es incorrecto.
120060106	| Debe ingresar la dirección del domicilio de reunión.
120060107	| Debe indicar el integrante para el domicilio de reunión.
120060108	| La hora de reunión ingresada es incorrecta.
120060109	| Debe ingresar la cuenta de ahorros para el monto mínimo de ahorro.
120060110	| El número de integrantes del grupo es mayor al permitido.
120060111	| La hora de reunión indicada no cumple con el formato esperado (HH:MM).
120060112	| Debe ingresar el nombre del grupo.
120060113	| El tipo de integrante no existe.
120060115	| Se ingresó el integrante [Número de integrante] más de una vez.
120060122	| El estado de la contraparte es inválido.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/createGroup' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupData": {
    "absencePenaltyAmount": 250,
    "branchId": 1,
    "executiveId": 2,
    "groupName": "GRUPO COOPERACION",
    "latePenaltyAmount": 500,
    "meetingDayOfWeek": 2,
    "meetingDomicile": "AV. ITALIA 1212",
    "meetingTime": "15:00",
    "members": {
      "member": [
        {
          "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
          "memberTypeId": 1
        },
        {
          "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
          "memberTypeId": 3
        }
      ]
    },
    "savingAccountExternalId": "",
    "savingAccountGUID": ""
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
  "groupId": 32
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details groupData

### groupData

::: center
Los campos del tipo de dato estructurado groupData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
absencePenaltyAmount | Double $<(Length: 18.2)>$ | Penalización por ausencia.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
executiveId | Int $<(Length: 5)>$ | Identificador de ejecutivo.
groupName | String $<(Length: 30)>$ | Nombre del grupo.
latePenaltyAmount | Double $<(Length: 18.2)>$ | Penalización por tardanza.
meetingDayOfWeek | Byte $<(Length: 2)>$ | Día de reunión.
meetingDomicile | String $<(Length: 50)>$ | Domicilio de reunión.
meetingTime | String $<(Length: 5)>$ | Hora de reunión.
members | [member](#member) | Integrantes.
savingAccountExternalId | String $<(Length: 30)>$ | Cuenta de ahorro externa.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorros.
:::

::: details member

### member

::: center
Los campos del tipo de dato estructurado member son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
:::
<!-- CIERRA SDT -->
