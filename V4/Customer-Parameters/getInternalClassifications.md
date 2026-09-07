---
title: Internal Classifications
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de clasificaciones internas.

**Nombre publicación:** PublicCustomerParameters.internalClassifications

**Programa:** PublicAPI.BTCPPA0007

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/internalClassifications
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
internalClassifications | [internalClassification](#internalclassification) | Listado de clasificaciones internas.

@tab Errores

No aplica.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/CustomerParameters/v1/internalClassifications' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "internalClassifications": {
    "internalClassification": [
      {
        "internalClassificationDescription": "PERSONA FÍSICA",
        "internalClassificationId": 1
      },
      {
        "internalClassificationDescription": "PERSONA JURIDICA",
        "internalClassificationId": 2
      },
      {
        "internalClassificationDescription": "EMPLEADO",
        "internalClassificationId": 3
      },
      {
        "internalClassificationDescription": "INSTITUCIONES FINANCIERAS",
        "internalClassificationId": 4
      },
      {
        "internalClassificationDescription": "UNIPERSONAL",
        "internalClassificationId": 7
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details internalClassification

### internalClassification

::: center
Los campos del tipo de dato estructurado internalClassification son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
internalClassificationId | Short $<(Length: 4)>$ | Identificador de clasificación interna.
internalClassificationDescription | String $<(Length: 30)>$ | Descripción de clasificación interna.
:::
<!-- CIERRA SDT -->
