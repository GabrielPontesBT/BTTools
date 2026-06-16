---
title: Get Insurances
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los seguros disponibles de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.getInsurances

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0023

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
productGUID | String $<(length: 36)>$ | GUID (identificador único global) del producto.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
insurances | [SdtsBTLOWInsuranceDefinition](#sdtsbtlowinsurancedefinition) | Listado de seguros.

@tab Errores

Código | Descripción
:--------- | :-----------
120050009 | Debe ingresar el GUID de producto.
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
    "Token": "15A37FA9852954F6770E9868"
  },
  "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
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
    "Token": "15A37FA9852954F6770E9868"
  },
  "insurances": {
    "insurance": [
      {
        "InsuranceId": 1,
        "InsuranceDescription": "SEGURO DE VIDA",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 12,
        "InsuranceCompanyDescription": "ASEGURADORA REGIONAL",
        "Enabled": true,
        "AllowsModification": true,
        "UsesBoard": false,
        "BoardId": 0,
        "BoardPercentage": "0.000000",
        "BoardFixedAmount": "0.00000",
        "FixedPercentage": "0.005000",
        "FixedAmount": "0.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "K"
      },
      {
        "InsuranceId": 2,
        "InsuranceDescription": "SEGURO VIDA",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 1,
        "InsuranceCompanyDescription": "BANCO DE SEGUROS DEL ESTADO",
        "Enabled": false,
        "AllowsModification": true,
        "UsesBoard": false,
        "BoardId": 0,
        "BoardPercentage": "0.000000",
        "BoardFixedAmount": "0.00000",
        "FixedPercentage": "0.000000",
        "FixedAmount": "500.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "I"
      },
      {
        "InsuranceId": 8,
        "InsuranceDescription": "SEGURO DE VIDA CUOTAS",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 5,
        "InsuranceCompanyDescription": "ALIANZA SEGUROS",
        "Enabled": false,
        "AllowsModification": true,
        "UsesBoard": true,
        "BoardId": 30,
        "BoardPercentage": "0.500000",
        "BoardFixedAmount": "10.00000",
        "FixedPercentage": "0.500000",
        "FixedAmount": "10.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "S"
      },
      {
        "InsuranceId": 5,
        "InsuranceDescription": "SEGURO DE VIDA EN DESEMBOLSO",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 1,
        "InsuranceCompanyDescription": "BANCO DE SEGUROS DEL ESTADO",
        "Enabled": false,
        "AllowsModification": true,
        "UsesBoard": true,
        "BoardId": 10,
        "BoardPercentage": "0.500000",
        "BoardFixedAmount": "100.00000",
        "FixedPercentage": "0.500000",
        "FixedAmount": "100.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "I"
      },
      {
        "InsuranceId": 50,
        "InsuranceDescription": "ALIANZA VIDA ANTICIPADO",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 5,
        "InsuranceCompanyDescription": "ALIANZA SEGUROS",
        "Enabled": false,
        "AllowsModification": true,
        "UsesBoard": false,
        "BoardId": 0,
        "BoardPercentage": "0.000000",
        "BoardFixedAmount": "0.00000",
        "FixedPercentage": "0.565000",
        "FixedAmount": "45.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "K"
      },
      {
        "InsuranceId": 3,
        "InsuranceDescription": "XXXVIDA",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 5,
        "InsuranceCompanyDescription": "ALIANZA SEGUROS",
        "Enabled": false,
        "AllowsModification": false,
        "UsesBoard": false,
        "BoardId": 0,
        "BoardPercentage": "0.000000",
        "BoardFixedAmount": "0.00000",
        "FixedPercentage": "0.050000",
        "FixedAmount": "0.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "S"
      },
      {
        "InsuranceId": 4,
        "InsuranceDescription": "SEGURO VIDA ALIANZA",
        "InsuranceTypeId": 1,
        "InsuranceTypeDescription": "VIDA",
        "InsuranceCompanyId": 5,
        "InsuranceCompanyDescription": "ALIANZA SEGUROS",
        "Enabled": false,
        "AllowsModification": true,
        "UsesBoard": false,
        "BoardId": 0,
        "BoardPercentage": "0.000000",
        "BoardFixedAmount": "0.00000",
        "FixedPercentage": "1.250000",
        "FixedAmount": "100.00000",
        "ManagesExtraPremium": false,
        "ChargeType": "V"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-03",
    "Hora": "17:35:55",
    "Numero": 13568708,
    "Servicio": "PublicLoanParameters.getInsurances",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWInsuranceDefinition

### SdtsBTLOWInsuranceDefinition

::: center
Los campos del tipo de dato estructurado SdtsBTLOWInsuranceDefinition son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AllowsModification | Boolean $<(length: 1)>$ | Permite modificación.
BoardFixedAmount | Double $<(length: 18)>$ | Monto fijo de pizarra.
BoardId | Int $<(length: 5)>$ | Identificador de pizarra.
BoardPercentage | Double $<(length: 11)>$ | Porcentaje de pizarra.
ChargeType | String $<(length: 1)>$ | Tipo de cargo (K: Porcentaje sobre capital inicial, I: Importe fijo, S: Porcentaje sobre saldo previsto de capital, V: Cálculo sobre valor comercial).
Enabled | Boolean $<(length: 1)>$ | Habilitado.
FixedAmount | Double $<(length: 18)>$ | Monto fijo.
FixedPercentage | Double $<(length: 11)>$ | Porcentaje fijo.
InsuranceCompanyId | Int $<(length: 5)>$ | Identificador de compañía aseguradora.
InsuranceCompanyDescription | String $<(length: 40)>$ | Descripción de compañía aseguradora.
InsuranceId | Int $<(length: 9)>$ | Identificador de seguro.
InsuranceDescription | String $<(length: 40)>$ | Descripción del seguro.
InsuranceTypeId | Int $<(length: 5)>$ | Identificador del tipo de seguro.
InsuranceTypeDescription | String $<(length: 40)>$ | Descripción del tipo de seguro.
ManagesExtraPremium | Boolean | Gestiona prima adicional.
UsesBoard | Boolean $<(length: 1)>$ | Usa pizarra.
:::
<!-- CIERRA SDT -->
