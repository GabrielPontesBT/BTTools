---
title: Crear Caja de Ahorro
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
::: note Método para crear una nueva caja de ahorro para una contraparte.

**Nombre publicación:** PublicSavingAccounts.create

**Módulo:** SavingAccounts.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String | Identificador único de la contraparte.
productGUID | String | Identificador del producto a crear.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
subAccountName | String | Nombre de la subcuenta.
branchId | Integer | Identificador de la sucursal.
signatureType | String | Tipo de firma.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String | Identificador único de la caja de ahorro creada.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?create' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "GPONTES",
    "Requerimiento": "1",
    "Token": "F4D0C6E75AC71200736571C5"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "productGUID": "dd98b54d-73d9-4248-b760-5e62b24617ac",
  "subAccountName": "SUB CUENTA PRUEBA",
  "branchId": "122",
  "signatureType": "B"
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
    "Device": "GPONTES",
    "Requerimiento": "1",
    "Token": "F4D0C6E75AC71200736571C5"
  },
  "savingAccountGUID": "5dcd823d-1d93-438f-970f-f5faa34f8b4a",
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-04",
    "Hora": "10:43:55",
    "Numero": "13087811",
    "Servicio": "PublicSavingAccounts.create",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
