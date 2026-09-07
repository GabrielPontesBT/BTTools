---
title: GUID
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener el GUID de una persona.

**Nombre publicación:** PublicPersons.guid

**Programa:** PublicAPI.BTPEPA0002

**Alcance:** Global

**Endpoint:** /public/Persons/v1/guid
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
countryId | Short $<(Length: 3)>$ | Identificador de país.
documentTypeId | Short $<(Length: 4)>$ | Identificador de tipo de documento.
documentNumber | String $<(Length: 25)>$ | Número de documento.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40050002 | Debe ingresar el identificador de país.
40050003 | Debe ingresar el identificador de tipo de documento.
40050004 | Debe ingresar el número de documento.
50020018 | El país no se encuentra registrado
50030001 | Debe ingresar un tipo de documento válido
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Persons/v1/guid?countryId=484&documentTypeId=1&documentNumber=HADR821023HHGFQS74' \
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
  "personGUID": "d742016d-f0fc-4fff-be0e-3ff1dd7015a4"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->