---
title: Obtener Servicios 
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
::: note Método para obtener los servicios disponibles de Cash Management.
Este servicio permite consultar el catálogo de servicios configurados en Cash Management, incluyendo su identificación, descripción y parámetros de operación (módulos y transacciones asociadas, origen y configuración de espera de cabecera).

**Nombre publicación:** PublicCASHManagement.getServices

**Módulo:** CashManagement

**Programa:** PublicAPI.BTCSPA0006

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
sBTCSServiceDefinition | Collection | Lista de servicios disponibles.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCASHManagement_v1?getServices' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "6DB6625A62A4A985089AA60D"
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
    "Token": "6DB6625A62A4A985089AA60D"
  },
  "sBTCSServiceDefinition": {
    "CSServiceDefinition": [
      {
        "lockingTransactionId": "10",
        "serviceDescription": "PRUEBA MODIFICACIONES",
        "lockingModuleId": "21",
        "paymentTransactionId": "3",
        "paymentOrCollection": "C",
        "serviceGroupId": "3",
        "waitForHeader": "true",
        "serviceId": "1",
        "origin": "P",
        "paymentModuleId": "20"
      },
      {
        "lockingTransactionId": "915",
        "serviceDescription": "PRUEBA 1020",
        "lockingModuleId": "21",
        "paymentTransactionId": "30",
        "paymentOrCollection": "P",
        "serviceGroupId": "1",
        "waitForHeader": "true",
        "serviceId": "10",
        "origin": "B",
        "paymentModuleId": "21"
      },
      {
        "lockingTransactionId": "3",
        "serviceDescription": "DE VARIAS COSAS",
        "lockingModuleId": "20",
        "paymentTransactionId": "3",
        "paymentOrCollection": "C",
        "serviceGroupId": "1",
        "waitForHeader": "true",
        "serviceId": "12",
        "origin": "P",
        "paymentModuleId": "20"
      },
      {
        "lockingTransactionId": "3",
        "serviceDescription": "PEDRO INCIALES",
        "lockingModuleId": "20",
        "paymentTransactionId": "10",
        "paymentOrCollection": "C",
        "serviceGroupId": "2",
        "waitForHeader": "true",
        "serviceId": "14",
        "origin": "B",
        "paymentModuleId": "21"
      },
      {
        "lockingTransactionId": "3",
        "serviceDescription": "PRUEBA DEL GRUPO",
        "lockingModuleId": "20",
        "paymentTransactionId": "3",
        "paymentOrCollection": "C",
        "serviceGroupId": "2",
        "waitForHeader": "false",
        "serviceId": "33",
        "origin": "B",
        "paymentModuleId": "20"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-28",
    "Hora": "13:15:51",
    "Numero": "13054165",
    "Servicio": "PublicCASHManagement.getServices",
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
::: details sBTCSServiceDefinition

### sBTCSServiceDefinition

::: center
Los campos del tipo de dato estructurado sBTCSServiceDefinition son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
lockingTransactionId | Int $<(length: 5)>$|Identificador de la transacción de bloqueo.
serviceDescription | String $<(length:60)$|Descripción del servicio.
lockingModuleId | Int $<(length: 5)>$|Identificador del módulo de bloqueo.
paymentTransactionId | Int $<(length: 5)>$|Identificador de la transacción de pago.
paymentOrCollection | String $<(length: 1)>$|Indicador de pago o cobro.
serviceGroupId | Short $<(length: 4)>$|Identificador del grupo de servicios.
waitForHeader | Boolean |Indica si se debe esperar el encabezado del archivo.
serviceId | Short $<(length: 4)>$|Identificador del servicio.
origin | String $<(length: 1)>$|Origen del servicio.
paymentModuleId | Int $<(length: 0)>$|Identificador del módulo de pago.
:::
<!-- CIERRA SDT -->
