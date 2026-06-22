---
title: Get Customer Loans
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los préstamos de una contraparte.

**Nombre publicación:** PublicLoans.getCustomerLoans

**Módulo:** Loans

**Programa:** PublicAPI.BTLOPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
counterpartyGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la contraparte.
cancelledLoans | Boolean | Incluir préstamos cancelados.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
customerLoans | [SdtsBTLOWCustomerLoan](#sdtsbtlowcustomerloan) | Listado de préstamos del cliente.

@tab Errores

Código | Descripción
:--------- | :-----------
40050100 | Debe ingresar el GUID de contraparte.
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
  "cancelledLoans": false
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
    "Token": "TOKEN_AQUI"
  },
  "customerLoans": {
    "customerLoan": [
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "d6328022-6f93-4afc-b59b-a29f435aba41",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "COMPRA DE VIVIENDA",
                "CurrencyId": 0
            },
            "Term": 699,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 24,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 5544.14,
            "ExpirationDate": "2026-12-08",
            "FirstUnpaidDate": "2025-01-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "d59d0a0b-ff0e-4264-a425-c8dc87027c0a",
            "InterestRate": 23.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "d6328022-6f93-4afc-b59b-a29f435aba41",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "COMPRA DE VIVIENDA",
                "CurrencyId": 0
            },
            "Term": 1795,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 60,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 3203.86,
            "ExpirationDate": "2030-07-08",
            "FirstUnpaidDate": "2027-05-10",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-08-08",
            "StatusId": 0,
            "LoanGUID": "ceec5783-b363-4263-afe6-62387c8f72d8",
            "InterestRate": 23.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "d6328022-6f93-4afc-b59b-a29f435aba41",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "COMPRA DE VIVIENDA",
                "CurrencyId": 0
            },
            "Term": 347,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9703.77,
            "ExpirationDate": "2028-02-08",
            "FirstUnpaidDate": "2027-04-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-02-26",
            "StatusId": 0,
            "LoanGUID": "973d2029-da60-45f2-9edc-7feede4e4933",
            "InterestRate": 23.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "REFACCIÓN DE VIVIENDA",
                "CurrencyId": 0
            },
            "Term": 360,
            "BranchId": 90,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 11117.26,
            "ExpirationDate": "2028-06-08",
            "FirstUnpaidDate": "2027-07-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-06-14",
            "StatusId": 0,
            "LoanGUID": "83cc0e94-5115-482b-aeb9-0934a38e5905",
            "InterestRate": 23.0,
            "BranchDescription": "TESORERIA"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "REFACCIÓN DE VIVIENDA",
                "CurrencyId": 0
            },
            "Term": 360,
            "BranchId": 90,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 11117.26,
            "ExpirationDate": "2028-06-08",
            "FirstUnpaidDate": "2027-07-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-06-14",
            "StatusId": 0,
            "LoanGUID": "bdde1d9a-bdd5-4490-a3e4-02de8d7f35e7",
            "InterestRate": 23.0,
            "BranchDescription": "TESORERIA"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2026-01-03",
            "FirstUnpaidDate": "2025-02-03",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-03",
            "StatusId": 0,
            "LoanGUID": "00000000-0000-0000-0000-000000000000",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 150000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 14597.0,
            "ExpirationDate": "2026-01-08",
            "FirstUnpaidDate": "2025-02-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "5f13d91d-9b48-4213-81ac-24a82adabcfe",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2026-01-08",
            "FirstUnpaidDate": "2025-08-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "12f8c706-d176-4192-8328-f55e24eebd7f",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2026-01-08",
            "FirstUnpaidDate": "2025-02-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "55c87436-4af6-49e2-a38d-b2c215dd86f5",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2026-01-08",
            "FirstUnpaidDate": "2025-02-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "67eeeb62-b0d0-4736-9d22-c32750cc26d5",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2026-01-08",
            "FirstUnpaidDate": "2025-11-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "58c6f0bc-4fec-432f-8761-fed37347f296",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 273,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 9,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2025-10-08",
            "FirstUnpaidDate": "2025-04-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "2a06e957-94e3-4138-8208-6739ee89c5a7",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 365,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 9985.0,
            "ExpirationDate": "2026-01-08",
            "FirstUnpaidDate": "2025-02-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "7d0636ce-a6d0-48f0-b772-bf2ee17f4fbc",
            "InterestRate": 12.65,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 0,
            "BranchId": 1,
            "OriginalAmount": 151952.0,
            "NumberOfInstallments": 0,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 15071.0,
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-07-08",
            "StatusId": 0,
            "LoanGUID": "1766f6a9-c7e9-4ecf-8ae5-8202ad150377",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 364,
            "BranchId": 1,
            "OriginalAmount": 122013.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 12366.0,
            "ExpirationDate": "2026-07-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-07-08",
            "StatusId": 0,
            "LoanGUID": "93faa6b6-360c-4204-89e4-318ce69d0533",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 372,
            "BranchId": 1,
            "OriginalAmount": 135000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 14376.0,
            "ExpirationDate": "2026-02-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-31",
            "StatusId": 0,
            "LoanGUID": "fdccf226-40f1-4fa2-8181-34fcb2849192",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 372,
            "BranchId": 1,
            "OriginalAmount": 120000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 12915.0,
            "ExpirationDate": "2026-02-12",
            "FirstUnpaidDate": "2025-03-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-31",
            "StatusId": 0,
            "LoanGUID": "f0ff0277-fcf9-4f38-a89a-1d8c2003e131",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "FLEXIBLE",
            "AmortizationTypeId": 6,
            "Product": {
                "ProductGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "FLEXIBLE",
                "CurrencyId": 0
            },
            "Term": 360,
            "BranchId": 1,
            "OriginalAmount": 35000.0,
            "NumberOfInstallments": 6,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 0.0,
            "ExpirationDate": "2026-04-30",
            "FirstUnpaidDate": "2025-12-01",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-11-01",
            "StatusId": 0,
            "LoanGUID": "2f7e42b0-1a78-4176-aa36-e16736e76db3",
            "InterestRate": 50.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "FLEXIBLE",
            "AmortizationTypeId": 6,
            "Product": {
                "ProductGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "FLEXIBLE",
                "CurrencyId": 0
            },
            "Term": 608,
            "BranchId": 1,
            "OriginalAmount": 15000.0,
            "NumberOfInstallments": 10,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 0.0,
            "ExpirationDate": "2026-09-01",
            "FirstUnpaidDate": "2025-12-01",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-11-01",
            "StatusId": 0,
            "LoanGUID": "da0fcba1-fe81-41d9-bcbf-38bacb11d610",
            "InterestRate": 50.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 360,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 11924.0,
            "ExpirationDate": "2026-11-03",
            "FirstUnpaidDate": "2025-12-03",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-11-03",
            "StatusId": 0,
            "LoanGUID": "34c58bac-a09f-4708-9385-577d104d361c",
            "InterestRate": 65.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "FLEXIBLE",
            "AmortizationTypeId": 6,
            "Product": {
                "ProductGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "FLEXIBLE",
                "CurrencyId": 0
            },
            "Term": 300,
            "BranchId": 1,
            "OriginalAmount": 50000.0,
            "NumberOfInstallments": 10,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 0.0,
            "ExpirationDate": "2027-12-26",
            "FirstUnpaidDate": "2027-03-26",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-02-26",
            "StatusId": 0,
            "LoanGUID": "282dc866-872c-428e-8f01-cdcc3c41b255",
            "InterestRate": 50.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 630,
            "BranchId": 1,
            "OriginalAmount": 100000.0,
            "NumberOfInstallments": 21,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 8308.0,
            "ExpirationDate": "2028-12-31",
            "FirstUnpaidDate": "2027-08-01",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-03-31",
            "StatusId": 0,
            "LoanGUID": "18ad145f-c779-4213-a92d-60b45e9ceabe",
            "InterestRate": 60.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "204db26d-f2f0-453e-b167-2b8496fc6cca",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "PRÉSTAMO PERSONAL",
                "CurrencyId": 0
            },
            "Term": 214,
            "BranchId": 1,
            "OriginalAmount": 1000.0,
            "NumberOfInstallments": 7,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 1393.0,
            "ExpirationDate": "2028-01-12",
            "FirstUnpaidDate": "2027-07-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-06-12",
            "StatusId": 0,
            "LoanGUID": "6dac0e4a-d922-4c66-be3d-b75a7e72aa67",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "2513af07-a65c-4454-b907-855940e08727",
                "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
                "KindDescription": "Billete",
                "CurrencySign": "U$D",
                "KindId": 0,
                "ProductDescription": "PRÉSTAMO PERSONAL",
                "CurrencyId": 2225
            },
            "Term": 394,
            "BranchId": 1,
            "OriginalAmount": 1000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 208.0,
            "ExpirationDate": "2028-07-12",
            "FirstUnpaidDate": "2027-08-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-06-14",
            "StatusId": 0,
            "LoanGUID": "86c79e9c-4d46-4125-8c41-87c5d6384828",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "ADELANTO SOBRE SUELDOS",
                "CurrencyId": 0
            },
            "Term": 360,
            "BranchId": 90,
            "OriginalAmount": 101680.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 11587.0,
            "ExpirationDate": "2028-07-15",
            "FirstUnpaidDate": "2027-09-15",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "StatusId": 0,
            "LoanGUID": "a10f0422-09ce-4015-a95b-cb4a8a98b6d8",
            "InterestRate": 57.5,
            "BranchDescription": "TESORERIA"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "f78f8edd-f2dd-473c-a20f-bc6416ec85e7",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "PRUEBA FACUNDO",
                "CurrencyId": 0
            },
            "Term": 364,
            "BranchId": 1000,
            "OriginalAmount": 1000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 303.0,
            "ExpirationDate": "2026-01-12",
            "FirstUnpaidDate": "2025-02-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "51b4f3d7-2976-4e1a-bb03-545ad05e219e",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursa demo"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "f78f8edd-f2dd-473c-a20f-bc6416ec85e7",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "PRUEBA FACUNDO",
                "CurrencyId": 0
            },
            "Term": 364,
            "BranchId": 1000,
            "OriginalAmount": 1000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 30,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 303.0,
            "ExpirationDate": "2026-01-12",
            "FirstUnpaidDate": "2025-03-12",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2025-01-08",
            "StatusId": 0,
            "LoanGUID": "de747bbb-8596-4b84-9cd4-7e4663a22a24",
            "InterestRate": 20.0,
            "BranchDescription": "Sucursa demo"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "GRUPALES",
                "CurrencyId": 0
            },
            "Term": 110,
            "BranchId": 1,
            "OriginalAmount": 12600.0,
            "NumberOfInstallments": 16,
            "InstallmentPeriodicity": 7,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 1309.0,
            "ExpirationDate": "2027-10-30",
            "FirstUnpaidDate": "2027-07-17",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-07-10",
            "StatusId": 0,
            "LoanGUID": "d1320758-1d85-4a3d-ae62-30d44165691d",
            "InterestRate": 18.5,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "GRUPALES",
                "CurrencyId": 0
            },
            "Term": 111,
            "BranchId": 1,
            "OriginalAmount": 10000.0,
            "NumberOfInstallments": 16,
            "InstallmentPeriodicity": 7,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 659.0,
            "ExpirationDate": "2028-03-22",
            "FirstUnpaidDate": "2027-12-08",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-12-01",
            "StatusId": 0,
            "LoanGUID": "ba5c739b-2a47-4010-b72f-c995985e6da7",
            "InterestRate": 7.0,
            "BranchDescription": "Sucursal Beta"
        },
        {
            "AmortizationTypeDescription": "AMORTIZABLE FRANCÉS (CONSTANTE TOTAL)",
            "AmortizationTypeId": 3,
            "Product": {
                "ProductGUID": "bf0d7e10-dce6-4bd4-b866-9984556613ec",
                "CurrencyDescription": "Pesos Uruguayos",
                "KindDescription": "Billete",
                "CurrencySign": "$",
                "KindId": 0,
                "ProductDescription": "GRUPALES",
                "CurrencyId": 0
            },
            "Term": 83,
            "BranchId": 91,
            "OriginalAmount": 30000.0,
            "NumberOfInstallments": 12,
            "InstallmentPeriodicity": 7,
            "TotalPaidInstallments": 0,
            "InstallmentValue": 3127.0,
            "ExpirationDate": "2027-07-06",
            "FirstUnpaidDate": "2027-04-20",
            "StatusDescription": "Normal",
            "AccountBalance": -100000.0,
            "ValueDate": "2027-04-13",
            "StatusId": 0,
            "LoanGUID": "765fb997-7172-4931-b7be-3623f6bc5e58",
            "InterestRate": 15.0,
            "BranchDescription": "TESORERIA BONOS"
        }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-01",
    "Hora": "00:00:00",
    "Numero": "00000000",
    "Servicio": "PublicLoans.getCustomerLoans",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTLOWCustomerLoan

### SdtsBTLOWCustomerLoan

::: center
Los campos del tipo de dato estructurado SdtsBTLOWCustomerLoan son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AccountBalance | Double $<(Length: 18)>$ | Saldo contable.
AmortizationTypeId | Byte | Identificador del tipo de amortización.
AmortizationTypeDescription | String | Descripción del tipo de amortización.
BranchId | Int | Identificador de sucursal.
BranchDescription | String | Descripción de sucursal.
DateOfLastTotalPayment | Date | Fecha del último pago total.
ExpirationDate | Date | Fecha de vencimiento.
FirstUnpaidDate | Date | Fecha del primer impago.
InstallmentPeriodicity | Int | Periodicidad de cuotas.
InstallmentValue | Double | Valor de la cuota.
InterestRate | Double | Tasa de interés.
LoanGUID | String | GUID (identificador único global) del préstamo.
NumberOfInstallments | Int | Número de cuotas.
OriginalAmount | Double | Monto original.
Product | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Producto.
StatusId | Short | Identificador de estado.
StatusDescription | String | Descripción del estado.
Term | Int | Plazo.
TotalPaidInstallments | Int | Total de cuotas pagadas.
ValueDate | Date | Fecha valor.
:::

::: details SdtsBTPHWProduct

### SdtsBTPHWProduct

::: center
Los campos del tipo de dato estructurado SdtsBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CurrencyId | Short $<(Length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(Length: 30)>$ | Descripción de moneda.
CurrencySign | String $<(Length: 5)>$ | Signo de moneda.
KindId | Int | Identificador del tipo.
KindDescription | String | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String | Identificador único global (GUID) del producto.
:::
<!-- CIERRA SDT -->
