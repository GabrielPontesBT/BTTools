---
title: Get Products
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los productos de préstamo.

**Nombre publicación:** PublicLoans.getProducts

**Módulo:** Configuration.ProductsHub

**Programa:** PublicAPI.BTPHPA0002

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
products | [SdtsBTPHWProduct](#sdtsbtphwproduct) | Listado de productos.

@tab Errores

No aplica.

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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  }
}
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
    "Canal": "BTMOBILE",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": 1,
    "Token": "229E7557863E8FC9C64DFECC"
  },
  "products": [
    {
      "ProductDescription": "COMPRA DE VIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
    },
    {
      "ProductDescription": "COMPRA DE VIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 50,
      "KindDescription": "Unidad Indexada",
      "CurrencySign": "$",
      "ProductGUID": "38da2e83-b308-4d5f-b664-f351db2b4a1d"
    },
    {
      "ProductDescription": "COMPRA DE VIVIENDA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "c9d5bcd0-8872-41b3-b5a4-9dff8ac7e235"
    },
    {
      "ProductDescription": "REFACCIÓN DE VIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee"
    },
    {
      "ProductDescription": "REFACCIÓN DE VIVIENDA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "e83c667b-4887-4cac-bbc7-cfe85f179d33"
    },
    {
      "ProductDescription": "PRUEBA MIVIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "43a5c0ba-2740-42c9-8d5e-580135824b64"
    },
    {
      "ProductDescription": "PRUEBA MIVIVIENDA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 50,
      "KindDescription": "Unidad Indexada",
      "CurrencySign": "$",
      "ProductGUID": "1ad07f0b-b233-4437-bb9c-c45d7e3632e2"
    },
    {
      "ProductDescription": "PRUEBA MIVIVIENDA",
      "CurrencyId": 2222,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "USD",
      "ProductGUID": "1e1435cc-d848-4624-8f1f-e9a11639d479"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "3b5af2fb-f6dc-42b6-8bd0-a112629868bb"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 50,
      "KindDescription": "Unidad Indexada",
      "CurrencySign": "$",
      "ProductGUID": "53da545d-aa5c-4ff7-ae37-2337abee890b"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 1115,
      "CurrencyDescription": "EURO BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "EU$",
      "ProductGUID": "7b903621-af39-46c2-bea9-7c741e8eb095"
    },
    {
      "ProductDescription": "PRÉSTAMO PERSONAL",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "fdf41991-bde3-4cce-ae8e-502a02dec26b"
    },
    {
      "ProductDescription": "ADELANTO SOBRE SUELDOS",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
    },
    {
      "ProductDescription": "ADELANTO SOBRE SUELDOS",
      "CurrencyId": 1115,
      "CurrencyDescription": "EURO BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "EU$",
      "ProductGUID": "290672e7-a191-4c18-833a-2067420d8534"
    },
    {
      "ProductDescription": "ADELANTO SOBRE SUELDOS",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "3114426f-982e-4dd6-b4a7-749c8bdb926f"
    },
    {
      "ProductDescription": "PRUEBA TVARIABLE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "fd8efa5f-b207-4581-a82d-24fb5c787938"
    },
    {
      "ProductDescription": "PRUEBA TVARIABLE",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "2cfe4f05-1ba2-45e9-9197-cae2ccb01764"
    },
    {
      "ProductDescription": "CONSUMO VIAJES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "5769059c-28a8-4332-9ed3-4e70bd83bc03"
    },
    {
      "ProductDescription": "CONSUMO VIAJES",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "90862f65-0640-422e-b9d1-5eb259d2a07f"
    },
    {
      "ProductDescription": "PRUEBA TEA - INTS. REALES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "8baa4994-3479-4331-8659-162c5aa6de3e"
    },
    {
      "ProductDescription": "PRUEBA TEA - INTS. REALES",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "a9092b3d-3859-467a-bed6-c79af7390bfe"
    },
    {
      "ProductDescription": "PRUEBA TNA - INTS. REALES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "1fe1474d-e0ba-4f60-8e09-adbea7bcd3f4"
    },
    {
      "ProductDescription": "PRUEBA TNA - INTS. REALES",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "408951c1-8955-4b21-a718-c9d3087917a3"
    },
    {
      "ProductDescription": "PRUEBA TEA - INTS. PROYECTADOS",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "cb92ca67-099c-4c60-a08e-a39e2a250f5a"
    },
    {
      "ProductDescription": "PRUEBA TEA - INTS. PROYECTADOS",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "a52ad1e5-353e-48f9-8376-2e79fd46589a"
    },
    {
      "ProductDescription": "PRUEBA TNA - INTS. PROYECTADOS",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "10c4daeb-589a-46b2-9ba0-08b1c4942758"
    },
    {
      "ProductDescription": "PRUEBA TNA - INTS. PROYECTADOS",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "29b2cf09-190e-48d0-be4f-8ac3122573c9"
    },
    {
      "ProductDescription": "PRÉSTAMO SENCILLO",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "5efa70c2-daa9-470c-bb32-c1495e8ae3d4"
    },
    {
      "ProductDescription": "PRÉSTAMO SENCILLO",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "f6bf9324-473e-4371-9d6c-28919b65d87d"
    },
    {
      "ProductDescription": "FINANCIAMIENTO AGRARIO",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "81a408c6-1aba-48a2-b73a-8897cc9d9982"
    },
    {
      "ProductDescription": "FINANCIAMIENTO AGRARIO",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "f9a397d6-258b-43fb-829c-fdbe659753c7"
    },
    {
      "ProductDescription": "QTC",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "af13e860-04e0-4de3-899f-82750395af1d"
    },
    {
      "ProductDescription": "QTC",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "8dceea54-aff3-4fb8-af5a-b7606fa6e13e"
    },
    {
      "ProductDescription": "CONSUMO CON GRACIA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "e69f56fc-9c91-435b-b968-8d3b3a169bf8"
    },
    {
      "ProductDescription": "CONSUMO CON GRACIA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "c4154063-8735-43b9-9b08-42ad0ef45cef"
    },
    {
      "ProductDescription": "PRÉSTAMO REDONDO",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "0517a288-0fed-4123-ab0c-2a8a067e0b08"
    },
    {
      "ProductDescription": "PRÉSTAMO REDONDO",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "f07270ce-8bda-4529-ba18-1a7ac52510f9"
    },
    {
      "ProductDescription": "PRUEBA COMISIONES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "4220ae8a-4f1e-40f8-93b0-a5463cf1670d"
    },
    {
      "ProductDescription": "GRACIA POR PERÍODOS",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "036a1752-0761-46b3-a4f1-b24000cccbdc"
    },
    {
      "ProductDescription": "GRACIA POR PERÍODOS",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "e2ea2dca-c182-4b0a-bd58-694590c5bbba"
    },
    {
      "ProductDescription": "GRACIA POR MES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "fe3a8d49-4de2-4ff2-b0c4-a5dafd396161"
    },
    {
      "ProductDescription": "GRACIA POR MES",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "0a3696fa-2b9d-402b-a3b4-d675d7cd2bff"
    },
    {
      "ProductDescription": "GRACIA SELECCIONABLE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "18edde35-e239-4fe9-9a04-c2beb8dd767b"
    },
    {
      "ProductDescription": "GRACIA SELECCIONABLE",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "fb8a8456-a7e0-45cd-8d93-7d4493f3743f"
    },
    {
      "ProductDescription": "PRÉSTAMO MIDINERO",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "834cb458-2c69-4e89-96b2-b99c0924150d"
    },
    {
      "ProductDescription": "PRÉSTAMO MIDINERO",
      "CurrencyId": 2222,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "USD",
      "ProductGUID": "4c94c7bb-2ebb-4dd3-8b96-224dd65f2287"
    },
    {
      "ProductDescription": "BTLO2469",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "d82a9168-6f5d-4b8f-9cd8-ae3fd019822e"
    },
    {
      "ProductDescription": "PPF CONSUMO",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "c13ad57e-d593-430e-8f26-09ca34473955"
    },
    {
      "ProductDescription": "PPF CONSUMO",
      "CurrencyId": 2222,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "USD",
      "ProductGUID": "9b36d6d1-b66c-43ec-9e91-16b0e2033975"
    },
    {
      "ProductDescription": "PRUEBA MORA TEA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "7ba57d13-a6df-4028-a463-a7dc551a0c0c"
    },
    {
      "ProductDescription": "PRUEBA MORA TEA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "98865314-2f11-4421-b36b-319c29b58f0b"
    },
    {
      "ProductDescription": "PRUEBA GRACIA DE MORA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "e42a7a01-40a0-4ef8-abe8-9369fa8281c6"
    },
    {
      "ProductDescription": "PRUEBA GRACIA DE MORA",
      "CurrencyId": 2222,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "USD",
      "ProductGUID": "ef66f10d-29c7-4b9c-8cae-1952e8a09df4"
    },
    {
      "ProductDescription": "DISPOSICIÓN L/REVOLVENTE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "9ffe0d32-f9ca-47b3-b805-c27a45e680f5"
    },
    {
      "ProductDescription": "GRACIA DÍAS HÁBILES C/PERDÓN",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "a10c48d3-7acc-4c3e-879a-478370f3441b"
    },
    {
      "ProductDescription": "GRACIA DÍAS HÁBILES C/PERDÓN",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "b486c1b7-1963-48f9-9203-2d6e955c0f38"
    },
    {
      "ProductDescription": "GRACIA DÍAS HÁBILES S/PERDÓN",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "7a30f429-b103-4de3-b72a-ccd3e335d1e7"
    },
    {
      "ProductDescription": "GRACIA DÍAS HÁBILES S/PERDÓN",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "2e7a925d-ce26-4e31-ac5d-93d716c31488"
    },
    {
      "ProductDescription": "GRACIA CALENDARIO C/PERDÓN",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "a00eb779-6bf7-40d3-b20d-4e3de98e5264"
    },
    {
      "ProductDescription": "GRACIA CALENDARIO C/PERDÓN",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "65728b81-f4e3-4010-95a8-254cd1c71ff3"
    },
    {
      "ProductDescription": "GRACIA CALENDARIO S/PERDÓN",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "93bf5dac-b922-4431-b0c8-947aee7c4f31"
    },
    {
      "ProductDescription": "GRACIA CALENDARIO S/PERDÓN",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "3d1d4e28-a9bc-4699-9fcf-4cc13a30fc18"
    },
    {
      "ProductDescription": "PRÉSTAMOS SIN MORA",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "fec0a247-19b6-4531-95c6-7090c6033a02"
    },
    {
      "ProductDescription": "PRÉSTAMOS SIN MORA",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "40771364-8568-470a-aa79-a6878fe1d914"
    },
    {
      "ProductDescription": "PRÉSTAMOS GRUPALES",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "8fc7a34d-eace-448e-aab5-2c4a2c4fe4b9"
    },
    {
      "ProductDescription": "PRUEBA PRESENTACIÓN",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "1b65f4b2-abcc-4dc0-8f99-cf573d468b3a"
    },
    {
      "ProductDescription": "FLEXIBLE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
    },
    {
      "ProductDescription": "PRÉSTAMO FÁCIL",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "87dd2a5d-fd42-4537-a3a9-affdc5b5f014"
    },
    {
      "ProductDescription": "PRÉSTAMO FÁCIL",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "6903b0ed-f010-4f59-9e48-d18a0971d52d"
    },
    {
      "ProductDescription": "PRÉSTAMOS COMPRA VEHÍCULOS NUEVOS",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "93144d5f-43ad-4689-a489-8e5ce03d9788"
    },
    {
      "ProductDescription": "PRÉSTAMOS COMPRA VEHÍCULOS NUEVOS",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "2f699067-cda6-4231-89b6-1586d4510555"
    },
    {
      "ProductDescription": "PRÉSTAMO A PLAZO FIJO",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "31527a1f-1c73-4651-9edd-406d1dc9bae2"
    },
    {
      "ProductDescription": "PRÉSTAMO A PLAZO FIJO",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "23df65d8-03e2-4dc3-833d-ec614f26c018"
    },
    {
      "ProductDescription": "VARIABLE",
      "CurrencyId": 0,
      "CurrencyDescription": "Pesos Uruguayos",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "$",
      "ProductGUID": "a5fd93b0-558d-4841-a349-24685ae20201"
    },
    {
      "ProductDescription": "VARIABLE",
      "CurrencyId": 2225,
      "CurrencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
      "KindId": 0,
      "KindDescription": "Billete",
      "CurrencySign": "U$D",
      "ProductGUID": "07903ab3-3f18-4eb1-9bb2-ca2b49eba38a"
    }
  ],
  "BusinessErrors": [],
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-09",
    "Hora": "13:52:25",
    "Numero": 13542420,
    "Servicio": "PublicLoans.getProducts",
    "Requerimiento": 1,
    "Canal": "BTMOBILE"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPHWProduct

### SdtsBTPHWProduct

::: center
Los campos del tipo de dato estructurado SdtsBTPHWProduct son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
CurrencyId | Short $<(length: 4)>$ | Identificador de moneda.
CurrencyDescription | String $<(length: 30)>$ | Descripción de la moneda.
CurrencySign | String $<(length: 4)>$ | Símbolo de la moneda.
KindId | Int $<(length: 6)>$ | Identificador del tipo.
KindDescription | String $<(length: 30)>$ | Descripción del tipo.
ProductDescription | String | Descripción del producto.
ProductGUID | String $<(length: 36)>$ | GUID del producto.
:::
<!-- CIERRA SDT -->
