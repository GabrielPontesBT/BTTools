---
title: Obtener Países
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
::: note Método para obtener el catálogo de países.

**Nombre publicación:** PublicGeneral.getCountries

**Programa:** Completar manualmente

**Alcance:** Completar manualmente
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Btinreq | Object | Datos de entrada requeridos para la invocación (Canal, Usuario, Device, Requerimiento, Token).

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sBTCNWCountries | Object | Listado de países.
countriesItem.Id | Int | Identificador del país.
countriesItem.Name | String | Nombre del país.
countriesItem.TelephoneCodePrefix | String | Prefijo telefónico internacional.
countriesItem.ISOName | String | Código ISO (según parametrización Bantotal).
countriesItem.ISO2 | String | Código ISO 3166-1 alfa-2.
countriesItem.ISO3 | String | Código ISO 3166-1 alfa-3.
countriesItem.EconomicBlocs | Object | Bloques económicos asociados (si aplica).

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicGeneral_v1?getCountries' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "85F42F88E9ACD1BDAED365FE"
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
    "Token": "85F42F88E9ACD1BDAED365FE"
  },
  "sBTCNWCountries": {
    "countriesItem": [
      {
        "Id": "4",
        "Name": "Afganistán",
        "TelephoneCodePrefix": "93",
        "ISOName": "AF",
        "ISO2": "AF",
        "ISO3": "AFG",
        "EconomicBlocs": ""
      },
      {
        "Id": "8",
        "Name": "Albania",
        "TelephoneCodePrefix": "355",
        "ISOName": "AL",
        "ISO2": "AL",
        "ISO3": "ALB",
        "EconomicBlocs": ""
      },
      {
        "Id": "10",
        "Name": "Antártida",
        "TelephoneCodePrefix": "672",
        "ISOName": "AY",
        "ISO2": "AQ",
        "ISO3": "ATA",
        "EconomicBlocs": ""
      },
      {
        "Id": "12",
        "Name": "Argelia",
        "TelephoneCodePrefix": "213",
        "ISOName": "AG",
        "ISO2": "DZ",
        "ISO3": "DZA",
        "EconomicBlocs": ""
      },
      {
        "Id": "16",
        "Name": "Samoa Americana",
        "TelephoneCodePrefix": "1684",
        "ISOName": "AQ",
        "ISO2": "AS",
        "ISO3": "ASM",
        "EconomicBlocs": ""
      },
      {
        "Id": "20",
        "Name": "Andorra",
        "TelephoneCodePrefix": "376",
        "ISOName": "AN",
        "ISO2": "AD",
        "ISO3": "AND",
        "EconomicBlocs": ""
      },
      {
        "Id": "24",
        "Name": "Angola",
        "TelephoneCodePrefix": "244",
        "ISOName": "AO",
        "ISO2": "AO",
        "ISO3": "AGO",
        "EconomicBlocs": ""
      },
      {
        "Id": "28",
        "Name": "Antigua y Barbuda",
        "TelephoneCodePrefix": "1268",
        "ISOName": "AC",
        "ISO2": "AG",
        "ISO3": "ATG",
        "EconomicBlocs": ""
      },
      {
        "Id": "31",
        "Name": "Azerbaiyán",
        "TelephoneCodePrefix": "994",
        "ISOName": "AJ",
        "ISO2": "AZ",
        "ISO3": "AZE",
        "EconomicBlocs": ""
      },
      {
        "Id": "32",
        "Name": "Argentina",
        "TelephoneCodePrefix": "54",
        "ISOName": "AR",
        "ISO2": "AR",
        "ISO3": "ARG",
        "EconomicBlocs": ""
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-14",
    "Hora": "13:30:54",
    "Numero": "12993261",
    "Servicio": "PublicGeneral.getCountries",
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
::: details sBTCNWCountry

### sBTCNWCountry

::: center
Los campos del tipo de dato estructurado sBTCNWCountry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Name | String |
TelephoneCodePrefix | String |
ISOName | String |
ISO2 | String |
ISO3 | String |
EconomicBlocs | String |
:::
<!-- CIERRA SDT -->
