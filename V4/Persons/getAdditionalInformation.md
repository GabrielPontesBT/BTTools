---
title: Additional Information
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la información adicional de una persona.

**Nombre publicación:** PublicPersons.additionalInformation

**Programa:** PublicAPI.BTPEPA0029

**Alcance:** Global

**Endpoint:** /public/Persons/v1/additionalInformation
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
customFields | [customField](#customfield) | Listado de campos personalizados.

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
curl -X GET \
  '{{baseUrl}}/public/Persons/v1/additionalInformation?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
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
  "customFields": {
    "customField": [
      {
        "correlative": 1,
        "description": "",
        "id": "Afición",
        "value": "0"
      },
      {
        "correlative": 1,
        "description": "",
        "id": "Profesión",
        "value": "0"
      }
    ]
  }
}
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
