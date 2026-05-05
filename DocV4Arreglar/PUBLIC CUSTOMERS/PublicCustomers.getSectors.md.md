---
title: Obtener Sectores
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
::: note Método para obtener los sectores de clientes.

**Nombre publicación:** PublicCustomers.getSectors

**Módulo:** Customers

**Programa:** PAACW00002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE CONFIGURACIÓN BACKEND -->
::: info Configuración Backend

No requiere configuración adicional.  
El servicio devuelve los sectores configurados en el sistema.

:::
<!-- CIERRA CONFIGURACIÓN BACKEND -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Btinreq | Object | Datos generales de la invocación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sectors | Colección | Lista de sectores.
Id | Int $<(length: ?)>$ | Identificador del sector.
Description | String $<(length: ?)>$ | Descripción del sector.

@tab Errores

Código | Descripción
:--------- | :-----------
Configurar Manualmente | Configurar Manualmente
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
json
{
   "Envelope": {
      "Header": {},
      "Body": {
         "PublicCustomers.getSectors": {
            "Btinreq": {
               "Canal": "BTDIGITAL",
               "Usuario": "INSTALADOR",
               "Device": "FPAIS",
               "Requerimiento": "1",
               "Token": "33BA2BFA3B26E3B0AC2597F4"
            }
         }
      },
      "_xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "_xmlns:bts": "http://uy.com.dlya.bantotal/BTSOA/"
   }
}
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
    "Token": "33BA2BFA3B26E3B0AC2597F4"
  },
  "sectors": {
    "sectorsItem": [
      {
        "Id": "1",
        "Description": "Privado no Financieros"
      },
      {
        "Id": "2",
        "Description": "Privado Financiero"
      },
      {
        "Id": "3",
        "Description": "Gobierno nacional"
      },
      {
        "Id": "4",
        "Description": "Gobierno Departamental"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-14",
    "Hora": "16:27:10",
    "Numero": "12995347",
    "Servicio": "PublicCustomers.getSectors",
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
::: details sector

### sector

::: center
Los campos del tipo de dato estructurado sector son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String $<(length: ?)>$ |
Description | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->
