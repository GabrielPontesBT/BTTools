---
title: Obtener Executives [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de ejecutivos.

**Nombre publicación:** PublicCustomers.getExecutives

**Módulo:** Customers

**Programa:** PublicAPI.ABTCPPA0026

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

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | Existen más páginas disponibles en la paginación?.
executives | [sBTCPExecutive](#sbtcpexecutive) | Listado de ejecutivos.

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
    "Token": "444B674391BCA7676279700A"
  },
  "offset": "0",
  "limit": "10",
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
    "Token": "444B674391BCA7676279700A"
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
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:10",
    "Numero": 13468811,
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
