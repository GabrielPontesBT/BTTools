---
title: Get Sections Category Type
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los tipos de categoría de apartados

**Nombre publicación:** PublicSavingAccounts.getSectionsCategoryType

**Módulo:** Liabilities.SavingsAccounts

**Programa:** PublicAPI.BTSAPA0013

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
offset | Long $<(Length: 10)>$ | Número de registros a omitir desde el inicio del resultado.
limit | Long $<(Length: 10)>$ | Cantidad máxima de registros a retornar en una sola respuesta.
categoryDescriptionFilter | String $<(Length: 40)>$ | Filtro de descripción de categoría.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
categoryTypes | [SdtsBTSASectionCategoryType](#sdtsbtsasectioncategorytype) | Listado de tipos de categoría.
hasNext | Boolean | Indica si existen más páginas disponibles.

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
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "INSTALADOR",
    "Requerimiento": "1",
    "Token": "479BB17608F43851D4037782"
  },
  "offset": "0",
  "limit": "20",
  "categoryDescriptionFilter": ""
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
    "Token": "479BB17608F43851D4037782"
  },
  "categoryTypes": {
    "categoryType": [
      {
        "categoryCode": 1,
        "categoryDescription": "Viaje"
      },
      {
        "categoryCode": 2,
        "categoryDescription": "Estudio"
      },
      {
        "categoryCode": 3,
        "categoryDescription": "Vacaciones"
      },
      {
        "categoryCode": 4,
        "categoryDescription": "Fondo de emergencia"
      },
      {
        "categoryCode": 5,
        "categoryDescription": "Provisiones"
      },
      {
        "categoryCode": 6,
        "categoryDescription": "Otros"
      }
    ]
  },
  "hasNext": false,
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-06-16",
    "Hora": "18:47:58",
    "Numero": 13584264,
    "Servicio": "PublicSavingAccounts.getSectionsCategoryType",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTSASectionCategoryType

### SdtsBTSASectionCategoryType

::: center
Los campos del tipo de dato estructurado SdtsBTSASectionCategoryType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
categoryCode | Short $<(Length: 4)>$ | Identificador de categoría.
categoryDescription | String $<(Length: 40)>$ | Descripción de categoría.
:::
<!-- CIERRA SDT -->
