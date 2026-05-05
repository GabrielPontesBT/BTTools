---
title: Obtener Tipos de Integración
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
::: note Método para obtener los tipos de integración de clientes.
Este servicio permite consultar el catálogo de tipos de integración (ownership types) disponibles para clientes/contrapartes.

**Nombre publicación:** PublicCustomers.getIntegrationTypes

**Módulo:** Customers

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ownershipTypes | Colección | Lista de tipos de integración.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?getIntegrationTypes' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "4B92FD69A37234F1AF04EDD5"
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
    "Token": "4B92FD69A37234F1AF04EDD5"
  },
  "ownershipTypes": {
    "ownershipTypesItem": [
      {
        "Id": "1",
        "Description": "TITULAR REPRESENTAT."
      },
      {
        "Id": "2",
        "Description": "TITULAR NO REPRESENT"
      },
      {
        "Id": "4",
        "Description": "FIADOR SOLIDARIO"
      },
      {
        "Id": "5",
        "Description": "APODERADO"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-03",
    "Hora": "13:12:00",
    "Numero": "13082240",
    "Servicio": "PublicCustomers.getIntegrationTypes",
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
::: details ownershipType

### ownershipType

::: center
Los campos del tipo de dato estructurado ownershipType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String $<(length: ?)>$ |
Description | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->
