---
title: Get Additional Information
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la información adicional de una contraparte.

**Nombre publicación:** PublicCustomers.getAdditionalInformation

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0006

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
customFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Listado de campos personalizados.

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
  "customFields": {
    "customField": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:30",
    "Numero": 13468818,
    "Servicio": "PublicCustomers.getAdditionalInformation",
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
