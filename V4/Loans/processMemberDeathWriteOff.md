---
title: Process Member Death Write Off
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para quebranto por fallecimiento

**Nombre publicación:** PublicLoans.processMemberDeathWriteOff

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0050

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
groupId | Int $<(length: 9)>$ | Identificador de grupo.
loanGuid | String $<(length: 36)>$ | Identificador único (GUID) de préstamo.
deceasedDate | Date | Fecha de fallecimiento.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
movementGuid | String $<(length: 36)>$ | Identificador único (GUID) de movimiento.

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

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
    "Token": "E3ADC97E57DC5FDE4F408A70"
  },
  "groupId": "70",
  "loanGuid": "7de60dc6-b377-4683-9a8d-95ce6c69df74",
  "deceasedDate": "2027-07-30"
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
    "Token": "E3ADC97E57DC5FDE4F408A70"
  },
  "movementGuid": "58cfb0f0-4922-4d38-8d76-3a72ba3aa9d0",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "18:50:57",
    "Numero": 13584292,
    "Servicio": "PublicLoans.processMemberDeathWriteOff",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


