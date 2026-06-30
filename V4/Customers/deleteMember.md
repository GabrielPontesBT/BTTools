---
title: Delete Member
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para eliminar un miembro de una contraparte.

**Nombre publicación:** PublicCustomers.deleteMember

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0018

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.


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
  "personGUID": "f43a3946-4ae1-4a27-861d-c1c2d9cee87d"
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
    "Hora": "16:14:54",
    "Numero": 13468827,
    "Servicio": "PublicCustomers.deleteMember",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


