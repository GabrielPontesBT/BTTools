---
title:  Simular Ofertas
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
::: note Método para simular ofertas del Partner.

**Nombre publicación:** BTPartners.SimularOfertas

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
clienteUId | Long | 
sdtOfertaInput | SdtsBTOfertaInput | 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
simulacionId | Long | 
sdtOfertasPrestamo | Collection | 

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
  'http://SQLSERVER1:8445/btdeveloper/servlet/com.dlya.bantotal.odwsbt_BTPartners?SimularOfertas' \
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
    "Servicio": "BTPartners.SimularOfertas",
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
::: details sdtOfertasPrestamo

### sdtOfertasPrestamo

::: center
Los campos del tipo de dato estructurado sdtOfertasPrestamo son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
plazo | Int|
cft | Double|
tasa | Double|
totalSeguros | Double|
segurosDesembolso | Double|
fechaVencimiento | Date|
totalComisiones | Double|
fechaPrimerPago | Date|
valorCuota | Double|
impuestosDesembolso | Double|
otrosConceptos | Double|
tea | Double|
totalAPagar | Double|
totalIntereses | Double|
capital | Double|
totalImpuestos | Double|
comisionesDesembolso | Double|
montoDesembolso | Double|
fechaValor | Date|
cantidadCuotas | Int|
:::
<!-- CIERRA SDT -->

