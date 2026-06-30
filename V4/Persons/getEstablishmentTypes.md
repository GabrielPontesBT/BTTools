---
title: Get Establishment Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los tipos de establecimiento.

**Nombre publicación:** PublicPersons.getEstablishmentTypes

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0005

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
establishmentTypes | [SdtsBTPEWEstablishmentType](#sdtsbtpewestablishmenttype) | Listado de tipos de establecimiento.

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
  "establishmentTypes": {
    "establishmentType": [
      {
        "Id": 1,
        "Description": "MERCADO"
      },
      {
        "Id": 2,
        "Description": "ESTABLECIMIENTO / LOCAL"
      },
      {
        "Id": 3,
        "Description": "ASOCIACIÓN"
      },
      {
        "Id": 4,
        "Description": "GALERÍA"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:20",
    "Numero": 13469336,
    "Servicio": "PublicPersons.getEstablishmentTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWEstablishmentType

### SdtsBTPEWEstablishmentType

::: center
Los campos del tipo de dato estructurado SdtsBTPEWEstablishmentType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Int $<(Length: 6)>$ | Identificador.
Description | String $<(Length: 50)>$ | Descripción.
:::
<!-- CIERRA SDT -->
