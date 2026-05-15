---
title: Obtener Miembros [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los miembros de una contraparte.

**Nombre publicación:** PublicCustomers.getMembers

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0016

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(length: 36)>$ | GUID (identificador único global) de la contraparte.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
members | [SdtsBTCPWCounterpartyIntegration](#sdtsbtcpwcounterpartyintegration) | Listado de miembros.

@tab Errores

Código | Descripción
:--------- | :-----------
40020012 | El número de contraparte no existe
40050100 | Debe ingresar el GUID de contraparte.

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
  },
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0"
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
  "members": {
    "member": [
      {
        "PersonGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
        "CountryId": 604,
        "CountryDescription": "Perú",
        "DocumentTypeId": 11,
        "DocumentTypeDescription": "D.N.I.",
        "DocumentNumber": "47078632",
        "PersonName": "PONTES SILVA GABRIEL",
        "OwnershipTypeId": 1,
        "OwnershipTypeDescription": "TITULAR REPRESENTAT.",
        "PersonType": "F"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:49",
    "Numero": 13468825,
    "Servicio": "PublicCustomers.getMembers",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCPWCounterpartyIntegration

### SdtsBTCPWCounterpartyIntegration

::: center
Los campos del tipo de dato estructurado SdtsBTCPWCounterpartyIntegration son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CountryId | Short | Identificador del país.
CountryDescription | String $<(length: 30)>$ | Descripción del país.
DocumentNumber | String $<(length: 25)>$ | Número de documento.
DocumentTypeId | Short | Identificador del tipo de documento.
DocumentTypeDescription | String $<(length: 30)>$ | Descripción del tipo de documento.
OwnershipTypeId | Byte $<(length: 2)>$ | Identificador del tipo de propiedad.
OwnershipTypeDescription | String | Descripción del tipo de propiedad.
PersonGUID | String $<(length: 36)>$ | GUID de persona.
PersonName | String $<(length: 70)>$ | Nombre de persona.
PersonType | String $<(length: 1)>$ | Tipo de persona.
:::
<!-- CIERRA SDT -->
