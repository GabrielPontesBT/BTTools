---
title: Crear Persona Física
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para crear una persona física (natural person).

**Nombre publicación:** PublicPersons.create

**Módulo:** Persons.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--|:--|:--
personGUID | String | Identificador único de la persona (opcional / referencia).

@tab Body

Nombre | Tipo | Comentarios
:--|:--|:--
naturalPerson | Object | Datos de la persona física a crear.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--|:--|:--
Estado | String | Resultado de la operación.

@tab Errores

Código | Descripción
:--|:--
<!-- SE DEBEN AGREGAR A MANO -->
:::

## **Ejemplos**

::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?create' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "4B92FD69A37234F1AF04EDD5"
  },
  "naturalPerson": {}
}'
```
:::

::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab JSON
```json
{
   "PublicPersons.createResponse": {
      "Btoutreq": {
         "Estado": "OK"
      }
   }
}
```
:::

<!-- CIERRA EJEMPLO DE RESPUESTA -->
