---
title: Authenticate
type: POST
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note 
Antes de invocar cualquier servicio es necesario obtener un token de sesión válido. Dicho token deberá incluirse en el header **Token** de todas las solicitudes posteriores.

Se obtiene invocando al método enviando un usuario y contraseña válidos según el método de autenticación configurado en el sistema.

El token tiene una duración limitada. Una vez expirado, deberá obtenerse uno nuevo invocando nuevamente este servicio. Si se intenta usar un token vencido, los servicios devolverán un error de autenticación.

**Nombre publicación:** Authenticate.Execute

**Programa:** BTIAUTHENTICATE

**Alcance:** Global

**Endpoint:** /public/Authenticate/v1/execute
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE CONFIGURACIÓN BACKEND -->
::: info Headers

::: comment 

Los headers indicados a continuación deben ser ingresados en los request de todos los métodos.
Para el método **Authenticate.Execute** el header **Token** puede enviarse vacío, ya que éste es el endpoint que lo genera. 
:::

Nombre | Descripción
:--------- | :-----------
Device | Identificador del dispositivo o canal de origen.
Usuario | Usuario que realiza la solicitud.
Requerimiento | Número de requerimiento.
Canal | Canal de comunicación utilizado.
Token | Token de sesión activo.
:::
<!-- CIERRA CONFIGURACIÓN BACKEND -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Body

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
UserId | String | Usuario de autenticación configurado en el sistema.
UserPassword | String | Contraseña correspondiente al usuario.

@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :--------- | :---------
SessionToken | String | Token de sesión a utilizar como valor del header **Token**.

@tab Errores

::: comment
El mensaje de error asociado al código **50** puede variar, ya que es devuelto por el programa de validación de usuario/contraseña, el cual es parametrizable. Pueden existir errores adicionales dependiendo de la configuración del ambiente.
:::

Código | Descripción
:--------- | :---------
50 | Error de autenticación. 
:::
<!-- CIERRA TABLA DE DATOS -->

## **Ejemplos**

<!-- ABRE EJEMPLO DE INVOCACIÓN -->
::: details Ejemplo de Invocación
::: code-tabs #Formato

@tab cURL
```bash
curl -X POST \
  '{{baseUrl}}/public/Authenticate/v1/execute' \
  -H 'Device: {{device}}' \
  -H 'Usuario: {{usuario}}' \
  -H 'Requerimiento: {{requerimiento}}' \
  -H 'Canal: {{canal}}' \
  -H 'Token: ' \
  -H 'Content-Type: application/json' \
  -d '{
  "UserId": "{{userId}}",
  "UserPassword": "{{password}}"
}'
```

@tab JSON Body
```json
{
  "UserId": "{{userId}}",
  "UserPassword": "{{password}}"
}
```

:::
<!-- CIERRA EJEMPLO DE INVOCACIÓN -->

<!-- ABRE EJEMPLO DE RESPUESTA -->
::: details Ejemplo de Respuesta
::: code-tabs #Formato

@tab JSON
```json
{
  "SessionToken": "23B342928917607ECECF65BD"
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->
