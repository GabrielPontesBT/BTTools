---
title: Validate Existence
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para validar la existencia de una persona.

**Nombre publicación:** PublicPersons.validateExistence

**Programa:** PublicAPI.BTPEPA0001

**Alcance:** Global

**Endpoint:** /public/Persons/v1/validateExistence
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
countryId | Short $<(Length: 3)>$ | Identificador del país.
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentNumber | String $<(Length: 25)>$ | Número de documento.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
exists | Boolean | ¿La persona ingresada existe?

@tab Errores

Código | Descripción
:--------- | :---------
40050002 | Debe ingresar el identificador de país.
40050003 | Debe ingresar el identificador de tipo de documento.
40050004 | Debe ingresar el número de documento.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Persons/v1/validateExistence?countryId=484&documentTypeId=1&documentNumber=HADR821023HHGFQS74' \
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
  "exists": true
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->