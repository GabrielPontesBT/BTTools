---
title: Create With Existing Person
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para crear una contraparte a partir de una persona existente.

**Nombre publicación:** PublicCustomers.createWithExistingPerson

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.


@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyData | [SdtsBTCPWCounterparty](#sdtsbtcpwcounterparty) | Datos de la contraparte.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40010010 | País de nacimiento incorrecto
40010012 | País de ciudadanía incorrecto
40010019 | Debe ingresar primer nombre
40010020 | Primer nombre contiene caracteres no válidos
40010021 | Segundo nombre contiene caracteres no válidos
40010022 | Debe ingresar primer apellido
40010023 | Primer apellido contiene caracteres no válidos
40010024 | Descripción no encontrada
40010025 | Debe ingresar género Femenino (F), Masculino (M) o No Binario (X)
40010026 | Debe ingresar fecha de nacimiento
40010027 | Fecha de nacimiento no puede ser igual o posterior a la fecha de apertura
40010029 | Debe ingresar fecha de fallecimiento
40010032 | Debe ingresar fecha de presentación de patrimonio
40010034 | Debe ingresar patrimonio
40010091 | Descripción no encontrada
40010099 | La persona a relacionar ya tiene un vínculo existente con otra persona
40010100 | No puede relacionarse a sí mismo
40010210 | Debe ingresar un código de Nivel de Instrucción comprendido entre 1 y 999
40010212 | El Nivel de Instrucción no existe
40010215 | Debe ingresar un código de Estado Civil comprendido entre 1 y 26
40010219 | El Estado Civil no existe
40010229 | El Origen de Captación no existe
40010329 | La persona no puede ser eliminada, tiene registro asociado a contrapartes
40010335 | Debe ingresar un nombre no mayor de 70 caracteres
40010340 | No puede ser eliminado, tiene referencias con ? en la tabla de Relaciones entre Personas
40010341 | No puede ser eliminado, tiene referencias con ? en la tabla de Integrantes de personas jurídicas
40010347 | La persona con número de documento ? ya existe
40010349 | Primer nivel asociado al país de nacimiento incorrecto
40010350 | Segundo nivel asociado al país de nacimiento incorrecto
40010353 | Existe inconsistencia de datos con el campo ? en la RNG ??
40010359 | La persona ingresada como cónyugue no existe
40010360 | La fecha de fallecimiento debe ser posterior a la fecha de nacimiento
40010361 | La fecha de fallecimiento no puede ser posterior o igual a la fecha de apertura
40020017 | La persona ingresada no existe
40050001 | Debe ingresar el GUID de persona.
50050003 | No se encuentra la empresa
99990010006 | No se pudo resolver el usuario
99990010007 | No se pudo resolver la empresa
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "444B674391BCA7676279700A"
  },
  "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
  "counterpartyData": {
    "BranchId": 1,
    "CompanyId": 1,
    "EconomicActivityId": 1113,
    "ExecutiveId": 1957,
    "InternalClassificationId": 1,
    "Resident": true,
    "SectorId": 1,
    "SegmentId": 1
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
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "444B674391BCA7676279700A"
  },
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:13",
    "Numero": 13468812,
    "Servicio": "PublicCustomers.createWithExistingPerson",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWCounterparty

### SdtsBTCPWCounterparty

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCounterparty son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
BranchId | Int | Identificador de sucursal.
BranchDescription | String $<(Length: 30)>$ | Descripción de sucursal.
CancellationDate | Date $<(Length: 8)>$ | Fecha de cancelación.
CompanyId | Short $<(Length: 3)>$ | Identificador de empresa.
CompanyDescription | String $<(Length: 50)>$ | Descripción de empresa.
CounterpartyDescription | String $<(Length: 70)>$ | Descripción de contraparte.
CreationDate | Date $<(Length: 8)>$ | Fecha de creación.
CustomFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Campos personalizados.
EconomicActivityId | Long | Identificador de actividad económica.
EconomicActivityDescription | String $<(Length: 80)>$ | Descripción de actividad económica.
Employee | Boolean | ¿Es empleado?.
ExecutiveId | Int $<(Length: 5)>$ | Identificador del ejecutivo.
ExecutiveDescription | String $<(Length: 30)>$ | Descripción del ejecutivo.
FinancialInstitution | Boolean | Institución financiera.
InternalClassificationId | Short | Identificador de clasificación interna.
InternalClassificationDescription | String $<(Length: 30)>$ | Descripción de clasificación interna.
Resident | Boolean | ¿Es residente?.
SectorId | Short | Identificador de sector.
SectorDescription | String $<(Length: 30)>$ | Descripción del sector.
SegmentId | Byte $<(Length: 2)>$ | Identificador del segmento.
SegmentDescription | String $<(Length: 30)>$ | Descripción del segmento.
StatusId | Byte $<(Length: 2)>$ | Identificador de estado.
StatusDescription | String $<(Length: 30)>$ | Descripción del estado.
:::

::: details SdtsBTPAWCustomField

### SdtsBTPAWCustomField

::: center
Los campos del tipo de dato estructurado SdtsBTPAWCustomField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Id | String $<(Length: 30)>$ | Identificador.
Description | String $<(Length: 50)>$ | Descripción.
Value | String $<(Length: 250)>$ | Value.
:::
<!-- CIERRA SDT -->
