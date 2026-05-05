---
title: Obtener Estados Civiles
breadcrumb: false
pageInfo: false
toc: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
comment: false
footer: false
backtotop: false
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los estados civiles.
Este servicio permite consultar el catálogo de estados civiles disponibles para personas.

**Nombre publicación:** PublicPersons.getMaritalStatuses

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
maritalStatus | Array | Lista de estados civiles.

@tab Errores

Código | Descripción
:--------- | :-----------
10002 | Error en la ejecución del programa.
10011 | Sesión inválida.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getMaritalStatuses' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "606B54A76488080E3507C093"
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "606B54A76488080E3507C093"
  },
  "maritalStatus": {
    "maritalStatusItem": [
      {
        "Id": "1",
        "Description": "SOLTERO/A",
        "RequiresSpouse": "false"
      },
      {
        "Id": "2",
        "Description": "CASADO/A",
        "RequiresSpouse": "true"
      },
      {
        "Id": "3",
        "Description": "SEPARADO/A",
        "RequiresSpouse": "false"
      },
      {
        "Id": "4",
        "Description": "VIUDO/A",
        "RequiresSpouse": "false"
      },
      {
        "Id": "5",
        "Description": "DIVORCIADO/A",
        "RequiresSpouse": "false"
      },
      {
        "Id": "6",
        "Description": "CONCUBINO/A",
        "RequiresSpouse": "false"
      },
      {
        "Id": "7",
        "Description": "CASADO C/SEP.DE BIEN",
        "RequiresSpouse": "false"
      },
      {
        "Id": "8",
        "Description": "UNIÓN LIBRE",
        "RequiresSpouse": "false"
      },
      {
        "Id": "9",
        "Description": "OTROS",
        "RequiresSpouse": "false"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-27",
    "Hora": "15:13:58",
    "Numero": "13048528",
    "Servicio": "PublicPersons.getMaritalStatuses",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details maritalStatu

### maritalStatu

::: center
Los campos del tipo de dato estructurado maritalStatu son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
RequiresSpouse | String |
:::
<!-- CIERRA SDT -->
