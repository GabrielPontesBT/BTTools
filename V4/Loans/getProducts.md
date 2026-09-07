---
title: Products
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los productos de préstamo.

**Nombre publicación:** PublicLoans.products

**Programa:** PublicAPI.BTPHPA0002

**Alcance:** Global

**Endpoint:** /public/Loans/v1/products
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
products | [product](#product) | Listado de productos.

@tab Errores

No aplica.
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/Loans/v1/products' \
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
  "products": {
    "product": [
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "COMPRA DE VIVIENDA",
        "productGUID": "d6328022-6f93-4afc-b59b-a29f435aba41"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 50,
        "kindDescription": "Unidad Indexada",
        "productDescription": "COMPRA DE VIVIENDA",
        "productGUID": "38da2e83-b308-4d5f-b664-f351db2b4a1d"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "COMPRA DE VIVIENDA",
        "productGUID": "c9d5bcd0-8872-41b3-b5a4-9dff8ac7e235"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "REFACCIÓN DE VIVIENDA",
        "productGUID": "b28af066-a6af-4ad5-9ad6-bfc925f93eee"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "REFACCIÓN DE VIVIENDA",
        "productGUID": "e83c667b-4887-4cac-bbc7-cfe85f179d33"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA MIVIVIENDA",
        "productGUID": "43a5c0ba-2740-42c9-8d5e-580135824b64"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 50,
        "kindDescription": "Unidad Indexada",
        "productDescription": "PRUEBA MIVIVIENDA",
        "productGUID": "1ad07f0b-b233-4437-bb9c-c45d7e3632e2"
      },
      {
        "currencyId": 2222,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE",
        "currencySign": "USD",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA MIVIVIENDA",
        "productGUID": "1e1435cc-d848-4624-8f1f-e9a11639d479"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "3b5af2fb-f6dc-42b6-8bd0-a112629868bb"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 50,
        "kindDescription": "Unidad Indexada",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "53da545d-aa5c-4ff7-ae37-2337abee890b"
      },
      {
        "currencyId": 1115,
        "currencyDescription": "EURO BILLETE",
        "currencySign": "EU$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "7b903621-af39-46c2-bea9-7c741e8eb095"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO PERSONAL",
        "productGUID": "fdf41991-bde3-4cce-ae8e-502a02dec26b"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "ADELANTO SOBRE SUELDOS",
        "productGUID": "cc2dc934-3de1-47c1-bf67-be92cc3ea16e"
      },
      {
        "currencyId": 1115,
        "currencyDescription": "EURO BILLETE",
        "currencySign": "EU$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "ADELANTO SOBRE SUELDOS",
        "productGUID": "290672e7-a191-4c18-833a-2067420d8534"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "ADELANTO SOBRE SUELDOS",
        "productGUID": "3114426f-982e-4dd6-b4a7-749c8bdb926f"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TVARIABLE",
        "productGUID": "fd8efa5f-b207-4581-a82d-24fb5c787938"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TVARIABLE",
        "productGUID": "2cfe4f05-1ba2-45e9-9197-cae2ccb01764"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "CONSUMO VIAJES",
        "productGUID": "5769059c-28a8-4332-9ed3-4e70bd83bc03"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "CONSUMO VIAJES",
        "productGUID": "90862f65-0640-422e-b9d1-5eb259d2a07f"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TEA - INTS. REALES",
        "productGUID": "8baa4994-3479-4331-8659-162c5aa6de3e"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TEA - INTS. REALES",
        "productGUID": "a9092b3d-3859-467a-bed6-c79af7390bfe"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TNA - INTS. REALES",
        "productGUID": "1fe1474d-e0ba-4f60-8e09-adbea7bcd3f4"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TNA - INTS. REALES",
        "productGUID": "408951c1-8955-4b21-a718-c9d3087917a3"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TEA - INTS. PROYECTADOS",
        "productGUID": "cb92ca67-099c-4c60-a08e-a39e2a250f5a"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TEA - INTS. PROYECTADOS",
        "productGUID": "a52ad1e5-353e-48f9-8376-2e79fd46589a"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TNA - INTS. PROYECTADOS",
        "productGUID": "10c4daeb-589a-46b2-9ba0-08b1c4942758"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA TNA - INTS. PROYECTADOS",
        "productGUID": "29b2cf09-190e-48d0-be4f-8ac3122573c9"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO SENCILLO",
        "productGUID": "5efa70c2-daa9-470c-bb32-c1495e8ae3d4"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO SENCILLO",
        "productGUID": "f6bf9324-473e-4371-9d6c-28919b65d87d"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "FINANCIAMIENTO AGRARIO",
        "productGUID": "81a408c6-1aba-48a2-b73a-8897cc9d9982"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "FINANCIAMIENTO AGRARIO",
        "productGUID": "f9a397d6-258b-43fb-829c-fdbe659753c7"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "QTC",
        "productGUID": "af13e860-04e0-4de3-899f-82750395af1d"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "QTC",
        "productGUID": "8dceea54-aff3-4fb8-af5a-b7606fa6e13e"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "CONSUMO CON GRACIA",
        "productGUID": "e69f56fc-9c91-435b-b968-8d3b3a169bf8"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "CONSUMO CON GRACIA",
        "productGUID": "c4154063-8735-43b9-9b08-42ad0ef45cef"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO REDONDO",
        "productGUID": "0517a288-0fed-4123-ab0c-2a8a067e0b08"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO REDONDO",
        "productGUID": "f07270ce-8bda-4529-ba18-1a7ac52510f9"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA COMISIONES",
        "productGUID": "4220ae8a-4f1e-40f8-93b0-a5463cf1670d"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA POR PERÍODOS",
        "productGUID": "036a1752-0761-46b3-a4f1-b24000cccbdc"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA POR PERÍODOS",
        "productGUID": "e2ea2dca-c182-4b0a-bd58-694590c5bbba"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA POR MES",
        "productGUID": "fe3a8d49-4de2-4ff2-b0c4-a5dafd396161"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA POR MES",
        "productGUID": "0a3696fa-2b9d-402b-a3b4-d675d7cd2bff"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA SELECCIONABLE",
        "productGUID": "18edde35-e239-4fe9-9a04-c2beb8dd767b"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA SELECCIONABLE",
        "productGUID": "fb8a8456-a7e0-45cd-8d93-7d4493f3743f"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO MIDINERO",
        "productGUID": "834cb458-2c69-4e89-96b2-b99c0924150d"
      },
      {
        "currencyId": 2222,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE",
        "currencySign": "USD",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO MIDINERO",
        "productGUID": "4c94c7bb-2ebb-4dd3-8b96-224dd65f2287"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "BTLO2469",
        "productGUID": "d82a9168-6f5d-4b8f-9cd8-ae3fd019822e"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PPF CONSUMO",
        "productGUID": "c13ad57e-d593-430e-8f26-09ca34473955"
      },
      {
        "currencyId": 2222,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE",
        "currencySign": "USD",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PPF CONSUMO",
        "productGUID": "9b36d6d1-b66c-43ec-9e91-16b0e2033975"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA MORA TEA",
        "productGUID": "7ba57d13-a6df-4028-a463-a7dc551a0c0c"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA MORA TEA",
        "productGUID": "98865314-2f11-4421-b36b-319c29b58f0b"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA GRACIA DE MORA",
        "productGUID": "e42a7a01-40a0-4ef8-abe8-9369fa8281c6"
      },
      {
        "currencyId": 2222,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE",
        "currencySign": "USD",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA GRACIA DE MORA",
        "productGUID": "ef66f10d-29c7-4b9c-8cae-1952e8a09df4"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "DISPOSICIÓN L/REVOLVENTE",
        "productGUID": "9ffe0d32-f9ca-47b3-b805-c27a45e680f5"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA DÍAS HÁBILES C/PERDÓN",
        "productGUID": "a10c48d3-7acc-4c3e-879a-478370f3441b"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA DÍAS HÁBILES C/PERDÓN",
        "productGUID": "b486c1b7-1963-48f9-9203-2d6e955c0f38"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA DÍAS HÁBILES S/PERDÓN",
        "productGUID": "7a30f429-b103-4de3-b72a-ccd3e335d1e7"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA DÍAS HÁBILES S/PERDÓN",
        "productGUID": "2e7a925d-ce26-4e31-ac5d-93d716c31488"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA CALENDARIO C/PERDÓN",
        "productGUID": "a00eb779-6bf7-40d3-b20d-4e3de98e5264"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA CALENDARIO C/PERDÓN",
        "productGUID": "65728b81-f4e3-4010-95a8-254cd1c71ff3"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA CALENDARIO S/PERDÓN",
        "productGUID": "93bf5dac-b922-4431-b0c8-947aee7c4f31"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "GRACIA CALENDARIO S/PERDÓN",
        "productGUID": "3d1d4e28-a9bc-4699-9fcf-4cc13a30fc18"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMOS SIN MORA",
        "productGUID": "fec0a247-19b6-4531-95c6-7090c6033a02"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMOS SIN MORA",
        "productGUID": "40771364-8568-470a-aa79-a6878fe1d914"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMOS GRUPALES",
        "productGUID": "8fc7a34d-eace-448e-aab5-2c4a2c4fe4b9"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRUEBA PRESENTACIÓN",
        "productGUID": "1b65f4b2-abcc-4dc0-8f99-cf573d468b3a"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "FLEXIBLE",
        "productGUID": "d4e7ea18-1292-48bf-b1af-13376ea7bb1c"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO FÁCIL",
        "productGUID": "87dd2a5d-fd42-4537-a3a9-affdc5b5f014"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO FÁCIL",
        "productGUID": "6903b0ed-f010-4f59-9e48-d18a0971d52d"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMOS COMPRA VEHÍCULOS NUEVOS",
        "productGUID": "93144d5f-43ad-4689-a489-8e5ce03d9788"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMOS COMPRA VEHÍCULOS NUEVOS",
        "productGUID": "2f699067-cda6-4231-89b6-1586d4510555"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO A PLAZO FIJO",
        "productGUID": "31527a1f-1c73-4651-9edd-406d1dc9bae2"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "PRÉSTAMO A PLAZO FIJO",
        "productGUID": "23df65d8-03e2-4dc3-833d-ec614f26c018"
      },
      {
        "currencyId": 0,
        "currencyDescription": "Pesos Uruguayos",
        "currencySign": "$",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "VARIABLE",
        "productGUID": "a5fd93b0-558d-4841-a349-24685ae20201"
      },
      {
        "currencyId": 2225,
        "currencyDescription": "DÓLAR ESTADOUNIDENSE - BILLETE",
        "currencySign": "U$D",
        "kindId": 0,
        "kindDescription": "Billete",
        "productDescription": "VARIABLE",
        "productGUID": "07903ab3-3f18-4eb1-9bb2-ca2b49eba38a"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
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
