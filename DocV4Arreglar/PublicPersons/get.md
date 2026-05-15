---
title: Obtener [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los datos de una persona.

**Nombre publicación:** PublicPersons.get

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0032

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(length: 36)>$ | GUID (identificador único global) de la persona.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
naturalPerson | [SdtsBTPEWNaturalPerson](#sdtsbtpewnaturalperson) | Datos de persona natural.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.

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
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9"
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
  "naturalPerson": {
    "CountryId": 604,
    "CountryDescription": "Perú",
    "DocumentTypeId": 11,
    "DocumentTypeDescription": "D.N.I.",
    "DocumentNumber": "12345679",
    "FirstLastname": "PONTES",
    "SecondLastname": "SILVA",
    "FirstName": "GABRIEL",
    "SecondName": "",
    "Gender": "M",
    "BirthDate": "1996-12-04",
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
          "CompanyName": "COMPAÑÍA S.A",
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
      "SdtsBTPAWCustomField": [
        {
          "Correlative": 1,
          "Id": "1",
          "Value": "AFICIÓN",
          "Description": ""
        },
        {
          "Correlative": 2,
          "Id": "2",
          "Value": "PROFESIÓN",
          "Description": ""
        }
      ]
    }
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:02",
    "Numero": 13469350,
    "Servicio": "PublicPersons.get",
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
BirthCountryDescription | String $<(length: 30)>$ | Descripción del país de nacimiento.
BirthDate | Date $<(length: 8)>$ | Fecha de nacimiento.
BirthPlace | String $<(length: 20)>$ | Lugar de nacimiento.
BirthPlaceFirstLevelId | Int $<(length: 5)>$ | Identificador del primer nivel del lugar de nacimiento.
BirthPlaceFirstLevelDescription | String $<(length: 20)>$ | Descripción del primer nivel del lugar de nacimiento.
BirthPlaceSecondLevelId | Int $<(length: 5)>$ | Identificador del segundo nivel del lugar de nacimiento.
BirthPlaceSecondLevelDescription | String $<(length: 20)>$ | Descripción del segundo nivel del lugar de nacimiento.
BirthPlaceThirdLevelId | Int $<(length: 9)>$ | Identificador del tercer nivel del lugar de nacimiento.
BirthPlaceThirdLevelDescription | String $<(length: 20)>$ | Descripción del tercer nivel del lugar de nacimiento.
ChildrenNumber | Short $<(length: 3)>$ | Número de hijos.
CitizenshipCountryId | Short | Identificador del país de ciudadanía.
CitizenshipCountryDescription | String $<(length: 30)>$ | Descripción del país de ciudadanía.
Contacts | [SdtsBTPEWContact](#sdtsbtpewcontact) | Contactos.
CountryId | Short | Identificador del país.
CountryDescription | String $<(length: 30)>$ | Descripción del país.
CustomerAcquisitionSource | Int $<(length: 5)>$ | Fuente de adquisición del cliente.
CustomerAcquisitionSourceDescription | String $<(length: 30)>$ | Descripción de la fuente de adquisición del cliente.
CustomFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Campos personalizados.
DateOfDeath | Date $<(length: 8)>$ | Fecha de fallecimiento.
Deceased | Boolean $<(length: 1)>$ | Fallecido.
DependentsNumber | Short $<(length: 3)>$ | Número de dependientes.
DocumentNumber | String $<(length: 25)>$ | Número de documento.
DocumentTypeId | Short | Identificador del tipo de documento.
DocumentTypeDescription | String $<(length: 30)>$ | Descripción del tipo de documento.
ExpirationDate | Date $<(length: 8)>$ | Fecha de vencimiento.
FirstLastname | String $<(length: 30)>$ | Primer apellido.
FirstName | String $<(length: 25)>$ | Primer nombre.
Gender | String $<(length: 1)>$ | Género.
InstructionLevelId | Short | Identificador del nivel de instrucción.
InstructionLevelDescription | String $<(length: 30)>$ | Descripción del nivel de instrucción.
LegalCitizen | Boolean $<(length: 1)>$ | Ciudadano legal.
MaritalStatusId | Byte $<(length: 2)>$ | Identificador del estado civil.
MaritalStatusDescription | String $<(length: 20)>$ | Descripción del estado civil.
Occupations | [SdtsBTPEWOccupation](#sdtsbtpewoccupation) | Ocupaciones.
PEP | Boolean $<(length: 1)>$ | PEP (Persona Expuesta Políticamente).
References | [SdtsBTPEWReference](#sdtsbtpewreference) | Referencias.
Relationships | [SdtsBTPEWRelationship](#sdtsbtpewrelationship) | Relaciones.
RequiresSpouse | Boolean $<(length: 1)>$ | Requiere cónyuge.
SecondLastname | String $<(length: 30)>$ | Segundo apellido.
SecondName | String $<(length: 25)>$ | Segundo nombre.
Worth | Double $<(length: 18)>$ | Patrimonio.
WorthStatus | Boolean $<(length: 2)>$ | Estado patrimonial.
WorthSubmissionDate | Date $<(length: 8)>$ | Fecha de presentación del patrimonio.
:::

::: details SdtsBTPEWAddress

### SdtsBTPEWAddress

::: center
Los campos del tipo de dato estructurado SdtsBTPEWAddress son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address | String $<(length: 140)>$ | Dirección.
AddressCorrelative | Short $<(length: 3)>$ | Correlativo de dirección.
AddressTypeId | Byte $<(length: 2)>$ | Identificador del tipo de dirección.
AddressTypeDescription | String $<(length: 20)>$ | Descripción del tipo de dirección.
CityId | Int $<(length: 5)>$ | Identificador de la ciudad.
CityDescription | String | Descripción de la ciudad.
ColonyId | Int $<(length: 9)>$ | Identificador de la colonia.
CountryId | Short $<(length: 3)>$ | Identificador del país.
CountryDescription | String | Descripción del país.
DepartmentId | Int $<(length: 5)>$ | Identificador del departamento.
DepartmentDescription | String | Descripción del departamento.
DistrictId | Int $<(length: 9)>$ | Identificador del distrito.
DistrictDescription | String | Descripción del distrito.
GeographicalUbication | String $<(length: 6)>$ | Ubicación geográfica.
HousingTypeId | Byte $<(length: 2)>$ | Identificador del tipo de vivienda.
HousingTypeDescription | String | Descripción del tipo de vivienda.
IsABusiness | Boolean $<(length: 1)>$ | ¿Es un negocio?.
Latitude | Double $<(length: 10)>$ | Latitud.
Level1Data | String $<(length: 30)>$ | Datos del nivel 1.
Level1Id | Short $<(length: 3)>$ | Identificador del nivel 1.
Level1Description | String $<(length: 35)>$ | Descripción del nivel 1.
Level2Data | String $<(length: 30)>$ | Datos del nivel 2.
Level2Id | Short $<(length: 3)>$ | Identificador del nivel 2.
Level2Description | String $<(length: 35)>$ | Descripción del nivel 2.
Level3Data | String $<(length: 30)>$ | Datos del nivel 3.
Level3Id | Short $<(length: 3)>$ | Identificador del nivel 3.
Level3Description | String $<(length: 35)>$ | Descripción del nivel 3.
Level4Data | String $<(length: 30)>$ | Datos del nivel 4.
Level4Id | Short $<(length: 3)>$ | Identificador del nivel 4.
Level4Description | String $<(length: 35)>$ | Descripción del nivel 4.
Longitude | Double $<(length: 10)>$ | Longitud.
MainAddress | Boolean $<(length: 1)>$ | Dirección principal.
PostalCode | String $<(length: 8)>$ | Código postal.
References | String $<(length: 140)>$ | Referencias.
SettlementType | Short $<(length: 3)>$ | Tipo de asentamiento.
SinceDate | Date $<(length: 8)>$ | Fecha desde.
StatusId | String $<(length: 1)>$ | Identificador de estado.
:::

::: details SdtsBTPEWContact

### SdtsBTPEWContact

::: center
Los campos del tipo de dato estructurado SdtsBTPEWContact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddressCorrelative | Short $<(length: 3)>$ | Correlativo de dirección.
AddressId | String $<(length: 140)>$ | Identificador de dirección.
AssociatedToAnAddress | Boolean $<(length: 1)>$ | Asociado a una dirección.
Comment | String $<(length: 250)>$ | Comentario.
ContactTypeId | Byte $<(length: 2)>$ | Identificador del tipo de contacto.
ContactTypeDescription | String $<(length: 50)>$ | Descripción del tipo de contacto.
Correlative | Byte $<(length: 2)>$ | Correlativo.
Enabled | Boolean $<(length: 1)>$ | Habilitado.
EndTimeRange1 | String $<(length: 5)>$ | Fin del rango horario 1.
EndTimeRange2 | String $<(length: 5)>$ | Fin del rango horario 2.
Priority | Byte $<(length: 2)>$ | Prioridad.
ReceivesMails | Boolean $<(length: 1)>$ | Recibe correos.
StartTimeRange1 | String $<(length: 5)>$ | Inicio del rango horario 1.
StartTimeRange2 | String $<(length: 5)>$ | Inicio del rango horario 2.
TelephoneCompanyId | Short $<(length: 3)>$ | Identificador de compañía telefónica.
TelephoneCompanyDescription | String $<(length: 50)>$ | Descripción de la compañía telefónica.
Text | String $<(length: 250)>$ | Texto.
Validated | Boolean $<(length: 1)>$ | Validado.
:::

::: details SdtsBTPAWCustomField

### SdtsBTPAWCustomField

::: center
Los campos del tipo de dato estructurado SdtsBTPAWCustomField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Id | String $<(length: 30)>$ | Identificador.
Description | String $<(length: 50)>$ | Descripción.
Value | String $<(length: 250)>$ | Value.
:::

::: details SdtsBTPEWOccupation

### SdtsBTPEWOccupation

::: center
Los campos del tipo de dato estructurado SdtsBTPEWOccupation son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CompanyDocument | String $<(length: 25)>$ | Documento de empresa.
CompanyName | String $<(length: 70)>$ | Nombre de empresa.
Correlative | Byte $<(length: 2)>$ | Correlativo.
EconomicActivityId | Long $<(length: 11)>$ | Identificador de actividad económica.
EconomicActivityDescription | String $<(length: 80)>$ | Descripción de actividad económica.
EconomicActivityTypeId | Long $<(length: 15)>$ | Identificador del tipo de actividad económica.
EconomicActivityTypeDescription | String $<(length: 60)>$ | Descripción del tipo de actividad económica.
EndDate | Date $<(length: 8)>$ | Fecha de fin.
EstablishmentTypeId | Int $<(length: 6)>$ | Identificador del tipo de establecimiento.
EstablishmentTypeDescription | String $<(length: 50)>$ | Descripción del tipo de establecimiento.
Exports | Boolean $<(length: 1)>$ | Exporta.
Imports | Boolean $<(length: 1)>$ | Importa.
Income | Double $<(length: 18)>$ | Ingresos.
JobTitleId | Short $<(length: 4)>$ | Identificador del cargo.
JobTitleDescription | String $<(length: 30)>$ | Descripción del cargo.
MainOccupation | Boolean $<(length: 1)>$ | Ocupación principal.
Multilateral | Boolean $<(length: 1)>$ | Multilateral.
OccupationId | Int $<(length: 5)>$ | Identificador de ocupación.
OccupationDescription | String $<(length: 30)>$ | Descripción de la ocupación.
OccupationTypeId | Short | Identificador del tipo de ocupación.
OccupationTypeDescription | String $<(length: 30)>$ | Descripción del tipo de ocupación.
StartDate | Date $<(length: 8)>$ | Fecha de inicio.
:::

::: details SdtsBTPEWReference

### SdtsBTPEWReference

::: center
Los campos del tipo de dato estructurado SdtsBTPEWReference son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address1 | String $<(length: 50)>$ | Dirección 1.
Address2 | String $<(length: 50)>$ | Dirección 2.
Address3 | String $<(length: 50)>$ | Dirección 3.
BondOrJobTitle | String $<(length: 1)>$ | Vínculo o cargo.
Correlative | Short $<(length: 3)>$ | Correlativo.
EnterpriceJobTitleDescription | String $<(length: 30)>$ | Descripción del cargo en la empresa.
EnterpriseJobTitleId | Short $<(length: 4)>$ | Identificador del cargo empresarial.
Name | String $<(length: 50)>$ | Nombre.
PersonType | String $<(length: 1)>$ | Tipo de persona.
ReferenceTypeId | Byte $<(length: 2)>$ | Identificador del tipo de referencia.
ReferenceTypeDescription | String $<(length: 30)>$ | Descripción del tipo de referencia.
RelationshipId | Short | Identificador de relación.
RelationshipDescription | String $<(length: 30)>$ | Descripción de la relación.
Telephone | String $<(length: 50)>$ | Teléfono.
:::

::: details SdtsBTPEWRelationship

### SdtsBTPEWRelationship

::: center
Los campos del tipo de dato estructurado SdtsBTPEWRelationship son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Bidirectional | Boolean $<(length: 1)>$ | Bidireccional.
BondId | Short | Identificador del vínculo.
BondDescription | String $<(length: 30)>$ | Descripción del vínculo.
IntegrantName | String $<(length: 70)>$ | Nombre del integrante.
JobTitleId | Short | Identificador del cargo.
Percentage | Double $<(length: 8)>$ | Porcentaje.
PersonGUID | String $<(length: 36)>$ | GUID de persona.
:::
<!-- CIERRA SDT -->
