---
title: Get Segments
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de segmentos.

**Nombre publicación:** PublicCustomers.getSegments

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0008

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
segments | [SdtsBTCPWSegment](#sdtsbtcpwsegment) | Listado de segmentos.

@tab Errores

Código | Descripción
:--------- | :-----------
No aplica.

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
    "Requerimiento": "1",
    "Token": "444B674391BCA7676279700A"
  }
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
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "444B674391BCA7676279700A"
  },
  "segments": {
    "segment": [
      {
        "Id": 1,
        "Description": "DEPENDIENTE"
      },
      {
        "Id": 2,
        "Description": "INDEPENDIENTE"
      },
      {
        "Id": 3,
        "Description": "OTROS"
      },
      {
        "Id": 4,
        "Description": "INSTITUCIONES FINANCIERAS"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:08",
    "Numero": 13468810,
    "Servicio": "PublicCustomers.getSegments",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWSegment

### SdtsBTCPWSegment

::: center
Los campos del tipo de dato estructurado SdtsBTCPWSegment son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Byte $<(Length: 2)>$ | Identificador.
Description | String $<(Length: 30)>$ | Descripción.
:::
<!-- CIERRA SDT -->
