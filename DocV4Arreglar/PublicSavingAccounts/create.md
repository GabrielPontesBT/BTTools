---
title: Crear [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contratar una cuenta de ahorro.

**Nombre publicación:** PublicSavingAccounts.create

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.
productGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.
subAccountName | String $<(length: 255)>$ | Nombre de la subcuenta.
branchId | Int $<(length: 5)>$ | Identificador de sucursal.
signatureType | String $<(length: 1)>$ | Tipo de integración.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

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
    "Token": "B2C4370CAA727E6B96067AB0"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "productGUID": "28169aa2-61c3-43ca-9fa9-e12ff30d4b71",
  "subAccountName": "Cuenta de Ahorro",
  "branchId": 1,
  "signatureType": "A"
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
    "Token": "B2C4370CAA727E6B96067AB0"
  },
  "savingAccountGUID": "44a8b232-9376-451e-9553-2cb037254a3e",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-11",
    "Hora": "22:48:10",
    "Numero": 13459142,
    "Servicio": "PublicSavingAccounts.create",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


