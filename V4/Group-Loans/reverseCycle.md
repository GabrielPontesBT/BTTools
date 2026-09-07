---
title: Reverse Cycle
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para anular el ciclo de un crédito grupal.

**Nombre publicación:** PublicGroupLoans.reverseCycle

**Programa:** PublicAPI.BTLOPA0039

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/reverseCycle
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
120050010 | Debe ingresar el GUID de grupo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/reverseCycle' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 15,
  "cycleId": 1
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