# Simulacion estatica de flujo

## Errores posibles

| Codigo | Mensaje | Programas | Programa ejemplo | Modelo | Parte | Linea | Motivo | Condicion |
|---:|---|---|---|---|---|---:|---|---|
| 500 |  | BTLOPA0058 | BTLOPA0058 | BTV4Loans | DataProviderSource | 32 | invalid_params:&groupid | &groupId = 0 |
| 990070 | El sistema no se encuentra definido | BTCFA01000, BTCFA02000 | BTCFA02000 | BTV4Core | ProcedureSource | 85 | when_none | when none |
| 990071 | El parámetro no se encuentra definido | BTCFA01000, BTCFA02000 | BTCFA02000 | BTV4Core | ProcedureSource | 322 | when_none | when none |
| 40020012 | El número de contraparte no existe | BTCPA00000 | BTCPA00000 | BTV4Customers | ProcedureSource | 149 | when_none | when none |
| 50050003 | No existe la empresa ingresada | BTA0000017 | BTA0000017 | BTV4Core | ProcedureSource | 36 | when_none | when none |
| 120020044 | Operación inválida | BTLOA00105 | BTLOA00105 | BTV4Loans | DataProviderSource | 59 | when_none | when none |
| 120050001 | Debe ingresar el GUID de préstamo. | BTLOPA0058 | BTLOPA0058 | BTV4Loans | DataProviderSource | 14 | invalid_params:&loanguid | &loanGUID.IsEmpty() |
| 120050010 | Debe ingresar el GUID de grupo. | BTLOPA0058 | BTLOPA0058 | BTV4Loans | DataProviderSource | 9 | invalid_params:&groupid | &groupId = 0 |
| 120060101 | El grupo no existe | BTMGA00015 | BTMGA00015 | BTV4Loans | DataProviderSource | 91 | invalid_params:&logroupid | where MGGroupId = &LOGroupId |

## Llamados simulados

| Caller | Callee | Modelo | Parte | Linea | Llamado |
|---|---|---|---|---:|---|
| BTLOPA0058 | BTLOA00105 | BTV4Loans | DataProviderSource | 17 | Loans.LoansAPI.BTLOA00105(&loanGUID,0,&queryDate,&CyCmpyId,&MDModuleId,&BRBranchId,&CUCurrId,&KNKindId,&CPCtrprtId,&LOOperId,&LOSubOpeId,&MDOpeTypId,&LOProdId,&sBTLOLoan,&additionalParams,&mode,&Pgmname,&defaultParams,&sBTBusinessErrors) |
| BTLOPA0058 | BTMGW00052 | BTV4Loans | DataProviderSource | 4 | Loans.MicrofinanceGroup.BTMGW00052(&groupId,&CyCmpyId,&MDModuleId,&BRBranchId,&CUCurrId,&KNKindId,&CPCtrprtId,&LOOperId,&LOSubOpeId,&MDOpeTypId,&sBTBusinessErrors) |
| BTLOA00105 | BTCFA00009 | BTV4Loans | DataProviderSource | 1 | Configuration.ConfigurationAPI.BTCFA00009(&isExternal, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTLOA00105 | BTCFA00010 | BTV4Loans | DataProviderSource | 147 | Configuration.ConfigurationAPI.BTCFA00010(&jsonParametersIn, &jsonParametersOut, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTMGW00052 | BTA0000000 | BTV4Loans | DataProviderSource | 20 | General.GeneralAPI.BTA0000000 (&SCUserId, &CYCmpyId, '',&Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTMGW00052 | BTMGA00015 | BTV4Loans | DataProviderSource | 29 | Loans.MicrofinanceGroup.MicrofinanceGroupAPI.BTMGA00015(&CYCmpyId,&MGGroupId,&levelId,&withDescription,&sBTMGGroupLoan,&sBTMGLoanGroupCycle,&additionalParams,'CYC',&Pgmname,&defaultParams,&sBTBusinessErrors) |
| BTMGW00052 | BTMG000020 | BTV4Loans | DataProviderSource | 13 | Loans.MicrofinanceGroup.BTMG000020(&sBTMGGroupLoanCycleMember,'STA',&sBTBusinessErrors) |
| BTMGW00052 | BTMGA00013 | BTV4Loans | DataProviderSource | 17 | Loans.MicrofinanceGroup.MicrofinanceGroupAPI.BTMGA00013(&CYCmpyId,&MGGroupId,&MGCycleId,&sBTLOLoan,&additionalParams,&mode,&Pgmname,&defaultParams,&sBTBusinessErrors) |
| BTCFA00009 | BTCFA00011 | BTV4Core | ProcedureSource | 3 | Configuration.ConfigurationAPI.BTCFA00011(&isMicroservice, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCFA00010 | BTCMA00004 | BTV4Core | ProcedureSource | 12 | Consumer.ConsumerAPI.BTCMA00004(&package, &sBTCMService, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00010 | BTV4Core | ProcedureSource | 28 | Consumer.ConsumerAPI.BTCMA00010(&package, &parsedPgmName, &sBTCMServiceMethod, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCFA00014 | BTV4Core | ProcedureSource | 67 | Configuration.ConfigurationAPI.BTCFA00014(&interServiceEnabled, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTBSA00009 | BTV4Core | ProcedureSource | 250 | BTS.BTSAPI.BTBSA00009(&channel, 'MicroservicesReuseHeaders', µservicesReuseHeaders, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCFA00013 | BTV4Core | ProcedureSource | 255 | Configuration.ConfigurationAPI.BTCFA00013(&serviceName, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00008 | BTV4Core | ProcedureSource | 279 | Consumer.ConsumerAPI.BTCMA00008(&package, &parsedPgmName, &requestBody, &externalRequestId, &internalRequestId, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00009 | BTV4Core | ProcedureSource | 285 | Consumer.ConsumerAPI.BTCMA00009(&package, &parsedPgmName, &responseBody, &internalRequestId, &externalRequestId, &result, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTBSA00009 | BTV4Core | ProcedureSource | 250 | BTS.BTSAPI.BTBSA00009(&channel, 'MicroservicesReuseHeaders', µservicesReuseHeaders, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCFA00013 | BTV4Core | ProcedureSource | 255 | Configuration.ConfigurationAPI.BTCFA00013(&serviceName, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00008 | BTV4Core | ProcedureSource | 279 | Consumer.ConsumerAPI.BTCMA00008(&package, &parsedPgmName, &requestBody, &externalRequestId, &internalRequestId, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00009 | BTV4Core | ProcedureSource | 285 | Consumer.ConsumerAPI.BTCMA00009(&package, &parsedPgmName, &responseBody, &internalRequestId, &externalRequestId, &result, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTA0000000 | BTA0000001 | BTV4Core | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTMGA00015 | BTCFA00009 | BTV4Loans | DataProviderSource | 3 | Configuration.ConfigurationAPI.BTCFA00009(&isExternal, &additionalParams, &modo, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTMGA00015 | BTCFA00010 | BTV4Loans | DataProviderSource | 200 | Configuration.ConfigurationAPI.BTCFA00010(&jsonParametersIn, &jsonParametersOut, &additionalParams, &modo, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTMGA00015 | BTA0000000 | BTV4Loans | DataProviderSource | 18 | General.GeneralAPI.BTA0000000 (&SCUserId, &CYCmpyId, &modoparm, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTMGA00015 | BTMG000001 | BTV4Loans | DataProviderSource | 99 | Loans.MicrofinanceGroup.BTMG000001(&sBTMGGroupLoanMemberTypeCollection, 'DSP', &sBTBusinessErrors) |
| BTMGA00015 | BTCPA00000 | BTV4Loans | DataProviderSource | 152 | Customers.CustomersAPI.BTCPA00000(&CYCmpyId, &CPCtrprtId, &levelparm, &customFields, &sBTCPCounterpartyQuery, &additionalParams, &modoparm, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTMG000020 | BTA0000000 | BTV4Loans | DataProviderSource | 2 | General.GeneralAPI.BTA0000000(&BTSCUser, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTMGA00013 | BTCFA00009 | BTV4Loans | DataProviderSource | 3 | Configuration.ConfigurationAPI.BTCFA00009(&isExternal, &additionalParams, &modo, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTMGA00013 | BTCFA00010 | BTV4Loans | DataProviderSource | 159 | Configuration.ConfigurationAPI.BTCFA00010(&jsonParametersIn, &jsonParametersOut, &additionalParams, &modo, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTMGA00013 | BTMG000018 | BTV4Loans | DataProviderSource | 87 | Loans.MicrofinanceGroup.BTMG000018(&sBTMGLoanGroupCycle,&auxModo,&sBTBusinessErrors) |
| BTMGA00013 | BTMG000018 | BTV4Loans | DataProviderSource | 117 | Loans.MicrofinanceGroup.BTMG000018(&sBTMGLoanGroupCycle,&auxModo,&sBTBusinessErrors) |
| BTMGA00013 | BTMG000018 | BTV4Loans | DataProviderSource | 121 | Loans.MicrofinanceGroup.BTMG000018(&sBTMGLoanGroupCycle,&auxModo,&sBTBusinessErrors) |
| BTA0000001 | BTSCA00006 | BTV4Core | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTCFA00009 | BTCFA00011 | BTV4Core | ProcedureSource | 3 | Configuration.ConfigurationAPI.BTCFA00011(&isMicroservice, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCFA00010 | BTCMA00004 | BTV4Core | ProcedureSource | 12 | Consumer.ConsumerAPI.BTCMA00004(&package, &sBTCMService, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00010 | BTV4Core | ProcedureSource | 28 | Consumer.ConsumerAPI.BTCMA00010(&package, &parsedPgmName, &sBTCMServiceMethod, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCFA00014 | BTV4Core | ProcedureSource | 67 | Configuration.ConfigurationAPI.BTCFA00014(&interServiceEnabled, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTBSA00009 | BTV4Core | ProcedureSource | 250 | BTS.BTSAPI.BTBSA00009(&channel, 'MicroservicesReuseHeaders', µservicesReuseHeaders, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCFA00013 | BTV4Core | ProcedureSource | 255 | Configuration.ConfigurationAPI.BTCFA00013(&serviceName, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00008 | BTV4Core | ProcedureSource | 279 | Consumer.ConsumerAPI.BTCMA00008(&package, &parsedPgmName, &requestBody, &externalRequestId, &internalRequestId, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00009 | BTV4Core | ProcedureSource | 285 | Consumer.ConsumerAPI.BTCMA00009(&package, &parsedPgmName, &responseBody, &internalRequestId, &externalRequestId, &result, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTBSA00009 | BTV4Core | ProcedureSource | 250 | BTS.BTSAPI.BTBSA00009(&channel, 'MicroservicesReuseHeaders', µservicesReuseHeaders, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCFA00013 | BTV4Core | ProcedureSource | 255 | Configuration.ConfigurationAPI.BTCFA00013(&serviceName, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00008 | BTV4Core | ProcedureSource | 279 | Consumer.ConsumerAPI.BTCMA00008(&package, &parsedPgmName, &requestBody, &externalRequestId, &internalRequestId, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTCFA00010 | BTCMA00009 | BTV4Core | ProcedureSource | 285 | Consumer.ConsumerAPI.BTCMA00009(&package, &parsedPgmName, &responseBody, &internalRequestId, &externalRequestId, &result, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors1) |
| BTA0000000 | BTA0000001 | BTV4Core | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTMG000001 | BTA0000000 | BTV4Loans | DataProviderSource | 1 | General.GeneralAPI.BTA0000000 (&SCUserId, &CYCmpyId, &mode, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTCPA00000 | BTCFA00009 | BTV4Customers | ProcedureSource | 1 | Configuration.ConfigurationAPI.BTCFA00009(&isExternal, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCPA00000 | BTCFA00010 | BTV4Customers | ProcedureSource | 395 | Configuration.ConfigurationAPI.BTCFA00010(&jsonParametersIn, &jsonParametersOut, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCPA00000 | BTA0000000 | BTV4Customers | ProcedureSource | 66 | General.GeneralAPI.BTA0000000 (&SCUserId, &CYCmpyId, &mode,  &callPgm, &defaultParams, &apiErrId, &apiErrDsc) |
| BTCPA00000 | BTCPA00056 | BTV4Customers | ProcedureSource | 113 | Customers.CustomersAPI.BTCPA00056(&CYCmpyId, &SCUserId, &CPCtrprtId, &habilitado, &additionalParams, '', &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCPA00000 | BTCFA00000 | BTV4Customers | ProcedureSource | 310 | Configuration.ConfigurationAPI.BTCFA00000 (&CYCmpyId, &namespace,  &SCUserId, '1', &sBTCFParamsToRead, &sBTCFParamRead, &Pgmname, '', &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000001 | BTV4Core | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTMG000018 | BTA0000000 | BTV4Loans | DataProviderSource | 2 | General.GeneralAPI.BTA0000000(&BTSCUser, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTMG000018 | BTA0000000 | BTV4Loans | DataProviderSource | 2 | General.GeneralAPI.BTA0000000(&BTSCUser, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTMG000018 | BTA0000000 | BTV4Loans | DataProviderSource | 2 | General.GeneralAPI.BTA0000000(&BTSCUser, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000001 | BTV4Core | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTCPA00056 | BTCFA00009 | BTV4Customers | ProcedureSource | 1 | Configuration.ConfigurationAPI.BTCFA00009(&isExternal, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCPA00056 | BTCFA00010 | BTV4Customers | ProcedureSource | 103 | Configuration.ConfigurationAPI.BTCFA00010(&jsonParametersIn, &jsonParametersOut, &additionalParams, &mode, &Pgmname, &defaultParams, &sBTBusinessErrors) |
| BTCPA00056 | BTA0000000 | BTV4Customers | ProcedureSource | 16 | General.GeneralAPI.BTA0000000(&SCUserId, &CYCmpyId, &mode,  &Pgmname,&defaultParams, &apiErrId, &apiErrDsc) |
| BTCPA00056 | BTSCA00000 | BTV4Customers | ProcedureSource | 24 | Security.SecurityAPI.BTSCA00000(&CYCmpyId, &SCUserId, &sBTSCURolCollection, &additionalParams, 'DSP',  &Pgmname,&defaultParams, &apiErrId, &apiErrDsc) |
| BTCFA00000 | BTA0000000 | BTV4Core | ProcedureSource | 9 | call(General.GeneralAPI.BTA0000000, &SCUserId, &CYCmpyId, &modo, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTCFA00000 | BTCFA00008 | BTV4Core | ProcedureSource | 79 | Configuration.ConfigurationAPI.BTCFA00008(&key,&type, &CYCmpyId, &systemId, &ParamId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00000 | BTCFA00008 | BTV4Core | ProcedureSource | 88 | Configuration.ConfigurationAPI.BTCFA00008(&key,&type, &CYCmpyId, &systemId, &ParamId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000001 | BTV4Core | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000001 | BTV4Core | ProcedureSource | 1 | call(General.GeneralAPI.BTA0000001, &SCUserId, &CYCmpyId, &sBTPAUsuario, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000000 | BTA0000017 | BTV4Core | ProcedureSource | 10 | call(General.GeneralAPI.BTA0000017, &CYCmpyId, &sBTPAEmpresa, &Pgmname, &mode, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTSCA00000 | BTA0000000 | BTV4Core | ProcedureSource | 2 | General.GeneralAPI.BTA0000000(&auxBTSCUser, &auxBTCYCmpyId, &mode, &Pgmname, &defaultParams, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA02000 | BTV4Core | ProcedureSource | 67 | Configuration.ConfigurationAPI.BTCFA02000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA01000 | BTV4Core | ProcedureSource | 69 | Configuration.ConfigurationAPI.BTCFA01000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA02000 | BTV4Core | ProcedureSource | 79 | Configuration.ConfigurationAPI.BTCFA02000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &CUCurrId, &KNKindId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTCFA00008 | BTCFA01000 | BTV4Core | ProcedureSource | 81 | Configuration.ConfigurationAPI.BTCFA01000(&key, &type, &CYCmpyId, &CFSysId, &CFParId, &user, &callPgm, &systemRead, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTA0000001 | BTSCA00006 | BTV4Core | ProcedureSource | 1 | Security.SecurityAPI.BTSCA00006(&SCUserId, &SCCompny, &sBTPAUsuario, &Pgmname, &modo, &apiErrId, &apiErrDsc) |
| BTCFA01000 | BTER000000 | BTV4Core | ProcedureSource | 76 | Errors.BTER000000(&nameSpace, &errId, &apiErrDsc, &Pgmname) |
| BTCFA01000 | BTER000000 | BTV4Core | ProcedureSource | 84 | Errors.BTER000000(&nameSpace, &errId, &apiErrDsc, &Pgmname) |
| BTCFA01000 | BTER000000 | BTV4Core | ProcedureSource | 93 | Errors.BTER000000(&nameSpace, &errId, &apiErrDsc, &Pgmname) |
| BTCFA01000 | BTER000000 | BTV4Core | ProcedureSource | 76 | Errors.BTER000000(&nameSpace, &errId, &apiErrDsc, &Pgmname) |
| BTCFA01000 | BTER000000 | BTV4Core | ProcedureSource | 84 | Errors.BTER000000(&nameSpace, &errId, &apiErrDsc, &Pgmname) |
| BTCFA01000 | BTER000000 | BTV4Core | ProcedureSource | 93 | Errors.BTER000000(&nameSpace, &errId, &apiErrDsc, &Pgmname) |
