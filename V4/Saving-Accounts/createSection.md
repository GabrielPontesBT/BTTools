---
title: Create Section
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para crear un apartado a una cuenta de ahorro.

**Nombre publicación:** PublicSavingAccounts.createSection

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0011

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
savingAccountGUID | String $<(length: 36)>$ | GUID (identificador único global) de la cuenta de ahorro.
category | Int $<(length: 5)>$ | Categoría del apartado
concept | String $<(length: 255)>$ | Concepto
geolocalization | [SdtsBTGeolocalization](#sdtsbtgeolocalization) | 
transferType | Byte $<(length: 1)>$ | Tipo de transferencia
frequency | Byte $<(length: 1)>$ | Frecuencia
amount | Double $<(length: 18.2)>$ | Monto
monthlyTransferDay | Byte $<(length: 2)>$ | 
weeklyTransferDay | Byte $<(length: 1)>$ | 
schedulesTransfer | Boolean | Programa transferencia?

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
sectionGUID | String $<(length: 36)>$ | GUID (identificador único global) del apartado.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
500 |  | BTSA000014, BTSAPA0011
90031 | El código contable no existe | BTACA00006
90072 | No existe la relación para el código contable | BTACA00007
170047 | No existe el id de concepto de saldo disponible ingresado | BTLIA00010
170054 | Debe ingresar el GUID | BTLIA00016
980083 | La moneda y/o papel no está asociada al producto | BTPHA00003
990070 | El sistema no se encuentra definido | BTCFA01000, BTCFA02000
990071 | El parámetro no se encuentra definido | BTCFA01000, BTCFA02000
50050003 | No existe la empresa ingresada | BTA0000017
50060003 | No existe el módulo ingresado | BTMDA00001
140012008 |  | BTSA000014
140012009 |  | BTSA000014
140012010 |  | BTSA000014
140012011 |  | BTSA000014
140012012 |  | BTSA000014
140012013 |  | BTSA000014
140012014 |  | BTSA000014
14001010001 | Debe ingresar el GUID de la cuenta de ahorro. | BTSAPA0011
99990010006 | No se pudo resolver el usuario | BTSCA00006

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
    "Token": "C004FACBFC2507D9B6B9A13E"
  },
  "savingAccountGUID": "65e099e6-00ef-4dcd-a244-0c2aa0793c3e",
  "category": "1",
  "concept": "Gastos Varios",
  "geolocalization": {
    "latitude": "44.666666",
    "longitude": "53.123456",
    "timestamp": "2026-06-14T12:02:00UTC-3"
  },
  "transferType": "1",
  "frequency": "3",
  "amount": "200",
  "monthlyTransferDay": "24",
  "weeklyTransferDay": "0",
  "schedulesTransfer": "true"
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
    "Token": "C004FACBFC2507D9B6B9A13E"
  },
  "sectionGUID": "78824b30-366d-4686-a84e-89ffa0e35285",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "19:45:56",
    "Numero": 13585058,
    "Servicio": "PublicSavingAccounts.createSection",
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
longitude | Double $<(length: 11.8)>$ | Longitud.
timestamp | String $<(length: 35)>$ | Fecha, hora y zona horaria expresado en el siguiente formato: AAAA-MM-DDTHH:MM:SS.XXXXXX(+/-)HH:MM
:::
<!-- CIERRA SDT -->
