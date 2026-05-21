---
title:  Eliminar Partner
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
::: note Método Eliminar Partner de Partner.

**Nombre publicación:** BTPartners.EliminarPartner

**Programa:** RBTPN019

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtPartner | [sBTPartner](#sbtpartner) | Listado de datos del partner.

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
      <bts:BTPartners.EliminarPartner>
         <Btinreq>
            <Canal>BTDIGITAL</Canal>
            <Usuario>INSTALADOR</Usuario>
            <Device>FPAIS</Device>
            <Requerimiento>1</Requerimiento>
            <Token>0A4505C5C795F276A390FC46</Token>
          </Btinreq>
         <bts:sdtPartner>
            <bts:tipoUId>1</bts:tipoUId>
            <bts:nivelUId>1</bts:nivelUId>
            <bts:habilitado>S</bts:habilitado>
            <bts:clienteUId>345</bts:clienteUId>
            <bts:partnerUId>12</bts:partnerUId>
            <bts:canal>FACUP</bts:canal>
            <bts:tipo></bts:tipo>
            <bts:codigoComision>1</bts:codigoComision>
            <bts:nivel></bts:nivel>
            <bts:nombre>Prueba</bts:nombre>
            <bts:tipoRegistroVendedor>U</bts:tipoRegistroVendedor>
            <bts:sucursal>1</bts:sucursal>
            <bts:manejaVendedores>N</bts:manejaVendedores>
         </bts:sdtPartner>
      </bts:BTPartners.EliminarPartner>
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
  "sdtPartner": {
    "tipoUId": 1,
    "nivelUId": 1,
    "habilitado": "S",
    "clienteUId": 345,
    "partnerUId": 12,
    "canal": "FACUP",
    "tipo": "",
    "codigoComision": 1,
    "nivel": "",
    "nombre": "Prueba",
    "tipoRegistroVendedor": "U",
    "sucursal": 1,
    "manejaVendedores": "N"
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
      <BTPartners.EliminarPartnerResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>0A4505C5C795F276A390FC46</Token>
         </Btinreq>
         <Erroresnegocio></Erroresnegocio>
         <Btoutreq>
            <Numero>38478</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.EliminarPartner</Servicio>
            <Requerimiento>1</Requerimiento>
            <Fecha>2026-05-21</Fecha>
            <Hora>15:01:24</Hora>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </BTPartners.EliminarPartnerResponse>
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
    "Numero": 38478,
    "Estado": "OK",
    "Servicio": "BTPartners.EliminarPartner",
    "Requerimiento": 1,
    "Fecha": "2026-05-21",
    "Hora": "15:01:24",
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
canal | String | Canal de comunicación.
clienteUId | Long | Identificador único del cliente en Bantotal.
codigoComision | Int | Código de comisión asignado al partner.
habilitado | String | Indica si el partner está habilitado (S/N).
manejaVendedores | String | Indica si el partner maneja vendedores (S/N).
nivel | String | Descripción del nivel del partner.
nivelUId | Byte | Identificador único del nivel.
nombre | String | Nombre del partner.
partnerUId | Int | Identificador único del partner.
sucursal | Int | Número de sucursal asociada.
tipo | String | Descripción del tipo de partner.
tipoRegistroVendedor | String | Tipo de registro del vendedor.
tipoUId | Short | Identificador único del tipo de partner.
:::
<!-- CIERRA SDT -->
