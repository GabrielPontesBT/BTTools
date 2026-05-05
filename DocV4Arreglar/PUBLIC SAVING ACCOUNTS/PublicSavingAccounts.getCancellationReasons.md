---
title: Obtener Motivos de Cancelación
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
::: note Método para obtener los motivos de cancelación de una cuenta de ahorro.
Este servicio permite consultar los motivos de cancelación asociados a un **origen de cancelación**.

**Nombre publicación:** PublicSavingAccounts.getCancellationReasons

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationOriginId | Integer | Identificador del origen de cancelación.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sBTLIWCancellationReasons | Array | Lista de motivos de cancelación.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?getCancellationReasons' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "2B869BC80423FD8B71F1EA6E"
  },
  "cancellationOriginId": "1"
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
    "Token": "2B869BC80423FD8B71F1EA6E"
  },
  "sBTLIWCancellationReasons": {
    "sBTLIWCancellationReasonItem": [
      {
        "Id": "1",
        "Description": "CAMBIO DE INSTITUCIÓN"
      },
      {
        "Id": "2",
        "Description": "CUENTA EN DESUSO"
      },
      {
        "Id": "3",
        "Description": "OTROS"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-28",
    "Hora": "12:43:11",
    "Numero": "13053830",
    "Servicio": "PublicSavingAccounts.getCancellationReasons",
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
::: details sBTLIWCancellationReason

### sBTLIWCancellationReason

::: center
Los campos del tipo de dato estructurado sBTLIWCancellationReason son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
:::
<!-- CIERRA SDT -->
