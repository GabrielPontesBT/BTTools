---
title: Obtener Detalle de Préstamo
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
::: note Método para obtener el detalle de un préstamo.
Este servicio permite consultar el **detalle de un préstamo** identificado por su **loanGUID**, calculado/consultado a una **fecha de consulta (queryDate)**.

**Nombre publicación:** PublicLoans.getDetail

**Módulo:** (No informado)

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanGUID | String | Identificador único del préstamo.
queryDate | Date / DateTime (String) | Fecha de consulta para obtener el detalle del préstamo. (Ej.: `2030-12-31`)

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
loanDetail | Object | Objeto con el detalle del préstamo para la fecha consultada.

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicLoans_v1?getDetail' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "7805C519E9C520804CA8D570"
  },
  "loanGUID": "c031c219-f16d-40b2-80a9-b7b56ac14ba4",
  "queryDate": "2030-12-31"
}'
```
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab JSON
```json
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <SOAP-ENV:Body>
      <PublicLoans.getDetailResponse xmlns="http://uy.com.dlya.bantotal/BTSOA/">
         <Btinreq>
            <Canal>BTDIGITAL</Canal>
            <Usuario>INSTALADOR</Usuario>
            <Device>FPAIS</Device>
            <Requerimiento>1</Requerimiento>
            <Token>7805C519E9C520804CA8D570</Token>
         </Btinreq>
         <loanDetail>
            <ValueDate>2027-02-03</ValueDate>
            <YearTypeId>1</YearTypeId>
            <Debt>7303.39</Debt>
            <AccruedInterest>0.0</AccruedInterest>
            <FirstUnpaidDate>2027-03-12</FirstUnpaidDate>
            <ArrearDays>1390</ArrearDays>
            <AccruedInterestResult>0.0</AccruedInterestResult>
            <ReviewDays>0</ReviewDays>
            <StatusDescription/>
            <BranchId>1</BranchId>
            <ArrearsRateTypeId>0</ArrearsRateTypeId>
            <TotalExpiredInstallments>12</TotalExpiredInstallments>
            <RateTypeDescription/>
            <TotalOfTaxes>0.0</TotalOfTaxes>
            <AccountBalance>-1000.0</AccountBalance>
            <OriginalAmount>1000.0</OriginalAmount>
            <EconomicActivityId>97000</EconomicActivityId>
            <TotalOfInterestArrear>2975.76</TotalOfInterestArrear>
            <RateTypeId>1</RateTypeId>
            <TotalMissedPaymentInstallments>0</TotalMissedPaymentInstallments>
            <ArrearsRateTypeDescription/>
            <RateClassDescription/>
            <DateOfLastTotalPayment/>
            <AccruedArrearInterest>0.0</AccruedArrearInterest>
            <AccountingAccountDescription/>
            <DayTypeDescription/>
            <Term>374</Term>
            <TotalPaidInstallments>0</TotalPaidInstallments>
            <TotalExpiredDebt>7303.39</TotalExpiredDebt>
            <AccountingAccountId>163302001</AccountingAccountId>
            <YearTypeDescription/>
            <InstallmentValue>303.0</InstallmentValue>
            <DayTypeId>2</DayTypeId>
            <TotalOfInterest>190.9</TotalOfInterest>
            <AmortizationTypeId>3</AmortizationTypeId>
            <TotalOfInsurances>60.0</TotalOfInsurances>
            <IVACoefficient>0.0</IVACoefficient>
            <TotalFinancedCost>0.0</TotalFinancedCost>
            <AmortizationTypeDescription/>
            <OriginalRate>20.0</OriginalRate>
            <tasaMoraOriginal_REVISAR>0.0</tasaMoraOriginal_REVISAR>
            <Product>
               <ProductGUID>ac0b9033-a297-43f5-99a5-2fcf87bd3be0</ProductGUID>
               <ProductDescription/>
               <CurrencyId>0</CurrencyId>
               <CurrencyDescription>Pesos Uruguayos</CurrencyDescription>
               <CurrencySign>$</CurrencySign>
               <KindId>0</KindId>
               <KindDescription>Billete</KindDescription>
            </Product>
            <TotalOfInstallmentFees>14415.0</TotalOfInstallmentFees>
            <RateClassId>0</RateClassId>
            <EconomicActivityDescription/>
            <tasaMoraVigente_REVISAR>0.0</tasaMoraVigente_REVISAR>
            <SuspendedInterest>0.0</SuspendedInterest>
            <InterestRate>20.0</InterestRate>
            <AverageDaysInArrears>1221</AverageDaysInArrears>
            <NumberOfInstallments>0</NumberOfInstallments>
            <tasaEfectiva_REVISAR>0.0</tasaEfectiva_REVISAR>
            <DebtToDate>7303.39</DebtToDate>
            <BranchDescription>Sucursal Beta</BranchDescription>
            <TotalUnpaidInstallments>12</TotalUnpaidInstallments>
            <StatusId>0</StatusId>
            <LoanGUID>c031c219-f16d-40b2-80a9-b7b56ac14ba4</LoanGUID>
            <ExpirationDate>2028-02-12</ExpirationDate>
            <FirstPaymentDate>2027-03-12</FirstPaymentDate>
            <TotalOfPunitiveInterest>0.0</TotalOfPunitiveInterest>
            <PlusRate>0.0</PlusRate>
            <NextExpirationDate/>
            <InstallmentPeriodicity>30</InstallmentPeriodicity>
         </loanDetail>
         <BusinessErrors></BusinessErrors>
         <Btoutreq>
            <Estado>OK</Estado>
            <Fecha>2026-02-11</Fecha>
            <Hora>16:30:18</Hora>
            <Numero>13110338</Numero>
            <Servicio>PublicLoans.getDetail</Servicio>
            <Requerimiento>1</Requerimiento>
            <Canal>BTDIGITAL</Canal>
         </Btoutreq>
      </PublicLoans.getDetailResponse>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
