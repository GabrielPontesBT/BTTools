---
title: Obtener Monto de Cancelación de Préstamo
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

::: note Método para obtener el monto necesario para cancelar un préstamo a una fecha determinada.

**Nombre publicación:** PublicLoans.getCancellationAmount

**Módulo:** Loans.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::

::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String | Identificador único del préstamo.
queryDate | DateTime | Fecha de consulta para el cálculo del monto de cancelación.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationAmount | Decimal | Monto total necesario para cancelar el préstamo.

@tab Errores

Código | Descripción
:--------- | :-----------
<!-- SE DEBEN AGREGAR A MANO -->
:::

## **Ejemplos**

::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicLoans_v1?getCancellationAmount' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "44C6368888A1E1ECA6656D04"
  },
  "loanGUID": "260ca6ab-6dc6-469a-9ad8-829b0d52997e",
  "queryDate": "2025-01-08 00:00:00.000"
}'
```
:::

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
    "Token": "44C6368888A1E1ECA6656D04"
  },
  "cancellationAmount": "513563.12",
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-10",
    "Hora": "14:49:40",
    "Numero": "13100602",
    "Servicio": "PublicLoans.getCancellationAmount",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
