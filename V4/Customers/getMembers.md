---
title: Members
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los miembros de una contraparte.

**Nombre publicación:** PublicCustomers.members

**Programa:** PublicAPI.BTCPPA0016

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

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
members | [member](#member) | Listado de integrantes.

@tab Errores

Código | Descripción
:--------- | :---------
40020006 | Contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Customers/v1/members?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
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
  "members": {
    "member": [
      {
        "countryId": 604,
        "countryDescription": "Perú",
        "documentNumber": "47078632",
        "documentTypeId": 11,
        "documentTypeDescription": "D.N.I.",
        "ownershipTypeId": 1,
        "ownershipTypeDescription": "TITULAR REPRESENTAT.",
        "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
        "personName": "PONTES SILVA GABRIEL",
        "personType": "F"
      }
    ]
  }
}
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
