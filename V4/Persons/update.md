---
title: Update
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar los datos de una persona.

**Nombre publicación:** PublicPersons.update

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0031

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
naturalPerson | [SdtsBTPEWNaturalPerson](#sdtsbtpewnaturalperson) | Datos de persona natural.


@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
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
40010335 | Debe ingresar un nombre no mayor de 70 carácteres
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9",
  "naturalPerson": {
    "CountryId": 1,
    "CountryDescription": "Perú",
    "DocumentTypeId": 1,
    "DocumentTypeDescription": "D.N.I.",
    "DocumentNumber": "12345678",
    "FirstLastname": "PEREZ",
    "SecondLastname": "GARCIA",
    "FirstName": "JUAN",
    "SecondName": "",
    "Gender": "M",
    "BirthDate": "1990-01-01",
    "MaritalStatusId": 1,
    "MaritalStatusDescription": "SOLTERO/A",
    "RequiresSpouse": false,
    "BirthCountryId": 484,
    "BirthCountryDescription": "México",
    "BirthPlace": "",
    "BirthPlaceFirstLevelId": 8,
    "BirthPlaceFirstLevelDescription": "",
    "BirthPlaceSecondLevelId": 4,
    "BirthPlaceSecondLevelDescription": "",
    "BirthPlaceThirdLevelId": 0,
    "BirthPlaceThirdLevelDescription": "",
    "LegalCitizen": false,
    "CitizenshipCountryId": 604,
    "CitizenshipCountryDescription": "México",
    "Deceased": false,
    "DateOfDeath": "",
    "ChildrenNumber": 3,
    "DependentsNumber": 0,
    "InstructionLevelId": 0,
    "InstructionLevelDescription": "",
    "Worth": "0.00",
    "WorthStatus": false,
    "WorthSubmissionDate": "",
    "ExpirationDate": "2030-12-31",
    "PEP": false,
    "CustomerAcquisitionSource": 8,
    "CustomerAcquisitionSourceDescription": "COMERCIALIZADORA",
    "Contacts": {
      "SdtsBTPEWContact": [
        {
          "Correlative": 1,
          "ContactTypeId": 3,
          "ContactTypeDescription": "",
          "Text": "GPONTES@GMAIL.COM",
          "Comment": "CORREO",
          "TelephoneCompanyId": 1,
          "TelephoneCompanyDescription": "ANTEL",
          "Enabled": true,
          "AssociatedToAnAddress": false,
          "AddressCorrelative": 0,
          "AddressId": "",
          "Validated": true,
          "ReceivesMails": false,
          "StartTimeRange1": "",
          "EndTimeRange1": "",
          "StartTimeRange2": "",
          "EndTimeRange2": "",
          "Priority": 3
        },
        {
          "Correlative": 1,
          "ContactTypeId": 1,
          "ContactTypeDescription": "",
          "Text": "095265956",
          "Comment": "TELEFONO CELULAR",
          "TelephoneCompanyId": 1,
          "TelephoneCompanyDescription": "ANTEL",
          "Enabled": true,
          "AssociatedToAnAddress": false,
          "AddressCorrelative": 0,
          "AddressId": "",
          "Validated": true,
          "ReceivesMails": false,
          "StartTimeRange1": "",
          "EndTimeRange1": "",
          "StartTimeRange2": "",
          "EndTimeRange2": "",
          "Priority": 1
        },
        {
          "Correlative": 1,
          "ContactTypeId": 2,
          "ContactTypeDescription": "",
          "Text": "25148765",
          "Comment": "TELEFONO FIJO",
          "TelephoneCompanyId": 1,
          "TelephoneCompanyDescription": "ANTEL",
          "Enabled": true,
          "AssociatedToAnAddress": false,
          "AddressCorrelative": 0,
          "AddressId": "",
          "Validated": true,
          "ReceivesMails": false,
          "StartTimeRange1": "",
          "EndTimeRange1": "",
          "StartTimeRange2": "",
          "EndTimeRange2": "",
          "Priority": 2
        }
      ]
    },
    "Occupations": {
      "SdtsBTPEWOccupation": [
        {
          "Correlative": 1,
          "OccupationId": 1,
          "OccupationDescription": "EMPLEADO",
          "JobTitleId": 19,
          "JobTitleDescription": "ACCIONISTA",
          "Multilateral": false,
          "CompanyDocument": "",
          "CompanyName": "DIENTE LOPEZ",
          "StartDate": "2024-01-01",
          "EndDate": "",
          "EconomicActivityId": 97000,
          "EconomicActivityDescription": "FAMILIAS",
          "EconomicActivityTypeId": 65,
          "EconomicActivityTypeDescription": "FAMILIAS",
          "MainOccupation": true,
          "Imports": false,
          "Exports": false,
          "EstablishmentTypeId": 2,
          "EstablishmentTypeDescription": "ESTABLECIMIENTO / LOCAL",
          "OccupationTypeId": 1,
          "OccupationTypeDescription": "DEPENDIENTE",
          "Income": "90000.00"
        }
      ]
    },
    "Addresses": {
      "SdtsBTPEWAddress": [
        {
          "AddressCorrelative": 1,
          "AddressTypeId": 1,
          "AddressTypeDescription": "RESIDENCIA",
          "HousingTypeId": 5,
          "HousingTypeDescription": "FAMILIAR",
          "IsABusiness": true,
          "SinceDate": "2022-01-01",
          "Level1Id": 1,
          "Level1Description": "AVENIDA",
          "Level1Data": "JOSE BENITO LAMAS",
          "Level2Id": 1,
          "Level2Description": "NO. PUERTA",
          "Level2Data": "2233",
          "Level3Id": 1,
          "Level3Description": "APTO",
          "Level3Data": "14",
          "Level4Id": 1,
          "Level4Description": "X",
          "Level4Data": "",
          "Address": "AVENIDA JOSE BENITO LAMAS NO. PUERTA 2233 APTO 14 X",
          "References": "",
          "Latitude": "0.000000",
          "Longitude": "0.000000",
          "CountryId": 604,
          "CountryDescription": "México",
          "DepartmentId": 1,
          "DepartmentDescription": "Amazonas",
          "CityId": 101,
          "CityDescription": "Chachapoyas",
          "DistrictId": 10119,
          "DistrictDescription": "San Isidro de Maino",
          "ColonyId": 0,
          "GeographicalUbication": "",
          "PostalCode": "9999",
          "SettlementType": 0,
          "StatusId": "H",
          "MainAddress": true
        }
      ]
    },
    "References": {
      "SdtsBTPEWReference": []
    },
    "Relationships": {
      "SdtsBTPEWRelationship": []
    },
    "CustomFields": {
      "SdtsBTPAWCustomField": []
    }
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:42",
    "Numero": 13469369,
    "Servicio": "PublicPersons.update",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWNaturalPerson

### SdtsBTPEWNaturalPerson

::: center
Los campos del tipo de dato estructurado SdtsBTPEWNaturalPerson son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Addresses | [SdtsBTPEWAddress](#sdtsbtpewaddress) | Direcciones.
BirthCountryId | Short | Identificador del país de nacimiento.
BirthCountryDescription | String $<(Length: 30)>$ | Descripción del país de nacimiento.
BirthDate | Date $<(Length: 8)>$ | Fecha de nacimiento.
BirthPlace | String $<(Length: 20)>$ | Lugar de nacimiento.
BirthPlaceFirstLevelId | Int $<(Length: 5)>$ | Identificador del primer nivel del lugar de nacimiento.
BirthPlaceFirstLevelDescription | String $<(Length: 20)>$ | Descripción del primer nivel del lugar de nacimiento.
BirthPlaceSecondLevelId | Int $<(Length: 5)>$ | Identificador del segundo nivel del lugar de nacimiento.
BirthPlaceSecondLevelDescription | String $<(Length: 20)>$ | Descripción del segundo nivel del lugar de nacimiento.
BirthPlaceThirdLevelId | Int $<(Length: 9)>$ | Identificador del tercer nivel del lugar de nacimiento.
BirthPlaceThirdLevelDescription | String $<(Length: 20)>$ | Descripción del tercer nivel del lugar de nacimiento.
ChildrenNumber | Short $<(Length: 3)>$ | Número de hijos.
CitizenshipCountryId | Short | Identificador del país de ciudadanía.
CitizenshipCountryDescription | String $<(Length: 30)>$ | Descripción del país de ciudadanía.
Contacts | [SdtsBTPEWContact](#sdtsbtpewcontact) | Contactos.
CountryId | Short | Identificador del país.
CountryDescription | String $<(Length: 30)>$ | Descripción del país.
CustomerAcquisitionSource | Int $<(Length: 5)>$ | Fuente de adquisición del cliente.
CustomerAcquisitionSourceDescription | String $<(Length: 30)>$ | Descripción de la fuente de adquisición del cliente.
CustomFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Campos personalizados.
DateOfDeath | Date $<(Length: 8)>$ | Fecha de fallecimiento.
Deceased | Boolean | Fallecido.
DependentsNumber | Short $<(Length: 3)>$ | Número de dependientes.
DocumentNumber | String $<(Length: 25)>$ | Número de documento.
DocumentTypeId | Short | Identificador del tipo de documento.
DocumentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
ExpirationDate | Date $<(Length: 8)>$ | Fecha de vencimiento.
FirstLastname | String $<(Length: 30)>$ | Primer apellido.
FirstName | String $<(Length: 25)>$ | Primer nombre.
Gender | String $<(Length: 1)>$ | Género.
InstructionLevelId | Short | Identificador del nivel de instrucción.
InstructionLevelDescription | String $<(Length: 30)>$ | Descripción del nivel de instrucción.
LegalCitizen | Boolean | Ciudadano legal.
MaritalStatusId | Byte $<(Length: 2)>$ | Identificador del estado civil.
MaritalStatusDescription | String $<(Length: 20)>$ | Descripción del estado civil.
Occupations | [SdtsBTPEWOccupation](#sdtsbtpewoccupation) | Ocupaciones.
PEP | Boolean | PEP (Persona Expuesta Políticamente).
References | [SdtsBTPEWReference](#sdtsbtpewreference) | Referencias.
Relationships | [SdtsBTPEWRelationship](#sdtsbtpewrelationship) | Relaciones.
RequiresSpouse | Boolean | Requiere cónyuge.
SecondLastname | String $<(Length: 30)>$ | Segundo apellido.
SecondName | String $<(Length: 25)>$ | Segundo nombre.
Worth | Double $<(Length: 18)>$ | Patrimonio.
WorthStatus | Boolean $<(Length: 2)>$ | Estado patrimonial.
WorthSubmissionDate | Date $<(Length: 8)>$ | Fecha de presentación del patrimonio.
:::

::: details SdtsBTPEWAddress

### SdtsBTPEWAddress

::: center
Los campos del tipo de dato estructurado SdtsBTPEWAddress son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address | String $<(Length: 140)>$ | Dirección.
AddressCorrelative | Short $<(Length: 3)>$ | Correlativo de dirección.
AddressTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de dirección.
AddressTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de dirección.
CityId | Int $<(Length: 5)>$ | Identificador de la ciudad.
CityDescription | String | Descripción de la ciudad.
ColonyId | Int $<(Length: 9)>$ | Identificador de la colonia.
CountryId | Short $<(Length: 3)>$ | Identificador del país.
CountryDescription | String | Descripción del país.
DepartmentId | Int $<(Length: 5)>$ | Identificador del departamento.
DepartmentDescription | String | Descripción del departamento.
DistrictId | Int $<(Length: 9)>$ | Identificador del distrito.
DistrictDescription | String | Descripción del distrito.
GeographicalUbication | String $<(Length: 6)>$ | Ubicación geográfica.
HousingTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de vivienda.
HousingTypeDescription | String | Descripción del tipo de vivienda.
IsABusiness | Boolean | ¿Es un negocio?.
Latitude | Double $<(Length: 10)>$ | Latitud.
Level1Data | String $<(Length: 30)>$ | Datos del nivel 1.
Level1Id | Short $<(Length: 3)>$ | Identificador del nivel 1.
Level1Description | String $<(Length: 35)>$ | Descripción del nivel 1.
Level2Data | String $<(Length: 30)>$ | Datos del nivel 2.
Level2Id | Short $<(Length: 3)>$ | Identificador del nivel 2.
Level2Description | String $<(Length: 35)>$ | Descripción del nivel 2.
Level3Data | String $<(Length: 30)>$ | Datos del nivel 3.
Level3Id | Short $<(Length: 3)>$ | Identificador del nivel 3.
Level3Description | String $<(Length: 35)>$ | Descripción del nivel 3.
Level4Data | String $<(Length: 30)>$ | Datos del nivel 4.
Level4Id | Short $<(Length: 3)>$ | Identificador del nivel 4.
Level4Description | String $<(Length: 35)>$ | Descripción del nivel 4.
Longitude | Double $<(Length: 10)>$ | Longitud.
MainAddress | Boolean | Dirección principal.
PostalCode | String $<(Length: 8)>$ | Código postal.
References | String $<(Length: 140)>$ | Referencias.
SettlementType | Short $<(Length: 3)>$ | Tipo de asentamiento.
SinceDate | Date $<(Length: 8)>$ | Fecha desde.
StatusId | String $<(Length: 1)>$ | Identificador de estado.
:::

::: details SdtsBTPEWContact

### SdtsBTPEWContact

::: center
Los campos del tipo de dato estructurado SdtsBTPEWContact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddressCorrelative | Short $<(Length: 3)>$ | Correlativo de dirección.
AddressId | String $<(Length: 140)>$ | Identificador de dirección.
AssociatedToAnAddress | Boolean | Asociado a una dirección.
Comment | String $<(Length: 250)>$ | Comentario.
ContactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
ContactTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de contacto.
Correlative | Byte $<(Length: 2)>$ | Correlativo.
Enabled | Boolean | Habilitado.
EndTimeRange1 | String $<(Length: 5)>$ | Fin del rango horario 1.
EndTimeRange2 | String $<(Length: 5)>$ | Fin del rango horario 2.
Priority | Byte $<(Length: 2)>$ | Prioridad.
ReceivesMails | Boolean | Recibe correos.
StartTimeRange1 | String $<(Length: 5)>$ | Inicio del rango horario 1.
StartTimeRange2 | String $<(Length: 5)>$ | Inicio del rango horario 2.
TelephoneCompanyId | Short $<(Length: 3)>$ | Identificador de compañía telefónica.
TelephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
Text | String $<(Length: 250)>$ | Texto.
Validated | Boolean | Validado.
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

::: details SdtsBTPEWOccupation

### SdtsBTPEWOccupation

::: center
Los campos del tipo de dato estructurado SdtsBTPEWOccupation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CompanyDocument | String $<(Length: 25)>$ | Documento de empresa.
CompanyName | String $<(Length: 70)>$ | Nombre de empresa.
Correlative | Byte $<(Length: 2)>$ | Correlativo.
EconomicActivityId | Long $<(Length: 11)>$ | Identificador de actividad económica.
EconomicActivityDescription | String $<(Length: 80)>$ | Descripción de actividad económica.
EconomicActivityTypeId | Long $<(Length: 15)>$ | Identificador del tipo de actividad económica.
EconomicActivityTypeDescription | String $<(Length: 60)>$ | Descripción del tipo de actividad económica.
EndDate | Date $<(Length: 8)>$ | Fecha de fin.
EstablishmentTypeId | Int $<(Length: 6)>$ | Identificador del tipo de establecimiento.
EstablishmentTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de establecimiento.
Exports | Boolean | Exporta.
Imports | Boolean | Importa.
Income | Double $<(Length: 18)>$ | Ingresos.
JobTitleId | Short $<(Length: 4)>$ | Identificador del cargo.
JobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo.
MainOccupation | Boolean | Ocupación principal.
Multilateral | Boolean | Multilateral.
OccupationId | Int $<(Length: 5)>$ | Identificador de ocupación.
OccupationDescription | String $<(Length: 30)>$ | Descripción de la ocupación.
OccupationTypeId | Short | Identificador del tipo de ocupación.
OccupationTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de ocupación.
StartDate | Date $<(Length: 8)>$ | Fecha de inicio.
:::

::: details SdtsBTPEWReference

### SdtsBTPEWReference

::: center
Los campos del tipo de dato estructurado SdtsBTPEWReference son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address1 | String $<(Length: 50)>$ | Dirección 1.
Address2 | String $<(Length: 50)>$ | Dirección 2.
Address3 | String $<(Length: 50)>$ | Dirección 3.
BondOrJobTitle | String $<(Length: 1)>$ | Vínculo o cargo.
Correlative | Short $<(Length: 3)>$ | Correlativo.
EnterpriceJobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo en la empresa.
EnterpriseJobTitleId | Short $<(Length: 4)>$ | Identificador del cargo empresarial.
Name | String $<(Length: 50)>$ | Nombre.
PersonType | String $<(Length: 1)>$ | Tipo de persona.
ReferenceTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de referencia.
ReferenceTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de referencia.
RelationshipId | Short | Identificador de relación.
RelationshipDescription | String $<(Length: 30)>$ | Descripción de la relación.
Telephone | String $<(Length: 50)>$ | Teléfono.
:::

::: details SdtsBTPEWRelationship

### SdtsBTPEWRelationship

::: center
Los campos del tipo de dato estructurado SdtsBTPEWRelationship son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Bidirectional | Boolean | Bidireccional.
BondId | Short | Identificador del vínculo.
BondDescription | String $<(Length: 30)>$ | Descripción del vínculo.
IntegrantName | String $<(Length: 70)>$ | Nombre del integrante.
JobTitleId | Short | Identificador del cargo.
Percentage | Double $<(Length: 8)>$ | Porcentaje.
PersonGUID | String $<(Length: 36)>$ | GUID (identificador único global) de persona.
:::
<!-- CIERRA SDT -->
