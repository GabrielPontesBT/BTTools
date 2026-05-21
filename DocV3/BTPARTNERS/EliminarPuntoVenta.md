---
title:  Eliminar Punto Venta
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
::: note Método para eliminar un punto de venta de Partner.

**Nombre publicación:** BTPartners.EliminarPuntoVenta

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

No aplica.

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
      <bts:BTPartners.EliminarPuntoVenta>
         <Btinreq>
            <Canal>BTDIGITAL</Canal>
            <Usuario>INSTALADOR</Usuario>
            <Device>FPAIS</Device>
            <Requerimiento>1</Requerimiento>
            <Token>0A4505C5C795F276A390FC46</Token>
          </Btinreq>
         <bts:sdtPuntoVenta>
            <bts:sucursal>1</bts:sucursal>
            <bts:habilitado>S</bts:habilitado>
            <bts:puntoVentaUId>5</bts:puntoVentaUId>
            <bts:partnerUId>1</bts:partnerUId>
            <bts:nombre>PruebaFacu</bts:nombre>
            <bts:codigoComision>1</bts:codigoComision>
         </bts:sdtPuntoVenta>
      </bts:BTPartners.EliminarPuntoVenta>
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
    "Token": "0A4505C5C795F276A390FC46"
  },
  "sdtPuntoVenta": {
    "sucursal": 1,
    "habilitado": "S",
    "puntoVentaUId": 5,
    "partnerUId": 1,
    "nombre": "PruebaFacu",
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
      <BTPartners.EliminarPuntoVentaResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>0A4505C5C795F276A390FC46</Token>
         </Btinreq>
         <Erroresnegocio></Erroresnegocio>
         <Btoutreq>
            <Numero>38479</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.EliminarPuntoVenta</Servicio>
            <Requerimiento>1</Requerimiento>
            <Fecha>2026-05-21</Fecha>
            <Hora>15:03:46</Hora>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </BTPartners.EliminarPuntoVentaResponse>
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
    "Token": "0A4505C5C795F276A390FC46"
  },
  "Erroresnegocio": {},
  "Btoutreq": {
    "Numero": 38479,
    "Estado": "OK",
    "Servicio": "BTPartners.EliminarPuntoVenta",
    "Requerimiento": 1,
    "Fecha": "2026-05-21",
    "Hora": "15:03:46",
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
