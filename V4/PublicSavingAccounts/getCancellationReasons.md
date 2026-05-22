---
title: Get Cancellation Reasons
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los motivos de cancelación.

**Nombre publicación:** PublicSavingAccounts.getCancellationReasons

**Módulo:** Liabilities

**Programa:** PublicAPI.BTLIPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationOriginId | Short $<(length: 4)>$ | Identificador del origen de cancelación.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationReasons | [SdtsBTLICancellationReason](#sdtsbtlicancellationreason) | Listado de motivos de cancelación.

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
  "cancellationOriginId": 1
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
  "cancellationReasons": {
    "cancellationReason": [
      {
        "id": 1,
        "description": "CAMBIO DE INSTITUCIÓN"
      },
      {
        "id": 2,
        "description": "CUENTA EN DESUSO"
      },
      {
        "id": 3,
        "description": "OTROS"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-22",
    "Hora": "15:56:30",
    "Numero": 13505889,
    "Servicio": "PublicSavingAccounts.getCancellationReasons",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLICancellationReason

### SdtsBTLICancellationReason

::: center
Los campos del tipo de dato estructurado SdtsBTLICancellationReason son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Short $<(length: 4)>$ | Identificador de motivo de cierre.
description | String $<(length: 40)>$ | Descripción.
:::
<!-- CIERRA SDT -->
