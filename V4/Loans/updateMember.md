---
title: Update Member
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar un miembro de un grupo de créditos.

**Nombre publicación:** PublicLoans.updateMember

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0032

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
memberData | [SdtsBTMGMember](#sdtsbtmgmember) | Datos del integrante.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
40020006 | Contraparte no existe.
40030005 | Tipo de integrante incorrecto.
120050002 | Debe ingresar el GUID de contraparte.
120050010 | Debe ingresar el identificador de grupo.
120060101 | El grupo no existe.
120060113 | El tipo de integrante no existe.
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
  "groupId": 33,
  "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
  "memberData": {
    "MemberTypeId": 1
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
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:26:09",
    "Numero": 13547171,
    "Servicio": "PublicLoans.updateMember",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGMember

### SdtsBTMGMember

::: center
Los campos del tipo de dato estructurado SdtsBTMGMember son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
MemberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
:::
<!-- CIERRA SDT -->
