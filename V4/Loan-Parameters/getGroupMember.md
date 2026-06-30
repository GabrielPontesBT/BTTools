---
title: Get Group Member
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la cantidad de integrantes permitidos en un crédito grupal.

**Nombre publicación:** PublicLoanParameters.getGroupMember

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0025

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
minimum | Short $<(Length: 3)>$ | Número mínimo de integrantes.
maximum | Short $<(Length: 3)>$ | Número máximo de integrantes.

@tab Errores

No aplica.
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
  "cycleId": "1"
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
  "minimum": 3,
  "maximum": 999,
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:35:26",
    "Numero": 13568704,
    "Servicio": "PublicLoanParameters.getGroupMember",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
