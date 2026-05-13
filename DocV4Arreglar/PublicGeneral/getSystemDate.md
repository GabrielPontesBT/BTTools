---
title: Obtener System Fecha [REVISAR]
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener la fecha del sistema.

**Nombre publicación:** PublicGeneral.getSystemDate

**Módulo:** General

**Programa:** PublicAPI.BTCYPA0001

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
systemDate | Date | Fecha del sistema.

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
    "Token": "907FDCD8173D3FB297F702B1"
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
    "Token": "907FDCD8173D3FB297F702B1"
  },
  "systemDate": "2027-04-30",
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-13",
    "Hora": "20:19:16",
    "Numero": 13466221,
    "Servicio": "PublicGeneral.getSystemDate",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->


