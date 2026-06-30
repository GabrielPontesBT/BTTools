---
title: Delete Contact Data
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para eliminar un dato de contacto de una contraparte.

**Nombre publicación:** PublicCustomers.deleteContactData

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0021

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
contactTypeId | Byte $<(Length: 2)>$ | Identificador de tipo de contacto.
correlative | Byte $<(Length: 2)>$ | Correlativo.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40010000 | Id de persona incorrecto
40010061 | Tipo de contacto incorrecto
40020006 | Contraparte no existe
40020009 | Debe ingresar número de contraparte
40020012 | El número de contraparte no existe
40020014 | Empresa incorrecta
40020017 | La persona ingresada no existe
40020072 | Debe ingresar al menos un contacto para la contraparte N° ?
40020073 | Debe ingresar un tipo de contacto para la contraparte N° ?
40020074 | Tipo de contacto incorrecto para la contraparte N° ?
40020075 | Debe ingresar el contacto para la contraparte N° ?
40020076 | Compañía de teléfono incorrecta para la contraparte N° ?
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
    "Token": "444B674391BCA7676279700A"
  },
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0",
  "contactTypeId": 1,
  "correlative": 1
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
    "Hora": "16:14:27",
    "Numero": 13468817,
    "Servicio": "PublicCustomers.deleteContactData",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
