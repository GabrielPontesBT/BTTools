---
title: Update Reference
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar las referencias de una persona.

**Nombre publicación:** PublicPersons.updateReference

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0018

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.


@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
references | [SdtsBTPEWReference](#sdtsbtpewreference) | Listado de referencias.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40010106 | Parentesco Incorrecto
40010111 | Cargo Incorrecto
40010132 | No existe Referencia con el correlativo ingresado
40010133 | Tipo de Referencia Incorrecto
40010353 | Existe inconsistencia de datos con el campo ? en la RNG ??
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
40050001 | Debe ingresar el GUID de persona.
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "personGUID": "a542ed11-a4e4-4ead-83b6-b3530961c2b9",
  "references": {
    "reference": [
      {
        "Correlative": 1,
        "Name": "REFERENCIA DE PRUEBA",
        "ReferenceTypeId": 1,
        "Telephone": "094111222",
        "PersonType": "F",
        "BondOrJobTitle": "J",
        "RelationshipId": 1
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:56:13",
    "Numero": 13469382,
    "Servicio": "PublicPersons.updateReference",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWReference

### SdtsBTPEWReference

::: center
Los campos del tipo de dato estructurado SdtsBTPEWReference son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Address1 | String $<(Length: 50)>$ | Dirección 1.
Address2 | String $<(Length: 50)>$ | Dirección 2.
Address3 | String $<(Length: 50)>$ | Dirección 3.
BondOrJobTitle | String $<(Length: 1)>$ | Vínculo o cargo.
Correlative | Short $<(Length: 3)>$ | Correlativo.
EnterpriceJobTitleDescription | String $<(Length: 30)>$ | Descripción del cargo en la empresa.
EnterpriseJobTitleId | Short $<(Length: 4)>$ | Identificador del cargo empresarial.
Name | String $<(Length: 50)>$ | Nombre.
PersonType | String $<(Length: 1)>$ | Tipo de persona.
ReferenceTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de referencia.
ReferenceTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de referencia.
RelationshipId | Short | Identificador de relación.
RelationshipDescription | String $<(Length: 30)>$ | Descripción de la relación.
Telephone | String $<(Length: 50)>$ | Teléfono.
:::
<!-- CIERRA SDT -->
