---
title: Groups
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los grupos de créditos existentes.

**Nombre publicación:** PublicGroupLoans.groups

**Programa:** PublicAPI.BTLOPA0034

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/groups
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
name | String $<(Length: 30)>$ | Nombre del grupo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | Indica si existen más páginas disponibles.
groups | [group](#group) | Listado de grupos.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/groups?offset=0&limit=5&groupId=&name=' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "hasNext": true,
  "groups": {
    "group": [
      {
        "cycleId": 3,
        "groupId": 1,
        "groupName": "LAS VENDEDORAS DEL SIGLO",
        "status": 0,
        "statusDescription": "Normal"
      },
      {
        "cycleId": 1,
        "groupId": 2,
        "groupName": "LAS VENDEDORAS DEL SIGLO XX1",
        "status": 0,
        "statusDescription": "Normal"
      },
      {
        "cycleId": 0,
        "groupId": 3,
        "groupName": "LAS VENDEDORAS DEL SIGLO 20",
        "status": 0,
        "statusDescription": "Normal"
      },
      {
        "cycleId": 0,
        "groupId": 4,
        "groupName": "JUNTAS PODEMOS",
        "status": 0,
        "statusDescription": "Normal"
      },
      {
        "cycleId": 0,
        "groupId": 5,
        "groupName": "JUNTAS PODEMOS",
        "status": 0,
        "statusDescription": "Normal"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details group

### group

::: center
Los campos del tipo de dato estructurado group son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
cycleId | Int $<(Length: 9)>$ | Identificador de ciclo.
groupId | Int $<(Length: 9)>$ | Identificador del grupo.
groupName | String $<(Length: 30)>$ | Nombre del grupo.
lastCycleStatusId | Byte $<(Length: 2)>$ | Estado del último ciclo.
status | Byte $<(Length: 2)>$ | Estado del grupo.
statusDescription | String $<(Length: 40)>$ | Descripción del estado.
:::
<!-- CIERRA SDT -->
