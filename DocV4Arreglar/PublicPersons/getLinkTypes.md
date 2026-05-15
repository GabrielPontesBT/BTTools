---
title: Obtener Link Tipos [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los tipos de vínculo entre personas.

**Nombre publicación:** PublicPersons.getLinkTypes

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0003

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
bonds | [SdtsBTPEWBond](#sdtsbtpewbond) | Listado de tipos de relación.

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
  "bonds": {
    "bond": [
      {
        "Id": 40,
        "Description": "CÓNYUGE",
        "Type": "A",
        "Bidirectional": true,
        "Multilateral": false
      },
      {
        "Id": 41,
        "Description": "PADRE DE:",
        "Type": "C",
        "Bidirectional": false,
        "Multilateral": false
      },
      {
        "Id": 42,
        "Description": "MADRE DE:",
        "Type": "C",
        "Bidirectional": false,
        "Multilateral": false
      },
      {
        "Id": 43,
        "Description": "HIJO DE:",
        "Type": "C",
        "Bidirectional": false,
        "Multilateral": true
      },
      {
        "Id": 99,
        "Description": "NO CORRESPONDE",
        "Type": "A",
        "Bidirectional": false,
        "Multilateral": false
      },
      {
        "Id": 100,
        "Description": "Amigo",
        "Type": "A",
        "Bidirectional": false,
        "Multilateral": true
      },
      {
        "Id": 1234,
        "Description": "ABUELO DE:",
        "Type": "C",
        "Bidirectional": false,
        "Multilateral": true
      },
      {
        "Id": 2222,
        "Description": "AFINIDAD",
        "Type": "A",
        "Bidirectional": false,
        "Multilateral": true
      },
      {
        "Id": 5555,
        "Description": "CONOCIDO",
        "Type": "A",
        "Bidirectional": false,
        "Multilateral": true
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:26",
    "Numero": 13469339,
    "Servicio": "PublicPersons.getLinkTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWBond

### SdtsBTPEWBond

::: center
Los campos del tipo de dato estructurado SdtsBTPEWBond son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Bidirectional | Boolean $<(length: 1)>$ | Bidireccional.
Id | Short | Identificador.
Description | String $<(length: 30)>$ | Descripción.
Multilateral | Boolean $<(length: 1)>$ | Multilateral.
Type | String $<(length: 1)>$ | Tipo de vínculo.
:::
<!-- CIERRA SDT -->
