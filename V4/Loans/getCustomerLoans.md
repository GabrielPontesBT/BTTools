---
title: Customer Loans
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los préstamos de una contraparte.

**Nombre publicación:** PublicLoans.customerLoans

**Programa:** PublicAPI.BTLOPA0001

**Alcance:** Global

**Endpoint:** /public/Loans/v1/customerLoans
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
cancelledLoans | Boolean | Incluir préstamos cancelados.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
customerLoans | [customerLoan](#customerloan) | Listado de préstamos del cliente.

@tab Errores

Código | Descripción
:--------- | :---------
40050100 | Debe ingresar el GUID de contraparte.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/customerLoans?counterpartyGUID=45399742-1326-4d8d-b7c8-10eb4cf976b0&cancelledLoans=false' \
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
  "customerLoans": {
    "customerLoan": [
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-12-08",
        "firstUnpaidDate": "2025-01-08",
        "installmentPeriodicity": 30,
        "installmentValue": 5544.14,
        "interestRate": 23,
        "loanGUID": "d59d0a0b-ff0e-4264-a425-c8dc87027c0a",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "COMPRA DE VIVIENDA",
          "productGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 699,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2030-07-08",
        "firstUnpaidDate": "2027-05-10",
        "installmentPeriodicity": 30,
        "installmentValue": 3203.86,
        "interestRate": 23,
        "loanGUID": "ceec5783-b363-4263-afe6-62387c8f72d8",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "COMPRA DE VIVIENDA",
          "productGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 1795,
        "totalPaidInstallments": 0,
        "valueDate": "2025-08-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2028-02-08",
        "firstUnpaidDate": "2027-04-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9703.77,
        "interestRate": 23,
        "loanGUID": "973d2029-da60-45f2-9edc-7feede4e4933",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "COMPRA DE VIVIENDA",
          "productGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 347,
        "totalPaidInstallments": 0,
        "valueDate": "2027-02-26"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 90,
        "branchDescription": "TESORERIA",
        "expirationDate": "2028-06-08",
        "firstUnpaidDate": "2027-07-08",
        "installmentPeriodicity": 30,
        "installmentValue": 11117.26,
        "interestRate": 23,
        "loanGUID": "83cc0e94-5115-482b-aeb9-0934a38e5905",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "REFACCIÓN DE VIVIENDA",
          "productGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 360,
        "totalPaidInstallments": 0,
        "valueDate": "2027-06-14"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 90,
        "branchDescription": "TESORERIA",
        "expirationDate": "2028-06-08",
        "firstUnpaidDate": "2027-07-08",
        "installmentPeriodicity": 30,
        "installmentValue": 11117.26,
        "interestRate": 23,
        "loanGUID": "bdde1d9a-bdd5-4490-a3e4-02de8d7f35e7",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "REFACCIÓN DE VIVIENDA",
          "productGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 360,
        "totalPaidInstallments": 0,
        "valueDate": "2027-06-14"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-03",
        "firstUnpaidDate": "2025-02-03",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "00000000-0000-0000-0000-000000000000",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-03"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-08",
        "firstUnpaidDate": "2025-02-08",
        "installmentPeriodicity": 30,
        "installmentValue": 14597,
        "interestRate": 12.65,
        "loanGUID": "5f13d91d-9b48-4213-81ac-24a82adabcfe",
        "originalAmount": 150000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-08",
        "firstUnpaidDate": "2025-08-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "12f8c706-d176-4192-8328-f55e24eebd7f",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-08",
        "firstUnpaidDate": "2025-02-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "55c87436-4af6-49e2-a38d-b2c215dd86f5",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-08",
        "firstUnpaidDate": "2025-02-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "67eeeb62-b0d0-4736-9d22-c32750cc26d5",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-08",
        "firstUnpaidDate": "2025-11-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "58c6f0bc-4fec-432f-8761-fed37347f296",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2025-10-08",
        "firstUnpaidDate": "2025-04-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "2a06e957-94e3-4138-8208-6739ee89c5a7",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 273,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-01-08",
        "firstUnpaidDate": "2025-02-08",
        "installmentPeriodicity": 30,
        "installmentValue": 9985,
        "interestRate": 12.65,
        "loanGUID": "7d0636ce-a6d0-48f0-b772-bf2ee17f4fbc",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 365,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "installmentPeriodicity": 30,
        "installmentValue": 15071,
        "interestRate": 20,
        "loanGUID": "1766f6a9-c7e9-4ecf-8ae5-8202ad150377",
        "originalAmount": 151952,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 0,
        "totalPaidInstallments": 0,
        "valueDate": "2025-07-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-07-12",
        "installmentPeriodicity": 30,
        "installmentValue": 12366,
        "interestRate": 20,
        "loanGUID": "93faa6b6-360c-4204-89e4-318ce69d0533",
        "originalAmount": 122013,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 364,
        "totalPaidInstallments": 0,
        "valueDate": "2025-07-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-02-12",
        "installmentPeriodicity": 30,
        "installmentValue": 14376,
        "interestRate": 20,
        "loanGUID": "fdccf226-40f1-4fa2-8181-34fcb2849192",
        "originalAmount": 135000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 372,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-31"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-02-12",
        "firstUnpaidDate": "2025-03-12",
        "installmentPeriodicity": 30,
        "installmentValue": 12915,
        "interestRate": 20,
        "loanGUID": "f0ff0277-fcf9-4f38-a89a-1d8c2003e131",
        "originalAmount": 120000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 372,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-31"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 6,
        "amortizationTypeDescription": "FLEXIBLE",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-04-30",
        "firstUnpaidDate": "2025-12-01",
        "installmentPeriodicity": 30,
        "installmentValue": 0,
        "interestRate": 50,
        "loanGUID": "2f7e42b0-1a78-4176-aa36-e16736e76db3",
        "originalAmount": 35000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "FLEXIBLE",
          "productGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 360,
        "totalPaidInstallments": 0,
        "valueDate": "2025-11-01"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 6,
        "amortizationTypeDescription": "FLEXIBLE",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-09-01",
        "firstUnpaidDate": "2025-12-01",
        "installmentPeriodicity": 30,
        "installmentValue": 0,
        "interestRate": 50,
        "loanGUID": "da0fcba1-fe81-41d9-bcbf-38bacb11d610",
        "originalAmount": 15000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "FLEXIBLE",
          "productGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 608,
        "totalPaidInstallments": 0,
        "valueDate": "2025-11-01"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2026-11-03",
        "firstUnpaidDate": "2025-12-03",
        "installmentPeriodicity": 30,
        "installmentValue": 11924,
        "interestRate": 65,
        "loanGUID": "34c58bac-a09f-4708-9385-577d104d361c",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 360,
        "totalPaidInstallments": 0,
        "valueDate": "2025-11-03"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 6,
        "amortizationTypeDescription": "FLEXIBLE",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2027-12-26",
        "firstUnpaidDate": "2027-03-26",
        "installmentPeriodicity": 30,
        "installmentValue": 0,
        "interestRate": 50,
        "loanGUID": "282dc866-872c-428e-8f01-cdcc3c41b255",
        "originalAmount": 50000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "FLEXIBLE",
          "productGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 300,
        "totalPaidInstallments": 0,
        "valueDate": "2027-02-26"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2028-12-31",
        "firstUnpaidDate": "2027-08-01",
        "installmentPeriodicity": 30,
        "installmentValue": 8308,
        "interestRate": 60,
        "loanGUID": "18ad145f-c779-4213-a92d-60b45e9ceabe",
        "originalAmount": 100000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 630,
        "totalPaidInstallments": 0,
        "valueDate": "2027-03-31"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2028-01-12",
        "firstUnpaidDate": "2027-07-12",
        "installmentPeriodicity": 30,
        "installmentValue": 1393,
        "interestRate": 20,
        "loanGUID": "6dac0e4a-d922-4c66-be3d-b75a7e72aa67",
        "originalAmount": 1000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "PRÉSTAMO PERSONAL",
          "productGUID": "204db26d-f2f0-453e-b167-2b8496fc6cca"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 214,
        "totalPaidInstallments": 0,
        "valueDate": "2027-06-12"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2028-07-12",
        "firstUnpaidDate": "2027-08-12",
        "installmentPeriodicity": 30,
        "installmentValue": 208,
        "interestRate": 20,
        "loanGUID": "86c79e9c-4d46-4125-8c41-87c5d6384828",
        "originalAmount": 1000,
        "product": {
          "currencyId": 2225,
          "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
          "currencySign": "U$D",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "PRÉSTAMO PERSONAL",
          "productGUID": "2513af07-a65c-4454-b907-855940e08727"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 394,
        "totalPaidInstallments": 0,
        "valueDate": "2027-06-14"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 90,
        "branchDescription": "TESORERIA",
        "expirationDate": "2028-07-15",
        "firstUnpaidDate": "2027-09-15",
        "installmentPeriodicity": 30,
        "installmentValue": 11587,
        "interestRate": 57.5,
        "loanGUID": "a10f0422-09ce-4015-a95b-cb4a8a98b6d8",
        "originalAmount": 101680,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "ADELANTO SOBRE SUELDOS",
          "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 360,
        "totalPaidInstallments": 0
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1000,
        "branchDescription": "Sucursa demo",
        "expirationDate": "2026-01-12",
        "firstUnpaidDate": "2025-02-12",
        "installmentPeriodicity": 30,
        "installmentValue": 303,
        "interestRate": 20,
        "loanGUID": "51b4f3d7-2976-4e1a-bb03-545ad05e219e",
        "originalAmount": 1000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "PRUEBA FACUNDO",
          "productGUID": "f78f8edd-f2dd-473c-a20f-bc6416ec85e7"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 364,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1000,
        "branchDescription": "Sucursa demo",
        "expirationDate": "2026-01-12",
        "firstUnpaidDate": "2025-03-12",
        "installmentPeriodicity": 30,
        "installmentValue": 303,
        "interestRate": 20,
        "loanGUID": "de747bbb-8596-4b84-9cd4-7e4663a22a24",
        "originalAmount": 1000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "PRUEBA FACUNDO",
          "productGUID": "f78f8edd-f2dd-473c-a20f-bc6416ec85e7"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 364,
        "totalPaidInstallments": 0,
        "valueDate": "2025-01-08"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2027-10-30",
        "firstUnpaidDate": "2027-07-17",
        "installmentPeriodicity": 7,
        "installmentValue": 1309,
        "interestRate": 18.5,
        "loanGUID": "d1320758-1d85-4a3d-ae62-30d44165691d",
        "originalAmount": 12600,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "GRUPALES",
          "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 110,
        "totalPaidInstallments": 0,
        "valueDate": "2027-07-10"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 1,
        "branchDescription": "Sucursal Beta",
        "expirationDate": "2028-03-22",
        "firstUnpaidDate": "2027-12-08",
        "installmentPeriodicity": 7,
        "installmentValue": 659,
        "interestRate": 7,
        "loanGUID": "ba5c739b-2a47-4010-b72f-c995985e6da7",
        "originalAmount": 10000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "GRUPALES",
          "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 111,
        "totalPaidInstallments": 0,
        "valueDate": "2027-12-01"
      },
      {
        "accountBalance": -100000,
        "amortizationTypeId": 3,
        "amortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
        "branchId": 91,
        "branchDescription": "TESORERIA BONOS",
        "expirationDate": "2027-07-06",
        "firstUnpaidDate": "2027-04-20",
        "installmentPeriodicity": 7,
        "installmentValue": 3127,
        "interestRate": 15,
        "loanGUID": "765fb997-7172-4931-b7be-3623f6bc5e58",
        "originalAmount": 30000,
        "product": {
          "currencyId": 0,
          "currencyDescription": "Pesos Uruguayos",
          "currencySign": "$",
          "kindId": 0,
          "kindDescription": "Billete",
          "productDescription": "GRUPALES",
          "productGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec"
        },
        "statusId": 0,
        "statusDescription": "Normal",
        "term": 83,
        "totalPaidInstallments": 0,
        "valueDate": "2027-04-13"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details customerLoan

### customerLoan

::: center
Los campos del tipo de dato estructurado customerLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
accountBalance | Double $<(Length: 18.2)>$ | Saldo contable.
amortizationTypeId | Byte $<(Length: 2)>$ | Identificador del tipo de amortización.
amortizationTypeDescription | String $<(Length: 30)>$ | Descripción del tipo de amortización.
branchId | Int $<(Length: 5)>$ | Identificador de sucursal.
branchDescription | String $<(Length: 30)>$ | Descripción de sucursal.
dateOfLastTotalPayment | Date $<(Length: 8)>$ | Fecha del último pago total.
expirationDate | Date $<(Length: 8)>$ | Fecha de vencimiento.
firstUnpaidDate | Date $<(Length: 8)>$ | Fecha del primer impago.
installmentCount | Int $<(Length: 5)>$ | Número de cuotas.
installmentPeriodicity | Int $<(Length: 5)>$ | Periodicidad de cuotas.
installmentValue | Double $<(Length: 18.2)>$ | Valor de la cuota.
interestRate | Double $<(Length: 11.6)>$ | Tasa de interés.
loanGUID | String $<(Length: 36)>$ | GUID (identificador único global) del préstamo.
originalAmount | Double $<(Length: 18.2)>$ | Monto original.
product | [product](#product) | Producto.
statusId | Short $<(Length: 4)>$ | Identificador de estado.
statusDescription | String $<(Length: 30)>$ | Descripción del estado.
term | Int $<(Length: 5)>$ | Plazo.
totalPaidInstallments | Int $<(Length: 5)>$ | Total de cuotas pagadas.
valueDate | Date $<(Length: 8)>$ | Fecha valor.
:::

::: details product

### product

::: center
Los campos del tipo de dato estructurado product son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
currencyId | Short $<(Length: 4)>$ | Identificador de moneda.
currencyDescription | String $<(Length: 30)>$ | Descripción de moneda.
currencySign | String $<(Length: 5)>$ | Signo de moneda.
kindId | Int $<(Length: 6)>$ | Identificador del papel.
kindDescription | String $<(Length: 30)>$ | Descripción del papel.
productDescription | String $<(Length: 30)>$ | Descripción del producto.
productGUID | String $<(Length: 36)>$ | Identificador único global (GUID) del producto.
:::
<!-- CIERRA SDT -->
