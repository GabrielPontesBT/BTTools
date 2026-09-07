---
title: Get
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los datos de una contraparte.

**Nombre publicación:** PublicCustomers.get

**Programa:** PublicAPI.BTCPPA0002

**Alcance:** Global

**Endpoint:** /public/Customers/v1/get
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterparty | [counterparty](#counterparty) | Datos de la contraparte.

@tab Errores

Código | Descripción
:--------- | :---------
40020006 | Contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Customers/v1/get?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
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
  "counterparty": {
    "contacts": {
      "contact": []
    },
    "members": {
      "member": [
        {
          "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
          "countryId": 604,
          "countryDescription": "Perú",
          "documentTypeId": 11,
          "documentTypeDescription": "D.N.I.",
          "documentNumber": "47078632",
          "personName": "PONTES SILVA GABRIEL",
          "ownershipTypeId": 1,
          "ownershipTypeDescription": "TITULAR REPRESENTAT.",
          "personType": "F"
        }
      ]
    }, 
    "counterparty": {
      "branchId": 1,
      "branchDescription": "",
      "cancellationDate": "",
      "companyId": 1,
      "companyDescription": "",
      "counterpartyDescription": "PONTES SILVA GABRIEL",
      "creationDate": "2027-04-30",
      "customFields": {
        "customField": []
      },
      "economicActivityId": 1113,
      "economicActivityDescription": "",
      "employee": false,
      "executiveId": 1957,
      "executiveDescription": "",
      "financialInstitution": false,
      "internalClassificationId": 1,
      "internalClassificationDescription": "",
      "resident": true,
      "sectorId": 1,
      "sectorDescription": "",
      "segmentId": 1,
      "segmentDescription": "",
      "statusId": 0,
      "statusDescription": ""
    },
    "customFields": {
      "customField": []
    },
    "economicGroups": {
      "economicGroup": []
    },
    "financialInstitution": {
      "companyId": 0,
      "counterpartyId": 0,
      "customFields": {
        "customField": []
      },
      "documentNumber": "",
      "documentTypeId": 0,
      "documentTypeDescription": "",
      "entryStatusId": 0,
      "entryStatusDescription": "",
      "establishmentCountryId": 0,
      "establishmentCountryDescription": "",
      "hasSwiftKey": false,
      "isCorrespondentAccount": false,
      "name": "",
      "swiftKey": "",
      "typeDescription": ""
    },
    "texts": {
      "text": []
    }
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details counterparty

### counterparty

::: center
Los campos del tipo de dato estructurado counterparty son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
contacts | [contact](#contact) | Listado de contactos.
counterparty | [counterparty](#counterparty) | Datos de la contraparte.
customFields | [customField](#customfield) | Listado de campos personalizados.
economicGroups | [economicGroup](#economicgroup) | Listado de grupos económicos.
financialInstitution | [financialInstitution](#financialinstitution) | Institución financiera.
members | [member](#member) | Listado de miembros.
texts | [text](#text) | Listado de textos.
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
enabled | Boolean | ¿Habilitado?
endTimeRange1 | String $<(Length: 5)>$ | Fin del rango horario 1.
endTimeRange2 | String $<(Length: 5)>$ | Fin del rango horario 2.
priority | Byte $<(Length: 2)>$ | Prioridad.
receivesMails | Boolean | ¿Recibe correos?
startTimeRange1 | String $<(Length: 5)>$ | Inicio del rango horario 1.
startTimeRange2 | String $<(Length: 5)>$ | Inicio del rango horario 2.
telephoneCompanyId | Short $<(Length: 3)>$ | Identificador de la compañía telefónica.
telephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
text | String $<(Length: 250)>$ | Texto.
validated | Boolean | ¿Está validado?
:::

::: details counterparty

### counterparty

::: center
Los campos del tipo de dato estructurado counterparty son los siguientes:

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

::: details economicGroup

### economicGroup

::: center
Los campos del tipo de dato estructurado economicGroup son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 7)>$ | Identificador del grupo.
groupName | String $<(Length: 30)>$ | Nombre del grupo.
groupTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de grupo.
groupTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de grupo.
memberTypeId | Short $<(Length: 3)>$ | Identificador del tipo de miembro.
memberTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de miembro.
:::

::: details financialInstitution

### financialInstitution

::: center
Los campos del tipo de dato estructurado financialInstitution son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
companyId | Short $<(Length: 3)>$ | Identificador de empresa.
counterpartyId | Int $<(Length: 9)>$ | Identificador de contraparte.
customFields | [customField](#customfield) | Listado de campos personalizados.
documentNumber | String $<(Length: 25)>$ | Número de documento.
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
entryStatusId | Byte $<(Length: 2)>$ | Identificador del estado de ingreso.
entryStatusDescription | String $<(Length: 30)>$ | Descripción del estado de ingreso.
establishmentCountryId | Short $<(Length: 3)>$ | Identificador del país de establecimiento.
establishmentCountryDescription | String $<(Length: 30)>$ | Descripción del país de establecimiento.
hasSwiftKey | Boolean | ¿Tiene clave Swift?
isCorrespondentAccount | Boolean | ¿Es cuenta corresponsal?
name | String $<(Length: 60)>$ | Nombre de institución financiera.
personGUID | Long $<(Length: 10)>$ | GUID (identificador único global) de la persona.
swiftKey | String $<(Length: 16)>$ | Clave Swift.
typeId | Int $<(Length: 5)>$ | Identificador del tipo de institución financiera.
typeDescription | String $<(Length: 20)>$ | Descripción del tipo de institución financiera.
:::

::: details member

### member

::: center
Los campos del tipo de dato estructurado member son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
countryId | Short $<(Length: 3)>$ | Identificador del país.
countryDescription | String $<(Length: 30)>$ | Descripción del país.
documentNumber | String $<(Length: 25)>$ | Número de documento.
documentTypeId | Short $<(Length: 4)>$ | Identificador del tipo de documento.
documentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
ownershipTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de titularidad.
ownershipTypeDescription | String $<(Length: 20)>$ | Descripción de tipo de titularidad.
personGUID | String $<(Length: 10)>$ | GUID (identificador único global) de la persona.
personName | String $<(Length: 70)>$ | Nombre de persona.
personType | String $<(Length: 1)>$ | Tipo de persona (F: Física, J: Jurídica, A: Ambas).
:::

::: details text

### text

::: center
Los campos del tipo de dato estructurado text son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
id | Int $<(Length: 5)>$ | Identificador del texto.
description | String $<(Length: 60)>$ | Descripción del texto.
text | String $<(Length: 5000)>$ | Texto.
:::
<!-- CIERRA SDT -->
