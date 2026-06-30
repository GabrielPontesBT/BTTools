---
title: Add Member
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para agregar un integrante a un grupo de créditos.

**Nombre publicación:** PublicLoans.addMember

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0031

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
memberData | [SdtsBTMGMember](#sdtsbtmgmember) | Datos del integrante de grupo.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
120050002 | Debe ingresar el GUID de contraparte.
120050010 | Debe ingresar el identificador de grupo.
120060101 | El grupo no existe.
120060110 | El número de integrantes del grupo es mayor al permitido.
120060115 | Se ingresó el integrante [Número de integrante] más de una vez.
120060122 | El estado de la contraparte es inválido.
120060126 | No existe configuración para el ciclo.
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
  "groupId": 127,
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "memberData": {
    "MemberTypeId": 3
  }
}'
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
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "F2F0A04C9CFE9B50C05BCFB8"
  },
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "12:14:34",
    "Numero": 13601033,
    "Servicio": "PublicLoans.addMember",
    "Requerimiento": 1,
    "Canal": "BTDIGITAL"
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
