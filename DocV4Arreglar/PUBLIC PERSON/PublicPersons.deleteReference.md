---
title: Eliminar Referencia
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
::: note Método para eliminar una referencia de una persona.
Este servicio permite eliminar una referencia asociada a una persona, identificándola por su correlativo.

**Nombre publicación:** PublicPersons.deleteReference

**Programa:** [Pendiente de completar]

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String (GUID) | Identificador único de la persona.
correlative | Integer | Correlativo de la referencia a eliminar.

@tab Body

No aplica.

@tab Datos de Salida

No aplica.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?deleteReference' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "606B54A76488080E3507C093"
  },
  "personGUID": "68797e38-8bfa-43c1-9edb-5c86c12be48b",
  "correlative": "1"
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
   "Envelope": {
      "Body": {
         "PublicPersons.deleteReferenceResponse": {
            "Btinreq": {
               "Canal": "BTDIGITAL",
               "Usuario": "INSTALADOR",
               "Device": "FPAIS",
               "Requerimiento": "1",
               "Token": "606B54A76488080E3507C093"
            },
            "BusinessErrors": "",
            "Btoutreq": {
               "Estado": "OK",
               "Fecha": "2026-01-27",
               "Hora": "14:29:50",
               "Numero": "13048238",
               "Servicio": "PublicPersons.deleteReference",
               "Requerimiento": "1",
               "Canal": "BTDIGITAL"
            },
            "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
         }
      },
      "_xmlns:SOAP-ENV": "http://schemas.xmlsoap.org/soap/envelope/",
      "_xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      "_xmlns:SOAP-ENC": "http://schemas.xmlsoap.org/soap/encoding/",
      "_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
   }
}```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
