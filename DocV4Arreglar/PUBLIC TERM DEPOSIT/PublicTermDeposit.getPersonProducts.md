---
title: Obtener Productos de Depósito a Plazo por Persona
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
::: note Método para obtener los productos de Depósito a Plazo disponibles para una persona.
Este servicio devuelve el listado de productos de Depósito a Plazo (DPF) habilitados para la persona indicada.

**Nombre publicación:** PublicTermDeposit.getPersonProducts

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String (GUID) | Identificador único de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | Array | Listado de productos disponibles para la persona.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicTermDeposit_v1?getPersonProducts' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "11FDDE8CE64AEE13D6B8092B"
  },
  "personGUID": "183f5194-f5a9-4590-9aff-b43de58c263d"
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
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-20",
    "Hora": "12:49:51",
    "Numero": "13144859",
    "Servicio": "PublicTermDeposit.getPersonProducts",
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
