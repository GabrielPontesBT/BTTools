---
title: Get Activity Types
---

<!-- ABRE DATOS DEL MÉTODO -->
::: note Método para obtener un listado de los tipos de actividad.

**Nombre publicación:** PublicPersons.getActivityTypes

**Módulo:** Customers

**Programa:** PublicAPI.BTPEPA0024

**Alcance:** Global
:::
<!-- CIERRA DATOS DEL MÉTODO -->

<!-- ABRE TABLA DE DATOS -->
::: tabs #Datos

@tab Datos de Entrada

No aplica.


@tab Datos de Salida

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
activityTypes | [SdtsBTPEWActivityType](#sdtsbtpewactivitytype) | Listado de tipos de actividades.

@tab Errores

Código | Descripción
:--------- | :-----------
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
    "Token": "0F262E85182DF86F9CA30F0E"
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
    "Token": "0F262E85182DF86F9CA30F0E"
  },
  "activityTypes": {
    "activityType": [
      {
        "ActivityTypeId": 1,
        "ActivityTypeDescription": "PRODUCCIÓN VEGETAL"
      },
      {
        "ActivityTypeId": 2,
        "ActivityTypeDescription": "PRODUCCION ANIMAL"
      },
      {
        "ActivityTypeId": 3,
        "ActivityTypeDescription": "EXPLOTACION AGRICOLA-GANADERA"
      },
      {
        "ActivityTypeId": 4,
        "ActivityTypeDescription": "OTROS SERVICIOS AGROPECUARIOS"
      },
      {
        "ActivityTypeId": 5,
        "ActivityTypeDescription": "CAZA Y REPOBLAC.ANIM. DE CAZA Y SERV.CONEXOS"
      },
      {
        "ActivityTypeId": 6,
        "ActivityTypeDescription": "SILVICULT.,EXTRACC.DE MADERA Y SERV. CONEXOS"
      },
      {
        "ActivityTypeId": 7,
        "ActivityTypeDescription": "PESCA, EXPLOT.CRIAD.PECES,SERV.RELAC.PESCA"
      },
      {
        "ActivityTypeId": 8,
        "ActivityTypeDescription": "EXTRAC. CARBON, LIGNITO Y TURBA"
      },
      {
        "ActivityTypeId": 9,
        "ActivityTypeDescription": "EXTRAC. PETROLEO CRUDO Y GAS NATURAL"
      },
      {
        "ActivityTypeId": 10,
        "ActivityTypeDescription": "EXTRAC. DE MINERALES DE URANIO Y TORIO"
      },
      {
        "ActivityTypeId": 11,
        "ActivityTypeDescription": "EXT. MINERALES METALIFEROS"
      },
      {
        "ActivityTypeId": 12,
        "ActivityTypeDescription": "EXPLOT.DE OTRAS MINAS Y CANTERAS"
      },
      {
        "ActivityTypeId": 13,
        "ActivityTypeDescription": "ELABORACION DE PROD. ALIMENTICIOS Y BEBIDAS"
      },
      {
        "ActivityTypeId": 14,
        "ActivityTypeDescription": "ELABORACION DE PROD.  DE TABACO"
      },
      {
        "ActivityTypeId": 15,
        "ActivityTypeDescription": "FABRICACION DE PRODUCTOS TEXTILES"
      },
      {
        "ActivityTypeId": 16,
        "ActivityTypeDescription": "FABRIC.DE PRENDAS VESTIR Y TEÑIDO DE PIELES"
      },
      {
        "ActivityTypeId": 17,
        "ActivityTypeDescription": "CURTIEMBRES,TALL.ACABADO,FAB.CALZADO DE CUERO"
      },
      {
        "ActivityTypeId": 18,
        "ActivityTypeDescription": "PROD. DE MADERA NO MUEBLES, CAÑA,MIMBRE,CORCH"
      },
      {
        "ActivityTypeId": 19,
        "ActivityTypeDescription": "FAB. DE PAPEL Y DE PRODUCTOS DE PAPEL"
      },
      {
        "ActivityTypeId": 20,
        "ActivityTypeDescription": "ACT.ENCUADERNACION,IMPRESION,EDICION Y REP."
      },
      {
        "ActivityTypeId": 21,
        "ActivityTypeDescription": "FABRICACION DE PROD.DERIV. DE PETROLEO Y CARB"
      },
      {
        "ActivityTypeId": 22,
        "ActivityTypeDescription": "FABRICACION DE SUSTANCIAS Y PROD.QUIMICOS"
      },
      {
        "ActivityTypeId": 23,
        "ActivityTypeDescription": "FAB. DE PRODUCTOS DE CAUCHO Y PLASTICO"
      },
      {
        "ActivityTypeId": 24,
        "ActivityTypeDescription": "FABRICACION OTROS PROD.MINERALES NO METALICO"
      },
      {
        "ActivityTypeId": 25,
        "ActivityTypeDescription": "INDUSTRIAS METALICAS BASICAS"
      },
      {
        "ActivityTypeId": 26,
        "ActivityTypeDescription": "FABRICACION PROD METALICOS, MAQUIN Y EQUIPOS"
      },
      {
        "ActivityTypeId": 27,
        "ActivityTypeDescription": "CONSTRUCCION MAQ. EXCEPTUANDO ELECTRICA"
      },
      {
        "ActivityTypeId": 28,
        "ActivityTypeDescription": "FAB. MAQUIN. DE OFICINA, CONTAB. E INFORMATIC"
      },
      {
        "ActivityTypeId": 29,
        "ActivityTypeDescription": "FAB. MAQUIN. Y APARATOS ELECTRICOS N.C.P."
      },
      {
        "ActivityTypeId": 30,
        "ActivityTypeDescription": "FAB. EQ. Y APARATOS DE RADIO, TV Y COMUNICAC."
      },
      {
        "ActivityTypeId": 31,
        "ActivityTypeDescription": "FAB.INSTRUM. MEDICOS,OPTICOS, PREC. Y RELOJES"
      },
      {
        "ActivityTypeId": 32,
        "ActivityTypeDescription": "FAB. VEHICULOS AUTOMOTORES,REMOLQUES,SEMIREMO"
      },
      {
        "ActivityTypeId": 33,
        "ActivityTypeDescription": "FAB. DE OTROS TIPOS DE EQUIPO DE TRANSPORTE"
      },
      {
        "ActivityTypeId": 34,
        "ActivityTypeDescription": "FAB. DE MUEBLES, INDUST. MANUFACTURERAS N.C.P"
      },
      {
        "ActivityTypeId": 35,
        "ActivityTypeDescription": "RECICLAJE"
      },
      {
        "ActivityTypeId": 36,
        "ActivityTypeDescription": "SUMINISTRO ELECTRICIDAD,GAS,VAPOR,AGUA CALIEN"
      },
      {
        "ActivityTypeId": 37,
        "ActivityTypeDescription": "CAPTACION,DEPURACION Y DISTRIBUCION DE AGUA"
      },
      {
        "ActivityTypeId": 38,
        "ActivityTypeDescription": "CONSTRUCCION"
      },
      {
        "ActivityTypeId": 39,
        "ActivityTypeDescription": "COMERCIO,MANTEN Y REPAR DE AUTOMOTORES Y MOTO"
      },
      {
        "ActivityTypeId": 40,
        "ActivityTypeDescription": "COMERCIO POR MAYOR Y COMISION (EXCEP. VEHICUL"
      },
      {
        "ActivityTypeId": 41,
        "ActivityTypeDescription": "COMERCIO POR MENOR(EXCEP.VEHIC.)REP.ENS.DOMES"
      },
      {
        "ActivityTypeId": 42,
        "ActivityTypeDescription": "HOTELES Y RESTORANES"
      },
      {
        "ActivityTypeId": 43,
        "ActivityTypeDescription": "TRANSPORTE POR VIA TERRESTRE Y POR TUBERIA"
      },
      {
        "ActivityTypeId": 44,
        "ActivityTypeDescription": "TRANSPORTE POR VIA ACUATICA"
      },
      {
        "ActivityTypeId": 45,
        "ActivityTypeDescription": "TRANSPORTE POR VIA AEREA"
      },
      {
        "ActivityTypeId": 46,
        "ActivityTypeDescription": "ACT.TRANSPORTE, COMP.AUXILIARES, AG DE VIAJ"
      },
      {
        "ActivityTypeId": 47,
        "ActivityTypeDescription": "CORREO Y TELECOMUNICACIONES"
      },
      {
        "ActivityTypeId": 48,
        "ActivityTypeDescription": "ESTABLEC.FINANCIEROS(EXCEP.PL.SEGUROS Y PENS."
      },
      {
        "ActivityTypeId": 49,
        "ActivityTypeDescription": "SEGUROS Y PENSIONES(EXCEP.SEG.SOC.AFIL.OBLIGA"
      },
      {
        "ActivityTypeId": 50,
        "ActivityTypeDescription": "ACTIV.AUXIL.DE INTERMEDIACION FINANCIERA"
      },
      {
        "ActivityTypeId": 51,
        "ActivityTypeDescription": "ACTIVIDADES INMOBILIARIAS"
      },
      {
        "ActivityTypeId": 52,
        "ActivityTypeDescription": "ALQUILER MAQ. Y EQUIPOS, EFEC.PERSON.ENSERES"
      },
      {
        "ActivityTypeId": 53,
        "ActivityTypeDescription": "INFORMATICA Y ACTIVIDADES CONEXAS"
      },
      {
        "ActivityTypeId": 54,
        "ActivityTypeDescription": "INVESTIGACION Y DESARROLLO"
      },
      {
        "ActivityTypeId": 55,
        "ActivityTypeDescription": "SERVIC. PREST. A EMPRESAS(EXCEP.ALQ.MAQ. Y EQ"
      },
      {
        "ActivityTypeId": 56,
        "ActivityTypeDescription": "ADMINISTRACION PUBLICA Y DEFENSA"
      },
      {
        "ActivityTypeId": 57,
        "ActivityTypeDescription": "ENSEÑANZA"
      },
      {
        "ActivityTypeId": 58,
        "ActivityTypeDescription": "ACTIVIDADES RELACIONADAS CON LA SALUD HUMANA"
      },
      {
        "ActivityTypeId": 59,
        "ActivityTypeDescription": "ELIMINACION DESPERDICIO Y AG.RESIDUAL. SANEAM"
      },
      {
        "ActivityTypeId": 60,
        "ActivityTypeDescription": "ASOCIACIONES COMERCIALES,PROFES.,LABORAL Y OT"
      },
      {
        "ActivityTypeId": 61,
        "ActivityTypeDescription": "SERVICIOS DE DIVERSION, ESPARC. Y CULTURALES"
      },
      {
        "ActivityTypeId": 62,
        "ActivityTypeDescription": "OTRAS ACTIVIDADES DE SERVICIOS"
      },
      {
        "ActivityTypeId": 63,
        "ActivityTypeDescription": "HOGARES PRIVADOS CON SERVICIO DOMESTICO"
      },
      {
        "ActivityTypeId": 64,
        "ActivityTypeDescription": "ORGANIZACIONES Y ORGANOS EXTRATERRITORIALES"
      },
      {
        "ActivityTypeId": 65,
        "ActivityTypeDescription": "FAMILIAS"
      }
    ]
  },
  "BusinessErrors": {
    "BusinessError": []
  },
  "Btoutreq": {
    "Estado": "OK",
    "Fecha": "2026-05-14",
    "Hora": "18:54:14",
    "Numero": 13469330,
    "Servicio": "PublicPersons.getActivityTypes",
    "Requerimiento": "1",
    "Canal": "BTDIGITAL"
  }
}
```
:::
<!-- CIERRA EJEMPLO DE RESPUESTA -->

## **Tipos de Dato Estructurado**

<!-- ABRE SDT -->
::: details SdtsBTPEWActivityType

### SdtsBTPEWActivityType

::: center
Los campos del tipo de dato estructurado SdtsBTPEWActivityType son los siguientes:

Nombre | Tipo | Comentarios
:--------- | :----------- | :-----------
ActivityTypeId | Long $<(Length: 15)>$ | Identificador del tipo de actividad.
ActivityTypeDescription | String $<(Length: 60)>$ | Descripción del tipo de actividad.
:::
<!-- CIERRA SDT -->
