---
title: Obtener Partners
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
::: note Método para obtener los partners.

**Nombre publicación:** BTPartners.ObtenerPartners

**Programa:** RBTPN003

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtPartners | [sBTPartner](#sbtpartner) | 

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
@tab XML
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">
   <soapenv:Header/>
   <soapenv:Body>
      <bts:BTPartners.ObtenerPartners>
         <bts:Btinreq>
            <bts:Device>INSTALADOR</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>599B05BBD8DA84FEC631B5C3</bts:Token>
         </bts:Btinreq>

      </bts:BTPartners.ObtenerPartners>
   </soapenv:Body>
</soapenv:Envelope>
```
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "599B05BBD8DA84FEC631B5C3"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab XML
```xml
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <SOAP-ENV:Body>
      <BTPartners.ObtenerPartnersResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>INSTALADOR</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento/>
            <Canal>BTDIGITAL</Canal>
            <Token>TOKEN_AQUI</Token>
         </Btinreq>
         <sdtPartners>
            <canal/>
            <clienteUId>0</clienteUId>
            <codigoComision>0</codigoComision>
            <habilitado/>
            <manejaVendedores/>
            <nivel/>
            <nivelUId/>
            <nombre/>
            <partnerUId>0</partnerUId>
            <sucursal>0</sucursal>
            <tipo/>
            <tipoRegistroVendedor/>
            <tipoUId>0</tipoUId>
         </sdtPartners>
         <Erroresnegocio/>
         <Btoutreq>
            <Numero>00000000</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.ObtenerPartners</Servicio>
            <Requerimiento/>
            <Fecha>2026-01-01</Fecha>
            <Canal>BTDIGITAL</Canal>
            <Hora>00:00:00</Hora>
         </Btoutreq>
      </BTPartners.ObtenerPartnersResponse>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```
@tab JSON
```json
{
  "Btinreq": {
    "Device": "INSTALADOR",
    "Usuario": "INSTALADOR",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL",
    "Token": "599B05BBD8DA84FEC631B5C3"
  },
  "sdtPartners": [
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 1,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "Prueba",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    },
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 2,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "Concesionario 2",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    },
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 3,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "Concesionario 3",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    },
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 4,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "Concesionario 4",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    },
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 5,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "Casa de Electrodomésticos 1",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    },
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 7,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "Arma Tu Casa S.A.",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    },
    {
      "tipoUId": 0,
      "nivelUId": 0,
      "habilitado": "",
      "clienteUId": 0,
      "partnerUId": 3345,
      "canal": "",
      "tipo": "",
      "codigoComision": 0,
      "nivel": "",
      "nombre": "PartnerFacu",
      "tipoRegistroVendedor": "",
      "sucursal": 0,
      "manejaVendedores": ""
    }
  ],
  "Erroresnegocio": [],
  "Btoutreq": {
    "Numero": 38483,
    "Estado": "OK",
    "Servicio": "BTPartners.ObtenerPartners",
    "Requerimiento": "1",
    "Fecha": "2026-05-22",
    "Hora": "14:34:37",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTPartner

### sBTPartner

::: center
Los campos del tipo de dato estructurado sBTPartner son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
canal | String | 
clienteUId | Long | 
codigoComision | Int | 
habilitado | String | 
manejaVendedores | String | 
nivel | String | 
nivelUId | Byte | 
nombre | String | 
partnerUId | Int | 
sucursal | Int | 
tipo | String | 
tipoRegistroVendedor | String | 
tipoUId | Short | 
:::
<!-- CIERRA SDT -->
