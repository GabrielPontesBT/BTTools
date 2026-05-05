---
title: Actualizar Datos de Contacto
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
::: note Método para actualizar los datos de contacto de una persona.

**Nombre publicación:** PublicPersons.updateContactData

**Módulo:** Persons.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String | Identificador único de la persona.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
contacts | SdtsBTPEWContact | Listado de contactos a actualizar/crear.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
(ninguno) |  | La operación no retorna datos específicos, solo estado de ejecución.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?updateContactData' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "GPONTES",
    "Requerimiento": "1",
    "Token": "145A9308FD5A5A0CB39B412F"
  },
  "personGUID": "f106e9d1-7f48-4613-b4ba-1c20958167ab",
  "contacts": {
    "SdtsBTPEWContact": {
      "Correlative": "1",
      "ContactTypeId": "3",
      "ContactTypeDescription": {},
      "Text": "PRUEBA@BANTOTAL.COM",
      "Comment": "CORREO DE PRUEBA",
      "TelephoneCompanyId": {},
      "TelephoneCompanyDescription": {},
      "Enabled": "true",
      "AssociatedToAnAddress": "false",
      "AddressCorrelative": {},
      "AddressId": {},
      "Validated": "true",
      "ReceivesMails": "true",
      "StartTimeRange1": "10:00",
      "EndTimeRange1": "15:00",
      "StartTimeRange2": "16:00",
      "EndTimeRange2": "20:00",
      "Priority": {}
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
    "Device": "GPONTES",
    "Requerimiento": "1",
    "Token": "145A9308FD5A5A0CB39B412F"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-13",
    "Hora": "16:23:48",
    "Numero": "13122884",
    "Servicio": "PublicPersons.updateContactData",
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
::: details ContactTypeDescription

### ContactTypeDescription

::: center
Los campos del tipo de dato estructurado ContactTypeDescription son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details TelephoneCompanyId

### TelephoneCompanyId

::: center
Los campos del tipo de dato estructurado TelephoneCompanyId son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details TelephoneCompanyDescription

### TelephoneCompanyDescription

::: center
Los campos del tipo de dato estructurado TelephoneCompanyDescription son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details AddressCorrelative

### AddressCorrelative

::: center
Los campos del tipo de dato estructurado AddressCorrelative son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details AddressId

### AddressId

::: center
Los campos del tipo de dato estructurado AddressId son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details Priority

### Priority

::: center
Los campos del tipo de dato estructurado Priority son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details SdtsBTPEWContact

### SdtsBTPEWContact

::: center
Los campos del tipo de dato estructurado SdtsBTPEWContact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | String |
ContactTypeId | String |
ContactTypeDescription | ContactTypeDescription |
Text | String |
Comment | String |
TelephoneCompanyId | TelephoneCompanyId |
TelephoneCompanyDescription | TelephoneCompanyDescription |
Enabled | String |
AssociatedToAnAddress | String |
AddressCorrelative | AddressCorrelative |
AddressId | AddressId |
Validated | String |
ReceivesMails | String |
StartTimeRange1 | String |
EndTimeRange1 | String |
StartTimeRange2 | String |
EndTimeRange2 | String |
Priority | Priority |
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details contacts

### contacts

::: center
Los campos del tipo de dato estructurado contacts son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
SdtsBTPEWContact | SdtsBTPEWContact |
:::
<!-- CIERRA SDT -->
