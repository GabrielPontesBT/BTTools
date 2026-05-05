---
title:  Obtener Productos Partner
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
::: note Método para obtener los productos habilitados del Partner.

**Nombre publicación:** BTPartners.ObtenerProductosPartner

**Programa:** Completar manualmente

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtPartner | SdtsBTPartnerInReq | 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtProductos | Collection | 

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
  'http://SQLSERVER1:8445/btdeveloper/servlet/com.dlya.bantotal.odwsbt_BTPartners?ObtenerProductosPartner' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "TOKEN_AQUI"
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
    "Token": "TOKEN_AQUI"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
    "Servicio": "BTPartners.ObtenerProductosPartner",
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
::: details sdtProductos

### sdtProductos

::: center
Los campos del tipo de dato estructurado sdtProductos son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
otrosConceptos | Collection|
papel | String|
moneda | String|
productoUId | Long|
nombre | String|
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details otrosConceptos

### otrosConceptos

::: center
Los campos del tipo de dato estructurado otrosConceptos son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
texto | String|
valor | Double|
concepto | String|
:::
<!-- CIERRA SDT -->

