---
title: Update
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los datos de una contraparte.

**Nombre publicación:** PublicCustomers.update

**Programa:** PublicAPI.BTCPPA0025

**Alcance:** Global

**Endpoint:** /public/Customers/v1/update
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyData | [counterpartyData](#counterpartydata) | Datos de la contraparte.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40020006 | Contraparte no existe
40020018 | Código de titularidad Incorrecto
40020020 | Código de ejecutivo Incorrecto
40020021 | Código de segmento Incorrecto
40020022 | Código de clasificación interna Incorrecto
40020023 | Código de Sector Económico Incorrecto
40020024 | Código de Actividad Económica Incorrecto
40020028 | Se ingresó la misma persona más de una vez
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X PUT \
  '{{baseUrl}}/public/Customers/v1/update?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
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
    "economicActivityId": 1111,
    "executiveId": 20,
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
{}
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
