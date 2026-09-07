---
title: Occupations
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de las ocupaciones de una persona.

**Nombre publicación:** PublicPersons.occupations

**Programa:** PublicAPI.BTPEPA0033

**Alcance:** Global

**Endpoint:** /public/Persons/v1/occupations
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
occupations | [occupation](#occupation) | Listado de ocupaciones.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.
50020018 | El país no se encuentra registrado
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Persons/v1/occupations?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
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
  "occupations": {
    "occupation": [
      {
        "companyDocument": "",
        "companyName": "EMPRESA 1",
        "correlative": 1,
        "economicActivityDescription": "FAMILIAS",
        "economicActivityId": 97000,
        "economicActivityTypeDescription": "FAMILIAS",
        "economicActivityTypeId": 65,
        "establishmentTypeDescription": "ESTABLECIMIENTO / LOCAL",
        "establishmentTypeId": 2,
        "exports": false,
        "imports": false,
        "income": 90000,
        "jobTitleDescription": "ACCIONISTA",
        "jobTitleId": 19,
        "mainOccupation": true,
        "multilateral": false,
        "occupationDescription": "EMPLEADO",
        "occupationId": 1,
        "occupationTypeDescription": "DEPENDIENTE",
        "occupationTypeId": 1,
        "startDate": "2024-01-01"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details occupation

### occupation

::: center
Los campos del tipo de dato estructurado occupation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
companyDocument | String $<(Length: 25)>$ | Documento de la empresa.
companyName | String $<(Length: 70)>$ | Nombre de la empresa.
correlative | Byte $<(Length: 4)>$ | Correlativo de ocupación.
economicActivityId | Long $<(Length: 11)>$ | Identificador de actividad.
economicActivityDescription | String $<(Length: 80)>$ | Descripción de actividad económica.
economicActivityTypeId | Long $<(Length: 15)>$ | Identificador de tipo de actividad económica.
economicActivityTypeDescription | String $<(Length: 60)>$ | Descripción de tipo de actividad económica.
endDate | Date $<(Length: 8)>$ | Fecha de fin.
establishmentTypeId | Int $<(Length: 6)>$ | Identificador de tipo de establecimiento.
establishmentTypeDescription | String $<(Length: 50)>$ | Descripción de tipo de establecimiento.
exports | Boolean | ¿Es negocio de exportación?
imports | Boolean | ¿Es negocio de importación?
income | Double $<(Length: 18.2)>$ | Ingresos.
jobTitleId | Short $<(Length: 4)>$ | Identificador del cargo.
jobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo.
mainOccupation | Boolean | ¿Es ocupación principal?
multilateral | Boolean | ¿Es multilateral?
occupationId | Int $<(Length: 5)>$ | Identificador de ocupación.
occupationDescription | String $<(Length: 30)>$ | Descripción de ocupación.
occupationTypeId | Short $<(Length: 4)>$ | Identificador de tipo de ocupación.
occupationTypeDescription | String $<(Length: 30)>$ | Descripción de tipo de ocupación.
startDate | Date $<(Length: 8)>$ | Fecha de inicio.
:::
<!-- CIERRA SDT -->
