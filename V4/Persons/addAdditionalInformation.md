---
title: Add Additional Information
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para agregar información adicional a una persona.

**Nombre publicación:** PublicPersons.addAdditionalInformation

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0026

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
customFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Listado de campos personalizados.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------

90046 | El código de sector ingresado no existe
40010151 | La actividad no existe
40020006 | Contraparte no existe
40020012 | El número de contraparte no existe
40050001 | Debe ingresar el GUID de persona.
50020018 | El país no se encuentra registrado
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
  "customFields": {
    "customField": [
      {
        "Correlative": 1,
        "Id": "CAMPO1",
        "Description": "DATO PRUEBA",
        "Value": "VALOR PRUEBA"
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
    "Hora": "18:56:27",
    "Numero": 13469386,
    "Servicio": "PublicPersons.addAdditionalInformation",
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
