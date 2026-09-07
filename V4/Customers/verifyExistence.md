---
title: Verify Existence
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para verificar la existencia de una contraparte.

**Nombre publicación:** PublicCustomers.verifyExistence

**Programa:** PublicAPI.BTCPPA0013

**Alcance:** Global

**Endpoint:** /public/Customers/v1/verifyExistence
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyId | Int $<(Length: 9)>$ | Identificador de la contraparte.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
exists | Boolean | ¿Existe la contraparte?

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
  '{{baseUrl}}/public/Customers/v1/verifyExistence' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "counterpartyId": 5090
}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "exists": true
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->