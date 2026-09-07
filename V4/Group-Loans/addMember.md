---
title: Add Member
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para agregar un integrante a un grupo de créditos.

**Nombre publicación:** PublicGroupLoans.addMember

**Programa:** PublicAPI.BTLOPA0031

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/addMember
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
40020006 | Contraparte no existe
40030005 | Tipo de integrante incorrecto
120050002 | Debe ingresar el GUID de contraparte.
120050010 | Debe ingresar el GUID de grupo.
120060101 | El grupo no existe
120060126 | No existe configuración para el ciclo
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/addMember?counterpartyGUID=394e48fc-b99c-4546-aeaf-862f9699ec03' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 127,
  "memberData": {
    "memberTypeId": 3
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
