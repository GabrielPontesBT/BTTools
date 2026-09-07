---
title: Member Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de miembro que pueden conformar un grupo de créditos.

**Nombre publicación:** PublicGroupLoanParameters.memberTypes

**Programa:** PublicAPI.BTLOPA0038

**Alcance:** Global

**Endpoint:** /public/GroupLoanParameters/v1/memberTypes
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
memberTypes | [memberType](#membertype) | Listado de tipos de integrantes de un grupo.

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
  '{{baseUrl}}/public/GroupLoanParameters/v1/memberTypes' \
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
  "memberTypes": {
    "memberType": [
      {
        "description": "Presidente",
        "id": 1
      },
      {
        "description": "Tesorero",
        "id": 2
      },
      {
        "description": "Integrante",
        "id": 3
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details memberType

### memberType

::: center
Los campos del tipo de dato estructurado memberType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
id | Byte $<(Length: 2)>$ | Identificador del tipo de integrante.
description | String $<(Length: 40)>$ | Descripción del tipo de integrante.
:::
<!-- CIERRA SDT -->