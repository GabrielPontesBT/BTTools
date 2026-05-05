---
title: Obtener Cantidad de Cuotas de Préstamo
backtotop: false
breadcrumb: false
comment: false
contributors: false
editLink: false
footer: false
lastUpdated: false
next: false
pageInfo: false
prev: false
toc: false
---

<!-- ABRE DATOS DEL MÉTODO -->
```
::: note Método para obtener los parámetros de cantidad de cuotas
permitidas para un producto de préstamo.

**Nombre publicación:** PublicLoanParameters.getInstallmentCount

**Módulo:** Loans.PublicApi

**Programa:** (No informado)

**Alcance:** Global ::: 

<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->

::: tabs #Datos

@tab Datos de Entrada

  Nombre        Tipo     Comentarios
  ------------- -------- -----------------------------------------------
  productGUID   String   Identificador único del producto de préstamo.

@tab Datos de Salida

  Nombre         Tipo      Comentarios
  -------------- --------- ---------------------------------------
  minimum        Integer   Cantidad mínima de cuotas permitidas.
  maximum        Integer   Cantidad máxima de cuotas permitidas.
  defaultValue   Integer   Cantidad de cuotas por defecto.

@tab Errores

  Código   Descripción
  -------- -------------

<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación ::: code-tabs #Formato
@tab JSON

``` json
{
   "Envelope": {
      "Header": {},
      "Body": {
         "PublicLoanParameters.getInstallmentCount": {
            "Btinreq": {
               "Canal": "BTDIGITAL",
               "Usuario": "INSTALADOR",
               "Device": "FPAIS",
               "Requerimiento": "1",
               "Token": "2D1403054D971EFC20DA5E8F"
            },
            "productGUID": {
               "__text": "d6328022-6f93-4afc-b59b-a29f435aba41"
            }
         }
      },
      "_xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "_xmlns:bts": "http://uy.com.dlya.bantotal/BTSOA/"
   }
}
```
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->

::: details Ejemplo de Respuesta ::: code-tabs #Formato
@tab JSON

``` json
{
   "Envelope": {
      "Body": {
         "PublicLoanParameters.getInstallmentCountResponse": {
            "Btinreq": {
               "Canal": "BTDIGITAL",
               "Usuario": "INSTALADOR",
               "Device": "FPAIS",
               "Requerimiento": "1",
               "Token": "2D1403054D971EFC20DA5E8F"
            },
            "minimum": "6",
            "maximum": "240",
            "defaultValue": "12",
            "BusinessErrors": "",
            "Btoutreq": {
               "Estado": "OK",
               "Fecha": "2026-02-11",
               "Hora": "12:34:43",
               "Numero": "13106738",
               "Servicio": "PublicLoanParameters.getInstallmentCount",
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
}
```

:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->