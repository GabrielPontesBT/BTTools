---
title: Get Countries
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de países.

**Nombre publicación:** PublicGeneral.getCountries

**Módulo:** General

**Programa:** PublicAPI.BTCNPA0001

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
countries | [SdtsBTCNWCountry](#sdtsbtcnwcountry) | Listado de países.

@tab Errores

Código | Descripción
:--------- | :-----------
Completar manualmente | Completar manualmente

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
    "Token": "E7227F065D421A5B5267C8DB"
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
    "Token": "E7227F065D421A5B5267C8DB"
  },
  "countries": {
    "country": [
      {
        "Id": 4,
        "Name": "Afganistán",
        "TelephoneCodePrefix": 93,
        "ISOName": "AF",
        "ISO2": "AF",
        "ISO3": "AFG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 8,
        "Name": "Albania",
        "TelephoneCodePrefix": 355,
        "ISOName": "AL",
        "ISO2": "AL",
        "ISO3": "ALB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 10,
        "Name": "Antártida",
        "TelephoneCodePrefix": 672,
        "ISOName": "AY",
        "ISO2": "AQ",
        "ISO3": "ATA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 12,
        "Name": "Argelia",
        "TelephoneCodePrefix": 213,
        "ISOName": "AG",
        "ISO2": "DZ",
        "ISO3": "DZA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 16,
        "Name": "Samoa Americana",
        "TelephoneCodePrefix": 1684,
        "ISOName": "AQ",
        "ISO2": "AS",
        "ISO3": "ASM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 20,
        "Name": "Andorra",
        "TelephoneCodePrefix": 376,
        "ISOName": "AN",
        "ISO2": "AD",
        "ISO3": "AND",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 24,
        "Name": "Angola",
        "TelephoneCodePrefix": 244,
        "ISOName": "AO",
        "ISO2": "AO",
        "ISO3": "AGO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 28,
        "Name": "Antigua y Barbuda",
        "TelephoneCodePrefix": 1268,
        "ISOName": "AC",
        "ISO2": "AG",
        "ISO3": "ATG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 31,
        "Name": "Azerbaiyán",
        "TelephoneCodePrefix": 994,
        "ISOName": "AJ",
        "ISO2": "AZ",
        "ISO3": "AZE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 32,
        "Name": "Argentina",
        "TelephoneCodePrefix": 54,
        "ISOName": "AR",
        "ISO2": "AR",
        "ISO3": "ARG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 36,
        "Name": "Australia",
        "TelephoneCodePrefix": 61,
        "ISOName": "AS",
        "ISO2": "AU",
        "ISO3": "AUS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 40,
        "Name": "Austria",
        "TelephoneCodePrefix": 43,
        "ISOName": "AU",
        "ISO2": "AT",
        "ISO3": "AUT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 44,
        "Name": "Bahamas",
        "TelephoneCodePrefix": 1242,
        "ISOName": "BF",
        "ISO2": "BS",
        "ISO3": "BHS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 48,
        "Name": "Bahrein",
        "TelephoneCodePrefix": 973,
        "ISOName": "BA",
        "ISO2": "BH",
        "ISO3": "BHR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 50,
        "Name": "Bangladesh",
        "TelephoneCodePrefix": 880,
        "ISOName": "BG",
        "ISO2": "BD",
        "ISO3": "BGD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 51,
        "Name": "Armenia",
        "TelephoneCodePrefix": 374,
        "ISOName": "AM",
        "ISO2": "AM",
        "ISO3": "ARM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 52,
        "Name": "Barbados",
        "TelephoneCodePrefix": 1246,
        "ISOName": "BB",
        "ISO2": "BB",
        "ISO3": "BRB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 56,
        "Name": "Bélgica",
        "TelephoneCodePrefix": 32,
        "ISOName": "BE",
        "ISO2": "BE",
        "ISO3": "BEL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 60,
        "Name": "Bermudas",
        "TelephoneCodePrefix": 1441,
        "ISOName": "BD",
        "ISO2": "BM",
        "ISO3": "BMU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 64,
        "Name": "Bután",
        "TelephoneCodePrefix": 975,
        "ISOName": "BT",
        "ISO2": "BT",
        "ISO3": "BTN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 68,
        "Name": "Bolivia",
        "TelephoneCodePrefix": 591,
        "ISOName": "BL",
        "ISO2": "BO",
        "ISO3": "BOL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 70,
        "Name": "Bosnia y Hercegovina",
        "TelephoneCodePrefix": 387,
        "ISOName": "BK",
        "ISO2": "BA",
        "ISO3": "BIH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 72,
        "Name": "Botsuana",
        "TelephoneCodePrefix": 267,
        "ISOName": "BC",
        "ISO2": "BW",
        "ISO3": "BWA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 74,
        "Name": "Isla Bouvet",
        "TelephoneCodePrefix": 47,
        "ISOName": "BV",
        "ISO2": "BV",
        "ISO3": "BVT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 76,
        "Name": "Brasil",
        "TelephoneCodePrefix": 55,
        "ISOName": "BR",
        "ISO2": "BR",
        "ISO3": "BRA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 84,
        "Name": "Belice",
        "TelephoneCodePrefix": 501,
        "ISOName": "BH",
        "ISO2": "BZ",
        "ISO3": "BLZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 86,
        "Name": "Territorio Británico del Océan",
        "TelephoneCodePrefix": 246,
        "ISOName": "IO",
        "ISO2": "IO",
        "ISO3": "IOT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 90,
        "Name": "Islas Salomón",
        "TelephoneCodePrefix": 677,
        "ISOName": "BP",
        "ISO2": "SB",
        "ISO3": "SLB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 92,
        "Name": "Islas Vírgenes (UK)",
        "TelephoneCodePrefix": 1284,
        "ISOName": "VI",
        "ISO2": "VG",
        "ISO3": "VGB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 96,
        "Name": "Brunéi",
        "TelephoneCodePrefix": 673,
        "ISOName": "BX",
        "ISO2": "BN",
        "ISO3": "BRN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 100,
        "Name": "Bulgaria",
        "TelephoneCodePrefix": 359,
        "ISOName": "BU",
        "ISO2": "BG",
        "ISO3": "BGR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 104,
        "Name": "Myanmar",
        "TelephoneCodePrefix": 95,
        "ISOName": "BM",
        "ISO2": "MM",
        "ISO3": "MMR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 108,
        "Name": "Burundi",
        "TelephoneCodePrefix": 257,
        "ISOName": "BY",
        "ISO2": "BI",
        "ISO3": "BDI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 112,
        "Name": "Belarús",
        "TelephoneCodePrefix": 375,
        "ISOName": "BO",
        "ISO2": "BY",
        "ISO3": "BLR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 116,
        "Name": "Cambodia",
        "TelephoneCodePrefix": 855,
        "ISOName": "CB",
        "ISO2": "KH",
        "ISO3": "KHM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 120,
        "Name": "Camerún",
        "TelephoneCodePrefix": 237,
        "ISOName": "CM",
        "ISO2": "CM",
        "ISO3": "CMR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 124,
        "Name": "Canadá",
        "TelephoneCodePrefix": 1,
        "ISOName": "CA",
        "ISO2": "CA",
        "ISO3": "CAN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 132,
        "Name": "Cabo Verde",
        "TelephoneCodePrefix": 238,
        "ISOName": "CV",
        "ISO2": "CV",
        "ISO3": "CPV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 136,
        "Name": "Islas Caimán",
        "TelephoneCodePrefix": 1345,
        "ISOName": "CJ",
        "ISO2": "KY",
        "ISO3": "CYM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 140,
        "Name": "República Centroafricana",
        "TelephoneCodePrefix": 236,
        "ISOName": "CT",
        "ISO2": "CF",
        "ISO3": "CAF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 144,
        "Name": "Sri Lanka",
        "TelephoneCodePrefix": 94,
        "ISOName": "CE",
        "ISO2": "LK",
        "ISO3": "LKA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 148,
        "Name": "Chad",
        "TelephoneCodePrefix": 235,
        "ISOName": "CD",
        "ISO2": "TD",
        "ISO3": "TCD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 152,
        "Name": "Chile",
        "TelephoneCodePrefix": 56,
        "ISOName": "CI",
        "ISO2": "CL",
        "ISO3": "CHL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 156,
        "Name": "China",
        "TelephoneCodePrefix": 86,
        "ISOName": "CH",
        "ISO2": "CN",
        "ISO3": "CHN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 158,
        "Name": "Taiwán",
        "TelephoneCodePrefix": 886,
        "ISOName": "TW",
        "ISO2": "TW",
        "ISO3": "TWN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 162,
        "Name": "Isla de Navidad",
        "TelephoneCodePrefix": 61,
        "ISOName": "KT",
        "ISO2": "CX",
        "ISO3": "CXR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 166,
        "Name": "Islas Cocos",
        "TelephoneCodePrefix": 61,
        "ISOName": "CK",
        "ISO2": "CC",
        "ISO3": "CCK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 170,
        "Name": "Colombia",
        "TelephoneCodePrefix": 57,
        "ISOName": "CO",
        "ISO2": "CO",
        "ISO3": "COL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 174,
        "Name": "Comores",
        "TelephoneCodePrefix": 269,
        "ISOName": "CN",
        "ISO2": "KM",
        "ISO3": "COM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 175,
        "Name": "Mayotte",
        "TelephoneCodePrefix": 262,
        "ISOName": "MF",
        "ISO2": "YT",
        "ISO3": "MYT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 178,
        "Name": "República del Congo",
        "TelephoneCodePrefix": 242,
        "ISOName": "CF",
        "ISO2": "CG",
        "ISO3": "COG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 180,
        "Name": "República Democrática del Cong",
        "TelephoneCodePrefix": 243,
        "ISOName": "CG",
        "ISO2": "CD",
        "ISO3": "COD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 184,
        "Name": "Islas Cook",
        "TelephoneCodePrefix": 682,
        "ISOName": "CW",
        "ISO2": "CK",
        "ISO3": "COK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 188,
        "Name": "Costa Rica",
        "TelephoneCodePrefix": 506,
        "ISOName": "CS",
        "ISO2": "CR",
        "ISO3": "CRI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 191,
        "Name": "Croacia",
        "TelephoneCodePrefix": 385,
        "ISOName": "HR",
        "ISO2": "HR",
        "ISO3": "HRV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 192,
        "Name": "Cuba",
        "TelephoneCodePrefix": 53,
        "ISOName": "CU",
        "ISO2": "CU",
        "ISO3": "CUB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 196,
        "Name": "Chipre",
        "TelephoneCodePrefix": 357,
        "ISOName": "CY",
        "ISO2": "CY",
        "ISO3": "CYP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 203,
        "Name": "Chequia",
        "TelephoneCodePrefix": 420,
        "ISOName": "EZ",
        "ISO2": "CZ",
        "ISO3": "CZE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 204,
        "Name": "Benín",
        "TelephoneCodePrefix": 229,
        "ISOName": "BN",
        "ISO2": "BJ",
        "ISO3": "BEN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 208,
        "Name": "Dinamarca",
        "TelephoneCodePrefix": 45,
        "ISOName": "DA",
        "ISO2": "DK",
        "ISO3": "DNK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 212,
        "Name": "Dominica",
        "TelephoneCodePrefix": 767,
        "ISOName": "DO",
        "ISO2": "DM",
        "ISO3": "DMA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 214,
        "Name": "República Dominicana",
        "TelephoneCodePrefix": 1809,
        "ISOName": "DR",
        "ISO2": "DO",
        "ISO3": "DOM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 218,
        "Name": "Ecuador",
        "TelephoneCodePrefix": 593,
        "ISOName": "EC",
        "ISO2": "EC",
        "ISO3": "ECU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 222,
        "Name": "El Salvador",
        "TelephoneCodePrefix": 503,
        "ISOName": "ES",
        "ISO2": "SV",
        "ISO3": "SLV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 226,
        "Name": "Guinea Ecuatorial",
        "TelephoneCodePrefix": 240,
        "ISOName": "EK",
        "ISO2": "GQ",
        "ISO3": "GNQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 231,
        "Name": "Etiopía",
        "TelephoneCodePrefix": 251,
        "ISOName": "ET",
        "ISO2": "ET",
        "ISO3": "ETH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 232,
        "Name": "Eritrea",
        "TelephoneCodePrefix": 291,
        "ISOName": "ER",
        "ISO2": "ER",
        "ISO3": "ERI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 233,
        "Name": "Estonia",
        "TelephoneCodePrefix": 372,
        "ISOName": "EN",
        "ISO2": "EE",
        "ISO3": "EST",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 234,
        "Name": "Islas Feroe",
        "TelephoneCodePrefix": 298,
        "ISOName": "FO",
        "ISO2": "FO",
        "ISO3": "FRO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 238,
        "Name": "Islas Malvinas",
        "TelephoneCodePrefix": 500,
        "ISOName": "FK",
        "ISO2": "FK",
        "ISO3": "FLK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 239,
        "Name": "Georgia del Sur y las Islas Sa",
        "TelephoneCodePrefix": 500,
        "ISOName": "SX",
        "ISO2": "GS",
        "ISO3": "SGS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 242,
        "Name": "Fiji",
        "TelephoneCodePrefix": 679,
        "ISOName": "FJ",
        "ISO2": "FJ",
        "ISO3": "FJI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 246,
        "Name": "Finlandia",
        "TelephoneCodePrefix": 358,
        "ISOName": "FI",
        "ISO2": "FI",
        "ISO3": "FIN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 248,
        "Name": "Islas Åland",
        "TelephoneCodePrefix": 358,
        "ISOName": "",
        "ISO2": "AX",
        "ISO3": "ALA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 250,
        "Name": "Francia",
        "TelephoneCodePrefix": 33,
        "ISOName": "FR",
        "ISO2": "FR",
        "ISO3": "FRA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 254,
        "Name": "Guayana Francesa",
        "TelephoneCodePrefix": 594,
        "ISOName": "FG",
        "ISO2": "GF",
        "ISO3": "GUF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 258,
        "Name": "Polinesia Francesa",
        "TelephoneCodePrefix": 689,
        "ISOName": "FP",
        "ISO2": "PF",
        "ISO3": "PYF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 260,
        "Name": "Territorios Australes y Antárt",
        "TelephoneCodePrefix": 262,
        "ISOName": "FS",
        "ISO2": "TF",
        "ISO3": "ATF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 262,
        "Name": "Yibuti",
        "TelephoneCodePrefix": 253,
        "ISOName": "DJ",
        "ISO2": "DJ",
        "ISO3": "DJI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 266,
        "Name": "Gabón",
        "TelephoneCodePrefix": 241,
        "ISOName": "GB",
        "ISO2": "GA",
        "ISO3": "GAB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 268,
        "Name": "Georgia",
        "TelephoneCodePrefix": 995,
        "ISOName": "GG",
        "ISO2": "GE",
        "ISO3": "GEO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 270,
        "Name": "Gambia",
        "TelephoneCodePrefix": 220,
        "ISOName": "GA",
        "ISO2": "GM",
        "ISO3": "GMB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 275,
        "Name": "Palestina",
        "TelephoneCodePrefix": 970,
        "ISOName": "WE",
        "ISO2": "PS",
        "ISO3": "PSE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 276,
        "Name": "Alemania",
        "TelephoneCodePrefix": 49,
        "ISOName": "GM",
        "ISO2": "DE",
        "ISO3": "DEU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 288,
        "Name": "Ghana",
        "TelephoneCodePrefix": 233,
        "ISOName": "GH",
        "ISO2": "GH",
        "ISO3": "GHA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 292,
        "Name": "Gibraltar",
        "TelephoneCodePrefix": 350,
        "ISOName": "GI",
        "ISO2": "GI",
        "ISO3": "GIB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 296,
        "Name": "Kiribati",
        "TelephoneCodePrefix": 686,
        "ISOName": "KR",
        "ISO2": "KI",
        "ISO3": "KIR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 300,
        "Name": "Grecia",
        "TelephoneCodePrefix": 30,
        "ISOName": "GR",
        "ISO2": "GR",
        "ISO3": "GRC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 304,
        "Name": "Groenlandia",
        "TelephoneCodePrefix": 299,
        "ISOName": "GL",
        "ISO2": "GL",
        "ISO3": "GRL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 308,
        "Name": "Granada",
        "TelephoneCodePrefix": 1473,
        "ISOName": "GJ",
        "ISO2": "GD",
        "ISO3": "GRD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 312,
        "Name": "Guadalupe",
        "TelephoneCodePrefix": 590,
        "ISOName": "GP",
        "ISO2": "GP",
        "ISO3": "GLP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 316,
        "Name": "Guam",
        "TelephoneCodePrefix": 1671,
        "ISOName": "GQ",
        "ISO2": "GU",
        "ISO3": "GUM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 320,
        "Name": "Guatemala",
        "TelephoneCodePrefix": 502,
        "ISOName": "GT",
        "ISO2": "GT",
        "ISO3": "GTM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 324,
        "Name": "Guinea",
        "TelephoneCodePrefix": 224,
        "ISOName": "GV",
        "ISO2": "GN",
        "ISO3": "GIN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 328,
        "Name": "Guayana",
        "TelephoneCodePrefix": 592,
        "ISOName": "GY",
        "ISO2": "GY",
        "ISO3": "GUY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 332,
        "Name": "Haití",
        "TelephoneCodePrefix": 509,
        "ISOName": "HA",
        "ISO2": "HT",
        "ISO3": "HTI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 334,
        "Name": "Islas Heard y McDonald",
        "TelephoneCodePrefix": 0,
        "ISOName": "HM",
        "ISO2": "HM",
        "ISO3": "HMD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 336,
        "Name": "Ciudad del Vaticano",
        "TelephoneCodePrefix": 39,
        "ISOName": "VT",
        "ISO2": "VA",
        "ISO3": "VAT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 340,
        "Name": "Honduras",
        "TelephoneCodePrefix": 504,
        "ISOName": "HO",
        "ISO2": "HN",
        "ISO3": "HND",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 344,
        "Name": "Hong Kong",
        "TelephoneCodePrefix": 852,
        "ISOName": "HK",
        "ISO2": "HK",
        "ISO3": "HKG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 348,
        "Name": "Hungría",
        "TelephoneCodePrefix": 36,
        "ISOName": "HU",
        "ISO2": "HU",
        "ISO3": "HUN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 352,
        "Name": "Islandia",
        "TelephoneCodePrefix": 354,
        "ISOName": "IC",
        "ISO2": "IS",
        "ISO3": "ISL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 356,
        "Name": "India",
        "TelephoneCodePrefix": 91,
        "ISOName": "IN",
        "ISO2": "IN",
        "ISO3": "IND",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 360,
        "Name": "Indonesia",
        "TelephoneCodePrefix": 62,
        "ISOName": "ID",
        "ISO2": "ID",
        "ISO3": "IDN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 364,
        "Name": "Irán",
        "TelephoneCodePrefix": 98,
        "ISOName": "IR",
        "ISO2": "IR",
        "ISO3": "IRN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 368,
        "Name": "Iraq",
        "TelephoneCodePrefix": 964,
        "ISOName": "IZ",
        "ISO2": "IQ",
        "ISO3": "IRQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 372,
        "Name": "Irlanda",
        "TelephoneCodePrefix": 353,
        "ISOName": "EI",
        "ISO2": "IE",
        "ISO3": "IRL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 376,
        "Name": "Israel",
        "TelephoneCodePrefix": 972,
        "ISOName": "IS",
        "ISO2": "IL",
        "ISO3": "ISR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 380,
        "Name": "Italia",
        "TelephoneCodePrefix": 39,
        "ISOName": "IT",
        "ISO2": "IT",
        "ISO3": "ITA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 384,
        "Name": "Costa de Marfil",
        "TelephoneCodePrefix": 225,
        "ISOName": "IV",
        "ISO2": "CI",
        "ISO3": "CIV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 388,
        "Name": "Jamaica",
        "TelephoneCodePrefix": 1876,
        "ISOName": "JM",
        "ISO2": "JM",
        "ISO3": "JAM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 392,
        "Name": "Japón",
        "TelephoneCodePrefix": 81,
        "ISOName": "JA",
        "ISO2": "JP",
        "ISO3": "JPN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 398,
        "Name": "Kazajstán",
        "TelephoneCodePrefix": 7,
        "ISOName": "KZ",
        "ISO2": "KZ",
        "ISO3": "KAZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 400,
        "Name": "Jordania",
        "TelephoneCodePrefix": 962,
        "ISOName": "JO",
        "ISO2": "JO",
        "ISO3": "JOR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 404,
        "Name": "Kenia",
        "TelephoneCodePrefix": 254,
        "ISOName": "KE",
        "ISO2": "KE",
        "ISO3": "KEN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 408,
        "Name": "Corea del Norte",
        "TelephoneCodePrefix": 850,
        "ISOName": "KN",
        "ISO2": "KP",
        "ISO3": "PRK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 410,
        "Name": "Corea del Sur",
        "TelephoneCodePrefix": 82,
        "ISOName": "KS",
        "ISO2": "KR",
        "ISO3": "KOR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 414,
        "Name": "Kuwait",
        "TelephoneCodePrefix": 965,
        "ISOName": "KU",
        "ISO2": "KW",
        "ISO3": "KWT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 417,
        "Name": "Kirguistán",
        "TelephoneCodePrefix": 996,
        "ISOName": "KG",
        "ISO2": "KG",
        "ISO3": "KGZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 418,
        "Name": "Laos",
        "TelephoneCodePrefix": 856,
        "ISOName": "LA",
        "ISO2": "LA",
        "ISO3": "LAO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 422,
        "Name": "Líbano",
        "TelephoneCodePrefix": 961,
        "ISOName": "LE",
        "ISO2": "LB",
        "ISO3": "LBN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 426,
        "Name": "Lesotho",
        "TelephoneCodePrefix": 266,
        "ISOName": "LT",
        "ISO2": "LS",
        "ISO3": "LSO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 428,
        "Name": "Letonia",
        "TelephoneCodePrefix": 371,
        "ISOName": "LG",
        "ISO2": "LV",
        "ISO3": "LVA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 430,
        "Name": "Liberia",
        "TelephoneCodePrefix": 231,
        "ISOName": "LI",
        "ISO2": "LR",
        "ISO3": "LBR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 434,
        "Name": "Libia",
        "TelephoneCodePrefix": 218,
        "ISOName": "LY",
        "ISO2": "LY",
        "ISO3": "LBY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 438,
        "Name": "Liechtenstein",
        "TelephoneCodePrefix": 423,
        "ISOName": "LS",
        "ISO2": "LI",
        "ISO3": "LIE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 440,
        "Name": "Lituania",
        "TelephoneCodePrefix": 370,
        "ISOName": "LH",
        "ISO2": "LT",
        "ISO3": "LTU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 442,
        "Name": "Luxemburgo",
        "TelephoneCodePrefix": 352,
        "ISOName": "LU",
        "ISO2": "LU",
        "ISO3": "LUX",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 446,
        "Name": "Macao",
        "TelephoneCodePrefix": 853,
        "ISOName": "MC",
        "ISO2": "MO",
        "ISO3": "MAC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 450,
        "Name": "Madagascar",
        "TelephoneCodePrefix": 261,
        "ISOName": "MA",
        "ISO2": "MG",
        "ISO3": "MDG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 454,
        "Name": "Malaui",
        "TelephoneCodePrefix": 265,
        "ISOName": "MI",
        "ISO2": "MW",
        "ISO3": "MWI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 458,
        "Name": "Malasia",
        "TelephoneCodePrefix": 60,
        "ISOName": "MY",
        "ISO2": "MY",
        "ISO3": "MYS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 462,
        "Name": "Maldivas",
        "TelephoneCodePrefix": 960,
        "ISOName": "MV",
        "ISO2": "MV",
        "ISO3": "MDV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 466,
        "Name": "Malí",
        "TelephoneCodePrefix": 223,
        "ISOName": "ML",
        "ISO2": "ML",
        "ISO3": "MLI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 470,
        "Name": "Malta",
        "TelephoneCodePrefix": 356,
        "ISOName": "MT",
        "ISO2": "MT",
        "ISO3": "MLT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 474,
        "Name": "Martinica",
        "TelephoneCodePrefix": 596,
        "ISOName": "MB",
        "ISO2": "MQ",
        "ISO3": "MTQ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 478,
        "Name": "Mauritania",
        "TelephoneCodePrefix": 222,
        "ISOName": "MR",
        "ISO2": "MR",
        "ISO3": "MRT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 480,
        "Name": "Isla Mauricio",
        "TelephoneCodePrefix": 230,
        "ISOName": "MP",
        "ISO2": "MU",
        "ISO3": "MUS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 484,
        "Name": "México",
        "TelephoneCodePrefix": 52,
        "ISOName": "MX",
        "ISO2": "MX",
        "ISO3": "MEX",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 492,
        "Name": "Principado de Mónaco",
        "TelephoneCodePrefix": 377,
        "ISOName": "MN",
        "ISO2": "MC",
        "ISO3": "MCO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 496,
        "Name": "Mongolia",
        "TelephoneCodePrefix": 976,
        "ISOName": "MG",
        "ISO2": "MN",
        "ISO3": "MNG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 498,
        "Name": "Moldavia",
        "TelephoneCodePrefix": 373,
        "ISOName": "MD",
        "ISO2": "MD",
        "ISO3": "MDA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 499,
        "Name": "Montenegro",
        "TelephoneCodePrefix": 382,
        "ISOName": "MJ",
        "ISO2": "ME",
        "ISO3": "MNE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 500,
        "Name": "Montserrat",
        "TelephoneCodePrefix": 1664,
        "ISOName": "MH",
        "ISO2": "MS",
        "ISO3": "MSR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 504,
        "Name": "Marruecos",
        "TelephoneCodePrefix": 212,
        "ISOName": "MO",
        "ISO2": "MA",
        "ISO3": "MAR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 508,
        "Name": "Mozambique",
        "TelephoneCodePrefix": 258,
        "ISOName": "MZ",
        "ISO2": "MZ",
        "ISO3": "MOZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 512,
        "Name": "Omán",
        "TelephoneCodePrefix": 968,
        "ISOName": "MU",
        "ISO2": "OM",
        "ISO3": "OMN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 516,
        "Name": "Namibia",
        "TelephoneCodePrefix": 264,
        "ISOName": "WA",
        "ISO2": "NA",
        "ISO3": "NAM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 520,
        "Name": "Nauru",
        "TelephoneCodePrefix": 674,
        "ISOName": "NR",
        "ISO2": "NR",
        "ISO3": "NRU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 524,
        "Name": "Nepal",
        "TelephoneCodePrefix": 977,
        "ISOName": "NP",
        "ISO2": "NP",
        "ISO3": "NPL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 528,
        "Name": "Países Bajos",
        "TelephoneCodePrefix": 31,
        "ISOName": "NL",
        "ISO2": "NL",
        "ISO3": "NLD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 531,
        "Name": "Curaçao",
        "TelephoneCodePrefix": 5999,
        "ISOName": "UC",
        "ISO2": "CW",
        "ISO3": "CUW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 533,
        "Name": "Aruba",
        "TelephoneCodePrefix": 297,
        "ISOName": "AA",
        "ISO2": "AW",
        "ISO3": "ABW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 534,
        "Name": "Sint Maarten",
        "TelephoneCodePrefix": 721,
        "ISOName": "NN",
        "ISO2": "SX",
        "ISO3": "SXM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 535,
        "Name": "Caribe Neerlandés",
        "TelephoneCodePrefix": 599,
        "ISOName": "",
        "ISO2": "BQ",
        "ISO3": "BES",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 540,
        "Name": "Nueva Caledonia",
        "TelephoneCodePrefix": 687,
        "ISOName": "NC",
        "ISO2": "NC",
        "ISO3": "NCL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 548,
        "Name": "Vanuatu",
        "TelephoneCodePrefix": 678,
        "ISOName": "NH",
        "ISO2": "VU",
        "ISO3": "VUT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 554,
        "Name": "Nueva Zelandia",
        "TelephoneCodePrefix": 64,
        "ISOName": "NZ",
        "ISO2": "NZ",
        "ISO3": "NZL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 558,
        "Name": "Nicaragua",
        "TelephoneCodePrefix": 505,
        "ISOName": "NU",
        "ISO2": "NI",
        "ISO3": "NIC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 562,
        "Name": "Níger",
        "TelephoneCodePrefix": 227,
        "ISOName": "NG",
        "ISO2": "NE",
        "ISO3": "NER",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 566,
        "Name": "Nigeria",
        "TelephoneCodePrefix": 234,
        "ISOName": "NI",
        "ISO2": "NG",
        "ISO3": "NGA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 570,
        "Name": "Niue",
        "TelephoneCodePrefix": 683,
        "ISOName": "NE",
        "ISO2": "NU",
        "ISO3": "NIU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 574,
        "Name": "Isla Norfolk",
        "TelephoneCodePrefix": 672,
        "ISOName": "NF",
        "ISO2": "NF",
        "ISO3": "NFK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 578,
        "Name": "Noruega",
        "TelephoneCodePrefix": 47,
        "ISOName": "NO",
        "ISO2": "NO",
        "ISO3": "NOR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 580,
        "Name": "Islas Marianas del Norte",
        "TelephoneCodePrefix": 1670,
        "ISOName": "CQ",
        "ISO2": "MP",
        "ISO3": "MNP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 581,
        "Name": "Islas Ultramarinas Menores de",
        "TelephoneCodePrefix": 0,
        "ISOName": "",
        "ISO2": "UM",
        "ISO3": "UMI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 583,
        "Name": "Estados Federados de Micronesi",
        "TelephoneCodePrefix": 691,
        "ISOName": "FM",
        "ISO2": "FM",
        "ISO3": "FSM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 584,
        "Name": "Islas Marshall",
        "TelephoneCodePrefix": 692,
        "ISOName": "RM",
        "ISO2": "MH",
        "ISO3": "MHL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 585,
        "Name": "Palaos",
        "TelephoneCodePrefix": 680,
        "ISOName": "PS",
        "ISO2": "PW",
        "ISO3": "PLW",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 586,
        "Name": "Pakistán",
        "TelephoneCodePrefix": 92,
        "ISOName": "PK",
        "ISO2": "PK",
        "ISO3": "PAK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 591,
        "Name": "Panamá",
        "TelephoneCodePrefix": 507,
        "ISOName": "PM",
        "ISO2": "PA",
        "ISO3": "PAN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 598,
        "Name": "Papúa Nueva Guinea",
        "TelephoneCodePrefix": 675,
        "ISOName": "PP",
        "ISO2": "PG",
        "ISO3": "PNG",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 600,
        "Name": "Paraguay",
        "TelephoneCodePrefix": 595,
        "ISOName": "PA",
        "ISO2": "PY",
        "ISO3": "PRY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 604,
        "Name": "Perú",
        "TelephoneCodePrefix": 51,
        "ISOName": "PE",
        "ISO2": "PE",
        "ISO3": "PER",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 608,
        "Name": "Filipinas",
        "TelephoneCodePrefix": 63,
        "ISOName": "RP",
        "ISO2": "PH",
        "ISO3": "PHL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 612,
        "Name": "Islas Pitcairn",
        "TelephoneCodePrefix": 870,
        "ISOName": "PC",
        "ISO2": "PN",
        "ISO3": "PCN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 616,
        "Name": "Polonia",
        "TelephoneCodePrefix": 48,
        "ISOName": "PL",
        "ISO2": "PL",
        "ISO3": "POL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 620,
        "Name": "Portugal",
        "TelephoneCodePrefix": 351,
        "ISOName": "PO",
        "ISO2": "PT",
        "ISO3": "PRT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 624,
        "Name": "Guinea-Bissau",
        "TelephoneCodePrefix": 245,
        "ISOName": "PU",
        "ISO2": "GW",
        "ISO3": "GNB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 626,
        "Name": "Timor Oriental",
        "TelephoneCodePrefix": 670,
        "ISOName": "TT",
        "ISO2": "TL",
        "ISO3": "TLS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 630,
        "Name": "Puerto Rico",
        "TelephoneCodePrefix": 1,
        "ISOName": "RQ",
        "ISO2": "PR",
        "ISO3": "PRI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 634,
        "Name": "Catar",
        "TelephoneCodePrefix": 974,
        "ISOName": "QA",
        "ISO2": "QA",
        "ISO3": "QAT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 638,
        "Name": "Reunión",
        "TelephoneCodePrefix": 262,
        "ISOName": "RE",
        "ISO2": "RE",
        "ISO3": "REU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 642,
        "Name": "Rumania",
        "TelephoneCodePrefix": 40,
        "ISOName": "RO",
        "ISO2": "RO",
        "ISO3": "ROU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 643,
        "Name": "Rusia",
        "TelephoneCodePrefix": 7,
        "ISOName": "RS",
        "ISO2": "RU",
        "ISO3": "RUS",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 646,
        "Name": "Ruanda",
        "TelephoneCodePrefix": 250,
        "ISOName": "RW",
        "ISO2": "RW",
        "ISO3": "RWA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 652,
        "Name": "San Bartolomé",
        "TelephoneCodePrefix": 590,
        "ISOName": "TB",
        "ISO2": "BL",
        "ISO3": "BLM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 654,
        "Name": "Santa Elena, Ascensión y Trist",
        "TelephoneCodePrefix": 290,
        "ISOName": "SH",
        "ISO2": "SH",
        "ISO3": "SHN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 659,
        "Name": "San Cristóbal y Nieves",
        "TelephoneCodePrefix": 1869,
        "ISOName": "SC",
        "ISO2": "KN",
        "ISO3": "KNA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 660,
        "Name": "Anguila",
        "TelephoneCodePrefix": 1264,
        "ISOName": "AV",
        "ISO2": "AI",
        "ISO3": "AIA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 662,
        "Name": "Santa Lucía",
        "TelephoneCodePrefix": 1758,
        "ISOName": "ST",
        "ISO2": "LC",
        "ISO3": "LCA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 663,
        "Name": "Isla de San Martín",
        "TelephoneCodePrefix": 1599,
        "ISOName": "RN",
        "ISO2": "MF",
        "ISO3": "MAF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 666,
        "Name": "San Pedro y Miquelón",
        "TelephoneCodePrefix": 508,
        "ISOName": "SB",
        "ISO2": "PM",
        "ISO3": "SPM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 670,
        "Name": "San Vicente y las Granadinas",
        "TelephoneCodePrefix": 1784,
        "ISOName": "VC",
        "ISO2": "VC",
        "ISO3": "VCT",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 674,
        "Name": "San Marino",
        "TelephoneCodePrefix": 378,
        "ISOName": "SM",
        "ISO2": "SM",
        "ISO3": "SMR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 678,
        "Name": "Santo Tomé y Príncipe",
        "TelephoneCodePrefix": 239,
        "ISOName": "TP",
        "ISO2": "ST",
        "ISO3": "STP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 682,
        "Name": "Arabia Saudita",
        "TelephoneCodePrefix": 966,
        "ISOName": "SA",
        "ISO2": "SA",
        "ISO3": "SAU",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 686,
        "Name": "Senegal",
        "TelephoneCodePrefix": 221,
        "ISOName": "SG",
        "ISO2": "SN",
        "ISO3": "SEN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 688,
        "Name": "Serbia",
        "TelephoneCodePrefix": 381,
        "ISOName": "RI",
        "ISO2": "RS",
        "ISO3": "SRB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 690,
        "Name": "Seychelles",
        "TelephoneCodePrefix": 248,
        "ISOName": "SE",
        "ISO2": "SC",
        "ISO3": "SYC",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 694,
        "Name": "Sierra Leona",
        "TelephoneCodePrefix": 232,
        "ISOName": "SL",
        "ISO2": "SL",
        "ISO3": "SLE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 702,
        "Name": "Singapur",
        "TelephoneCodePrefix": 65,
        "ISOName": "SN",
        "ISO2": "SG",
        "ISO3": "SGP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 703,
        "Name": "Eslovaquia",
        "TelephoneCodePrefix": 421,
        "ISOName": "LO",
        "ISO2": "SK",
        "ISO3": "SVK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 704,
        "Name": "Vietnam",
        "TelephoneCodePrefix": 84,
        "ISOName": "VM",
        "ISO2": "VN",
        "ISO3": "VNM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 705,
        "Name": "Eslovenia",
        "TelephoneCodePrefix": 386,
        "ISOName": "SI",
        "ISO2": "SI",
        "ISO3": "SVN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 706,
        "Name": "Somalia",
        "TelephoneCodePrefix": 252,
        "ISOName": "SO",
        "ISO2": "SO",
        "ISO3": "SOM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 710,
        "Name": "Sudáfrica",
        "TelephoneCodePrefix": 27,
        "ISOName": "SF",
        "ISO2": "ZA",
        "ISO3": "ZAF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 716,
        "Name": "Zimbabue",
        "TelephoneCodePrefix": 263,
        "ISOName": "ZI",
        "ISO2": "ZW",
        "ISO3": "ZWE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 724,
        "Name": "España",
        "TelephoneCodePrefix": 34,
        "ISOName": "SP",
        "ISO2": "ES",
        "ISO3": "ESP",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 728,
        "Name": "Sudán del Sur",
        "TelephoneCodePrefix": 211,
        "ISOName": "",
        "ISO2": "SS",
        "ISO3": "SSD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 729,
        "Name": "Sudán",
        "TelephoneCodePrefix": 249,
        "ISOName": "SU",
        "ISO2": "SD",
        "ISO3": "SDN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 732,
        "Name": "Sáhara Occidental",
        "TelephoneCodePrefix": 212,
        "ISOName": "WI",
        "ISO2": "EH",
        "ISO3": "ESH",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 740,
        "Name": "Surinam",
        "TelephoneCodePrefix": 597,
        "ISOName": "NS",
        "ISO2": "SR",
        "ISO3": "SUR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 744,
        "Name": "Svalbard y Jan Mayen",
        "TelephoneCodePrefix": 47,
        "ISOName": "SV",
        "ISO2": "SJ",
        "ISO3": "SJM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 748,
        "Name": "Esuatini",
        "TelephoneCodePrefix": 268,
        "ISOName": "WZ",
        "ISO2": "SZ",
        "ISO3": "SWZ",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 752,
        "Name": "Suecia",
        "TelephoneCodePrefix": 46,
        "ISOName": "SW",
        "ISO2": "SE",
        "ISO3": "SWE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 756,
        "Name": "Suiza",
        "TelephoneCodePrefix": 41,
        "ISOName": "SZ",
        "ISO2": "CH",
        "ISO3": "CHE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 760,
        "Name": "Siria",
        "TelephoneCodePrefix": 963,
        "ISOName": "SY",
        "ISO2": "SY",
        "ISO3": "SYR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 762,
        "Name": "Tayikistán",
        "TelephoneCodePrefix": 992,
        "ISOName": "TI",
        "ISO2": "TJ",
        "ISO3": "TJK",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 764,
        "Name": "Tailandia",
        "TelephoneCodePrefix": 66,
        "ISOName": "TH",
        "ISO2": "TH",
        "ISO3": "THA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 768,
        "Name": "Togo",
        "TelephoneCodePrefix": 228,
        "ISOName": "TO",
        "ISO2": "TG",
        "ISO3": "TGO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 772,
        "Name": "Tokelau",
        "TelephoneCodePrefix": 690,
        "ISOName": "TL",
        "ISO2": "TK",
        "ISO3": "TKL",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 776,
        "Name": "Tonga",
        "TelephoneCodePrefix": 676,
        "ISOName": "TN",
        "ISO2": "TO",
        "ISO3": "TON",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 780,
        "Name": "Trinidad y Tobago",
        "TelephoneCodePrefix": 1868,
        "ISOName": "TD",
        "ISO2": "TT",
        "ISO3": "TTO",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 784,
        "Name": "Emiratos Árabes Unidos",
        "TelephoneCodePrefix": 971,
        "ISOName": "AE",
        "ISO2": "AE",
        "ISO3": "ARE",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 788,
        "Name": "Túnez",
        "TelephoneCodePrefix": 216,
        "ISOName": "TS",
        "ISO2": "TN",
        "ISO3": "TUN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 792,
        "Name": "Turquía",
        "TelephoneCodePrefix": 90,
        "ISOName": "TU",
        "ISO2": "TR",
        "ISO3": "TUR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 795,
        "Name": "Turkmenistán",
        "TelephoneCodePrefix": 993,
        "ISOName": "TX",
        "ISO2": "TM",
        "ISO3": "TKM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 796,
        "Name": "Islas Turcas y Caicos",
        "TelephoneCodePrefix": 1649,
        "ISOName": "TK",
        "ISO2": "TC",
        "ISO3": "TCA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 798,
        "Name": "Tuvalu",
        "TelephoneCodePrefix": 688,
        "ISOName": "TV",
        "ISO2": "TV",
        "ISO3": "TUV",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 800,
        "Name": "Uganda",
        "TelephoneCodePrefix": 256,
        "ISOName": "UG",
        "ISO2": "UG",
        "ISO3": "UGA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 804,
        "Name": "Ucrania",
        "TelephoneCodePrefix": 380,
        "ISOName": "UP",
        "ISO2": "UA",
        "ISO3": "UKR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 807,
        "Name": "Macedonia del Norte",
        "TelephoneCodePrefix": 389,
        "ISOName": "MK",
        "ISO2": "MK",
        "ISO3": "MKD",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 818,
        "Name": "Egipto",
        "TelephoneCodePrefix": 20,
        "ISOName": "EG",
        "ISO2": "EG",
        "ISO3": "EGY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 826,
        "Name": "Reino Unido",
        "TelephoneCodePrefix": 44,
        "ISOName": "UK",
        "ISO2": "GB",
        "ISO3": "GBR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 831,
        "Name": "Bailía de Guernsey",
        "TelephoneCodePrefix": 4148,
        "ISOName": "GK",
        "ISO2": "GG",
        "ISO3": "GGY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 832,
        "Name": "Jersey",
        "TelephoneCodePrefix": 44,
        "ISOName": "JE",
        "ISO2": "JE",
        "ISO3": "JEY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 833,
        "Name": "Isla de Man",
        "TelephoneCodePrefix": 44,
        "ISOName": "",
        "ISO2": "IM",
        "ISO3": "IMN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 834,
        "Name": "Tanzania",
        "TelephoneCodePrefix": 255,
        "ISOName": "TZ",
        "ISO2": "TZ",
        "ISO3": "TZA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 840,
        "Name": "Estados Unidos de América",
        "TelephoneCodePrefix": 1,
        "ISOName": "US",
        "ISO2": "US",
        "ISO3": "USA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 850,
        "Name": "Islas Vírgenes Americanas",
        "TelephoneCodePrefix": 1340,
        "ISOName": "VQ",
        "ISO2": "VI",
        "ISO3": "VIR",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 854,
        "Name": "Burkina Faso",
        "TelephoneCodePrefix": 226,
        "ISOName": "UV",
        "ISO2": "BF",
        "ISO3": "BFA",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 858,
        "Name": "URUGUAY",
        "TelephoneCodePrefix": 598,
        "ISOName": "UY",
        "ISO2": "UY",
        "ISO3": "URY",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 860,
        "Name": "Uzbekistán",
        "TelephoneCodePrefix": 998,
        "ISOName": "UZ",
        "ISO2": "UZ",
        "ISO3": "UZB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 862,
        "Name": "Venezuela",
        "TelephoneCodePrefix": 58,
        "ISOName": "VE",
        "ISO2": "VE",
        "ISO3": "VEN",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 876,
        "Name": "Wallis y Futuna",
        "TelephoneCodePrefix": 681,
        "ISOName": "WF",
        "ISO2": "WF",
        "ISO3": "WLF",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 882,
        "Name": "Samoa",
        "TelephoneCodePrefix": 685,
        "ISOName": "WS",
        "ISO2": "WS",
        "ISO3": "WSM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 887,
        "Name": "Yemen",
        "TelephoneCodePrefix": 967,
        "ISOName": "YM",
        "ISO2": "YE",
        "ISO3": "YEM",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 894,
        "Name": "Zambia",
        "TelephoneCodePrefix": 260,
        "ISOName": "ZA",
        "ISO2": "ZM",
        "ISO3": "ZMB",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      },
      {
        "Id": 905,
        "Name": "PAIS PRUEBA",
        "TelephoneCodePrefix": 598,
        "ISOName": "PAI",
        "ISO2": "PA",
        "ISO3": "PAI",
        "EconomicBlocs": {
          "SdtsBTCNWEconomicBloc": []
        }
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-22",
    "Hora": "17:19:15",
    "Numero": 13506047,
    "Servicio": "PublicGeneral.getCountries",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
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
:--------- | :----------- | :-----------
EconomicBlocs | [SdtsBTCNWEconomicBloc](#sdtsbtcnweconomicbloc) | Bloques económicos.
Id | Short $<(length: 3)>$ | Identificador.
ISO2 | String $<(length: 2)>$ | ISO2.
ISO3 | String $<(length: 3)>$ | ISO3.
ISOName | String $<(length: 50)>$ | Nombre ISO.
Name | String $<(length: 30)>$ | Nombre.
TelephoneCodePrefix | Short $<(length: 4)>$ | Prefijo telefónico.
:::

::: details SdtsBTCNWEconomicBloc

### SdtsBTCNWEconomicBloc

::: center
Los campos del tipo de dato estructurado SdtsBTCNWEconomicBloc son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | Short $<(length: 3)>$ | Identificador.
Description | String $<(length: 50)>$ | Descripción.
:::
<!-- CIERRA SDT -->
