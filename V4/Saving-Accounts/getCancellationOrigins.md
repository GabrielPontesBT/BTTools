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


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationOrigins | [SdtsBTLICancellationOrigin](#sdtsbtlicancellationorigin) | Listado de orígenes de cancelación.

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
    "Token": "8EE696AD86E93556C39DD2CC"
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
    "Fecha": "2026-05-13",
    "Hora": "20:54:06",
    "Numero": 13466302,
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
id | Short $<(Length: 4)>$ | Identificador de origen de cierre.
description | String $<(Length: 40)>$ | Descripción.
:::
<!-- CIERRA SDT -->
