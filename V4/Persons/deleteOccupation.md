---
title: Occupation
type: DELETE
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para eliminar la ocupación de una persona.

**Nombre publicación:** PublicPersons.occupation

**Programa:** PublicAPI.BTPEPA0035

**Alcance:** Global

**Endpoint:** /public/Persons/v1/occupation
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
occupationCorrelative | Byte $<(Length: 2)>$ | Correlativo de la ocupación.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010031 | Debe ingresar ocupaciones
40010084 | Ocupación incorrecta
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
  '{{baseUrl}}/public/Persons/v1/occupation?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4&occupationCorrelative=1' \
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


