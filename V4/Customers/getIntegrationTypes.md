---
title: Get Integration Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los posibles tipos de integración para una contraparte.

**Nombre publicación:** PublicCustomers.getIntegrationTypes

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0015

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
ownershipTypes | [SdtsBTCPWOwnershipType](#sdtsbtcpwownershiptype) | Listado de tipos de titularidad.

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
  "ownershipTypes": {
    "ownershipType": [
      {
        "Id": 1,
        "Description": "TITULAR REPRESENTAT."
      },
      {
        "Id": 2,
        "Description": "TITULAR NO REPRESENT"
      },
      {
        "Id": 4,
        "Description": "FIADOR SOLIDARIO"
      },
      {
        "Id": 5,
        "Description": "APODERADO"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:00",
    "Numero": 13468807,
    "Servicio": "PublicCustomers.getIntegrationTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWOwnershipType

### SdtsBTCPWOwnershipType

::: center
Los campos del tipo de dato estructurado SdtsBTCPWOwnershipType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Byte $<(Length: 2)>$ | Identificador.
Description | String | Descripción.
:::
<!-- CIERRA SDT -->
