---
title:  Obtener Versiones
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
::: note Método para retornar las versiones del modelo.

**Nombre publicación:** BTPartners.ObtenerVersiones

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
modeloUId | Long | 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sdtVersiones | Collection | 

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
  'http://SQLSERVER1:8445/btdeveloper/servlet/com.dlya.bantotal.odwsbt_BTPartners?ObtenerVersiones' \
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
    "Servicio": "BTPartners.ObtenerVersiones",
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
::: details sdtVersiones

### sdtVersiones

::: center
Los campos del tipo de dato estructurado sdtVersiones son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
nombreVersion | String|
anio | Short|
combustibleId | Short|
puertas | String|
transmisionId | Short|
versionUId | Long|
condicion | String|
precioMN | Double|
precioUS | Double|
condicionId | Short|
combustible | String|
transmision | String|
puertasId | Short|
marcaUId | Long|
modeloUId | Long|
:::
<!-- CIERRA SDT -->

