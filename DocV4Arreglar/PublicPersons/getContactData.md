---
title: Obtener Contacto Datos [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los datos de contacto de una persona.

**Nombre publicación:** PublicPersons.getContactData

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0011

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(length: 36)>$ | GUID (identificador único global) de la persona.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
contacts | [SdtsBTPEWContact](#sdtsbtpewcontact) | Listado de contactos.

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
  "contacts": {
    "contact": [
      {
        "Correlative": 1,
        "ContactTypeId": 3,
        "ContactTypeDescription": "CORREO ELECTRÓNICO",
        "Text": "GPONTES@GMAIL.COM",
        "Comment": "CORREO",
        "TelephoneCompanyId": 1,
        "TelephoneCompanyDescription": "",
        "Enabled": true,
        "AssociatedToAnAddress": false,
        "AddressCorrelative": 0,
        "AddressId": "",
        "Validated": true,
        "ReceivesMails": false,
        "StartTimeRange1": "",
        "EndTimeRange1": "",
        "StartTimeRange2": "",
        "EndTimeRange2": "",
        "Priority": 3
      },
      {
        "Correlative": 1,
        "ContactTypeId": 1,
        "ContactTypeDescription": "TELEFONO MÓVIL",
        "Text": "095265956",
        "Comment": "TELEFONO CELULAR",
        "TelephoneCompanyId": 1,
        "TelephoneCompanyDescription": "",
        "Enabled": true,
        "AssociatedToAnAddress": false,
        "AddressCorrelative": 0,
        "AddressId": "",
        "Validated": true,
        "ReceivesMails": false,
        "StartTimeRange1": "",
        "EndTimeRange1": "",
        "StartTimeRange2": "",
        "EndTimeRange2": "",
        "Priority": 1
      },
      {
        "Correlative": 1,
        "ContactTypeId": 2,
        "ContactTypeDescription": "TELEFONO FIJO",
        "Text": "25148765",
        "Comment": "TELEFONO FIJO",
        "TelephoneCompanyId": 1,
        "TelephoneCompanyDescription": "",
        "Enabled": true,
        "AssociatedToAnAddress": false,
        "AddressCorrelative": 0,
        "AddressId": "",
        "Validated": true,
        "ReceivesMails": false,
        "StartTimeRange1": "",
        "EndTimeRange1": "",
        "StartTimeRange2": "",
        "EndTimeRange2": "",
        "Priority": 2
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:55:09",
    "Numero": 13469353,
    "Servicio": "PublicPersons.getContactData",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWContact

### SdtsBTPEWContact

::: center
Los campos del tipo de dato estructurado SdtsBTPEWContact son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AddressCorrelative | Short $<(length: 3)>$ | Correlativo de dirección.
AddressId | String $<(length: 140)>$ | Identificador de dirección.
AssociatedToAnAddress | Boolean $<(length: 1)>$ | Asociado a una dirección.
Comment | String $<(length: 250)>$ | Comentario.
ContactTypeId | Byte $<(length: 2)>$ | Identificador del tipo de contacto.
ContactTypeDescription | String $<(length: 50)>$ | Descripción del tipo de contacto.
Correlative | Byte $<(length: 2)>$ | Correlativo.
Enabled | Boolean $<(length: 1)>$ | Habilitado.
EndTimeRange1 | String $<(length: 5)>$ | Fin del rango horario 1.
EndTimeRange2 | String $<(length: 5)>$ | Fin del rango horario 2.
Priority | Byte $<(length: 2)>$ | Prioridad.
ReceivesMails | Boolean $<(length: 1)>$ | Recibe correos.
StartTimeRange1 | String $<(length: 5)>$ | Inicio del rango horario 1.
StartTimeRange2 | String $<(length: 5)>$ | Inicio del rango horario 2.
TelephoneCompanyId | Short $<(length: 3)>$ | Identificador de compañía telefónica.
TelephoneCompanyDescription | String $<(length: 50)>$ | Descripción de la compañía telefónica.
Text | String $<(length: 250)>$ | Texto.
Validated | Boolean $<(length: 1)>$ | Validado.
:::
<!-- CIERRA SDT -->
