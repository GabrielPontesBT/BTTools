---
title: Additional Information
type: DELETE
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para eliminar la información adicional de una persona.

**Nombre publicación:** PublicPersons.additionalInformation

**Programa:** PublicAPI.BTPEPA0028

**Alcance:** Global

**Endpoint:** /public/Persons/v1/additionalInformation
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
customFieldId | String $<(Length: 30)>$ | Identificador del campo personalizado.
customFieldCorrelative | Short $<(Length: 4)>$ | Correlativo del campo personalizado.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
500 | 
40010004 | La persona no existe
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
  '{{baseUrl}}/public/Persons/v1/additionalInformation?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4&customFieldId=Afición&customFieldCorrelative=1' \
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