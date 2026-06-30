---
title: Get Rate
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la tasa definida para un producto.

**Nombre publicación:** PublicLoanParameters.getRate

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0026

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
defaultRate | Double $<(Length: 11)>$ | Tasa por defecto.
rateTypeId | Byte $<(Length: 1)>$ | Tipo de tasa.
rateTypeDescription | String $<(Length: 20)>$ | Descripción de tipo de tasa.

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
  "defaultRate": 20,
  "rateTypeId": 1,
  "rateTypeDescription": "Efectiva Anual",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:36:33",
    "Numero": 13568710,
    "Servicio": "PublicLoanParameters.getRate",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
