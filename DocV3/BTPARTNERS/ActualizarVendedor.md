---
title:  Actualizar Vendedor
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
::: note Método para actualizar un vendedor de Partner.

**Nombre publicación:** BTPartners.ActualizarVendedor

**Programa:** RBTPN015

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtVendedor | [sBTVendedor](#sbtvendedor) | Listado de datos del vendedor.

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
      <bts:BTPartners.ActualizarVendedor>
         <Btinreq>
            <Canal>BTDIGITAL</Canal>
            <Usuario>INSTALADOR</Usuario>
            <Device>FPAIS</Device>
            <Requerimiento>1</Requerimiento>
            <Token>0A4505C5C795F276A390FC46</Token>
          </Btinreq>
         <bts:sdtVendedor>
            <bts:registradoEnBantotal>S</bts:registradoEnBantotal>
            <bts:habilitado>S</bts:habilitado>
            <bts:clienteUId>402</bts:clienteUId>
            <bts:puntoVentaUId>1</bts:puntoVentaUId>
            <bts:partnerUId>1</bts:partnerUId>
            <bts:personaUId>269</bts:personaUId>
            <bts:email></bts:email>
            <bts:nombrePuntoVenta></bts:nombrePuntoVenta>
            <bts:telefono></bts:telefono>
            <bts:codigoComision></bts:codigoComision>
            <bts:usuarioBantotal></bts:usuarioBantotal>
            <bts:nombre></bts:nombre>
            <bts:vendedorUId>1</bts:vendedorUId>
         </bts:sdtVendedor>
      </bts:BTPartners.ActualizarVendedor>
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
  "sdtVendedor": {
    "registradoEnBantotal": "S",
    "habilitado": "S",
    "clienteUId": 402,
    "puntoVentaUId": 1,
    "partnerUId": 1,
    "personaUId": 269,
    "email": "",
    "nombrePuntoVenta": "",
    "telefono": "",
    "codigoComision": "",
    "usuarioBantotal": "",
    "nombre": "",
    "vendedorUId": 1
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
      <BTPartners.ActualizarVendedorResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>E7B55B3848F0357E436D77D3</Token>
         </Btinreq>
         <Erroresnegocio></Erroresnegocio>
         <Btoutreq>
            <Numero>38350</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.ActualizarVendedor</Servicio>
            <Requerimiento>1</Requerimiento>
            <Fecha>2026-05-20</Fecha>
            <Hora>16:40:24</Hora>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </BTPartners.ActualizarVendedorResponse>
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
    "Token": "E7B55B3848F0357E436D77D3"
  },
  "Erroresnegocio": {},
  "Btoutreq": {
    "Numero": 38350,
    "Estado": "OK",
    "Servicio": "BTPartners.ActualizarVendedor",
    "Requerimiento": 1,
    "Fecha": "2026-05-20",
    "Hora": "16:40:24",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTVendedor

### sBTVendedor

::: center
Los campos del tipo de dato estructurado sBTVendedor son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
clienteUId | Long | Identificador único del cliente en Bantotal.
codigoComision | Int | Código de comisión asignado al vendedor.
email | String | Correo electrónico del vendedor.
habilitado | String | Indica si el vendedor está habilitado (S/N).
nombre | String | Nombre del vendedor.
nombrePuntoVenta | String | Nombre del punto de venta al que pertenece.
partnerUId | Int | Identificador único del partner.
personaUId | Long | Identificador único de la persona en Bantotal.
puntoVentaUId | Int | Identificador único del punto de venta.
registradoEnBantotal | String | Indica si el vendedor está registrado en Bantotal (S/N).
telefono | String | Número de teléfono del vendedor.
usuarioBantotal | String | Nombre de usuario en Bantotal.
vendedorUId | Int | Identificador único del vendedor.
:::
<!-- CIERRA SDT -->
