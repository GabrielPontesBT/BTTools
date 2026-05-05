---
title: Obtener Insurances
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
::: note Método para obtener los seguros disponibles de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.getInsurances

**Programa:** PublicAPI.BTLOPA0023

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(length: 36)>$ | 

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Btinreq | Object | Datos de entrada requeridos para la invocación (Canal, Usuario, Device, Requerimiento, Token).

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
insurances | Collection | 

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicLoanParameters_v1?getInsurances' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "TOKEN_AQUI"
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
    "Token": "TOKEN_AQUI"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
    "Servicio": "PublicLoanParameters.getInsurances",
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
::: details insurances

### insurances

::: center
Los campos del tipo de dato estructurado insurances son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
InsuranceId | Int|
InsuranceDescription | String|
InsuranceTypeId | Int|
InsuranceTypeDescription | String|
InsuranceCompanyId | Int|
InsuranceCompanyDescription | String|
Enabled | Boolean|
AllowsModification | Boolean|
UsesBoard | Boolean|
BoardId | Int|
BoardPercentage | Double|
BoardFixedAmount | Double|
FixedPercentage | Double|
FixedAmount | Double|
:::
<!-- CIERRA SDT -->

