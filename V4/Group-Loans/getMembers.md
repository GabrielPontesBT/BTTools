---
title: Members
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los integrantes de un grupo.

**Nombre publicación:** PublicGroupLoans.members

**Programa:** PublicAPI.BTLOPA0037

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/members
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | Indica si existen más páginas disponibles.
membersData | [member](#member) | Listado de información de los integrantes.

@tab Errores

Código | Descripción
:--------- | :---------
120050010 | Debe ingresar el GUID de grupo.
120060101 | El grupo no existe
99990010002 | Datos de Paginación Incorrectos
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/members?offset=0&limit=10&groupId=1' \
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
  "hasNext": false,
  "membersData": {
    "member": [
      {
        "counterpartyGUID": "a0f1dc41-1624-49dd-91a5-f28bf91e5d2c",
        "counterpartyName": "BENAVENTE GARCIA YADIRA",
        "countryId": 604,
        "countryDescription": "Perú",
        "cycleIdOfMember": 1,
        "documentNumber": "71336785",
        "documentTypeId": 11,
        "documentTypeDescription": "D.N.I.",
        "memberTypeId": 3,
        "memberTypeDescription": "Integrante",
        "personGUID": "4a47ca9e-fb87-4555-8f3d-0cca5758cc9e",
        "personName": "BENAVENTE GARCIA YADIRA"
      },
      {
        "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
        "counterpartyName": "FRANCELLA JUAN",
        "countryId": 604,
        "countryDescription": "Perú",
        "cycleIdOfMember": 2,
        "documentNumber": "56643156",
        "documentTypeId": 11,
        "documentTypeDescription": "D.N.I.",
        "memberTypeId": 1,
        "memberTypeDescription": "Presidente",
        "personGUID": "c0d89ffe-d515-4818-8224-fe8395eab960",
        "personName": "FRANCELLA JUAN"
      },
      {
        "counterpartyGUID": "4b1a2036-c91f-444f-b8ba-ec047793b28f",
        "counterpartyName": "RADA RUBEN",
        "countryId": 604,
        "countryDescription": "Perú",
        "cycleIdOfMember": 1,
        "documentNumber": "57764531",
        "documentTypeId": 11,
        "documentTypeDescription": "D.N.I.",
        "memberTypeId": 3,
        "memberTypeDescription": "Integrante",
        "personGUID": "203e39e2-081b-45ea-87ee-0235d3f3eca7",
        "personName": "RADA RUBEN"
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
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
counterpartyName | String $<(Length: 70)>$ | Nombre de contraparte.
countryId | Short $<(Length: 4)>$ | Identificador del país.
countryDescription | String $<(Length: 30)>$ | Descripción del país.
cycleIdOfMember | Int $<(Length: 9)>$ | Ciclo del miembro en el grupo.
documentNumber | String $<(Length: 25)>$ | Número de documento.
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
memberTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de miembro.
memberTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de miembro.
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de persona.
personName | String | Nombre de persona.
:::
<!-- CIERRA SDT -->
