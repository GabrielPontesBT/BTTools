---
title: Members
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los miembros de una contraparte.

**Nombre publicación:** PublicCustomers.members

**Programa:** PublicAPI.BTCPPA0017

**Alcance:** Global

**Endpoint:** /public/Customers/v1/members
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
members | [member](#member) | Listado de integrantes a actualizar.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40020017 | La persona ingresada no existe
40020018 | Código de titularidad Incorrecto
40020028 | Se ingresó la misma persona más de una vez
40050100 | Debe ingresar el GUID de contraparte.
50050003 | No existe la empresa ingresada
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Customers/v1/members?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "members": {
    "member": [
      {
        "countryId": 0,
        "documentNumber": "",
        "documentTypeId": 0,
        "ownershipTypeId": 1,
        "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
        "personName": "PEDRO CRAMPET",
        "personType": "F"
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
::: details member

### member

::: center
Los campos del tipo de dato estructurado member son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
countryId | Short $<(Length: 3)>$ | Identificador del país.
countryDescription | String $<(Length: 30)>$ | Descripción del país.
documentNumber | String $<(Length: 25)>$ | Número de documento.
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
ownershipTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de titularidad.
ownershipTypeDescription | String $<(Length: 20)>$ | Descripción de tipo de titularidad.
personGUID | String $<(Length: 10)>$ | GUID (identificador único global) de la persona.
personName | String $<(Length: 70)>$ | Nombre de persona.
personType | String $<(Length: 1)>$ | Tipo de persona (F: Física, J: Jurídica, A: Ambas).
:::
<!-- CIERRA SDT -->
