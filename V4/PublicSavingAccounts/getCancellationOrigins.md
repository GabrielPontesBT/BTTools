---
title: Get Cancellation Origins
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los orígenes de cancelación.

**Nombre publicación:** PublicSavingAccounts.getCancellationOrigins

**Módulo:** Liabilities

**Programa:** PublicAPI.BTLIPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationOrigins | [SdtsBTLICancellationOrigin](#sdtsbtlicancellationorigin) | Listado de orígenes de cancelación.

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
  }
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
  "cancellationOrigins": {
    "cancellationOrigin": [
      {
        "id": 1,
        "description": "POR DECISIÓN DEL TITULAR"
      },
      {
        "id": 2,
        "description": "POR DECISIÓN DE LA ENTIDAD"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-22",
    "Hora": "15:56:28",
    "Numero": 13505888,
    "Servicio": "PublicSavingAccounts.getCancellationOrigins",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLICancellationOrigin

### SdtsBTLICancellationOrigin

::: center
Los campos del tipo de dato estructurado SdtsBTLICancellationOrigin son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
id | Short $<(length: 4)>$ | Identificador de origen de cierre.
description | String $<(length: 40)>$ | Descripción.
:::
<!-- CIERRA SDT -->
