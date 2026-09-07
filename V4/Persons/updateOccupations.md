---
title: Occupations
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar las ocupaciones de una persona.

**Nombre publicación:** PublicPersons.occupations

**Programa:** PublicAPI.BTPEPA0034

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

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
occupations | [occupation](#occupation) | Listado de ocupaciones.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010031 | Debe ingresar ocupaciones
40010037 | Debe ingresar un tipo de actividad comprendido entre 1 y 999999999999999
40010038 | No se ingresó una ocupación principal
40010081 | La actividad no corresponde al tipo seleccionado
40010084 | Ocupación incorrecta
40010088 | Actividad económica incorrecta
40010151 | La actividad no existe
40010300 | Debe ingresar un código de Tipo de Establecimiento comprendido 1 y 999999
40010304 | El Tipo de Establecimiento no existe
40010336 | Debe ingresar una actividad y el código debe estar comprendido entre 1 y 999999999
40050001 | Debe ingresar el GUID de persona.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Persons/v1/occupations?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
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
        "income": 80000,
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
