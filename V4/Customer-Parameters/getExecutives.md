---
title: Executives
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de ejecutivos.

**Nombre publicación:** PublicCustomerParameters.executives

**Programa:** PublicAPI.BTCPPA0026

**Alcance:** Global

**Endpoint:** /public/CustomerParameters/v1/executives
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
executiveIdFilter | Int $<(Length: 5)>$ | Filtro por identificador de ejecutivo.
executiveDescriptionFilter | String $<(Length: 30)>$ | Fitro por descripción de ejecutivo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | ¿Existen más páginas disponibles en la paginación?
executives | [executive](#executive) | Listado de ejecutivos.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/CustomerParameters/v1/executives?offset=0&limit=10' \
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
  "executives": {
    "executive": [
      {
        "executiveDescription": "PRUEBA 45",
        "executiveId": 45
      },
      {
        "executiveDescription": "NESTORFRANCO",
        "executiveId": 1957
      },
      {
        "executiveDescription": "EJEC 20",
        "executiveId": 20
      },
      {
        "executiveDescription": "EJECUTIVO 10002",
        "executiveId": 10002
      },
      {
        "executiveDescription": "INSTALADOR",
        "executiveId": 1
      },
      {
        "executiveDescription": "BANTOTAL",
        "executiveId": 2
      },
      {
        "executiveDescription": "GRUPO 1",
        "executiveId": 3
      },
      {
        "executiveDescription": "GRUPO 2",
        "executiveId": 4
      },
      {
        "executiveDescription": "GRUPO 3",
        "executiveId": 5
      },
      {
        "executiveDescription": "GRUPO 4",
        "executiveId": 6
      }
    ]
  },
  "hasNext": true
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details executive

### executive

::: center
Los campos del tipo de dato estructurado executive son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
executiveId | Int $<(Length: 5)>$ | Identificador del ejecutivo.
executiveDescription | String $<(Length: 30)>$ | Descripción del ejecutivo.
:::
<!-- CIERRA SDT -->
