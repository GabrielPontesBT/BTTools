---
title: Reverse Member
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para anular el desembolso de un integrante de un crédito grupal.

**Nombre publicación:** PublicGroupLoans.reverseMember

**Programa:** PublicAPI.BTLOPA0056

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/reverseMember
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

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
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/reverseMember?loanGUID=6a8b903d-cfaa-4984-b906-573f8d35c960' \
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


