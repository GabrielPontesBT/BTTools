---
title: Obtener [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los datos de una contraparte.

**Nombre publicación:** PublicCustomers.get

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterparty | [SdtsBTCPWCounterpartyQuery](#sdtsbtcpwcounterpartyquery) | Datos de la contraparte.

@tab Errores

Código | Descripción
:--------- | :-----------
40020012 | El número de contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.

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
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0"
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
  "counterparty": {
    "Integration": {
      "SdtsBTCPWCounterpartyIntegration": [
        {
          "PersonGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
          "CountryId": 604,
          "CountryDescription": "Perú",
          "DocumentTypeId": 11,
          "DocumentTypeDescription": "D.N.I.",
          "DocumentNumber": "47078632",
          "PersonName": "PONTES SILVA GABRIEL",
          "OwnershipTypeId": 1,
          "OwnershipTypeDescription": "TITULAR REPRESENTAT.",
          "PersonType": "F"
        }
      ]
    },
    "Texts": {
      "SdtsBTPAWText": []
    },
    "FinancialInstitution": {
      "CompanyId": 0,
      "IsCorrespondentAccount": false,
      "Type": 0,
      "CustomFields": {
        "SdtsBTPAWCustomField": []
      },
      "DocumentTypeId": 0,
      "EntryStatusId": 0,
      "EstablishmentCountryId": 0,
      "DocumentTypeDescription": "",
      "DocumentNumber": "",
      "Name": "",
      "EntryStatusDescription": "",
      "TypeDescription": "",
      "SwiftKey": "",
      "HasSwiftKey": false,
      "PersonId": 0,
      "EstablishmentCountryDescription": "",
      "CounterpartyId": 0
    },
    "Counterparty": {
      "CompanyDescription": "",
      "Resident": true,
      "StatusId": 0,
      "SegmentId": 1,
      "InternalClassificationId": 1,
      "EconomicActivityId": 1113,
      "ExecutiveId": 1957,
      "SegmentDescription": "",
      "CancellationDate": "",
      "Employee": false,
      "CompanyId": 1,
      "StatusDescription": "",
      "BranchId": 1,
      "CreationDate": "2027-04-30",
      "ExecutiveDescription": "",
      "FinancialInstitution": false,
      "CustomFields": {
        "SdtsBTPAWCustomField": []
      },
      "InternalClassificationDescription": "",
      "EconomicActivityDescription": "",
      "SectorId": 1,
      "BranchDescription": "",
      "SectorDescription": "",
      "CounterpartyDescription": "PONTES SILVA GABRIEL"
    },
    "EconomicGroups": {
      "SdtsBTEGWEconomicGroup": []
    },
    "Contacts": {
      "SdtsBTPEWContact": []
    },
    "CustomFields": {
      "SdtsBTPAWCustomField": []
    }
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:17",
    "Numero": 13468813,
    "Servicio": "PublicCustomers.get",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWCounterpartyQuery

### SdtsBTCPWCounterpartyQuery

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCounterpartyQuery son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Contacts | [SdtsBTPEWContact](#sdtsbtpewcontact) | Contactos.
Counterparty | [SdtsBTCPWCounterparty](#sdtsbtcpwcounterparty) | Contraparte.
CustomFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Campos personalizados.
EconomicGroups | [SdtsBTEGWEconomicGroup](#sdtsbtegweconomicgroup) | Grupos económicos.
FinancialInstitution | [SdtsBTPEWFinancialInstitution](#sdtsbtpewfinancialinstitution) | Institución financiera.
Integration | [SdtsBTCPWCounterpartyIntegration](#sdtsbtcpwcounterpartyintegration) | Integración.
Texts | [SdtsBTPAWText](#sdtsbtpawtext) | Textos.
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

::: details SdtsBTCPWCounterparty

### SdtsBTCPWCounterparty

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCounterparty son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
BranchId | Int | Identificador de sucursal.
BranchDescription | String $<(length: 30)>$ | Descripción de sucursal.
CancellationDate | Date $<(length: 8)>$ | Fecha de cancelación.
CompanyId | Short $<(length: 3)>$ | Identificador de empresa.
CompanyDescription | String $<(length: 50)>$ | Descripción de empresa.
CounterpartyDescription | String $<(length: 70)>$ | Descripción de contraparte.
CreationDate | Date $<(length: 8)>$ | Fecha de creación.
CustomFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Campos personalizados.
EconomicActivityId | Long | Identificador de actividad económica.
EconomicActivityDescription | String $<(length: 80)>$ | Descripción de actividad económica.
Employee | Boolean $<(length: 1)>$ | ¿Es empleado?.
ExecutiveId | Int $<(length: 5)>$ | Identificador del ejecutivo.
ExecutiveDescription | String $<(length: 30)>$ | Descripción del ejecutivo.
FinancialInstitution | Boolean $<(length: 1)>$ | Institución financiera.
InternalClassificationId | Short | Identificador de clasificación interna.
InternalClassificationDescription | String $<(length: 30)>$ | Descripción de clasificación interna.
Resident | Boolean $<(length: 1)>$ | ¿Es residente?.
SectorId | Short | Identificador de sector.
SectorDescription | String $<(length: 30)>$ | Descripción del sector.
SegmentId | Byte $<(length: 2)>$ | Identificador del segmento.
SegmentDescription | String $<(length: 30)>$ | Descripción del segmento.
StatusId | Byte $<(length: 2)>$ | Identificador de estado.
StatusDescription | String $<(length: 30)>$ | Descripción del estado.
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

::: details SdtsBTEGWEconomicGroup

### SdtsBTEGWEconomicGroup

::: center
Los campos del tipo de dato estructurado SdtsBTEGWEconomicGroup son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
GroupId | Int $<(length: 7)>$ | Identificador del grupo.
GroupName | String $<(length: 30)>$ | Nombre del grupo.
GroupTypeId | Byte $<(length: 2)>$ | Identificador del tipo de grupo.
GroupTypeDescription | String $<(length: 20)>$ | Descripción del tipo de grupo.
MemberTypeId | Short $<(length: 3)>$ | Identificador del tipo de miembro.
:::

::: details SdtsBTPEWFinancialInstitution

### SdtsBTPEWFinancialInstitution

::: center
Los campos del tipo de dato estructurado SdtsBTPEWFinancialInstitution son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CompanyId | Short $<(length: 3)>$ | CompanyId
CounterpartyId | Int $<(length: 9)>$ | CounterpartyId
CustomFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | CustomFields
DocumentNumber | String $<(length: 25)>$ | DocumentNumber
DocumentTypeId | Short $<(length: 4)>$ | DocumentTypeId
DocumentTypeDescription | String $<(length: 30)>$ | DocumentTypeDescription
EntryStatusId | Byte $<(length: 2)>$ | EntryStatusId
EntryStatusDescription | String $<(length: 30)>$ | EntryStatusDescription
EstablishmentCountryId | Short $<(length: 3)>$ | EstablishmentCountryId
EstablishmentCountryDescription | String $<(length: 30)>$ | EstablishmentCountryDescription
HasSwiftKey | Boolean | HasSwiftKey
IsCorrespondentAccount | Boolean | IsCorrespondentAccount
Name | String $<(length: 60)>$ | Name
PersonId | Long $<(length: 10)>$ | PersonId
SwiftKey | String $<(length: 16)>$ | SwiftKey
Type | Int $<(length: 5)>$ | Type
TypeDescription | String $<(length: 20)>$ | TypeDescription
:::

::: details SdtsBTCPWCounterpartyIntegration

### SdtsBTCPWCounterpartyIntegration

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCounterpartyIntegration son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CountryId | Short | Identificador del país.
CountryDescription | String $<(length: 30)>$ | Descripción del país.
DocumentNumber | String $<(length: 25)>$ | Número de documento.
DocumentTypeId | Short | Identificador del tipo de documento.
DocumentTypeDescription | String $<(length: 30)>$ | Descripción del tipo de documento.
OwnershipTypeId | Byte $<(length: 2)>$ | Identificador del tipo de propiedad.
OwnershipTypeDescription | String | Descripción del tipo de propiedad.
PersonGUID | String $<(length: 36)>$ | GUID de persona.
PersonName | String $<(length: 70)>$ | Nombre de persona.
PersonType | String $<(length: 1)>$ | Tipo de persona.
:::

::: details SdtsBTPAWText

### SdtsBTPAWText

::: center
Los campos del tipo de dato estructurado SdtsBTPAWText son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Int $<(length: 5)>$ | Identificador.
Description | String $<(length: 60)>$ | Descripción.
Text | String | Texto.
:::
<!-- CIERRA SDT -->
