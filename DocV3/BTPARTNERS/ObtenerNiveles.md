---
title:  Obtener Niveles
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
::: note Método Obtener Niveles de Partner.

**Nombre publicación:** BTPartners.ObtenerNiveles

**Programa:** RBTPN018

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
tipoUId | Short | 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtNiveles | [sBTNivel](#sbtnivel) | Listado de niveles disponibles.

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
      <bts:BTPartners.ObtenerNiveles>
         <bts:Btinreq>
            <bts:Device>INSTALADOR</bts:Device>
            <bts:Usuario>INSTALADOR</bts:Usuario>
            <bts:Requerimiento></bts:Requerimiento>
            <bts:Canal>BTDIGITAL</bts:Canal>
            <bts:Token>673543DE2A22DFAC951F9E41</bts:Token>
         </bts:Btinreq>
         <bts:tipoUId>0</bts:tipoUId>
      </bts:BTPartners.ObtenerNiveles>
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
  },
  "tipoUId": 0
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
      <BTPartners.ObtenerNivelesResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Device>FPAIS</Device>
            <Usuario>INSTALADOR</Usuario>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
            <Token>E7B55B3848F0357E436D77D3</Token>
         </Btinreq>
         <sdtNiveles>
            <sBTNivel>
               <TipoUId>1</TipoUId>
               <Descripcion>Nivel 1A - Venta</Descripcion>
               <NivelUId>1</NivelUId>
               <Habilitado>S</Habilitado>
               <CantidadPartners>4</CantidadPartners>
            </sBTNivel>
            <sBTNivel>
               <TipoUId>1</TipoUId>
               <Descripcion>Nivel 2A - Venta y cobro cuota</Descripcion>
               <NivelUId>2</NivelUId>
               <Habilitado>S</Habilitado>
               <CantidadPartners>1</CantidadPartners>
            </sBTNivel>
            <sBTNivel>
               <TipoUId>1</TipoUId>
               <Descripcion>Nivel 3A - Venta, cobro y post-venta</Descripcion>
               <NivelUId>3</NivelUId>
               <Habilitado>S</Habilitado>
               <CantidadPartners>0</CantidadPartners>
            </sBTNivel>
         </sdtNiveles>
         <Erroresnegocio></Erroresnegocio>
         <Btoutreq>
            <Numero>38307</Numero>
            <Estado>OK</Estado>
            <Servicio>BTPartners.ObtenerNiveles</Servicio>
            <Requerimiento>1</Requerimiento>
            <Fecha>2026-05-20</Fecha>
            <Hora>15:41:29</Hora>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </BTPartners.ObtenerNivelesResponse>
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
  "sdtNiveles": {
    "sBTNivel": [
      {
        "TipoUId": 1,
        "Descripcion": "Nivel 1A - Venta",
        "NivelUId": 1,
        "Habilitado": "S",
        "CantidadPartners": 4
      },
      {
        "TipoUId": 1,
        "Descripcion": "Nivel 2A - Venta y cobro cuota",
        "NivelUId": 2,
        "Habilitado": "S",
        "CantidadPartners": 1
      },
      {
        "TipoUId": 1,
        "Descripcion": "Nivel 3A - Venta, cobro y post-venta",
        "NivelUId": 3,
        "Habilitado": "S",
        "CantidadPartners": 0
      }
    ]
  },
  "Erroresnegocio": {},
  "Btoutreq": {
    "Numero": 38307,
    "Estado": "OK",
    "Servicio": "BTPartners.ObtenerNiveles",
    "Requerimiento": 1,
    "Fecha": "2026-05-20",
    "Hora": "15:41:29",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTNivel

### sBTNivel

::: center
Los campos del tipo de dato estructurado sBTNivel son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CantidadPartners | Int | Cantidad de partners asociados al nivel.
Descripcion | String | Descripción del nivel.
Habilitado | String | Indica si el nivel está habilitado (S/N).
NivelUId | Short | Identificador único del nivel.
TipoUId | Short | Identificador único del tipo de partner.
:::
<!-- CIERRA SDT -->
