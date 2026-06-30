---
title: Get Branches
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de sucursales.

**Nombre publicación:** PublicGeneral.getBranches

**Programa:** PublicAPI.BTBRPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/getBranches
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
branches | [SdtsBTBRBranch](#sdtsbtbrbranch) | Listado de sucursales.

@tab Errores

No aplica.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/getBranches?offset=0&limit=10' \
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
  "hasNext": true,
  "branches": {
    "branch": [
      {
        "companyCode": 1,
        "departmentName": "BAJA CALIFORNIA SUR",
        "dependencyId": 0,
        "zipCode": "",
        "code": 1,
        "dependencyName": "Sucursal Beta",
        "departmentId": 3,
        "latitude": 0,
        "timeZone": -11,
        "cityId": 1737,
        "calendarName": "Calendario 1",
        "cityName": "",
        "calendarId": 1,
        "doorNumber": 1234,
        "phone": "8399900",
        "street": "Av. Italia",
        "reducedName": "1",
        "name": "Sucursal Beta",
        "branchType": 1,
        "email": "sp1@mail.com",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "NUEVO LEON",
        "dependencyId": 0,
        "zipCode": "",
        "code": 90,
        "dependencyName": "TESORERIA",
        "departmentId": 19,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1079,
        "calendarName": "Calendario 2",
        "cityName": "",
        "calendarId": 2,
        "doorNumber": 5,
        "phone": "57 (2) 839 99 00",
        "street": "CARRRERA 11 5 56",
        "reducedName": "90",
        "name": "TESORERIA",
        "branchType": 1,
        "email": "",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "COAHUILA DE ZARAGOZA",
        "dependencyId": 0,
        "zipCode": "",
        "code": 91,
        "dependencyName": "TESORERIA BONOS",
        "departmentId": 5,
        "latitude": 0,
        "timeZone": -11,
        "cityId": 1814,
        "calendarName": "Calendario 2",
        "cityName": "",
        "calendarId": 2,
        "doorNumber": 5,
        "phone": "57 (2) 8399900",
        "street": "CARRERA 11 5 56",
        "reducedName": "TESBO",
        "name": "TESORERIA BONOS",
        "branchType": 1,
        "email": "",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "zipCode": "",
        "code": 100,
        "dependencyName": "Direccion General",
        "departmentId": 1,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1022,
        "calendarName": "Calendario 1",
        "cityName": "",
        "calendarId": 1,
        "doorNumber": 12,
        "phone": "11111",
        "street": "CR 11 No 5-56",
        "reducedName": "DG",
        "name": "Direccion General",
        "branchType": 1,
        "email": "DG1@mail.com.uy",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "CHIHUAHUA",
        "dependencyId": 130,
        "zipCode": "",
        "code": 110,
        "dependencyName": "Barranquilla Centro",
        "departmentId": 8,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1,
        "calendarName": "Calendario 2",
        "cityName": "Ahumada",
        "calendarId": 2,
        "doorNumber": 30,
        "phone": "57 (5) 385 12 28",
        "street": "Cll 39 No 41-108",
        "reducedName": "110",
        "name": "Barranquilla Centro",
        "branchType": 1,
        "email": "",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "zipCode": "",
        "code": 120,
        "dependencyName": "Barranquilla Soledad",
        "departmentId": 1,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1022,
        "calendarName": "Calendario 1",
        "cityName": "",
        "calendarId": 1,
        "doorNumber": 30,
        "phone": "57 (5) 309 18 40",
        "street": "CARRERA 19 No 25A - 05",
        "reducedName": "Barra",
        "name": "Barranquilla Soledad",
        "branchType": 3,
        "email": "",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "zipCode": "",
        "code": 121,
        "dependencyName": "PDA Santo Tomas",
        "departmentId": 1,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1,
        "calendarName": "Calendario 1",
        "cityName": "Aguascalientes",
        "calendarId": 1,
        "doorNumber": 30,
        "phone": "57 (5) 879 04 81",
        "street": "CALLE 9 No 8A - 82",
        "reducedName": "120",
        "name": "PDA Santo Tomas",
        "branchType": 2,
        "email": "",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "zipCode": "",
        "code": 122,
        "dependencyName": "PDA Malambo",
        "departmentId": 1,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1,
        "calendarName": "Calendario 1",
        "cityName": "Aguascalientes",
        "calendarId": 1,
        "doorNumber": 30,
        "phone": "57 (5) 376 09 98",
        "street": "CALLE 10 No 16-23",
        "reducedName": "120",
        "name": "PDA Malambo",
        "branchType": 3,
        "email": "",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "zipCode": "123456",
        "code": 130,
        "dependencyName": "Barranquilla Cordialidad",
        "departmentId": 1,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1,
        "calendarName": "Calendario 2",
        "cityName": "Aguascalientes",
        "calendarId": 2,
        "doorNumber": 30,
        "phone": "57 (5) 385 12 28",
        "street": "Calle  47 Nro  20 - 06",
        "reducedName": "130",
        "name": "Barranquilla Cordialidad",
        "branchType": 2,
        "email": "mail@mail.com",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "AGUASCALIENTES",
        "dependencyId": 0,
        "zipCode": "66666",
        "code": 140,
        "dependencyName": "Barranquilla Metrocentro",
        "departmentId": 1,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 1,
        "calendarName": "Calendario 2",
        "cityName": "Aguascalientes",
        "calendarId": 2,
        "doorNumber": 30,
        "phone": "57 (5) 385 12 28",
        "street": "CALLE 45 No 5B-56",
        "reducedName": "140",
        "name": "Barranquilla Metrocentro",
        "branchType": 1,
        "email": "mail2@mail.com",
        "longitude": 0
      },
      {
        "companyCode": 1,
        "departmentName": "CHIHUAHUA",
        "dependencyId": 0,
        "zipCode": "",
        "code": 141,
        "dependencyName": "PDA Central de Abastos",
        "departmentId": 8,
        "latitude": 0,
        "timeZone": 0,
        "cityId": 72,
        "calendarName": "Calendario 1",
        "cityName": "",
        "calendarId": 1,
        "doorNumber": 30,
        "phone": "18000910666",
        "street": "CL 63 lNo 3-75",
        "reducedName": "142",
        "name": "PDA Central de Abastos",
        "branchType": 0,
        "email": "",
        "longitude": 0
      }
    ]
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
