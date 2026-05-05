---
title: Obtener Tipo de Documento
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
::: note Método para obtener los tipos de documento.

**Nombre publicación:** PublicGeneral.getDocumentTypes

**Programa:** PADTW00001

**Alcance:** Completar Manualmente
:::
<!-- CIERRA DATOS DEL MÉTODO -->

::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--- | :--- | :---
Btinreq | Object | Datos de sesión (Canal, Usuario, Device, Requerimiento, Token).

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--- | :--- | :---
sBTDTWDocumentTypes | Array | Lista de tipos de documento.
BusinessErrors | Array | Lista de errores de negocio (si corresponde).
Btoutreq | Object | Datos de salida estándar (Estado, Fecha, Hora, Número, Servicio, etc).

@tab Errores

Código | Descripción
:--- | :---
Completar Manualmente | Completar Manualmente

:::

## Ejemplos
<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicGeneral_v1?getDocumentTypes' \
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
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

::: @tab (XML)
```xml
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <SOAP-ENV:Body>
      <PublicGeneral.getDocumentTypesResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Canal>BTDIGITAL</Canal>
            <Usuario>INSTALADOR</Usuario>
            <Device>FPAIS</Device>
            <Requerimiento>1</Requerimiento>
            <Token>85F42F88E9ACD1BDAED365FE</Token>
         </Btinreq>
         <sBTDTWDocumentTypes>
            <documentTypesItem>
               <Id>1</Id>
               <Description>Cédula de Identidad</Description>
               <ShortDescription>CI</ShortDescription>
               <PersonType>F</PersonType>
               <AppliesToFI>N</AppliesToFI>
               <Format>N</Format>
               <MinLength>7</MinLength>
               <MaxLength>12</MaxLength>
               <MainDocument>true</MainDocument>
            </documentTypesItem>
            <!-- ... -->
         </sBTDTWDocumentTypes>
         <BusinessErrors></BusinessErrors>
         <Btoutreq>
            <Estado>OK</Estado>
            <Fecha>2026-01-14</Fecha>
            <Hora>13:55:44</Hora>
            <Numero>12993584</Numero>
            <Servicio>PublicGeneral.getDocumentTypes</Servicio>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </PublicGeneral.getDocumentTypesResponse>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```
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
  "sBTDTWDocumentTypes": {
    "documentTypesItem": {
      "Id": "1",
      "Description": "Cédula de Identidad",
      "ShortDescription": "CI",
      "PersonType": "F",
      "AppliesToFI": "N",
      "Format": "N",
      "MinLength": "7",
      "MaxLength": "12",
      "MainDocument": "true"
    }
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-14",
    "Hora": "13:55:44",
    "Numero": "12993584",
    "Servicio": "PublicGeneral.getDocumentTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details documentTypesItem

### documentTypesItem

::: center
Los campos del tipo de dato estructurado documentTypesItem son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
ShortDescription | String |
PersonType | String |
AppliesToFI | String |
Format | String |
MinLength | String |
MaxLength | String |
MainDocument | String |
:::
<!-- CIERRA SDT -->
