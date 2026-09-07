---
title: Installment Payments
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener el detalle de pago de una cuota específica de un préstamo.

**Nombre publicación:** PublicLoans.installmentPayments

**Programa:** PublicAPI.BTLOPA0009

**Alcance:** Global

**Endpoint:** /public/Loans/v1/installmentPayments
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
installmentNumber | Int | Número de cuota.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
payments | [payment](#payment) | Pagos.

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
  '{{baseUrl}}/public/Loans/v1/installmentPayments?loanGUID=0ee32c1d-c399-4064-92a2-0fc559382d4e&installmentNumber=1' \
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
  "payments": {
    "payment": [
      {}
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->