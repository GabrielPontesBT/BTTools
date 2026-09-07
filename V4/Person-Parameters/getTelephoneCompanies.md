---
title: Telephone Companies
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de las compañías telefónicas.

**Nombre publicación:** PublicPersonParameters.telephoneCompanies

**Programa:** PublicAPI.BTPEPA0039

**Alcance:** Global

**Endpoint:** /public/PersonParameters/v1/telephoneCompanies
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
telephoneCompanyIdFilter | Short $<(Length: 3)>$ | Filtro por identificador de companía telefónica.
telephoneCompanyDescriptionFilter | String $<(Length: 50)>$ | Filtro por descripción de companía telefónica.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
telephoneCompanies | [telephoneCompany](#telephonecompany) | Listado de compañías telefónicas.

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
  '{{baseUrl}}/public/PersonParameters/v1/telephoneCompanies' \
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
  "telephoneCompanies": {
    "telephoneCompany": [
      {
        "telephoneCompanyDescription": "ANTEL",
        "telephoneCompanyId": 1
      },
      {
        "telephoneCompanyDescription": "CLARO",
        "telephoneCompanyId": 2
      },
      {
        "telephoneCompanyDescription": "TIGO",
        "telephoneCompanyId": 3
      }
    ]
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details telephoneCompany

### telephoneCompany

::: center
Los campos del tipo de dato estructurado telephoneCompany son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
telephoneCompanyId | Short $<(Length: 3)>$ | Identificador de la compañía telefónica.
telephoneCompanyDescription | String $<(Length: 50)>$ | Descripción de la compañía telefónica.
:::
<!-- CIERRA SDT -->
