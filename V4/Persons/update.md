---
title: Update
type: PUT
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para actualizar los datos de una persona.

**Nombre publicación:** PublicPersons.update

**Programa:** PublicAPI.BTPEPA0031

**Alcance:** Global

**Endpoint:** /public/Persons/v1/update
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
naturalPerson | [naturalPerson](#naturalperson) | Datos de persona natural.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010004 | La persona no existe
40010008 | País incorrecto
40010010 | País de nacimiento incorrecto
40010012 | País de ciudadanía incorrecto
40010013 | Tipo de documento no válido para personas físicas
40010014 | Tipo de documento no válido para personas jurídicas
40010019 | Debe ingresar primer nombre
40010020 | Primer nombre contiene caracteres no válidos
40010021 | Segundo nombre contiene caracteres no válidos
40010022 | Debe ingresar primer apellido
40010023 | Primer apellido contiene caracteres no válidos
40010025 | Debe ingresar género Femenino (F), Masculino (M) o No Binario (X)
40010026 | Debe ingresar fecha de nacimiento
40010027 | Fecha de nacimiento no puede ser igual o posterior a la fecha de apertura
40010031 | Debe ingresar ocupaciones
40010032 | Debe ingresar fecha de presentación de patrimonio
40010034 | Debe ingresar patrimonio
40010037 | Debe ingresar un tipo de actividad comprendido entre 1 y 999999999999999
40010038 | No se ingresó una ocupación principal
40010046 | La fecha de ubicación no puede ser mayor a la fecha de apertura
40010047 | Debe ingresar un país para el domicilio
40010048 | Debe ingresar un departamento para el domicilio
40010049 | Debe ingresar una ciudad para el domicilio
40010053 | La latitud debe ser un valor entre -90 y 90
40010054 | La longitud debe ser un valor entre -90 y 90
40010058 | Contacto no existe
40010059 | Debe ingresar un contacto
40010061 | Tipo de contacto incorrecto
40010063 | Compañía de teléfono incorrecta
40010067 | Cuarto nivel de agrupación inexistente
40010068 | Tercer nivel de agrupación inexistente
40010069 | Segundo nivel de agrupación inexistente
40010070 | Primer nivel de agrupación inexistente
40010071 | Debe ingresar la razón social con un máximo de 70 caracteres
40010073 | Debe ingresar la fecha de constitución
40010074 | La fecha de constitución no puede ser posterior a la fecha de apertura
40010081 | La actividad no corresponde al tipo seleccionado
40010084 | Ocupación incorrecta
40010087 | Vínculo incorrecto
40010088 | Actividad económica incorrecta
40010095 | Relación no existe
40010096 | El vínculo de cónyuge se agrega desde el alta/modificación de persona
40010097 | Relación ya existe
40010098 | Ya se ingresó un vínculo con esta persona
40010099 | La persona a relacionar ya tiene un vínculo existente con otra persona
40010100 | No puede relacionarse a sí mismo
40010101 | El porcentaje no puede ser mayor a 100%
40010102 | El vínculo de cónyuge debe ser eliminado desde el alta/modificación de persona
40010106 | Parentesco Incorrecto
40010111 | Cargo Incorrecto
40010132 | No existe Referencia con el correlativo ingresado
40010133 | Tipo de Referencia Incorrecto
40010138 | No existe el Nivel de Datos
40010141 | Código de vínculo no existe
40010151 | La actividad no existe
40010181 | Debe ingresar un código para el Cargo, el código debe estar comprendido entre 1 y 9999
40010184 | El Cargo no existe
40010210 | Debe ingresar un código de Nivel de Instrucción comprendido entre 1 y 999
40010212 | El Nivel de Instrucción no existe
40010215 | Debe ingresar un código de Estado Civil comprendido entre 1 y 26
40010219 | El Estado Civil no existe
40010224 | La Naturaleza Jurídica no existe
40010229 | El Origen de Captación no existe
40010241 | El Tipo de Domicilio no existe
40010251 | El Tipo de Vivienda no existe
40010253 | Debe ingresar un código de Tipo de Contacto comprendido entre 1 y 99
40010297 | Código de estado de Personas ingresado no es válido
40010300 | Debe ingresar un código de Tipo de Establecimiento comprendido 1 y 999999
40010304 | El Tipo de Establecimiento no existe
40010331 | No puede ingresar un nivel de datos inferior al actual
40010335 | Debe ingresar un nombre no mayor de 70 carácteres
40010336 | Debe ingresar una actividad y el código debe estar comprendido entre 1 y 999999999
40010343 | Número de documento no válido
40010347 | La persona con número de documento ? ya existe
40010352 | Email inválido
40010353 | Existe inconsistencia de datos con el campo ? en la RNG ??
40010358 | El concepto de regla de negocio no existe
40010359 | La persona ingresada como cónyugue no existe
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
  '{{baseUrl}}/public/Persons/v1/update?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "naturalPerson": {
    "addresses": {
      "address": []
    },
    "birthCountryDescription": "México",
    "birthCountryId": 484,
    "birthDate": "1996-12-04",
    "birthPlace": "",
    "birthPlaceFirstLevelDescription": "",
    "birthPlaceFirstLevelId": 8,
    "birthPlaceSecondLevelDescription": "",
    "birthPlaceSecondLevelId": 4,
    "birthPlaceThirdLevelDescription": "",
    "birthPlaceThirdLevelId": 0,
    "childrenNumber": 3,
    "citizenshipCountryDescription": "México",
    "citizenshipCountryId": 484,
    "contacts": {
      "contact": []
    },
    "countryDescription": "México",
    "countryId": 484,
    "customerAcquisitionSource": 8,
    "customerAcquisitionSourceDescription": "COMERCIALIZADORA",
    "customFields": {
      "customField": []
    },
    "dateOfDeath": "",
    "deceased": false,
    "dependentsNumber": 0,
    "documentNumber": "HADR821023HHGFQS74",
    "documentTypeDescription": "D.N.I.",
    "documentTypeId": 1,
    "expirationDate": "2030-12-31",
    "firstLastname": "PONTES",
    "firstName": "GABRIEL",
    "gender": "M",
    "instructionLevelDescription": "",
    "instructionLevelId": 0,
    "isPEP": false,
    "legalCitizen": false,
    "maritalStatusDescription": "SOLTERO/A",
    "maritalStatusId": 1,
    "occupations": {
      "occupation": []
    },
    "references": {
      "reference": []
    },
    "relationships": {
      "relationship": []
    },
    "requiresSpouse": false,
    "secondLastname": "SILVA",
    "secondName": "",
    "worth": "0.00",
    "worthStatus": false,
    "worthSubmissionDate": ""
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
::: details naturalPerson

### naturalPerson

::: center
Los campos del tipo de dato estructurado naturalPerson son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
addresses | [address](#address) | Listado de domicilios.
birthCountryId | Short $<(Length: 3)>$ | Identificador del país de nacimiento.
birthCountryDescription | String $<(Length: 30)>$ | Descripción del país de nacimiento.
birthDate | Date $<(Length: 8)>$ | Fecha de nacimiento.
birthPlace | String $<(Length: 20)>$ | Lugar de nacimiento.
birthPlaceFirstLevelId | Int $<(Length: 5)>$ | Identificador del primer nivel del lugar de nacimiento.
birthPlaceFirstLevelDescription | String $<(Length: 20)>$ | Descripción del primer nivel del lugar de nacimiento.
birthPlaceSecondLevelId | Int $<(Length: 5)>$ | Identificador del segundo nivel del lugar de nacimiento.
birthPlaceSecondLevelDescription | String $<(Length: 20)>$ | Descripción del segundo nivel del lugar de nacimiento.
birthPlaceThirdLevelId | Int $<(Length: 9)>$ | Identificador del tercer nivel del lugar de nacimiento.
birthPlaceThirdLevelDescription | String $<(Length: 20)>$ | Descripción del tercer nivel del lugar de nacimiento.
childrenNumber | Short $<(Length: 3)>$ | Número de hijos.
citizenshipCountryId | Short $<(Length: 3)>$ | Identificador del país de ciudadanía.
citizenshipCountryDescription | String $<(Length: 30)>$ | Descripción del país de ciudadanía.
contacts | [contact](#contact) | Listado de datos de contacto.
countryId | Short $<(Length: 3)>$ | Identificador del país.
countryDescription | String $<(Length: 30)>$ | Descripción del país.
customerAcquisitionSource | Int $<(Length: 5)>$ | Fuente de adquisición del cliente.
customerAcquisitionSourceDescription | String $<(Length: 30)>$ | Descripción de la fuente de adquisición del cliente.
customFields | [customField](#customfield) | Listado de campos personalizados.
dateOfDeath | Date $<(Length: 8)>$ | Fecha de fallecimiento.
deceased | Boolean | ¿Está fallecido?
dependentsNumber | Short $<(Length: 3)>$ | Número de dependientes.
documentNumber | String $<(Length: 25)>$ | Número de documento.
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
expirationDate | Date $<(Length: 8)>$ | Fecha de vencimiento.
firstLastname | String $<(Length: 30)>$ | Primer apellido.
firstName | String $<(Length: 25)>$ | Primer nombre.
gender | String $<(Length: 1)>$ | Género.
instructionLevelId | Short $<(Length: 3)>$ | Identificador del nivel de instrucción.
instructionLevelDescription | String $<(Length: 30)>$ | Descripción del nivel de instrucción.
isPEP | Boolean | ¿Es Persona Políticamente Expuesta?
legalCitizen | Boolean | ¿Es ciudadano legal?
maritalStatusId | Byte $<(Length: 2)>$ | Identificador del estado civil.
maritalStatusDescription | String $<(Length: 20)>$ | Descripción del estado civil.
occupations | [occupation](#occupation) | Listado de ocupaciones.
references | [reference](#reference) | Listado de referencias.
relationships | [relationship](#relationship) | Listado de vínculos.
requiresSpouse | Boolean | ¿Requiere cónyuge?
secondLastname | String $<(Length: 30)>$ | Segundo apellido.
secondName | String $<(Length: 25)>$ | Segundo nombre.
worth | Double $<(Length: 18.2)>$ | Patrimonio.
worthStatus | Boolean $<(Length: 2)>$ | Estado patrimonial.
worthSubmissionDate | Date $<(Length: 8)>$ | Fecha de presentación del patrimonio.
:::

::: details address

### address

::: center
Los campos del tipo de dato estructurado address son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
address | String $<(Length: 140)>$ | Dirección.
addressCorrelative | Short $<(Length: 3)>$ | Correlativo de dirección.
addressTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de dirección.
addressTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de dirección.
cityId | Int $<(Length: 5)>$ | Identificador de ciudad.
cityDescription | String $<(Length: 40)>$ | Descripción de ciudad.
colonyId | Int $<(Length: 9)>$ | Identificador de colonia.
countryId | Short $<(Length: 3)>$ | Identificador del país.
countryDescription | String $<(Length: 40)>$ | Descripción del país.
departmentId | Int $<(Length: 5)>$ | Identificador del departamento.
departmentDescription | String $<(Length: 40)>$ | Descripción del departamento.
districtId | Int $<(Length: 9)>$ | Identificador del distrito.
districtDescription | String $<(Length: 40)>$ | Descripción del distrito.
geographicalUbication | String $<(Length: 6)>$ | Ubicación geográfica.
housingTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de vivienda.
housingTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de vivienda.
isABusiness | Boolean | ¿Es una empresa?
latitude | Double $<(Length: 10.6)>$ | Latitud.
level1Data | String $<(Length: 30)>$ | Dato de nivel 1.
level1Id | Short $<(Length: 3)>$ | Identificador de nivel 1.
level1Description | String $<(Length: 35)>$ | Descripción de nivel 1.
level2Data | String $<(Length: 30)>$ | Dato de nivel 2.
level2Id | Short $<(Length: 3)>$ | Identificador de nivel 2.
level2Description | String $<(Length: 35)>$ | Descripción de nivel 2.
level3Data | String $<(Length: 30)>$ | Dato de nivel 3.
level3Id | Short $<(Length: 3)>$ | Identificador de nivel 3.
level3Description | String $<(Length: 35)>$ | Descripción de nivel 3.
level4Data | String $<(Length: 30)>$ | Dato de nivel 4.
level4Id | Short $<(Length: 3)>$ | Identificador de nivel 4.
level4Description | String $<(Length: 35)>$ | Descripción de nivel 4.
longitude | Double $<(Length: 10.6)>$ | Longitud.
mainAddress | Boolean | ¿Es dirección principal?
postalCode | String $<(Length: 8)>$ | Código postal.
references | String $<(Length: 140)>$ | Referencias.
settlementType | Short $<(Length: 3)>$ | Tipo de liquidación.
sinceDate | Date $<(Length: 8)>$ | Fecha desde.
statusId | String $<(Length: 1)>$ | Identificador de estado.
:::

::: details contact

### contact

::: center
Los campos del tipo de dato estructurado contact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
addressCorrelative | Short $<(Length: 3)>$ | Correlativo del domicilio.
addressId | String $<(Length: 140)>$ | Identificador del domicilio.
associatedToAnAddress | Boolean | ¿Está asociado a un domicilio?
comment | String $<(Length: 250)>$ | Comentario.
contactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
contactTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de contacto.
correlative | Byte $<(Length: 2)>$ | Correlativo del contacto.
enabled | Boolean | ¿Está habilitado?
endTimeRange1 | String $<(Length: 5)>$ | Fin del rango horario 1.
endTimeRange2 | String $<(Length: 5)>$ | Fin del rango horario 2.
priority | Byte $<(Length: 2)>$ | Prioridad.
startTimeRange1 | String $<(Length: 5)>$ | Inicio del rango horario 1.
startTimeRange2 | String $<(Length: 5)>$ | Inicio del rango horario 2.
telephoneCompanyId | Short $<(Length: 3)>$ | Identificador de la compañía telefónica.
telephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
text | String $<(Length: 250)>$ | Texto.
validated | Boolean | ¿Está validado?
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

::: details relationship

### relationship

::: center
Los campos del tipo de dato estructurado relationship son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
bidirectional | Boolean | ¿Es bidireccional?
integrantName | String | Nombre del integrante.
percentage | Double $<(Length: 11)>$ | Porcentaje.
personGUID | String $<(Length: 10)>$ | GUID (identificador único global) de la persona.
relationshipId | Short $<(Length: 4)>$ | Identificador de vínculo.
relationshipDescription | String $<(Length: 30)>$ | Descripción de vínculo.
:::
<!-- CIERRA SDT -->
