---
title: Actualizar Estado
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
::: note Método para actualizar el estado de un cliente.
Este servicio permite modificar el estado de un cliente existente, indicando el motivo del cambio y un comentario asociado.

**Nombre publicación:** PublicCustomers.updateStatus

**Módulo:** Customers

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | Identificador único del cliente.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
statusId | Int $<(length: ?)>$ | Identificador del nuevo estado a asignar.
reasonForStatusChangeId | Int $<(length: ?)>$ | Identificador del motivo del cambio de estado.
comment | String $<(length: ?)>$ | Comentario asociado al cambio de estado.

@tab Datos de Salida

No aplica.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?updateStatus' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "606B54A76488080E3507C093"
  },
  "counterpartyGUID": "e0304341-b453-4058-aaa9-c8ebc26b7da1",
  "statusId": "1",
  "reasonForStatusChangeId": "1",
  "comment": "..."
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
    "Token": "606B54A76488080E3507C093"
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-27",
    "Hora": "13:19:53",
    "Numero": "13047641",
    "Servicio": "PublicCustomers.updateStatus",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
