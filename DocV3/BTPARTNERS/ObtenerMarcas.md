---
title:  Obtener Marcas
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
::: note Método para retornar las marcas de los vehículos.

**Nombre publicación:** BTPartners.ObtenerMarcas

**Programa:** RBTPNV03

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtPartner | [sBTPartnerInReq](#sbtpartnerinreq) | 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtMarcas | [sBTMarca](#sbtmarca) | 

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
      <bts:BTPartners.ObtenerMarcas>
         <bts:Btinreq>
            <bts:Device>FPAIS</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>C3367D27ABD2BC994403ECCD</bts:Token>
         </bts:Btinreq>
         <bts:sdtPartner>
            <bts:partnerUId>0</bts:partnerUId>
            <bts:puntoVentaUId>0</bts:puntoVentaUId>
            <bts:vendedorUId>0</bts:vendedorUId>
         </bts:sdtPartner>
      </bts:BTPartners.ObtenerMarcas>
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
    "Token": "C3367D27ABD2BC994403ECCD"
  },
  "sdtPartner": {
    "partnerUId": 0,
    "puntoVentaUId": 0,
    "vendedorUId": 0
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
      <BTPartners.ObtenerMarcasResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento/>
            <Canal>BTDIGITAL</Canal>
            <Token>TOKEN_AQUI</Token>
         </Btinreq>
         <sdtMarcas>
            <marcaUId>0</marcaUId>
            <nombreMarca/>
            <tipoMarca/>
            <tipoMarcaId>0</tipoMarcaId>
         </sdtMarcas>
         <Erroresnegocio/>
         <Btoutreq>
            <Numero>00000000</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.ObtenerMarcas</Servicio>
            <Requerimiento/>
            <Fecha>2026-01-01</Fecha>
            <Canal>BTDIGITAL</Canal>
            <Hora>00:00:00</Hora>
         </Btoutreq>
      </BTPartners.ObtenerMarcasResponse>
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
    "Token": "C3367D27ABD2BC994403ECCD"
  },
  "sdtMarcas": [],
  "Erroresnegocio": [
    {
      "Severidad": "E",
      "Descripcion": "El Canal está asociado a un Partner Inhabilitado.",
      "Codigo": 30005
    }
  ],
  "Btoutreq": {
    "Numero": 37643,
    "Estado": "NEG_ERROR",
    "Servicio": "BTPartners.ObtenerMarcas",
    "Requerimiento": "1",
    "Fecha": "2026-05-12",
    "Hora": "17:20:55",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTPartnerInReq

### sBTPartnerInReq

::: center
Los campos del tipo de dato estructurado sBTPartnerInReq son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
partnerUId | Int | 
puntoVentaUId | Int | 
vendedorUId | Int | 
:::

::: details sBTMarca

### sBTMarca

::: center
Los campos del tipo de dato estructurado sBTMarca son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
marcaUId | Long | 
nombreMarca | String | 
tipoMarca | String | 
tipoMarcaId | Short | 
:::
<!-- CIERRA SDT -->
