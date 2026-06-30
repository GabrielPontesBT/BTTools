---
title: Get Status Update Reasons
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los posibles motivos de cambio de estado para una contraparte.

**Nombre publicación:** PublicCustomers.getStatusUpdateReasons

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0011

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
reasonsForStatusChange | [SdtsBTCPWReasonForStatusChange](#sdtsbtcpwreasonforstatuschange) | Listado de razones de actualización de estado.

@tab Errores

Código | Descripción
:--------- | :-----------
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
    "Token": "444B674391BCA7676279700A"
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
    "Token": "444B674391BCA7676279700A"
  },
  "reasonsForStatusChange": {
    "reasonForStatusChange": [
      {
        "Id": 1,
        "Description": "EMBARGO",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 2,
        "Description": "EN JUICIO",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 3,
        "Description": "RETENCIONES",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 4,
        "Description": "CIERRE",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 5,
        "Description": "REGULARIZACIÓN",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 6,
        "Description": "CIERRE POR INACTIVIDAD",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 7,
        "Description": "FALLECIMIENTO",
        "StatusId": 2,
        "StatusDescription": "INHABILITADA"
      },
      {
        "Id": 8,
        "Description": "CIERRE",
        "StatusId": 3,
        "StatusDescription": "CERRADA"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:13:57",
    "Numero": 13468806,
    "Servicio": "PublicCustomers.getStatusUpdateReasons",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWReasonForStatusChange

### SdtsBTCPWReasonForStatusChange

::: center
Los campos del tipo de dato estructurado SdtsBTCPWReasonForStatusChange son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Byte $<(Length: 2)>$ | Identificador.
Description | String $<(Length: 30)>$ | Descripción.
StatusId | Byte $<(Length: 2)>$ | Identificador de estado.
StatusDescription | String $<(Length: 30)>$ | Descripción del estado.
:::
<!-- CIERRA SDT -->
