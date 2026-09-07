---
title: Create With Existing Person
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para crear una contraparte a partir de una persona existente.

**Nombre publicación:** PublicCustomers.createWithExistingPerson

**Programa:** PublicAPI.BTCPPA0001

**Alcance:** Global

**Endpoint:** /public/Customers/v1/createWithExistingPerson
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
counterpartyData | [counterpartyData](#counterpartydata) | Datos de la contraparte.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Errores

Código | Descripción
:--------- | :---------
40020010 | El nombre no debe superar los 70 caracteres
40020017 | La persona ingresada no existe
40020018 | Código de titularidad Incorrecto
40020019 | Código de sucursal Incorrecto
40020020 | Código de ejecutivo Incorrecto
40020021 | Código de segmento Incorrecto
40020022 | Código de clasificación interna Incorrecto
40020023 | Código de Sector Económico Incorrecto
40020024 | Código de Actividad Económica Incorrecto
40020028 | Se ingresó la misma persona más de una vez
40020072 | Debe ingresar al menos un contacto para la contraparte N° ?
40020073 | Debe ingresar un tipo de contacto para la contraparte N° ?
40020074 | Tipo de contacto incorrecto para la contraparte N° ?
40020075 | Debe ingresar el contacto para la contraparte N° ?
40020076 | Compañía de teléfono incorrecta para la contraparte N° ?
40020077 | Debe ingresar un nombre para la contraparte
40050001 | Debe ingresar el GUID de persona.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Customers/v1/createWithExistingPerson?personGUID=f43a3946-4ae1-4a27-861d-c1c2d9cee87d' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "counterpartyData": {
    "branchId": 1,
    "companyId": 1,
    "economicActivityId": 1113,
    "executiveId": 1957,
    "internalClassificationId": 1,
    "resident": true,
    "sectorId": 1,
    "segmentId": 1
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
{
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details counterpartyData

### counterpartyData

::: center
Los campos del tipo de dato estructurado counterpartyData son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
branchDescription | String $<(Length: 30)>$ | Descripción de sucursal.
cancellationDate | Date | Fecha de cancelación.
companyId | Short $<(Length: 3)>$ | Identificador de empresa.
companyDescription | String $<(Length: 50)>$ | Descripción de empresa.
counterpartyDescription | String $<(Length: 70)>$ | Nombre de la subcuenta.
creationDate | Date | Fecha de creación.
customFields | [customField](#customfield) | Listado de campos personalizados.
economicActivityId | Long $<(Length: 11)>$ | Identificador de actividad.
economicActivityDescription | String $<(Length: 80)>$ | Descripción de actividad económica.
employee | Boolean | ¿Es empleado?
executiveId | Int $<(Length: 5)>$ | Identificador de ejecutivo.
executiveDescription | String $<(Length: 30)>$ | Descripción del ejecutivo.
financialInstitution | Boolean | ¿Es institución financiera?
internalClassificationId | Short $<(Length: 4)>$ | Identificador de clasificación interna.
internalClassificationDescription | String $<(Length: 30)>$ | Descripción de clasificación interna.
resident | Boolean | ¿Es residente?
sectorId | Short $<(Length: 3)>$ | Identificador de sector.
sectorDescription | String $<(Length: 30)>$ | Descripción de sector.
segmentId | Byte $<(Length: 2)>$ | Identificador de segmento.
segmentDescription | String $<(Length: 30)>$ | Descripción de segmento.
statusId | Byte $<(Length: 2)>$ | Identificador de estado.
statusDescription | String $<(Length: 40)>$ | Descripción del estado.
:::

::: details customField

### customField

::: center
Los campos del tipo de dato estructurado customField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
correlative | Short $<(Length: 4)>$ | Correlativo del campo adicional.
id | String $<(Length: 30)>$ | Identificador del campo adicional.
description | String $<(Length: 50)>$ | Descripción de campo adicional.
value | String $<(Length: 250)>$ | Valor del campo adicional.
:::
<!-- CIERRA SDT -->
