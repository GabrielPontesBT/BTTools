---
title: Obtener Sucursales [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de sucursales.

**Nombre publicación:** PublicGeneral.getBranches

**Módulo:** General

**Programa:** PublicAPI.ABTBRPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
offset | Long $<(length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
hasNext | Boolean | Existen más páginas disponibles en la paginación?.
branches | [SdtsBTBRBranch](#sdtsbtbrbranch) | Listado de sucursales.

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
    "Token": "907FDCD8173D3FB297F702B1"
  },
  "offset": 0,
  "limit": 0
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
    "Token": "907FDCD8173D3FB297F702B1"
  },
  "hasNext": true,
  "branches": {
    "branch": [
      {
        "companyCode": 1,
        "code": 1,
        "name": "Sucursal Beta",
        "reducedName": "1",
        "street": "Av. Italia",
        "doorNumber": 1234,
        "departmentId": 3,
        "departmentName": "Apurímac",
        "cityId": 1737,
        "cityName": "",
        "phone": "8399900",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 1,
        "dependencyId": 0,
        "dependencyName": "Sucursal Beta",
        "stateId": 1,
        "timeZone": "-11",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": "sp1@mail.com"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:19:04",
    "Numero": 13466217,
    "Servicio": "PublicGeneral.getBranches",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**
<!-- ABRE SDT -->
::: details SdtsBTBRBranch

### SdtsBTBRBranch

::: center
Los campos del tipo de dato estructurado SdtsBTBRBranch son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
branchType | Byte $<(length: 2)>$ | Tipo de sucursal.
calendarId | Short $<(length: 3)>$ | Código de calendario de sucursal.
calendarName | String $<(length: 40)>$ | Nombre del calendario de sucursal.
cityId | Int $<(length: 5)>$ | Ciudad de sucursal.
cityName | String $<(length: 30)>$ | Nombre de la ciudad de sucursal.
code | Int $<(length: 5)>$ | Código de sucursal.
companyCode | Short $<(length: 3)>$ | Código de empresa.
departmentId | Int $<(length: 5)>$ | Departamento de sucursal.
departmentName | String $<(length: 30)>$ | Nombre del departamento de sucursal.
dependencyId | Int $<(length: 5)>$ | Dependencia de sucursal.
dependencyName | String $<(length: 30)>$ | Nombre de dependencia de sucursal.
doorNumber | Int $<(length: 5)>$ | Número de puerta de sucursal.
email | String $<(length: 50)>$ | Correo electrónico de sucursal.
latitude | Double $<(length: 9)>$ | Latitud de sucursal.
longitude | Double $<(length: 9)>$ | Longitud de sucursal.
name | String $<(length: 30)>$ | Nombre de sucursal.
phone | String $<(length: 20)>$ | Teléfono de sucursal.
reducedName | String $<(length: 5)>$ | Nombre reducido.
stateId | Byte $<(length: 2)>$ | Estado de sucursal.
street | String $<(length: 25)>$ | Calle de sucursal.
timeZone | Double $<(length: 5)>$ | Zona horaria de sucursal.
zipCode | String $<(length: 8)>$ | Código postal de sucursal.
:::
<!-- CIERRA SDT -->
