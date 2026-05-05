---
title: Obtener Direcciones
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener las direcciones asociadas a una persona.
Este servicio devuelve el listado de direcciones registradas para una persona identificada por su GUID.

**Nombre publicación:** PublicPersons.getAddresses

**Programa:** No informado

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String (UUID) | Identificador único de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
addresses | Array | Listado de direcciones de la persona.
AddressCorrelative | Integer | Correlativo de la dirección.
AddressTypeId | Integer | Identificador del tipo de dirección.
AddressTypeDescription | String | Descripción del tipo de dirección.
Address | String | Dirección completa.
CountryId | Integer | Identificador del país.
CountryDescription | String | Descripción del país.
DepartmentId | Integer | Identificador del departamento.
DepartmentDescription | String | Descripción del departamento.
CityId | Integer | Identificador de la ciudad.
CityDescription | String | Descripción de la ciudad.
MainAddress | Boolean | Indica si es la dirección principal.

@tab Errores

Código | Descripción
:--------- | :-----------
10011 | Sesión inválida.
10002 | Error en la ejecución del programa.
:::
<!-- SE DEBEN AGREGAR A MANO -->
:::
<!-- CIERRA TABLA DE DATOS -->

## Ejemplos

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación

### XML (completar manualmente con invocación real)
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getAddresses' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "DC46741FA2D4E9096A361344"
  },
  "personGUID": "1a17d039-2eb8-4729-9356-e386c2fbe6eb"
}'
```
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->

::: details Ejemplo de Respuesta

### XML
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "DC46741FA2D4E9096A361344"
  },
  "addresses": {
    "addressesItem": {
      "AddressCorrelative": "1",
      "AddressTypeId": "1",
      "AddressTypeDescription": "RESIDENCIA",
      "HousingTypeId": "0",
      "HousingTypeDescription": "",
      "RequiresOwnersInformation": "false",
      "RequiresOwnersInformationNumber": "0",
      "IsABusiness": "false",
      "SinceDate": "",
      "OwnerName": "",
      "OwnerTelephone": "",
      "AddressIdentificator1": "2",
      "AddressIdentificator2": "1",
      "AddressIdentificator3": "4",
      "AddressIdentificator4": "1",
      "AddressIdentificator5": "0",
      "AddressIdentificator6": "0",
      "AddressIdentificatorDescription1": "LOS ARCES",
      "AddressIdentificatorDescription2": "455",
      "AddressIdentificatorDescription3": "1",
      "AddressIdentificatorDescription4": "D-2",
      "AddressIdentificatorDescription5": "",
      "AddressIdentificatorDescription6": "",
      "Address": "BOULEVARD 12 NO. PUERTA 1233 PISO 1233 OFICINA",
      "References": "",
      "Latitude": "0.0",
      "Longitude": "0.0",
      "CountryId": "858",
      "CountryDescription": "URUGUAY",
      "DepartmentId": "3",
      "DepartmentDescription": "Cerro Largo",
      "CityId": "1738",
      "CityDescription": "Plácido Rosas",
      "DistrictId": "0",
      "DistrictDescription": "",
      "ColonyId": "0",
      "GeographicalUbication": "",
      "PostalCode": "",
      "SettlementType": "0",
      "StatusId": "H",
      "MainAddress": "true"
    }
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-16",
    "Hora": "14:10:31",
    "Numero": "13003990",
    "Servicio": "PublicPersons.getAddresses",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details addressesItem

### addressesItem

::: center
Los campos del tipo de dato estructurado addressesItem son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddressCorrelative | String |
AddressTypeId | String |
AddressTypeDescription | String |
HousingTypeId | String |
HousingTypeDescription | String |
RequiresOwnersInformation | String |
RequiresOwnersInformationNumber | String |
IsABusiness | String |
SinceDate | String |
OwnerName | String |
OwnerTelephone | String |
AddressIdentificator1 | String |
AddressIdentificator2 | String |
AddressIdentificator3 | String |
AddressIdentificator4 | String |
AddressIdentificator5 | String |
AddressIdentificator6 | String |
AddressIdentificatorDescription1 | String |
AddressIdentificatorDescription2 | String |
AddressIdentificatorDescription3 | String |
AddressIdentificatorDescription4 | String |
AddressIdentificatorDescription5 | String |
AddressIdentificatorDescription6 | String |
Address | String |
References | String |
Latitude | String |
Longitude | String |
CountryId | String |
CountryDescription | String |
DepartmentId | String |
DepartmentDescription | String |
CityId | String |
CityDescription | String |
DistrictId | String |
DistrictDescription | String |
ColonyId | String |
GeographicalUbication | String |
PostalCode | String |
SettlementType | String |
StatusId | String |
MainAddress | String |
:::
<!-- CIERRA SDT -->
