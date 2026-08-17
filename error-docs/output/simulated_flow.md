# Simulacion estatica de flujo

## Errores posibles

| Codigo | Mensaje | Programas | Programa ejemplo | Modelo | Parte | Linea | Motivo | Condicion |
|---:|---|---|---|---|---|---:|---|---|
| 500 |  | BTLOPA0021 | BTLOPA0021 | BTV4Loans3 | Procedure | 58 | invalid_params:&productguid | &productGUID = NullValue(&productGUID) |
| 980083 | La moneda y/o papel no está asociada al producto | BTPHA00003 | BTPHA00003 | BTV4Core3 | ProcedureSource | 54 | when_none | when none |
| 990070 | El sistema no se encuentra definido | BTCFA01000, BTCFA02000 | BTCFA02000 | BTV4Core3 | ProcedureSource | 85 | when_none | when none |
| 990071 | El parámetro no se encuentra definido | BTCFA01000, BTCFA02000 | BTCFA02000 | BTV4Core3 | ProcedureSource | 321 | when_none | when none |
| 50050003 | No existe la empresa ingresada | BTA0000017 | BTA0000017 | BTV4Core3 | ProcedureSource | 36 | when_none | when none |
| 120050009 | Debe ingresar el GUID de producto. | BTLOPA0021 | BTLOPA0021 | BTV4Loans3 | Procedure | 35 | invalid_params:&productguid | &productGUID = NullValue(&productGUID) |
| 99990010006 | No se pudo resolver el usuario | BTSCA00006 | BTSCA00006 | BTV4Core3 | ProcedureSource | 34 | when_none | when none |

## Llamados simulados

| Caller | Callee | Modelo | Parte | Linea | Llamado |
|---|---|---|---|---:|---|
| BTLOPA0021 | BTPHA00001 | BTV4Loans3 | Procedure | 40 | Configuration.ProductsHub.ProductsHubAPI.BTPHA00001(&productGUID, &CYCmpyId, &CFSysId, &CUCurrId, &KNKindId, &additionalParams, &mode, &callPgm, &defaultParams, &sBTBusinessErrors) |
| BTLOPA0021 | BTPHA00000 | BTV4Loans3 | Procedure | 12 | Configuration.ProductsHub.ProductsHubAPI.BTPHA00000(&CYCmpyId, &sBTCFParamToReadCollection, &sBTCFParamRead, &additionalParams, &Modo, &Pgmname, &defaultParams, &APIErrId, &APIErrDsc) |
| BTPHA00001 | BTCFA00009 | BTV4Core3 | ProcedureSource | 4 | Configuration.ConfigurationAPI.BTCFA00009(&isExternal, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTPHA00001 | BTCFA00010 | BTV4Core3 | ProcedureSource | 72 | Configuration.ConfigurationAPI.BTCFA00010(&jsonParametersIn, &jsonParametersOut, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTPHA00000 | BTA0000000 | BTV4Core3 | ProcedureSource | 2 | General.GeneralAPI.BTA0000000 (&SCUserId, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTPHA00000 | BTPHA00003 | BTV4Core3 | ProcedureSource | 29 | Configuration.ProductsHub.ProductsHubAPI.BTPHA00003 (&CYCmpyId, &CFSysId, &CUCurrId, &KNKindId, &key, &valid, &additionalParams, 'TST', &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTPHA00000 | BTCFA00000 | BTV4Core3 | ProcedureSource | 11 | Configuration.ConfigurationAPI.BTCFA00000 (&CYCmpyId, &key, &SCUserId, '1', &parmsToReadProdHub, &parmReadProdHub, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTCFA00010 | BTCMA00004 | BTV4Core3 | ProcedureSource | 12 | Consumer.ConsumerAPI.BTCMA00004(&package, &sBTCMService, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00010 | BTV4Core3 | ProcedureSource | 28 | Consumer.ConsumerAPI.BTCMA00010(&package, &parsedPgmName, &sBTCMServiceMethod, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00008 | BTV4Core3 | ProcedureSource | 135 | Consumer.ConsumerAPI.BTCMA00008(&package, &parsedPgmName, &requestBody, &externalRequestId, &internalRequestId, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00009 | BTV4Core3 | ProcedureSource | 149 | Consumer.ConsumerAPI.BTCMA00009(&package, &parsedPgmName, &responseBody, &internalRequestId, &externalRequestId, &result, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTA0000000 | BTA0000001 | BTV4Core3 | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core3 | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTPHA00003 | BTA0000000 | BTV4Core3 | ProcedureSource | 3 | General.GeneralAPI.BTA0000000(&SCUserId, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTCFA00000 | BTA0000000 | BTV4Core3 | ProcedureSource | 9 | call(General.GeneralAPI.BTA0000000, &SCUserId, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTCFA00000 | BTCFA00008 | BTV4Core3 | ProcedureSource | 79 | Configuration.ConfigurationAPI.BTCFA00008(&key,&type, &CYCmpyId, &systemId, &ParamId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00000 | BTCFA00008 | BTV4Core3 | ProcedureSource | 88 | Configuration.ConfigurationAPI.BTCFA00008(&key,&type, &CYCmpyId, &systemId, &ParamId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core3 | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000001 | BTV4Core3 | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core3 | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA02000 | BTV4Core3 | ProcedureSource | 67 | Configuration.ConfigurationAPI.BTCFA02000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA01000 | BTV4Core3 | ProcedureSource | 69 | Configuration.ConfigurationAPI.BTCFA01000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA02000 | BTV4Core3 | ProcedureSource | 79 | Configuration.ConfigurationAPI.BTCFA02000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA01000 | BTV4Core3 | ProcedureSource | 81 | Configuration.ConfigurationAPI.BTCFA01000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core3 | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
