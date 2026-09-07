---
title: Member
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar un miembro de un grupo de créditos.

**Nombre publicación:** PublicGroupLoans.member

**Programa:** PublicAPI.BTLOPA0032

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/member
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
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
memberData | [memberData](#memberdata) | Datos del integrante.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
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
curl -X PUT \
  '{{baseUrl}}/public/GroupLoans/v1/member?counterpartyGUID=4b1a2036-c91f-444f-b8ba-ec047793b28f' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 33,
  "memberData": {
    "memberTypeId": 1
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
::: details memberData

### memberData

::: center
Los campos del tipo de dato estructurado memberData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
memberTypeId | Byte | Identificador del tipo de miembro.
:::
<!-- CIERRA SDT -->
