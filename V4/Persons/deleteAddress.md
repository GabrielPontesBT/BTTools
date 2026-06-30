---
title: Delete Address
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para eliminar el domicilio de una persona.

**Nombre publicación:** PublicPersons.deleteAddress

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0016

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
correlative | Short $<(Length: 3)>$ | Correlativo.


@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40010008 | País incorrecto
40010043 | No existe el domicilio ingresado
40010046 | La fecha de ubicación no puede ser mayor a la fecha de apertura
40010047 | Debe ingresar un país para el domicilio
40010048 | Debe ingresar un departamento para el domicilio
40010049 | Debe ingresar una ciudad para el domicilio
40010053 | La latitud debe ser un valor entre -90 y 90
40010054 | La longitud debe ser un valor entre -90 y 90
40010055 | Tercer nivel de división administrativa inexistente
40010056 | Segundo nivel de división administrativa inexistente
40010057 | Primer nivel de división administrativa inexistente
40010067 | Cuarto nivel de agrupación inexistente
40010068 | Tercer nivel de agrupación inexistente
40010069 | Segundo nivel de agrupación inexistente
40010070 | Primer nivel de agrupación inexistente
40010092 | Debe ingresar un correlativo de domicilio
40010237 | Debe ingresar un código de Tipo de Domicilio comprendido entre 1 y 99
40010241 | El Tipo de Domicilio no existe
40010251 | El Tipo de Vivienda no existe
40010353 | Existe inconsistencia de datos con el campo ? en la RNG ??
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
40050001 | Debe ingresar el GUID de persona.
40050100 | Debe ingresar el GUID de contraparte.
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
    "Hora": "18:56:32",
    "Numero": 13469388,
    "Servicio": "PublicPersons.deleteAddress",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


