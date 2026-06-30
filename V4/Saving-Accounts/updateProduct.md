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
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
14001010001 | Debe ingresar el GUID de la cuenta de ahorro.
14001010003 | Debe ingresar el GUID del producto.
140011027 | El producto no permite cambio.
140011028 | No es posible cambiar al producto indicado.
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
    "Token": "98FF1E4659B9A7B4F95BF7B5"
  },
  "savingAccountGUID": "42755eb6-18a7-4492-b17e-e248be17b5fd",
  "productGUID": "57a29eb2-f783-41dd-87a2-c53c2edcdf6e"
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
    "Token": "98FF1E4659B9A7B4F95BF7B5"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-20",
    "Hora": "19:57:25",
    "Numero": 13496130,
    "Servicio": "PublicSavingAccounts.updateProduct",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
