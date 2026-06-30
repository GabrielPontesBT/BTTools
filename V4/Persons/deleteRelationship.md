---
title: Delete Relationship
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para eliminar la relación de una persona.

**Nombre publicación:** PublicPersons.deleteRelationship

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0038

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
bondId | Short $<(Length: 4)>$ | Identificador de relacion.
vinculatedPersonGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona vinculada.

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
  "bondId": 1,
  "vinculatedPersonGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d"
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
    "Hora": "18:56:41",
    "Numero": 13469392,
    "Servicio": "PublicPersons.deleteRelationship",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
