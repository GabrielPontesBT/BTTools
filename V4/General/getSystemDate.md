---
title: System Date
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener la fecha del sistema.

**Nombre publicación:** PublicGeneral.systemDate

**Programa:** PublicAPI.BTCYPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/systemDate
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
systemDate | Date | Fecha del sistema.

@tab Errores

No aplica.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/systemDate' \
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
  "systemDate": "2027-12-02"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->