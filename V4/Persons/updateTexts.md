---
title: Update Texts
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar los textos de una persona.

**Nombre publicación:** PublicPersons.updateTexts

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0021

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
texts | [SdtsBTPAWText](#sdtsbtpawtext) | Listado de textos.


@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
40050001 | Debe ingresar el GUID de persona.
50050003 | No se encuentra la empresa
50090006 | Código de texto incorrecto
50090007 | Debe ingresar un texto
50090008 | Se ingresó el código de texto más de una vez
50090009 | No existe API de texto asociado al namespace ingresado
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
  "texts": {
    "text": [
      {
        "Id": 1,
        "Description": "TEXTO DE EJEMPLO",
        "Text": "CONTENIDO DEL TEXTO"
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
    "Hora": "18:56:21",
    "Numero": 13469384,
    "Servicio": "PublicPersons.updateTexts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPAWText

### SdtsBTPAWText

::: center
Los campos del tipo de dato estructurado SdtsBTPAWText son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Int $<(Length: 5)>$ | Identificador.
Description | String $<(Length: 60)>$ | Descripción.
Text | String | Texto.
:::
<!-- CIERRA SDT -->
