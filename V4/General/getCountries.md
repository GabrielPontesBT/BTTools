---
title: Get Countries
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de países.

**Nombre publicación:** PublicGeneral.getCountries

**Programa:** PublicAPI.BTCNPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/getCountries
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
countries | [SdtsBTCNWCountry](#sdtsbtcnwcountry) | Listado de países.

@tab Errores

Código | Descripción
:--------- | :---------
500 | 
50020018 | El país no se encuentra registrado

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X GET \
  '{{baseUrl}}/public/General/v1/getCountries' \
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
  "countries": {
    "country": [
      {
        "ISOName": "AF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 4,
        "ISO3": "AFG",
        "TelephoneCodePrefix": 93,
        "Name": "Afganistán",
        "ISO2": "AF"
      },
      {
        "ISOName": "AL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 8,
        "ISO3": "ALB",
        "TelephoneCodePrefix": 355,
        "Name": "Albania",
        "ISO2": "AL"
      },
      {
        "ISOName": "AY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 10,
        "ISO3": "ATA",
        "TelephoneCodePrefix": 672,
        "Name": "Antártida",
        "ISO2": "AQ"
      },
      {
        "ISOName": "AG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 12,
        "ISO3": "DZA",
        "TelephoneCodePrefix": 213,
        "Name": "Argelia",
        "ISO2": "DZ"
      },
      {
        "ISOName": "AQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 16,
        "ISO3": "ASM",
        "TelephoneCodePrefix": 1684,
        "Name": "Samoa Americana",
        "ISO2": "AS"
      },
      {
        "ISOName": "AN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 20,
        "ISO3": "AND",
        "TelephoneCodePrefix": 376,
        "Name": "Andorra",
        "ISO2": "AD"
      },
      {
        "ISOName": "AO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 24,
        "ISO3": "AGO",
        "TelephoneCodePrefix": 244,
        "Name": "Angola",
        "ISO2": "AO"
      },
      {
        "ISOName": "AC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 28,
        "ISO3": "ATG",
        "TelephoneCodePrefix": 1268,
        "Name": "Antigua y Barbuda",
        "ISO2": "AG"
      },
      {
        "ISOName": "AJ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 31,
        "ISO3": "AZE",
        "TelephoneCodePrefix": 994,
        "Name": "Azerbaiyán",
        "ISO2": "AZ"
      },
      {
        "ISOName": "AR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 32,
        "ISO3": "ARG",
        "TelephoneCodePrefix": 54,
        "Name": "Argentina",
        "ISO2": "AR"
      },
      {
        "ISOName": "AS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 36,
        "ISO3": "AUS",
        "TelephoneCodePrefix": 61,
        "Name": "Australia",
        "ISO2": "AU"
      },
      {
        "ISOName": "AU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 40,
        "ISO3": "AUT",
        "TelephoneCodePrefix": 43,
        "Name": "Austria",
        "ISO2": "AT"
      },
      {
        "ISOName": "BF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 44,
        "ISO3": "BHS",
        "TelephoneCodePrefix": 1242,
        "Name": "Bahamas",
        "ISO2": "BS"
      },
      {
        "ISOName": "BA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 48,
        "ISO3": "BHR",
        "TelephoneCodePrefix": 973,
        "Name": "Bahrein",
        "ISO2": "BH"
      },
      {
        "ISOName": "BG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 50,
        "ISO3": "BGD",
        "TelephoneCodePrefix": 880,
        "Name": "Bangladesh",
        "ISO2": "BD"
      },
      {
        "ISOName": "AM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 51,
        "ISO3": "ARM",
        "TelephoneCodePrefix": 374,
        "Name": "Armenia",
        "ISO2": "AM"
      },
      {
        "ISOName": "BB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 52,
        "ISO3": "BRB",
        "TelephoneCodePrefix": 1246,
        "Name": "Barbados",
        "ISO2": "BB"
      },
      {
        "ISOName": "BE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 56,
        "ISO3": "BEL",
        "TelephoneCodePrefix": 32,
        "Name": "Bélgica",
        "ISO2": "BE"
      },
      {
        "ISOName": "BD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 60,
        "ISO3": "BMU",
        "TelephoneCodePrefix": 1441,
        "Name": "Bermudas",
        "ISO2": "BM"
      },
      {
        "ISOName": "BT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 64,
        "ISO3": "BTN",
        "TelephoneCodePrefix": 975,
        "Name": "Bután",
        "ISO2": "BT"
      },
      {
        "ISOName": "BL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 68,
        "ISO3": "BOL",
        "TelephoneCodePrefix": 591,
        "Name": "Bolivia",
        "ISO2": "BO"
      },
      {
        "ISOName": "BK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 70,
        "ISO3": "BIH",
        "TelephoneCodePrefix": 387,
        "Name": "Bosnia y Hercegovina",
        "ISO2": "BA"
      },
      {
        "ISOName": "BC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 72,
        "ISO3": "BWA",
        "TelephoneCodePrefix": 267,
        "Name": "Botsuana",
        "ISO2": "BW"
      },
      {
        "ISOName": "BV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 74,
        "ISO3": "BVT",
        "TelephoneCodePrefix": 47,
        "Name": "Isla Bouvet",
        "ISO2": "BV"
      },
      {
        "ISOName": "BR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 76,
        "ISO3": "BRA",
        "TelephoneCodePrefix": 55,
        "Name": "Brasil",
        "ISO2": "BR"
      },
      {
        "ISOName": "BH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 84,
        "ISO3": "BLZ",
        "TelephoneCodePrefix": 501,
        "Name": "Belice",
        "ISO2": "BZ"
      },
      {
        "ISOName": "IO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 86,
        "ISO3": "IOT",
        "TelephoneCodePrefix": 246,
        "Name": "Territorio Británico del Océan",
        "ISO2": "IO"
      },
      {
        "ISOName": "BP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 90,
        "ISO3": "SLB",
        "TelephoneCodePrefix": 677,
        "Name": "Islas Salomón",
        "ISO2": "SB"
      },
      {
        "ISOName": "VI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 92,
        "ISO3": "VGB",
        "TelephoneCodePrefix": 1284,
        "Name": "Islas Vírgenes (UK)",
        "ISO2": "VG"
      },
      {
        "ISOName": "BX",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 96,
        "ISO3": "BRN",
        "TelephoneCodePrefix": 673,
        "Name": "Brunéi",
        "ISO2": "BN"
      },
      {
        "ISOName": "BU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 100,
        "ISO3": "BGR",
        "TelephoneCodePrefix": 359,
        "Name": "Bulgaria",
        "ISO2": "BG"
      },
      {
        "ISOName": "BM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 104,
        "ISO3": "MMR",
        "TelephoneCodePrefix": 95,
        "Name": "Myanmar",
        "ISO2": "MM"
      },
      {
        "ISOName": "BY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 108,
        "ISO3": "BDI",
        "TelephoneCodePrefix": 257,
        "Name": "Burundi",
        "ISO2": "BI"
      },
      {
        "ISOName": "BO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 112,
        "ISO3": "BLR",
        "TelephoneCodePrefix": 375,
        "Name": "Belarús",
        "ISO2": "BY"
      },
      {
        "ISOName": "CB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 116,
        "ISO3": "KHM",
        "TelephoneCodePrefix": 855,
        "Name": "Cambodia",
        "ISO2": "KH"
      },
      {
        "ISOName": "CM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 120,
        "ISO3": "CMR",
        "TelephoneCodePrefix": 237,
        "Name": "Camerún",
        "ISO2": "CM"
      },
      {
        "ISOName": "CA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 124,
        "ISO3": "CAN",
        "TelephoneCodePrefix": 1,
        "Name": "Canadá",
        "ISO2": "CA"
      },
      {
        "ISOName": "CV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 132,
        "ISO3": "CPV",
        "TelephoneCodePrefix": 238,
        "Name": "Cabo Verde",
        "ISO2": "CV"
      },
      {
        "ISOName": "CJ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 136,
        "ISO3": "CYM",
        "TelephoneCodePrefix": 1345,
        "Name": "Islas Caimán",
        "ISO2": "KY"
      },
      {
        "ISOName": "CT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 140,
        "ISO3": "CAF",
        "TelephoneCodePrefix": 236,
        "Name": "República Centroafricana",
        "ISO2": "CF"
      },
      {
        "ISOName": "CE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 144,
        "ISO3": "LKA",
        "TelephoneCodePrefix": 94,
        "Name": "Sri Lanka",
        "ISO2": "LK"
      },
      {
        "ISOName": "CD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 148,
        "ISO3": "TCD",
        "TelephoneCodePrefix": 235,
        "Name": "Chad",
        "ISO2": "TD"
      },
      {
        "ISOName": "CI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 152,
        "ISO3": "CHL",
        "TelephoneCodePrefix": 56,
        "Name": "Chile",
        "ISO2": "CL"
      },
      {
        "ISOName": "CH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 156,
        "ISO3": "CHN",
        "TelephoneCodePrefix": 86,
        "Name": "China",
        "ISO2": "CN"
      },
      {
        "ISOName": "TW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 158,
        "ISO3": "TWN",
        "TelephoneCodePrefix": 886,
        "Name": "Taiwán",
        "ISO2": "TW"
      },
      {
        "ISOName": "KT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 162,
        "ISO3": "CXR",
        "TelephoneCodePrefix": 61,
        "Name": "Isla de Navidad",
        "ISO2": "CX"
      },
      {
        "ISOName": "CK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 166,
        "ISO3": "CCK",
        "TelephoneCodePrefix": 61,
        "Name": "Islas Cocos",
        "ISO2": "CC"
      },
      {
        "ISOName": "CO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 170,
        "ISO3": "COL",
        "TelephoneCodePrefix": 57,
        "Name": "Colombia",
        "ISO2": "CO"
      },
      {
        "ISOName": "CN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 174,
        "ISO3": "COM",
        "TelephoneCodePrefix": 269,
        "Name": "Comores",
        "ISO2": "KM"
      },
      {
        "ISOName": "MF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 175,
        "ISO3": "MYT",
        "TelephoneCodePrefix": 262,
        "Name": "Mayotte",
        "ISO2": "YT"
      },
      {
        "ISOName": "CF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 178,
        "ISO3": "COG",
        "TelephoneCodePrefix": 242,
        "Name": "República del Congo",
        "ISO2": "CG"
      },
      {
        "ISOName": "CG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 180,
        "ISO3": "COD",
        "TelephoneCodePrefix": 243,
        "Name": "República Democrática del Cong",
        "ISO2": "CD"
      },
      {
        "ISOName": "CW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 184,
        "ISO3": "COK",
        "TelephoneCodePrefix": 682,
        "Name": "Islas Cook",
        "ISO2": "CK"
      },
      {
        "ISOName": "CS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 188,
        "ISO3": "CRI",
        "TelephoneCodePrefix": 506,
        "Name": "Costa Rica",
        "ISO2": "CR"
      },
      {
        "ISOName": "HR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 191,
        "ISO3": "HRV",
        "TelephoneCodePrefix": 385,
        "Name": "Croacia",
        "ISO2": "HR"
      },
      {
        "ISOName": "CU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 192,
        "ISO3": "CUB",
        "TelephoneCodePrefix": 53,
        "Name": "Cuba",
        "ISO2": "CU"
      },
      {
        "ISOName": "CY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 196,
        "ISO3": "CYP",
        "TelephoneCodePrefix": 357,
        "Name": "Chipre",
        "ISO2": "CY"
      },
      {
        "ISOName": "EZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 203,
        "ISO3": "CZE",
        "TelephoneCodePrefix": 420,
        "Name": "Chequia",
        "ISO2": "CZ"
      },
      {
        "ISOName": "BN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 204,
        "ISO3": "BEN",
        "TelephoneCodePrefix": 229,
        "Name": "Benín",
        "ISO2": "BJ"
      },
      {
        "ISOName": "DA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 208,
        "ISO3": "DNK",
        "TelephoneCodePrefix": 45,
        "Name": "Dinamarca",
        "ISO2": "DK"
      },
      {
        "ISOName": "DO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 212,
        "ISO3": "DMA",
        "TelephoneCodePrefix": 767,
        "Name": "Dominica",
        "ISO2": "DM"
      },
      {
        "ISOName": "DR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 214,
        "ISO3": "DOM",
        "TelephoneCodePrefix": 1809,
        "Name": "República Dominicana",
        "ISO2": "DO"
      },
      {
        "ISOName": "EC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 218,
        "ISO3": "ECU",
        "TelephoneCodePrefix": 593,
        "Name": "Ecuador",
        "ISO2": "EC"
      },
      {
        "ISOName": "ES",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 222,
        "ISO3": "SLV",
        "TelephoneCodePrefix": 503,
        "Name": "El Salvador",
        "ISO2": "SV"
      },
      {
        "ISOName": "EK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 226,
        "ISO3": "GNQ",
        "TelephoneCodePrefix": 240,
        "Name": "Guinea Ecuatorial",
        "ISO2": "GQ"
      },
      {
        "ISOName": "ET",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 231,
        "ISO3": "ETH",
        "TelephoneCodePrefix": 251,
        "Name": "Etiopía",
        "ISO2": "ET"
      },
      {
        "ISOName": "ER",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 232,
        "ISO3": "ERI",
        "TelephoneCodePrefix": 291,
        "Name": "Eritrea",
        "ISO2": "ER"
      },
      {
        "ISOName": "EN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 233,
        "ISO3": "EST",
        "TelephoneCodePrefix": 372,
        "Name": "Estonia",
        "ISO2": "EE"
      },
      {
        "ISOName": "FO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 234,
        "ISO3": "FRO",
        "TelephoneCodePrefix": 298,
        "Name": "Islas Feroe",
        "ISO2": "FO"
      },
      {
        "ISOName": "FK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 238,
        "ISO3": "FLK",
        "TelephoneCodePrefix": 500,
        "Name": "Islas Malvinas",
        "ISO2": "FK"
      },
      {
        "ISOName": "SX",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 239,
        "ISO3": "SGS",
        "TelephoneCodePrefix": 500,
        "Name": "Georgia del Sur y las Islas Sa",
        "ISO2": "GS"
      },
      {
        "ISOName": "FJ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 242,
        "ISO3": "FJI",
        "TelephoneCodePrefix": 679,
        "Name": "Fiji",
        "ISO2": "FJ"
      },
      {
        "ISOName": "FI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 246,
        "ISO3": "FIN",
        "TelephoneCodePrefix": 358,
        "Name": "Finlandia",
        "ISO2": "FI"
      },
      {
        "ISOName": "",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 248,
        "ISO3": "ALA",
        "TelephoneCodePrefix": 358,
        "Name": "Islas Åland",
        "ISO2": "AX"
      },
      {
        "ISOName": "FR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 250,
        "ISO3": "FRA",
        "TelephoneCodePrefix": 33,
        "Name": "Francia",
        "ISO2": "FR"
      },
      {
        "ISOName": "FG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 254,
        "ISO3": "GUF",
        "TelephoneCodePrefix": 594,
        "Name": "Guayana Francesa",
        "ISO2": "GF"
      },
      {
        "ISOName": "FP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 258,
        "ISO3": "PYF",
        "TelephoneCodePrefix": 689,
        "Name": "Polinesia Francesa",
        "ISO2": "PF"
      },
      {
        "ISOName": "FS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 260,
        "ISO3": "ATF",
        "TelephoneCodePrefix": 262,
        "Name": "Territorios Australes y Antárt",
        "ISO2": "TF"
      },
      {
        "ISOName": "DJ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 262,
        "ISO3": "DJI",
        "TelephoneCodePrefix": 253,
        "Name": "Yibuti",
        "ISO2": "DJ"
      },
      {
        "ISOName": "GB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 266,
        "ISO3": "GAB",
        "TelephoneCodePrefix": 241,
        "Name": "Gabón",
        "ISO2": "GA"
      },
      {
        "ISOName": "GG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 268,
        "ISO3": "GEO",
        "TelephoneCodePrefix": 995,
        "Name": "Georgia",
        "ISO2": "GE"
      },
      {
        "ISOName": "GA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 270,
        "ISO3": "GMB",
        "TelephoneCodePrefix": 220,
        "Name": "Gambia",
        "ISO2": "GM"
      },
      {
        "ISOName": "WE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 275,
        "ISO3": "PSE",
        "TelephoneCodePrefix": 970,
        "Name": "Palestina",
        "ISO2": "PS"
      },
      {
        "ISOName": "GM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 276,
        "ISO3": "DEU",
        "TelephoneCodePrefix": 49,
        "Name": "Alemania",
        "ISO2": "DE"
      },
      {
        "ISOName": "GH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 288,
        "ISO3": "GHA",
        "TelephoneCodePrefix": 233,
        "Name": "Ghana",
        "ISO2": "GH"
      },
      {
        "ISOName": "GI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 292,
        "ISO3": "GIB",
        "TelephoneCodePrefix": 350,
        "Name": "Gibraltar",
        "ISO2": "GI"
      },
      {
        "ISOName": "KR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 296,
        "ISO3": "KIR",
        "TelephoneCodePrefix": 686,
        "Name": "Kiribati",
        "ISO2": "KI"
      },
      {
        "ISOName": "GR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 300,
        "ISO3": "GRC",
        "TelephoneCodePrefix": 30,
        "Name": "Grecia",
        "ISO2": "GR"
      },
      {
        "ISOName": "GL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 304,
        "ISO3": "GRL",
        "TelephoneCodePrefix": 299,
        "Name": "Groenlandia",
        "ISO2": "GL"
      },
      {
        "ISOName": "GJ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 308,
        "ISO3": "GRD",
        "TelephoneCodePrefix": 1473,
        "Name": "Granada",
        "ISO2": "GD"
      },
      {
        "ISOName": "GP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 312,
        "ISO3": "GLP",
        "TelephoneCodePrefix": 590,
        "Name": "Guadalupe",
        "ISO2": "GP"
      },
      {
        "ISOName": "GQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 316,
        "ISO3": "GUM",
        "TelephoneCodePrefix": 1671,
        "Name": "Guam",
        "ISO2": "GU"
      },
      {
        "ISOName": "GT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 320,
        "ISO3": "GTM",
        "TelephoneCodePrefix": 502,
        "Name": "Guatemala",
        "ISO2": "GT"
      },
      {
        "ISOName": "GV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 324,
        "ISO3": "GIN",
        "TelephoneCodePrefix": 224,
        "Name": "Guinea",
        "ISO2": "GN"
      },
      {
        "ISOName": "GY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 328,
        "ISO3": "GUY",
        "TelephoneCodePrefix": 592,
        "Name": "Guayana",
        "ISO2": "GY"
      },
      {
        "ISOName": "HA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 332,
        "ISO3": "HTI",
        "TelephoneCodePrefix": 509,
        "Name": "Haití",
        "ISO2": "HT"
      },
      {
        "ISOName": "HM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 334,
        "ISO3": "HMD",
        "TelephoneCodePrefix": 0,
        "Name": "Islas Heard y McDonald",
        "ISO2": "HM"
      },
      {
        "ISOName": "VT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 336,
        "ISO3": "VAT",
        "TelephoneCodePrefix": 39,
        "Name": "Ciudad del Vaticano",
        "ISO2": "VA"
      },
      {
        "ISOName": "HO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 340,
        "ISO3": "HND",
        "TelephoneCodePrefix": 504,
        "Name": "Honduras",
        "ISO2": "HN"
      },
      {
        "ISOName": "HK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 344,
        "ISO3": "HKG",
        "TelephoneCodePrefix": 852,
        "Name": "Hong Kong",
        "ISO2": "HK"
      },
      {
        "ISOName": "HU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 348,
        "ISO3": "HUN",
        "TelephoneCodePrefix": 36,
        "Name": "Hungría",
        "ISO2": "HU"
      },
      {
        "ISOName": "IC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 352,
        "ISO3": "ISL",
        "TelephoneCodePrefix": 354,
        "Name": "Islandia",
        "ISO2": "IS"
      },
      {
        "ISOName": "IN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 356,
        "ISO3": "IND",
        "TelephoneCodePrefix": 91,
        "Name": "India",
        "ISO2": "IN"
      },
      {
        "ISOName": "ID",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 360,
        "ISO3": "IDN",
        "TelephoneCodePrefix": 62,
        "Name": "Indonesia",
        "ISO2": "ID"
      },
      {
        "ISOName": "IR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 364,
        "ISO3": "IRN",
        "TelephoneCodePrefix": 98,
        "Name": "Irán",
        "ISO2": "IR"
      },
      {
        "ISOName": "IZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 368,
        "ISO3": "IRQ",
        "TelephoneCodePrefix": 964,
        "Name": "Iraq",
        "ISO2": "IQ"
      },
      {
        "ISOName": "EI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 372,
        "ISO3": "IRL",
        "TelephoneCodePrefix": 353,
        "Name": "Irlanda",
        "ISO2": "IE"
      },
      {
        "ISOName": "IS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 376,
        "ISO3": "ISR",
        "TelephoneCodePrefix": 972,
        "Name": "Israel",
        "ISO2": "IL"
      },
      {
        "ISOName": "IT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 380,
        "ISO3": "ITA",
        "TelephoneCodePrefix": 39,
        "Name": "Italia",
        "ISO2": "IT"
      },
      {
        "ISOName": "IV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 384,
        "ISO3": "CIV",
        "TelephoneCodePrefix": 225,
        "Name": "Costa de Marfil",
        "ISO2": "CI"
      },
      {
        "ISOName": "JM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 388,
        "ISO3": "JAM",
        "TelephoneCodePrefix": 1876,
        "Name": "Jamaica",
        "ISO2": "JM"
      },
      {
        "ISOName": "JA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 392,
        "ISO3": "JPN",
        "TelephoneCodePrefix": 81,
        "Name": "Japón",
        "ISO2": "JP"
      },
      {
        "ISOName": "KZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 398,
        "ISO3": "KAZ",
        "TelephoneCodePrefix": 7,
        "Name": "Kazajstán",
        "ISO2": "KZ"
      },
      {
        "ISOName": "JO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 400,
        "ISO3": "JOR",
        "TelephoneCodePrefix": 962,
        "Name": "Jordania",
        "ISO2": "JO"
      },
      {
        "ISOName": "KE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 404,
        "ISO3": "KEN",
        "TelephoneCodePrefix": 254,
        "Name": "Kenia",
        "ISO2": "KE"
      },
      {
        "ISOName": "KN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 408,
        "ISO3": "PRK",
        "TelephoneCodePrefix": 850,
        "Name": "Corea del Norte",
        "ISO2": "KP"
      },
      {
        "ISOName": "KS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 410,
        "ISO3": "KOR",
        "TelephoneCodePrefix": 82,
        "Name": "Corea del Sur",
        "ISO2": "KR"
      },
      {
        "ISOName": "KU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 414,
        "ISO3": "KWT",
        "TelephoneCodePrefix": 965,
        "Name": "Kuwait",
        "ISO2": "KW"
      },
      {
        "ISOName": "KG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 417,
        "ISO3": "KGZ",
        "TelephoneCodePrefix": 996,
        "Name": "Kirguistán",
        "ISO2": "KG"
      },
      {
        "ISOName": "LA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 418,
        "ISO3": "LAO",
        "TelephoneCodePrefix": 856,
        "Name": "Laos",
        "ISO2": "LA"
      },
      {
        "ISOName": "LE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 422,
        "ISO3": "LBN",
        "TelephoneCodePrefix": 961,
        "Name": "Líbano",
        "ISO2": "LB"
      },
      {
        "ISOName": "LT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 426,
        "ISO3": "LSO",
        "TelephoneCodePrefix": 266,
        "Name": "Lesotho",
        "ISO2": "LS"
      },
      {
        "ISOName": "LG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 428,
        "ISO3": "LVA",
        "TelephoneCodePrefix": 371,
        "Name": "Letonia",
        "ISO2": "LV"
      },
      {
        "ISOName": "LI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 430,
        "ISO3": "LBR",
        "TelephoneCodePrefix": 231,
        "Name": "Liberia",
        "ISO2": "LR"
      },
      {
        "ISOName": "LY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 434,
        "ISO3": "LBY",
        "TelephoneCodePrefix": 218,
        "Name": "Libia",
        "ISO2": "LY"
      },
      {
        "ISOName": "LS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 438,
        "ISO3": "LIE",
        "TelephoneCodePrefix": 423,
        "Name": "Liechtenstein",
        "ISO2": "LI"
      },
      {
        "ISOName": "LH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 440,
        "ISO3": "LTU",
        "TelephoneCodePrefix": 370,
        "Name": "Lituania",
        "ISO2": "LT"
      },
      {
        "ISOName": "LU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 442,
        "ISO3": "LUX",
        "TelephoneCodePrefix": 352,
        "Name": "Luxemburgo",
        "ISO2": "LU"
      },
      {
        "ISOName": "MC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 446,
        "ISO3": "MAC",
        "TelephoneCodePrefix": 853,
        "Name": "Macao",
        "ISO2": "MO"
      },
      {
        "ISOName": "MA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 450,
        "ISO3": "MDG",
        "TelephoneCodePrefix": 261,
        "Name": "Madagascar",
        "ISO2": "MG"
      },
      {
        "ISOName": "MI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 454,
        "ISO3": "MWI",
        "TelephoneCodePrefix": 265,
        "Name": "Malaui",
        "ISO2": "MW"
      },
      {
        "ISOName": "MY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 458,
        "ISO3": "MYS",
        "TelephoneCodePrefix": 60,
        "Name": "Malasia",
        "ISO2": "MY"
      },
      {
        "ISOName": "MV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 462,
        "ISO3": "MDV",
        "TelephoneCodePrefix": 960,
        "Name": "Maldivas",
        "ISO2": "MV"
      },
      {
        "ISOName": "ML",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 466,
        "ISO3": "MLI",
        "TelephoneCodePrefix": 223,
        "Name": "Malí",
        "ISO2": "ML"
      },
      {
        "ISOName": "MT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 470,
        "ISO3": "MLT",
        "TelephoneCodePrefix": 356,
        "Name": "Malta",
        "ISO2": "MT"
      },
      {
        "ISOName": "MB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 474,
        "ISO3": "MTQ",
        "TelephoneCodePrefix": 596,
        "Name": "Martinica",
        "ISO2": "MQ"
      },
      {
        "ISOName": "MR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 478,
        "ISO3": "MRT",
        "TelephoneCodePrefix": 222,
        "Name": "Mauritania",
        "ISO2": "MR"
      },
      {
        "ISOName": "MP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 480,
        "ISO3": "MUS",
        "TelephoneCodePrefix": 230,
        "Name": "Isla Mauricio",
        "ISO2": "MU"
      },
      {
        "ISOName": "MX",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 484,
        "ISO3": "MEX",
        "TelephoneCodePrefix": 52,
        "Name": "México",
        "ISO2": "MX"
      },
      {
        "ISOName": "MN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 492,
        "ISO3": "MCO",
        "TelephoneCodePrefix": 377,
        "Name": "Principado de Mónaco",
        "ISO2": "MC"
      },
      {
        "ISOName": "MG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 496,
        "ISO3": "MNG",
        "TelephoneCodePrefix": 976,
        "Name": "Mongolia",
        "ISO2": "MN"
      },
      {
        "ISOName": "MD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 498,
        "ISO3": "MDA",
        "TelephoneCodePrefix": 373,
        "Name": "Moldavia",
        "ISO2": "MD"
      },
      {
        "ISOName": "MJ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 499,
        "ISO3": "MNE",
        "TelephoneCodePrefix": 382,
        "Name": "Montenegro",
        "ISO2": "ME"
      },
      {
        "ISOName": "MH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 500,
        "ISO3": "MSR",
        "TelephoneCodePrefix": 1664,
        "Name": "Montserrat",
        "ISO2": "MS"
      },
      {
        "ISOName": "MO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 504,
        "ISO3": "MAR",
        "TelephoneCodePrefix": 212,
        "Name": "Marruecos",
        "ISO2": "MA"
      },
      {
        "ISOName": "MZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 508,
        "ISO3": "MOZ",
        "TelephoneCodePrefix": 258,
        "Name": "Mozambique",
        "ISO2": "MZ"
      },
      {
        "ISOName": "MU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 512,
        "ISO3": "OMN",
        "TelephoneCodePrefix": 968,
        "Name": "Omán",
        "ISO2": "OM"
      },
      {
        "ISOName": "WA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 516,
        "ISO3": "NAM",
        "TelephoneCodePrefix": 264,
        "Name": "Namibia",
        "ISO2": "NA"
      },
      {
        "ISOName": "NR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 520,
        "ISO3": "NRU",
        "TelephoneCodePrefix": 674,
        "Name": "Nauru",
        "ISO2": "NR"
      },
      {
        "ISOName": "NP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 524,
        "ISO3": "NPL",
        "TelephoneCodePrefix": 977,
        "Name": "Nepal",
        "ISO2": "NP"
      },
      {
        "ISOName": "NL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 528,
        "ISO3": "NLD",
        "TelephoneCodePrefix": 31,
        "Name": "Países Bajos",
        "ISO2": "NL"
      },
      {
        "ISOName": "UC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 531,
        "ISO3": "CUW",
        "TelephoneCodePrefix": 5999,
        "Name": "Curaçao",
        "ISO2": "CW"
      },
      {
        "ISOName": "AA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 533,
        "ISO3": "ABW",
        "TelephoneCodePrefix": 297,
        "Name": "Aruba",
        "ISO2": "AW"
      },
      {
        "ISOName": "NN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 534,
        "ISO3": "SXM",
        "TelephoneCodePrefix": 721,
        "Name": "Sint Maarten",
        "ISO2": "SX"
      },
      {
        "ISOName": "",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 535,
        "ISO3": "BES",
        "TelephoneCodePrefix": 599,
        "Name": "Caribe Neerlandés",
        "ISO2": "BQ"
      },
      {
        "ISOName": "NC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 540,
        "ISO3": "NCL",
        "TelephoneCodePrefix": 687,
        "Name": "Nueva Caledonia",
        "ISO2": "NC"
      },
      {
        "ISOName": "NH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 548,
        "ISO3": "VUT",
        "TelephoneCodePrefix": 678,
        "Name": "Vanuatu",
        "ISO2": "VU"
      },
      {
        "ISOName": "NZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 554,
        "ISO3": "NZL",
        "TelephoneCodePrefix": 64,
        "Name": "Nueva Zelandia",
        "ISO2": "NZ"
      },
      {
        "ISOName": "NU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 558,
        "ISO3": "NIC",
        "TelephoneCodePrefix": 505,
        "Name": "Nicaragua",
        "ISO2": "NI"
      },
      {
        "ISOName": "NG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 562,
        "ISO3": "NER",
        "TelephoneCodePrefix": 227,
        "Name": "Níger",
        "ISO2": "NE"
      },
      {
        "ISOName": "NI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 566,
        "ISO3": "NGA",
        "TelephoneCodePrefix": 234,
        "Name": "Nigeria",
        "ISO2": "NG"
      },
      {
        "ISOName": "NE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 570,
        "ISO3": "NIU",
        "TelephoneCodePrefix": 683,
        "Name": "Niue",
        "ISO2": "NU"
      },
      {
        "ISOName": "NF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 574,
        "ISO3": "NFK",
        "TelephoneCodePrefix": 672,
        "Name": "Isla Norfolk",
        "ISO2": "NF"
      },
      {
        "ISOName": "NO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 578,
        "ISO3": "NOR",
        "TelephoneCodePrefix": 47,
        "Name": "Noruega",
        "ISO2": "NO"
      },
      {
        "ISOName": "CQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 580,
        "ISO3": "MNP",
        "TelephoneCodePrefix": 1670,
        "Name": "Islas Marianas del Norte",
        "ISO2": "MP"
      },
      {
        "ISOName": "",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 581,
        "ISO3": "UMI",
        "TelephoneCodePrefix": 0,
        "Name": "Islas Ultramarinas Menores de",
        "ISO2": "UM"
      },
      {
        "ISOName": "FM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 583,
        "ISO3": "FSM",
        "TelephoneCodePrefix": 691,
        "Name": "Estados Federados de Micronesi",
        "ISO2": "FM"
      },
      {
        "ISOName": "RM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 584,
        "ISO3": "MHL",
        "TelephoneCodePrefix": 692,
        "Name": "Islas Marshall",
        "ISO2": "MH"
      },
      {
        "ISOName": "PS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 585,
        "ISO3": "PLW",
        "TelephoneCodePrefix": 680,
        "Name": "Palaos",
        "ISO2": "PW"
      },
      {
        "ISOName": "PK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 586,
        "ISO3": "PAK",
        "TelephoneCodePrefix": 92,
        "Name": "Pakistán",
        "ISO2": "PK"
      },
      {
        "ISOName": "PM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 591,
        "ISO3": "PAN",
        "TelephoneCodePrefix": 507,
        "Name": "Panamá",
        "ISO2": "PA"
      },
      {
        "ISOName": "PP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 598,
        "ISO3": "PNG",
        "TelephoneCodePrefix": 675,
        "Name": "Papúa Nueva Guinea",
        "ISO2": "PG"
      },
      {
        "ISOName": "PA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 600,
        "ISO3": "PRY",
        "TelephoneCodePrefix": 595,
        "Name": "Paraguay",
        "ISO2": "PY"
      },
      {
        "ISOName": "PE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 604,
        "ISO3": "PER",
        "TelephoneCodePrefix": 51,
        "Name": "Perú",
        "ISO2": "PE"
      },
      {
        "ISOName": "RP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 608,
        "ISO3": "PHL",
        "TelephoneCodePrefix": 63,
        "Name": "Filipinas",
        "ISO2": "PH"
      },
      {
        "ISOName": "PC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 612,
        "ISO3": "PCN",
        "TelephoneCodePrefix": 870,
        "Name": "Islas Pitcairn",
        "ISO2": "PN"
      },
      {
        "ISOName": "PL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 616,
        "ISO3": "POL",
        "TelephoneCodePrefix": 48,
        "Name": "Polonia",
        "ISO2": "PL"
      },
      {
        "ISOName": "PO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 620,
        "ISO3": "PRT",
        "TelephoneCodePrefix": 351,
        "Name": "Portugal",
        "ISO2": "PT"
      },
      {
        "ISOName": "PU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 624,
        "ISO3": "GNB",
        "TelephoneCodePrefix": 245,
        "Name": "Guinea-Bissau",
        "ISO2": "GW"
      },
      {
        "ISOName": "TT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 626,
        "ISO3": "TLS",
        "TelephoneCodePrefix": 670,
        "Name": "Timor Oriental",
        "ISO2": "TL"
      },
      {
        "ISOName": "RQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 630,
        "ISO3": "PRI",
        "TelephoneCodePrefix": 1,
        "Name": "Puerto Rico",
        "ISO2": "PR"
      },
      {
        "ISOName": "QA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 634,
        "ISO3": "QAT",
        "TelephoneCodePrefix": 974,
        "Name": "Catar",
        "ISO2": "QA"
      },
      {
        "ISOName": "RE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 638,
        "ISO3": "REU",
        "TelephoneCodePrefix": 262,
        "Name": "Reunión",
        "ISO2": "RE"
      },
      {
        "ISOName": "RO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 642,
        "ISO3": "ROU",
        "TelephoneCodePrefix": 40,
        "Name": "Rumania",
        "ISO2": "RO"
      },
      {
        "ISOName": "RS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 643,
        "ISO3": "RUS",
        "TelephoneCodePrefix": 7,
        "Name": "Rusia",
        "ISO2": "RU"
      },
      {
        "ISOName": "RW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 646,
        "ISO3": "RWA",
        "TelephoneCodePrefix": 250,
        "Name": "Ruanda",
        "ISO2": "RW"
      },
      {
        "ISOName": "TB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 652,
        "ISO3": "BLM",
        "TelephoneCodePrefix": 590,
        "Name": "San Bartolomé",
        "ISO2": "BL"
      },
      {
        "ISOName": "SH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 654,
        "ISO3": "SHN",
        "TelephoneCodePrefix": 290,
        "Name": "Santa Elena, Ascensión y Trist",
        "ISO2": "SH"
      },
      {
        "ISOName": "SC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 659,
        "ISO3": "KNA",
        "TelephoneCodePrefix": 1869,
        "Name": "San Cristóbal y Nieves",
        "ISO2": "KN"
      },
      {
        "ISOName": "AV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 660,
        "ISO3": "AIA",
        "TelephoneCodePrefix": 1264,
        "Name": "Anguila",
        "ISO2": "AI"
      },
      {
        "ISOName": "ST",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 662,
        "ISO3": "LCA",
        "TelephoneCodePrefix": 1758,
        "Name": "Santa Lucía",
        "ISO2": "LC"
      },
      {
        "ISOName": "RN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 663,
        "ISO3": "MAF",
        "TelephoneCodePrefix": 1599,
        "Name": "Isla de San Martín",
        "ISO2": "MF"
      },
      {
        "ISOName": "SB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 666,
        "ISO3": "SPM",
        "TelephoneCodePrefix": 508,
        "Name": "San Pedro y Miquelón",
        "ISO2": "PM"
      },
      {
        "ISOName": "VC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 670,
        "ISO3": "VCT",
        "TelephoneCodePrefix": 1784,
        "Name": "San Vicente y las Granadinas",
        "ISO2": "VC"
      },
      {
        "ISOName": "SM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 674,
        "ISO3": "SMR",
        "TelephoneCodePrefix": 378,
        "Name": "San Marino",
        "ISO2": "SM"
      },
      {
        "ISOName": "TP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 678,
        "ISO3": "STP",
        "TelephoneCodePrefix": 239,
        "Name": "Santo Tomé y Príncipe",
        "ISO2": "ST"
      },
      {
        "ISOName": "SA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 682,
        "ISO3": "SAU",
        "TelephoneCodePrefix": 966,
        "Name": "Arabia Saudita",
        "ISO2": "SA"
      },
      {
        "ISOName": "SG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 686,
        "ISO3": "SEN",
        "TelephoneCodePrefix": 221,
        "Name": "Senegal",
        "ISO2": "SN"
      },
      {
        "ISOName": "RI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 688,
        "ISO3": "SRB",
        "TelephoneCodePrefix": 381,
        "Name": "Serbia",
        "ISO2": "RS"
      },
      {
        "ISOName": "SE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 690,
        "ISO3": "SYC",
        "TelephoneCodePrefix": 248,
        "Name": "Seychelles",
        "ISO2": "SC"
      },
      {
        "ISOName": "SL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 694,
        "ISO3": "SLE",
        "TelephoneCodePrefix": 232,
        "Name": "Sierra Leona",
        "ISO2": "SL"
      },
      {
        "ISOName": "SN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 702,
        "ISO3": "SGP",
        "TelephoneCodePrefix": 65,
        "Name": "Singapur",
        "ISO2": "SG"
      },
      {
        "ISOName": "LO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 703,
        "ISO3": "SVK",
        "TelephoneCodePrefix": 421,
        "Name": "Eslovaquia",
        "ISO2": "SK"
      },
      {
        "ISOName": "VM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 704,
        "ISO3": "VNM",
        "TelephoneCodePrefix": 84,
        "Name": "Vietnam",
        "ISO2": "VN"
      },
      {
        "ISOName": "SI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 705,
        "ISO3": "SVN",
        "TelephoneCodePrefix": 386,
        "Name": "Eslovenia",
        "ISO2": "SI"
      },
      {
        "ISOName": "SO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 706,
        "ISO3": "SOM",
        "TelephoneCodePrefix": 252,
        "Name": "Somalia",
        "ISO2": "SO"
      },
      {
        "ISOName": "SF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 710,
        "ISO3": "ZAF",
        "TelephoneCodePrefix": 27,
        "Name": "Sudáfrica",
        "ISO2": "ZA"
      },
      {
        "ISOName": "ZI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 716,
        "ISO3": "ZWE",
        "TelephoneCodePrefix": 263,
        "Name": "Zimbabue",
        "ISO2": "ZW"
      },
      {
        "ISOName": "SP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 724,
        "ISO3": "ESP",
        "TelephoneCodePrefix": 34,
        "Name": "España",
        "ISO2": "ES"
      },
      {
        "ISOName": "",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 728,
        "ISO3": "SSD",
        "TelephoneCodePrefix": 211,
        "Name": "Sudán del Sur",
        "ISO2": "SS"
      },
      {
        "ISOName": "SU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 729,
        "ISO3": "SDN",
        "TelephoneCodePrefix": 249,
        "Name": "Sudán",
        "ISO2": "SD"
      },
      {
        "ISOName": "WI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 732,
        "ISO3": "ESH",
        "TelephoneCodePrefix": 212,
        "Name": "Sáhara Occidental",
        "ISO2": "EH"
      },
      {
        "ISOName": "NS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 740,
        "ISO3": "SUR",
        "TelephoneCodePrefix": 597,
        "Name": "Surinam",
        "ISO2": "SR"
      },
      {
        "ISOName": "SV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 744,
        "ISO3": "SJM",
        "TelephoneCodePrefix": 47,
        "Name": "Svalbard y Jan Mayen",
        "ISO2": "SJ"
      },
      {
        "ISOName": "WZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 748,
        "ISO3": "SWZ",
        "TelephoneCodePrefix": 268,
        "Name": "Esuatini",
        "ISO2": "SZ"
      },
      {
        "ISOName": "SW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 752,
        "ISO3": "SWE",
        "TelephoneCodePrefix": 46,
        "Name": "Suecia",
        "ISO2": "SE"
      },
      {
        "ISOName": "SZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 756,
        "ISO3": "CHE",
        "TelephoneCodePrefix": 41,
        "Name": "Suiza",
        "ISO2": "CH"
      },
      {
        "ISOName": "SY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 760,
        "ISO3": "SYR",
        "TelephoneCodePrefix": 963,
        "Name": "Siria",
        "ISO2": "SY"
      },
      {
        "ISOName": "TI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 762,
        "ISO3": "TJK",
        "TelephoneCodePrefix": 992,
        "Name": "Tayikistán",
        "ISO2": "TJ"
      },
      {
        "ISOName": "TH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 764,
        "ISO3": "THA",
        "TelephoneCodePrefix": 66,
        "Name": "Tailandia",
        "ISO2": "TH"
      },
      {
        "ISOName": "TO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 768,
        "ISO3": "TGO",
        "TelephoneCodePrefix": 228,
        "Name": "Togo",
        "ISO2": "TG"
      },
      {
        "ISOName": "TL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 772,
        "ISO3": "TKL",
        "TelephoneCodePrefix": 690,
        "Name": "Tokelau",
        "ISO2": "TK"
      },
      {
        "ISOName": "TN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 776,
        "ISO3": "TON",
        "TelephoneCodePrefix": 676,
        "Name": "Tonga",
        "ISO2": "TO"
      },
      {
        "ISOName": "TD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 780,
        "ISO3": "TTO",
        "TelephoneCodePrefix": 1868,
        "Name": "Trinidad y Tobago",
        "ISO2": "TT"
      },
      {
        "ISOName": "AE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 784,
        "ISO3": "ARE",
        "TelephoneCodePrefix": 971,
        "Name": "Emiratos Árabes Unidos",
        "ISO2": "AE"
      },
      {
        "ISOName": "TS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 788,
        "ISO3": "TUN",
        "TelephoneCodePrefix": 216,
        "Name": "Túnez",
        "ISO2": "TN"
      },
      {
        "ISOName": "TU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 792,
        "ISO3": "TUR",
        "TelephoneCodePrefix": 90,
        "Name": "Turquía",
        "ISO2": "TR"
      },
      {
        "ISOName": "TX",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 795,
        "ISO3": "TKM",
        "TelephoneCodePrefix": 993,
        "Name": "Turkmenistán",
        "ISO2": "TM"
      },
      {
        "ISOName": "TK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 796,
        "ISO3": "TCA",
        "TelephoneCodePrefix": 1649,
        "Name": "Islas Turcas y Caicos",
        "ISO2": "TC"
      },
      {
        "ISOName": "TV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 798,
        "ISO3": "TUV",
        "TelephoneCodePrefix": 688,
        "Name": "Tuvalu",
        "ISO2": "TV"
      },
      {
        "ISOName": "UG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 800,
        "ISO3": "UGA",
        "TelephoneCodePrefix": 256,
        "Name": "Uganda",
        "ISO2": "UG"
      },
      {
        "ISOName": "UP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 804,
        "ISO3": "UKR",
        "TelephoneCodePrefix": 380,
        "Name": "Ucrania",
        "ISO2": "UA"
      },
      {
        "ISOName": "MK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 807,
        "ISO3": "MKD",
        "TelephoneCodePrefix": 389,
        "Name": "Macedonia del Norte",
        "ISO2": "MK"
      },
      {
        "ISOName": "EG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 818,
        "ISO3": "EGY",
        "TelephoneCodePrefix": 20,
        "Name": "Egipto",
        "ISO2": "EG"
      },
      {
        "ISOName": "UK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 826,
        "ISO3": "GBR",
        "TelephoneCodePrefix": 44,
        "Name": "Reino Unido",
        "ISO2": "GB"
      },
      {
        "ISOName": "GK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 831,
        "ISO3": "GGY",
        "TelephoneCodePrefix": 4148,
        "Name": "Bailía de Guernsey",
        "ISO2": "GG"
      },
      {
        "ISOName": "JE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 832,
        "ISO3": "JEY",
        "TelephoneCodePrefix": 44,
        "Name": "Jersey",
        "ISO2": "JE"
      },
      {
        "ISOName": "",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 833,
        "ISO3": "IMN",
        "TelephoneCodePrefix": 44,
        "Name": "Isla de Man",
        "ISO2": "IM"
      },
      {
        "ISOName": "TZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 834,
        "ISO3": "TZA",
        "TelephoneCodePrefix": 255,
        "Name": "Tanzania",
        "ISO2": "TZ"
      },
      {
        "ISOName": "US",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 840,
        "ISO3": "USA",
        "TelephoneCodePrefix": 1,
        "Name": "Estados Unidos de América",
        "ISO2": "US"
      },
      {
        "ISOName": "VQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 850,
        "ISO3": "VIR",
        "TelephoneCodePrefix": 1340,
        "Name": "Islas Vírgenes Americanas",
        "ISO2": "VI"
      },
      {
        "ISOName": "UV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 854,
        "ISO3": "BFA",
        "TelephoneCodePrefix": 226,
        "Name": "Burkina Faso",
        "ISO2": "BF"
      },
      {
        "ISOName": "UY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 858,
        "ISO3": "URY",
        "TelephoneCodePrefix": 598,
        "Name": "URUGUAY",
        "ISO2": "UY"
      },
      {
        "ISOName": "UZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 860,
        "ISO3": "UZB",
        "TelephoneCodePrefix": 998,
        "Name": "Uzbekistán",
        "ISO2": "UZ"
      },
      {
        "ISOName": "VE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 862,
        "ISO3": "VEN",
        "TelephoneCodePrefix": 58,
        "Name": "Venezuela",
        "ISO2": "VE"
      },
      {
        "ISOName": "WF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 876,
        "ISO3": "WLF",
        "TelephoneCodePrefix": 681,
        "Name": "Wallis y Futuna",
        "ISO2": "WF"
      },
      {
        "ISOName": "WS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 882,
        "ISO3": "WSM",
        "TelephoneCodePrefix": 685,
        "Name": "Samoa",
        "ISO2": "WS"
      },
      {
        "ISOName": "YM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 887,
        "ISO3": "YEM",
        "TelephoneCodePrefix": 967,
        "Name": "Yemen",
        "ISO2": "YE"
      },
      {
        "ISOName": "ZA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 894,
        "ISO3": "ZMB",
        "TelephoneCodePrefix": 260,
        "Name": "Zambia",
        "ISO2": "ZM"
      },
      {
        "ISOName": "PAI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        },
        "Id": 905,
        "ISO3": "PAI",
        "TelephoneCodePrefix": 598,
        "Name": "PAIS PRUEBA",
        "ISO2": "PA"
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTCNWCountry

### SdtsBTCNWCountry

::: center
Los campos del tipo de dato estructurado SdtsBTCNWCountry son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
EconomicBlocs | [SdtsBTCNWEconomicBloc](#sdtsbtcnweconomicbloc) | Bloques económicos.
Id | Short $<(Length: 3)>$ | Identificador del país.
ISO2 | String $<(Length: 2)>$ | ISO2.
ISO3 | String $<(Length: 3)>$ | ISO3.
ISOName | String $<(Length: 50)>$ | Nombre ISO.
Name | String $<(Length: 30)>$ | Nombre del país.
TelephoneCodePrefix | Short $<(Length: 4)>$ | Prefijo telefónico.
:::

::: details SdtsBTCNWEconomicBloc

### SdtsBTCNWEconomicBloc

::: center
Los campos del tipo de dato estructurado SdtsBTCNWEconomicBloc son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Id | Short $<(Length: 3)>$ | Identificador del bloque económico.
Description | String $<(Length: 50)>$ | Descripción del bloque económico.
:::
<!-- CIERRA SDT -->
