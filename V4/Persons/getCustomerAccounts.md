---
title: Get Customer Accounts
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de las cuentas de cliente de una persona.

**Nombre publicación:** PublicPersons.getCustomerAccounts

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0007

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.
 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
customerCounterparties | [SdtsBTCPWCustomerCounterparty](#sdtsbtcpwcustomercounterparty) | Listado de contrapartes.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40050001 | Debe ingresar el GUID de persona.

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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9"
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "customerCounterparties": {
    "customerCounterparty": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:36",
    "Numero": 13469366,
    "Servicio": "PublicPersons.getCustomerAccounts",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWCustomerCounterparty

### SdtsBTCPWCustomerCounterparty

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCustomerCounterparty son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CounterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de contraparte.
Ownership | [SdtsBTCPWOwnershipType](#sdtsbtcpwownershiptype) | Tipo de propiedad.
Representative | Boolean | Representante.
:::

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
