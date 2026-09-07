---
title: Contact Data
type: DELETE
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para eliminar un dato de contacto de una persona.

**Nombre publicación:** PublicPersons.contactData

**Programa:** PublicAPI.BTPEPA0013

**Alcance:** Global

**Endpoint:** /public/Persons/v1/contactData
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
contactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
contactCorrelative | Byte $<(Length: 2)>$ | Correlativo del contacto.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010058 | Contacto no existe
40010059 | Debe ingresar un contacto
40010061 | Tipo de contacto incorrecto
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
  '{{baseUrl}}/public/Persons/v1/contactData?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4&contactTypeId=1&contactCorrelative=1' \
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


