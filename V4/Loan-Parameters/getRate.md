---
title: Rate
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la tasa definida para un producto.

**Nombre publicación:** PublicLoanParameters.rate

**Programa:** PublicAPI.BTLOPA0026

**Alcance:** Global

**Endpoint:** /public/LoanParameters/v1/rate
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
defaultRate | Double $<(Length: 11.6)>$ | Tasa por defecto.
rateType | Byte $<(Length: 1)>$ | Identificador de tipo de tasa.
rateTypeDescription | String $<(Length: 20)>$ | Descripción del tipo de tasa.

@tab Errores

Código | Descripción
:--------- | :---------
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
  '{{baseUrl}}/public/LoanParameters/v1/rate?productGUID=bf0d7e10-dce6-4bd4-b866-9984556613ec' \
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
  "defaultRate": 72.33,
  "rateType": 1,
  "rateTypeDescription": "Efectiva Anual"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->