---
title: Get Additional Information
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información adicional de una persona.

**Nombre publicación:** PublicPersons.getAdditionalInformation

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0029

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
customFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Listado de campos personalizados.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.

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
  },
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9"
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
  "customFields": {
    "customField": [
      {
        "Correlative": 1,
        "Id": "Afición",
        "Value": "0",
        "Description": ""
      },
      {
        "Correlative": 1,
        "Id": "Profesión",
        "Value": "0",
        "Description": ""
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:30",
    "Numero": 13469364,
    "Servicio": "PublicPersons.getAdditionalInformation",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPAWCustomField

### SdtsBTPAWCustomField

::: center
Los campos del tipo de dato estructurado SdtsBTPAWCustomField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Id | String $<(Length: 30)>$ | Identificador.
Description | String $<(Length: 50)>$ | Descripción.
Value | String $<(Length: 250)>$ | Value.
:::
<!-- CIERRA SDT -->
