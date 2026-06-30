---
title: Get Positions
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los cargos.

**Nombre publicación:** PublicPersons.getPositions

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0010

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
jobTitles | [SdtsBTPEWJobTitle](#sdtsbtpewjobtitle) | Listado de titulos de trabajo.

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
  "jobTitles": {
    "jobTitle": [
      {
        "Id": 1,
        "Description": "PRESIDENTE",
        "Multilateral": false
      },
      {
        "Id": 2,
        "Description": "VICEPRESIDENTE",
        "Multilateral": false
      },
      {
        "Id": 3,
        "Description": "PROSECRETARIO",
        "Multilateral": false
      },
      {
        "Id": 4,
        "Description": "TESORERO",
        "Multilateral": false
      },
      {
        "Id": 5,
        "Description": "DIRECTOR",
        "Multilateral": true
      },
      {
        "Id": 6,
        "Description": "SECRETARIO",
        "Multilateral": false
      },
      {
        "Id": 7,
        "Description": "PROTESORERO",
        "Multilateral": false
      },
      {
        "Id": 8,
        "Description": "SOCIO",
        "Multilateral": false
      },
      {
        "Id": 9,
        "Description": "GERENTE",
        "Multilateral": false
      },
      {
        "Id": 10,
        "Description": "APODERADO",
        "Multilateral": false
      },
      {
        "Id": 11,
        "Description": "AUTORIZADO",
        "Multilateral": false
      },
      {
        "Id": 12,
        "Description": "ADMINISTRADOR",
        "Multilateral": false
      },
      {
        "Id": 13,
        "Description": "VOCAL",
        "Multilateral": false
      },
      {
        "Id": 14,
        "Description": "COOPERATIVISTA",
        "Multilateral": false
      },
      {
        "Id": 15,
        "Description": "FIRMA SOLIDARIA",
        "Multilateral": false
      },
      {
        "Id": 16,
        "Description": "SOCIO COMANDITADO",
        "Multilateral": false
      },
      {
        "Id": 17,
        "Description": "SOCIO COMANDITARIO",
        "Multilateral": false
      },
      {
        "Id": 18,
        "Description": "INTERVENTOR",
        "Multilateral": false
      },
      {
        "Id": 19,
        "Description": "ACCIONISTA",
        "Multilateral": false
      },
      {
        "Id": 20,
        "Description": "GERENTE GENERAL",
        "Multilateral": false
      },
      {
        "Id": 21,
        "Description": "EMPLEADO",
        "Multilateral": false
      },
      {
        "Id": 5558,
        "Description": "PRESIDENTE",
        "Multilateral": false
      },
      {
        "Id": 5559,
        "Description": "PRESIDENTE",
        "Multilateral": false
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:34",
    "Numero": 13469343,
    "Servicio": "PublicPersons.getPositions",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWJobTitle

### SdtsBTPEWJobTitle

::: center
Los campos del tipo de dato estructurado SdtsBTPEWJobTitle son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Short $<(Length: 4)>$ | Identificador.
Description | String $<(Length: 30)>$ | Descripción.
Multilateral | Boolean | Multilateral.
:::
<!-- CIERRA SDT -->
