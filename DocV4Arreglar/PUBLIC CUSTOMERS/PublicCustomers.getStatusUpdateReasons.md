---
title: Obtener Razones de Actualizacion de Estado
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
::: note Método para obtener los motivos de actualización de estado de clientes.
Este servicio permite consultar el catálogo de motivos por los cuales se actualiza el estado de un cliente.

**Nombre publicación:** PublicCustomers.getStatusUpdateReasons

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
reasonForStatusChange | Colección | Lista de motivos de cambio de estado.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?getStatusUpdateReasons' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "182E0F606172EEAEA2CD8C0F"
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
    "Token": "182E0F606172EEAEA2CD8C0F"
  },
  "reasonForStatusChange": {
    "reasonForStatusChangeItem": [
      {
        "Id": "1",
        "Description": "EMBARGO",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "2",
        "Description": "EN JUICIO",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "3",
        "Description": "RETENCIONES",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "4",
        "Description": "CIERRE",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "5",
        "Description": "REGULARIZACIÓN",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "6",
        "Description": "CIERRE POR INACTIVIDAD",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "7",
        "Description": "FALLECIMIENTO",
        "StatusId": "2",
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": "8",
        "Description": "CIERRE",
        "StatusId": "3",
        "StatusDescription": "CERRADA"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-23",
    "Hora": "13:33:09",
    "Numero": "13036331",
    "Servicio": "PublicCustomers.getStatusUpdateReasons",
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
::: details reasonForStatusChange

### reasonForStatusChange

::: center
Los campos del tipo de dato estructurado reasonForStatusChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String $<(length: ?)>$ |
Description | String $<(length: ?)>$ |
StatusId | String $<(length: ?)>$ |
StatusDescription | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->
