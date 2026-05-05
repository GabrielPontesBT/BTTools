---
title: Obtener Datos de Contacto de Persona
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
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener los datos de contacto asociados a una persona.
Este servicio permite ontener los metodos de contacto de una persona. 

**Nombre publicación:** PublicPersons.getContactData

**Módulo:** Persons.PublicApi

**Programa:** (No informado)

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Parámetros de Entrada

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
personGUID | String | Identificador único de la persona.

@tab Body

No aplica.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
contacts | Array | Lista de datos de contacto asociados a la persona.
Correlative | Integer | Número correlativo del contacto.
ContactTypeId | Integer | Identificador del tipo de contacto.
ContactTypeDescription | String | Descripción del tipo de contacto.
Text | String | Valor del contacto (ej. email o teléfono).
Comment | String | Comentario asociado al contacto.
TelephoneCompanyId | Integer | Identificador de compañía telefónica.
TelephoneCompanyDescription | String | Descripción de compañía telefónica.
Enabled | Boolean | Indica si el contacto está habilitado.
AssociatedToAnAddress | Boolean | Indica si está asociado a dirección.
AddressCorrelative | Integer | Correlativo de dirección.
AddressId | Integer | Identificador de dirección.
Validated | Boolean | Indica si fue validado.
ReceivesMails | Boolean | Indica si recibe mails.
StartTimeRange1 | String | Inicio rango horario 1.
EndTimeRange1 | String | Fin rango horario 1.
StartTimeRange2 | String | Inicio rango horario 2.
EndTimeRange2 | String | Fin rango horario 2.
Priority | Integer | Prioridad del contacto.

@tab Errores

Código | Descripción
:--------- | :-----------
(Se documentan según catálogo de errores)
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRO EJEMPLO DE INVOCACIÓN -->

## Ejemplo de Invocación
@tab json
```json
curl -X POST \
  'http://btd-bantotal.eastus2.cloudapp.azure.com:4462/btdeveloper/servlet/com.dlya.bantotal.odwsbt_PublicPersons_v1?getContactData' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
  "Btinreq": {
    "Canal": "BTDIGITAL",
    "Usuario": "INSTALADOR",
    "Device": "FPAIS",
    "Requerimiento": "1",
    "Token": "DC839D5B91EA47C8A7916600"
  },
  "personGUID": "183f5194-f5a9-4590-9aff-b43de58c263d"
}'
```

<!-- CIERRO EJEMPLO DE INVOCACIÓN -->

<!-- ABRO EJEMPLO DE RESPUESTA -->

## Ejemplo de Respuesta
@tab json
```json
{
  "contacts": {
    "contactsItem": {
      "Correlative": "1",
      "ContactTypeId": "3",
      "ContactTypeDescription": "CORREO ELECTRÓNICO",
      "Text": "pcrampet@bantotal.com",
      "Comment": "ninguno importante",
      "TelephoneCompanyId": "0",
      "TelephoneCompanyDescription": "",
      "Enabled": "true",
      "AssociatedToAnAddress": "false",
      "AddressCorrelative": "0",
      "AddressId": "",
      "Validated": "false",
      "ReceivesMails": "false",
      "StartTimeRange1": "",
      "EndTimeRange1": "",
      "StartTimeRange2": "",
      "EndTimeRange2": "",
      "Priority": "0"
    }
  },
  "_xmlns": "http://uy.com.dlya.bantotal/BTSOA/"
}
```

<!-- CIERRO EJEMPLO DE RESPUESTA -->
