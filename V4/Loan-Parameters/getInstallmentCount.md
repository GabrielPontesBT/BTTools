---
title: Get Installment Count
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la cantidad de cuotas parametrizadas de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.getInstallmentCount

**Programa:** PublicAPI.BTLOPA0021

**Alcance:** Global

**Endpoint:** /public/LoanParameters/v1/getInstallmentCount
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
minimum | Long $<(Length: 10)>$ | Mínimo.
maximum | Long $<(Length: 10)>$ | Máximo.
defaultValue | Long $<(Length: 10)>$ | Valor por defecto.

@tab Errores

Código | Descripción
:--------- | :---------
500 | 
980083 | La moneda y/o papel no está asociada al producto
990070 | El sistema no se encuentra definido
990071 | El parámetro no se encuentra definido
50050003 | No existe la empresa ingresada
120050009 | Debe ingresar el GUID de producto.
99990010006 | No se pudo resolver el usuario

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/LoanParameters/v1/getInstallmentCount?productGUID=' \
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
  "defaultValue": 16,
  "maximum": 24,
  "minimum": 1
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


