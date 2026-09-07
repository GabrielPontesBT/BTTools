---
title: References
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de las referencias de una persona.

**Nombre publicación:** PublicPersons.references

**Programa:** PublicAPI.BTPEPA0017

**Alcance:** Global

**Endpoint:** /public/Persons/v1/references
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
references | [reference](#reference) | Listado de referencias.

@tab Errores

Código | Descripción
:--------- | :---------
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
curl -X GET \
  '{{baseUrl}}/public/Persons/v1/references?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
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
  "references": {
    "reference": [
      {
        "correlative": "1",
        "name": "REFERENCIA DE PRUEBA",
        "personType": "F",
        "referenceTypeDescription": "",
        "referenceTypeId": "1",
        "relationshipDescription": "",
        "relationshipId": "1",
        "telephone": "094111222"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details reference

### reference

::: center
Los campos del tipo de dato estructurado reference son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
address1 | String $<(Length: 50)>$ | Dirección 1.
address2 | String $<(Length: 50)>$ | Dirección 2.
address3 | String $<(Length: 50)>$ | Dirección 3.
correlative | Short $<(Length: 3)>$ | Correlativo de referencia.
enterpriceJobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo en la empresa.
enterpriseJobTitleId | Short $<(Length: 4)>$ | Identificador del cargo en la empresa.
name | String $<(Length: 50)>$ | Nombre de referencia.
personType | String $<(Length: 1)>$ | Tipo de persona (F: Física, J: Jurídica, A: Ambas).
referenceTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de referencia.
referenceTypeDescription | String $<(Length: 30)>$ | Descripción de tipo de referencia.
relationshipId | Short $<(Length: 4)>$ | Identificador de vínculo.
relationshipDescription | String $<(Length: 30)>$ | Descripción de vínculo.
telephone | String $<(Length: 50)>$ | Teléfono.
:::
<!-- CIERRA SDT -->
