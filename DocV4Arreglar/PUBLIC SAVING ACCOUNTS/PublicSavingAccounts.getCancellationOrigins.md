---
title: Obtener Orígenes de Cancelación
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los orígenes de cancelación de Cajas de Ahorro.
Este servicio permite consultar el catálogo de orígenes/motivos de cancelación disponibles para productos de Ahorro (Saving Accounts).

**Nombre publicación:** PublicSavingAccounts.getCancellationOrigins

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sBTLIWCancellationOrigins | Array | Lista de orígenes de cancelación.

@tab Errores

Código | Descripción
:--------- | :-----------
10002 | Error en la ejecución del programa.
10011 | Sesión inválida.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicSavingAccounts_v1?getCancellationOrigins' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "2B869BC80423FD8B71F1EA6E"
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "2B869BC80423FD8B71F1EA6E"
  },
  "sBTLIWCancellationOrigins": {
    "sBTLIWCancellationOrigin": [
      {
        "Origin": "1",
        "Description": "POR DECISIÓN DEL TITULAR"
      },
      {
        "Origin": "2",
        "Description": "POR DECISIÓN DE LA ENTIDAD"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-28",
    "Hora": "12:30:58",
    "Numero": "13053784",
    "Servicio": "PublicSavingAccounts.getCancellationOrigins",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTLIWCancellationOrigin

### sBTLIWCancellationOrigin

::: center
Los campos del tipo de dato estructurado sBTLIWCancellationOrigin son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Origin | String |
Description | String |
:::
<!-- CIERRA SDT -->
