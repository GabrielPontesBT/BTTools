---
title: Get Internal Classifications
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de clasificaciones internas.

**Nombre publicación:** PublicCustomers.getInternalClassifications

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0007

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
internalClassifications | [SdtsBTCPWInternalClassification](#sdtsbtcpwinternalclassification) | Listado de clasificaciones internas.

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
    "Token": "444B674391BCA7676279700A"
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
  "internalClassifications": {
    "internalClassification": [
      {
        "Id": 1,
        "Description": "PERSONA FÍSICA"
      },
      {
        "Id": 2,
        "Description": "PERSONA JURIDICA"
      },
      {
        "Id": 3,
        "Description": "EMPLEADO"
      },
      {
        "Id": 4,
        "Description": "INSTITUCIONES FINANCIERAS"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:03",
    "Numero": 13468808,
    "Servicio": "PublicCustomers.getInternalClassifications",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWInternalClassification

### SdtsBTCPWInternalClassification

::: center
Los campos del tipo de dato estructurado SdtsBTCPWInternalClassification son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Short | Identificador.
Description | String $<(Length: 30)>$ | Descripción.
:::
<!-- CIERRA SDT -->
