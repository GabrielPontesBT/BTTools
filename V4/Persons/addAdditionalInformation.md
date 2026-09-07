---
title: Add Additional Information
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para agregar información adicional a una persona.

**Nombre publicación:** PublicPersons.addAdditionalInformation

**Programa:** PublicAPI.BTPEPA0026

**Alcance:** Global

**Endpoint:** /public/Persons/v1/addAdditionalInformation
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
customFields | [customField](#customfield) | Listado de campos personalizados a agregar.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Persons/v1/addAdditionalInformation?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "customFields": {
    "customField": [
      {
        "correlative": "3",
        "description": "",
        "id": "HOBBY",
        "value": "Jugar fútbol"
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
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details customField

### customField

::: center
Los campos del tipo de dato estructurado customField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
correlative | Short $<(Length: 4)>$ | Correlativo del campo adicional.
id | String $<(Length: 30)>$ | Identificador del campo adicional.
description | String $<(Length: 50)>$ | Descripción de campo adicional.
value | String $<(Length: 250)>$ | Valor del campo adicional.
:::
<!-- CIERRA SDT -->
