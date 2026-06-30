---
title: Get Housing Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los tipos de vivienda.

**Nombre publicación:** PublicPersons.getHousingTypes

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0004

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
housingTypes | [SdtsBTPEWHousingType](#sdtsbtpewhousingtype) | Listado de tipos de vivienda.

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
  "housingTypes": {
    "housingType": [
      {
        "Id": 1,
        "Description": "PROPIETARIO"
      },
      {
        "Id": 2,
        "Description": "INQUILINO"
      },
      {
        "Id": 3,
        "Description": "BHU"
      },
      {
        "Id": 4,
        "Description": "USUFRUCTO"
      },
      {
        "Id": 5,
        "Description": "FAMILIAR"
      },
      {
        "Id": 6,
        "Description": "OTROS"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:23",
    "Numero": 13469338,
    "Servicio": "PublicPersons.getHousingTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWHousingType

### SdtsBTPEWHousingType

::: center
Los campos del tipo de dato estructurado SdtsBTPEWHousingType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Byte $<(Length: 2)>$ | Identificador.
Description | String | Descripción.
:::
<!-- CIERRA SDT -->
