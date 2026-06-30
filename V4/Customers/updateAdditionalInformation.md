---
title: Update Additional Information
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para actualizar la información adicional de una contraparte.

**Nombre publicación:** PublicCustomers.updateAdditionalInformation

**Módulo:** Customers

**Programa:** PublicAPI.BTCPPA0004

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.


@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
customFields | [SdtsBTPAWCustomField](#sdtsbtpawcustomfield) | Listado de campos personalizados.

@tab Datos de Salida

No aplica.

@tab Errores

Código | Descripción
:--------- | :-----------
90046 | El código de sector ingresado no existe
40010151 | La actividad no existe
40020006 | Contraparte no existe
40020012 | El número de contraparte no existe
40050001 | Debe ingresar el GUID de persona.
50020018 | El país no se encuentra registrado
50050003 | No se encuentra la empresa
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
    "Token": "444B674391BCA7676279700A"
  },
  "counterpartyGUID": "45399742-1326-4d8d-b7c8-10eb4cf976b0",
  "customFields": {
    "customField": [
      {
        "Correlative": 1,
        "Id": "CAMPO1",
        "Description": "DATO PRUEBA 2",
        "Value": "VALOR PRUEBA 2"
      }
    ]
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
    "Token": "444B674391BCA7676279700A"
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "16:14:35",
    "Numero": 13468820,
    "Servicio": "PublicCustomers.updateAdditionalInformation",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPAWCustomField

### SdtsBTPAWCustomField

::: center
Los campos del tipo de dato estructurado SdtsBTPAWCustomField son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Correlative | Short | Correlativo.
Id | String $<(Length: 30)>$ | Identificador.
Description | String $<(Length: 50)>$ | Descripción.
Value | String $<(Length: 250)>$ | Value.
:::
<!-- CIERRA SDT -->
