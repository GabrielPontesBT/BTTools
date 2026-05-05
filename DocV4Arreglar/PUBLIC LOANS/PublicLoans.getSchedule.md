title: Obtener Cronograma del Préstamo
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
::: note Método para obtener el cronograma de cuotas de un préstamo.

**Nombre publicación:** PublicLoans.getSchedule

**Módulo:** Loans.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
LoanGUID | String | Identificador único del préstamo.
queryDate | DateTime | Fecha de consulta.
includePayments | Boolean | Indica si se incluyen pagos realizados.
includeFuturePayments | Boolean | Indica si se incluyen pagos futuros.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
installments | List | Lista de cuotas del préstamo.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicLoans_v1?getSchedule' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "44C6368888A1E1ECA6656D04"
  },
  "LoanGUID": "c031c219-f16d-40b2-80a9-b7b56ac14ba4",
  "queryDate": "2027-02-03 00:00:00.000",
  "includePayments": {},
  "includeFuturePayments": {}
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
    "Token": "44C6368888A1E1ECA6656D04"
  },
  "installments": "",
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-02-10",
    "Hora": "14:59:13",
    "Numero": "13100647",
    "Servicio": "PublicLoans.getSchedule",
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
::: details includePayments

### includePayments

::: center
Los campos del tipo de dato estructurado includePayments son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->

<!-- ABRE SDT -->
::: details includeFuturePayments

### includeFuturePayments

::: center
Los campos del tipo de dato estructurado includeFuturePayments son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
:::
<!-- CIERRA SDT -->
