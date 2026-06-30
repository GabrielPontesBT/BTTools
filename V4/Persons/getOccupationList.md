---
title: Get Occupation List
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las ocupaciones.

**Nombre publicación:** PublicPersons.getOccupationList

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0023

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
occupations | [SdtsBTPEWOccupationQuery](#sdtsbtpewoccupationquery) | Listado de ocupaciones.

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
  "occupations": {
    "occupation": [
      {
        "OccupationId": 1,
        "OccupationDescription": "EMPLEADO",
        "OccupationTypeId": 1,
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": 2,
        "OccupationDescription": "OBRERO",
        "OccupationTypeId": 1,
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": 3,
        "OccupationDescription": "EMPRESARIO",
        "OccupationTypeId": 2,
        "OccupationTypeDescription": "INDEPENDIENTE"
      },
      {
        "OccupationId": 4,
        "OccupationDescription": "JUBILADO/PENSIONISTA",
        "OccupationTypeId": 3,
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": 5,
        "OccupationDescription": "AMA DE CASA",
        "OccupationTypeId": 3,
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": 6,
        "OccupationDescription": "MILITAR",
        "OccupationTypeId": 1,
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": 7,
        "OccupationDescription": "POLICÍA",
        "OccupationTypeId": 1,
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": 8,
        "OccupationDescription": "AGROPECUARIO",
        "OccupationTypeId": 2,
        "OccupationTypeDescription": "INDEPENDIENTE"
      },
      {
        "OccupationId": 9,
        "OccupationDescription": "ESTUDIANTE",
        "OccupationTypeId": 3,
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": 10,
        "OccupationDescription": "PROFESIONAL INDEPENDIENTE",
        "OccupationTypeId": 2,
        "OccupationTypeDescription": "INDEPENDIENTE"
      },
      {
        "OccupationId": 11,
        "OccupationDescription": "EMPLEADO DE LA INSTITUCION",
        "OccupationTypeId": 1,
        "OccupationTypeDescription": "DEPENDIENTE"
      },
      {
        "OccupationId": 12,
        "OccupationDescription": "OTROS",
        "OccupationTypeId": 3,
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": 21,
        "OccupationDescription": "OTROS",
        "OccupationTypeId": 3,
        "OccupationTypeDescription": "OTRO"
      },
      {
        "OccupationId": 22,
        "OccupationDescription": "OTROS",
        "OccupationTypeId": 2,
        "OccupationTypeDescription": "INDEPENDIENTE"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:32",
    "Numero": 13469341,
    "Servicio": "PublicPersons.getOccupationList",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWOccupationQuery

### SdtsBTPEWOccupationQuery

::: center
Los campos del tipo de dato estructurado SdtsBTPEWOccupationQuery son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
OccupationId | Int $<(Length: 5)>$ | Identificador de ocupación.
OccupationDescription | String $<(Length: 30)>$ | Descripción de la ocupación.
OccupationTypeId | Short | Identificador del tipo de ocupación.
OccupationTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de ocupación.
:::
<!-- CIERRA SDT -->
