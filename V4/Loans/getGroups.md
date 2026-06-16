---
title: Get Groups
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los grupos de créditos existentes.

**Nombre publicación:** PublicLoans.getGroups

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0034

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
name | String $<(length: 30)>$ | Nombre del grupo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
groups | [SdtsBTMGGetGroupsData](#sdtsbtmggetgroupsdata) | Listado de grupos.

@tab Errores

No aplica.

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
  "limit": 5,
  "groupId": "",
  "name": ""
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
  "hasNext": true,
  "groups": [
    {
      "groupId": 1,
      "groupName": "LAS VENDEDORAS DEL SIGLO",
      "status": 0,
      "cycleId": 3,
      "statusDescription": "Normal"
    },
    {
      "groupId": 2,
      "groupName": "LAS VENDEDORAS DEL SIGLO XX1",
      "status": 0,
      "cycleId": 1,
      "statusDescription": "Normal"
    },
    {
      "groupId": 3,
      "groupName": "LAS VENDEDORAS DEL SIGLO 20",
      "status": 0,
      "cycleId": 0,
      "statusDescription": "Normal"
    },
    {
      "groupId": 4,
      "groupName": "JUNTAS PODEMOS",
      "status": 0,
      "cycleId": 0,
      "statusDescription": "Normal"
    },
    {
      "groupId": 5,
      "groupName": "JUNTAS PODEMOS",
      "status": 0,
      "cycleId": 0,
      "statusDescription": "Normal"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "13:42:09",
    "Numero": 13542406,
    "Servicio": "PublicLoans.getGroups",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGGetGroupsData

### SdtsBTMGGetGroupsData

::: center
Los campos del tipo de dato estructurado SdtsBTMGGetGroupsData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cycleId | Int $<(length: 9)>$ | Identificador de ciclo.
groupId | Int $<(length: 9)>$ | Identificador del grupo.
groupName | String $<(length: 30)>$ | Nombre del grupo.
status | Byte $<(length: 2)>$ | Estado.
statusDescription | String $<(length: 40)>$ | Descripción del estado.
:::
<!-- CIERRA SDT -->
