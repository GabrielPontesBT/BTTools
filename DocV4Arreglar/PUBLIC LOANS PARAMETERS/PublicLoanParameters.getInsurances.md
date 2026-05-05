---
title: Obtener Seguros
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
::: note Método para obtener los seguros disponibles para un producto de préstamo.

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
productGUID | String | 

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
    'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_BTSegurosVoluntarios?ObtenerSeguros' \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -H 'postman-token: 52baf1dc-e302-90a6-0de1-24fa234c0379' \
    -d '{
    "Btinreq": {
        "Requerimiento": 0,
        "Canal": "BTDIGITAL",
        "Device": "AC",
        "Usuario": "Instalador",
        "Token": "8e3a8ef2dd99865B3A2E76CF"
    },
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
        "Requerimiento": 1,
        "Usuario": "BANTOTAL",
        "Token": "324915377F955E77534D3E02",
        "Device": "AC"
    },
    "sdtSeguros": {
        "sBTSeguro": [
        {
            "descripcion": "Microseguros 1",
            "codigo": 610
        },
        {
            "descripcion": "Microseguros 2",
            "codigo": 611
        }
        ]
    },
    "Erroresnegocio": {
        "BTErrorNegocio": []
    },
    "Btoutreq": {
        "Canal": "BTDIGITAL",
        "Servicio": "BTSegurosVoluntarios.ObtenerSeguros",
        "Fecha": "2019-11-19",
        "Hora": "13:05:22",
        "Requerimiento": 1,
        "Numero": 6924,
        "Estado": "OK"
    }
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

