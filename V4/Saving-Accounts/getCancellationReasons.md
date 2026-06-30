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
cancellationOriginId | Short $<(Length: 4)>$ | Identificador del origen de cancelación.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationReasons | [SdtsBTLICancellationReason](#sdtsbtlicancellationreason) | Listado de motivos de cancelación.

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
    "Token": "8EE696AD86E93556C39DD2CC"
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
    "Token": "8EE696AD86E93556C39DD2CC"
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
    "Fecha": "2026-05-13",
    "Hora": "20:54:09",
    "Numero": 13466303,
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
id | Short $<(Length: 4)>$ | Identificador de motivo de cierre.
description | String $<(Length: 40)>$ | Descripción.
:::
<!-- CIERRA SDT -->
