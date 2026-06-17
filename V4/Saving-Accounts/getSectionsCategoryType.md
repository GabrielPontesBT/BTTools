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
offset | Long $<(length: 10)>$ | Offset
limit | Long $<(length: 10)>$ | Limit
categoryDescriptionFilter | String $<(length: 40)>$ | Filtro de descrición de categoría

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
Completar manualmente | Completar manualmente | Completar manualmente 

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
categoryTypes | [SdtsBTSASectionCategoryType](#sdtsbtsasectioncategorytype) | 
hasNext | Boolean | Indica si quedan datos por paginar

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
categoryCode | Short $<(length: 4)>$ | 
categoryDescription | String $<(length: 40)>$ | Descripción de caregoria
:::
<!-- CIERRA SDT -->
