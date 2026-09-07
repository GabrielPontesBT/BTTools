---
title: Contact Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de contacto.

**Nombre publicación:** PublicPersonParameters.contactTypes

**Programa:** PublicAPI.BTPEPA0040

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/contactTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
contactTypeIdFilter | Byte $<(Length: 2)>$ | Filtro por identificador de tipo de contacto.
contactTypeDescriptionFilter | String $<(Length: 50)>$ | Filtro por descripción de tipo de contacto.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
contactTypes | [contactType](#contacttype) | Listado de tipos de contacto.

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
  '{{baseUrl}}/public/PersonParameters/v1/contactTypes' \
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
  "contactTypes": {
    "contactType": [
      {
        "contactTypeDescription": "TELEFONO MÓVIL",
        "contactTypeId": 1,
        "requiresTelephoneCompany": true
      },
      {
        "contactTypeDescription": "TELEFONO FIJO",
        "contactTypeId": 2,
        "requiresTelephoneCompany": false
      },
      {
        "contactTypeDescription": "CORREO ELECTRÓNICO",
        "contactTypeId": 3,
        "requiresTelephoneCompany": false
      },
      {
        "contactTypeDescription": "X",
        "contactTypeId": 4,
        "requiresTelephoneCompany": false
      },
      {
        "contactTypeDescription": "INSTAGRAM",
        "contactTypeId": 5,
        "requiresTelephoneCompany": false
      },
      {
        "contactTypeDescription": "WHATSAPP",
        "contactTypeId": 6,
        "requiresTelephoneCompany": false
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details contactType

### contactType

::: center
Los campos del tipo de dato estructurado contactType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
contactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
contactTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de contacto.
requiresTelephoneCompany | Boolean | Requiere compañía telefónica?
:::
<!-- CIERRA SDT -->
