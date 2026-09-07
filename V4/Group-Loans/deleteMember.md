---
title: Member
type: DELETE
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para eliminar un miembro de un grupo de créditos.

**Nombre publicación:** PublicGroupLoans.member

**Programa:** PublicAPI.BTLOPA0033

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

No aplica.

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
curl -X DELETE \
  '{{baseUrl}}/public/GroupLoans/v1/member?groupId=1&counterpartyGUID=4b1a2036-c91f-444f-b8ba-ec047793b28f' \
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
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->