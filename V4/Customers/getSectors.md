---
title: Get Sectors
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de sectores.

**Nombre publicación:** PublicCustomers.getSectors

**Módulo:** Accounting

**Programa:** PublicAPI.BTACPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sectors | [SdtsBTACWSector](#sdtsbtacwsector) | Listado de sectores.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
500 |  | BTACPA0001

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
    "Token": "BA60297FA1CA57E336B5E0AF"
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
    "Token": "BA60297FA1CA57E336B5E0AF"
  },
  "sectors": {
    "sector": [
      {
        "Id": 1,
        "Description": "Privado no Financieros"
      },
      {
        "Id": 2,
        "Description": "Privado Financiero"
      },
      {
        "Id": 3,
        "Description": "Gobierno nacional"
      },
      {
        "Id": 4,
        "Description": "Gobierno Departamental"
      },
      {
        "Id": 5,
        "Description": "Seguridad Social"
      },
      {
        "Id": 6,
        "Description": "Entes Autónomos"
      },
      {
        "Id": 7,
        "Description": "Organizaciones Paraestatales"
      },
      {
        "Id": 9,
        "Description": "Público no nacional"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "18:25:28",
    "Numero": 13641969,
    "Servicio": "PublicCustomers.getSectors",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTACWSector

### SdtsBTACWSector

::: center
Los campos del tipo de dato estructurado SdtsBTACWSector son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Short $<(length: 3)>$ | Identificador.
Description | String $<(length: 30)>$ | Descripción.
:::
<!-- CIERRA SDT -->
