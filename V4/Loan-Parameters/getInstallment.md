---
title: Get Installment
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la cantidad de cuotas parametrizadas de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.getInstallment

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0021

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
minimum | Long $<(Length: 10)>$ | Cantidad mínima de cuotas.
maximum | Long $<(Length: 10)>$ | Cantidad máxima de cuotas.
defaultValue | Long $<(Length: 10)>$ | Cantidad de cuotas por defecto.

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
  "minimum": 1,
  "maximum": 120,
  "defaultValue": 12,
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:35:39",
    "Numero": 13568707,
    "Servicio": "PublicLoanParameters.getInstallment",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
