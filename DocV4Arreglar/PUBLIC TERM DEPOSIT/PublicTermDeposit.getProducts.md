---
title: Obtiene Productos de Depósitos a Plazo
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
::: note Método para obtener el catálogo de productos de Depósitos a Plazo.
Este servicio devuelve la lista de productos disponibles para Depósitos a Plazo, incluyendo información de moneda y tipo.

**Nombre publicación:** PublicTermDeposit.getProducts

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
(No aplica) | - | El servicio no requiere parámetros adicionales (solo cabecera **Btinreq**).

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | Array | Lista de productos disponibles.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicTermDeposit_v1?getProducts' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "11FDDE8CE64AEE13D6B8092B"
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
    "Token": "11FDDE8CE64AEE13D6B8092B"
  },
  "products": {
    "product": [
      {
        "ProductGUID": "8fd31000-0027-4028-8a66-eede56e485dd",
        "ProductDescription": "DPF TIPO 1 - COMERCIAL 365 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "659d329f-3ad4-4984-aaa8-a3fe1561b512",
        "ProductDescription": "DPF TIPO 1 - COMERCIAL 365 EFECTIVA",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "55dbadfa-6056-4d88-8779-c530a291bc1b",
        "ProductDescription": "DPF TIPO 2 - COMERCIAL 360 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "ac1ab7da-04da-4ef6-8361-cc1f3d680705",
        "ProductDescription": "DPF TIPO 2 - COMERCIAL 360 EFECTIVA",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "88f20a79-8176-43ef-b2a7-3630f401a63b",
        "ProductDescription": "DPF TIPO 3 - CALENDARIO 360 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "8f7f241a-2158-4f84-bf4e-b44d1542bcba",
        "ProductDescription": "DPF TIPO 4 - CALENDARIO 365 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "3d0accc0-d927-4d2f-9836-447aa94c55d4",
        "ProductDescription": "DPF TIPO 5 - COMERCIAL 365 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "9e247cf8-8432-45cc-ae58-f53a6dc026d6",
        "ProductDescription": "DPF TIPO 6 - COMERCIAL 360 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "71a52072-8bc2-4a7e-b651-b54101e4b399",
        "ProductDescription": "DPF TIPO 7 - CALENDARIO 360 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "c682ad09-f728-4c98-bde7-e173fcc0aa4c",
        "ProductDescription": "DPF TIPO 8 - CALENDARIO 365 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "5c4f2881-c106-410b-a81c-ec4b5a71ad10",
        "ProductDescription": "DPF PP TIPO 20 - COMERCIAL 365 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "3d695110-9c7a-4dff-ba21-372c5809812f",
        "ProductDescription": "DPF PP TIPO 21 - COMERCIAL 360 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "bc3b7a65-7c3a-4cf3-b56f-f5de008951c5",
        "ProductDescription": "DPF PP TIPO 22 - CALENDARIO 360 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "bf53c34a-6351-4d3f-b664-a47b4d73997d",
        "ProductDescription": "DPF PP TIPO 22 - CALENDARIO 360 EFECTIVA",
        "CurrencyId": "2222",
        "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
        "CurrencySign": "USD",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "94f94f76-449b-444a-a168-a3539a08f555",
        "ProductDescription": "DPF PP TIPO 23 - CALENDARIO 365 EFECTIVA",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "c9acda29-02d1-448a-be60-807ac89ecc2e",
        "ProductDescription": "DPF PP TIPO 24 - COMERCIAL 365 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "a67b834d-6799-4fcf-b421-b9b8ee982a5f",
        "ProductDescription": "DPF PP TIPO 25 - COMERCIAL 360 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "a2e23b98-dd3a-4bbd-9ff9-448a97030e36",
        "ProductDescription": "DPF PP TIPO 26 - CALENDARIO 360 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      },
      {
        "ProductGUID": "22fb01a7-ebf9-4b98-bee3-a8877e312a3a",
        "ProductDescription": "DPF PP TIPO 27 - CALENDARIO 365 LINEAL",
        "CurrencyId": "0",
        "CurrencyDescription": "Pesos Uruguayos",
        "CurrencySign": "$",
        "KindId": "0",
        "KindDescription": "Billete"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-20",
    "Hora": "12:58:13",
    "Numero": "13144861",
    "Servicio": "PublicTermDeposit.getProducts",
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
