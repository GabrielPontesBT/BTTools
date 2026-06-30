---
title: Create
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para contratar una cuenta de ahorro.

**Nombre publicación:** PublicSavingAccounts.create

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
subAccountName | String $<(Length: 255)>$ | Nombre de la subcuenta.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
signatureType | String $<(Length: 1)>$ | Tipo de integración.
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | Datos de geolocalización.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.

@tab Errores

Código | Descripción
:--------- | :-----------
40010004 | La persona no existe
40020006 | Contraparte no existe
40020012 | El número de contraparte no existe
50050003 | No se encuentra la empresa
140010005 | Debe ingresar la contraparte
140010006 | La contraparte debe estar activa
140010007 | La contraparte no puede tener integrantes fallecidos
140010008 | No se ha indicado el tipo de firma
140010011 | Debe ingresar el subproducto
140010012 | Debe ingresar el nombre para el producto
140010013 | Debe ingresar la sucursal para el producto
140010033 | El importe ingresado es menor al mínimo requerido para el producto
14001010001 | Debe ingresar el GUID de la cuenta de ahorro.
14001010002 | Debe ingresar el GUID de la contraparte.
14001010003 | Debe ingresar el GUID del producto.
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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "counterpartyGUID": "394e48fc-b99c-4546-aeaf-862f9699ec03",
  "productGUID": "28169aa2-61c3-43ca-9fa9-e12ff30d4b71",
  "subAccountName": "Cuenta de Ahorro",
  "branchId": 1,
  "signatureType": "A",
  "geolocalization": {
      "latitude": -34.9058916,
      "longitude": -56.1913095,
      "timestamp":"2024-12-13T11:59:27.904674-03:00",
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
    "Token": "8EE696AD86E93556C39DD2CC"
  },
  "savingAccountGUID": "92b2ce1f-34e7-4606-bdd4-e62bde656979",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:53:55",
    "Numero": 13466298,
    "Servicio": "PublicSavingAccounts.create",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTGeolocalization

### SdtsBTGeolocalization

::: center
Los campos del tipo de dato estructurado SdtsBTGeolocalization son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
latitude | Double | Latitud.
longitude | Double  | Longitud.
timestamp | String | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM
:::
<!-- CIERRA SDT -->
