---
title: Contact Data
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los datos de contacto de una persona.

**Nombre publicación:** PublicPersons.contactData

**Programa:** PublicAPI.BTPEPA0012

**Alcance:** Global

**Endpoint:** /public/Persons/v1/contactData
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
contacts | [contact](#contact) | Listado de datos de contacto.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010058 | Contacto no existe
40010059 | Debe ingresar un contacto
40010061 | Tipo de contacto incorrecto
40010063 | Compañía de teléfono incorrecta
40010253 | Debe ingresar un código de Tipo de Contacto comprendido entre 1 y 99
40010352 | Email inválido
40050001 | Debe ingresar el GUID de persona.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Persons/v1/contactData?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "contacts": {
    "contact": [
      {
        "addressCorrelative": 0,
        "addressId": "",
        "associatedToAnAddress": false,
        "comment": "CORREO",
        "contactTypeDescription": "",
        "contactTypeId": 3,
        "correlative": 1,
        "enabled": true,
        "endTimeRange1": "",
        "endTimeRange2": "",
        "priority": 3,
        "startTimeRange1": "",
        "startTimeRange2": "",
        "telephoneCompanyDescription": "ANTEL",
        "telephoneCompanyId": 1,
        "text": "GABRIELPONTES@GMAIL.COM",
        "validated": true
      },
      {
        "addressCorrelative": 0,
        "addressId": "",
        "associatedToAnAddress": false,
        "comment": "TELEFONO CELULAR",
        "contactTypeDescription": "",
        "contactTypeId": 1,
        "correlative": 1,
        "enabled": true,
        "endTimeRange1": "",
        "endTimeRange2": "",
        "priority": 1,
        "startTimeRange1": "",
        "startTimeRange2": "",
        "telephoneCompanyDescription": "ANTEL",
        "telephoneCompanyId": 1,
        "text": "0952659569",
        "validated": true
      },
      {
        "addressCorrelative": 0,
        "addressId": "",
        "associatedToAnAddress": false,
        "comment": "TELEFONO FIJO",
        "contactTypeDescription": "",
        "contactTypeId": 2,
        "correlative": 1,
        "enabled": true,
        "endTimeRange1": "",
        "endTimeRange2": "",
        "priority": 2,
        "startTimeRange1": "",
        "startTimeRange2": "",
        "telephoneCompanyDescription": "ANTEL",
        "telephoneCompanyId": 1,
        "text": "2514876599",
        "validated": true
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
::: details contact

### contact

::: center
Los campos del tipo de dato estructurado contact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
addressCorrelative | Short $<(Length: 3)>$ | Correlativo del domicilio.
addressId | String $<(Length: 140)>$ | Identificador del domicilio.
associatedToAnAddress | Boolean | ¿Está asociado a un domicilio?
comment | String $<(Length: 250)>$ | Comentario.
contactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
contactTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de contacto.
correlative | Byte $<(Length: 2)>$ | Correlativo del contacto.
enabled | Boolean | ¿Está habilitado?
endTimeRange1 | String $<(Length: 5)>$ | Fin del rango horario 1.
endTimeRange2 | String $<(Length: 5)>$ | Fin del rango horario 2.
priority | Byte $<(Length: 2)>$ | Prioridad.
startTimeRange1 | String $<(Length: 5)>$ | Inicio del rango horario 1.
startTimeRange2 | String $<(Length: 5)>$ | Inicio del rango horario 2.
telephoneCompanyId | Short $<(Length: 3)>$ | Identificador de la compañía telefónica.
telephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
text | String $<(Length: 250)>$ | Texto.
validated | Boolean | ¿Está validado?
:::
<!-- CIERRA SDT -->
