---
title: Get Contact Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los tipos de contacto.

**Nombre publicación:** PublicPersons.getContactTypes

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0040

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
contactTypes | [sBTPEContactTypes](#sbtpecontacttypes) | Listado de tipos de contacto.

@tab Errores

Código | Descripción
:--------- | :-----------
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
  "contactTypes": {
    "contactType": [
      {
        "id": 1,
        "description": "TELEFONO MÓVIL",
        "requiresTelephoneCompany": true
      },
      {
        "id": 2,
        "description": "TELEFONO FIJO",
        "requiresTelephoneCompany": false
      },
      {
        "id": 3,
        "description": "CORREO ELECTRÓNICO",
        "requiresTelephoneCompany": false
      },
      {
        "id": 4,
        "description": "X",
        "requiresTelephoneCompany": false
      },
      {
        "id": 5,
        "description": "INSTAGRAM",
        "requiresTelephoneCompany": false
      },
      {
        "id": 6,
        "description": "WHATSAPP",
        "requiresTelephoneCompany": false
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:17",
    "Numero": 13469335,
    "Servicio": "PublicPersons.getContactTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTPEContactTypes

### sBTPEContactTypes

::: center
Los campos del tipo de dato estructurado sBTPEContactTypes son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Byte $<(Length: 2)>$ | Identificador de tipo de contacto.
description | String $<(Length: 50)>$ | Descripción.
requiresTelephoneCompany | Boolean | Requiere compañía telefónica?.
:::
<!-- CIERRA SDT -->
