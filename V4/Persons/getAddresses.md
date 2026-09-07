---
title: Addresses
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los domicilios de una persona.

**Nombre publicación:** PublicPersons.addresses

**Programa:** PublicAPI.BTPEPA0014

**Alcance:** Global

**Endpoint:** /public/Persons/v1/addresses
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
addresses | [address](#address) | Listado de domicilios.

@tab Errores

Código | Descripción
:--------- | :---------
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
  '{{baseUrl}}/public/Persons/v1/addresses?personGUID=d742016d-f0fc-4fff-be0e-3ff1dd7015a4' \
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
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
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
<!-- CIERRA SDT -->
