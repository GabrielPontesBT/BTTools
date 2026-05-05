---
title: Obtener Posiciones
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
::: note Método para obtener los cargos / posiciones asociadas a personas.
**Nombre publicación:** PublicPersons.getPositions  
**Programa:** No aplica  
**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Token | String | Token de sesión válido.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Integer | Identificador del cargo.
Description | String | Descripción del cargo.
Multilateral | Boolean | Indica si el cargo admite múltiples titulares.

@tab Errores

Código | Descripción
:--------- | :-----------
10011 | Sesión inválida.
10002 | Error en la ejecución del programa.
:::

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getPositions' \
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
## Ejemplo de Respuesta
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
  "jobsTitle": {
    "jobsTitleItem": [
      {
        "Id": "1",
        "Description": "PRESIDENTE",
        "Multilateral": "false"
      },
      {
        "Id": "2",
        "Description": "VICEPRESIDENTE",
        "Multilateral": "false"
      },
      {
        "Id": "3",
        "Description": "PROSECRETARIO",
        "Multilateral": "false"
      },
      {
        "Id": "4",
        "Description": "TESORERO",
        "Multilateral": "false"
      },
      {
        "Id": "5",
        "Description": "DIRECTOR",
        "Multilateral": "true"
      },
      {
        "Id": "6",
        "Description": "SECRETARIO",
        "Multilateral": "false"
      },
      {
        "Id": "7",
        "Description": "PROTESORERO",
        "Multilateral": "false"
      },
      {
        "Id": "8",
        "Description": "SOCIO",
        "Multilateral": "false"
      },
      {
        "Id": "9",
        "Description": "GERENTE",
        "Multilateral": "false"
      },
      {
        "Id": "10",
        "Description": "APODERADO",
        "Multilateral": "false"
      },
      {
        "Id": "11",
        "Description": "AUTORIZADO",
        "Multilateral": "false"
      },
      {
        "Id": "12",
        "Description": "ADMINISTRADOR",
        "Multilateral": "false"
      },
      {
        "Id": "13",
        "Description": "VOCAL",
        "Multilateral": "false"
      },
      {
        "Id": "14",
        "Description": "COOPERATIVISTA",
        "Multilateral": "false"
      },
      {
        "Id": "15",
        "Description": "FIRMA SOLIDARIA",
        "Multilateral": "false"
      },
      {
        "Id": "16",
        "Description": "SOCIO COMANDITADO",
        "Multilateral": "false"
      },
      {
        "Id": "17",
        "Description": "SOCIO COMANDITARIO",
        "Multilateral": "false"
      },
      {
        "Id": "18",
        "Description": "INTERVENTOR",
        "Multilateral": "false"
      },
      {
        "Id": "19",
        "Description": "ACCIONISTA",
        "Multilateral": "false"
      },
      {
        "Id": "20",
        "Description": "GERENTE GENERAL",
        "Multilateral": "false"
      },
      {
        "Id": "21",
        "Description": "EMPLEADO",
        "Multilateral": "false"
      },
      {
        "Id": "5558",
        "Description": "PRESIDENTE",
        "Multilateral": "false"
      },
      {
        "Id": "5559",
        "Description": "PRESIDENTE",
        "Multilateral": "false"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-16",
    "Hora": "15:27:50",
    "Numero": "13004572",
    "Servicio": "PublicPersons.getPositions",
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
::: details jobsTitle

### jobsTitle

::: center
Los campos del tipo de dato estructurado jobsTitle son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
Multilateral | String |
:::
<!-- CIERRA SDT -->
