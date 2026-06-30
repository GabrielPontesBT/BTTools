---
title: Validate Existence
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para validar la existencia de una persona.

**Nombre publicación:** PublicPersons.validateExistence

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada
No aplica.

@tab Body
Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
countryId | Short $<(Length: 3)>$ | Identificador de país.
documentTypeId | Short $<(Length: 4)>$ | Tipo de documento.
documentNumber | String $<(Length: 25)>$ | Número de documento.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
exists | Boolean | Existe?

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
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
  "countryId": 1,
  "documentTypeId": 1,
  "documentNumber": "12345678"
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
  "exists": false,
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:40",
    "Numero": 13469346,
    "Servicio": "PublicPersons.validateExistence",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


