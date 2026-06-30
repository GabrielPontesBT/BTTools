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
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

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
absencePenaltyAmount | Double $<(Length: 18)>$ | Monto de multa por ausencia.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
branchDescription | String $<(Length: 30)>$ | Descripción de sucursal.
counterpartyOfDomicile | Int $<(Length: 9)>$ | Identificador de contraparte del domicilio.
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
executiveId | Int $<(Length: 5)>$ | Identificador de ejecutivo.
executiveDescription | String $<(Length: 30)>$ | Descripción del ejecutivo.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
groupName | String $<(Length: 30)>$ | Nombre del grupo.
isAccountOpenInInstitution | Boolean | ¿Cuenta abierta en la institución?.
isAMemberDomicile | Boolean | ¿Es el domicilio de un miembro?.
latePenaltyAmount | Double $<(Length: 18)>$ | Monto de multa por tardanza.
meetingDayOfWeek | Byte $<(Length: 2)>$ | Día de reunión del grupo.
meetingDomicile | String $<(Length: 50)>$ | Domicilio de reunión del grupo.
meetingDomicileCorrelative | Short $<(Length: 3)>$ | Correlativo de domicilio de reunión.
meetingTime | String $<(Length: 5)>$ | Hora de reunión del grupo.
savingAccountExternalId | String $<(Length: 30)>$ | Identificador de cuenta de ahorro externa.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de cuenta de ahorro.
:::
<!-- CIERRA SDT -->
