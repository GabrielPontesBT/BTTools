---
title: Get Relationships
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las relaciones de una persona.

**Nombre publicación:** PublicPersons.getRelationships

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0036

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
relationships | [SdtsBTPEWRelationship](#sdtsbtpewrelationship) | Listado de relaciones.

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
  "relationships": {
    "relationship": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:25",
    "Numero": 13469359,
    "Servicio": "PublicPersons.getRelationships",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWRelationship

### SdtsBTPEWRelationship

::: center
Los campos del tipo de dato estructurado SdtsBTPEWRelationship son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Bidirectional | Boolean | Bidireccional.
BondId | Short | Identificador del vínculo.
BondDescription | String $<(Length: 30)>$ | Descripción del vínculo.
IntegrantName | String $<(Length: 70)>$ | Nombre del integrante.
JobTitleId | Short | Identificador del cargo.
Percentage | Double $<(Length: 8)>$ | Porcentaje.
PersonGUID | String $<(Length: 36)>$ | GUID (identificador único global) de persona.
:::
<!-- CIERRA SDT -->
