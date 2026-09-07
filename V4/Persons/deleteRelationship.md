---
title: Relationship
type: DELETE
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para eliminar la relación de una persona.

**Nombre publicación:** PublicPersons.relationship

**Programa:** PublicAPI.BTPEPA0038

**Alcance:** Global

**Endpoint:** /public/Persons/v1/relationship
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
relationshipId | Short $<(Length: 4)>$ | Identificador del vínculo.
vinculatedPersonGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona vinculada.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010095 | Relación no existe
40010141 | Código de vínculo no existe
40050001 | Debe ingresar el GUID de persona.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X DELETE \
  '{{baseUrl}}/public/Persons/v1/relationship?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4&relationshipId=1&vinculatedPersonGUID=f43a3946-4ae1-4a27-861d-c1c2d9cee87d' \
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


