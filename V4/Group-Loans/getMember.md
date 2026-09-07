---
title: Member
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la información del miembro de un grupo de créditos.

**Nombre publicación:** PublicGroupLoans.member

**Programa:** PublicAPI.BTLOPA0036

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/member
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
member | [member](#member) | Datos del integrante.

@tab Errores

Código | Descripción
:--------- | :---------
40020006 | Contraparte no existe
120050002 | Debe ingresar el GUID de contraparte.
120050010 | Debe ingresar el GUID de grupo.
120060101 | El grupo no existe
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoans/v1/member?groupId=1&counterpartyGUID=6a8b903d-cfaa-4984-b906-573f8d35c960' \
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
  "member": {
    "counterpartyGUID": "6a8b903d-cfaa-4984-b906-573f8d35c960",
    "counterpartyName": "FRANCELLA JUAN",
    "countryId": 604,
    "countryDescription": "Perú",
    "cycleIdOfMember": 0,
    "documentNumber": "56643156",
    "documentTypeId": 11,
    "documentTypeDescription": "D.N.I.",
    "memberTypeId": 1,
    "memberTypeDescription": "Presidente",
    "personGUID": "c0d89ffe-d515-4818-8224-fe8395eab960",
    "personName": "FRANCELLA JUAN"
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
