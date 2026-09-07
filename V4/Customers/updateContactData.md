---
title: Contact Data
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los datos de contacto de una contraparte.

**Nombre publicación:** PublicCustomers.contactData

**Programa:** PublicAPI.BTCPPA0020

**Alcance:** Global

**Endpoint:** /public/Customers/v1/contactData
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
contacts | [contact](#contact) | Datos de contacto a actualizar.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010059 | Debe ingresar un contacto
40020006 | Contraparte no existe
40020072 | Debe ingresar al menos un contacto para la contraparte N° ?
40020073 | Debe ingresar un tipo de contacto para la contraparte N° ?
40020074 | Tipo de contacto incorrecto para la contraparte N° ?
40020076 | Compañía de teléfono incorrecta para la contraparte N° ?
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Customers/v1/contactData?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
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
        "comment": "CELULAR",
        "contactTypeId": 1,
        "correlative": 1,
        "enabled": true,
        "endTimeRange1": "12:00",
        "endTimeRange2": "18:00",
        "priority": 1,
        "receivesMails": false,
        "startTimeRange1": "08:00",
        "startTimeRange2": "14:00",
        "telephoneCompanyId": 1,
        "text": "094999888",
        "validated": false
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
enabled | Boolean | ¿Habilitado?
endTimeRange1 | String $<(Length: 5)>$ | Fin del rango horario 1.
endTimeRange2 | String $<(Length: 5)>$ | Fin del rango horario 2.
priority | Byte $<(Length: 2)>$ | Prioridad.
receivesMails | Boolean | ¿Recibe correos?
startTimeRange1 | String $<(Length: 5)>$ | Inicio del rango horario 1.
startTimeRange2 | String $<(Length: 5)>$ | Inicio del rango horario 2.
telephoneCompanyId | Short $<(Length: 3)>$ | Identificador de la compañía telefónica.
telephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
text | String $<(Length: 250)>$ | Texto.
validated | Boolean | ¿Está validado?
:::
<!-- CIERRA SDT -->
