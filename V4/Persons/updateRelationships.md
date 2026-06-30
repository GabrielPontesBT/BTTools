---
title: Update Relationships
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar las relaciones de una persona.

**Nombre publicación:** PublicPersons.updateRelationships

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0037

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.


@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
relationships | [SdtsBTPEWRelationship](#sdtsbtpewrelationship) | Listado de relaciones. 

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40010087 | Vínculo incorrecto
40010095 | Relación no existe
40010096 | El vínculo de cónyuge se agrega desde el alta/modificación de persona
40010097 | Relación ya existe
40010098 | Ya se ingresó un vínculo con esta persona
40010099 | La persona a relacionar ya tiene un vínculo existente con otra persona
40010100 | No puede relacionarse a sí mismo
40010102 | El vínculo de cónyuge debe ser eliminado desde el alta/modificación de persona
40020017 | La persona ingresada no existe
40050001 | Debe ingresar el GUID de persona.
50050003 | No se encuentra la empresa
99990010006 | No se pudo resolver el usuario
99990010007 | No se pudo resolver la empresa

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
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9",
  "relationships": {
    "relationship": [
      {
        "BondId": 1,
        "PersonGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
        "Bidirectional": false,
        "Percentage": 0,
        "JobTitleId": 0
      }
    ]
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
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:56:18",
    "Numero": 13469383,
    "Servicio": "PublicPersons.updateRelationships",
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
