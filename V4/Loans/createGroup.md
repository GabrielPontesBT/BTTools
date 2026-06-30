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
groupData | [SdtsBTMGGroupLoan](#sdtsbtmggrouploan) | Datos del grupo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

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
absencePenaltyAmount | Double $<(Length: 18.2)>$ | Monto de multa por inasistencia.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
executiveId | Int $<(Length: 5)>$ | Identificador de ejecutivo.
groupName | String $<(Length: 30)>$ | Nombre de grupo.
latePenaltyAmount | Double $<(Length: 18.2)>$ | Monto de multa por tardanza.
meetingDayOfWeek | Byte $<(Length: 2)>$ | Día de reunión del grupo.
meetingDomicile | String $<(Length: 50)>$ | Domicilio de reunión del grupo.
meetingTime | String $<(Length: 5)>$ | Hora de reunión del grupo.
members | [SdtsBTMGMemberGroupLoan](#sdtsbtmgmembergrouploan) | Listado de miembros del grupo.
savingAccountExternalId | String $<(Length: 30)>$ | Identificador de cuenta de ahorro externa.
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
:::

::: details SdtsBTMGMemberGroupLoan

### SdtsBTMGMemberGroupLoan

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberGroupLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
memberTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de miembro.
:::
<!-- CIERRA SDT -->
