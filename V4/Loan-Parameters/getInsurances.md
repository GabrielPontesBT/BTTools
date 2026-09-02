---
title: Insurances
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los seguros disponibles de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.insurances

**Programa:** PublicAPI.BTLOPA0023

**Alcance:** Global

**Endpoint:** /public/LoanParameters/v1/insurances
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
insurances | [insurance](#insurance) | Listado de seguros.

@tab Errores

Código | Descripción
:--------- | :---------
500 | 
980083 | La moneda y/o papel no está asociada al producto
990070 | El sistema no se encuentra definido
990071 | El parámetro no se encuentra definido
50050003 | No existe la empresa ingresada
120050009 | Debe ingresar el GUID de producto.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/LoanParameters/v1/insurances?productGUID=bf0d7e10-dce6-4bd4-b866-9984556613ec' \
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
  "insurances": {
    "insurance": [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {}
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


