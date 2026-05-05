---
title: Actualizar Textos de Cliente
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
::: note Método para actualizar textos asociados a una contraparte.

**Nombre publicación:** PublicCustomers.updateTexts

**Módulo:** Customers

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(length: 36)>$ | Identificador único de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
texts | Colección | Lista de textos a actualizar.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
BusinessErrors | String $<(length: ?)>$ | Errores de negocio en caso de existir.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?updateTexts' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "06F9D02F88928150A357A091"
  },
  "counterpartyGUID": "41e380d1-c6c3-4c0e-88d7-bb002138c8ad",
  "texts": {
    "SdtsBTPAWText": {
      "Id": "501",
      "Text": "156",
      "Description": "?"
    }
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "06F9D02F88928150A357A091"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-11",
    "Hora": "15:33:35",
    "Numero": "13109502",
    "Servicio": "PublicCustomers.updateTexts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPAWText

### SdtsBTPAWText

::: center
Los campos del tipo de dato estructurado SdtsBTPAWText son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String $<(length: ?)>$ |
Text | String $<(length: ?)>$ |
Description | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details texts

### texts

::: center
Los campos del tipo de dato estructurado texts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
SdtsBTPAWText | SdtsBTPAWText |
:::
<!-- CIERRA SDT -->
