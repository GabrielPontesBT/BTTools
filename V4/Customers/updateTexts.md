---
title: Update Texts
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar los textos de una contraparte.

**Nombre publicación:** PublicCustomers.updateTexts

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0023

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.


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
40050100 | Debe ingresar el GUID de contraparte.
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
    "Token": "444B674391BCA7676279700A"
  },
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0",
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
    "Token": "444B674391BCA7676279700A"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:44",
    "Numero": 13468823,
    "Servicio": "PublicCustomers.updateTexts",
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
