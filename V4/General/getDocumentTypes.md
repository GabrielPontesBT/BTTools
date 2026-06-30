---
title: Get Document Types
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note
Método para obtener un listado de los tipos de documento.

**Nombre publicación:** PublicGeneral.getDocumentTypes

**Programa:** PublicAPI.BTDTPA0001

**Alcance:** Global

**Endpoint:** /public/General/v1/getDocumentTypes
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
documentTypes | [SdtsBTDTWDocumentType](#sdtsbtdtwdocumenttype) | Listado de tipos de documentos.

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
  '{{baseUrl}}/public/General/v1/getDocumentTypes' \
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
  "documentTypes": {
    "documentType": [
      {
        "MainDocument": true,
        "Description": "Cédula de Identidad",
        "Format": "N",
        "MinLength": 7,
        "PersonType": "F",
        "Id": 1,
        "AppliesToFI": "N",
        "MaxLength": 12,
        "ShortDescription": "CI"
      },
      {
        "MainDocument": true,
        "Description": "RUT",
        "Format": "N",
        "MinLength": 7,
        "PersonType": "J",
        "Id": 2,
        "AppliesToFI": "S",
        "MaxLength": 24,
        "ShortDescription": "RUT"
      },
      {
        "MainDocument": true,
        "Description": "PASAPORTE",
        "Format": "A",
        "MinLength": 6,
        "PersonType": "F",
        "Id": 3,
        "AppliesToFI": "N",
        "MaxLength": 18,
        "ShortDescription": "PAS"
      },
      {
        "MainDocument": true,
        "Description": "NO RESIDENTE",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 4,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "NRE"
      },
      {
        "MainDocument": false,
        "Description": "LIBRETA DE ENROLAMIE",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "F",
        "Id": 6,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "LEN"
      },
      {
        "MainDocument": false,
        "Description": "CIA(ARGENT.C.DE ID.)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "F",
        "Id": 7,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CIA"
      },
      {
        "MainDocument": false,
        "Description": "CI (BRASIL C.DE ID.)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 8,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CI"
      },
      {
        "MainDocument": true,
        "Description": "Cadastro de Pessoas",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "F",
        "Id": 9,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CPF"
      },
      {
        "MainDocument": false,
        "Description": "CIP(PARAG.C.DE ID.)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "F",
        "Id": 10,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CIP"
      },
      {
        "MainDocument": true,
        "Description": "D.N.I.",
        "Format": "N",
        "MinLength": 8,
        "PersonType": "F",
        "Id": 11,
        "AppliesToFI": "N",
        "MaxLength": 8,
        "ShortDescription": "DNI"
      },
      {
        "MainDocument": false,
        "Description": "III(OTRS.DOC.REST.P.",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "F",
        "Id": 12,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "III"
      },
      {
        "MainDocument": true,
        "Description": "LIBRETA CÍVICA",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "F",
        "Id": 13,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "LCI"
      },
      {
        "MainDocument": true,
        "Description": "Carnet Extranjería",
        "Format": "A",
        "MinLength": 9,
        "PersonType": "F",
        "Id": 14,
        "AppliesToFI": "N",
        "MaxLength": 12,
        "ShortDescription": "C.E."
      },
      {
        "MainDocument": true,
        "Description": "R.U.C.",
        "Format": "N",
        "MinLength": 11,
        "PersonType": "J",
        "Id": 15,
        "AppliesToFI": "S",
        "MaxLength": 11,
        "ShortDescription": "RUC"
      },
      {
        "MainDocument": true,
        "Description": "N.I.T.",
        "Format": "A",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 16,
        "AppliesToFI": "N",
        "MaxLength": 12,
        "ShortDescription": "NIT"
      },
      {
        "MainDocument": false,
        "Description": "CREDENCIAL CÍVICA",
        "Format": "A",
        "MinLength": 6,
        "PersonType": "F",
        "Id": 18,
        "AppliesToFI": "N",
        "MaxLength": 8,
        "ShortDescription": "C.C."
      },
      {
        "MainDocument": true,
        "Description": "DOCUMENTO",
        "Format": "N",
        "MinLength": 5,
        "PersonType": "A",
        "Id": 19,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "DOC"
      },
      {
        "MainDocument": false,
        "Description": "DEPENDENC. ESTATALES",
        "Format": "X",
        "MinLength": 1,
        "PersonType": "A",
        "Id": 20,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "DEP"
      },
      {
        "MainDocument": false,
        "Description": "CIT(ARGENT.-CUIT)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 21,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CIT"
      },
      {
        "MainDocument": false,
        "Description": "CNP(BRASIL-CNPJ)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 22,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CNP"
      },
      {
        "MainDocument": false,
        "Description": "CGC (BRASIL)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 23,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CGC"
      },
      {
        "MainDocument": false,
        "Description": "RPC (PARAGUAY)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 24,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "RPC"
      },
      {
        "MainDocument": false,
        "Description": "AUTONUM PRUEBA",
        "Format": "X",
        "MinLength": 0,
        "PersonType": "F",
        "Id": 25,
        "AppliesToFI": "N",
        "MaxLength": 0,
        "ShortDescription": "NUM"
      },
      {
        "MainDocument": true,
        "Description": "CLAVE ÚNICA REGISTRO POBlACIÓN",
        "Format": "A",
        "MinLength": 18,
        "PersonType": "F",
        "Id": 26,
        "AppliesToFI": "N",
        "MaxLength": 18,
        "ShortDescription": "CURP"
      },
      {
        "MainDocument": false,
        "Description": "BPS",
        "Format": "N",
        "MinLength": 9,
        "PersonType": "J",
        "Id": 30,
        "AppliesToFI": "N",
        "MaxLength": 15,
        "ShortDescription": "BPS"
      },
      {
        "MainDocument": false,
        "Description": "INS (BRASIL-INSS)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 31,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "INS"
      },
      {
        "MainDocument": false,
        "Description": "IPS (PARAGUAY)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 32,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "ips"
      },
      {
        "MainDocument": false,
        "Description": "OPS (RESTO D/MUNDO)",
        "Format": "N",
        "MinLength": 8,
        "PersonType": "J",
        "Id": 34,
        "AppliesToFI": "N",
        "MaxLength": 20,
        "ShortDescription": "OPS"
      },
      {
        "MainDocument": false,
        "Description": "REG(ID.REGISTR.MUNDO",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 35,
        "AppliesToFI": "N",
        "MaxLength": 15,
        "ShortDescription": "REG"
      },
      {
        "MainDocument": false,
        "Description": "CPI(SI NO POSEE ID.)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 36,
        "AppliesToFI": "N",
        "MaxLength": 99,
        "ShortDescription": "CPI"
      },
      {
        "MainDocument": false,
        "Description": "prueba",
        "Format": "A",
        "MinLength": 9,
        "PersonType": "A",
        "Id": 37,
        "AppliesToFI": "N",
        "MaxLength": 20,
        "ShortDescription": "prueb"
      },
      {
        "MainDocument": false,
        "Description": "CUIT",
        "Format": "N",
        "MinLength": 11,
        "PersonType": "J",
        "Id": 80,
        "AppliesToFI": "N",
        "MaxLength": 11,
        "ShortDescription": "CUIT"
      },
      {
        "MainDocument": true,
        "Description": "A REGULARIZAR",
        "Format": "X",
        "MinLength": 0,
        "PersonType": "F",
        "Id": 90,
        "AppliesToFI": "N",
        "MaxLength": 0,
        "ShortDescription": "AREG"
      },
      {
        "MainDocument": false,
        "Description": "CPJ (TODO MUNDO)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 96,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "CPJ"
      },
      {
        "MainDocument": false,
        "Description": "CNP (BRASIL)",
        "Format": "N",
        "MinLength": 1,
        "PersonType": "J",
        "Id": 97,
        "AppliesToFI": "N",
        "MaxLength": 9,
        "ShortDescription": "CNP"
      },
      {
        "MainDocument": true,
        "Description": "Inst. Financiera",
        "Format": "X",
        "MinLength": 0,
        "PersonType": "J",
        "Id": 99,
        "AppliesToFI": "E",
        "MaxLength": 0,
        "ShortDescription": "IF"
      }
    ]
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
:--------- | :--------- | :---------
AppliesToFI | String $<(Length: 1)>$ | ¿Aplica a institución financiera? (S:Si, N:No, E:Exclusivo para instituciones financieras).
Description | String $<(Length: 30)>$ | Descripción del tipo de documento.
Format | String $<(Length: 1)>$ | Formato. (A:Alfanumérico, N:Numérico, X:Autonumerado).
Id | Short | Identificador del tipo de documento.
MainDocument | Boolean $<(Length: 1)>$ | ¿Es documento principal?
MaxLength | Short | Longitud máxima.
MinLength | Byte $<(Length: 2)>$ | Longitud mínima.
PersonType | String $<(Length: 1)>$ | Tipo de persona para el que aplica. (F:Física, J:Jurídica, A:Ambos).
ShortDescription | String $<(Length: 5)>$ | Descripción corta.
:::
<!-- CIERRA SDT -->
