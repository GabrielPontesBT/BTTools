---
title: Verify Employee
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para verificar si la contraparte indicada pertenece a un empleado de la institución.

**Nombre publicación:** PublicCustomers.verifyEmployee

**Programa:** PublicAPI.BTCPPA0014

**Alcance:** Global

**Endpoint:** /public/Customers/v1/verifyEmployee
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
exists | Boolean | ¿Es empleado?

@tab Errores

Código | Descripción
:--------- | :---------
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Customers/v1/verifyEmployee?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0' \
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
  "exists": false
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->