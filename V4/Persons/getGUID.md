---
title: Get G U I D
type: GET
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener el GUID de una persona.

**Nombre publicación:** PublicPersons.getGUID

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0002

**Alcance:** Global

**Endpoint:** /public/Persons/v1/getGUID
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Headers

Header | Descripción
:--------- | :-----------
Device | Identificador del dispositivo o canal de origen.
Usuario | Usuario que realiza la solicitud.
Requerimiento | Número de requerimiento.
Canal | Canal de comunicación utilizado.
Token | Token de sesión activo.

@tab Datos de Entrada

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
countryId | Short $<(Length: 3)>$ | Identificador de país.
documentTypeId | Short $<(Length: 4)>$ | Tipo de documento.
documentNumber | String $<(Length: 25)>$ | Número de documento.

@tab Body

Completar manualmente

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
personGUID | String $<(Length: 36)>$ | GUID (identificador único global) de la persona.

@tab Errores

Código | Descripción | Programas
:--------- | :----------- | :-----------
500 |  | BTPEPA0002
40010004 | La persona no existe | BTPEA00000
40050002 | Debe ingresar el identificador de país. | BTPEPA0002
40050003 | Debe ingresar el identificador de tipo de documento. | BTPEPA0002
40050004 | Debe ingresar el número de documento. | BTPEPA0002
50020018 | El país no se encuentra registrado | BTCNA00000
50030001 | Debe ingresar un tipo de documento válido | BTDTA00000

:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato
@tab JSON
```json
{}
```
@tab HEADERS
```bash
curl -X GET \
  'http://10.0.0.7:5101/api/publicapi/public/Persons/v1/getGUID?countryId=858&documentTypeId=1&documentNumber=71336785' \
  -H 'Device: POC' \
  -H 'Usuario: INSTALADOR' \
  -H 'Requerimiento: 1' \
  -H 'Canal: BTMOBILE' \
  -H 'Token: 03C72DF200D462B6CD7DE909'
```
:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato
@tab JSON
```json
{
  "personGUID": "b51b92ac-47e2-42df-8e68-c41bbe6257ce"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->