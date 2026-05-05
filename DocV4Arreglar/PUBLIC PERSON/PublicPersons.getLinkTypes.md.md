---
title: Obtener Tipos de Vínculo
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
::: note Método para obtener los tipos de vínculo entre personas.
Este servicio devuelve el listado de vínculos (relaciones) disponibles para asociar personas (por ejemplo: cónyuge, padre/madre, hijo, etc.).

**Nombre publicación:** PublicPersons.getLinkTypes

**Módulo:** No informado

**Programa:** No informado

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
bonds | Array | Listado de tipos de vínculo.
Id | Int | Identificador del vínculo.
Description | String | Descripción del vínculo.
Type | String | Tipo de vínculo.
Bidirectional | Boolean | Indica si el vínculo es bidireccional.
Multilateral | Boolean | Indica si el vínculo es multilateral.

@tab Errores

Código | Descripción
:--------- | :-----------
<!-- SE DEBEN AGREGAR A MANO -->
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getLinkTypes' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "5C76D6616CC01A47AC96F8CF"
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
    "Token": "5C76D6616CC01A47AC96F8CF"
  },
  "bonds": {
    "bondsItem": [
      {
        "Id": "40",
        "Description": "CÓNYUGE",
        "Type": "A",
        "Bidirectional": "true",
        "Multilateral": "false"
      },
      {
        "Id": "41",
        "Description": "PADRE DE:",
        "Type": "C",
        "Bidirectional": "false",
        "Multilateral": "false"
      },
      {
        "Id": "42",
        "Description": "MADRE DE:",
        "Type": "C",
        "Bidirectional": "false",
        "Multilateral": "false"
      },
      {
        "Id": "43",
        "Description": "HIJO DE:",
        "Type": "C",
        "Bidirectional": "false",
        "Multilateral": "true"
      },
      {
        "Id": "99",
        "Description": "NO CORRESPONDE",
        "Type": "A",
        "Bidirectional": "false",
        "Multilateral": "false"
      },
      {
        "Id": "100",
        "Description": "Amigo",
        "Type": "A",
        "Bidirectional": "false",
        "Multilateral": "true"
      },
      {
        "Id": "1234",
        "Description": "ABUELO DE:",
        "Type": "C",
        "Bidirectional": "false",
        "Multilateral": "true"
      },
      {
        "Id": "2222",
        "Description": "AFINIDAD",
        "Type": "A",
        "Bidirectional": "false",
        "Multilateral": "true"
      },
      {
        "Id": "5555",
        "Description": "CONOCIDO",
        "Type": "A",
        "Bidirectional": "false",
        "Multilateral": "true"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-16",
    "Hora": "14:57:05",
    "Numero": "13004389",
    "Servicio": "PublicPersons.getLinkTypes",
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
::: details bond

### bond

::: center
Los campos del tipo de dato estructurado bond son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
Type | String |
Bidirectional | String |
Multilateral | String |
:::
<!-- CIERRA SDT -->
