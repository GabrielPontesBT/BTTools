---
title: Actualizar Integrantes
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
::: note Método para actualizar los integrantes (miembros) de una contraparte.

**Nombre publicación:** PublicCustomers.updateMembers

**Módulo:** Customers

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(length: 36)>$ | Identificador único de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
members | Colección | Lista de integrantes a asociar o actualizar.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
— | — | El servicio no devuelve datos funcionales.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?updateMembers' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "FF68DC7FBA7A45C637989ACD"
  },
  "counterpartyGUID": "cf93f446-2553-4363-a1d5-6de9a1bf53f8",
  "members": {
    "SdtsBTCPWCounterpartyIntegration": {
      "PersonGUID": "38754462-191b-42ff-bdd9-b43516f5f457",
      "CountryId": "858",
      "CountryDescription": {},
      "DocumentTypeId": "1",
      "DocumentTypeDescription": {},
      "DocumentNumber": "53698327",
      "PersonName": {},
      "OwnershipTypeId": "1",
      "OwnershipTypeDescription": {},
      "PersonType": "F"
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
    "Token": "FF68DC7FBA7A45C637989ACD"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-10",
    "Hora": "12:46:20",
    "Numero": "13100078",
    "Servicio": "PublicCustomers.updateMembers",
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
::: details CountryDescription

### CountryDescription

::: center
Los campos del tipo de dato estructurado CountryDescription son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details DocumentTypeDescription

### DocumentTypeDescription

::: center
Los campos del tipo de dato estructurado DocumentTypeDescription son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details PersonName

### PersonName

::: center
Los campos del tipo de dato estructurado PersonName son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details OwnershipTypeDescription

### OwnershipTypeDescription

::: center
Los campos del tipo de dato estructurado OwnershipTypeDescription son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details SdtsBTCPWCounterpartyIntegration

### SdtsBTCPWCounterpartyIntegration

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCounterpartyIntegration son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
PersonGUID | String $<(length: 36)>$ |
CountryId | String $<(length: ?)>$ |
CountryDescription | CountryDescription |
DocumentTypeId | String $<(length: ?)>$ |
DocumentTypeDescription | DocumentTypeDescription |
DocumentNumber | String $<(length: ?)>$ |
PersonName | PersonName |
OwnershipTypeId | String $<(length: ?)>$ |
OwnershipTypeDescription | OwnershipTypeDescription |
PersonType | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details members

### members

::: center
Los campos del tipo de dato estructurado members son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
SdtsBTCPWCounterpartyIntegration | SdtsBTCPWCounterpartyIntegration |
:::
<!-- CIERRA SDT -->
