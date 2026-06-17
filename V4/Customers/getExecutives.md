---
title: Get Executives
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de ejecutivos.

**Nombre publicación:** PublicCustomers.getExecutives

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0026

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
executiveDescriptionFilter | String $<(length: 30)>$ | Filtro de ejecutivo por descripción.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
executives | [sBTCPExecutive](#sbtcpexecutive) | Listado de ejecutivos.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
50050003 | No existe la empresa ingresada | BTA0000017
99990010002 | Datos de Paginación Incorrectos | BTA0000002
99990010006 | No se pudo resolver el usuario | BTSCA00006

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
    "Token": "9BAB78387BC32D46A65E4AB5"
  },
  "offset": "0",
  "limit": "20",
  "executiveDescriptionFilter": ""
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
    "Token": "9BAB78387BC32D46A65E4AB5"
  },
  "hasNext": true,
  "executives": {
    "executive": [
      {
        "id": 45,
        "description": "PRUEBA 45"
      },
      {
        "id": 1957,
        "description": "NESTORFRANCO"
      },
      {
        "id": 20,
        "description": "EJEC 20"
      },
      {
        "id": 10002,
        "description": "EJECUTIVO 10002"
      },
      {
        "id": 1,
        "description": "INSTALADOR"
      },
      {
        "id": 2,
        "description": "BANTOTAL"
      },
      {
        "id": 3,
        "description": "GRUPO 1"
      },
      {
        "id": 4,
        "description": "GRUPO 2"
      },
      {
        "id": 5,
        "description": "GRUPO 3"
      },
      {
        "id": 6,
        "description": "GRUPO 4"
      },
      {
        "id": 7,
        "description": "GRUPO 5"
      },
      {
        "id": 8,
        "description": "GRUPO 7"
      },
      {
        "id": 9,
        "description": "GRUPO 8"
      },
      {
        "id": 10,
        "description": "GRUPO 9"
      },
      {
        "id": 11,
        "description": "GRUPO 11"
      },
      {
        "id": 12,
        "description": "GRUPO 12"
      },
      {
        "id": 13,
        "description": "GRUPO 13"
      },
      {
        "id": 14,
        "description": "GRUPO 15"
      },
      {
        "id": 15,
        "description": "GRUPO 14"
      },
      {
        "id": 100,
        "description": "GRUPO 100"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "18:25:38",
    "Numero": 13641971,
    "Servicio": "PublicCustomers.getExecutives",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTCPExecutive

### sBTCPExecutive

::: center
Los campos del tipo de dato estructurado sBTCPExecutive son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Int $<(length: 5)>$ | Identificador de ejecutivo.
description | String $<(length: 30)>$ | Descripción.
:::
<!-- CIERRA SDT -->
