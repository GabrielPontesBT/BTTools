---
title: Get
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los datos de una persona.

**Nombre publicación:** PublicPersons.get

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0032

**Alcance:** Global

**Endpoint:** /public/Persons/v1/get
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Headers

Header | Descripción
:--------- | :-----------
Device | Identificador del dispositivo o canal de origen.
Usuario | Usuario que realiza la solicitud.
Requerimiento | Número de requerimiento.
Canal | Canal de comunicación utilizado.
Token | Token de sesión activo.

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Body

Completar manualmente

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
naturalPerson | [SdtsBTPEWNaturalPerson](#sdtsbtpewnaturalperson) | Datos de persona natural.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
500 |  | BTPEPA0032
40010004 | La persona no existe | BTPEA00000, BTPEA00003
40010063 | Compañía de teléfono incorrecta | BTPEA00010
40010141 | Código de vínculo no existe | BTPEA00020
40010151 | La actividad no existe | BTPEA00750
40010184 | El Cargo no existe | BTPEA00023
40010219 | El Estado Civil no existe | BTPEA00025
40010234 | La ocupación no existe | BTPEA00004
40010251 | El Tipo de Vivienda no existe | BTPEA00022
40010304 | El Tipo de Establecimiento no existe | BTPEA00013
40050001 | Debe ingresar el GUID de persona. | BTPEPA0032
50020018 | El país no se encuentra registrado | BTCNA00000
50020021 | No existe el Id de primer nivel ingresado | BTCNA00001
50020028 | No existe el Id de segundo nivel ingresado | BTCNA00001
50020034 | No existe el Id de tercer nivel ingresado | BTCNA00001
50030001 | Debe ingresar un tipo de documento válido | BTDTA00000
50040005 | No existe la sucursal ingresada | BTBRA00000
50050003 | No existe la empresa ingresada | BTA0000017
50120009 | No existe el estado ingresado | BTSTA00001
99990010006 | No se pudo resolver el usuario | BTSCA00006

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{}
```
@tab HEADERS
```bash
curl -X GET \
  'http://10.0.0.7:5101/api/publicapi/public/Persons/v1/get?personGUID=b51b92ac-47e2-42df-8e68-c41bbe6257ce' \
  -H 'Device: POC' \
  -H 'Usuario: INSTALADOR' \
  -H 'Requerimiento: 1' \
  -H 'Canal: BTMOBILE' \
  -H 'Token: 942D8D6A84BB6CDC21B68D9B'
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
    "InstructionLevelId": 0,
    "CitizenshipCountryId": 858,
    "BirthPlaceFirstLevelId": 5,
    "ChildrenNumber": 0,
    "BirthPlace": "",
    "BirthCountryDescription": "URUGUAY",
    "Deceased": false,
    "Occupations": {
      "SdtsBTPEWOccupation": [
        {
          "EconomicActivityTypeId": 65,
          "OccupationTypeId": 1,
          "OccupationDescription": "EMPLEADO",
          "EconomicActivityId": 97000,
          "CompanyDocument": "",
          "Income": 0,
          "EconomicActivityTypeDescription": "FAMILIAS",
          "Imports": false,
          "EstablishmentTypeDescription": "",
          "Exports": false,
          "EstablishmentTypeId": 0,
          "JobTitleId": 0,
          "CompanyName": "",
          "OccupationTypeDescription": "DEPENDIENTE",
          "Correlative": 1,
          "MainOccupation": true,
          "EconomicActivityDescription": "FAMILIAS",
          "OccupationId": 1,
          "Multilateral": false,
          "JobTitleDescription": ""
        }
      ]
    },
    "Gender": "F",
    "RequiresSpouse": false,
    "WorthStatus": false,
    "BirthPlaceSecondLevelDescription": "",
    "CountryDescription": "URUGUAY",
    "Worth": 0,
    "Addresses": {
      "SdtsBTPEWAddress": []
    },
    "Relationships": {
      "SdtsBTPEWRelationship": []
    },
    "DependentsNumber": 0,
    "CountryId": 858,
    "FirstLastname": "BENAVENTE",
    "BirthCountryId": 858,
    "MaritalStatusId": 1,
    "BirthPlaceSecondLevelId": 1142,
    "FirstName": "YADIRA",
    "CitizenshipCountryDescription": "URUGUAY",
    "DocumentNumber": "71336785",
    "SecondName": "",
    "MaritalStatusDescription": "SOLTERO/A",
    "DocumentTypeId": 1,
    "InstructionLevelDescription": "",
    "CustomFields": {
      "customFieldsItem": []
    },
    "BirthPlaceFirstLevelDescription": "",
    "Contacts": {
      "SdtsBTPEWContact": [
        {
          "AssociatedToAnAddress": false,
          "Comment": "",
          "AddressCorrelative": 0,
          "Validated": false,
          "Priority": 0,
          "Enabled": true,
          "Text": "YBG@YAHOO.COM",
          "TelephoneCompanyDescription": "",
          "EndTimeRange2": "",
          "EndTimeRange1": "",
          "Correlative": 1,
          "ContactTypeId": 3,
          "TelephoneCompanyId": 0,
          "StartTimeRange2": "",
          "AddressId": "",
          "ContactTypeDescription": "",
          "ReceivesMails": false,
          "StartTimeRange1": ""
        },
        {
          "AssociatedToAnAddress": false,
          "Comment": "",
          "AddressCorrelative": 0,
          "Validated": false,
          "Priority": 0,
          "Enabled": false,
          "Text": "twitter",
          "TelephoneCompanyDescription": "",
          "EndTimeRange2": "",
          "EndTimeRange1": "",
          "Correlative": 1,
          "ContactTypeId": 4,
          "TelephoneCompanyId": 0,
          "StartTimeRange2": "",
          "AddressId": "",
          "ContactTypeDescription": "",
          "ReceivesMails": false,
          "StartTimeRange1": ""
        },
        {
          "AssociatedToAnAddress": false,
          "Comment": "",
          "AddressCorrelative": 0,
          "Validated": false,
          "Priority": 0,
          "Enabled": false,
          "Text": "096223663",
          "TelephoneCompanyDescription": "CLARO",
          "EndTimeRange2": "",
          "EndTimeRange1": "",
          "Correlative": 1,
          "ContactTypeId": 1,
          "TelephoneCompanyId": 2,
          "StartTimeRange2": "",
          "AddressId": "",
          "ContactTypeDescription": "",
          "ReceivesMails": false,
          "StartTimeRange1": ""
        },
        {
          "AssociatedToAnAddress": false,
          "Comment": "",
          "AddressCorrelative": 0,
          "Validated": false,
          "Priority": 0,
          "Enabled": false,
          "Text": "26110236",
          "TelephoneCompanyDescription": "CLARO",
          "EndTimeRange2": "",
          "EndTimeRange1": "",
          "Correlative": 1,
          "ContactTypeId": 2,
          "TelephoneCompanyId": 2,
          "StartTimeRange2": "",
          "AddressId": "",
          "ContactTypeDescription": "",
          "ReceivesMails": false,
          "StartTimeRange1": ""
        }
      ]
    },
    "DocumentTypeDescription": "Cédula de Identidad",
    "BirthPlaceThirdLevelDescription": "",
    "CustomerAcquisitionSource": 0,
    "References": {
      "SdtsBTPEWReference": []
    },
    "PEP": true,
    "BirthPlaceThirdLevelId": 0,
    "SecondLastname": "GARCIA",
    "LegalCitizen": false,
    "CustomerAcquisitionSourceDescription": "",
    "BirthDate": "1992-07-21"
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
Deceased | Boolean $<(Length: 1)>$ | Fallecido.
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
LegalCitizen | Boolean $<(Length: 1)>$ | Ciudadano legal.
MaritalStatusId | Byte $<(Length: 2)>$ | Identificador del estado civil.
MaritalStatusDescription | String $<(Length: 20)>$ | Descripción del estado civil.
Occupations | [SdtsBTPEWOccupation](#sdtsbtpewoccupation) | Ocupaciones.
PEP | Boolean $<(Length: 1)>$ | PEP (Persona Expuesta Políticamente).
References | [SdtsBTPEWReference](#sdtsbtpewreference) | Referencias.
Relationships | [SdtsBTPEWRelationship](#sdtsbtpewrelationship) | Relaciones.
RequiresSpouse | Boolean $<(Length: 1)>$ | Requiere cónyuge.
SecondLastname | String $<(Length: 30)>$ | Segundo apellido.
SecondName | String $<(Length: 25)>$ | Segundo nombre.
Worth | Double $<(Length: 18.2)>$ | Patrimonio.
WorthStatus | Boolean $<(Length: 2)>$ | Estado patrimonial.
WorthSubmissionDate | Date $<(Length: 8)>$ | Fecha de presentación del patrimonio.
:::

::: details SdtsBTPEWAddress

### SdtsBTPEWAddress

::: center
Los campos del tipo de dato estructurado SdtsBTPEWAddress son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address | String | Dirección.
AddressCorrelative | Short | Correlativo de dirección.
AddressTypeId | Byte | Identificador del tipo de dirección.
AddressTypeDescription | String | Descripción del tipo de dirección.
CityId | Int | Identificador de ciudad.
CityDescription | String | Descripción de ciudad.
ColonyId | Int | Identificador de colonia.
CountryId | Short | Identificador del país.
CountryDescription | String | Descripción del país.
DepartmentId | Int | Identificador del departamento.
DepartmentDescription | String | Descripción del departamento.
DistrictId | Int | Identificador del distrito.
DistrictDescription | String | Descripción del distrito.
GeographicalUbication | String | Ubicación geográfica.
HousingTypeId | Byte | Identificador del tipo de vivienda.
HousingTypeDescription | String | Descripción del tipo de vivienda.
IsABusiness | Boolean | Es una empresa.
Latitude | Double | Latitud.
Level1Data | String | Dato de nivel 1.
Level1Id | Short | Identificador de nivel 1.
Level1Description | String | Descripción de nivel 1.
Level2Data | String | Dato de nivel 2.
Level2Id | Short | Identificador de nivel 2.
Level2Description | String | Descripción de nivel 2.
Level3Data | String | Dato de nivel 3.
Level3Id | Short | Identificador de nivel 3.
Level3Description | String | Descripción de nivel 3.
Level4Data | String | Dato de nivel 4.
Level4Id | Short | Identificador de nivel 4.
Level4Description | String | Descripción de nivel 4.
Longitude | Double | Longitud.
MainAddress | Boolean | Dirección principal.
PostalCode | String | Código postal.
References | String | Referencias.
SettlementType | Short | Tipo de liquidación.
SinceDate | Date | Fecha desde.
StatusId | String | Identificador de estado.
:::

::: details SdtsBTPEWContact

### SdtsBTPEWContact

::: center
Los campos del tipo de dato estructurado SdtsBTPEWContact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddressCorrelative | Short | Correlativo de dirección.
AddressId | String | Identificador de dirección.
AssociatedToAnAddress | Boolean | Asociado a una dirección.
Comment | String | Comentario.
ContactTypeId | Byte | Identificador del tipo de contacto.
ContactTypeDescription | String | Descripción del tipo de contacto.
Correlative | Byte | Correlativo.
Enabled | Boolean | Habilitado.
EndTimeRange1 | String | Hora de fin del rango 1.
EndTimeRange2 | String | Hora de fin del rango 2.
Priority | Byte | Prioridad.
ReceivesMails | Boolean | Recibe correos.
StartTimeRange1 | String | Hora de inicio del rango 1.
StartTimeRange2 | String | Hora de inicio del rango 2.
TelephoneCompanyId | Short | Identificador de la compañía telefónica.
TelephoneCompanyDescription | String | Descripción de la compañía telefónica.
Text | String | Texto.
Validated | Boolean | Validado.
:::

::: details SdtsBTPAWCustomField

### SdtsBTPAWCustomField

::: center
Los campos del tipo de dato estructurado SdtsBTPAWCustomField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Id | String | Identificador del campo personalizado.
Description | String | Descripción del campo personalizado.
Value | String | Valor del campo personalizado.
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
Exports | Boolean $<(Length: 1)>$ | Exporta.
Imports | Boolean $<(Length: 1)>$ | Importa.
Income | Double $<(Length: 18.2)>$ | Ingresos.
JobTitleId | Short $<(Length: 4)>$ | Identificador del cargo.
JobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo.
MainOccupation | Boolean $<(Length: 1)>$ | Ocupación principal.
Multilateral | Boolean $<(Length: 1)>$ | Multilateral.
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
Address1 | String | Dirección 1.
Address2 | String | Dirección 2.
Address3 | String | Dirección 3.
BondOrJobTitle | String | Vínculo o cargo.
Correlative | Short | Correlativo.
EnterpriceJobTitleDescription | String | Descripción del cargo empresarial.
EnterpriseJobTitleId | Short | Identificador del cargo empresarial.
Name | String | Nombre de la referencia.
PersonType | String | Tipo de persona.
ReferenceTypeId | Byte | Identificador del tipo de referencia.
ReferenceTypeDescription | String | Descripción del tipo de referencia.
RelationshipId | Short | Identificador del vínculo.
RelationshipDescription | String | Descripción del vínculo.
Telephone | String | Teléfono.
:::

::: details SdtsBTPEWRelationship

### SdtsBTPEWRelationship

::: center
Los campos del tipo de dato estructurado SdtsBTPEWRelationship son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Bidirectional | Boolean | Bidireccional.
BondId | Short | Identificador del vínculo.
BondDescription | String | Descripción del vínculo.
IntegrantName | String | Nombre del integrante.
JobTitleId | Short | Identificador del cargo.
Percentage | Double | Porcentaje.
PersonGUID | String | GUID (identificador único global) de persona.
:::
<!-- CIERRA SDT -->
