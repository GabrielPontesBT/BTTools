---

title: Obtener Niveles Administrativos
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
----------------

<!-- ABRE DATOS DEL MÉTODO -->

::: note Método para obtener los niveles administrativos según país.

**Nombre publicación:** PublicGeneral.getAdministrativeLevels

**Módulo:** General.PublicApi

**Programa:** pacyw00001

**Alcance:** Global
:::

<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->

::: tabs #Datos

@tab Parámetros de Entrada

| Nombre      | Tipo    | Comentarios                      |
| :---------- | :------ | :------------------------------- |
| countryId   | Integer | Identificador del país.          |
| firstLevel  | Integer | Nivel administrativo principal.  |
| secondLevel | Integer | Nivel administrativo secundario. |

@tab Body

No aplica.

@tab Datos de Salida

| Nombre               | Tipo | Comentarios                       |
| :------------------- | :--- | :-------------------------------- |
| administrativeLevels | List | Lista de niveles administrativos. |

@tab Errores

| Código | Descripción |
| :----- | :---------- |

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
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicGeneral_v1?getAdministrativeLevels' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "7218823481425FE3DA44CB0B"
  },
  "countryId": "858",
  "firstLevel": "10",
  "secondLevel": "10"
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
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "7218823481425FE3DA44CB0B"
  },
  "sBTCNWAdministrativeLevels": {
    "administrativeLevelsItem": [
      {
        "Id": "10",
        "Description": "19 de Abril"
      },
      {
        "Id": "20",
        "Description": "26 de Octubre"
      },
      {
        "Id": "30",
        "Description": "Abayubá"
      },
      {
        "Id": "40",
        "Description": "Aeroparque"
      },
      {
        "Id": "50",
        "Description": "Aires Puros"
      },
      {
        "Id": "60",
        "Description": "Arroyo Seco"
      },
      {
        "Id": "70",
        "Description": "Artigas"
      },
      {
        "Id": "80",
        "Description": "Atahualpa"
      },
      {
        "Id": "90",
        "Description": "Bañados de Carrasco"
      },
      {
        "Id": "100",
        "Description": "Barrio Cirilo"
      },
      {
        "Id": "110",
        "Description": "Barrio Coppola"
      },
      {
        "Id": "120",
        "Description": "Barrio Italiano"
      },
      {
        "Id": "130",
        "Description": "Barrio Lavalleja"
      },
      {
        "Id": "140",
        "Description": "Barrio Sur"
      },
      {
        "Id": "150",
        "Description": "Barrio Treinta y Tres"
      },
      {
        "Id": "160",
        "Description": "Barrio Villa Española"
      },
      {
        "Id": "170",
        "Description": "Belgrano"
      },
      {
        "Id": "180",
        "Description": "Bella Italia"
      },
      {
        "Id": "190",
        "Description": "Bella Vista"
      },
      {
        "Id": "200",
        "Description": "Belvedere"
      },
      {
        "Id": "210",
        "Description": "Bola de Nieve"
      },
      {
        "Id": "220",
        "Description": "Bolívar"
      },
      {
        "Id": "230",
        "Description": "Brazo Oriental"
      },
      {
        "Id": "240",
        "Description": "Buceo"
      },
      {
        "Id": "250",
        "Description": "Buena Vista"
      },
      {
        "Id": "260",
        "Description": "Cadorna"
      },
      {
        "Id": "270",
        "Description": "Capurro"
      },
      {
        "Id": "280",
        "Description": "Carrasco"
      },
      {
        "Id": "290",
        "Description": "Carrasco Norte"
      },
      {
        "Id": "300",
        "Description": "Casabó"
      },
      {
        "Id": "310",
        "Description": "Casavalle"
      },
      {
        "Id": "320",
        "Description": "Castro"
      },
      {
        "Id": "330",
        "Description": "Centro"
      },
      {
        "Id": "340",
        "Description": "Cerrito de la Victoria"
      },
      {
        "Id": "350",
        "Description": "Cerro"
      },
      {
        "Id": "360",
        "Description": "Cerro Norte"
      },
      {
        "Id": "370",
        "Description": "Cilindro"
      },
      {
        "Id": "380",
        "Description": "Ciudad Vieja"
      },
      {
        "Id": "390",
        "Description": "Colón Centro"
      },
      {
        "Id": "400",
        "Description": "Colón Noroeste"
      },
      {
        "Id": "410",
        "Description": "Colón Sudeste"
      },
      {
        "Id": "420",
        "Description": "Conciliación"
      },
      {
        "Id": "430",
        "Description": "Cordón"
      },
      {
        "Id": "440",
        "Description": "Cruz de Carrasco"
      },
      {
        "Id": "450",
        "Description": "Ellauri"
      },
      {
        "Id": "460",
        "Description": "España"
      },
      {
        "Id": "470",
        "Description": "Ferrocarril"
      },
      {
        "Id": "480",
        "Description": "Flor de Maroñas"
      },
      {
        "Id": "490",
        "Description": "Fraternidad"
      },
      {
        "Id": "500",
        "Description": "Goes"
      },
      {
        "Id": "510",
        "Description": "Gruta de Lourdes"
      },
      {
        "Id": "520",
        "Description": "Ituzangó"
      },
      {
        "Id": "530",
        "Description": "Jacinto Vera"
      },
      {
        "Id": "540",
        "Description": "Jardines del Hipodromo"
      },
      {
        "Id": "550",
        "Description": "Juanico"
      },
      {
        "Id": "560",
        "Description": "La Aguada"
      },
      {
        "Id": "570",
        "Description": "La Blanqueada"
      },
      {
        "Id": "580",
        "Description": "La Carbonera"
      },
      {
        "Id": "590",
        "Description": "La Comercial"
      },
      {
        "Id": "600",
        "Description": "La Espada"
      },
      {
        "Id": "610",
        "Description": "La Figurita"
      },
      {
        "Id": "620",
        "Description": "La Floresta"
      },
      {
        "Id": "630",
        "Description": "La Paloma"
      },
      {
        "Id": "640",
        "Description": "La Teja"
      },
      {
        "Id": "650",
        "Description": "Larrañaga"
      },
      {
        "Id": "660",
        "Description": "Las Acacias"
      },
      {
        "Id": "670",
        "Description": "Las Canteras"
      },
      {
        "Id": "680",
        "Description": "Lezica"
      },
      {
        "Id": "690",
        "Description": "Los Bulevares"
      },
      {
        "Id": "700",
        "Description": "Los Reyes"
      },
      {
        "Id": "710",
        "Description": "Malaga"
      },
      {
        "Id": "720",
        "Description": "Malvin"
      },
      {
        "Id": "730",
        "Description": "Malvin Alto"
      },
      {
        "Id": "740",
        "Description": "Malvín Norte"
      },
      {
        "Id": "750",
        "Description": "Manga"
      },
      {
        "Id": "760",
        "Description": "Manga Rural"
      },
      {
        "Id": "770",
        "Description": "Maracana"
      },
      {
        "Id": "780",
        "Description": "Maroñas"
      },
      {
        "Id": "790",
        "Description": "Melilla"
      },
      {
        "Id": "800",
        "Description": "Mendoza"
      },
      {
        "Id": "810",
        "Description": "Mercado Modelo"
      },
      {
        "Id": "820",
        "Description": "Monte Rosa"
      },
      {
        "Id": "830",
        "Description": "Nuevo Amanecer"
      },
      {
        "Id": "840",
        "Description": "Nuevo París"
      },
      {
        "Id": "850",
        "Description": "Pajas Blancas"
      },
      {
        "Id": "860",
        "Description": "Palermo"
      },
      {
        "Id": "870",
        "Description": "Parque Batlle"
      },
      {
        "Id": "880",
        "Description": "Parque Guaraní"
      },
      {
        "Id": "890",
        "Description": "Parque Rivera"
      },
      {
        "Id": "900",
        "Description": "Parque Rodó"
      },
      {
        "Id": "910",
        "Description": "Paso de la Arena"
      },
      {
        "Id": "920",
        "Description": "Paso Molino"
      },
      {
        "Id": "930",
        "Description": "Peñarol"
      },
      {
        "Id": "940",
        "Description": "Pérez Castellanos"
      },
      {
        "Id": "950",
        "Description": "Piedras Blancas"
      },
      {
        "Id": "960",
        "Description": "Pocitos"
      },
      {
        "Id": "970",
        "Description": "Porvenir"
      },
      {
        "Id": "980",
        "Description": "Prado"
      },
      {
        "Id": "990",
        "Description": "Prosperidad"
      },
      {
        "Id": "1000",
        "Description": "Pueblo Victoria"
      },
      {
        "Id": "1010",
        "Description": "Puente Carrasco"
      },
      {
        "Id": "1020",
        "Description": "Punta Carretas"
      },
      {
        "Id": "1030",
        "Description": "Punta de Rieles"
      },
      {
        "Id": "1040",
        "Description": "Punta Espinillo"
      },
      {
        "Id": "1050",
        "Description": "Punta Gorda"
      },
      {
        "Id": "1060",
        "Description": "Puntas de Manga"
      },
      {
        "Id": "1070",
        "Description": "R. Farre"
      },
      {
        "Id": "1080",
        "Description": "Reducto"
      },
      {
        "Id": "1090",
        "Description": "Rivadavia"
      },
      {
        "Id": "1100",
        "Description": "Santa Catalina"
      },
      {
        "Id": "1110",
        "Description": "Santiago Vazquez"
      },
      {
        "Id": "1120",
        "Description": "Sarandi"
      },
      {
        "Id": "1130",
        "Description": "Sayago"
      },
      {
        "Id": "1140",
        "Description": "Toledo Chico"
      },
      {
        "Id": "1150",
        "Description": "Tres Cruces"
      },
      {
        "Id": "1160",
        "Description": "Tres Esquinas"
      },
      {
        "Id": "1170",
        "Description": "Tres Ombúes"
      },
      {
        "Id": "1180",
        "Description": "Tres Palmas"
      },
      {
        "Id": "1190",
        "Description": "Trouville"
      },
      {
        "Id": "1200",
        "Description": "Unión"
      },
      {
        "Id": "1210",
        "Description": "Villa Colon"
      },
      {
        "Id": "1220",
        "Description": "Villa del Cerro"
      },
      {
        "Id": "1230",
        "Description": "Villa Dolores"
      },
      {
        "Id": "1240",
        "Description": "Villa García"
      },
      {
        "Id": "1250",
        "Description": "Villa Muñoz"
      },
      {
        "Id": "1260",
        "Description": "Villa Prosperidad"
      },
      {
        "Id": "1270",
        "Description": "Villa Teresa"
      },
      {
        "Id": "2000",
        "Description": "Otro"
      }
    ]
  },
  "BusinessErrors": "",
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-01-20",
    "Hora": "14:49:00",
    "Numero": "13019620",
    "Servicio": "PublicGeneral.getAdministrativeLevels",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```

:::

<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details sBTCNWAdministrativeLevel

### sBTCNWAdministrativeLevel

::: center
Los campos del tipo de dato estructurado sBTCNWAdministrativeLevel son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
Id | String |
Description | String |
:::
<!-- CIERRA SDT -->
