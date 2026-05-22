---
title: Update Product
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para realizar un cambio de producto en una cuenta de ahorros.

**Nombre publicación:** PublicSavingAccounts.updateProduct

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0005

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
productGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

No aplica.

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
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "savingAccountGUID": "00000000-0000-0000-0000-000000000000",
  "productGUID": "dd98b54d-73d9-4248-b760-5e62b24617ac"
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
    "Token": "6DE1A63E925E05BB399BAC77"
  },
  "BusinessErrors": {
    "BusinessError": [
      {
        "Code": 500,
        "Severity": "",
        "Target": "",
        "Description": "API internal error - Id:     980003 - Desc: No existe el producto ingresado"
      }
    ]
  },
  "Btoutreq": {
    "Estado": "NEG_INFO",
    "Fecha": "2026-05-22",
    "Hora": "15:56:47",
    "Numero": 13505896,
    "Servicio": "PublicSavingAccounts.updateProduct",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


