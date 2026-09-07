---
title: Capital Range
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los parámetros de capital de un crédito.

**Nombre publicación:** PublicGroupLoanParameters.capitalRange

**Programa:** PublicAPI.BTLOPA0027

**Alcance:** Global

**Endpoint:** /public/GroupLoanParameters/v1/capitalRange
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
minimumCapital | Double $<(Length: 18.2)>$ | Capital mínimo.
maximumCapital | Double $<(Length: 18.2)>$ | Capital máximo.

@tab Errores

Código | Descripción
:--------- | :---------
120050009 | Debe ingresar el GUID de producto.
120060126 | No existe configuración para el ciclo
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoanParameters/v1/capitalRange?cycleId=1&productGUID=951c9591-4438-445e-bf43-6b46c271338a' \
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
  "maximumCapital": 100000000,
  "minimumCapital": 10000
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->