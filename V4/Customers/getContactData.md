---
title: Get Contact Data
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los datos de contacto de una contraparte.

**Nombre publicación:** PublicCustomers.getContactData

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0019

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
contacts | [SdtsBTPEWContact](#sdtsbtpewcontact) | Listado de contactos.

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
  "contacts": {
    "contact": []
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:23",
    "Numero": 13468815,
    "Servicio": "PublicCustomers.getContactData",
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
AddressCorrelative | Short $<(Length: 3)>$ | Correlativo de dirección.
AddressId | String $<(Length: 140)>$ | Identificador de dirección.
AssociatedToAnAddress | Boolean | Asociado a una dirección.
Comment | String $<(Length: 250)>$ | Comentario.
ContactTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de contacto.
ContactTypeDescription | String $<(Length: 50)>$ | Descripción del tipo de contacto.
Correlative | Byte $<(Length: 2)>$ | Correlativo.
Enabled | Boolean | Habilitado.
EndTimeRange1 | String $<(Length: 5)>$ | Fin del rango horario 1.
EndTimeRange2 | String $<(Length: 5)>$ | Fin del rango horario 2.
Priority | Byte $<(Length: 2)>$ | Prioridad.
ReceivesMails | Boolean | Recibe correos.
StartTimeRange1 | String $<(Length: 5)>$ | Inicio del rango horario 1.
StartTimeRange2 | String $<(Length: 5)>$ | Inicio del rango horario 2.
TelephoneCompanyId | Short $<(Length: 3)>$ | Identificador de compañía telefónica.
TelephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
Text | String $<(Length: 250)>$ | Texto.
Validated | Boolean | Validado.
:::
<!-- CIERRA SDT -->
