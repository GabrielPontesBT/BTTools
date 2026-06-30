---
title: Update Members
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar los miembros de una contraparte.

**Nombre publicación:** PublicCustomers.updateMembers

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0017

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.


@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
members | [SdtsBTCPWCounterpartyIntegration](#sdtsbtcpwcounterpartyintegration) | Listado de miembros.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40020009 | Debe ingresar número de contraparte
40020015 | La persona ya se encuentra integrada con el nro. de contraparte ingresado
40020017 | La persona ingresada no existe
40020018 | Código de titularidad Incorrecto
40020026 | Se requiere un integrante como titular representativo
40020027 | No se permite más de un integrante como titular representativo
40020028 | Se ingresó la misma persona más de una vez
40020068 | El estado de la contraparte no admite cambios
40020080 | Existe inconsistencia de datos con el campo ? en la RNG ??
40050001 | Debe ingresar el GUID de persona.
40050100 | Debe ingresar el GUID de contraparte.
50050003 | No se encuentra la empresa
99990010006 | No se pudo resolver el usuario
99990010007 | No se pudo resolver la empresa

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
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0",
  "members": {
    "member": [
      {
        "PersonGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d",
        "PersonName": "PEDRO CRAMPET",
        "PersonType": "F",
        "OwnershipTypeId": 1,
        "DocumentTypeId": 0,
        "DocumentNumber": "",
        "CountryId": 0
      }
    ]
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
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:51",
    "Numero": 13468826,
    "Servicio": "PublicCustomers.updateMembers",
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
CountryDescription | String $<(Length: 30)>$ | Descripción del país.
DocumentNumber | String $<(Length: 25)>$ | Número de documento.
DocumentTypeId | Short | Identificador del tipo de documento.
DocumentTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de documento.
OwnershipTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de propiedad.
OwnershipTypeDescription | String | Descripción del tipo de propiedad.
PersonGUID | String $<(Length: 36)>$ | GUID (identificador único global) de persona.
PersonName | String $<(Length: 70)>$ | Nombre de persona.
PersonType | String $<(Length: 1)>$ | Tipo de persona.
:::
<!-- CIERRA SDT -->
