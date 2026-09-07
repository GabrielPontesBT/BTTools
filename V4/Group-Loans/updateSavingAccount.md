---
title: Saving Account
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar la cuenta de ahorro de un grupo.

**Nombre publicación:** PublicGroupLoans.savingAccount

**Programa:** PublicAPI.BTLOPA0029

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/savingAccount
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
savingAccountExternalId | String $<(Length: 30)>$ | Identificador externo de cuenta de ahorro.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
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
  '{{baseUrl}}/public/GroupLoans/v1/savingAccount?savingAccountGUID=6c1fcaa1-fa80-4764-b9d0-6441c5e0057c' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": 32,
  "savingAccountExternalId": ""
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