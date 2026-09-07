---
title: Cancellation Amount
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener el monto de cancelación del préstamo.

**Nombre publicación:** PublicLoans.cancellationAmount

**Programa:** PublicAPI.BTLOPA0007

**Alcance:** Global

**Endpoint:** /public/Loans/v1/cancellationAmount
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
queryDate | Date | Fecha de consulta.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
cancellationAmount | Double $<(Length: 18.2)>$ | Monto de cancelación.

@tab Errores

Código | Descripción
:--------- | :---------
120050001 | Debe ingresar el GUID de préstamo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/cancellationAmount?loanGUID=651d3561-91dc-49b3-84ee-b103edeb8159&queryDate=' \
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
  "cancellationAmount": 39415.06
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->