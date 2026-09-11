'use strict';

const fs = require('fs');
const path = require('path');
const { resolveCollectionRequestData } = require('./request-data-resolver');
const { suggestChains } = require('./chain-suggestion');
const { buildSwaggerCandidateUrls, SUFIJOS_SWAGGER } = require('./swagger-candidates');
const btUrls = require('../common/bantotal-urls');
const describeAuthFailure = btUrls.describeAuthFailure;
const extract = require('./swagger-candidates/extract-spec-url');

function loadAsset(fileName) {
  return fs.readFileSync(path.join(__dirname, fileName), 'utf8');
}

function createCollectionFeature(deps) {
  const ROOT = deps.ROOT;
  const queryServicesWithMethods = deps.queryServicesWithMethods;
  const queryMethodSchema = deps.queryMethodSchema;

  const panelHtml = loadAsset('panel.html');
  const outputDir = path.join(ROOT, 'scripts', 'generar-collections', 'output');
  const dataDir = path.join(ROOT, 'scripts', 'generar-collections', 'data');
  const successfulValuesPath = path.join(dataDir, 'successful-values.json');

  function ensureOutputDir() {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  function ensureDataDir() {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  function sanitizeSegment(value) {
    return String(value || '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'collection';
  }

  function xmlEscape(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function exampleValue(type) {
    const t = String(type || '').toLowerCase();
    if (t === 'boolean' || t === 'bool' || t === 'b') return 'false';
    if (t === 'date' || t === 'd') return '2026-01-01';
    if (t === 'datetime') return '2026-01-01T00:00:00';
    if (t === 'decimal' || t === 'double' || t === 'float' || t === 'f') return '0';
    if (t === 'int' || t === 'integer' || t === 'long' || t === 'short' || t === 'n') return '0';
    return '';
  }

  function isSimpleParam(param) {
    return !!param && !param.isComplex && !param.isCollection;
  }

  function getExportableOutputs(schema) {
    return (schema.outputs || []).filter(function(param) {
      return isSimpleParam(param) && !['Btinreq', 'Btoutreq', 'businessErrors'].includes(param.name);
    });
  }

  function registerVariable(map, name, value) {
    if (!map.has(name)) map.set(name, value);
  }

  function readSuccessfulValues() {
    ensureDataDir();
    if (!fs.existsSync(successfulValuesPath)) return {};
    try {
      return JSON.parse(fs.readFileSync(successfulValuesPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }

  function writeSuccessfulValues(data) {
    ensureDataDir();
    fs.writeFileSync(successfulValuesPath, JSON.stringify(data, null, 2), 'utf8');
  }

  function normalizeName(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function buildEnvironmentKey(body) {
    const safeDb = body && body.db ? body.db : {};
    const dbPart = body && body.platform === 'oracle'
      ? String(safeDb.DB_CONNECT_STRING || '')
      : [safeDb.DB_SERVER || '', safeDb.DB_PORT || '', safeDb.DB_DATABASE || ''].join('|');
    const apiPart = String(body && body.api && body.api.API_BASE_URL || '');
    return [body && body.version || '', body && body.platform || '', dbPart, apiPart].join('::');
  }

  function toSuggestionEntries(values, source) {
    return (values || []).filter(Boolean).map(function(value) {
      return { value: String(value), source };
    });
  }

  function getRuleSuggestions(variable) {
    const key = normalizeName(variable.key);
    const pathLabel = normalizeName(variable.pathLabel);
    const all = key + ' ' + pathLabel;

    if (all.includes('currencyid')) {
      return toSuggestionEntries(['858', '840', '32'], 'Patron');
    }
    if (all.includes('serviceid')) {
      return toSuggestionEntries(['300', '301', '100'], 'Patron');
    }
    if (all.includes('fieldid')) {
      return toSuggestionEntries(['CSORDDETAM', 'CSORDDETDES', 'CSORDDETREF'], 'Patron');
    }
    if (all.includes('branchid')) {
      return toSuggestionEntries(['1'], 'Patron');
    }
    if (all.includes('countryid')) {
      return toSuggestionEntries(['858', '32'], 'Patron');
    }
    return [];
  }

  function mergeSuggestions() {
    const seen = new Set();
    const merged = [];
    Array.prototype.slice.call(arguments).forEach(function(entries) {
      (entries || []).forEach(function(entry) {
        const value = String(entry.value || '').trim();
        if (!value) return;
        const key = normalizeName(value);
        if (seen.has(key)) return;
        seen.add(key);
        merged.push({ value, source: entry.source || '' });
      });
    });
    return merged;
  }

  function addSuccessfulValue(body, variableKey, value) {
    const trimmed = String(value == null ? '' : value).trim();
    if (!trimmed) return;

    const allSuccessful = readSuccessfulValues();
    const envKey = buildEnvironmentKey(body);
    if (!allSuccessful[envKey]) allSuccessful[envKey] = {};
    const current = Array.isArray(allSuccessful[envKey][variableKey]) ? allSuccessful[envKey][variableKey] : [];
    const next = [trimmed].concat(current.filter(function(item) {
      return String(item).trim().toLowerCase() !== trimmed.toLowerCase();
    })).slice(0, 8);
    allSuccessful[envKey][variableKey] = next;
    writeSuccessfulValues(allSuccessful);
  }

  function recordSuccessfulValues(body, values) {
    Object.keys(values || {}).forEach(function(key) {
      addSuccessfulValue(body, key, values[key]);
    });
  }

  function loadXml2js() {
    const xml2jsPath = path.join(ROOT, 'V4', 'node_modules', 'xml2js');
    if (!fs.existsSync(xml2jsPath)) {
      throw new Error('xml2js no instalado - ejecuta npm install en V4/');
    }
    return require(xml2jsPath);
  }

  function enrichVariableSuggestions(body, variable) {
    const allSuccessful = readSuccessfulValues();
    const envKey = buildEnvironmentKey(body);
    const successful = toSuggestionEntries((allSuccessful[envKey] && allSuccessful[envKey][variable.key]) || [], 'Historial');
    const rules = getRuleSuggestions(variable);
    return Object.assign({}, variable, {
      suggestions: mergeSuggestions(successful, rules)
    });
  }

  function parseRawQueryParams(raw) {
    const text = String(raw || '');
    const queryIndex = text.indexOf('?');
    if (queryIndex < 0) return [];
    const queryText = text.slice(queryIndex + 1).split('#')[0];
    if (!queryText) return [];
    return queryText.split('&').filter(Boolean).map(function(part) {
      const eqIndex = part.indexOf('=');
      const keyPart = eqIndex >= 0 ? part.slice(0, eqIndex) : part;
      const valuePart = eqIndex >= 0 ? part.slice(eqIndex + 1) : '';
      let key = keyPart;
      let value = valuePart;
      try { key = decodeURIComponent(keyPart); } catch (_) {}
      try { value = decodeURIComponent(valuePart); } catch (_) {}
      return { key, value };
    });
  }

  function parsePostmanUrl(raw, resolvedRaw) {
    const parsed = new URL(resolvedRaw || raw);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const rawQuery = parseRawQueryParams(raw);
    const query = rawQuery.length
      ? rawQuery
      : (parsed.searchParams ? Array.from(parsed.searchParams.entries()).map(function(entry) {
          return { key: entry[0], value: entry[1] };
        }) : []);
    return {
      raw,
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname.split('.'),
      port: parsed.port || undefined,
      path: pathParts,
      query
    };
  }

  // Delega en el modulo compartido: el casing del endpoint de autenticacion
  // cambio a minusculas y la forma con mayusculas devuelve 404 (medido
  // contra un ambiente real). Ver scripts/common/bantotal-urls/index.js.
  const resolveV4AuthUrl = btUrls.resolveV4AuthUrl;

  // Sufijos que buildSwaggerCandidateUrls agrega para encontrar el documento.
  // Si la URL que efectivamente respondio termina en uno de estos, la raiz
  // real del ambiente es lo que queda antes: es un dato verificado (esa URL
  // SI respondio), a diferencia del campo "servers" que declara el propio
  // Swagger, que puede estar desactualizado.
  //
  // Se importa de swagger-candidates en vez de repetir la lista: si las dos
  // se desincronizan, se prueba un sufijo que despues no se sabe recortar y
  // la raiz del ambiente sale mal.
  const SWAGGER_DOC_SUFFIXES = SUFIJOS_SWAGGER;

  function deriveSwaggerRootFromResolvedUrl(resolvedUrl) {
    const trimmed = String(resolvedUrl || '').trim().replace(/\/+$/g, '');
    if (!trimmed) return '';
    for (const suffix of SWAGGER_DOC_SUFFIXES) {
      if (trimmed.toLowerCase().endsWith(suffix)) {
        return trimmed.slice(0, trimmed.length - suffix.length);
      }
    }
    return '';
  }

  function resolveSwaggerServerUrl(doc, resolvedUrl) {
    const fallbackUrl = String(resolvedUrl || '').trim();
    const fallback = fallbackUrl ? new URL(fallbackUrl) : null;

    const verifiedRoot = deriveSwaggerRootFromResolvedUrl(resolvedUrl);
    if (verifiedRoot) return verifiedRoot;

    const servers = Array.isArray(doc && doc.servers) ? doc.servers : [];
    for (const server of servers) {
      const raw = String(server && server.url || '').trim();
      if (!raw || raw.indexOf('{') >= 0) continue;
      try {
        return new URL(raw, fallbackUrl).toString().replace(/\/+$/g, '');
      } catch (_) {}
    }
    const paths = Object.keys((doc && doc.paths) || {});
    const baseCandidates = [];
    paths.forEach(function(pathName) {
      const publicMatch = String(pathName).match(/^(.*)\/public\/[^/]+\/v\d+\/[^/]+$/i);
      if (publicMatch) baseCandidates.push(publicMatch[1] || '');
      const authMatch = String(pathName).match(/^(.*)\/Authenticate\/v\d+\/Execute$/i);
      if (authMatch) baseCandidates.push(authMatch[1] || '');
    });
    const basePath = baseCandidates.length ? baseCandidates.sort(function(a, b) { return b.length - a.length; })[0] : '';
    if (fallback) return (fallback.origin + basePath).replace(/\/+$/g, '');
    return basePath.replace(/\/+$/g, '');
  }

  function joinSwaggerBaseAndPath(baseUrl, pathName) {
    const base = String(baseUrl || '').replace(/\/+$/g, '');
    const path = String(pathName || '').trim();
    if (!base) return path;
    if (!path) return base;
    if (/^https?:\/\//i.test(path)) return path;
    return base + (path.startsWith('/') ? path : '/' + path);
  }

  function resolveSwaggerAuthUrl(doc, resolvedUrl, baseUrl, api) {
    // El ambiente ya configurado (y probado con "Probar autenticacion") es la
    // fuente de verdad: el "servers" que declara el propio Swagger puede estar
    // desactualizado o no coincidir con el despliegue real.
    const configuredPublicBaseUrl = String((api && api.BASE_URL) || '').trim();
    const configuredApiBaseUrl = String((api && api.API_BASE_URL) || '').trim();
    if (configuredPublicBaseUrl || configuredApiBaseUrl) {
      return resolveV4AuthUrl(api || {});
    }

    const paths = doc && doc.paths ? doc.paths : {};
    const authPath = Object.keys(paths).find(function(pathName) {
      return /\/Authenticate\/v\d+\/Execute$/i.test(String(pathName || ''));
    });
    if (authPath) {
      return joinSwaggerBaseAndPath(baseUrl || '', authPath);
    }
    // El swagger no declara el path de autenticacion: se cae a la forma
    // actual (minusculas), no a la vieja.
    return joinSwaggerBaseAndPath(baseUrl || '', btUrls.AUTH_PATH);
  }

  /**
   * Busca el login de la API publica dentro del catalogo ya fusionado:
   * POST /session/v1/user-login (ver esPathSessionLogin, que tambien acepta
   * el camelCase /Session/v1/userLogin de algunos swagger). Si el ambiente
   * no lo expone pero si expone Authenticate/Execute, se devuelve ese: es un
   * ambiente que todavia no migro y el esquema viejo sigue siendo el unico
   * que anda ahi.
   */
  function findPublicaAuthOperation(operationsByService) {
    let sessionOp = null;
    let executeOp = null;
    Object.keys(operationsByService || {}).forEach(function(service) {
      (operationsByService[service] || []).forEach(function(operation) {
        if (String(operation.httpMethod || '').toUpperCase() !== 'POST') return;
        const path = String(operation.path || '');
        if (!sessionOp && btUrls.esPathSessionLogin(path)) sessionOp = operation;
        if (!executeOp && /\/Authenticate\/v\d+\/Execute$/i.test(path)) executeOp = operation;
      });
    });
    if (sessionOp) return { kind: btUrls.KIND_SESSION_PUBLICA, baseUrl: sessionOp.sourceBaseUrl || '', path: sessionOp.path };
    if (executeOp) return { kind: btUrls.KIND_AUTHENTICATE, baseUrl: executeOp.sourceBaseUrl || '', path: executeOp.path };
    return null;
  }

  /**
   * "API interna" no se autentica con Authenticate/Execute (eso es de "API
   * publica") -- expone Session.userLogin (ver ejemplo real pegado por el
   * usuario: POST /Session/v1/userLogin, {user,userPassword,jwt} =>
   * {success,sessionToken,userCode,refreshToken}, sessionToken en minuscula).
   * Se busca en el catalogo ya fusionado de todos los swaggers cargados (cada
   * operacion sabe de que swagger salio via sourceBaseUrl -- ver
   * extractSwaggerOperations). Si ningun swagger expone Session.userLogin, se
   * cae a Authenticate/Execute como plan B: algunos ambientes interna
   * tambien lo exponen.
   */
  function findInternaAuthOperation(operationsByService) {
    let sessionOp = null;
    let executeOp = null;
    Object.keys(operationsByService || {}).forEach(function(service) {
      (operationsByService[service] || []).forEach(function(operation) {
        if (String(operation.httpMethod || '').toUpperCase() !== 'POST') return;
        const path = String(operation.path || '');
        // esPathSessionLogin acepta el camelCase (/Session/v1/userLogin, que
        // es como lo expone el gateway interno) y tambien el kebab: el regex
        // que habia solo aceptaba el camelCase, asi que contra un ambiente que
        // publica el kebab la deteccion caia al Authenticate viejo.
        if (!sessionOp && btUrls.esPathSessionLogin(path)) sessionOp = operation;
        if (!executeOp && /\/Authenticate\/v\d+\/Execute$/i.test(path)) executeOp = operation;
      });
    });
    if (sessionOp) return { kind: btUrls.KIND_SESSION_INTERNA, baseUrl: sessionOp.sourceBaseUrl || '', path: sessionOp.path };
    if (executeOp) return { kind: 'authenticate-execute', baseUrl: executeOp.sourceBaseUrl || '', path: executeOp.path };
    return null;
  }

  function resolveJsonBaseUrl(config) {
    const explicit = String((config && config.swaggerBaseUrl) || '').trim();
    if (explicit) return explicit.replace(/\/+$/g, '');
    const api = config && config.api ? config.api : (config || {});
    const swaggerBaseUrl = String((api && api.SWAGGER_BASE_URL) || '').trim();
    if (swaggerBaseUrl) return swaggerBaseUrl.replace(/\/+$/g, '');
    const publicBaseUrl = String((api && api.BASE_URL) || '').trim();
    if (publicBaseUrl) return publicBaseUrl.replace(/\/+$/g, '');
    const apiBaseUrl = String((api && api.API_BASE_URL) || '').trim();
    if (apiBaseUrl) return apiBaseUrl.replace(/\/+$/g, '');
    return '';
  }

  /**
   * El esquema de autenticacion en juego. Sin nada declarado, la API publica
   * V4 usa el user-login de session (jwt + Authorization: Bearer): es lo que
   * definio arquitectura y Authenticate.Execute quedo como fallback, no como
   * default. "API interna" declara su propio kind al cargar el swagger (ver
   * findInternaAuthOperation), asi que nunca cae en este default.
   */
  function resolveAuthKind(config) {
    const api = config && config.api ? config.api : (config || {});
    const declarado = String(
      (config && config.swaggerAuthKind) || (api && api.SWAGGER_AUTH_KIND) || ''
    ).trim();
    if (declarado) return declarado;
    return btUrls.KIND_SESSION_PUBLICA;
  }

  function resolveJsonAuthUrl(config) {
    const explicit = String((config && config.swaggerAuthUrl) || '').trim();
    if (explicit) return explicit;
    const api = config && config.api ? config.api : (config || {});
    const swaggerAuthUrl = String((api && api.SWAGGER_AUTH_URL) || '').trim();
    if (swaggerAuthUrl) return swaggerAuthUrl;
    return resolveAuthKind(config) === btUrls.KIND_SESSION_PUBLICA
      ? btUrls.resolveSessionLoginUrl(api)
      : resolveV4AuthUrl(api);
  }

  function sanitizeVariableKey(value) {
    return String(value || '')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'value';
  }

  function deriveMethodNameFromPath(pathName, httpMethod, operation) {
    const match = String(pathName || '').match(/\/public\/[^/]+\/v\d+\/([^/?]+)/i);
    if (match && match[1]) return match[1];
    if (operation && operation.operationId) return String(operation.operationId).split(/[\s.]+/).pop();
    const cleanPath = String(pathName || '').replace(/[?#].*$/, '');
    const segments = cleanPath.split('/').filter(Boolean);
    return segments.length ? segments[segments.length - 1] : String(httpMethod || 'request').toLowerCase();
  }

  function isReservedAuthInput(name) {
    const normalized = String(name || '').trim().toLowerCase();
    return [
      'device',
      'usuario',
      'user',
      'userid',
      'username',
      'requerimiento',
      'requirement',
      'canal',
      'channel',
      'token',
      'authorization',
      'idempotency-key',
      'content-type'
    ].includes(normalized);
  }

  function inferHttpMethodFromMethodName(methodName) {
    const normalized = String(methodName || '').trim().toLowerCase();
    if (!normalized) return 'POST';
    if (normalized.startsWith('get') || normalized.startsWith('list') || normalized.startsWith('find') || normalized.startsWith('search')) return 'GET';
    if (normalized.startsWith('delete') || normalized.startsWith('remove')) return 'DELETE';
    if (normalized.startsWith('update') || normalized.startsWith('edit')) return 'PUT';
    if (normalized.startsWith('patch')) return 'PATCH';
    return 'POST';
  }

  /**
   * Ajusta el nombre del servicio cargado desde BTI para la URL REST publica.
   * En BTI suelen venir nombres como "PublicLoans", mientras que la API JSON
   * publica espera el segmento "Loans". Este helper se usa solo en el flujo
   * Base de datos para no alterar el comportamiento que ya funciona con Swagger.
   */
  function normalizeDatabaseServicePathName(serviceName) {
    const normalized = String(serviceName || '').trim();
    if (!normalized) return '';
    return normalized.replace(/^Public(?=[A-Z0-9_])/i, '');
  }

  function buildDbTypeLabel(type) {
    const normalized = String(type || '').trim().toLowerCase();
    if (!normalized) return '';
    if (normalized === 'n' || normalized === 'int') return 'integer';
    if (normalized === 'short' || normalized === 'long') return normalized;
    if (normalized === 'b' || normalized === 'bool') return 'boolean';
    if (normalized === 'd') return 'date';
    return normalized;
  }

  function isDbCollectionField(field) {
    const normalizedType = String(field && field.type || '').trim().toLowerCase();
    return !!(field && (field.isCollection || normalizedType === 'collection' || String(field.itemType || '').trim()));
  }

  function isDbComplexField(field) {
    return !!(field && (field.isComplex || String(field.sdtType || '').trim() || isDbCollectionField(field)));
  }

  /**
   * Arma los manualInputs de query string para un metodo GET/DELETE,
   * recorriendo campos complejos/coleccion (SDTs anidados) igual que
   * buildDbFieldTemplate hace para el body de POST/PUT — asi un input
   * estructurado no queda reducido a una unica fila sin poder abrir sus
   * campos, sea cual sea el verbo HTTP del metodo.
   *
   * A diferencia de buildDbFieldTemplate, esta funcion NO arma ningun body
   * (GET/DELETE no llevan body): solo puebla `manualInputs` con una fila por
   * cada campo hoja, con su pathLabel punteado completo (ej.
   * "sdtFiltro.campo") y location:'query'. Si el campo es una coleccion o un
   * objeto SIN sdtType con sub-campos declarados (ej. un array de strings
   * simple, sin esquema propio), no hay nada que recorrer y se deja como una
   * unica fila — igual que ya hace buildDbFieldTemplate en ese mismo caso.
   */
  function buildDbQueryParamInputs(field, sdtMap, trail, manualInputs) {
    const pathTrail = Array.isArray(trail) ? trail : [];
    const fieldName = String(field && field.name || '').trim();
    if (!fieldName || isReservedAuthInput(fieldName)) return;

    const isCollectionWithSchema = isDbCollectionField(field) && field.sdtType && sdtMap[String(field.sdtType).trim()];
    const isComplexWithSchema = !isCollectionWithSchema && isDbComplexField(field) && field.sdtType && sdtMap[String(field.sdtType).trim()];

    if (isCollectionWithSchema || isComplexWithSchema) {
      const sdtFields = sdtMap[String(field.sdtType).trim()] || [];
      sdtFields.forEach(function recurseIntoChild(childField) {
        buildDbQueryParamInputs(childField, sdtMap, pathTrail.concat(fieldName), manualInputs);
      });
      return;
    }

    const fieldType = buildDbTypeLabel(field && field.type);
    manualInputs.push({
      key: sanitizeVariableKey(pathTrail.concat(fieldName).join('_')),
      pathLabel: pathTrail.concat(fieldName).join('.'),
      type: fieldType,
      description: field && field.description ? String(field.description) : '',
      defaultValue: exampleValue(fieldType),
      location: 'query'
    });
  }

  function buildDbSdtMap(schema) {
      const map = {};
      const rawSdts = schema ? schema.sdts : null;

      if (!rawSdts) return map;

      if (Array.isArray(rawSdts)) {
        rawSdts.forEach(function registerArraySdt(entry) {
          if (!entry || !entry.name) return;
          map[String(entry.name).trim()] = Array.isArray(entry.fields) ? entry.fields : [];
        });
        return map;
      }

      Object.keys(rawSdts).forEach(function registerObjectSdt(sdtName) {
        map[String(sdtName).trim()] = Array.isArray(rawSdts[sdtName]) ? rawSdts[sdtName] : [];
      });

      return map;
    }

  function buildDbFieldTemplate(field, sdtMap, trail, manualInputs, state) {
    const pathTrail = Array.isArray(trail) ? trail : [];
    const mode = state || { collectInputs: true, location: 'body' };
    const fieldName = String(field && field.name || '').trim();
    if (!fieldName || isReservedAuthInput(fieldName)) return null;

    const inputKey = sanitizeVariableKey(pathTrail.concat(fieldName).join('_'));
    const pathLabel = pathTrail.concat(fieldName).join('.');
    const fieldType = buildDbTypeLabel(field && field.type);

    if (mode.collectInputs && Array.isArray(manualInputs)) {
      manualInputs.push({
        key: inputKey,
        pathLabel,
        type: fieldType,
        description: field && field.description ? String(field.description) : '',
        defaultValue: exampleValue(fieldType),
        location: mode.location || 'body',
        // Metadata descriptiva para el inspector (ej. mostrar que este campo
        // es una lista); el armado real del body para colecciones ya envuelve
        // la lista con el nombre interno correcto (ver el branch de
        // isDbCollectionField mas abajo), asi que esto no controla ninguna
        // eleccion adicional del usuario.
        isCollection: isDbCollectionField(field)
      });
    }

      if (isDbCollectionField(field) && field.sdtType) {
        const sdtFields = sdtMap[String(field.sdtType).trim()] || [];
        const itemsArray = [
          sdtFields.reduce(function buildCollectionItem(accumulator, childField) {
            accumulator[String(childField.name).trim()] = buildDbFieldTemplate(childField, sdtMap, pathTrail.concat(fieldName), manualInputs, mode);
            return accumulator;
          }, {})
        ];
        // El exposer REST real envuelve la lista en un objeto cuya UNICA
        // clave es el "nombre interno" (item name) del elemento repetible
        // (ej. Insurances -> {"insurance":[...]}), NO un array suelto —
        // confirmado contra el contrato real de PublicLoans.simulate. Sin
        // este envoltorio, Jackson rechaza el body con "Cannot deserialize
        // ... from Array value" para CUALQUIER campo coleccion, no solo uno.
        // itemName sale de BTI019 (BTISRVPARITNOM) para params de primer
        // nivel o de BTI026 (BTISDTELEMNOMIT) para campos anidados de un SDT
        // (ver mapMethodSchemaRow/mapBti026SchemaRow) — ambas columnas
        // confirmadas contra el esquema real, sin adivinar nombres. El
        // fallback a fieldName es solo defensivo (fila con dato incompleto),
        // no una alternativa valida: cuando el campo es coleccion, el
        // esquema real siempre trae el nombre de item correspondiente.
        const itemKey = String((field && field.itemName) || fieldName).trim();
        return itemKey ? { [itemKey]: itemsArray } : itemsArray;
      }

      if (isDbComplexField(field) && field.sdtType) {
        const sdtFields = sdtMap[String(field.sdtType).trim()] || [];
        return sdtFields.reduce(function buildComplexObject(accumulator, childField) {
          accumulator[String(childField.name).trim()] = buildDbFieldTemplate(childField, sdtMap, pathTrail.concat(fieldName), manualInputs, mode);
          return accumulator;
        }, {});
    }

    // Marcador interno (no "{{...}}" directo): tanto buildJsonBodyRaw (export a
    // Postman) como fillJsonTemplate (ejecucion en vivo) buscan exactamente
    // "__COL_VAR__" + key para saber que reemplazar. El camino Swagger
    // (buildSwaggerBodyTemplate) ya usa este mismo marcador; este campo
    // devolvia el texto "{{...}}" literal, que ninguno de los dos consumidores
    // reconoce como placeholder — por eso ni "Origen del valor" ni "Valor
    // manual" tenian efecto en metodos cargados desde Base de datos.
    return '__COL_VAR__' + inputKey;
  }

  function buildDbBodyTemplate(schema, httpMethod) {
    if (String(httpMethod || '').toUpperCase() === 'GET' || String(httpMethod || '').toUpperCase() === 'DELETE') {
      return null;
    }

    const manualInputs = [];
    const sdtMap = buildDbSdtMap(schema);
    const inputs = (schema && Array.isArray(schema.inputs) ? schema.inputs : []).filter(function keepInput(input) {
      return !isReservedAuthInput(input.name);
    });

    const bodyTemplate = inputs.reduce(function buildBody(accumulator, input) {
      accumulator[String(input.name).trim()] = buildDbFieldTemplate(input, sdtMap, [], manualInputs, {
        collectInputs: true,
        location: 'body'
      });
      return accumulator;
    }, {});

    return {
      template: bodyTemplate,
      manualInputs
    };
  }

  function collectDbOutputFields(fields, sdtMap, trail, outputs) {
    (fields || []).forEach(function appendOutput(field) {
      const fieldName = String(field && field.name || '').trim();
      if (!fieldName || isReservedAuthInput(fieldName)) return;

      const nextTrail = trail.concat(fieldName);
        if (isDbCollectionField(field) && field.sdtType) {
          const childFields = sdtMap[String(field.sdtType).trim()] || [];
          if (!childFields.length) {
            outputs.push({
              key: fieldName,
              pathLabel: nextTrail.join('.'),
              type: buildDbTypeLabel(field && field.type) || 'collection',
              description: field && field.description ? String(field.description) : ''
            });
            return;
          }
          collectDbOutputFields(childFields, sdtMap, nextTrail.concat('item'), outputs);
          return;
        }

        if (isDbComplexField(field) && field.sdtType) {
          const childFields = sdtMap[String(field.sdtType).trim()] || [];
          if (!childFields.length) {
            outputs.push({
              key: fieldName,
              pathLabel: nextTrail.join('.'),
              type: buildDbTypeLabel(field && field.type) || 'object',
              description: field && field.description ? String(field.description) : ''
            });
            return;
          }
          collectDbOutputFields(childFields, sdtMap, nextTrail, outputs);
          return;
        }

      outputs.push({
        key: fieldName,
        pathLabel: nextTrail.join('.'),
        type: buildDbTypeLabel(field && field.type),
        description: field && field.description ? String(field.description) : ''
      });
    });
  }

  async function buildDatabaseOperations(platform, db, version, apiMode, format) {
    if (typeof queryServicesWithMethods !== 'function' || typeof queryMethodSchema !== 'function') {
      throw new Error('El origen Base de datos no esta disponible en esta version del servidor.');
    }

    // Una sola consulta con todos los servicios/metodos de BTI014 (o
    // BTCBS014 si el ambiente es "API interna"), en vez de una consulta (y
    // una conexion) por servicio: menos golpes al ambiente, clave cuando se
    // apunta a produccion.
    const catalog = await queryServicesWithMethods(platform, db, apiMode);
    const services = catalog.services || [];
    const methodsByService = catalog.methodsByService || {};
    const operationsByService = {};
    const sourceTables = apiMode === 'interna' ? 'BTCBS014/BTCBS019' : 'BTI014/BTI019';

    // V3 es SOA/GeneXus (servlet + ?Metodo, siempre POST). V4 pública es
    // REST/JSON (/public/{service}/v1/{metodo}). "API interna" tiene DOS
    // caminos segun el formato elegido en el panel: JSON contra su propio
    // gateway REST (sin el prefijo "/public/", ver "URL de la API interna"),
    // o SOAP igual que V3 (servlet ardwsbt_{Service}, pero SIN "_v1" ni el
    // sufijo "?{metodo}" -- ver soapServletSuffix/authenticateSessionInternaSoap).
    // El catalogo se resuelve UNA vez con el "Formato" ya elegido en el panel
    // porque httpMethod/path quedan grabados en cada item desde este momento.
    const isV3 = version === 'V3';
    const isInterna = apiMode === 'interna';
    const isInternaSoap = isInterna && format === 'xml';
    const isXmlSoap = isV3 || isInternaSoap;
    for (const service of services) {
      const methods = methodsByService[service] || [];
      operationsByService[service] = methods.map(function buildOperation(methodName) {
        const trimmedMethod = String(methodName || '').trim();
        const httpMethod = isXmlSoap ? 'POST' : inferHttpMethodFromMethodName(methodName);
        const servicePathName = normalizeDatabaseServicePathName(service);
        const path = isV3
          ? '/servlet/com.dlya.bantotal.ardwsbt_' + service + '_v1?' + trimmedMethod
          : (isInternaSoap
              ? '/servlet/com.dlya.bantotal.ardwsbt_' + service
              : (isInterna ? '/' + servicePathName + '/v1/' + trimmedMethod : '/public/' + servicePathName + '/v1/' + trimmedMethod));
        return {
          operationKey: 'DB ' + service + '.' + methodName,
          service,
          methodName,
          httpMethod,
          path,
          summary: 'Metodo cargado desde ' + sourceTables + '.',
          manualInputs: [],
          bodyTemplate: null,
          outputFields: [],
          needsHydration: true
        };
      });
    }

    return {
      services: services || [],
      operationsByService
    };
  }

  async function buildDatabaseOperationDetails(platform, db, service, methodName, version, apiMode, format) {
    if (typeof queryMethodSchema !== 'function') {
      throw new Error('No se pudo resolver el schema del metodo desde Base de datos.');
    }

    const schema = await queryMethodSchema(platform, db, service, methodName, apiMode);
    const isV3 = version === 'V3';
    // Mismo criterio que buildDatabaseOperations (que arma el catalogo): hay
    // que repetirlo aca porque este paso de "hidratacion" (al agregar el
    // metodo al canvas) SOBREESCRIBE httpMethod/path del item entero, y
    // hasta ahora lo hacia sin saber nada de "API interna" -- por eso un
    // metodo SOAP de interna quedaba con verbo/ruta de REST publica al
    // agregarlo (ver isPathSupported en collection-studio-manager.js).
    const isInternaSoap = apiMode === 'interna' && format === 'xml';
    const isXmlSoap = isV3 || isInternaSoap;
    const httpMethod = isXmlSoap ? 'POST' : inferHttpMethodFromMethodName(methodName);
    const servicePathName = normalizeDatabaseServicePathName(service);
    const sdtMap = buildDbSdtMap(schema);
    const outputFields = [];
    const scalarManualInputs = [];

    (schema && Array.isArray(schema.inputs) ? schema.inputs : []).forEach(function appendInput(input) {
      if (isReservedAuthInput(input.name)) return;

      if (String(httpMethod).toUpperCase() === 'GET' || String(httpMethod).toUpperCase() === 'DELETE') {
        // Recorre SDTs/colecciones anidadas igual que el body de POST (ver
        // buildDbQueryParamInputs) en vez de aplanar el input a una sola fila.
        buildDbQueryParamInputs(input, sdtMap, [], scalarManualInputs);
      }
    });

    const bodyData = buildDbBodyTemplate(schema, httpMethod);
    collectDbOutputFields(schema && Array.isArray(schema.outputs) ? schema.outputs : [], sdtMap, [], outputFields);

    return {
      operationKey: 'DB ' + service + '.' + methodName,
      service,
      methodName,
      httpMethod,
      path: isV3
        ? '/servlet/com.dlya.bantotal.ardwsbt_' + service + '_v1?' + String(methodName || '').trim()
        : (isInternaSoap
            ? '/servlet/com.dlya.bantotal.ardwsbt_' + service
            : (apiMode === 'interna' ? '/' + servicePathName + '/v1/' + String(methodName || '').trim() : '/public/' + servicePathName + '/v1/' + String(methodName || '').trim())),
      summary: (schema && schema.description) || 'Metodo cargado desde ' + (apiMode === 'interna' ? 'BTCBS014/BTCBS019' : 'BTI014/BTI019') + '.',
      manualInputs: scalarManualInputs.concat(bodyData && Array.isArray(bodyData.manualInputs) ? bodyData.manualInputs : []),
      bodyTemplate: bodyData ? bodyData.template : null,
      outputFields,
      needsHydration: false
    };
  }

  // Extraida a scripts/generar-collections/swagger-candidates/ (con tests):
  // era interna a este closure y tenia tres defectos que se veian todos
  // como "No se pudo leer el swagger". Ver el encabezado de ese modulo.

  // Timeout por candidato. Sin esto, un host que dropea paquetes en vez de
  // rechazar la conexion (firewall corporativo) dejaba el pedido colgado sin
  // fin y la herramienta parecia trabada en vez de dar un error.
  const SWAGGER_TIMEOUT_MS = 15000;

  function httpGetText(url) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const esHttps = parsed.protocol === 'https:';
      const mod = esHttps ? require('https') : require('http');
      const opciones = { method: 'GET' };
      // Los ambientes Bantotal usan certificados internos que no validan
      // contra las CAs del sistema. El resto del proyecto ya lo asume en 7
      // lugares (setup.js /api/test-auth, y 3 veces en este mismo archivo);
      // este era el unico que no, asi que un swagger en HTTPS fallaba con
      // error de TLS y el mensaje solo decia "no se pudo leer".
      if (esHttps) opciones.rejectUnauthorized = false;

      const req = mod.request(parsed, opciones, function(res) {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() {
          if (res.statusCode >= 400) {
            reject(new Error('HTTP ' + res.statusCode +
                             (res.statusMessage ? ' ' + res.statusMessage : '')));
            return;
          }
          resolve({
            body,
            contentType: String(res.headers['content-type'] || ''),
            finalUrl: url
          });
        });
      });
      req.on('error', reject);
      req.setTimeout(SWAGGER_TIMEOUT_MS, function() {
        req.destroy(new Error('sin respuesta en ' + (SWAGGER_TIMEOUT_MS / 1000) + 's (timeout)'));
      });
      req.end();
    });
  }

  async function loadSwaggerDocument(swaggerUrl, api, opciones) {
    const candidates = buildSwaggerCandidateUrls(swaggerUrl, api, opciones);
    if (!candidates.length) {
      throw new Error('No hay ninguna ruta Swagger para probar: escribi la URL del swagger, ' +
                      'o configura la URL base del ambiente en el paso anterior.');
    }
    // Se guarda el resultado de CADA candidato, no solo el ultimo error.
    // Antes, con 6 candidatos probados, el mensaje mostraba unicamente el
    // fallo del ultimo, que es el menos informativo de todos: no habia forma
    // de saber si el problema era TLS, un 401, un 404 o un timeout.
    const intentos = [];

    // Maximo de saltos de una cadena. La mas larga vista en un ambiente
    // Bantotal real tiene 4: index.html -> swagger-initializer.js ->
    // swagger-config -> el documento. El limite evita un ciclo si un config
    // se apunta a si mismo.
    const MAX_SALTOS = 5;

    // Sigue la cadena desde una URL hasta el documento OpenAPI.
    // Devuelve {doc, resolvedUrl} o null, y deja anotado en `intentos` que
    // paso en cada salto.
    async function seguirCadena(url, saltos, visitadas) {
      if (saltos > MAX_SALTOS) {
        intentos.push({ url, resultado: 'cadena de configuracion demasiado larga (' + MAX_SALTOS + ' saltos)' });
        return null;
      }
      if (visitadas.has(url)) {
        intentos.push({ url, resultado: 'ciclo: esta URL ya se habia pedido' });
        return null;
      }
      visitadas.add(url);

      const response = await httpGetText(url);
      const text = String(response.body || '').trim();
      if (!text) { intentos.push({ url, resultado: 'respondio vacio' }); return null; }

      // 1. Es el documento?
      if (text[0] === '{' || text[0] === '[') {
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) {
          intentos.push({ url, resultado: 'JSON invalido: ' + e.message });
          return null;
        }
        if (extract.esDocumentoOpenApi(parsed)) {
          intentos.push({ url, resultado: 'DOCUMENTO OpenAPI' });
          return { doc: parsed, resolvedUrl: url };
        }
        // 2. Es un swagger-config que apunta al documento.
        const siguiente = extract.extraerUrlDeConfigJson(text, url);
        if (siguiente) {
          intentos.push({ url, resultado: 'config JSON, apunta a ' + siguiente.url + ' (via ' + siguiente.clave + ')' });
          return seguirCadena(siguiente.url, saltos + 1, visitadas);
        }
        intentos.push({ url, resultado: 'JSON sin campo "openapi" ni "swagger", y sin url de config' });
        return null;
      }

      // 3. Es HTML o JS: puede traer la URL adentro.
      const enTexto = extract.extraerUrlDeTexto(text, url);
      if (enTexto) {
        intentos.push({ url, resultado: (/\.js(\?|$)/i.test(url) ? 'JS' : 'HTML') +
                                        ', apunta a ' + enTexto.url + ' (via ' + enTexto.clave + ')' });
        return seguirCadena(enTexto.url, saltos + 1, visitadas);
      }

      // 4. Es la pagina del swagger-ui pero sin la config adentro: en
      //    swagger-ui-dist 4+ la config vive en swagger-initializer.js.
      const initializers = extract.urlsDeInitializer(url);
      if (initializers.length && /<html|<!doctype/i.test(text)) {
        intentos.push({ url, resultado: 'HTML del swagger-ui sin config adentro; se busca el initializer' });
        for (const init of initializers) {
          try {
            const r = await seguirCadena(init, saltos + 1, visitadas);
            if (r) return r;
          } catch (e) {
            intentos.push({ url: init, resultado: e.message });
          }
        }
        return null;
      }

      intentos.push({
        url,
        resultado: 'respondio, pero no es un documento Swagger/OpenAPI (' +
                   (text[0] === '{' ? 'JSON sin campo "openapi" ni "swagger"' : 'no es JSON') + ')'
      });
      return null;
    }

    for (const candidate of candidates) {
      try {
        const r = await seguirCadena(candidate, 1, new Set());
        if (r) return r;
      } catch (e) {
        intentos.push({ url: candidate, resultado: e.message });
      }
    }

    const detalle = intentos.map(function(i) { return '  - ' + i.url + ' -> ' + i.resultado; }).join('\n');
    const error = new Error('No se encontro el documento Swagger. Se probaron ' +
                            intentos.length + ' rutas:\n' + detalle);
    // El detalle estructurado tambien va en la excepcion, para que la ruta
    // lo pueda devolver al frontend sin volver a parsear el mensaje.
    error.intentos = intentos;
    throw error;
  }

  function resolveSwaggerRef(doc, schema) {
    if (!schema) return null;
    if (schema.$ref) {
      const parts = String(schema.$ref).replace(/^#\//, '').split('/');
      let current = doc;
      for (const part of parts) {
        current = current ? current[part] : null;
      }
      return current || null;
    }
    return schema;
  }

  function collectSwaggerOutputFields(doc, schema, trail, outputs, state) {
    let ctx = state || { depth: 0, seenRefs: new Set() };
    if (ctx.depth > 12) return;
    if (schema && schema.$ref) {
      const refKey = String(schema.$ref);
      if (ctx.seenRefs.has(refKey)) return;
      ctx = {
        depth: ctx.depth + 1,
        seenRefs: new Set(Array.from(ctx.seenRefs).concat(refKey))
      };
    } else {
      ctx = {
        depth: ctx.depth + 1,
        seenRefs: new Set(ctx.seenRefs)
      };
    }
    const resolved = resolveSwaggerRef(doc, schema);
    if (!resolved) return;

    if (resolved.allOf && Array.isArray(resolved.allOf)) {
      resolved.allOf.forEach(function(item) {
        collectSwaggerOutputFields(doc, item, trail, outputs, ctx);
      });
      return;
    }

    if (resolved.type === 'object' || resolved.properties) {
      const props = resolved.properties || {};
      Object.keys(props).forEach(function(name) {
        collectSwaggerOutputFields(doc, props[name], trail.concat(name), outputs, ctx);
      });
      return;
    }

    if (resolved.type === 'array') {
      collectSwaggerOutputFields(doc, resolved.items || {}, trail.concat('item'), outputs, ctx);
      return;
    }

    if (!trail.length) return;
    outputs.push({
      key: trail[trail.length - 1],
      pathLabel: trail.join('.'),
      type: resolved.type || '',
      description: resolved.description || ''
    });
  }

  function pickSwaggerResponseSchema(operation) {
    const responses = operation && operation.responses ? operation.responses : {};
    const preferredCodes = ['200', '201', '202', 'default'];
    for (const code of preferredCodes) {
      const response = responses[code];
      if (!response || !response.content) continue;
      const content = response.content['application/json'] || response.content['text/json'] || response.content['application/*+json'];
      if (content && content.schema) return content.schema;
    }
    const codes = Object.keys(responses);
    for (const code of codes) {
      const response = responses[code];
      if (!response || !response.content) continue;
      const contentTypes = Object.keys(response.content);
      for (const contentType of contentTypes) {
        if (/json/i.test(contentType) && response.content[contentType] && response.content[contentType].schema) {
          return response.content[contentType].schema;
        }
      }
    }
    return null;
  }

  function buildOutputVarKey(item, outputField) {
    return sanitizeVariableKey(String((item && item.service) || '') + '_' +
      String((item && item.method) || '') + '_' +
      String(((outputField && outputField.pathLabel) || (outputField && outputField.key) || 'output')).replace(/[^A-Za-z0-9]+/g, '_'));
  }

  function buildInputMappingKey(item, input) {
    return String((item && item.operationKey) || ((item && item.service) || '') + '::' + ((item && item.method) || '')) +
      '::' + String((input && (input.pathLabel || input.key)) || '');
  }

  function normalizeInputMappingConfig(mapping) {
    if (!mapping) return null;
    if (typeof mapping === 'string') return { sourceVarKey: mapping };
    if (typeof mapping !== 'object') return null;
    if (!mapping.sourceVarKey) return null;
    return {
      sourceVarKey: String(mapping.sourceVarKey || ''),
      filterField: String(mapping.filterField || ''),
      filterValue: String(mapping.filterValue || ''),
      collectionPathLabel: String(mapping.collectionPathLabel || ''),
      itemPathLabel: String(mapping.itemPathLabel || '')
    };
  }

  function buildFilteredRuntimeKey(mapping) {
    const config = normalizeInputMappingConfig(mapping);
    if (!config || !config.sourceVarKey) return '';
    const effectiveFilterField = config.filterField || (config.filterValue ? config.itemPathLabel : '');
    if (!effectiveFilterField || !config.filterValue) return config.sourceVarKey;
    const sanitizedSource = sanitizeVariableKey(config.sourceVarKey);
    // sourceVarKey guardado a veces ya viene con el sufijo de filtro aplicado
    // (por ejemplo, tras reimportar una collection generada antes por esta
    // misma pantalla, que persistio la clave derivada en vez de la clave
    // base). Sin este chequeo el sufijo se duplicaba (...loanGUID_filter_X
    // _filter_X) y la variable de Postman quedaba sin resolver.
    if (/_filter_/.test(sanitizedSource)) return sanitizedSource;
    return sanitizeVariableKey(
      config.sourceVarKey + '__filter__' + effectiveFilterField + '__' + config.filterValue
    );
  }

  function resolveMappedVariableName(item, input, scenario) {
    const mappings = scenario && scenario.inputMappings ? scenario.inputMappings : {};
    const config = normalizeInputMappingConfig(mappings[buildInputMappingKey(item, input)]);
    if (!config) return input.key;
    return buildFilteredRuntimeKey(config) || config.sourceVarKey || input.key;
  }

  // ================================================================
  // Puente SOAP <-> "Origen del valor"
  // ----------------------------------------------------------------
  // El armado del XML SOAP (buildSoapRequestXml/buildSdtFieldsXml/
  // buildInputParamXml) trabaja sobre un `schema` recien re-consultado por
  // queryMethodSchema, que NO tiene mappingKey ni sabe nada de
  // scenario.inputMappings (eso vive en `item.manualInputs`, el objeto que
  // el cliente ya trae con la configuracion real del inspector). Sin este
  // puente, cada campo SOAP se resolvia con un auto-match ingenuo por nombre
  // exacto (computeBindingsAndMappings) que ademas NUNCA llegaba a campos
  // anidados de un SDT (ej. "sdtPartner.partnerUId") — por eso "Origen del
  // valor: partnerUId" configurado en el inspector no tenia ningun efecto
  // real sobre la llamada SOAP y el campo salia con el valor de ejemplo (0).
  //
  // Estas dos funciones conectan ambos mundos usando pathLabel (el path
  // punteado completo, ej. "sdtPartner.partnerUId") como clave comun entre
  // el `item.manualInputs` real y los campos que arma buildSdtFieldsXml.
  // ================================================================

  /**
   * Indexa item.manualInputs por su pathLabel completo para poder resolver,
   * durante el armado recursivo del XML, cual input real corresponde a cada
   * campo hoja (buildSdtFieldsXml/buildInputParamXml solo conocen el nombre
   * de campo y su posicion en el arbol, no el objeto manualInput original).
   */
  function buildManualInputsByPath(item) {
    const map = {};
    (item && Array.isArray(item.manualInputs) ? item.manualInputs : []).forEach(function(input) {
      const pathLabel = String((input && (input.pathLabel || input.key)) || '').trim();
      if (pathLabel) map[pathLabel] = input;
    });
    return map;
  }

  /**
   * Resuelve el nombre de variable real para un campo del XML SOAP, dado su
   * pathLabel completo (ej. "sdtPartner.partnerUId").
   *
   * Prioridad:
   *  1. Si `state` trae un `item` (el original de scenario.items, con su
   *     manualInputs real) y ese pathLabel matchea un manualInput conocido,
   *     se resuelve con resolveMappedVariableName — la MISMA funcion que ya
   *     usa el camino JSON para leer "Origen del valor" configurado en el
   *     inspector. Esto hace que el chaining configurado visualmente tenga
   *     efecto real en SOAP, que es lo que faltaba.
   *  2. Si no hay manualInput conocido para ese path (schema trajo un campo
   *     que el catalogo de la UI no llego a listar — caso raro), se cae al
   *     comportamiento historico: la variable autogenerada que ya se le
   *     pasa como `fallbackVariableName`.
   */
  function resolveFieldVariableName(pathLabel, fallbackVariableName, state) {
    const manualInput = state && state.manualInputsByPath ? state.manualInputsByPath[pathLabel] : null;
    if (manualInput && state.item) {
      return resolveMappedVariableName(state.item, manualInput, state.scenario || {});
    }
    return fallbackVariableName;
  }

  /**
   * Extrae valores de salida de una respuesta SOAP ya parseada (xml2js),
   * usando los outputFields reales del item (los mismos que ve el inspector
   * en la pestaña "Salidas"), y los registra bajo la MISMA clave calificada
   * que usa el camino JSON (buildOutputVarKey: "{service}_{method}_{campo}").
   * Sin esto, aunque se resolviera el mapeo del lado del input, el valor
   * real nunca iba a estar disponible en runtimeValues bajo esa clave.
   *
   * Se registra ADEMAS de (no en reemplazo de) extractOutputValues — que
   * sigue registrando por nombre de campo pelado, usado por el auto-match
   * historico de computeBindingsAndMappings — para no sacarle cobertura a
   * ningun caso que ya funcionara antes.
   */
  function extractSoapOutputValues(item, parsedXml) {
    const values = {};
    (item && Array.isArray(item.outputFields) ? item.outputFields : []).forEach(function(field) {
      const lookupKey = String((field && field.key) || '').trim();
      if (!lookupKey) return;
      const found = findNodeDeep(parsedXml, lookupKey);
      if (found !== null && found !== undefined && typeof found !== 'object') {
        values[buildOutputVarKey(item, field)] = String(found);
      }
    });
    return values;
  }

  function buildSwaggerBodyTemplate(doc, schema, trail, inputs, state) {
    let ctx = state || { depth: 0, seenRefs: new Set() };
    if (ctx.depth > 12) {
      return null;
    }
    if (schema && schema.$ref) {
      const refKey = String(schema.$ref);
      if (ctx.seenRefs.has(refKey)) {
        return null;
      }
      ctx = {
        depth: ctx.depth + 1,
        seenRefs: new Set(Array.from(ctx.seenRefs).concat(refKey))
      };
    } else {
      ctx = {
        depth: ctx.depth + 1,
        seenRefs: new Set(ctx.seenRefs)
      };
    }
    const resolved = resolveSwaggerRef(doc, schema);
    if (!resolved) return null;

    if (resolved.allOf && Array.isArray(resolved.allOf)) {
      return resolved.allOf.reduce(function(acc, item) {
        const next = buildSwaggerBodyTemplate(doc, item, trail, inputs, ctx);
        if (next && typeof next === 'object' && !Array.isArray(next)) {
          return Object.assign(acc || {}, next);
        }
        return acc == null ? next : acc;
      }, null);
    }

    if (resolved.type === 'object' || resolved.properties) {
      const result = {};
      const props = resolved.properties || {};
      Object.keys(props).forEach(function(name) {
        result[name] = buildSwaggerBodyTemplate(doc, props[name], trail.concat(name), inputs, ctx);
      });
      return result;
    }

    if (resolved.type === 'array') {
      const itemValue = buildSwaggerBodyTemplate(doc, resolved.items || {}, trail.concat('item'), inputs, ctx);
      return [itemValue];
    }

    const key = sanitizeVariableKey(trail.join('_'));
    inputs.push({
      key,
      pathLabel: trail.join('.'),
      type: resolved.type || '',
      description: resolved.description || '',
      defaultValue: resolved.example != null ? String(resolved.example) : ''
    });
    return '__COL_VAR__' + key;
  }

  function extractSwaggerOperations(doc, sourceBaseUrl) {
    const services = {};
    const paths = doc.paths || {};
    Object.keys(paths).forEach(function(pathName) {
      const pathItem = paths[pathName] || {};
      ['get', 'post', 'put', 'patch', 'delete'].forEach(function(httpMethod) {
        const operation = pathItem[httpMethod];
        if (!operation) return;
        const match = pathName.match(/\/public\/([^/]+)\/v\d+\/([^/?]+)/i);
        const service = match ? match[1] : ((operation.tags && operation.tags[0]) || 'General');
        const methodName = deriveMethodNameFromPath(pathName, httpMethod, operation);
        const manualInputs = [];
        const parameters = [].concat(pathItem.parameters || [], operation.parameters || []);
        parameters.forEach(function(param) {
          // Los headers de auth compartidos suelen venir como
          // {$ref:'#/components/parameters/X'} en vez de inline (se definen una
          // sola vez y se reusan en todos los endpoints). Hay que resolver el
          // $ref del parametro igual que ya se resuelve param.schema, o se
          // pierden name/in/schema y el parametro cae como campo anonimo con
          // location 'query' (nunca coincide con isReservedAuthInput, y termina
          // mandandose de verdad como "value" en el query string).
          const resolvedParam = resolveSwaggerRef(doc, param) || param;
          if (String(resolvedParam.in || '').toLowerCase() === 'header' && isReservedAuthInput(resolvedParam.name)) {
            return;
          }
          const schema = resolveSwaggerRef(doc, resolvedParam.schema || {});
          manualInputs.push({
            key: sanitizeVariableKey(resolvedParam.name),
            pathLabel: resolvedParam.name,
            type: (schema && schema.type) || '',
            description: resolvedParam.description || '',
            defaultValue: resolvedParam.example != null ? String(resolvedParam.example) : '',
            location: resolvedParam.in || 'query'
          });
        });

        let bodyTemplate = null;
        const jsonBody = operation.requestBody && operation.requestBody.content
          ? (operation.requestBody.content['application/json'] || operation.requestBody.content['text/json'] || null)
          : null;
        if (jsonBody && jsonBody.schema) {
          bodyTemplate = buildSwaggerBodyTemplate(doc, jsonBody.schema, [methodName, 'body'], manualInputs);
        }
        const outputFields = [];
        const responseSchema = pickSwaggerResponseSchema(operation);
        if (responseSchema) {
          collectSwaggerOutputFields(doc, responseSchema, [], outputFields);
        }

        if (!services[service]) services[service] = [];
        services[service].push({
          operationKey: httpMethod.toUpperCase() + ' ' + pathName,
          service,
          methodName,
          httpMethod: httpMethod.toUpperCase(),
          path: pathName,
          summary: operation.summary || operation.description || '',
          manualInputs,
          bodyTemplate,
          outputFields,
          // Un ambiente puede tener varios swaggers (uno por microservicio,
          // cada uno en su propio host/puerto) en vez de un unico gateway.
          // Cada operacion recuerda de que swagger vino para poder armar su
          // URL real con la base correcta, sin depender de un unico
          // "swaggerBaseUrl" global (ver resolveOperationBaseUrl).
          sourceBaseUrl: sourceBaseUrl || ''
        });
      });
    });
    return services;
  }

  function buildBtinreqXml(state) {
    if (state && state.mode === 'execution') {
      return [
        '      <bts:Btinreq>',
        '        <bts:Canal>' + xmlEscape(resolveExecutionValue('channel', state, 'string')) + '</bts:Canal>',
        '        <bts:Usuario>' + xmlEscape(resolveExecutionValue('username', state, 'string')) + '</bts:Usuario>',
        '        <bts:Device>' + xmlEscape(resolveExecutionValue('device', state, 'string')) + '</bts:Device>',
        '        <bts:Requerimiento>' + xmlEscape(resolveExecutionValue('requirement', state, 'string')) + '</bts:Requerimiento>',
        '        <bts:Token>' + xmlEscape(resolveExecutionValue('token', state, 'string')) + '</bts:Token>',
        '      </bts:Btinreq>'
      ].join('\n');
    }
    return [
      '      <bts:Btinreq>',
      '        <bts:Canal>{{channel}}</bts:Canal>',
      '        <bts:Usuario>{{username}}</bts:Usuario>',
      '        <bts:Device>{{device}}</bts:Device>',
      '        <bts:Requerimiento>{{requirement}}</bts:Requerimiento>',
      '        <bts:Token>{{token}}</bts:Token>',
      '      </bts:Btinreq>'
    ].join('\n');
  }

  function buildPrimitiveTag(prefix, name, variableName, indent) {
    return indent + '<' + prefix + name + '>{{' + variableName + '}}</' + prefix + name + '>';
  }

  function buildPrimitiveValueTag(prefix, name, value, indent) {
    return indent + '<' + prefix + name + '>' + xmlEscape(value) + '</' + prefix + name + '>';
  }

  function resolveExecutionValue(key, state, type) {
    if (Object.prototype.hasOwnProperty.call(state.runtimeValues, key)) {
      return state.runtimeValues[key];
    }
    return exampleValue(type);
  }

  function repeatableVariableName(paramName, rowIndex, fieldName) {
    return paramName + '_' + (rowIndex + 1) + '_' + fieldName;
  }

  function buildRepeatableFieldXml(field, prefix, indent, state, paramName, rowIndex, rowValues) {
    if (field.isComplex || field.isCollection) {
      return indent + '<' + prefix + field.name + '/>';
    }
    if (state.mode === 'execution') {
      const value = rowValues && Object.prototype.hasOwnProperty.call(rowValues, field.name)
        ? rowValues[field.name]
        : exampleValue(field.type);
      return buildPrimitiveValueTag(prefix, field.name, value, indent);
    }
    const variableName = repeatableVariableName(paramName, rowIndex, field.name);
    const defaultValue = rowValues && Object.prototype.hasOwnProperty.call(rowValues, field.name)
      ? rowValues[field.name]
      : exampleValue(field.type);
    registerVariable(state.variables, variableName, defaultValue);
    return buildPrimitiveTag(prefix, field.name, variableName, indent);
  }

  function buildRepeatableCollectionXml(param, sdts, indent, state) {
    const itemTag = param.itemName || param.sdtType || param.name;
    const fields = sdts[param.sdtType] || [];
    const rows = state.repeatableOverrides && Array.isArray(state.repeatableOverrides[param.name]) && state.repeatableOverrides[param.name].length
      ? state.repeatableOverrides[param.name]
      : [{}];
    const itemsXml = rows.map(function(rowValues, rowIndex) {
      const rowXml = fields.map(function(field) {
        return buildRepeatableFieldXml(field, 'bts:', indent + '      ', state, param.name, rowIndex, rowValues || {});
      }).join('\n');
      return [
        indent + '   <bts:' + itemTag + '>',
        rowXml,
        indent + '   </bts:' + itemTag + '>'
      ].join('\n');
    }).join('\n');
    return [
      indent + '<bts:' + param.name + '>',
      itemsXml,
      indent + '</bts:' + param.name + '>'
    ].join('\n');
  }

  function buildSdtFieldsXml(fields, sdts, prefix, indent, state, pathParts) {
    return (fields || []).map(function(field) {
      const childPath = pathParts.concat(field.name);
      if (field.isComplex && field.sdtType && sdts[field.sdtType]) {
        if (field.isCollection) {
          const itemTag = field.itemName || field.sdtType || field.name;
          const innerCollection = buildSdtFieldsXml(sdts[field.sdtType], sdts, prefix, indent + '   ', state, pathParts.concat(itemTag));
          return [
            indent + '<' + prefix + field.name + '>',
            indent + '   <' + prefix + itemTag + '>',
            innerCollection,
            indent + '   </' + prefix + itemTag + '>',
            indent + '</' + prefix + field.name + '>'
          ].join('\n');
        }
        const innerObject = buildSdtFieldsXml(sdts[field.sdtType], sdts, prefix, indent + '   ', state, childPath);
        return [
          indent + '<' + prefix + field.name + '>',
          innerObject,
          indent + '</' + prefix + field.name + '>'
        ].join('\n');
      }

      if (field.isCollection) {
        return indent + '<' + prefix + field.name + '/>';
      }

      // pathLabel es la clave que usa item.manualInputs (ver buildDbFieldTemplate);
      // fallbackVariableName es el comportamiento historico si no hay
      // manualInput/mapeo conocido para este campo (ver resolveFieldVariableName).
      const pathLabel = childPath.join('.');
      const fallbackVariableName = childPath.join('_');
      const variableName = resolveFieldVariableName(pathLabel, fallbackVariableName, state);
      if (state.mode === 'execution') {
        return buildPrimitiveValueTag(prefix, field.name, resolveExecutionValue(variableName, state, field.type), indent);
      }
      registerVariable(state.variables, variableName, exampleValue(field.type));
      return buildPrimitiveTag(prefix, field.name, variableName, indent);
    }).join('\n');
  }

  function buildInputParamXml(param, sdts, state) {
    const indent = '      ';
    if (param.isComplex && param.sdtType && sdts[param.sdtType]) {
      if (param.isCollection) {
        return buildRepeatableCollectionXml(param, sdts, indent, state);
      }
      const innerObject = buildSdtFieldsXml(sdts[param.sdtType], sdts, 'bts:', indent + '   ', state, [param.name]);
      return [
        indent + '<bts:' + param.name + '>',
        innerObject,
        indent + '</bts:' + param.name + '>'
      ].join('\n');
    }

    if (param.isCollection) {
      return indent + '<bts:' + param.name + '/>';
    }

    // Para un param simple de primer nivel, su pathLabel es directamente su
    // propio nombre (no hay nesting todavia).
    const fallbackVariableName = state.bindings[param.name] || param.name;
    const variableName = resolveFieldVariableName(param.name, fallbackVariableName, state);
    if (state.mode === 'execution') {
      return buildPrimitiveValueTag('bts:', param.name, resolveExecutionValue(variableName, state, param.type), indent);
    }
    registerVariable(state.variables, variableName, exampleValue(param.type));
    return buildPrimitiveTag('bts:', param.name, variableName, indent);
  }

  function collectSdtVariableEntries(fields, sdts, pathParts, variables, context) {
    (fields || []).forEach(function(field) {
      const childPath = pathParts.concat(field.name);
      if (field.isComplex && field.sdtType && sdts[field.sdtType]) {
        if (field.isCollection) {
          const itemTag = field.itemName || field.sdtType || field.name;
          collectSdtVariableEntries(sdts[field.sdtType], sdts, pathParts.concat(itemTag), variables, context);
          return;
        }
        collectSdtVariableEntries(sdts[field.sdtType], sdts, childPath, variables, context);
        return;
      }
      if (field.isCollection) return;
      const key = childPath.join('_');
      if (!variables.has(key)) {
        variables.set(key, {
          key,
          type: field.type || '',
          source: context.source,
          groupKey: context.groupKey,
          groupTitle: context.groupTitle,
          pathLabel: childPath.join('.'),
          description: field.description || '',
          defaultValue: exampleValue(field.type),
          repeatableGroupKey: context.repeatableGroupKey || '',
          repeatableParamName: context.repeatableParamName || '',
          repeatableItemTag: context.repeatableItemTag || '',
          repeatableFieldName: context.repeatableGroupKey ? field.name : '',
          repeatableFieldLabel: context.repeatableGroupKey ? childPath.join('.') : ''
        });
      }
    });
  }

  function collectInputVariableEntries(schema, bindings, variables) {
    (schema.inputs || []).forEach(function(param) {
      if (isSimpleParam(param)) {
        if (bindings[param.name]) return;
        if (!variables.has(param.name)) {
          variables.set(param.name, {
            key: param.name,
            type: param.type || '',
            source: schema.service + '.' + schema.method + '.' + param.name,
            groupKey: schema.service + '.' + schema.method,
            groupTitle: schema.orderLabel + '. ' + schema.service + '.' + schema.method,
            pathLabel: param.name,
            description: param.description || '',
            defaultValue: exampleValue(param.type)
          });
        }
        return;
      }

      if (param.isComplex && param.sdtType && schema.sdts && schema.sdts[param.sdtType]) {
        const context = {
          source: schema.service + '.' + schema.method + '.' + param.name,
          groupKey: schema.service + '.' + schema.method,
          groupTitle: schema.orderLabel + '. ' + schema.service + '.' + schema.method
        };
        if (param.isCollection) {
          const itemTag = param.itemName || param.sdtType || param.name;
          context.repeatableGroupKey = schema.service + '.' + schema.method + '::' + param.name;
          context.repeatableParamName = param.name;
          context.repeatableItemTag = itemTag;
          collectSdtVariableEntries(schema.sdts[param.sdtType], schema.sdts, [param.name, itemTag], variables, context);
          return;
        }
        collectSdtVariableEntries(schema.sdts[param.sdtType], schema.sdts, [param.name], variables, context);
      }
    });
  }

  function buildSoapRequestXml(schema, state) {
    const inputXml = (schema.inputs || []).map(function(param) {
      return buildInputParamXml(param, schema.sdts || {}, state);
    }).join('\n');

    return [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
      '  <soapenv:Header/>',
      '  <soapenv:Body>',
      '    <bts:' + schema.service + '.' + schema.method + '>',
      buildBtinreqXml(state),
      inputXml,
      '    </bts:' + schema.service + '.' + schema.method + '>',
      '  </soapenv:Body>',
      '</soapenv:Envelope>'
    ].join('\n');
  }

  function buildPostmanTestScript(outputNames, saveToken) {
    const lines = [
      "pm.test('Status 200', function () { pm.response.to.have.status(200); });",
      "var text = pm.response.text();",
      "var jsonData = xml2Json(text);",
      "pm.collectionVariables.set('lastSoapResponse', JSON.stringify(jsonData));",
      "function findNode(node, key) {",
      "  if (!node || typeof node !== 'object') return null;",
      "  if (Object.prototype.hasOwnProperty.call(node, key)) return node[key];",
      "  for (var k in node) {",
      "    if (!Object.prototype.hasOwnProperty.call(node, k)) continue;",
      "    var found = findNode(node[k], key);",
      "    if (found !== null && found !== undefined) return found;",
      "  }",
      "  return null;",
      "}",
      "var businessErrors = findNode(jsonData, 'BusinessErrors');",
      "var businessError = businessErrors ? (businessErrors.businessError || businessErrors.BusinessError) : null;",
      "pm.test('Sin errores de negocio', function () {",
      "  pm.expect(businessError, JSON.stringify(businessErrors)).to.not.exist;",
      "});"
    ];

    if (saveToken) {
      lines.push(
        "var sessionToken = findNode(jsonData, 'SessionToken') || findNode(jsonData, 'Token');",
        "if (sessionToken !== null && sessionToken !== undefined) {",
        "  pm.collectionVariables.set('token', String(sessionToken));",
        "}"
      );
    }

    (outputNames || []).forEach(function(name) {
      const safeName = String(name).replace(/[^A-Za-z0-9_$]/g, '_');
      lines.push(
        "var " + safeName + " = findNode(jsonData, '" + name + "');",
        "if (" + safeName + " !== null && " + safeName + " !== undefined) {",
        "  pm.collectionVariables.set('" + name + "', String(" + safeName + "));",
        "}"
      );
    });

    return {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: lines
      }
    };
  }

  function buildPostmanJsonAuthTestScript() {
    const lines = [
      "pm.test('Status 200', function () { pm.response.to.have.status(200); });",
      "var data = {};",
      "try { data = pm.response.json(); } catch (e) {}",
      "pm.collectionVariables.set('lastSoapResponse', JSON.stringify(data));",
      "var sessionToken = data.SessionToken || data.Token || data.sessionToken || data.token;",
      "pm.test('Token disponible', function () { pm.expect(sessionToken, JSON.stringify(data)).to.exist; });",
      "if (sessionToken !== null && sessionToken !== undefined) {",
      "  pm.collectionVariables.set('token', String(sessionToken));",
      "}"
    ];
    return {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: lines
      }
    };
  }

  /**
   * Parecido a buildPostmanTestScript(_, true), pero busca "sessionToken"
   * en minuscula ademas de "SessionToken": la respuesta real de
   * Session.userLogin ("API interna") trae el tag en minuscula, y
   * parseSoapXml/xml2Json no normalizan mayusculas/minusculas -- el
   * generico de arriba solo revisa "SessionToken"/"Token" y no matchea.
   * Ver authenticateSessionInternaSoap, mismo criterio en el camino en vivo.
   */
  function buildInternaSessionAuthTestScript() {
    const lines = [
      "pm.test('Status 200', function () { pm.response.to.have.status(200); });",
      "var text = pm.response.text();",
      "var jsonData = xml2Json(text);",
      "pm.collectionVariables.set('lastSoapResponse', JSON.stringify(jsonData));",
      "function findNode(node, key) {",
      "  if (!node || typeof node !== 'object') return null;",
      "  if (Object.prototype.hasOwnProperty.call(node, key)) return node[key];",
      "  for (var k in node) {",
      "    if (!Object.prototype.hasOwnProperty.call(node, k)) continue;",
      "    var found = findNode(node[k], key);",
      "    if (found !== null && found !== undefined) return found;",
      "  }",
      "  return null;",
      "}",
      "var businessErrors = findNode(jsonData, 'BusinessErrors');",
      "var businessError = businessErrors ? (businessErrors.businessError || businessErrors.BusinessError) : null;",
      "pm.test('Sin errores de negocio', function () {",
      "  pm.expect(businessError, JSON.stringify(businessErrors)).to.not.exist;",
      "});",
      "var sessionToken = findNode(jsonData, 'sessionToken') || findNode(jsonData, 'SessionToken');",
      "pm.test('sessionToken disponible', function () { pm.expect(sessionToken, JSON.stringify(jsonData)).to.exist; });",
      "if (sessionToken !== null && sessionToken !== undefined) {",
      "  pm.collectionVariables.set('token', String(sessionToken));",
      "}"
    ];
    return {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: lines
      }
    };
  }

  /**
   * Item de autenticacion exportado para "API interna" (V4): Session.userLogin
   * por SOAP contra el Core, en vez de Authenticate.Execute. No usa "URL de
   * autenticacion" (esa es especifica de la API publica) ni el sufijo "_v1"
   * (ver soapServletSuffix) -- mismo sobre que authenticateSessionInternaSoap,
   * la version en vivo de esta misma autenticacion, con variables {{...}} de
   * Postman en vez de valores ya resueltos.
   */
  function buildInternaSessionAuthRequestItem(api) {
    const coreBaseUrl = String(api.API_BASE_URL || '').replace(/\/+$/g, '');
    const resolvedAuthUrl = coreBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Session';
    const rawUrl = '{{api_base_url}}/servlet/com.dlya.bantotal.ardwsbt_Session';
    const rawXml = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
      '  <soapenv:Header/>',
      '  <soapenv:Body>',
      '    <bts:Session.userLogin>',
      '      <bts:Btinreq>',
      '        <bts:Canal>{{channel}}</bts:Canal>',
      '        <bts:Usuario>{{username}}</bts:Usuario>',
      '        <bts:Device>{{device}}</bts:Device>',
      '        <bts:Requerimiento>{{requirement}}</bts:Requerimiento>',
      '        <bts:Token></bts:Token>',
      '      </bts:Btinreq>',
      '      <bts:user>{{username}}</bts:user>',
      '      <bts:userPassword>{{password}}</bts:userPassword>',
      '      <bts:jwt></bts:jwt>',
      '    </bts:Session.userLogin>',
      '  </soapenv:Body>',
      '</soapenv:Envelope>'
    ].join('\n');

    return {
      name: '0. Authenticate (Session.userLogin)',
      event: [buildInternaSessionAuthTestScript()],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'text/xml; charset=utf-8', type: 'text' },
          { key: 'SOAPAction', value: 'http://uy.com.dlya.bantotal/BTSOA/action/ASESSION.userLogin', type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: rawXml,
          options: { raw: { language: 'xml' } }
        },
        url: parsePostmanUrl(rawUrl, resolvedAuthUrl),
        description: 'Obtiene el jwt de sesion de "API interna" via Session.userLogin (no usa "URL de autenticacion", especifica de la API publica).'
      },
      response: []
    };
  }

  /**
   * Item de autenticacion de la API publica V4: user-login de session.
   *
   * Canal BTPUBLIC literal y no {{channel}}: el canal del login publico lo
   * fija arquitectura, no la parametria del ambiente, y dejarlo como variable
   * invita a pisarlo con un BTDIGITAL heredado que hace fallar el login.
   * El Device si sale del ambiente, y va: sin el, el login devuelve
   * "API internal error" (medido contra un ambiente real). Token no va ni
   * vacio -- con Token el servicio contesta 401 "Token is blank".
   * Los requests de negocio que siguen usan Authorization: Bearer {{token}}
   * (ver buildJsonRequestItem), sin headers de canal.
   */
  function buildPublicSessionAuthRequestItem(api) {
    const resolvedAuthUrl = resolveJsonAuthUrl(api);
    const rawJson = JSON.stringify({
      user: '{{username}}',
      userPassword: '{{password}}',
      jwt: true
    }, null, 2);
    return {
      name: '0. user-login (session)',
      event: [buildPostmanJsonAuthTestScript()],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json', type: 'text' },
          { key: 'Canal', value: btUrls.CANAL_PUBLICO, type: 'text' },
          { key: 'Device', value: '{{device}}', type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: rawJson,
          options: { raw: { language: 'json' } }
        },
        url: parsePostmanUrl('{{auth_url}}', resolvedAuthUrl),
        description: 'Obtiene el sessionToken (jwt) de la API publica via session/user-login. Se usa como Authorization: Bearer en el resto de los requests.'
      },
      response: []
    };
  }

  function buildAuthRequestItem(version, api, apiMode) {
    if (version === 'V4' && apiMode === 'interna') {
      return buildInternaSessionAuthRequestItem(api);
    }
    if (version === 'V4' && resolveAuthKind(api) === btUrls.KIND_SESSION_PUBLICA) {
      return buildPublicSessionAuthRequestItem(api);
    }
    if (version === 'V4') {
      const resolvedAuthUrl = resolveV4AuthUrl(api);
      const rawUrl = '{{auth_url}}';
      const rawJson = JSON.stringify({
        UserId: '{{username}}',
        UserPassword: '{{password}}'
      }, null, 2);
      return {
        name: '0. Authenticate',
        event: [buildPostmanJsonAuthTestScript()],
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json', type: 'text' },
            { key: 'Canal', value: '{{channel}}', type: 'text' },
            { key: 'Device', value: '{{device}}', type: 'text' },
            { key: 'Usuario', value: '{{username}}', type: 'text' },
            { key: 'Requerimiento', value: '{{requirement}}', type: 'text' },
            { key: 'Token', value: '', type: 'text' },
            { key: 'idempotency-key', value: '1', type: 'text' }
          ],
          body: {
            mode: 'raw',
            raw: rawJson,
            options: { raw: { language: 'json' } }
          },
          url: parsePostmanUrl(rawUrl, resolvedAuthUrl),
          description: 'Obtiene el token de sesion para los requests del flujo.'
        },
        response: []
      };
    }

    const apiBaseUrl = String(api.API_BASE_URL || '').replace(/\/+$/g, '');
    // Fallback defensivo por si el wizard no completo "URL de autenticacion":
    // el servlet real esta versionado (_v1), confirmado con el WSDL/ejemplo real.
    const resolvedAuthUrl = api.API_AUTH_URL || (apiBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1');
    const rawUrl = '{{auth_url}}';
    const rawXml = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
      '  <soapenv:Header/>',
      '  <soapenv:Body>',
      '    <bts:Authenticate.Execute>',
      '      <bts:Btinreq>',
      '        <bts:Canal>{{channel}}</bts:Canal>',
      '        <bts:Usuario>{{username}}</bts:Usuario>',
      '        <bts:Device>{{device}}</bts:Device>',
      '        <bts:Requerimiento>{{requirement}}</bts:Requerimiento>',
      '        <bts:Token></bts:Token>',
      '      </bts:Btinreq>',
      '      <bts:UserId>{{username}}</bts:UserId>',
      '      <bts:UserPassword>{{password}}</bts:UserPassword>',
      '    </bts:Authenticate.Execute>',
      '  </soapenv:Body>',
      '</soapenv:Envelope>'
    ].join('\n');

    return {
      name: '0. Authenticate',
      event: [buildPostmanTestScript([], true)],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'text/xml; charset=utf-8', type: 'text' },
          { key: 'SOAPAction', value: 'http://uy.com.dlya.bantotal/BTSOA/action/AAUTHENTICATE.Execute', type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: rawXml,
          options: { raw: { language: 'xml' } }
        },
        url: parsePostmanUrl(rawUrl, resolvedAuthUrl),
        description: 'Obtiene el token de sesion por SOAP.'
      },
      response: []
    };
  }

  /**
   * Auth URL para el flujo JSON de V3: el servlet real invocado con JSON
   * usa el sufijo `?Execute` (igual que authenticateSession/obtenerToken),
   * a diferencia del `auth_url` compartido con el flujo SOAP.
   */
  function resolveJsonV3AuthUrl(api) {
    const apiBaseUrl = String((api && api.API_BASE_URL) || '').replace(/\/+$/g, '');
    const baseAuthUrl = String((api && api.API_AUTH_URL) || (apiBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1')).trim();
    if (/\?Execute$/i.test(baseAuthUrl)) return baseAuthUrl;
    return baseAuthUrl + (baseAuthUrl.indexOf('?') >= 0 ? '&' : '?') + 'Execute';
  }

  /**
   * Item de autenticacion para el flujo JSON+Postman ("Casos de uso").
   * Para V4 reusa buildAuthRequestItem sin cambios; para V3 arma JSON con
   * Btinreq (no SOAP), consistente con el resto de este flujo.
   */
  /**
   * Item de autenticacion exportado para "API interna" via REST/Swagger:
   * Session.userLogin, detectado automaticamente en el/los swagger cargados
   * (ver findInternaAuthOperation). Distinto del homonimo SOAP
   * (buildInternaSessionAuthRequestItem, usado solo por el camino XML/Base de
   * datos de "API interna" contra el Core) -- este pega directo al
   * microservicio REST que expuso el endpoint en su propio swagger.
   */
  function buildInternaJsonSessionAuthRequestItem(api) {
    const resolvedAuthUrl = resolveJsonAuthUrl(api);
    const rawUrl = '{{auth_url}}';
    const rawJson = JSON.stringify({
      user: '{{username}}',
      userPassword: '{{password}}',
      jwt: true
    }, null, 2);

    return {
      name: '0. Authenticate (Session.userLogin)',
      event: [buildPostmanJsonAuthTestScript()],
      request: {
        method: 'POST',
        // Canal + Device y nada mas. El header Token, aunque fuera vacio,
        // hacia que el servicio de session contestara 401 "Token is blank"
        // (medido contra el gateway interno en 10.0.0.7:5107); Usuario y
        // Requerimiento no cambian nada. Mismo payload que la ejecucion en
        // vivo, que lo arma buildAuthPayload.
        header: [
          { key: 'Content-Type', value: 'application/json', type: 'text' },
          { key: 'Canal', value: '{{channel}}', type: 'text' },
          { key: 'Device', value: '{{device}}', type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: rawJson,
          options: { raw: { language: 'json' } }
        },
        url: parsePostmanUrl(rawUrl, resolvedAuthUrl),
        description: 'Obtiene el sessionToken de "API interna" via Session.userLogin (REST), detectado automaticamente en el swagger del ambiente.'
      },
      response: []
    };
  }

  function buildJsonAuthRequestItem(version, api) {
    if (version === 'V4' && api.SWAGGER_AUTH_KIND === btUrls.KIND_SESSION_INTERNA) {
      return buildInternaJsonSessionAuthRequestItem(api);
    }
    if (version === 'V4' && resolveAuthKind(api) === btUrls.KIND_SESSION_PUBLICA) {
      return buildPublicSessionAuthRequestItem(api);
    }
    if (version === 'V4') return buildAuthRequestItem(version, api);

    const rawJson = JSON.stringify({
      Btinreq: {
        Canal: '{{channel}}',
        Usuario: '{{username}}',
        Device: '{{device}}',
        Requerimiento: '{{requirement}}',
        Token: ''
      },
      UserId: '{{username}}',
      UserPassword: '{{password}}'
    }, null, 2);

    return {
      name: '0. Authenticate',
      event: [buildPostmanJsonAuthTestScript()],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json', type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: rawJson,
          options: { raw: { language: 'json' } }
        },
        url: parsePostmanUrl('{{json_auth_url}}', resolveJsonV3AuthUrl(api)),
        description: 'Obtiene el token de sesion para los requests del flujo (JSON, V3).'
      },
      response: []
    };
  }

  function buildSoapAction(schema) {
    return 'http://uy.com.dlya.bantotal/BTSOA/action/A' + schema.service.toUpperCase() + '.' + schema.method;
  }

  // NOTA (confirmado 2026-07-22 con un request real capturado desde SoapUI/Postman
  // contra pioneroapp2): el servlet SOAP de V3 se invoca SIEMPRE contra la MISMA
  // URL fija del servicio (sin query string), y es el header SOAPAction + el
  // elemento raiz del body (`<bts:{Servicio}.{Metodo}>`) lo que le dice al
  // servidor que operacion ejecutar. A diferencia del camino JSON (que usaba
  // `?{Metodo}` como sufijo de la URL), SOAP NO necesita ese sufijo.
  // "API interna" no versiona el nombre del servlet (sin "_v1"): confirmado
  // con dos ejemplos reales dados por el usuario (Session, PublicCASHManagement).
  // "API publica"/V3 si lo versiona. Ver authenticateSessionInternaSoap.
  function soapServletSuffix(apiMode) {
    return apiMode === 'interna' ? '' : '_v1';
  }

  function buildSoapRequestUrl(api, schema, apiMode) {
    const resolvedBaseUrl = String(api.API_BASE_URL || '').replace(/\/+$/g, '');
    return resolvedBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_' + schema.service + soapServletSuffix(apiMode);
  }

  function buildMethodRequestItem(schema, state, api, apiMode) {
    const outputNames = getExportableOutputs(schema).map(function(param) { return param.name; });
    // Sin "?metodo": SOAP identifica la operacion via SOAPAction + el elemento
    // raiz del body, no via query string (ver nota en buildSoapRequestUrl).
    const rawUrl = '{{api_base_url}}/servlet/com.dlya.bantotal.ardwsbt_' + schema.service + soapServletSuffix(apiMode);
    const resolvedUrl = buildSoapRequestUrl(api, schema, apiMode);
    return {
      name: schema.orderLabel + '. ' + schema.service + '.' + schema.method,
      event: [buildPostmanTestScript(outputNames, false)],
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'text/xml; charset=utf-8', type: 'text' },
          { key: 'SOAPAction', value: buildSoapAction(schema), type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: buildSoapRequestXml(schema, state),
          options: { raw: { language: 'xml' } }
        },
        url: parsePostmanUrl(rawUrl, resolvedUrl),
        description: schema.description || ('Invoca ' + schema.service + '.' + schema.method)
      },
      response: []
    };
  }

  function buildCollectionVariables(version, api, generatedVariables, variableOverrides) {
    const apiBaseUrl = resolveJsonBaseUrl(api);
    const publicBaseUrl = resolveJsonBaseUrl(api);
    // Fallback defensivo (normalmente api.API_AUTH_URL ya viene completo desde
    // el wizard): el servlet real de V3 esta versionado (_v1).
    const authUrl = version === 'V4'
      ? resolveJsonAuthUrl(api)
      : (api.API_AUTH_URL || (apiBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1'));
    const overrides = variableOverrides || {};
    const entries = [
      ['api_base_url', apiBaseUrl],
      ['public_api_url', publicBaseUrl],
      ['base_url', publicBaseUrl],
      ['auth_url', authUrl],
      // Con el login publico el canal es BTPUBLIC por definicion: la
      // collection tiene que salir con el mismo valor que se manda en vivo.
      ['channel', (version === 'V4' && resolveAuthKind(api) === btUrls.KIND_SESSION_PUBLICA)
        ? btUrls.CANAL_PUBLICO
        : (api.API_CANAL || 'BTDIGITAL')],
      ['username', api.API_USER || 'INSTALADOR'],
      ['password', api.API_PASSWORD || ''],
      ['device', api.API_DEVICE || 'INSTALADOR'],
      ['requirement', api.API_REQUERIMIENTO || '1'],
      ['token', ''],
      ['lastSoapResponse', ''],
      ['lastJsonResponse', '']
    ];
    generatedVariables.forEach(function(value, key) {
      entries.push([key, Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : value]);
    });
    return entries.map(function(entry) {
      return {
        key: entry[0],
        value: entry[1],
        type: 'string'
      };
    });
  }

  function firstDefinedText() {
    for (let i = 0; i < arguments.length; i++) {
      const value = arguments[i];
      if (value === undefined || value === null) continue;
      const text = String(value);
      if (text.trim()) return text;
    }
    return '';
  }

  function resolveExecutionAuthContext(config) {
    const api = (config && config.api) || config || {};
    const authContext = (config && config.authContext) || {};
    return {
      channel: firstDefinedText(authContext.channel, api.API_CANAL, 'BTDIGITAL'),
      username: firstDefinedText(authContext.username, api.API_USER, 'INSTALADOR'),
      device: firstDefinedText(authContext.device, api.API_DEVICE, 'INSTALADOR'),
      requirement: firstDefinedText(authContext.requirement, api.API_REQUERIMIENTO, '1'),
      password: firstDefinedText(authContext.password, api.API_PASSWORD, ''),
      token: firstDefinedText(authContext.token, '')
    };
  }

  /**
   * Headers de autenticacion de un request de negocio. Con el user-login de
   * la API publica el token va como "Authorization: Bearer" y los headers de
   * canal/usuario/device/requerimiento ya no se mandan (el jwt los lleva
   * adentro); con Authenticate.Execute siguen yendo los cinco de siempre.
   * La decision vive en el modulo compartido para que la ejecucion en vivo y
   * la collection exportada no se puedan desincronizar.
   */
  function buildBantotalJsonHeaders(context, tokenOverride, kind) {
    return btUrls.buildRequestAuthHeaders(kind, {
      channel: firstDefinedText(context && context.channel, 'BTDIGITAL'),
      username: firstDefinedText(context && context.username, 'INSTALADOR'),
      device: firstDefinedText(context && context.device, 'INSTALADOR'),
      requirement: firstDefinedText(context && context.requirement, '1'),
      token: firstDefinedText(tokenOverride, context && context.token, '')
    });
  }

  function mergeExecutionStepValues(baseValues, stepOverrides) {
    const merged = Object.assign({}, baseValues || {});
    Object.keys(stepOverrides || {}).forEach(function(key) {
      const nextValue = stepOverrides[key];
      if (nextValue === undefined || nextValue === null) return;
      if (String(nextValue) === '' && Object.prototype.hasOwnProperty.call(merged, key) && String(merged[key]) !== '') {
        return;
      }
      merged[key] = nextValue;
    });
    return merged;
  }

  function computeBindingsAndMappings(schemas) {
    const availableOutputs = new Map();
    const bindingsPerStep = [];
    const mappings = [];

    schemas.forEach(function(schema, index) {
      const bindings = {};
      (schema.inputs || []).forEach(function(param) {
        if (isSimpleParam(param) && availableOutputs.has(param.name)) {
          bindings[param.name] = param.name;
          mappings.push({
            target: schema.service + '.' + schema.method,
            input: param.name,
            source: availableOutputs.get(param.name)
          });
        }
      });
      bindingsPerStep.push(bindings);

      getExportableOutputs(schema).forEach(function(param) {
        availableOutputs.set(param.name, schema.service + '.' + schema.method + '.' + param.name);
      });
    });

    return { bindingsPerStep, mappings };
  }

  async function loadSchemasForItems(body) {
    const schemas = [];
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      const schema = await queryMethodSchema(body.platform, body.db, item.service, item.method, body.apiMode);
      schema.service = item.service;
      schema.method = item.method;
      schema.orderLabel = i + 1;
      schemas.push(schema);
    }
    return schemas;
  }

  function getScenarioPayloads(body) {
    if (Array.isArray(body.scenarios) && body.scenarios.length) {
      return body.scenarios.map(function(scenario, index) {
      return {
        id: scenario.id || ('scenario_' + index),
        name: scenario.name || ('Caso de uso ' + (index + 1)),
        items: Array.isArray(scenario.items) ? scenario.items : [],
        variableOverrides: scenario.variableOverrides || {},
        inputMappings: scenario.inputMappings || {},
        inputAliases: scenario.inputAliases || {},
        outputAliases: scenario.outputAliases || {},
        repeatableOverrides: scenario.repeatableOverrides || {},
        tokenSources: scenario.tokenSources || {}
      };
      }).filter(function(scenario) {
        return scenario.items.length > 0;
      });
    }

    return [{
      id: 'scenario_0',
      name: 'Flujo generado',
      items: Array.isArray(body.items) ? body.items : [],
      variableOverrides: body.variableOverrides || {},
      inputMappings: body.inputMappings || {},
      inputAliases: body.inputAliases || {},
      outputAliases: body.outputAliases || {},
      repeatableOverrides: body.repeatableOverrides || {},
      tokenSources: body.tokenSources || {}
    }].filter(function(scenario) {
      return scenario.items.length > 0;
    });
  }

  async function buildCollectionPreview(body) {
    const schemas = await loadSchemasForItems(body);
    const bindingsInfo = computeBindingsAndMappings(schemas);
    const variables = new Map();

    schemas.forEach(function(schema, index) {
      collectInputVariableEntries(schema, bindingsInfo.bindingsPerStep[index] || {}, variables);
    });

    return {
      variables: Array.from(variables.values()).map(function(variable) {
        return enrichVariableSuggestions(body, variable);
      }),
      mappings: bindingsInfo.mappings
    };
  }

  /**
   * Arma el bloque de metadata propio que se embebe en la collection
   * exportada (clave `_bttoolsMeta`, ignorada por Postman: no forma parte
   * del schema estandar pero Postman no la rechaza ni la muestra).
   *
   * Guarda, TAL CUAL, los datos de "Origen del valor"/"Valor"/alias que hoy
   * solo viven en el estado del builder (scenario.inputMappings/inputAliases/
   * outputAliases/variableOverrides + item.inputOverrides por paso) para que
   * "Importar collection" los pueda restaurar de forma exacta (sin inferir
   * nada por patrones de nombre) la proxima vez que se importe este mismo
   * archivo. Es deliberadamente un volcado directo de esos objetos — no hace
   * falta transformarlos, porque ya estan indexados por una clave estable
   * (operationKey + pathLabel) que se puede volver a calcular igual al
   * reinsertar cada paso desde el catalogo.
   *
   * Se comparte entre buildJsonPostmanCollection y buildXmlPostmanCollection
   * para no duplicar este armado en los dos formatos.
   */
  function buildBttoolsImportMetadata(scenarios) {
    return {
      version: 1,
      scenarios: (scenarios || []).map(function(scenario) {
        return {
          name: scenario.name,
          inputMappings: scenario.inputMappings || {},
          inputAliases: scenario.inputAliases || {},
          outputAliases: scenario.outputAliases || {},
          variableOverrides: scenario.variableOverrides || {},
          tokenSources: scenario.tokenSources || {},
          stepInputOverrides: (scenario.items || []).map(function(item) {
            return item.inputOverrides || {};
          })
        };
      })
    };
  }

  async function buildXmlPostmanCollection(body) {
    const scenarios = getScenarioPayloads(body);
    if (!scenarios.length) {
      throw new Error('Agrega al menos un caso de uso con metodos antes de generar la collection.');
    }

    const generatedVariables = new Map();
    const allMappings = [];
    const postmanFolders = [];
    const mergedOverrides = {};

    for (let s = 0; s < scenarios.length; s++) {
      const scenario = scenarios[s];
      const schemas = await loadSchemasForItems({
        platform: body.platform,
        db: body.db,
        apiMode: body.apiMode,
        items: scenario.items
      });
      const bindingsInfo = computeBindingsAndMappings(schemas);
      const folderItems = [buildAuthRequestItem(body.version, body.api, body.apiMode)];

      schemas.forEach(function(schema, index) {
        // scenario.items[index] es el mismo item que ya vio el inspector (con
        // su manualInputs/operationKey reales); `schema` es solo la
        // estructura recien consultada para saber que campos/SDTs armar.
        // Pasar ambos permite que resolveFieldVariableName respete
        // "Origen del valor" tambien en la collection exportada, no solo al
        // ejecutar en vivo.
        const item = scenario.items[index];
        const state = {
          bindings: bindingsInfo.bindingsPerStep[index],
          variables: generatedVariables,
          repeatableOverrides: scenario.repeatableOverrides || {},
          item: item,
          scenario: scenario,
          manualInputsByPath: buildManualInputsByPath(item)
        };
        folderItems.push(buildMethodRequestItem(schema, state, body.api, body.apiMode));
      });

      Object.assign(mergedOverrides, scenario.variableOverrides || {});
      allMappings.push.apply(allMappings, bindingsInfo.mappings.map(function(map) {
        return Object.assign({ scenario: scenario.name }, map);
      }));

      postmanFolders.push({
        name: scenario.name,
        description: 'Caso de uso generado desde la app.',
        item: folderItems
      });
    }

    const collection = {
      info: {
        name: body.collectionName || 'Bantotal XML Postman',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        description: 'Coleccion generada desde la app para flujo XML/Postman.'
      },
      variable: buildCollectionVariables(body.version, body.api, generatedVariables, mergedOverrides),
      item: postmanFolders,
      _bttoolsMeta: buildBttoolsImportMetadata(scenarios)
    };

    ensureOutputDir();
    const fileName = sanitizeSegment(body.collectionName || postmanFolders[0].name || 'bantotal-collection') + '.postman_collection.json';
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf8');

    return {
      fileName,
      filePath,
      collection,
      mappings: allMappings,
      requestCount: postmanFolders.reduce(function(total, folder) {
        return total + ((folder.item || []).length);
      }, 0),
      scenarioCount: postmanFolders.length
    };
  }

  function buildPostmanJsonTestScript(operation, filteredSelectors) {
    const outputFields = operation && Array.isArray(operation.outputFields) ? operation.outputFields : [];
    const selectors = Array.isArray(filteredSelectors) ? filteredSelectors : [];
    const lines = [
      "pm.test('Status 2xx', function () { pm.expect(pm.response.code).to.be.within(200, 299); });",
      "var text = pm.response.text();",
      "pm.collectionVariables.set('lastJsonResponse', text);",
      "var data = {};",
      "try { data = text ? JSON.parse(text) : {}; } catch (e) {}",
      "function findNestedArray(node) {",
      "  if (!node || typeof node !== 'object' || Array.isArray(node)) return null;",
      "  var keys = Object.keys(node);",
      "  for (var k = 0; k < keys.length; k++) {",
      "    if (Array.isArray(node[keys[k]])) return node[keys[k]];",
      "  }",
      "  return null;",
      "}",
      "function pick(node, parts) {",
      "  if (node === null || node === undefined) return undefined;",
      "  if (!parts.length) return node;",
      "  var current = parts[0];",
      "  var rest = parts.slice(1);",
      "  if (current === 'item') {",
      "    var collection = Array.isArray(node) ? node : findNestedArray(node);",
      "    if (!Array.isArray(collection)) return undefined;",
      "    for (var i = 0; i < collection.length; i++) {",
      "      var foundItem = pick(collection[i], rest);",
      "      if (foundItem !== undefined && foundItem !== null && foundItem !== '') return foundItem;",
      "    }",
      "    return undefined;",
      "  }",
      "  if (Array.isArray(node)) {",
      "    for (var j = 0; j < node.length; j++) {",
      "      var foundArray = pick(node[j], parts);",
      "      if (foundArray !== undefined && foundArray !== null && foundArray !== '') return foundArray;",
      "    }",
      "    return undefined;",
      "  }",
      "  if (typeof node !== 'object') return undefined;",
      "  return pick(node[current], rest);",
      "}",
      "function pickCollectionValue(node, pathParts, filterParts, expected) {",
      "  var itemIndex = pathParts.indexOf('item');",
      "  if (itemIndex <= 0 || itemIndex >= pathParts.length - 1) return pick(node, pathParts);",
      "  var collectionNode = pick(node, pathParts.slice(0, itemIndex));",
      "  var collection = Array.isArray(collectionNode) ? collectionNode : findNestedArray(collectionNode);",
      "  if (!Array.isArray(collection)) return undefined;",
      "  var valueParts = pathParts.slice(itemIndex + 1);",
      "  var normalizedExpected = String(expected == null ? '' : expected).trim().toLowerCase();",
      "  for (var idx = 0; idx < collection.length; idx++) {",
      "    var entry = collection[idx];",
      "    if (filterParts && filterParts.length) {",
      "      var candidate = pick(entry, filterParts);",
      "      if (candidate === undefined || candidate === null) continue;",
      "      if (String(candidate).trim().toLowerCase() !== normalizedExpected) continue;",
      "    }",
      "    var selected = pick(entry, valueParts);",
      "    if (selected !== undefined && selected !== null && selected !== '') return selected;",
      "  }",
      "  return undefined;",
      "}"
    ];
    outputFields.forEach(function(field) {
      const sourceVarKey = buildOutputVarKey(operation, field);
      lines.push(
        "var out_" + sanitizeVariableKey(sourceVarKey) + " = pick(data, " + JSON.stringify(String(field.pathLabel || '').split('.')) + ");",
        "if (out_" + sanitizeVariableKey(sourceVarKey) + " !== undefined && out_" + sanitizeVariableKey(sourceVarKey) + " !== null && typeof out_" + sanitizeVariableKey(sourceVarKey) + " !== 'object') {",
        "  pm.collectionVariables.set(" + JSON.stringify(sourceVarKey) + ", String(out_" + sanitizeVariableKey(sourceVarKey) + "));",
        "}"
      );
    });
    selectors.forEach(function(selector) {
      if (!selector.derivedVarKey || !selector.pathLabel) return;
      const safeKey = sanitizeVariableKey(selector.derivedVarKey);
      lines.push(
        "var filtered_" + safeKey + " = pickCollectionValue(data, " + JSON.stringify(String(selector.pathLabel || '').split('.').filter(Boolean)) + ", " + JSON.stringify(String(selector.filterField || '').split('.').filter(Boolean)) + ", " + JSON.stringify(selector.filterValue || '') + ");",
        "if (filtered_" + safeKey + " !== undefined && filtered_" + safeKey + " !== null && typeof filtered_" + safeKey + " !== 'object') {",
        "  pm.collectionVariables.set(" + JSON.stringify(selector.derivedVarKey) + ", String(filtered_" + safeKey + "));",
        "}"
      );
    });
    return {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: lines
      }
    };
  }

  function buildJsonRawUrl(pathName, manualInputs, variableNameResolver, baseUrlText) {
    const resolver = typeof variableNameResolver === 'function'
      ? variableNameResolver
      : function(input) { return input.key; };
    // Por defecto usa la variable de coleccion {{base_url}} (un solo valor
    // editable para todo el ambiente). Cuando el item viene de un swagger
    // puntual con su propia base (varios microservicios, cada uno con host
    // distinto -- ver extractSwaggerOperations), se pasa esa base ya
    // resuelta en vez de la variable: usar {{base_url}} ahi seria incorrecto,
    // porque esa variable representa un solo ambiente, no el de este item.
    const base = String(baseUrlText || '').replace(/\/+$/g, '') || '{{base_url}}';
    const replacedPath = String(pathName || '').replace(/\{([^}]+)\}/g, function(_, name) {
      const key = sanitizeVariableKey(name);
      return '{{' + resolver({ key, pathLabel: name, location: 'path' }) + '}}';
    });
    const queryParams = (manualInputs || []).filter(function(input) {
      return String(input.location || '').toLowerCase() === 'query';
    });
    if (!queryParams.length) return base + replacedPath;
    const queryString = queryParams.map(function(input) {
      return encodeURIComponent(input.pathLabel || input.key) + '={{' + resolver(input) + '}}';
    }).join('&');
    return base + replacedPath + '?' + queryString;
  }

  function buildJsonResolvedUrl(baseUrl, pathName, manualInputs, overrides) {
    const safeOverrides = overrides || {};
    const replacedPath = String(pathName || '').replace(/\{([^}]+)\}/g, function(_, name) {
      const key = sanitizeVariableKey(name);
      const value = Object.prototype.hasOwnProperty.call(safeOverrides, key) ? safeOverrides[key] : '';
      return encodeURIComponent(String(value == null ? '' : value));
    });
    const queryParams = (manualInputs || []).filter(function(input) {
      return String(input.location || '').toLowerCase() === 'query';
    });
    if (!queryParams.length) return String(baseUrl || '').replace(/\/+$/g, '') + replacedPath;
    const queryString = queryParams.map(function(input) {
      const value = Object.prototype.hasOwnProperty.call(safeOverrides, input.key)
        ? safeOverrides[input.key]
        : (input.defaultValue == null ? '' : input.defaultValue);
      return encodeURIComponent(input.pathLabel || input.key) + '=' + encodeURIComponent(String(value == null ? '' : value));
    }).join('&');
    return String(baseUrl || '').replace(/\/+$/g, '') + replacedPath + '?' + queryString;
  }

  function buildJsonBodyRaw(bodyTemplate, manualInputs, variableNameResolver) {
    const resolver = typeof variableNameResolver === 'function'
      ? variableNameResolver
      : function(input) { return input.key; };
    const typeMap = {};
    (manualInputs || []).forEach(function(input) {
      typeMap[input.key] = String(input.type || '').toLowerCase();
    });
    let raw = JSON.stringify(bodyTemplate == null ? {} : bodyTemplate, null, 2);
    raw = raw.replace(/"__COL_VAR__([A-Za-z0-9_]+)"/g, function(_, key) {
      const type = typeMap[key] || '';
      const input = (manualInputs || []).find(function(candidate) { return candidate.key === key; }) || { key };
      const variableName = resolver(input);
      if (['integer', 'int', 'long', 'short', 'number', 'double', 'float', 'decimal', 'boolean', 'bool'].includes(type)) {
        return '{{' + variableName + '}}';
      }
      return '"{{' + variableName + '}}"';
    });
    return raw;
  }

  function fillJsonTemplate(value, runtimeValues) {
    if (Array.isArray(value)) {
      return value.map(function(item) { return fillJsonTemplate(item, runtimeValues); });
    }
    if (value && typeof value === 'object') {
      const result = {};
      Object.keys(value).forEach(function(key) {
        result[key] = fillJsonTemplate(value[key], runtimeValues);
      });
      return result;
    }
    if (typeof value === 'string') {
      const match = value.match(/^__COL_VAR__([A-Za-z0-9_]+)$/);
      if (match) {
        const key = match[1];
        return Object.prototype.hasOwnProperty.call(runtimeValues, key) ? runtimeValues[key] : '';
      }
    }
    return value;
  }

  function buildJsonExecutionUrl(baseUrl, pathName, manualInputs, runtimeValues) {
    const replacedPath = String(pathName || '').replace(/\{([^}]+)\}/g, function(_, name) {
      const key = sanitizeVariableKey(name);
      const value = Object.prototype.hasOwnProperty.call(runtimeValues, key) ? runtimeValues[key] : '';
      return encodeURIComponent(String(value));
    });
    const queryParams = (manualInputs || []).filter(function(input) {
      return String(input.location || '').toLowerCase() === 'query';
    });
    const qs = queryParams.map(function(input) {
      const value = Object.prototype.hasOwnProperty.call(runtimeValues, input.key)
        ? runtimeValues[input.key]
        : (input.defaultValue || '');
      return encodeURIComponent(input.pathLabel || input.key) + '=' + encodeURIComponent(String(value));
    }).join('&');
    return String(baseUrl || '').replace(/\/+$/g, '') + replacedPath + (qs ? '?' + qs : '');
  }

  async function invokeJsonRequest(url, method, headers, bodyValue) {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? require('https') : require('http');
    const rawBody = bodyValue == null ? '' : JSON.stringify(bodyValue);
    return new Promise(function(resolve, reject) {
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: String(method || 'GET').toUpperCase(),
        headers: Object.assign({}, headers),
        rejectUnauthorized: false
      };
      if (rawBody) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(rawBody);
      }
      const req = mod.request(options, function(res) {
        let s = '';
        res.on('data', function(c) { s += c; });
        res.on('end', function() {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: s });
        });
      });
      req.on('error', reject);
      if (rawBody) req.write(rawBody);
      req.end();
    });
  }

  function extractJsonOutputValues(parsed) {
    const values = {};
    function walk(node) {
      if (!node || typeof node !== 'object') return;
      Object.keys(node).forEach(function(key) {
        const value = node[key];
        if (value == null) return;
        if (typeof value === 'object') {
          walk(value);
          return;
        }
        if (!Object.prototype.hasOwnProperty.call(values, key)) {
          values[key] = String(value);
        }
      });
    }
    walk(parsed);
    return values;
  }

  /**
   * Busca el primer array anidado dentro de un objeto. Las respuestas de
   * Bantotal suelen envolver colecciones asi: "Products": { "Product": [...] }
   * (nombre plural conteniendo el singular), en vez de "Products": [...]
   * directo. El path guardado usa el marcador generico "item" para el
   * elemento de la coleccion, sin saber de antemano como se llama esa
   * envoltura interna (aca "Product"), asi que hay que encontrarla.
   */
  function findNestedArray(node) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return null;
    const keys = Object.keys(node);
    for (const key of keys) {
      if (Array.isArray(node[key])) return node[key];
    }
    return null;
  }

  function readJsonValueByPath(node, pathParts) {
    if (node === null || node === undefined) return undefined;
    if (!pathParts.length) return node;
    const current = pathParts[0];
    const rest = pathParts.slice(1);
    if (current === 'item') {
      const collection = Array.isArray(node) ? node : findNestedArray(node);
      if (!Array.isArray(collection)) return undefined;
      for (const entry of collection) {
        const found = readJsonValueByPath(entry, rest);
        if (found !== undefined && found !== null && found !== '') return found;
      }
      return undefined;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = readJsonValueByPath(item, pathParts);
        if (found !== undefined && found !== null && found !== '') return found;
      }
      return undefined;
    }
    if (typeof node !== 'object') return undefined;
    return readJsonValueByPath(node[current], rest);
  }

  function extractConfiguredJsonOutputValues(item, parsed) {
    const values = {};
    (item.outputFields || []).forEach(function(field) {
      const found = readJsonValueByPath(parsed, String(field.pathLabel || '').split('.').filter(Boolean));
      if (found !== undefined && found !== null && typeof found !== 'object') {
        values[buildOutputVarKey(item, field)] = String(found);
      }
    });
    return values;
  }

  function splitCollectionOutputPath(pathLabel) {
    const parts = String(pathLabel || '').split('.').filter(Boolean);
    const itemIndex = parts.indexOf('item');
    if (itemIndex <= 0 || itemIndex >= parts.length - 1) return null;
    return {
      collectionParts: parts.slice(0, itemIndex),
      itemValueParts: parts.slice(itemIndex + 1)
    };
  }

  function readJsonPath(node, pathParts) {
    if (node === null || node === undefined) return undefined;
    if (!pathParts.length) return node;
    const current = pathParts[0];
    const rest = pathParts.slice(1);
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = readJsonPath(item, pathParts);
        if (found !== undefined) return found;
      }
      return undefined;
    }
    if (typeof node !== 'object') return undefined;
    return readJsonPath(node[current], rest);
  }

  function extractFilteredJsonOutputValue(parsed, pathLabel, filterField, filterValue) {
    const split = splitCollectionOutputPath(pathLabel);
    if (!split) {
      const direct = readJsonValueByPath(parsed, String(pathLabel || '').split('.').filter(Boolean));
      return direct !== undefined && direct !== null && typeof direct !== 'object' ? direct : undefined;
    }
    const collectionNode = readJsonPath(parsed, split.collectionParts);
    const items = Array.isArray(collectionNode) ? collectionNode : (findNestedArray(collectionNode) || []);
    const normalizedExpected = String(filterValue == null ? '' : filterValue).trim().toLowerCase();
    const filterParts = String(filterField || '').split('.').filter(Boolean);
    for (const item of items) {
      if (!filterParts.length) {
        const plain = readJsonPath(item, split.itemValueParts);
        if (plain !== undefined && plain !== null && plain !== '') return plain;
        continue;
      }
      const candidate = readJsonPath(item, filterParts);
      if (candidate == null) continue;
      if (String(candidate).trim().toLowerCase() !== normalizedExpected) continue;
      const selected = readJsonPath(item, split.itemValueParts);
      if (selected !== undefined && selected !== null && typeof selected !== 'object') return selected;
    }
    return undefined;
  }

  function collectJsonFilteredSelectorsForItem(item, scenario) {
    const mappings = scenario && scenario.inputMappings ? scenario.inputMappings : {};
    const availableOutputKeys = new Set((item.outputFields || []).map(function(field) {
      return buildOutputVarKey(item, field);
    }));
    const selectors = [];
    Object.keys(mappings).forEach(function(mappingKey) {
      const config = normalizeInputMappingConfig(mappings[mappingKey]);
      if (!config || !config.sourceVarKey || !availableOutputKeys.has(config.sourceVarKey)) return;
      const effectiveFilterField = config.filterField || (config.filterValue ? config.itemPathLabel : '');
      if (!effectiveFilterField || !config.filterValue) return;
      const outputField = (item.outputFields || []).find(function(field) {
        return buildOutputVarKey(item, field) === config.sourceVarKey;
      });
      if (!outputField) return;
      selectors.push({
        sourceVarKey: config.sourceVarKey,
        derivedVarKey: buildFilteredRuntimeKey(config),
        pathLabel: config.itemPathLabel ? ((config.collectionPathLabel ? config.collectionPathLabel + '.item.' : '') + config.itemPathLabel) : (outputField.pathLabel || ''),
        filterField: effectiveFilterField,
        filterValue: config.filterValue
      });
    });
    return selectors;
  }

  function buildJsonRequestItem(operation, orderLabel, api, scenario, version) {
    const isV3 = version === 'V3';
    const methodName = operation.methodName || operation.method || deriveMethodNameFromPath(operation.path, operation.httpMethod, operation);
    const resolvedOverrides = Object.assign(
      {},
      (scenario && scenario.variableOverrides) || {},
      (operation && operation.inputOverrides) || {}
    );
    const operationBaseUrl = operation.sourceBaseUrl || '';
    const rawUrl = buildJsonRawUrl(operation.path, operation.manualInputs || [], function(input) {
      return resolveMappedVariableName(operation, input, scenario);
    }, operationBaseUrl);
    const resolvedUrl = buildJsonResolvedUrl(operationBaseUrl || resolveJsonBaseUrl(api), operation.path, operation.manualInputs || [], resolvedOverrides);
    // Si este grupo (su sourceBaseUrl -- un swagger/microservicio puede tener
    // su propio token) tiene una "Fuente de token" configurada (ver
    // CollectionTokenSourceManager), el header Token apunta directo a esa
    // variable de salida en vez de la global {{token}} -- el paso fuente ya
    // la publica como collection variable via su propio test script
    // (buildPostmanTestScript), no hace falta nada mas para que funcione.
    const tokenSourceKey = (scenario && scenario.tokenSources) ? scenario.tokenSources[operationBaseUrl] : null;
    const tokenVariableRef = '{{' + (tokenSourceKey || 'token') + '}}';
    // V3 lleva Canal/Usuario/Device/Requerimiento/Token dentro del body (Btinreq),
    // no como headers custom: asi es como responde el servlet real (ver authenticateSession).
    //
    // V4 con el login publico manda solo Authorization: Bearer. Los headers de
    // canal/usuario/device/requerimiento dejaron de ser necesarios (el jwt los
    // lleva adentro) y mandarlos igual solo ensucia el request exportado.
    const headers = isV3
      ? []
      : btUrls.usaBearer(resolveAuthKind(api))
        ? [{ key: 'Authorization', value: 'Bearer ' + tokenVariableRef, type: 'text' }]
        : [
            { key: 'Canal', value: '{{channel}}', type: 'text' },
            { key: 'Device', value: '{{device}}', type: 'text' },
            { key: 'Usuario', value: '{{username}}', type: 'text' },
            { key: 'Requerimiento', value: '{{requirement}}', type: 'text' },
            { key: 'Token', value: tokenVariableRef, type: 'text' }
          ];
    const method = String(operation.httpMethod || 'GET').toUpperCase();
    if (method !== 'GET') {
      headers.unshift({ key: 'Content-Type', value: 'application/json', type: 'text' });
    }
    const postmanUrl = parsePostmanUrl(rawUrl, resolvedUrl);
    const rawQuery = parseRawQueryParams(rawUrl);
    if (rawQuery.length) {
      postmanUrl.query = rawQuery;
    }
    const request = {
      method,
      header: headers,
      url: postmanUrl,
      description: operation.summary || (operation.service + '.' + methodName)
    };
    if (isV3 && method !== 'GET') {
      const btinreqWrappedTemplate = Object.assign({
        Btinreq: {
          Canal: '__COL_VAR__channel',
          Usuario: '__COL_VAR__username',
          Device: '__COL_VAR__device',
          Requerimiento: '__COL_VAR__requirement',
          Token: '__COL_VAR__token'
        }
      }, operation.bodyTemplate || {});
      request.body = {
        mode: 'raw',
        raw: buildJsonBodyRaw(btinreqWrappedTemplate, [
          { key: 'channel' }, { key: 'username' }, { key: 'device' }, { key: 'requirement' }, { key: 'token' }
        ].concat(operation.manualInputs || []), function(input) {
          return resolveMappedVariableName(operation, input, scenario);
        }),
        options: { raw: { language: 'json' } }
      };
    } else if (operation.bodyTemplate && method !== 'GET') {
      request.body = {
        mode: 'raw',
        raw: buildJsonBodyRaw(operation.bodyTemplate, operation.manualInputs || [], function(input) {
          return resolveMappedVariableName(operation, input, scenario);
        }),
        options: { raw: { language: 'json' } }
      };
    }
    return {
      name: orderLabel + '. ' + methodName,
      event: [buildPostmanJsonTestScript(operation, collectJsonFilteredSelectorsForItem(operation, scenario))],
      request,
      response: []
    };
  }

  async function buildJsonPostmanCollection(body) {
    const scenarios = getScenarioPayloads(body);
    if (!scenarios.length) {
      throw new Error('Agrega al menos un caso de uso con endpoints antes de generar la collection.');
    }

    const generatedVariables = new Map();
    const mergedOverrides = {};
    const postmanFolders = [];
    const allMappings = [];

    const effectiveApi = Object.assign({}, body.api || {}, {
      BASE_URL: resolveJsonBaseUrl(body),
      SWAGGER_BASE_URL: resolveJsonBaseUrl(body),
      SWAGGER_AUTH_URL: resolveJsonAuthUrl(body),
      SWAGGER_AUTH_KIND: body.swaggerAuthKind || null
    });
    // Igual criterio que executeCollectionFlow: sin una URL de autenticacion
    // resuelta (Swagger sin Session.userLogin/Authenticate detectado, o
    // "Detectar automaticamente" destildado) no se agrega el paso "0.
    // Authenticate" a la collection exportada -- el usuario ya armo su propio
    // login como paso manual del flujo.
    const hasResolvedAuth = String(body.swaggerAuthUrl || '').trim().length > 0;
    scenarios.forEach(function(scenario) {
      const folderItems = hasResolvedAuth ? [buildJsonAuthRequestItem(body.version, effectiveApi)] : [];
      Object.assign(mergedOverrides, scenario.variableOverrides || {});
      scenario.items.forEach(function(item, index) {
        (item.manualInputs || []).forEach(function(input) {
          const variableName = resolveMappedVariableName(item, input, scenario);
          if (variableName === input.key) {
            const seededValue = item && item.inputOverrides && Object.prototype.hasOwnProperty.call(item.inputOverrides, input.key)
              ? item.inputOverrides[input.key]
              : (input.defaultValue || exampleValue(input.type));
            registerVariable(generatedVariables, input.key, seededValue);
          } else {
            allMappings.push({
              scenario: scenario.name,
              target: item.service + '.' + item.method,
              input: input.pathLabel || input.key,
              source: variableName
            });
          }
        });
        Object.assign(mergedOverrides, item.inputOverrides || {});
        (item.outputFields || []).forEach(function(outputField) {
          registerVariable(generatedVariables, buildOutputVarKey(item, outputField), '');
        });
        collectJsonFilteredSelectorsForItem(item, scenario).forEach(function(selector) {
          if (!selector.derivedVarKey) return;
          registerVariable(generatedVariables, selector.derivedVarKey, '');
        });
        Object.assign(mergedOverrides, item.inputOverrides || {});
        folderItems.push(buildJsonRequestItem(item, index + 1, effectiveApi, scenario, body.version));
      });
      Object.keys(scenario.outputAliases || {}).forEach(function(sourceVarKey) {
        mergedOverrides[sourceVarKey] = mergedOverrides[sourceVarKey] || '';
      });
      postmanFolders.push({
        name: scenario.name,
        description: 'Caso de uso generado desde Swagger.',
        item: folderItems
      });
    });

    const collection = {
      info: {
        name: body.collectionName || 'Bantotal JSON Postman',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        description: 'Coleccion generada desde Swagger para flujo JSON/Postman.'
      },
      variable: buildCollectionVariables(body.version, effectiveApi, generatedVariables, mergedOverrides).concat(
        body.version === 'V4' ? [] : [{ key: 'json_auth_url', value: resolveJsonV3AuthUrl(effectiveApi), type: 'string' }]
      ),
      item: postmanFolders,
      _bttoolsMeta: buildBttoolsImportMetadata(scenarios)
    };

    ensureOutputDir();
    const fileName = sanitizeSegment(body.collectionName || postmanFolders[0].name || 'bantotal-json-collection') + '.postman_collection.json';
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf8');

    return {
      fileName,
      filePath,
      collection,
      mappings: allMappings,
      requestCount: postmanFolders.reduce(function(total, folder) {
        return total + ((folder.item || []).length);
      }, 0),
      scenarioCount: postmanFolders.length
    };
  }

  async function authenticateSession(version, api) {
    const isV4 = version === 'V4';
    // "API interna" via REST/Swagger no usa Authenticate/Execute -- ver
    // findInternaAuthOperation y el ejemplo real pegado por el usuario
    // (Session.userLogin, {user,userPassword,jwt} => sessionToken en
    // minuscula). `api` aca es el body completo del execute, por eso se lee
    // swaggerAuthKind (mismo criterio que resolveJsonAuthUrl con swaggerAuthUrl).
    // El esquema decide todo: URL, body, headers y de donde sale el token.
    // Interna y publica comparten el user-login (mismo body, Canal + Device y
    // ningun Token); lo que cambia es el canal y como viaja el token despues.
    const kind = isV4 ? resolveAuthKind(api) : null;
    const authContext = resolveExecutionAuthContext(api);
    const authUrl = version === 'V3'
      ? `${api.API_AUTH_URL}?Execute`
      : resolveJsonAuthUrl(api);
    const body = isV4
      ? btUrls.buildAuthPayload(kind, authContext).body
      : JSON.stringify({
          Btinreq: {
            Canal: authContext.channel,
            Usuario: authContext.username,
            Device: authContext.device,
            Requerimiento: authContext.requirement,
            Token: ''
          },
          UserId: authContext.username,
          UserPassword: authContext.password
        });
    const parsed = new URL(authUrl);
    const mod = parsed.protocol === 'https:' ? require('https') : require('http');
    const raw = await new Promise(function(resolve, reject) {
      // Interna y publica mandan lo mismo (Canal + Device, sin Token): el
      // header Token en el login hace que session conteste 401.
      const btHeaders = isV4 ? btUrls.buildAuthPayload(kind, authContext).headers : {};
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: Object.assign({
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }, btHeaders),
        rejectUnauthorized: false
      };
      const r = mod.request(options, function(res) {
        let s = '';
        res.on('data', function(c) { s += c; });
        res.on('end', function() { resolve(s); });
      });
      r.on('error', reject);
      r.write(body);
      r.end();
    });
    let parsedJson;
    try {
      parsedJson = JSON.parse(raw);
    } catch (e) {
      throw Object.assign(new Error('Respuesta inesperada de auth: ' + raw.slice(0, 200)), { raw });
    }
    // Session.userLogin responde con "sessionToken" en minuscula y errores en
    // BusinessErrors/messages.global, distinto de Authenticate/Execute
    // (SessionToken en mayuscula, error en Btoutreq.Mensaje) -- ver ejemplo
    // real pegado por el usuario.
    const token = isV4 ? btUrls.extractAuthToken(kind, parsedJson) : parsedJson.SessionToken;
    if (!token) {
      // Mismo diagnostico que "Probar autenticacion" (ver describeAuthFailure):
      // el panel de ejecucion muestra este texto y tiene que alcanzar para
      // saber si el problema es la URL, las credenciales o el ambiente.
      const message = describeAuthFailure({
        url: authUrl,
        authKind: kind,
        parsedJson,
        raw,
      });
      throw Object.assign(new Error(message), { raw });
    }
    return { token, raw };
  }

  // ================================================================
  // authenticateSessionSoap
  // ----------------------------------------------------------------
  // Autenticacion REAL por SOAP para V3, usada UNICAMENTE por el flujo
  // "Probar"/"Generar" en formato XML (executeCollectionFlow, rama no-JSON).
  //
  // A proposito NO comparte codigo con `authenticateSession` de arriba:
  // esa otra funcion es JSON y la usan tanto V4 como el intento anterior
  // de V3-por-JSON (?Execute). Mezclarlas hubiera significado que un
  // cambio pensado solo para V3-SOAP pudiera, por accidente, tocar el
  // camino JSON de V4. Mantenerlas separadas es intencional.
  //
  // El sobre SOAP de abajo fue confirmado 2026-07-22 contra un ambiente
  // real (pioneroapp2) por el usuario, capturando el request/response
  // reales de un Authenticate.Execute exitoso via SoapUI/Postman. Si en
  // el futuro este sobre deja de funcionar, hay que volver a pedir un
  // ejemplo real capturado en vez de adivinar el formato.
  // ================================================================
  async function authenticateSessionSoap(api) {
    const authContext = resolveExecutionAuthContext(api);
    const authUrl = String((api && api.API_AUTH_URL) || '').trim();
    if (!authUrl) {
      throw new Error('Falta "URL de autenticacion" en la configuracion del ambiente.');
    }

    // El SOAPAction identifica la operacion ante el servidor; no hace
    // falta ningun sufijo de query string en la URL (ver buildSoapRequestUrl).
    const soapAction = 'http://uy.com.dlya.bantotal/BTSOA/action/AAUTHENTICATE.Execute';

    // Mismo sobre XML que buildAuthRequestItem genera para el Postman
    // exportado (mantenidos deliberadamente identicos en estructura),
    // pero acá con valores reales en vez de variables {{...}} de Postman,
    // porque este es el camino de ejecucion en vivo del propio server.
    const xmlBody = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
      '  <soapenv:Header/>',
      '  <soapenv:Body>',
      '    <bts:Authenticate.Execute>',
      '      <bts:Btinreq>',
      '        <bts:Canal>' + xmlEscape(authContext.channel) + '</bts:Canal>',
      '        <bts:Usuario>' + xmlEscape(authContext.username) + '</bts:Usuario>',
      '        <bts:Device>' + xmlEscape(authContext.device) + '</bts:Device>',
      '        <bts:Requerimiento>' + xmlEscape(authContext.requirement) + '</bts:Requerimiento>',
      '        <bts:Token></bts:Token>',
      '      </bts:Btinreq>',
      '      <bts:UserId>' + xmlEscape(authContext.username) + '</bts:UserId>',
      '      <bts:UserPassword>' + xmlEscape(authContext.password) + '</bts:UserPassword>',
      '    </bts:Authenticate.Execute>',
      '  </soapenv:Body>',
      '</soapenv:Envelope>'
    ].join('\n');

    const response = await invokeSoapXml(authUrl, soapAction, xmlBody);

    let parsed;
    try {
      parsed = await parseSoapXml(response.body);
    } catch (e) {
      throw Object.assign(
        new Error('Respuesta SOAP inesperada de auth: ' + String(response.body || '').slice(0, 300)),
        { raw: response.body }
      );
    }

    const businessError = extractBusinessError(parsed);
    if (businessError) {
      throw Object.assign(new Error(businessError), { raw: response.body });
    }

    const token = findNodeDeep(parsed, 'SessionToken');
    if (!token) {
      throw Object.assign(
        new Error('No se pudo obtener el SessionToken de la respuesta SOAP.'),
        { raw: response.body }
      );
    }

    return { token: String(token), raw: response.body };
  }

  // ================================================================
  // authenticateSessionInternaSoap
  // ----------------------------------------------------------------
  // Autenticacion SOAP para "API interna" (V4): a diferencia de la
  // publica/V3, NO es Authenticate.Execute sino Session.userLogin, contra
  // un servlet propio (ardwsbt_Session, sin el sufijo "_v1" que si tiene
  // Authenticate). Cuelga del mismo Core ya configurado (api.API_BASE_URL,
  // "URL de la API") -- este camino no usa "URL de autenticacion" en
  // absoluto, esa es especifica de la API publica.
  //
  // Sobre confirmado 2026-08-13 contra un ambiente real (respuesta real
  // capturada por el usuario, Estado=OK): Session.userLogin con un Btinreq
  // (Canal/Usuario/Device/Requerimiento/Token) igual que Authenticate, mas
  // user/userPassword (mismas credenciales que API_USER/API_PASSWORD), mas
  // un campo "jwt" adicional -- y CONFIRMADO que Btinreq.Token y "jwt" van
  // vacios en el login sin que el ambiente real lo rechace (no hay sesion
  // todavia, no hay otro valor real para poner ahi).
  //
  // La respuesta trae el token de sesion en "sessionToken" (misma
  // convencion que Authenticate.Execute) -- NO en un campo "jwt" como se
  // penso originalmente antes de ver una respuesta real; "jwt" solo
  // describia el TIPO de token, no el nombre del tag XML.
  // ================================================================
  async function authenticateSessionInternaSoap(api) {
    const authContext = resolveExecutionAuthContext(api);
    const coreBaseUrl = String((api && api.API_BASE_URL) || '').trim().replace(/\/+$/g, '');
    if (!coreBaseUrl) {
      throw new Error('Falta "URL de la API" (Core) en la configuracion del ambiente.');
    }
    const authUrl = coreBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Session';
    const soapAction = 'http://uy.com.dlya.bantotal/BTSOA/action/ASESSION.userLogin';

    const xmlBody = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bts="http://uy.com.dlya.bantotal/BTSOA/">',
      '  <soapenv:Header/>',
      '  <soapenv:Body>',
      '    <bts:Session.userLogin>',
      '      <bts:Btinreq>',
      '        <bts:Canal>' + xmlEscape(authContext.channel) + '</bts:Canal>',
      '        <bts:Usuario>' + xmlEscape(authContext.username) + '</bts:Usuario>',
      '        <bts:Device>' + xmlEscape(authContext.device) + '</bts:Device>',
      '        <bts:Requerimiento>' + xmlEscape(authContext.requirement) + '</bts:Requerimiento>',
      '        <bts:Token></bts:Token>',
      '      </bts:Btinreq>',
      '      <bts:user>' + xmlEscape(authContext.username) + '</bts:user>',
      '      <bts:userPassword>' + xmlEscape(authContext.password) + '</bts:userPassword>',
      '      <bts:jwt></bts:jwt>',
      '    </bts:Session.userLogin>',
      '  </soapenv:Body>',
      '</soapenv:Envelope>'
    ].join('\n');

    const response = await invokeSoapXml(authUrl, soapAction, xmlBody);

    let parsed;
    try {
      parsed = await parseSoapXml(response.body);
    } catch (e) {
      throw Object.assign(
        new Error('Respuesta SOAP inesperada de Session.userLogin: ' + String(response.body || '').slice(0, 300)),
        { raw: response.body }
      );
    }

    const businessError = extractBusinessError(parsed);
    if (businessError) {
      throw Object.assign(new Error(businessError), { raw: response.body });
    }

    // Confirmado 2026-08-13 contra un ambiente real: el campo se llama
    // "sessionToken" (igual convencion que Authenticate.Execute), no "jwt"
    // -- "jwt" describia el TIPO de token, no el nombre del tag XML.
    const token = findNodeDeep(parsed, 'sessionToken') || findNodeDeep(parsed, 'SessionToken');
    if (!token) {
      throw Object.assign(
        new Error('No se pudo obtener el sessionToken de la respuesta de Session.userLogin.'),
        { raw: response.body }
      );
    }

    return { token: String(token), raw: response.body };
  }

  async function invokeSoapXml(url, soapAction, xmlBody) {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? require('https') : require('http');
    return new Promise(function(resolve, reject) {
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(xmlBody),
          'SOAPAction': soapAction
        },
        rejectUnauthorized: false
      };
      const r = mod.request(options, function(res) {
        let s = '';
        res.on('data', function(c) { s += c; });
        res.on('end', function() { resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: s }); });
      });
      r.on('error', reject);
      r.write(xmlBody);
      r.end();
    });
  }

  async function parseSoapXml(xmlText) {
    const xml2js = loadXml2js();
    return xml2js.parseStringPromise(xmlText, {
      explicitArray: false,
      trim: true,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    });
  }

  function findNodeDeep(node, key) {
    if (!node || typeof node !== 'object') return null;
    if (Object.prototype.hasOwnProperty.call(node, key)) return node[key];
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const found = findNodeDeep(node[keys[i]], key);
      if (found !== null && found !== undefined) return found;
    }
    return null;
  }

  function extractBusinessError(parsed) {
    const errors = findNodeDeep(parsed, 'BusinessErrors');
    if (!errors) return '';
    if (typeof errors === 'object' && errors !== null) {
      const keys = Object.keys(errors).filter(function(key) { return key !== '$'; });
      if (!keys.length) return '';
    }
    const error = errors.businessError || errors.BusinessError || errors;
    if (typeof error === 'object' && error !== null) {
      const keys = Object.keys(error).filter(function(key) { return key !== '$'; });
      if (!keys.length) return '';
    }
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      return error.message || error.Mensaje || JSON.stringify(error).slice(0, 300);
    }
    return '';
  }

  /**
   * Detecta errores de negocio en una respuesta JSON (contrato REST real:
   * campo "businessErrors" en el nivel superior del body, array de
   * {Code,Description,Severity,Target} — confirmado contra el catalogo
   * Swagger real). A diferencia de extractBusinessError (XML/SOAP), esto
   * NO decide pass/fail: el HTTP 2xx sigue significando que el paso avanza
   * (ver step.ok mas abajo); esto solo marca que ademas hubo un aviso de
   * negocio, para distinguirlo visualmente de un 200 realmente limpio.
   */
  function extractJsonBusinessErrors(parsed) {
    const list = (parsed && Array.isArray(parsed.businessErrors)) ? parsed.businessErrors
      : (parsed && Array.isArray(parsed.BusinessErrors)) ? parsed.BusinessErrors : null;
    if (!list || !list.length) return null;
    return list.map(function(entry) {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object') {
        return String(entry.Description || entry.description || entry.Code || entry.code || 'Error de negocio');
      }
      return 'Error de negocio';
    });
  }

  function extractOutputValues(schema, parsed) {
    const values = {};
    getExportableOutputs(schema).forEach(function(param) {
      const found = findNodeDeep(parsed, param.name);
      if (found !== null && found !== undefined && typeof found !== 'object') {
        values[param.name] = String(found);
      }
    });
    return values;
  }

  function summarizeVariables(values) {
    const summary = {};
    Object.keys(values || {}).forEach(function(key) {
      const value = values[key];
      if (value == null) return;
      if (typeof value === 'object') return;
      const text = String(value);
      if (!text.trim()) return;
      summary[key] = text.length > 180 ? text.slice(0, 180) + '...' : text;
    });
    return summary;
  }

  async function executeCollectionFlow(body) {
    if (body.format === 'json') {
      const authContext = resolveExecutionAuthContext(body);
      const steps = [];
      const runtimeValues = Object.assign({}, body.variableOverrides || {}, {
        channel: authContext.channel,
        username: authContext.username,
        device: authContext.device,
        requirement: authContext.requirement
      });
      // Sin una URL de autenticacion resuelta (Swagger sin Session.userLogin/
      // Authenticate detectado, o "Detectar automaticamente" destildado) no
      // se agrega ningun paso de autenticacion automatico -- el usuario arma
      // su propio login como paso manual del flujo (ver catalogo) y le pasa
      // el token a los siguientes pasos via "Origen del valor".
      if (String(body.swaggerAuthUrl || '').trim()) {
        const authStep = {
          index: 0,
          name: 'Authenticate',
          ok: false,
          requestUrl: resolveJsonAuthUrl(body)
        };
        try {
          const auth = await authenticateSession(body.version, body);
          runtimeValues.token = auth.token;
          authStep.ok = true;
          authStep.responseStatus = 200;
          authStep.extractedValues = { token: auth.token };
          authStep.responseXml = auth.raw;
        } catch (e) {
          authStep.error = e.message || 'No se pudo autenticar contra el ambiente.';
          if (e.raw) authStep.responseXml = e.raw;
          steps.push(authStep);
          throw Object.assign(new Error(authStep.error), { steps, runtimeValues });
        }
        steps.push(authStep);
      }

      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        const step = {
          index: steps.length,
          name: item.method || item.path || ('Paso ' + (steps.length))
        };
        try {
          const stepRuntimeValues = mergeExecutionStepValues(runtimeValues, item.inputOverrides || {});
          (item.manualInputs || []).forEach(function(input) {
            const hasItemOverride = item.inputOverrides && Object.prototype.hasOwnProperty.call(item.inputOverrides, input.key);
            if (hasItemOverride) {
              stepRuntimeValues[input.key] = item.inputOverrides[input.key];
              return;
            }
            const mappedVar = resolveMappedVariableName(item, input, body);
            if (mappedVar !== input.key && Object.prototype.hasOwnProperty.call(stepRuntimeValues, mappedVar)) {
              stepRuntimeValues[input.key] = stepRuntimeValues[mappedVar];
            } else if (!Object.prototype.hasOwnProperty.call(stepRuntimeValues, input.key) && input.defaultValue != null) {
              stepRuntimeValues[input.key] = input.defaultValue;
            }
          });
          // Si el item viene de un swagger puntual (ver extractSwaggerOperations),
          // su propia sourceBaseUrl manda por sobre la base global del
          // ambiente -- necesario cuando hay varios swaggers (uno por
          // microservicio) con hosts distintos entre si.
          const stepBaseUrl = item.sourceBaseUrl || resolveJsonBaseUrl(body);
          const requestUrl = buildJsonExecutionUrl(stepBaseUrl, item.path, item.manualInputs || [], stepRuntimeValues);
          const isV3 = body.version === 'V3';
          const filledBodyValue = item.bodyTemplate ? fillJsonTemplate(item.bodyTemplate, stepRuntimeValues) : null;
          // Si el grupo de este item (su sourceBaseUrl) tiene una "Fuente de
          // token" configurada (ver CollectionTokenSourceManager), y esa
          // salida ya se resolvio en algun paso anterior de este mismo
          // flujo, manda sobre el token global de Authenticate -- necesario
          // cuando distintos swaggers/microservicios se autentican con
          // tokens distintos. Sin override (o si el paso fuente todavia no
          // corrio), sigue usando el token global de siempre.
          const groupTokenKey = (body.tokenSources || {})[item.sourceBaseUrl || ''];
          const effectiveToken = (groupTokenKey && Object.prototype.hasOwnProperty.call(stepRuntimeValues, groupTokenKey))
            ? stepRuntimeValues[groupTokenKey]
            : stepRuntimeValues.token;
          // V3 manda Canal/Usuario/Device/Requerimiento/Token dentro del body (Btinreq),
          // no como headers custom (ver authenticateSession, que ya hace lo mismo para el auth).
          const headers = isV3 ? {} : buildBantotalJsonHeaders({
            channel: stepRuntimeValues.channel,
            username: stepRuntimeValues.username,
            device: stepRuntimeValues.device,
            requirement: stepRuntimeValues.requirement
          }, effectiveToken, resolveAuthKind(body));
          const bodyValue = isV3
            ? Object.assign({
                Btinreq: {
                  Canal: stepRuntimeValues.channel,
                  Usuario: stepRuntimeValues.username,
                  Device: stepRuntimeValues.device,
                  Requerimiento: stepRuntimeValues.requirement,
                  Token: effectiveToken
                }
              }, filledBodyValue || {})
            : filledBodyValue;
          Object.assign(runtimeValues, stepRuntimeValues);
          const response = await invokeJsonRequest(requestUrl, item.httpMethod, headers, bodyValue);
          step.requestUrl = requestUrl;
          step.responseStatus = response.statusCode;
          step.requestXml = bodyValue == null ? '' : JSON.stringify(bodyValue, null, 2);
          step.responseXml = response.body;
          let parsed = null;
          try { parsed = response.body ? JSON.parse(response.body) : null; } catch (_) {}
          if (parsed) {
            step.businessWarning = extractJsonBusinessErrors(parsed);
            const extracted = Object.assign({}, extractJsonOutputValues(parsed), extractConfiguredJsonOutputValues(item, parsed));
            collectJsonFilteredSelectorsForItem(item, body).forEach(function(selector) {
              const filteredValue = extractFilteredJsonOutputValue(parsed, selector.pathLabel, selector.filterField, selector.filterValue);
              if (filteredValue !== undefined && filteredValue !== null && typeof filteredValue !== 'object') {
                extracted[selector.derivedVarKey] = String(filteredValue);
              }
            });
            Object.keys(extracted).forEach(function(key) {
              if (!Object.prototype.hasOwnProperty.call(runtimeValues, key)) runtimeValues[key] = extracted[key];
              else runtimeValues[key] = extracted[key];
            });
            step.extractedValues = extracted;
          } else {
            step.extractedValues = {};
          }
          step.ok = response.statusCode >= 200 && response.statusCode < 300;
          if (!step.ok) {
            step.error = response.body || ('HTTP ' + response.statusCode);
            steps.push(step);
            throw Object.assign(new Error(step.error), { steps, runtimeValues });
          }
        } catch (e) {
          if (!step.error) step.error = e.message || 'Error inesperado en la ejecucion JSON.';
          step.ok = false;
          steps.push(step);
          throw Object.assign(new Error(step.error), { steps, runtimeValues });
        }
        steps.push(step);
      }

      recordSuccessfulValues(body, summarizeVariables(runtimeValues));
      return { ok: true, steps, runtimeValues: summarizeVariables(runtimeValues) };
    }

    // Esta rama es el flujo SOAP/XML: V3 siempre, y V4 cuando el ambiente es
    // "API interna" (ver isPathSupported en collection-studio-manager.js).
    // La autenticacion real difiere entre ambos: V3/API publica llaman
    // Authenticate.Execute; "API interna" llama Session.userLogin (ver
    // authenticateSessionInternaSoap) -- nunca los dos a la vez.
    const isInterna = body.apiMode === 'interna';
    const schemas = await loadSchemasForItems(body);
    const bindingsInfo = computeBindingsAndMappings(schemas);
    const steps = [isInterna ? {
      index: 0,
      name: 'Session.userLogin',
      ok: false,
      // No hay fallback por _v1 aca: "API interna" no lo usa (ver
      // soapServletSuffix) y este camino no depende de "URL de autenticacion".
      requestUrl: String(body.api.API_BASE_URL || '').replace(/\/+$/g, '') + '/servlet/com.dlya.bantotal.ardwsbt_Session'
    } : {
      index: 0,
      name: 'Authenticate',
      ok: false,
      // Fallback defensivo con _v1 (normalmente body.api.API_AUTH_URL ya viene
      // completo desde el wizard): solo afecta el texto mostrado en el panel
      // de ejecucion, no la URL que realmente se llama (ver authenticateSessionSoap).
      requestUrl: body.api.API_AUTH_URL || (String(body.api.API_BASE_URL || '').replace(/\/+$/g, '') + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate_v1')
    }];
    const runtimeValues = Object.assign({}, body.variableOverrides || {}, {
      channel: body.api.API_CANAL || 'BTDIGITAL',
      username: body.api.API_USER || 'INSTALADOR',
      device: body.api.API_DEVICE || 'INSTALADOR',
      requirement: body.api.API_REQUERIMIENTO || '1'
    });
    try {
      const auth = isInterna
        ? await authenticateSessionInternaSoap(body.api)
        : await authenticateSessionSoap(body.api);
      runtimeValues.token = auth.token;
      steps[0].ok = true;
      steps[0].responseStatus = 200;
      steps[0].extractedValues = { token: auth.token };
      if (auth.raw) steps[0].responseXml = auth.raw;
    } catch (e) {
      steps[0].error = e.message || 'No se pudo autenticar contra el ambiente.';
      if (e.raw) steps[0].responseXml = e.raw;
      throw Object.assign(new Error(steps[0].error), { steps, runtimeValues });
    }

    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      // body.items[i] es el mismo item que ya vio el inspector (manualInputs/
      // operationKey/outputFields reales); `schema` es solo la estructura
      // recien consultada para saber que campos/SDTs armar. `body` hace de
      // "scenario" aca (trae body.inputMappings), igual que ya hace la rama
      // JSON de mas arriba con collectJsonFilteredSelectorsForItem(item, body).
      const item = body.items[i];
      const step = {
        index: i + 1,
        name: schema.service + '.' + schema.method
      };
      try {
        const state = {
          mode: 'execution',
          bindings: bindingsInfo.bindingsPerStep[i] || {},
          runtimeValues,
          variables: new Map(),
          repeatableOverrides: body.repeatableOverrides || {},
          item: item,
          scenario: body,
          manualInputsByPath: buildManualInputsByPath(item)
        };
        step.requestUrl = buildSoapRequestUrl(body.api, schema, body.apiMode);
        step.soapAction = buildSoapAction(schema);
        step.requestXml = buildSoapRequestXml(schema, state);
        const response = await invokeSoapXml(step.requestUrl, step.soapAction, step.requestXml);
        step.responseStatus = response.statusCode;
        step.responseXml = response.body;

        const parsed = await parseSoapXml(response.body);
        const businessError = extractBusinessError(parsed);
        // extractOutputValues registra por nombre de campo pelado (auto-match
        // historico); extractSoapOutputValues registra ADEMAS bajo la clave
        // calificada (buildOutputVarKey) que resolveMappedVariableName
        // realmente busca cuando hay un mapeo configurado. Ambas se mezclan
        // en runtimeValues — ningun caso que ya funcionara pierde cobertura.
        const extracted = Object.assign({}, extractOutputValues(schema, parsed), extractSoapOutputValues(item, parsed));
        Object.keys(extracted).forEach(function(key) { runtimeValues[key] = extracted[key]; });

        step.extractedValues = extracted;
        step.ok = response.statusCode >= 200 && response.statusCode < 300 && !businessError;

        if (businessError) {
          step.error = businessError;
          steps.push(step);
          throw Object.assign(new Error(businessError), { steps, runtimeValues });
        }
      } catch (e) {
        if (!step.error) {
          const responseSnippet = step.responseXml
            ? step.responseXml.replace(/\s+/g, ' ').trim().slice(0, 240)
            : '';
          step.error = e.message || responseSnippet || 'Error inesperado en la ejecucion SOAP.';
        }
        step.ok = false;
        if (!step.responseXml && e.responseXml) step.responseXml = e.responseXml;
        if (!step.requestXml && e.requestXml) step.requestXml = e.requestXml;
        steps.push(step);
        throw Object.assign(new Error(step.error), { steps, runtimeValues });
      }
      steps.push(step);
    }

    recordSuccessfulValues(body, summarizeVariables(runtimeValues));
    return { ok: true, steps, runtimeValues: summarizeVariables(runtimeValues) };
  }

  async function handleApi(req, res, helpers) {
    const json = helpers.json;
    const readBody = helpers.readBody;

    if (req.method === 'GET' && req.url === '/api/collection/panel') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(panelHtml);
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/swagger/load') {
      try {
        const body = await readBody(req);
        // Un ambiente real puede tener varios swaggers (un microservicio por
        // puerto -- publicapi/term-deposit/loan/customer/etc, cada uno con su
        // propio host) en vez de un unico gateway. Se acepta una lista;
        // swaggerUrl (singular) sigue andando igual que siempre para no
        // romper el camino de un solo swagger ya probado.
        const requestedUrls = Array.isArray(body.swaggerUrls) && body.swaggerUrls.length
          ? body.swaggerUrls
          : [body.swaggerUrl];
        let swaggerUrls = requestedUrls.map(function(url) { return String(url || '').trim(); }).filter(Boolean);

        // Dejar el campo Swagger vacio es un caso valido y ya funcionaba
        // antes de que esto aceptara una lista: significa "descubrilo a
        // partir de la URL base del ambiente" (api.BASE_URL). El filter de
        // arriba lo dejaba en cero y se cortaba antes de intentarlo. Se
        // conserva ese camino con un unico item vacio, que es lo que
        // buildSwaggerCandidateUrls interpreta como autodescubrir.
        const autodescubrir = !swaggerUrls.length;
        if (autodescubrir) {
          if (!String((body.api && body.api.BASE_URL) || '').trim()) {
            json(200, {
              ok: false,
              message: 'Indica la ruta del Swagger, o configura la URL base del ambiente en el paso anterior para descubrirlo solo.'
            });
            return true;
          }
          swaggerUrls = [''];
        }

        const operationsByService = {};
        const sources = [];
        const failedSources = [];

        // Se leen una por una (no en paralelo) y se toleran fallos puntuales
        // -- si un microservicio esta caido no tiene por que tirar abajo la
        // carga de los otros 8.
        for (const swaggerUrl of swaggerUrls) {
          try {
            // El fallback a api.BASE_URL solo cuando NO hay URL explicita.
            // Con varias fuentes, dejarlo prendido hacia que un microservicio
            // caido resolviera al swagger principal y duplicara todas sus
            // operaciones en el catalogo fusionado.
            const loaded = await loadSwaggerDocument(swaggerUrl, body.api || {}, {
              incluirFallbackDeBaseUrl: autodescubrir,
            });
            const baseUrl = resolveSwaggerServerUrl(loaded.doc, loaded.resolvedUrl);
            const authUrl = resolveSwaggerAuthUrl(loaded.doc, loaded.resolvedUrl, baseUrl, body.api);
            const opsForThisSource = extractSwaggerOperations(loaded.doc, baseUrl);
            Object.keys(opsForThisSource).forEach(function(service) {
              if (!operationsByService[service]) operationsByService[service] = [];
              operationsByService[service] = operationsByService[service].concat(opsForThisSource[service]);
            });
            sources.push({ swaggerUrl, resolvedUrl: loaded.resolvedUrl, baseUrl, authUrl });
          } catch (e) {
            failedSources.push({ swaggerUrl, message: e.message });
          }
        }

        if (!sources.length) {
          json(200, {
            ok: false,
            message: 'No se pudo leer ningun swagger: ' + failedSources.map(function(f) { return f.swaggerUrl + ' (' + f.message + ')'; }).join(' | ')
          });
          return true;
        }

        const services = Object.keys(operationsByService).sort();

        // Autenticacion: "API publica" siempre usa Authenticate/Execute (sin
        // cambios). "API interna" expone Session.userLogin en su lugar -- se
        // busca en el catalogo recien fusionado (ver findInternaAuthOperation).
        // El check "Detectar automaticamente" (autoDetectAuth) permite
        // saltear esto por completo cuando la deteccion le pega mal a un
        // ambiente puntual -- ahi el usuario ajusta la autenticacion a mano
        // en la collection generada.
        const autoDetectAuth = body.autoDetectAuth !== false;
        let authUrl = '';
        let authKind = null;
        let authWarning = '';
        if (autoDetectAuth) {
          if (body.apiMode === 'interna') {
            const foundAuth = findInternaAuthOperation(operationsByService);
            if (foundAuth) {
              authUrl = joinSwaggerBaseAndPath(foundAuth.baseUrl, foundAuth.path);
              authKind = foundAuth.kind;
            } else {
              authWarning = 'No se encontro Session.userLogin ni Authenticate/Execute en los swaggers cargados para "API interna". Configura la autenticacion manualmente en la collection generada.';
            }
          } else {
            // API publica: el default es el user-login de session. Solo se
            // usa Authenticate/Execute si el swagger lo declara y no declara
            // user-login (ambiente sin migrar).
            const foundAuth = findPublicaAuthOperation(operationsByService);
            if (foundAuth && foundAuth.kind === btUrls.KIND_AUTHENTICATE) {
              authUrl = joinSwaggerBaseAndPath(foundAuth.baseUrl, foundAuth.path);
              authKind = btUrls.KIND_AUTHENTICATE;
            } else if (foundAuth) {
              authUrl = joinSwaggerBaseAndPath(foundAuth.baseUrl, foundAuth.path);
              authKind = btUrls.KIND_SESSION_PUBLICA;
            } else {
              // Ningun swagger declara el login (es comun: session suele
              // vivir en otro swagger que no se cargo). Se arma la URL del
              // user-login contra la raiz del ambiente y, si ese ambiente no
              // lo tiene, "Probar autenticacion" degrada solo al Authenticate
              // viejo (ver authCandidates en setup.js).
              authUrl = btUrls.resolveSessionLoginUrl(body.api || {}) || sources[0].authUrl;
              authKind = btUrls.KIND_SESSION_PUBLICA;
            }
          }
        }

        json(200, {
          ok: true,
          // Compatibilidad con el camino de un solo swagger (ya probado):
          // resolvedUrl/baseUrl quedan resueltos contra la PRIMERA fuente que
          // respondio bien. Con varias fuentes ya no representan "la" base
          // unica del ambiente -- cada operacion trae la suya propia en
          // sourceBaseUrl (ver extractSwaggerOperations).
          resolvedUrl: sources[0].resolvedUrl,
          baseUrl: sources[0].baseUrl,
          authUrl,
          authKind,
          authWarning,
          sources,
          failedSources,
          services,
          operationsByService
        });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/database/load') {
      try {
        const body = await readBody(req);
        const loaded = await buildDatabaseOperations(body.platform, body.db, body.version, body.apiMode, body.format);
        const sourceTables = body.apiMode === 'interna' ? 'BTCBS014/BTCBS019' : 'BTI014/BTI019';
        json(200, {
          ok: true,
          services: loaded.services,
          operationsByService: loaded.operationsByService,
          source: 'database',
          warning: 'Los endpoints y bodies se inferieron desde ' + sourceTables + '. Si el ambiente JSON difiere del convenio estandar, puede requerir ajustes manuales.'
        });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/database/operation') {
      try {
        const body = await readBody(req);
        const operation = await buildDatabaseOperationDetails(body.platform, body.db, body.service, body.method, body.version, body.apiMode, body.format);
        json(200, { ok: true, operation });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/generate') {
      try {
        const body = await readBody(req);
        if (body.target !== 'postman') {
          json(200, { ok: false, message: 'Por ahora el destino disponible es Postman.' });
          return true;
        }
        if (!body.version || !body.api) {
          json(200, { ok: false, message: 'Faltan datos de configuracion para generar la collection.' });
          return true;
        }
        const hasScenarioItems = Array.isArray(body.scenarios) && body.scenarios.some(function(scenario) {
          return Array.isArray(scenario.items) && scenario.items.length > 0;
        });
        const hasLegacyItems = Array.isArray(body.items) && body.items.length > 0;
        if (!hasScenarioItems && !hasLegacyItems) {
          json(200, { ok: false, message: 'Selecciona al menos un metodo para generar la collection.' });
          return true;
        }

        let result;
        if (body.format === 'json') {
          const resolution = resolveCollectionRequestData(body, { mode: 'collection-generation' });
          const resolvedBody = Object.assign({}, body, {
            scenarios: resolution.scenarios
          });
          result = await buildJsonPostmanCollection(resolvedBody);
          result.resolutionSummary = resolution.summary;
          result.resolutionWarnings = resolution.warnings;
        } else if (body.format === 'xml') {
          if (!body.platform || !body.db) {
            json(200, { ok: false, message: 'Faltan datos de base para generar la collection XML.' });
            return true;
          }
          result = await buildXmlPostmanCollection(body);
        } else {
          json(200, { ok: false, message: 'Formato no soportado para la generacion.' });
          return true;
        }
        json(200, {
          ok: true,
          fileName: result.fileName,
          downloadUrl: '/api/collection/artifact?file=' + encodeURIComponent(result.fileName),
          mappings: result.mappings,
          requestCount: result.requestCount,
          scenarioCount: result.scenarioCount,
          resolutionSummary: result.resolutionSummary || null,
          resolutionWarnings: result.resolutionWarnings || []
        });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/suggest-chain') {
      try {
        const body = await readBody(req);
        const result = suggestChains(body);
        if (!result.ok) {
          json(200, { ok: false, message: result.message });
          return true;
        }
        json(200, { ok: true, suggestions: result.suggestions });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/fill-data') {
      try {
        const body = await readBody(req);
        const hasScenarioItems = Array.isArray(body.scenarios) && body.scenarios.some(function(scenario) {
          return Array.isArray(scenario.items) && scenario.items.length > 0;
        });
        const hasLegacyItems = Array.isArray(body.items) && body.items.length > 0;
        if (!hasScenarioItems && !hasLegacyItems) {
          json(200, { ok: false, message: 'Agrega al menos un metodo antes de rellenar datos.' });
          return true;
        }

        const resolution = resolveCollectionRequestData(body, { mode: 'preview' });
        json(200, {
          ok: true,
          scenarios: resolution.scenarios,
          summary: resolution.summary,
          warnings: resolution.warnings,
          linkedFields: resolution.linkedFields,
          generatedFields: resolution.generatedFields,
          unresolvedFields: resolution.unresolvedFields
        });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }
    if (req.method === 'POST' && req.url === '/api/collection/record-success') {
      try {
        const body = await readBody(req);
        if (!body.version || !body.platform || !body.db || !body.api) {
          json(200, { ok: false, message: 'Faltan datos de ambiente para registrar valores exitosos.' });
          return true;
        }
        recordSuccessfulValues(body, body.values || {});
        json(200, { ok: true });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/preview') {
      try {
        const body = await readBody(req);
        if (!body.platform || !body.db) {
          json(200, { ok: false, message: 'Faltan datos de base para preparar la preview.' });
          return true;
        }
        if (!Array.isArray(body.items) || body.items.length === 0) {
          json(200, { ok: true, variables: [], mappings: [] });
          return true;
        }

        const preview = await buildCollectionPreview(body);
        json(200, { ok: true, variables: preview.variables, mappings: preview.mappings });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/execute') {
      try {
        const body = await readBody(req);
        if (!Array.isArray(body.items) || body.items.length === 0) {
          json(200, { ok: false, message: 'Agrega al menos un metodo antes de ejecutar.' });
          return true;
        }
        if (body.format === 'json') {
          if (!body.version || !body.api) {
            json(200, { ok: false, message: 'Faltan datos de ambiente para ejecutar el flujo.' });
            return true;
          }
        } else {
          if (!body.version || !body.platform || !body.db || !body.api) {
            json(200, { ok: false, message: 'Faltan datos de ambiente para ejecutar el flujo.' });
            return true;
          }
        }
        const result = await executeCollectionFlow(body);
        json(200, result);
      } catch (e) {
        json(200, {
          ok: false,
          message: e.message,
          steps: e.steps || [],
          runtimeValues: summarizeVariables(e.runtimeValues || {})
        });
      }
      return true;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/collection/artifact?')) {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const fileName = parsed.searchParams.get('file') || '';
        const filePath = path.join(outputDir, path.basename(fileName));
        if (!filePath.startsWith(outputDir) || !fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end();
          return true;
        }
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': 'attachment; filename="' + path.basename(filePath) + '"'
        });
        res.end(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
      return true;
    }

    return false;
  }

  return {
    panelHtml,
    handleApi
  };
}

module.exports = { createCollectionFeature };



