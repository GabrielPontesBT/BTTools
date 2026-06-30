---
title: Get Capital
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el rango de capital de un producto de préstamos, incluyendo su valor por defecto.

**Nombre publicación:** PublicLoanParameters.getCapital

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0022

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
minimum | Double $<(Length: 10)>$ | Capital mínimo.
maximum | Double $<(Length: 10)>$ | Capital máximo.
defaultValue | Double $<(Length: 10)>$ | Capital por defecto.

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
  "minimum": 2000,
  "maximum": 200000,
  "defaultValue": 2000,
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:34:40",
    "Numero": 13568691,
    "Servicio": "PublicLoanParameters.getCapital",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
