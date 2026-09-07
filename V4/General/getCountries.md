---
title: Countries
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de países.

**Nombre publicación:** PublicGeneral.countries

**Programa:** PublicAPI.BTCNPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/countries
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
countryIdFilter | Short $<(Length: 3)>$ | Filtro de identificador de país.
countryDescriptionFilter | String $<(Length: 30)>$ | Filtro de descripción de país.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | Indica si existen más páginas disponibles.
countries | [country](#country) | Listado de paises.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/countries?offset=0&limit=10' \
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
  "countries": {
    "country": [
      {
        "ISO2": "AF",
        "ISO3": "AFG",
        "ISOName": "AF",
        "countryDescription": "Afganistán",
        "countryId": 4,
        "telephoneCodePrefix": 93
      },
      {
        "ISO2": "AL",
        "ISO3": "ALB",
        "ISOName": "AL",
        "countryDescription": "Albania",
        "countryId": 8,
        "telephoneCodePrefix": 355
      },
      {
        "ISO2": "AQ",
        "ISO3": "ATA",
        "ISOName": "AY",
        "countryDescription": "Antártida",
        "countryId": 10,
        "telephoneCodePrefix": 672
      },
      {
        "ISO2": "DZ",
        "ISO3": "DZA",
        "ISOName": "AG",
        "countryDescription": "Argelia",
        "countryId": 12,
        "telephoneCodePrefix": 213
      },
      {
        "ISO2": "AS",
        "ISO3": "ASM",
        "ISOName": "AQ",
        "countryDescription": "Samoa Americana",
        "countryId": 16,
        "telephoneCodePrefix": 1684
      },
      {
        "ISO2": "AD",
        "ISO3": "AND",
        "ISOName": "AN",
        "countryDescription": "Andorra",
        "countryId": 20,
        "telephoneCodePrefix": 376
      },
      {
        "ISO2": "AO",
        "ISO3": "AGO",
        "ISOName": "AO",
        "countryDescription": "Angola",
        "countryId": 24,
        "telephoneCodePrefix": 244
      },
      {
        "ISO2": "AG",
        "ISO3": "ATG",
        "ISOName": "AC",
        "countryDescription": "Antigua y Barbuda",
        "countryId": 28,
        "telephoneCodePrefix": 1268
      },
      {
        "ISO2": "AZ",
        "ISO3": "AZE",
        "ISOName": "AJ",
        "countryDescription": "Azerbaiyán",
        "countryId": 31,
        "telephoneCodePrefix": 994
      },
      {
        "ISO2": "AR",
        "ISO3": "ARG",
        "ISOName": "AR",
        "countryDescription": "Argentina",
        "countryId": 32,
        "telephoneCodePrefix": 54
      }
    ]
  },
  "hasNext": false
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details country

### country

::: center
Los campos del tipo de dato estructurado country son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
countryId | Short $<(Length: 3)>$ | Identificador del país.
countryDescription | String $<(Length: 30)>$ | Descripción del país.
ISO2 | String $<(Length: 2)>$ | Código ISO 2.
ISO3 | String $<(Length: 3)>$ | Código ISO 3.
ISOName | String $<(Length: 50)>$ | Código ISO.
telephoneCodePrefix | Short $<(Length: 4)>$ | Prefijo telefónico del país.
:::
<!-- CIERRA SDT -->
