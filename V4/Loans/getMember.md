---
title: Get Member
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información del miembro de un grupo de créditos.

**Nombre publicación:** PublicLoans.getMember

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0036

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(length: 9)>$ | Identificador de grupo.
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
member | [SdtsBTMGMemberData](#sdtsbtmgmemberdata) | Información del integrante.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
120050002 | Debe ingresar el GUID de contraparte.
120050010 | Debe ingresar el GUID de grupo.
120060101 | El grupo no existe.
120060118 | El integrante no existe.
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
  "groupId": 1,
  "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960"
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
  "member": {
    "counterpartyName": "FRANCELLA JUAN",
    "memberTypeId": 1,
    "memberTypeDescription": "Presidente",
    "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
    "countryId": 604,
    "countryDescription": "Perú",
    "documentTypeId": 11,
    "documentTypeDescription": "D.N.I.",
    "documentNumber": "56643156",
    "personName": "FRANCELLA JUAN",
    "personGUID": "c0d89ffe-d515-4818-8224-fe8395eab960",
    "cycleIdOfMember": 0
  },
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "14:34:08",
    "Numero": 13543657,
    "Servicio": "PublicLoans.getMember",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGMemberData

### SdtsBTMGMemberData

::: center
Los campos del tipo de dato estructurado SdtsBTMGMemberData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String | GUID de contraparte.
counterpartyName | String $<(length: 70)>$ | Nombre de contraparte.
countryId | Short $<(length: 4)>$ | Identificador del país.
countryDescription | String $<(length: 30)>$ | Descripción del país.
cycleIdOfMember | Int $<(length: 9)>$ | Ciclo del miembro en el grupo.
documentNumber | String $<(length: 25)>$ | Número de documento.
documentTypeId | Short $<(length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(length: 30)>$ | Descripción del tipo de documento.
memberTypeId | Byte $<(length: 2)>$ | Identificador del tipo de miembro.
memberTypeDescription | String $<(length: 40)>$ | Descripción del tipo de miembro.
personGUID | String | GUID de persona.
personName | String $<(length: 70)>$ | Nombre de persona.
:::
<!-- CIERRA SDT -->
