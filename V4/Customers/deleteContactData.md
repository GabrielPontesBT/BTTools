---
title: Contact Data
type: DELETE
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para eliminar un dato de contacto de una contraparte.

**Nombre publicación:** PublicCustomers.contactData

**Programa:** PublicAPI.BTCPPA0021

**Alcance:** Global

**Endpoint:** /public/Customers/v1/contactData
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
contactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
contactTypeCorrelative | Byte $<(Length: 2)>$ | Correlativo del contacto.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :---------
40010059 | Debe ingresar un contacto
40020006 | Contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X DELETE \
  '{{baseUrl}}/public/Customers/v1/contactData?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0&contactTypeId=1' \
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
{}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->