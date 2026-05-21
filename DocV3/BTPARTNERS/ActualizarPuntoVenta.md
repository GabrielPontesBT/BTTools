---
title:  Actualizar Punto Venta
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
::: note Método Actualizar Punto Venta de Partner.

**Nombre publicación:** BTPartners.ActualizarPuntoVenta

**Programa:** RBTPN016

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtPuntoVenta | [sBTPuntoVenta](#sbtpuntoventa) | Listado de datos del punto de venta.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------

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
      <bts:BTPartners.ActualizarPuntoVenta>
         <Btinreq>
            <Canal>BTDIGITAL</Canal>
            <Usuario>INSTALADOR</Usuario>
            <Device>FPAIS</Device>
            <Requerimiento>1</Requerimiento>
            <Token>8D8FB1A2E87D4E904004B6BB</Token>
          </Btinreq>
         <bts:sdtPuntoVenta>
            <bts:sucursal>1</bts:sucursal>
 			<bts:habilitado>S</bts:habilitado>
			 <bts:puntoVentaUId>1</bts:puntoVentaUId>
 			<bts:partnerUId>1</bts:partnerUId>
 			<bts:nombre>PuntoPrueba</bts:nombre>
 			<bts:codigoComision>1</bts:codigoComision>
         </bts:sdtPuntoVenta>
      </bts:BTPartners.ActualizarPuntoVenta>
   </soapenv:Body>
</soapenv:Envelope>
```
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": 1,
    "Token": "8D8FB1A2E87D4E904004B6BB"
  },
  "sdtPuntoVenta": {
    "sucursal": 1,
    "habilitado": "S",
    "puntoVentaUId": 1,
    "partnerUId": 1,
    "nombre": "PuntoPrueba",
    "codigoComision": 1
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
      <BTPartners.ActualizarPuntoVentaResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>8D8FB1A2E87D4E904004B6BB</Token>
         </Btinreq>
         <Erroresnegocio></Erroresnegocio>
         <Btoutreq>
            <Numero>38387</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.ActualizarPuntoVenta</Servicio>
            <Requerimiento>1</Requerimiento>
            <Fecha>2026-05-20</Fecha>
            <Hora>17:24:52</Hora>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </BTPartners.ActualizarPuntoVentaResponse>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```
@tab JSON
```json
{
  "Btinreq": {
    "Device": "FPAIS",
    "Usuario": "INSTALADOR",
    "Requerimiento": 1,
    "Canal": "BTDIGITAL",
    "Token": "8D8FB1A2E87D4E904004B6BB"
  },
  "Erroresnegocio": {},
  "Btoutreq": {
    "Numero": 38387,
    "Estado": "OK",
    "Servicio": "BTPartners.ActualizarPuntoVenta",
    "Requerimiento": 1,
    "Fecha": "2026-05-20",
    "Hora": "17:24:52",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTPuntoVenta

### sBTPuntoVenta

::: center
Los campos del tipo de dato estructurado sBTPuntoVenta son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
codigoComision | Int | Código de comisión asignado al punto de venta.
habilitado | String | Indica si el punto de venta está habilitado (S/N).
nombre | String | Nombre del punto de venta.
partnerUId | Int | Identificador único del partner.
puntoVentaUId | Int | Identificador único del punto de venta.
sucursal | Int | Número de sucursal asociada.
:::
<!-- CIERRA SDT -->
