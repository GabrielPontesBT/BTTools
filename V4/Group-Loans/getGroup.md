---
title: Group
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la información de un grupo.

**Nombre publicación:** PublicGroupLoans.group

**Programa:** PublicAPI.BTLOPA0035

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/group
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
group | [group](#group) | Información del grupo.

@tab Errores

Código | Descripción
:--------- | :---------
120060101 | El grupo no existe
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/group?groupId=1' \
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
  "group": {
    "absencePenaltyAmount": 0,
    "branchId": 1,
    "branchDescription": "Sucursal Beta",
    "counterpartyOfDomicile": 0,
    "cycleId": 3,
    "executiveId": 1,
    "executiveDescription": "INSTALADOR",
    "groupId": 1,
    "groupName": "LAS VENDEDORAS DEL SIGLO",
    "isAccountOpenInInstitution": true,
    "isAMemberDomicile": false,
    "latePenaltyAmount": 0,
    "meetingDayOfWeek": 2,
    "meetingDomicile": "Pasaje Los Robles C14",
    "meetingDomicileCorrelative": 0,
    "meetingTime": "12:50",
    "savingAccountExternalId": "47859613645",
    "savingAccountGUID": "02dab08a-eb40-4f26-b527-64a8bd8ea2b9"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details group

### group

::: center
Los campos del tipo de dato estructurado group son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
absencePenaltyAmount | Double $<(Length: 18)>$ | Penalización por ausencia.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
branchDescription | String $<(Length: 30)>$ | Descripción de sucursal.
counterpartyOfDomicile | Int $<(Length: 9)>$ | Contraparte de domicilio.
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
executiveId | Int $<(Length: 5)>$ | Identificador de ejecutivo.
executiveDescription | String $<(Length: 30)>$ | Descripción del ejecutivo.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
groupName | String $<(Length: 30)>$ | Nombre del grupo.
isAccountOpenInInstitution | Boolean | ¿Cuenta abierta en la institución?.
isAMemberDomicile | Boolean | ¿Es el domicilio de un miembro?.
lastCycleStatusId | Byte $<(Length: 2)>$ | Estado del último ciclo.
latePenaltyAmount | Double $<(Length: 18)>$ | Penalización por tardanza.
meetingDayOfWeek | Byte $<(Length: 2)>$ | Día de reunión.
meetingDomicile | String $<(Length: 50)>$ | Domicilio de reunión.
meetingDomicileCorrelative | Short $<(Length: 3)>$ | Correlativo de domicilio de reunión.
meetingTime | String $<(Length: 5)>$ | Hora de reunión.
savingAccountExternalId | String $<(Length: 30)>$ | Cuenta de ahorro externa.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorros.
:::
<!-- CIERRA SDT -->
