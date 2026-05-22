---
title: Get Document Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de tipos los de documento.

**Nombre publicación:** PublicGeneral.getDocumentTypes

**Módulo:** General

**Programa:** PublicAPI.BTDTPA0001

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
documentTypes | [SdtsBTDTWDocumentType](#sdtsbtdtwdocumenttype) | Listado de tipos de documentos.

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
  "documentTypes": {
    "documentType": [
      {
        "Id": 1,
        "Description": "Cédula de Identidad",
        "ShortDescription": "CI",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 7,
        "MaxLength": 12,
        "MainDocument": true
      },
      {
        "Id": 2,
        "Description": "RUT",
        "ShortDescription": "RUT",
        "PersonType": "J",
        "AppliesToFI": "S",
        "Format": "N",
        "MinLength": 7,
        "MaxLength": 24,
        "MainDocument": true
      },
      {
        "Id": 3,
        "Description": "PASAPORTE",
        "ShortDescription": "PAS",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "A",
        "MinLength": 6,
        "MaxLength": 18,
        "MainDocument": true
      },
      {
        "Id": 4,
        "Description": "NO RESIDENTE",
        "ShortDescription": "NRE",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 9,
        "MainDocument": true
      },
      {
        "Id": 6,
        "Description": "LIBRETA DE ENROLAMIE",
        "ShortDescription": "LEN",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 7,
        "Description": "CIA(ARGENT.C.DE ID.)",
        "ShortDescription": "CIA",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 8,
        "Description": "CI (BRASIL C.DE ID.)",
        "ShortDescription": "CI",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 9,
        "Description": "Cadastro de Pessoas",
        "ShortDescription": "CPF",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": true
      },
      {
        "Id": 10,
        "Description": "CIP(PARAG.C.DE ID.)",
        "ShortDescription": "CIP",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 11,
        "Description": "D.N.I.",
        "ShortDescription": "DNI",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 8,
        "MaxLength": 8,
        "MainDocument": true
      },
      {
        "Id": 12,
        "Description": "III(OTRS.DOC.REST.P.",
        "ShortDescription": "III",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 9,
        "MainDocument": false
      },
      {
        "Id": 13,
        "Description": "LIBRETA CÍVICA",
        "ShortDescription": "LCI",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 9,
        "MainDocument": true
      },
      {
        "Id": 14,
        "Description": "Carnet Extranjería",
        "ShortDescription": "C.E.",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "A",
        "MinLength": 9,
        "MaxLength": 12,
        "MainDocument": true
      },
      {
        "Id": 15,
        "Description": "R.U.C.",
        "ShortDescription": "RUC",
        "PersonType": "J",
        "AppliesToFI": "S",
        "Format": "N",
        "MinLength": 11,
        "MaxLength": 11,
        "MainDocument": true
      },
      {
        "Id": 16,
        "Description": "N.I.T.",
        "ShortDescription": "NIT",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "A",
        "MinLength": 1,
        "MaxLength": 12,
        "MainDocument": true
      },
      {
        "Id": 18,
        "Description": "CREDENCIAL CÍVICA",
        "ShortDescription": "C.C.",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "A",
        "MinLength": 6,
        "MaxLength": 8,
        "MainDocument": false
      },
      {
        "Id": 19,
        "Description": "DOCUMENTO",
        "ShortDescription": "DOC",
        "PersonType": "A",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 5,
        "MaxLength": 9,
        "MainDocument": true
      },
      {
        "Id": 20,
        "Description": "DEPENDENC. ESTATALES",
        "ShortDescription": "DEP",
        "PersonType": "A",
        "AppliesToFI": "N",
        "Format": "X",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 21,
        "Description": "CIT(ARGENT.-CUIT)",
        "ShortDescription": "CIT",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 22,
        "Description": "CNP(BRASIL-CNPJ)",
        "ShortDescription": "CNP",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 23,
        "Description": "CGC (BRASIL)",
        "ShortDescription": "CGC",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 24,
        "Description": "RPC (PARAGUAY)",
        "ShortDescription": "RPC",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 25,
        "Description": "AUTONUM PRUEBA",
        "ShortDescription": "NUM",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "X",
        "MinLength": 0,
        "MaxLength": 0,
        "MainDocument": false
      },
      {
        "Id": 26,
        "Description": "CLAVE ÚNICA REGISTRO POBlACIÓN",
        "ShortDescription": "CURP",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "A",
        "MinLength": 18,
        "MaxLength": 18,
        "MainDocument": true
      },
      {
        "Id": 30,
        "Description": "BPS",
        "ShortDescription": "BPS",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 9,
        "MaxLength": 15,
        "MainDocument": false
      },
      {
        "Id": 31,
        "Description": "INS (BRASIL-INSS)",
        "ShortDescription": "INS",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 32,
        "Description": "IPS (PARAGUAY)",
        "ShortDescription": "ips",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 9,
        "MainDocument": false
      },
      {
        "Id": 34,
        "Description": "OPS (RESTO D/MUNDO)",
        "ShortDescription": "OPS",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 8,
        "MaxLength": 20,
        "MainDocument": false
      },
      {
        "Id": 35,
        "Description": "REG(ID.REGISTR.MUNDO",
        "ShortDescription": "REG",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 15,
        "MainDocument": false
      },
      {
        "Id": 36,
        "Description": "CPI(SI NO POSEE ID.)",
        "ShortDescription": "CPI",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 99,
        "MainDocument": false
      },
      {
        "Id": 80,
        "Description": "CUIT",
        "ShortDescription": "CUIT",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 11,
        "MaxLength": 11,
        "MainDocument": false
      },
      {
        "Id": 90,
        "Description": "A REGULARIZAR",
        "ShortDescription": "AREG",
        "PersonType": "F",
        "AppliesToFI": "N",
        "Format": "X",
        "MinLength": 0,
        "MaxLength": 0,
        "MainDocument": true
      },
      {
        "Id": 96,
        "Description": "CPJ (TODO MUNDO)",
        "ShortDescription": "CPJ",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 9,
        "MainDocument": false
      },
      {
        "Id": 97,
        "Description": "CNP (BRASIL)",
        "ShortDescription": "CNP",
        "PersonType": "J",
        "AppliesToFI": "N",
        "Format": "N",
        "MinLength": 1,
        "MaxLength": 9,
        "MainDocument": false
      },
      {
        "Id": 99,
        "Description": "Inst. Financiera",
        "ShortDescription": "IF",
        "PersonType": "J",
        "AppliesToFI": "E",
        "Format": "X",
        "MinLength": 0,
        "MaxLength": 0,
        "MainDocument": true
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-22",
    "Hora": "17:19:23",
    "Numero": 13506050,
    "Servicio": "PublicGeneral.getDocumentTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTDTWDocumentType

### SdtsBTDTWDocumentType

::: center
Los campos del tipo de dato estructurado SdtsBTDTWDocumentType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
AppliesToFI | String $<(length: 1)>$ | Aplica a institución financiera.
Description | String $<(length: 30)>$ | Descripción.
Format | String $<(length: 1)>$ | Formato.
Id | Short | Identificador.
MainDocument | Boolean $<(length: 1)>$ | Documento principal.
MaxLength | Short | Longitud máxima.
MinLength | Byte $<(length: 2)>$ | Longitud mínima.
PersonType | String $<(length: 1)>$ | Tipo de persona.
ShortDescription | String $<(length: 5)>$ | Descripción corta.
:::
<!-- CIERRA SDT -->
