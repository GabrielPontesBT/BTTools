---
title: Create Group
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para crear un grupo.

**Nombre publicación:** PublicLoans.createGroup

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0030

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
groupData | [SdtsBTMGGroupLoan](#sdtsbtmggrouploan) | Información del grupo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(length: 9)>$ | Identificador de grupo.

@tab Errores

Código | Descripción
:--------- | :-----------
40020006 | Contraparte no existe.
40020012 | El número de contraparte no existe.
40020020 | Código de ejecutivo Incorrecto.
40030005 | Tipo de integrante incorrecto.
120050002 | Debe ingresar el GUID de contraparte.
120060103 | El día de reunión ingresado es incorrecto.
120060106 | Debe ingresar la dirección del domicilio de reunión.
120060107 | Debe indicar el integrante para el domicilio de reunión.
120060108 | La hora de reunión ingresada es incorrecta.
120060109 | Debe ingresar la cuenta de ahorros para el monto mínimo de ahorro.
120060110 | El número de integrantes del grupo es mayor al permitido.
120060111 | La hora de reunión indicada no cumple con el formato esperado (HH:MM).
120060112 | Debe ingresar el nombre del grupo.
120060113 | El tipo de integrante no existe.
120060115 | Se ingresó el integrante [Número de integrante] más de una vez.
120060122 | El estado de la contraparte es inválido.
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
  "groupData": {
    "executiveId": 2,
    "latePenaltyAmount": 500,
    "meetingTime": "15:00",
    "branchId": 1,
    "members": [
      {
        "memberTypeId": 1,
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960"
      },
      {
        "memberTypeId": 3,
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f"
      }
    ],
    "savingAccountGUID": "",
    "absencePenaltyAmount": 250,
    "meetingDayOfWeek": 2,
    "meetingDomicile": "AV. ITALIA 1212",
    "savingAccountExternalId": "",
    "groupName": "GRUPO COOPERACION"
  }
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
  "groupId": 32,
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "15:27:31",
    "Numero": 13544537,
    "Servicio": "PublicLoans.createGroup",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGGroupLoan

### SdtsBTMGGroupLoan

::: center
Los campos del tipo de dato estructurado SdtsBTMGGroupLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
absencePenaltyAmount | Double $<(length: 18.2)>$ | Multa por inasistencia.
branchId | Int $<(length: 5)>$ | Id de sucursal.
executiveId | Int $<(length: 5)>$ | Id de ejecutivo.
groupName | String $<(length: 30)>$ | Nombre de grupo.
latePenaltyAmount | Double $<(length: 18.2)>$ | Multa por tardanza.
meetingDayOfWeek | Byte $<(length: 2)>$ | Día de semana de reunión.
meetingDomicile | String $<(length: 50)>$ | Domicilio de reunión.
meetingTime | String $<(length: 5)>$ | Hora de reunión.
members | [SdtsBTMGMemberGroupLoan](#sdtsbtmgmembergrouploan) | Miembros.
savingAccountExternalId | String $<(length: 30)>$ | Identificador de cuenta de ahorro externa.
savingAccountGUID | String $<(length: 36)>$ | GUID de la cuenta de ahorro.
:::

::: details SdtsBTMGMemberGroupLoan

### SdtsBTMGMemberGroupLoan

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberGroupLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.
memberTypeId | Byte $<(length: 2)>$ | Identificador de tipo de miembro.
:::
<!-- CIERRA SDT -->
