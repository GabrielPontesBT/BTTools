---
title: Obtener Estado
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
::: note Método para obtener los estados de clientes.
Este servicio permite consultar el catálogo de estados disponibles para clientes.

**Nombre publicación:** PublicCustomers.getStatuses

**Módulo:** Customers

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
status | Colección | Lista de estados disponibles.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicCustomers_v1?getStatuses' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "182E0F606172EEAEA2CD8C0F"
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
    "Token": "182E0F606172EEAEA2CD8C0F"
  },
  "status": {
    "statusItem": [
      {
        "Id": "1",
        "Description": "ACTIVA"
      },
      {
        "Id": "2",
        "Description": "INHABILITADA"
      },
      {
        "Id": "3",
        "Description": "CERRADA"
      },
      {
        "Id": "9",
        "Description": "ALTA INCONCLUSA (INST.FINANC.)"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-23",
    "Hora": "13:27:50",
    "Numero": "13036325",
    "Servicio": "PublicCustomers.getStatuses",
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
::: details statu

### statu

::: center
Los campos del tipo de dato estructurado statu son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String $<(length: ?)>$ |
Description | String $<(length: ?)>$ |
:::
<!-- CIERRA SDT -->
