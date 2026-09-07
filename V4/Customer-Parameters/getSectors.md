---
title: Sectors
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de sectores.

**Nombre publicación:** PublicCustomerParameters.sectors

**Programa:** PublicAPI.BTACPA0001

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/sectors
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
sectorIdFilter | Short $<(Length: 3)>$ | Filtro por identificador de sector.
sectorDescriptionFilter | String $<(Length: 30)>$ | Filtro por descripción de sector.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
sectors | [sector](#sector) | Listado de sectores.

@tab Errores

No aplica.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/CustomerParameters/v1/sectors?offset=0&limit=10' \
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
  "hasNext": false,
  "sectors": {
    "sector": [
      {
        "sectorDescription": "Privado no Financieros",
        "sectorId": 1
      },
      {
        "sectorDescription": "Privado Financiero",
        "sectorId": 2
      },
      {
        "sectorDescription": "Gobierno nacional",
        "sectorId": 3
      },
      {
        "sectorDescription": "Gobierno Departamental",
        "sectorId": 4
      },
      {
        "sectorDescription": "Seguridad Social",
        "sectorId": 5
      },
      {
        "sectorDescription": "Entes Autónomos",
        "sectorId": 6
      },
      {
        "sectorDescription": "Organizaciones Paraestatales",
        "sectorId": 7
      },
      {
        "sectorDescription": "Público no nacional",
        "sectorId": 9
      },
      {
        "sectorDescription": "COOPERTATIVAS",
        "sectorId": 10
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sector

### sector

::: center
Los campos del tipo de dato estructurado sector son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
sectorId | Short $<(Length: 3)>$ | Identificador de sector.
sectorDescription | String $<(Length: 30)>$ | Descripción de sector.
:::
<!-- CIERRA SDT -->
