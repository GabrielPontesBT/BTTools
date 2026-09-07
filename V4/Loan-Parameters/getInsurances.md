---
title: Insurances
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener los seguros disponibles de un producto de préstamos.

**Nombre publicación:** PublicLoanParameters.insurances

**Programa:** PublicAPI.BTLOPA0023

**Alcance:** Global

**Endpoint:** /public/LoanParameters/v1/insurances
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
productGUID | String $<(Length: 36)>$ | GUID (identificador único global) del producto.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
insurances | [insurance](#insurance) | Listado de seguros.

@tab Errores

Código | Descripción
:--------- | :---------
120050009 | Debe ingresar el GUID de producto.

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/LoanParameters/v1/insurances?productGUID=bf0d7e10-dce6-4bd4-b866-9984556613ec' \
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
  "insurances": {
    "insurance": [
      {
        "insuranceId": 1,
        "insuranceDescription": "SEGURO 1",
        "enabled": true,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 12,
        "insuranceCompanyDescription": "ASEGURADORA REGIONAL",
        "allowsModification": true,
        "usesBoard": false,
        "boardId": 0,
        "boardPercentage": "0.000000",
        "boardFixedAmount": "0.00",
        "fixedPercentage": "0.100000",
        "fixedAmount": "0.00",
        "managesExtraPremium": false,
        "chargeType": "S"
      },
      {
        "insuranceId": 2,
        "insuranceDescription": "SEGURO VIDA",
        "enabled": false,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 1,
        "insuranceCompanyDescription": "BANCO DE SEGUROS DEL ESTADO",
        "allowsModification": false,
        "usesBoard": false,
        "boardId": 0,
        "boardPercentage": "0.000000",
        "boardFixedAmount": "0.00",
        "fixedPercentage": "0.200000",
        "fixedAmount": "0.00",
        "managesExtraPremium": false,
        "chargeType": "S"
      },
      {
        "insuranceId": 8,
        "insuranceDescription": "SEGURO DE VIDA CUOTAS",
        "enabled": false,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 5,
        "insuranceCompanyDescription": "ALIANZA SEGUROS",
        "allowsModification": true,
        "usesBoard": true,
        "boardId": 30,
        "boardPercentage": "0.500000",
        "boardFixedAmount": "10.00",
        "fixedPercentage": "0.500000",
        "fixedAmount": "10.00",
        "managesExtraPremium": false,
        "chargeType": "S"
      },
      {
        "insuranceId": 5,
        "insuranceDescription": "SEGURO DE VIDA EN DESEMBOLSO",
        "enabled": false,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 1,
        "insuranceCompanyDescription": "BANCO DE SEGUROS DEL ESTADO",
        "allowsModification": true,
        "usesBoard": true,
        "boardId": 10,
        "boardPercentage": "0.000000",
        "boardFixedAmount": "0.00",
        "fixedPercentage": "0.000000",
        "fixedAmount": "0.00",
        "managesExtraPremium": false,
        "chargeType": "I"
      },
      {
        "insuranceId": 50,
        "insuranceDescription": "ALIANZA VIDA ANTICIPADO",
        "enabled": false,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 5,
        "insuranceCompanyDescription": "ALIANZA SEGUROS",
        "allowsModification": true,
        "usesBoard": false,
        "boardId": 0,
        "boardPercentage": "0.000000",
        "boardFixedAmount": "0.00",
        "fixedPercentage": "0.565000",
        "fixedAmount": "45.00",
        "managesExtraPremium": false,
        "chargeType": "K"
      },
      {
        "insuranceId": 3,
        "insuranceDescription": "XXXVIDA",
        "enabled": false,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 5,
        "insuranceCompanyDescription": "ALIANZA SEGUROS",
        "allowsModification": false,
        "usesBoard": false,
        "boardId": 0,
        "boardPercentage": "0.000000",
        "boardFixedAmount": "0.00",
        "fixedPercentage": "0.050000",
        "fixedAmount": "0.00",
        "managesExtraPremium": false,
        "chargeType": "S"
      },
      {
        "insuranceId": 4,
        "insuranceDescription": "SEGURO VIDA ALIANZA",
        "enabled": false,
        "insuranceTypeId": 1,
        "insuranceTypeDescription": "VIDA",
        "insuranceCompanyId": 5,
        "insuranceCompanyDescription": "ALIANZA SEGUROS",
        "allowsModification": true,
        "usesBoard": false,
        "boardId": 0,
        "boardPercentage": "0.000000",
        "boardFixedAmount": "0.00",
        "fixedPercentage": "1.250000",
        "fixedAmount": "100.00",
        "managesExtraPremium": false,
        "chargeType": "V"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details insurance

### insurance

::: center
Los campos del tipo de dato estructurado insurance son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
allowsModification | Boolean | ¿Permite modificación?
boardFixedAmount | Double $<(Length: 18.2)>$ | Monto fijo de pizarra.
boardId | Int $<(Length: 5)>$ | Identificador de pizarra.
boardPercentage | Double $<(Length: 11.6)>$ | Porcentaje de pizarra.
chargeType | String $<(Length: 1)>$ | Tipo de cargo (K: Porcentaje sobre capital inicial, I: Importe fijo, S: Porcentaje sobre saldo previsto de capital, V: Cálculo sobre valor comercial).
enabled | Boolean | ¿Está habilitado?
fixedAmount | Double $<(Length: 18.2)>$ | Monto fijo.
fixedPercentage | Double $<(Length: 11.6)>$ | Porcentaje fijo.
insuranceCompanyId | Int $<(Length: 5)>$ | Identificador de compañía aseguradora.
insuranceCompanyDescription | String $<(Length: 40)>$ | Descripción de compañía aseguradora.
insuranceId | Int $<(Length: 9)>$ | Identificador de seguro.
insuranceDescription | String $<(Length: 40)>$ | Descripción del seguro.
insuranceTypeId | Int $<(Length: 5)>$ | Identificador del tipo de seguro.
insuranceTypeDescription | String $<(Length: 40)>$ | Descripción del tipo de seguro.
managesExtraPremium | Boolean | ¿Gestiona prima adicional?
usesBoard | Boolean | ¿Usa pizarra?
:::
<!-- CIERRA SDT -->