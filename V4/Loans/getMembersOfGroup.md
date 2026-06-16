---
title: Get Members Of Group
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los integrantes de un grupo.

**Nombre publicación:** PublicLoans.getMembersOfGroup

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0037

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
offset | Long $<(length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
groupId | Int $<(length: 9)>$ | Identificador de grupo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
membersData | [SdtsBTMGMemberData](#sdtsbtmgmemberdata) | Listado de integrantes.

@tab Errores

Código | Descripción
:--------- | :-----------
120050010 | Debe ingresar el identificador de grupo.
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "offset": 0,
  "limit": 10,
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
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "hasNext": false,
  "membersData": [
    {
      "counterpartyName": "BENAVENTE GARCIA YADIRA",
      "memberTypeId": 3,
      "memberTypeDescription": "Integrante",
      "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
      "countryId": 604,
      "countryDescription": "Perú",
      "documentTypeId": 11,
      "documentTypeDescription": "D.N.I.",
      "documentNumber": "71336785",
      "personName": "BENAVENTE GARCIA YADIRA",
      "personGUID": "4a47ca9e-fb87-4555-8f3d-0cca5758cc9e",
      "cycleIdOfMember": 1
    },
    {
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
      "cycleIdOfMember": 2
    },
    {
      "counterpartyName": "RADA RUBEN",
      "memberTypeId": 3,
      "memberTypeDescription": "Integrante",
      "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
      "countryId": 604,
      "countryDescription": "Perú",
      "documentTypeId": 11,
      "documentTypeDescription": "D.N.I.",
      "documentNumber": "57764531",
      "personName": "RADA RUBEN",
      "personGUID": "203e39e2-081b-45ea-87ee-0235d3f3eca7",
      "cycleIdOfMember": 1
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "14:25:44",
    "Numero": 13543381,
    "Servicio": "PublicLoans.getMembersOfGroup",
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
