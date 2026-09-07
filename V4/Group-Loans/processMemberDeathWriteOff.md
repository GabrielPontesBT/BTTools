---
title: Process Member Death Write Off
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para procesar el quebranto por fallecimiento de un integrante.

**Nombre publicación:** PublicGroupLoans.processMemberDeathWriteOff

**Programa:** PublicAPI.BTLOPA0050

**Alcance:** Global

**Endpoint:** /public/GroupLoans/v1/processMemberDeathWriteOff
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
groupId | Int $<(Length: 9)>$ | Identificador de grupo.
deceasedDate | Date | Fecha de fallecimiento.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
movementGUID | String $<(Length: 36)>$ | GUID (identificador único global) del movimiento.

@tab Errores

Código | Descripción
:--------- | :---------
120050001 | Debe ingresar el GUID de préstamo.
120050005 | Debe ingresar fecha.
120050010 | Debe ingresar el GUID de grupo.
120060139 | La fecha de deceso es mayor a la de apertura.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/GroupLoans/v1/processMemberDeathWriteOff?loanGUID=7de60dc6-b377-4683-9a8d-95ce6c69df74' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "groupId": "70",
  "deceasedDate": "2027-07-30"
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
  "movementGUID": "58cfb0f0-4922-4d38-8d76-3a72ba3aa9d0"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->