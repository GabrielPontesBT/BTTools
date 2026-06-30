---
title: Unblock
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para desbloquear una cuenta de ahorro.

**Nombre publicación:** PublicSavingAccounts.unblock

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0003

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.


@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
90031 | El código contable no existe
90120 | Cuenta contable no tiene tipo
90121 | Cuenta contable no puede ser 0
170025 | No se encontró el registro de la cuenta vista que va cambiar de estado
50050003 | No se encuentra la empresa
14001010001 | Debe ingresar el GUID de la cuenta de ahorro.
99990010006 | No se pudo resolver el usuario
99990010007 | No se pudo resolver la empresa

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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "savingAccountGUID": "92b2ce1f-34e7-4606-bdd4-e62bde656979"
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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:54:04",
    "Numero": 13466301,
    "Servicio": "PublicSavingAccounts.unblock",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


