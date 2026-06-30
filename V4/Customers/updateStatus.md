---
title: Update Status
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar el estado de una contraparte.

**Nombre publicación:** PublicCustomers.updateStatus

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0012

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
statusId | Byte $<(Length: 2)>$ | Identificador de estado.
reasonForStatusChangeId | Byte $<(Length: 2)>$ | Identificador de cambio de estado.
comment | String | Comentario.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
40020001 | Debe ingresar un Código de estado comprendido entre 1 y 99
40020006 | Contraparte no existe
40020008 | El Código de estado no existe
40020012 | El número de contraparte no existe
40020017 | La persona ingresada no existe
40020049 | Debe ingresar un código de Motivo comprendido entre 1 y 99
40020053 | El código de Motivo no existe
40020055 | La contraparte está cerrada, ya no se pueden realizar operaciones sobre ella
40020056 | La contraparte ya se encuentra en ese estado
40020057 | El Motivo no corresponde al estado ingresado
40020058 | Debe ingresar otro Motivo
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
  "statusId": 1,
  "reasonForStatusChangeId": 1,
  "comment": "ACTUALIZACIÓN DE ESTADO"
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
    "Hora": "16:15:05",
    "Numero": 13468832,
    "Servicio": "PublicCustomers.updateStatus",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


