---
title: Obtener Productos de Préstamos
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
::: note Método para obtener los productos de préstamos disponibles.

Este servicio permite consultar el listado de **productos de préstamos (Loans)** disponibles en el sistema.

**Nombre publicación:** PublicLoans.getProducts

**Módulo:** (No informado)

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
(No aplica) | - | El servicio no requiere parámetros adicionales.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | Array | Lista de productos de préstamos.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicLoans_v1?getProducts' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "44C6368888A1E1ECA6656D04"
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
    "Token": "44C6368888A1E1ECA6656D04"
  },
  "products": {
    "product": [
      {
        "ProductGUID": "d6328022-6f93-4afc-b59b-a29f435aba41",
        "ProductDescription": "COMPRA DE VIVIENDA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "38da2e83-b308-4d5f-b664-f351db2b4a1d",
        "ProductDescription": "COMPRA DE VIVIENDA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "50",
        "KindDescription": "Unidad Indexada"
      },
      {
        "ProductGUID": "c9d5bcd0-8872-41b3-b5a4-9dff8ac7e235",
        "ProductDescription": "COMPRA DE VIVIENDA",
        "CurrencyId": "2225",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "CurrencySign": "U$D",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee",
        "ProductDescription": "REFACCIÓN DE VIVIENDA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "e83c667b-4887-4cac-bbc7-cfe85f179d33",
        "ProductDescription": "REFACCIÓN DE VIVIENDA",
        "CurrencyId": "2225",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "CurrencySign": "U$D",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "43a5c0ba-2740-42c9-8d5e-580135824b64",
        "ProductDescription": "PRUEBA MIVIVIENDA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "1ad07f0b-b233-4437-bb9c-c45d7e3632e2",
        "ProductDescription": "PRUEBA MIVIVIENDA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "50",
        "KindDescription": "Unidad Indexada"
      },
      {
        "ProductGUID": "1e1435cc-d848-4624-8f1f-e9a11639d479",
        "ProductDescription": "PRUEBA MIVIVIENDA",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "ac0b9033-a297-43f5-99a5-2fcf87bd3be0",
        "ProductDescription": "PRÉSTAMO PERSONAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "c09f5d49-d02a-46df-b558-e84544d056a0",
        "ProductDescription": "PRÉSTAMO PERSONAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "50",
        "KindDescription": "Unidad Indexada"
      },
      {
        "ProductGUID": "42e66b7d-61c2-444d-ae66-00d6c632bd06",
        "ProductDescription": "PRÉSTAMO PERSONAL",
        "CurrencyId": "2225",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "CurrencySign": "U$D",
        "KindId": "0",
        "KindDescription": "Billete"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-10",
    "Hora": "14:22:02",
    "Numero": "13100379",
    "Servicio": "PublicLoans.getProducts",
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
::: details product

### product

::: center
Los campos del tipo de dato estructurado product son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ProductGUID | String |
ProductDescription | String |
CurrencyId | String |
CurrencyDescription | String |
CurrencySign | String |
KindId | String |
KindDescription | String |
:::
<!-- CIERRA SDT -->
