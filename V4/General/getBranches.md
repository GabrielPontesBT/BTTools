---
title: Branches
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de sucursales.

**Nombre publicación:** PublicGeneral.branches

**Programa:** PublicAPI.BTBRPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/branches
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
hasNext | Boolean | Indica si existen más páginas disponibles.
branches | [branch](#branch) | Listado de sucursales.

@tab Errores

Código | Descripción
:--------- | :---------
99990010002 | Datos de Paginación Incorrectos.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/branches?offset=0&limit=10' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: {{token}}'
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "branches": {
    "branch": [
      {
        "branchType": 1,
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "cityId": 1737,
        "cityName": "",
        "code": 1,
        "companyCode": 1,
        "departmentId": 3,
        "departmentName": "BAJA CALIFORNIA SUR",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 1234,
        "email": "sp1@mail.com",
        "latitude": 0,
        "longitude": 0,
        "name": "Sucursal Beta",
        "phone": "8399900",
        "reducedName": "1",
        "statusId": 1,
        "street": "Av. Italia",
        "timeZone": -11,
        "zipCode": ""
      },
      {
        "branchType": 1,
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "cityId": 1079,
        "cityName": "",
        "code": 90,
        "companyCode": 1,
        "departmentId": 19,
        "departmentName": "NUEVO LEON",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 5,
        "email": "",
        "latitude": 0,
        "longitude": 0,
        "name": "TESORERIA",
        "phone": "57 (2) 839 99 00",
        "reducedName": "90",
        "statusId": 1,
        "street": "CARRRERA 11 5 56",
        "timeZone": 0,
        "zipCode": ""
      },
      {
        "branchType": 1,
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "cityId": 1814,
        "cityName": "",
        "code": 91,
        "companyCode": 1,
        "departmentId": 5,
        "departmentName": "COAHUILA DE ZARAGOZA",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 5,
        "email": "",
        "latitude": 0,
        "longitude": 0,
        "name": "TESORERIA BONOS",
        "phone": "57 (2) 8399900",
        "reducedName": "TESBO",
        "statusId": 1,
        "street": "CARRERA 11 5 56",
        "timeZone": -11,
        "zipCode": ""
      },
      {
        "branchType": 1,
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "cityId": 1022,
        "cityName": "",
        "code": 100,
        "companyCode": 1,
        "departmentId": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 12,
        "email": "DG1@mail.com.uy",
        "latitude": 0,
        "longitude": 0,
        "name": "Direccion General",
        "phone": "11111",
        "reducedName": "DG",
        "statusId": 1,
        "street": "CR 11 No 5-56",
        "timeZone": 0,
        "zipCode": ""
      },
      {
        "branchType": 1,
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "cityId": 1,
        "cityName": "Ahumada",
        "code": 110,
        "companyCode": 1,
        "departmentId": 8,
        "departmentName": "CHIHUAHUA",
        "dependencyId": 110,
        "dependencyName": "Barranquilla Centro",
        "doorNumber": 30,
        "email": "",
        "latitude": 0,
        "longitude": 0,
        "name": "Barranquilla Centro",
        "phone": "57 (5) 385 12 28",
        "reducedName": "110",
        "statusId": 1,
        "street": "Cll 39 No 41-108",
        "timeZone": 0,
        "zipCode": ""
      },
      {
        "branchType": 3,
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "cityId": 1022,
        "cityName": "",
        "code": 120,
        "companyCode": 1,
        "departmentId": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 30,
        "email": "",
        "latitude": 0,
        "longitude": 0,
        "name": "Barranquilla Soledad",
        "phone": "57 (5) 309 18 40",
        "reducedName": "Barra",
        "statusId": 3,
        "street": "CARRERA 19 No 25A - 05",
        "timeZone": 0,
        "zipCode": ""
      },
      {
        "branchType": 2,
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "cityId": 1,
        "cityName": "Aguascalientes",
        "code": 121,
        "companyCode": 1,
        "departmentId": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 30,
        "email": "",
        "latitude": 0,
        "longitude": 0,
        "name": "PDA Santo Tomas",
        "phone": "57 (5) 879 04 81",
        "reducedName": "120",
        "statusId": 2,
        "street": "CALLE 9 No 8A - 82",
        "timeZone": 0,
        "zipCode": ""
      },
      {
        "branchType": 3,
        "calendarId": 1,
        "calendarName": "Calendario 1",
        "cityId": 1,
        "cityName": "Aguascalientes",
        "code": 122,
        "companyCode": 1,
        "departmentId": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 30,
        "email": "",
        "latitude": 0,
        "longitude": 0,
        "name": "PDA Malambo",
        "phone": "57 (5) 376 09 98",
        "reducedName": "120",
        "statusId": 3,
        "street": "CALLE 10 No 16-23",
        "timeZone": 0,
        "zipCode": ""
      },
      {
        "branchType": 2,
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "cityId": 1,
        "cityName": "Aguascalientes",
        "code": 130,
        "companyCode": 1,
        "departmentId": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 30,
        "email": "mail@mail.com",
        "latitude": 0,
        "longitude": 0,
        "name": "Barranquilla Cordialidad",
        "phone": "57 (5) 385 12 28",
        "reducedName": "130",
        "statusId": 2,
        "street": "Calle  47 Nro  20 - 06",
        "timeZone": 0,
        "zipCode": "123456"
      },
      {
        "branchType": 1,
        "calendarId": 2,
        "calendarName": "Calendario 2",
        "cityId": 1,
        "cityName": "Aguascalientes",
        "code": 140,
        "companyCode": 1,
        "departmentId": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "dependencyName": "",
        "doorNumber": 30,
        "email": "mail2@mail.com",
        "latitude": 0,
        "longitude": 0,
        "name": "Barranquilla Metrocentro",
        "phone": "57 (5) 385 12 28",
        "reducedName": "140",
        "statusId": 2,
        "street": "CALLE 45 No 5B-56",
        "timeZone": 0,
        "zipCode": "66666"
      }
    ]
  },
  "hasNext": true
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details branch

### branch

::: center
Los campos del tipo de dato estructurado branch son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
branchType | Byte $<(Length: 2)>$ | Tipo de sucursal.
calendarId | Short $<(Length: 3)>$ | Identificador de calendario de sucursal.
calendarName | String $<(Length: 40)>$ | Descripción del calendario de sucursal.
cityId | Int $<(Length: 5)>$ | Identificador de ciudad de sucursal.
cityName | String $<(Length: 30)>$ | Descripción de ciudad de sucursal.
code | Int $<(Length: 5)>$ | Código de sucursal.
companyCode | Short $<(Length: 3)>$ | Identificador de empresa.
departmentId | Int $<(Length: 5)>$ | Identificador de departamento de sucursal.
departmentName | String $<(Length: 30)>$ | Descripción de departamento de sucursal.
dependencyId | Int $<(Length: 5)>$ | Identificador de sucursal de dependencia.
dependencyName | String $<(Length: 30)>$ | Descripción de sucursal de dependencia.
doorNumber | Int $<(Length: 5)>$ | Número de puerta de sucursal.
email | String $<(Length: 50)>$ | Email.
latitude | Double $<(Length: 9.6)>$ | Latitud.
longitude | Double $<(Length: 9.6)>$ | Longitud.
name | String $<(Length: 30)>$ | Nombre de sucursal.
phone | String $<(Length: 20)>$ | Teléfono de sucursal.
reducedName | String $<(Length: 5)>$ | Nombre reducido.
statusId | Byte $<(Length: 2)>$ | Estado de sucursal.
street | String $<(Length: 25)>$ | Calle de sucursal.
timeZone | Double $<(Length: 5.2)>$ | Zona horaria de sucursal.
zipCode | String $<(Length: 8)>$ | Código postal de sucursal.
:::
<!-- CIERRA SDT -->
