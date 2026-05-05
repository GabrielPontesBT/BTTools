---
title: Eliminar Informacion Adicional
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
::: note Método para eliminar información adicional de un cliente.
Este servicio permite eliminar información adicional (custom fields) asociada a un cliente identificado por su GUID.

**Nombre publicación:** PublicCustomers.deleteAdditionalInformation

**Módulo:** Customers

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | Identificador único del cliente/contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
customFields | [sBTPAWCustomField](#sBTPAWCustomField) | Listado de campos adicionales a eliminar.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
— | — | No retorna datos específicos. La ejecución se confirma por el estado informado en **Btoutreq**.

@tab Errores

Código | Descripción
:--------- | :-----------
10002 | Error en la ejecución del programa.
10011 | Sesión inválida.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?deleteAdditionalInformation' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "14239E2AFCB732735032BFE1"
  },
  "counterpartyGUID": "1ffc5541-3664-40f1-9369-1ae7826709ca",
  "customFields": {
    "customFieldsItem": {
      "Correlative": "?",
      "Id": "?",
      "Value": "?",
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
    "Token": "14239E2AFCB732735032BFE1"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-23",
    "Hora": "13:11:50",
    "Numero": "13036301",
    "Servicio": "PublicCustomers.deleteAdditionalInformation",
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
::: details sBTPAWCustomField

### sBTPAWCustomField

::: center
Los campos del tipo de dato estructurado sBTPAWCustomField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | String $<(length: ?)>$ |
Id | String $<(length: ?)>$ |
Value | String $<(length: ?)>$ |
Description | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->
