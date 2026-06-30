---
title: Delete Occupation
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para eliminar la ocupación de una persona.

**Nombre publicación:** PublicPersons.deleteOccupation

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0035

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
correlative | Byte $<(Length: 2)>$ | Correlativo.


@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40010038 | No se ingresó una ocupación principal
40010039 | Se ingresó más de una ocupación principal
40010078 | Se ingresó más de una actividad principal
40010079 | Debe seleccionar al menos una actividad económica como principal
40010081 | La actividad no corresponde al tipo seleccionado
40010084 | Ocupación incorrecta
40010087 | Vínculo incorrecto
40010088 | Actividad económica incorrecta
40010304 | El Tipo de Establecimiento no existe
40020012 | El número de contraparte no existe
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
  "correlative": 1
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
    "Hora": "18:56:36",
    "Numero": 13469390,
    "Servicio": "PublicPersons.deleteOccupation",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


