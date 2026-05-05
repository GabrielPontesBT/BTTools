---
title: Eliminar Datos de Contacto
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
::: note Método para eliminar un dato de contacto de una persona.

Este servicio permite eliminar un dato de contacto específico (por tipo y correlativo) asociado a una persona.

**Nombre publicación:** PublicPersons.deleteContactData

**Módulo:** Persons.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String | Identificador único de la persona.
contactTypeId | Integer | Identificador del tipo de contacto.
correlative | Integer | Correlativo del contacto a eliminar.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
— | — | El servicio no retorna datos específicos de negocio.

@tab Errores

Código | Descripción
:--------- | :-----------
<!-- SE DEBEN AGREGAR A MANO -->
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?deleteContactData' \
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
  "personGUID": "f5d15cd8-0909-4296-8c42-54e5e60f0fdd",
  "contactTypeId": "1",
  "correlative": "1"
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "4B92FD69A37234F1AF04EDD5"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-03",
    "Hora": "13:37:08",
    "Numero": "13082360",
    "Servicio": "PublicPersons.deleteContactData",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
