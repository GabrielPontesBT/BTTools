---
title: Unblock Member
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para desbloquear un integrante.

**Nombre publicación:** PublicGroupLoans.unblockMember

**Programa:** PublicAPI.BTLOPA0058

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/unblockMember
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | Identificador único (GUID) de préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
120050001 | Debe ingresar el GUID de préstamo.
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
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/unblockMember?loanGUID=6bad8760-206d-4eed-ad31-845081289d22' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 15
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


