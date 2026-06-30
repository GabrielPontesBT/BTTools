---
title: Get Member Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los tipos de miembro que pueden conformar un grupo de créditos.

**Nombre publicación:** PublicLoans.getMemberTypes

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0038

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
memberTypes | [SdtsBTMGGroupMemberType](#sdtsbtmggroupmembertype) | Listado de tipos de integrantes de un grupo de créditos.

@tab Errores

No aplica.

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
  "memberTypes": [
    {
      "id": 1,
      "description": "Presidente"
    },
    {
      "id": 2,
      "description": "Tesorero"
    },
    {
      "id": 3,
      "description": "Integrante"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "13:50:43",
    "Numero": 13542419,
    "Servicio": "PublicLoans.getMemberTypes",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTMGGroupMemberType

### SdtsBTMGGroupMemberType

::: center
Los campos del tipo de dato estructurado SdtsBTMGGroupMemberType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Byte $<(Length: 2)>$ | Identificador de tipo de miembro.
description | String $<(Length: 40)>$ | Descripción de tipo de miembro.
:::
<!-- CIERRA SDT -->
