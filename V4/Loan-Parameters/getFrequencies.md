---
title: Get Frequencies
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la periodicidad de cuotas de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.getFrequencies

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0028

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
frequencies | [SdtsBTLOListParameter](#sdtsbtlolistparameter) | Listado de frecuencias de pago.

@tab Errores

Código | Descripción
:--------- | :-----------
120050009 | Debe ingresar el GUID de producto.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "15A37FA9852954F6770E9868"
  },
  "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
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
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "15A37FA9852954F6770E9868"
  },
  "frequencies": {
    "frequency": [
      {
        "id": 7,
        "description": "SEMANAL",
        "defaultValue": true
      },
      {
        "id": 15,
        "description": "BISEMANAL",
        "defaultValue": false
      },
      {
        "id": 30,
        "description": "MENSUAL",
        "defaultValue": false
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:34:58",
    "Numero": 13568695,
    "Servicio": "PublicLoanParameters.getFrequencies",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOListParameter

### SdtsBTLOListParameter

::: center
Los campos del tipo de dato estructurado SdtsBTLOListParameter son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Int $<(length: 5)>$ | Identificador de frecuencia.
description | String $<(length: 256)>$ | Descripción de frecuencia.
defaultValue | Boolean | ¿Está preseteado como valor por defecto para el producto?
:::
<!-- CIERRA SDT -->