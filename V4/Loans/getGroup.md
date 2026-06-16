---
title: Get Group
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información de un grupo.

**Nombre publicación:** PublicLoans.getGroup

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0035

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(length: 9)>$ | Identificador de grupo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
group | [SdtsBTMGGetGroupData](#sdtsbtmggetgroupdata) | Datos del grupo.

@tab Errores

Código | Descripción
:--------- | :-----------
120060101 | El grupo no existe.
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
    "Requerimiento": 1,
    "Token": "F2F0A04C9CFE9B50C05BCFB8"
  },
  "groupId": 1
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
    "Device": "",
    "Requerimiento": 1,
    "Token": "37E3E6C528B76F7D36652FF5"
  },
  "group": {
    "groupId": 1,
    "groupName": "LAS VENDEDORAS DEL SIGLO",
    "branchId": 1,
    "branchDescription": "Sucursal Beta",
    "executiveId": 1,
    "executiveDescription": "INSTALADOR",
    "isAMemberDomicile": false,
    "meetingDomicile": "Pasaje Los Robles C14",
    "counterpartyOfDomicile": 0,
    "meetingDomicileCorrelative": 0,
    "meetingDayOfWeek": 2,
    "meetingTime": "12:50",
    "latePenaltyAmount": 0,
    "absencePenaltyAmount": 0,
    "isAccountOpenInInstitution": true,
    "savingAccountGUID": "02dab08a-eb40-4f26-b527-64a8bd8ea2b9",
    "savingAccountExternalId": "47859613645",
    "cycleId": 3
  },
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "13:31:35",
    "Numero": 13541963,
    "Servicio": "PublicLoans.getGroup",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGGetGroupData

### SdtsBTMGGetGroupData

::: center
Los campos del tipo de dato estructurado SdtsBTMGGetGroupData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
absencePenaltyAmount | Double $<(length: 18)>$ | Penalización por ausencia.
branchId | Int $<(length: 5)>$ | Identificador de sucursal.
branchDescription | String $<(length: 30)>$ | Descripción de sucursal.
counterpartyOfDomicile | Int $<(length: 9)>$ | Contraparte de domicilio.
cycleId | Int $<(length: 9)>$ | Identificador de ciclo.
executiveId | Int $<(length: 5)>$ | Identificador de ejecutivo.
executiveDescription | String $<(length: 30)>$ | Descripción del ejecutivo.
groupId | Int $<(length: 9)>$ | Identificador del grupo.
groupName | String $<(length: 30)>$ | Nombre del grupo.
isAccountOpenInInstitution | Boolean | ¿Cuenta abierta en la institución?.
isAMemberDomicile | Boolean | ¿Es el domicilio de un miembro?.
latePenaltyAmount | Double $<(length: 18)>$ | Penalización por tardanza.
meetingDayOfWeek | Byte $<(length: 2)>$ | Día de reunión.
meetingDomicile | String $<(length: 50)>$ | Domicilio de reunión.
meetingDomicileCorrelative | Short $<(length: 3)>$ | Correlativo de domicilio de reunión.
meetingTime | String $<(length: 5)>$ | Hora de reunión.
savingAccountExternalId | String $<(length: 30)>$ | Cuenta de ahorro externa.
savingAccountGUID | String | GUID de cuenta de ahorro.
:::
<!-- CIERRA SDT -->
