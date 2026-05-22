---
title: Get Branches
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
    "Token": "E7227F065D421A5B5267C8DB"
  },
  "offset": "0",
  "limit": "10"
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
    "Token": "E7227F065D421A5B5267C8DB"
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
      },
      {
        "companyCode": 1,
        "code": 90,
        "name": "TESORERIA",
        "reducedName": "90",
        "street": "CARRRERA 11 5 56",
        "doorNumber": 5,
        "departmentId": 19,
        "departmentName": "Pasco",
        "cityId": 1079,
        "cityName": "",
        "phone": "57 (2) 839 99 00",
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "branchType": 1,
        "dependencyId": 0,
        "dependencyName": "TESORERIA",
        "stateId": 1,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      },
      {
        "companyCode": 1,
        "code": 91,
        "name": "TESORERIA BONOS",
        "reducedName": "TESBO",
        "street": "CARRERA 11 5 56",
        "doorNumber": 5,
        "departmentId": 5,
        "departmentName": "Ayacucho",
        "cityId": 1814,
        "cityName": "",
        "phone": "57 (2) 8399900",
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "branchType": 1,
        "dependencyId": 0,
        "dependencyName": "TESORERIA BONOS",
        "stateId": 1,
        "timeZone": "-11",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      },
      {
        "companyCode": 1,
        "code": 100,
        "name": "Direccion General",
        "reducedName": "DG",
        "street": "CR 11 No 5-56",
        "doorNumber": 12,
        "departmentId": 1,
        "departmentName": "Amazonas",
        "cityId": 1022,
        "cityName": "",
        "phone": "11111",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 1,
        "dependencyId": 0,
        "dependencyName": "Direccion General",
        "stateId": 1,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": "DG1@mail.com.uy"
      },
      {
        "companyCode": 1,
        "code": 110,
        "name": "Barranquilla Centro",
        "reducedName": "110",
        "street": "Cll 39 No 41-108",
        "doorNumber": 30,
        "departmentId": 8,
        "departmentName": "Cusco",
        "cityId": 1,
        "cityName": "",
        "phone": "57 (5) 385 12 28",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 0,
        "dependencyId": 0,
        "dependencyName": "Barranquilla Centro",
        "stateId": 0,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      },
      {
        "companyCode": 1,
        "code": 120,
        "name": "Barranquilla Soledad",
        "reducedName": "Barra",
        "street": "CARRERA 19 No 25A - 05",
        "doorNumber": 30,
        "departmentId": 1,
        "departmentName": "Amazonas",
        "cityId": 1022,
        "cityName": "",
        "phone": "57 (5) 309 18 40",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 3,
        "dependencyId": 0,
        "dependencyName": "Barranquilla Soledad",
        "stateId": 3,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      },
      {
        "companyCode": 1,
        "code": 121,
        "name": "PDA Santo Tomas",
        "reducedName": "120",
        "street": "CALLE 9 No 8A - 82",
        "doorNumber": 30,
        "departmentId": 1,
        "departmentName": "Amazonas",
        "cityId": 1,
        "cityName": "",
        "phone": "57 (5) 879 04 81",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 2,
        "dependencyId": 0,
        "dependencyName": "PDA Santo Tomas",
        "stateId": 2,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      },
      {
        "companyCode": 1,
        "code": 122,
        "name": "PDA Malambo",
        "reducedName": "120",
        "street": "CALLE 10 No 16-23",
        "doorNumber": 30,
        "departmentId": 1,
        "departmentName": "Amazonas",
        "cityId": 1,
        "cityName": "",
        "phone": "57 (5) 376 09 98",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 3,
        "dependencyId": 0,
        "dependencyName": "PDA Malambo",
        "stateId": 3,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      },
      {
        "companyCode": 1,
        "code": 130,
        "name": "Barranquilla Cordialidad",
        "reducedName": "130",
        "street": "Calle  47 Nro  20 - 06",
        "doorNumber": 30,
        "departmentId": 1,
        "departmentName": "Amazonas",
        "cityId": 1,
        "cityName": "",
        "phone": "57 (5) 385 12 28",
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "branchType": 2,
        "dependencyId": 0,
        "dependencyName": "Barranquilla Cordialidad",
        "stateId": 2,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "123456",
        "email": "mail@mail.com"
      },
      {
        "companyCode": 1,
        "code": 140,
        "name": "Barranquilla Metrocentro",
        "reducedName": "140",
        "street": "CALLE 45 No 5B-56",
        "doorNumber": 30,
        "departmentId": 1,
        "departmentName": "Amazonas",
        "cityId": 1,
        "cityName": "",
        "phone": "57 (5) 385 12 28",
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "branchType": 1,
        "dependencyId": 0,
        "dependencyName": "Barranquilla Metrocentro",
        "stateId": 2,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "66666",
        "email": "mail2@mail.com"
      },
      {
        "companyCode": 1,
        "code": 141,
        "name": "PDA Central de Abastos",
        "reducedName": "142",
        "street": "CL 63 lNo 3-75",
        "doorNumber": 30,
        "departmentId": 8,
        "departmentName": "Cusco",
        "cityId": 72,
        "cityName": "",
        "phone": "18000910666",
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "branchType": 0,
        "dependencyId": 0,
        "dependencyName": "PDA Central de Abastos",
        "stateId": 0,
        "timeZone": "0",
        "latitude": "0",
        "longitude": "0",
        "zipCode": "",
        "email": ""
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-22",
    "Hora": "17:19:20",
    "Numero": 13506049,
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
