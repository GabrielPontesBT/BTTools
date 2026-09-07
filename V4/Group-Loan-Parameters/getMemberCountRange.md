---
title: Member Count Range
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la cantidad de integrantes permitidos en un crédito.

**Nombre publicación:** PublicGroupLoanParameters.memberCountRange

**Programa:** PublicAPI.BTLOPA0025

**Alcance:** Global

**Endpoint:** /public/GroupLoanParameters/v1/memberCountRange
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
cycleId | Int $<(Length: 9)>$ | Identificador del ciclo.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
minimumMembers | Short $<(Length: 3)>$ | Número mínimo de integrantes.
maximumMembers | Short $<(Length: 3)>$ | Número máximo de integrantes.

@tab Errores

Código | Descripción
:--------- | :---------
120060126 | No existe configuración para el ciclo.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/GroupLoanParameters/v1/memberCountRange?cycleId=1' \
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
  "maximumMembers": 999,
  "minimumMembers": 3
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->