---
title: Get Texts
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los textos de una contraparte.

**Nombre publicación:** PublicCustomers.getTexts

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0022

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
texts | [SdtsBTPAWText](#sdtsbtpawtext) | Listado de textos.

@tab Errores

Código | Descripción
:--------- | :-----------
40020012 | El número de contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.

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
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0"
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
  "texts": {
    "text": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:40",
    "Numero": 13468822,
    "Servicio": "PublicCustomers.getTexts",
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
