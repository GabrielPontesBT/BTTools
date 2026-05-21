---
title:  Obtener Tipos De Partner
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
::: note Método para obtener los tipos de Partner.

**Nombre publicación:** BTPartners.ObtenerTiposDePartner

**Programa:** RBTPN017

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
sdtTiposDePartner | [sBTTipoDePartner](#sbttipodepartner) | Listado de tipos de partner disponibles.

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
      <bts:BTPartners.ObtenerTiposDePartner>
         <bts:Btinreq>
            <bts:Device>INSTALADOR</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>673543DE2A22DFAC951F9E41</bts:Token>
         </bts:Btinreq>

      </bts:BTPartners.ObtenerTiposDePartner>
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
    "Token": "673543DE2A22DFAC951F9E41"
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
      <BTPartners.ObtenerTiposDePartnerResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>E7B55B3848F0357E436D77D3</Token>
         </Btinreq>
         <sdtTiposDePartner>
            <sBTTipoDePartner>
               <TipoUId>1</TipoUId>
               <Descripcion>Concesionario</Descripcion>
               <CantidadNiveles>3</CantidadNiveles>
               <Habilitado>S</Habilitado>
               <CantidadPartners>5</CantidadPartners>
            </sBTTipoDePartner>
            <sBTTipoDePartner>
               <TipoUId>2</TipoUId>
               <Descripcion>Casa de Electrodomésticos</Descripcion>
               <CantidadNiveles>3</CantidadNiveles>
               <Habilitado>S</Habilitado>
               <CantidadPartners>3</CantidadPartners>
            </sBTTipoDePartner>
            <sBTTipoDePartner>
               <TipoUId>3</TipoUId>
               <Descripcion>Institución Educativa</Descripcion>
               <CantidadNiveles>0</CantidadNiveles>
               <Habilitado>S</Habilitado>
               <CantidadPartners>0</CantidadPartners>
            </sBTTipoDePartner>
         </sdtTiposDePartner>
         <Erroresnegocio></Erroresnegocio>
         <Btoutreq>
            <Numero>38306</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.ObtenerTiposDePartner</Servicio>
            <Requerimiento>1</Requerimiento>
            <Fecha>2026-05-20</Fecha>
            <Hora>15:26:13</Hora>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </BTPartners.ObtenerTiposDePartnerResponse>
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
  "sdtTiposDePartner": {
    "sBTTipoDePartner": [
      {
        "TipoUId": 1,
        "Descripcion": "Concesionario",
        "CantidadNiveles": 3,
        "Habilitado": "S",
        "CantidadPartners": 5
      },
      {
        "TipoUId": 2,
        "Descripcion": "Casa de Electrodomésticos",
        "CantidadNiveles": 3,
        "Habilitado": "S",
        "CantidadPartners": 3
      },
      {
        "TipoUId": 3,
        "Descripcion": "Institución Educativa",
        "CantidadNiveles": 0,
        "Habilitado": "S",
        "CantidadPartners": 0
      }
    ]
  },
  "Erroresnegocio": {},
  "Btoutreq": {
    "Numero": 38306,
    "Estado": "OK",
    "Servicio": "BTPartners.ObtenerTiposDePartner",
    "Requerimiento": 1,
    "Fecha": "2026-05-20",
    "Hora": "15:26:13",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTTipoDePartner

### sBTTipoDePartner

::: center
Los campos del tipo de dato estructurado sBTTipoDePartner son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CantidadNiveles | Int | Cantidad de niveles definidos para el tipo.
CantidadPartners | Int | Cantidad de partners del tipo.
Descripcion | String | Descripción del tipo de partner.
Habilitado | String | Indica si el tipo está habilitado (S/N).
TipoUId | Short | Identificador único del tipo de partner.
:::
<!-- CIERRA SDT -->
