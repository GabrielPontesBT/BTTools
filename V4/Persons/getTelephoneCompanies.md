---
title: Get Telephone Companies
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las compañías telefónicas.

**Nombre publicación:** PublicPersons.getTelephoneCompanies

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0039

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
telephoneCompanies | [sBTPEWTelephoneCompany](#sbtpewtelephonecompany) | Listado de compañias telefónicas.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.

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
    "Requerimiento": "1",
    "Token": "0F262E85182DF86F9CA30F0E"
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
    "Requerimiento": "1",
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "telephoneCompanies": {
    "telephoneCompany": [
      {
        "id": 1,
        "description": "ANTEL"
      },
      {
        "id": 2,
        "description": "CLARO"
      },
      {
        "id": 3,
        "description": "MOVISTAR"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:37",
    "Numero": 13469345,
    "Servicio": "PublicPersons.getTelephoneCompanies",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTPEWTelephoneCompany

### sBTPEWTelephoneCompany

::: center
Los campos del tipo de dato estructurado sBTPEWTelephoneCompany son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Short | Identificador de compañía telefónica.
description | String | Descripción.
:::
<!-- CIERRA SDT -->
