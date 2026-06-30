---
title: Get Group Capital
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el rango de capital de un producto de préstamos, incluyendo su valor por defecto.

**Nombre publicación:** PublicLoanParameters.getGroupCapital

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0027

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
minimum | Double $<(Length: 18)>$ | Capital mínimo.
maximum | Double $<(Length: 18)>$ | Capital máximo.

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
  "cycleId": "1",
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
  "minimum": 10000,
  "maximum": 100000000,
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:35:14",
    "Numero": 13568699,
    "Servicio": "PublicLoanParameters.getGroupCapital",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
