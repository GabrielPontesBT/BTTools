---
title: Get Statuses
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los posibles estados de una contraparte.

**Nombre publicación:** PublicCustomers.getStatuses

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0010

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
statuses | [SdtsBTCPWStatus](#sdtsbtcpwstatus) | Listado de estados.

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
  "statuses": {
    "status": [
      {
        "Id": 1,
        "Description": "ACTIVA"
      },
      {
        "Id": 2,
        "Description": "INHABILITADA"
      },
      {
        "Id": 3,
        "Description": "CERRADA"
      },
      {
        "Id": 9,
        "Description": "ALTA INCONCLUSA (INST.FINANC.)"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:13:55",
    "Numero": 13468805,
    "Servicio": "PublicCustomers.getStatuses",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWStatus

### SdtsBTCPWStatus

::: center
Los campos del tipo de dato estructurado SdtsBTCPWStatus son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Byte $<(Length: 2)>$ | Identificador.
Description | String $<(Length: 30)>$ | Descripción.
:::
<!-- CIERRA SDT -->
