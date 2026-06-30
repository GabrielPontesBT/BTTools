---
title: Get Cancellation Amount
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el monto de cancelación del préstamo.

**Nombre publicación:** PublicLoans.getCancellationAmount

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0007

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
queryDate | Date | Fecha de consulta. Si no se recibe, se toma la fecha del día.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
cancellationAmount | Double $<(Length: 18.2)>$ | Monto de cancelación del préstamo.

@tab Errores

Código | Descripción
:--------- | :-----------
120050001 | Debe ingresar el GUID de préstamo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "F2F0A04C9CFE9B50C05BCFB8"
  },
  "loanGUID": "651d3561-91dc-49b3-84ee-b103edeb8159",
  "queryDate": ""
}
```
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab JSON
```json
{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "F2F0A04C9CFE9B50C05BCFB8"
  },
  "cancellationAmount": 39415.06,
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "12:57:54",
    "Numero": 13601213,
    "Servicio": "PublicLoans.getCancellationAmount",
    "Requerimiento": 1,
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
