# Simulacion estatica de flujo

## Errores posibles

| Codigo | Mensaje | Programas | Programa ejemplo | Modelo | Parte | Linea | Motivo | Condicion |
|---:|---|---|---|---|---|---:|---|---|
| 500 |  | BTCYPA0001 | BTCYPA0001 | BTV4Core3 | Procedure | 25 | root_program | root program |
| 50050003 | No existe la empresa ingresada | BTA0000017 | BTA0000017 | BTV4Core3 | ProcedureSource | 36 | when_none | when none |
| 99990010006 | No se pudo resolver el usuario | BTSCA00006 | BTSCA00006 | BTV4Core3 | ProcedureSource | 34 | when_none | when none |

## Llamados simulados

| Caller | Callee | Modelo | Parte | Linea | Llamado |
|---|---|---|---|---:|---|
| BTCYPA0001 | BTA0000000 | BTV4Core3 | Procedure | 4 | General.GeneralAPI.BTA0000000(&Usuario, &PgCod, &modo, &Pgmname, &defaultParams, &APIErrId, &APIErrDsc) |
| BTCYPA0001 | BTA0000000 | BTV4PublicAPI | Procedure | 4 | General.GeneralAPI.BTA0000000(&Usuario, &PgCod, &modo, &Pgmname, &defaultParams, &APIErrId, &APIErrDsc) |
| BTA0000000 | BTA0000001 | BTV4Core3 | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core3 | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core3 | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
