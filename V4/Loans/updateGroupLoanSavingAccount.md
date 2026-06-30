---
title: Update Group Loan Saving Account
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar la cuenta de ahorro de un grupo.

**Nombre publicación:** PublicLoans.updateGroupLoanSavingAccount

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0029

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
savingAccountExternalId | String $<(Length: 30)>$ | Identificador externo de cuenta de ahorro.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
120060101 | El grupo no existe.
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "groupId": 32,
  "savingAccountGUID": "6c1fcaa1-fa80-4764-b9d0-6441c5e0057c",
  "savingAccountExternalId": ""
}
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "18:13:09",
    "Numero": 13547121,
    "Servicio": "PublicLoans.updateGroupLoanSavingAccount",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
