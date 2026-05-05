---
title: Tipos de Vivienda
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
::: note Método para obtener los tipos de vivienda.
Este servicio permite consultar el catálogo de tipos de vivienda.

**Nombre publicación:** PublicPersons.getHousingTypes

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
sBTPEWHousingType | Array | Lista de tipos de vivienda.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getHousingTypes' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "606B54A76488080E3507C093"
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
    "Token": "606B54A76488080E3507C093"
  },
  "sBTPEWHousingType": {
    "sBTPEWHousingTypeItem": [
      {
        "Id": "1",
        "Description": "PROPIETARIO"
      },
      {
        "Id": "2",
        "Description": "INQUILINO"
      },
      {
        "Id": "3",
        "Description": "BHU"
      },
      {
        "Id": "4",
        "Description": "USUFRUCTO"
      },
      {
        "Id": "5",
        "Description": "FAMILIAR"
      },
      {
        "Id": "6",
        "Description": "OTROS"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-27",
    "Hora": "15:09:50",
    "Numero": "13048516",
    "Servicio": "PublicPersons.getHousingTypes",
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
::: details sBTPEWHousingType

### sBTPEWHousingType

::: center
Los campos del tipo de dato estructurado sBTPEWHousingType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
:::
<!-- CIERRA SDT -->
