---
title: Get Marital Statuses
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los estados civiles.

**Nombre publicación:** PublicPersons.getMaritalStatuses

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0006

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
maritalStatuses | [SdtsBTPEWMaritalStatus](#sdtsbtpewmaritalstatus) | Listado de estados civiles.

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
    "Token": "0F262E85182DF86F9CA30F0E"
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "maritalStatuses": {
    "maritalStatus": [
      {
        "Id": 1,
        "Description": "SOLTERO/A",
        "RequiresSpouse": false
      },
      {
        "Id": 2,
        "Description": "CASADO/A",
        "RequiresSpouse": true
      },
      {
        "Id": 3,
        "Description": "SEPARADO/A",
        "RequiresSpouse": false
      },
      {
        "Id": 4,
        "Description": "VIUDO/A",
        "RequiresSpouse": false
      },
      {
        "Id": 5,
        "Description": "DIVORCIADO/A",
        "RequiresSpouse": false
      },
      {
        "Id": 6,
        "Description": "CONCUBINO/A",
        "RequiresSpouse": false
      },
      {
        "Id": 7,
        "Description": "CASADO C/SEP.DE BIEN",
        "RequiresSpouse": false
      },
      {
        "Id": 8,
        "Description": "UNIÓN LIBRE",
        "RequiresSpouse": false
      },
      {
        "Id": 9,
        "Description": "OTROS",
        "RequiresSpouse": false
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:29",
    "Numero": 13469340,
    "Servicio": "PublicPersons.getMaritalStatuses",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWMaritalStatus

### SdtsBTPEWMaritalStatus

::: center
Los campos del tipo de dato estructurado SdtsBTPEWMaritalStatus son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Byte $<(Length: 2)>$ | Identificador.
Description | String $<(Length: 20)>$ | Descripción.
RequiresSpouse | Boolean | Requiere cónyuge.
:::
<!-- CIERRA SDT -->
