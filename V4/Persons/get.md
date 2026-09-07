---
title: Get
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los datos de una persona.

**Nombre publicación:** PublicPersons.get

**Programa:** PublicAPI.BTPEPA0032

**Alcance:** Global

**Endpoint:** /public/Persons/v1/get
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
naturalPerson | [naturalPerson](#naturalperson) | Datos de persona natural.

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
curl -X GET \
  '{{baseUrl}}/public/Persons/v1/get?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
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
  "naturalPerson": {
    "addresses": {
      "address": [
        {
          "address": "AVENIDA JOSE BENITO LAMAS NO. PUERTA 2233 APTO 14",
          "addressCorrelative": 1,
          "addressTypeDescription": "RESIDENCIA",
          "addressTypeId": 1,
          "cityDescription": "Aguascalientes",
          "cityId": 1,
          "colonyId": 0,
          "countryDescription": "México",
          "countryId": 484,
          "departmentDescription": "AGUASCALIENTES",
          "departmentId": 1,
          "districtDescription": "Aguascalientes",
          "districtId": 1,
          "geographicalUbication": "",
          "housingTypeDescription": "FAMILIAR",
          "housingTypeId": 5,
          "isABusiness": true,
          "latitude": 0,
          "level1Data": "JOSE BENITO LAMAS",
          "level1Description": "AVENIDA",
          "level1Id": 1,
          "level2Data": "2233",
          "level2Description": "NO. PUERTA",
          "level2Id": 1,
          "level3Data": "14",
          "level3Description": "APTO",
          "level3Id": 1,
          "level4Data": "",
          "level4Description": "",
          "level4Id": 0,
          "longitude": 0,
          "mainAddress": true,
          "postalCode": "9999",
          "references": "",
          "settlementType": 0,
          "sinceDate": "2022-01-01",
          "statusId": "H"
        }
      ]
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
      "contact": [
        {
          "addressCorrelative": 0,
          "addressId": "",
          "associatedToAnAddress": false,
          "comment": "CORREO",
          "contactTypeDescription": "",
          "contactTypeId": 3,
          "correlative": 1,
          "enabled": true,
          "endTimeRange1": "",
          "endTimeRange2": "",
          "priority": 3,
          "startTimeRange1": "",
          "startTimeRange2": "",
          "telephoneCompanyDescription": "ANTEL",
          "telephoneCompanyId": 1,
          "text": "GPONTES@GMAIL.COM",
          "validated": true
        },
        {
          "addressCorrelative": 0,
          "addressId": "",
          "associatedToAnAddress": false,
          "comment": "TELEFONO CELULAR",
          "contactTypeDescription": "",
          "contactTypeId": 1,
          "correlative": 1,
          "enabled": true,
          "endTimeRange1": "",
          "endTimeRange2": "",
          "priority": 1,
          "startTimeRange1": "",
          "startTimeRange2": "",
          "telephoneCompanyDescription": "ANTEL",
          "telephoneCompanyId": 1,
          "text": "0952659560",
          "validated": true
        },
        {
          "addressCorrelative": 0,
          "addressId": "",
          "associatedToAnAddress": false,
          "comment": "TELEFONO FIJO",
          "contactTypeDescription": "",
          "contactTypeId": 2,
          "correlative": 1,
          "enabled": true,
          "endTimeRange1": "",
          "endTimeRange2": "",
          "priority": 2,
          "startTimeRange1": "",
          "startTimeRange2": "",
          "telephoneCompanyDescription": "ANTEL",
          "telephoneCompanyId": 1,
          "text": "2514876500",
          "validated": true
        }
      ]
    },
    "countryDescription": "México",
    "countryId": 484,
    "customFields": {
      "customField": [
        {
          "correlative": 1,
          "description": "",
          "id": "Afición",
          "value": "0"
        },
        {
          "correlative": 1,
          "description": "",
          "id": "Profesión",
          "value": "0"
        }
      ]
    },
    "customerAcquisitionSource": 8,
    "customerAcquisitionSourceDescription": "COMERCIALIZADORA",
    "deceased": false,
    "dependentsNumber": 0,
    "documentNumber": "HADR821023HHGFQS74",
    "documentTypeDescription": "CURP",
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
      "occupation": [
        {
          "companyDocument": "",
          "companyName": "DIENTE LOPEZ",
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
    "worth": 0,
    "worthStatus": false
  }
}
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
