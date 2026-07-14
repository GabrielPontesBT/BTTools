'use strict';

const fs = require('fs');
const path = require('path');
const { resolveCollectionRequestData } = require('./request-data-resolver');

function loadAsset(fileName) {
  return fs.readFileSync(path.join(__dirname, fileName), 'utf8');
}

function createCollectionFeature(deps) {
  const ROOT = deps.ROOT;
  const queryServices = deps.queryServices;
  const queryMethods = deps.queryMethods;
  const queryMethodSchema = deps.queryMethodSchema;

  const styles = loadAsset('styles.css');
  const panelHtml = loadAsset('panel.html');
  const clientScript = loadAsset('client-shared.js');
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

  function resolveV4AuthUrl(api) {
    const publicBaseUrl = String(api.BASE_URL || '').replace(/\/+$/g, '');
    const apiBaseUrl = String(api.API_BASE_URL || '').replace(/\/+$/g, '');
    if (publicBaseUrl) return publicBaseUrl + '/Authenticate/v1/Execute';
    if (apiBaseUrl) {
      const normalized = apiBaseUrl.replace(/\/api\/publicapi$/i, '');
      return normalized + '/api/publicapi/Authenticate/v1/Execute';
    }
    return '/Authenticate/v1/Execute';
  }

  function resolveSwaggerServerUrl(doc, resolvedUrl) {
    const fallbackUrl = String(resolvedUrl || '').trim();
    const fallback = fallbackUrl ? new URL(fallbackUrl) : null;
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

  function resolveSwaggerAuthUrl(doc, resolvedUrl, baseUrl) {
    const paths = doc && doc.paths ? doc.paths : {};
    const authPath = Object.keys(paths).find(function(pathName) {
      return /\/Authenticate\/v\d+\/Execute$/i.test(String(pathName || ''));
    });
    if (authPath) {
      return joinSwaggerBaseAndPath(baseUrl || '', authPath);
    }
    return joinSwaggerBaseAndPath(baseUrl || '', '/Authenticate/v1/Execute');
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

  function resolveJsonAuthUrl(config) {
    const explicit = String((config && config.swaggerAuthUrl) || '').trim();
    if (explicit) return explicit;
    const api = config && config.api ? config.api : (config || {});
    const swaggerAuthUrl = String((api && api.SWAGGER_AUTH_URL) || '').trim();
    if (swaggerAuthUrl) return swaggerAuthUrl;
    return resolveV4AuthUrl(api);
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
        location: mode.location || 'body'
      });
    }

      if (isDbCollectionField(field) && field.sdtType) {
        const sdtFields = sdtMap[String(field.sdtType).trim()] || [];
        return [
          sdtFields.reduce(function buildCollectionItem(accumulator, childField) {
            accumulator[String(childField.name).trim()] = buildDbFieldTemplate(childField, sdtMap, pathTrail.concat(fieldName), manualInputs, mode);
            return accumulator;
          }, {})
        ];
      }

      if (isDbComplexField(field) && field.sdtType) {
        const sdtFields = sdtMap[String(field.sdtType).trim()] || [];
        return sdtFields.reduce(function buildComplexObject(accumulator, childField) {
          accumulator[String(childField.name).trim()] = buildDbFieldTemplate(childField, sdtMap, pathTrail.concat(fieldName), manualInputs, mode);
          return accumulator;
        }, {});
    }

    return '{{' + inputKey + '}}';
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

  async function buildDatabaseOperations(platform, db, version) {
    if (typeof queryServices !== 'function' || typeof queryMethods !== 'function' || typeof queryMethodSchema !== 'function') {
      throw new Error('El origen Base de datos no esta disponible en esta version del servidor.');
    }

    const services = await queryServices(platform, db);
    const operationsByService = {};

    for (const service of services) {
      const methods = await queryMethods(platform, db, service);
      operationsByService[service] = [];

      for (const methodName of methods) {
        const httpMethod = inferHttpMethodFromMethodName(methodName);
        const servicePathName = normalizeDatabaseServicePathName(service);
        operationsByService[service].push({
          operationKey: 'DB ' + service + '.' + methodName,
          service,
          methodName,
          httpMethod,
          path: '/public/' + servicePathName + '/v1/' + String(methodName || '').trim(),
          summary: 'Metodo cargado desde BTI014/BTI019.',
          manualInputs: [],
          bodyTemplate: null,
          outputFields: [],
          needsHydration: true
        });
      }
    }

    return {
      services: services || [],
      operationsByService
    };
  }

  async function buildDatabaseOperationDetails(platform, db, service, methodName) {
    if (typeof queryMethodSchema !== 'function') {
      throw new Error('No se pudo resolver el schema del metodo desde Base de datos.');
    }

    const schema = await queryMethodSchema(platform, db, service, methodName);
    const httpMethod = inferHttpMethodFromMethodName(methodName);
    const servicePathName = normalizeDatabaseServicePathName(service);
    const sdtMap = buildDbSdtMap(schema);
    const outputFields = [];
    const scalarManualInputs = [];

    (schema && Array.isArray(schema.inputs) ? schema.inputs : []).forEach(function appendInput(input) {
      if (isReservedAuthInput(input.name)) return;

      if (String(httpMethod).toUpperCase() === 'GET' || String(httpMethod).toUpperCase() === 'DELETE') {
        scalarManualInputs.push({
          key: sanitizeVariableKey(input.name),
          pathLabel: String(input.name || '').trim(),
          type: buildDbTypeLabel(input.type),
          description: input && input.description ? String(input.description) : '',
          defaultValue: exampleValue(buildDbTypeLabel(input.type)),
          location: 'query'
        });
      }
    });

    const bodyData = buildDbBodyTemplate(schema, httpMethod);
    collectDbOutputFields(schema && Array.isArray(schema.outputs) ? schema.outputs : [], sdtMap, [], outputFields);

    return {
      operationKey: 'DB ' + service + '.' + methodName,
      service,
      methodName,
      httpMethod,
      path: '/public/' + servicePathName + '/v1/' + String(methodName || '').trim(),
      summary: (schema && schema.description) || 'Metodo cargado desde BTI014/BTI019.',
      manualInputs: scalarManualInputs.concat(bodyData && Array.isArray(bodyData.manualInputs) ? bodyData.manualInputs : []),
      bodyTemplate: bodyData ? bodyData.template : null,
      outputFields,
      needsHydration: false
    };
  }

  function buildSwaggerCandidateUrls(rawUrl, api) {
    const trimmed = String(rawUrl || '').trim();
    const candidates = [];
    const push = function(url) {
      const clean = String(url || '').trim();
      if (!clean || candidates.includes(clean)) return;
      candidates.push(clean);
    };

    if (trimmed) push(trimmed.replace(/#.*$/, ''));
    if (/\/swagger-ui\/index\.html/i.test(trimmed)) {
      const base = trimmed.replace(/\/swagger-ui\/index\.html.*$/i, '');
      push(base + '/v3/api-docs');
      push(base + '/api-docs');
      push(base + '/swagger/v1/swagger.json');
      push(base + '/swagger.json');
      push(base + '/openapi.json');
    }
    const publicBaseUrl = String((api && api.BASE_URL) || '').replace(/\/+$/g, '');
    if (publicBaseUrl) {
      const apiRoot = publicBaseUrl.replace(/\/publicapi$/i, '');
      push(apiRoot + '/v3/api-docs');
      push(apiRoot + '/api-docs');
      push(apiRoot + '/swagger/v1/swagger.json');
      push(apiRoot + '/swagger.json');
      push(apiRoot + '/openapi.json');
      push(apiRoot + '/swagger-ui/index.html');
    }
    return candidates;
  }

  function httpGetText(url) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const mod = parsed.protocol === 'https:' ? require('https') : require('http');
      const req = mod.request(parsed, { method: 'GET' }, function(res) {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() {
          if (res.statusCode >= 400) {
            reject(new Error('No se pudo leer Swagger en ' + url + ' (HTTP ' + res.statusCode + ').'));
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
      req.end();
    });
  }

  function extractSwaggerUrlFromHtml(html, sourceUrl) {
    const configMatch = html.match(/configUrl:\s*["']([^"']+)["']/i);
    if (configMatch && configMatch[1]) {
      return new URL(configMatch[1], sourceUrl).toString();
    }
    const directMatch = html.match(/url:\s*["']([^"']+)["']/i);
    if (directMatch && directMatch[1]) {
      return new URL(directMatch[1], sourceUrl).toString();
    }
    const urlsMatch = html.match(/urls:\s*\[\s*\{[^\}]*url:\s*["']([^"']+)["']/i);
    if (urlsMatch && urlsMatch[1]) {
      return new URL(urlsMatch[1], sourceUrl).toString();
    }
    return '';
  }

  function extractSwaggerUrlFromConfig(configText, sourceUrl) {
    try {
      const parsed = JSON.parse(configText);
      if (parsed.url) {
        return new URL(parsed.url, sourceUrl).toString();
      }
      if (Array.isArray(parsed.urls) && parsed.urls.length && parsed.urls[0] && parsed.urls[0].url) {
        return new URL(parsed.urls[0].url, sourceUrl).toString();
      }
    } catch (e) {
      return '';
    }
    return '';
  }

  async function loadSwaggerDocument(swaggerUrl, api) {
    const candidates = buildSwaggerCandidateUrls(swaggerUrl, api);
    let lastError = null;
    for (const candidate of candidates) {
      try {
        const response = await httpGetText(candidate);
        const text = String(response.body || '').trim();
        if (!text) continue;
        if (text[0] === '{') {
          const parsedJson = JSON.parse(text);
          if (parsedJson.openapi || parsedJson.swagger) {
            return { doc: parsedJson, resolvedUrl: candidate };
          }
          const nestedFromConfig = extractSwaggerUrlFromConfig(text, candidate);
          if (nestedFromConfig) {
            const nested = await httpGetText(nestedFromConfig);
            return { doc: JSON.parse(nested.body), resolvedUrl: nestedFromConfig };
          }
        }
        const nestedUrl = extractSwaggerUrlFromHtml(text, candidate);
        if (nestedUrl) {
          const nested = await httpGetText(nestedUrl);
          const nestedText = String(nested.body || '').trim();
          if (nestedText[0] === '{') {
            const nestedJson = JSON.parse(nestedText);
            if (nestedJson.openapi || nestedJson.swagger) {
              return { doc: nestedJson, resolvedUrl: nestedUrl };
            }
            const nestedFromConfig = extractSwaggerUrlFromConfig(nestedText, nestedUrl);
            if (nestedFromConfig) {
              const deepNested = await httpGetText(nestedFromConfig);
              return { doc: JSON.parse(deepNested.body), resolvedUrl: nestedFromConfig };
            }
          }
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('No se pudo resolver el documento Swagger.');
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

  function extractSwaggerOperations(doc) {
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
          if (String(param.in || '').toLowerCase() === 'header' && isReservedAuthInput(param.name)) {
            return;
          }
          const schema = resolveSwaggerRef(doc, param.schema || {});
          manualInputs.push({
            key: sanitizeVariableKey(param.name),
            pathLabel: param.name,
            type: (schema && schema.type) || '',
            description: param.description || '',
            defaultValue: param.example != null ? String(param.example) : '',
            location: param.in || 'query'
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
          outputFields
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

      const variableName = childPath.join('_');
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

    const variableName = state.bindings[param.name] || param.name;
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

  function buildAuthRequestItem(version, api) {
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
    const resolvedAuthUrl = api.API_AUTH_URL || (apiBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate');
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

  function buildSoapAction(schema) {
    return 'http://uy.com.dlya.bantotal/BTSOA/action/A' + schema.service.toUpperCase() + '.' + schema.method;
  }

  function buildSoapRequestUrl(api, schema) {
    const resolvedBaseUrl = String(api.API_BASE_URL || '').replace(/\/+$/g, '');
    return resolvedBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_' + schema.service + '_v1?' + schema.method;
  }

  function buildMethodRequestItem(schema, state, api) {
    const outputNames = getExportableOutputs(schema).map(function(param) { return param.name; });
    const rawUrl = '{{api_base_url}}/servlet/com.dlya.bantotal.ardwsbt_' + schema.service + '_v1?' + schema.method;
    const resolvedBaseUrl = String(api.API_BASE_URL || '').replace(/\/+$/g, '');
    const resolvedUrl = resolvedBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_' + schema.service + '_v1?' + schema.method;
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
    const authUrl = version === 'V4'
      ? resolveJsonAuthUrl(api)
      : (api.API_AUTH_URL || (apiBaseUrl + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate'));
    const overrides = variableOverrides || {};
    const entries = [
      ['api_base_url', apiBaseUrl],
      ['public_api_url', publicBaseUrl],
      ['base_url', publicBaseUrl],
      ['auth_url', authUrl],
      ['channel', api.API_CANAL || 'BTDIGITAL'],
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

  function buildBantotalJsonHeaders(context, tokenOverride) {
    const headers = {};
    const channel = firstDefinedText(context && context.channel, 'BTDIGITAL');
    const username = firstDefinedText(context && context.username, 'INSTALADOR');
    const device = firstDefinedText(context && context.device, 'INSTALADOR');
    const requirement = firstDefinedText(context && context.requirement, '1');
    const token = firstDefinedText(tokenOverride, context && context.token, '');
    headers.Canal = channel;
    headers.Usuario = username;
    headers.Device = device;
    headers.Requerimiento = requirement;
    headers.Token = token;
    return headers;
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
      const schema = await queryMethodSchema(body.platform, body.db, item.service, item.method);
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
        repeatableOverrides: scenario.repeatableOverrides || {}
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
      repeatableOverrides: body.repeatableOverrides || {}
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
        items: scenario.items
      });
      const bindingsInfo = computeBindingsAndMappings(schemas);
      const folderItems = [buildAuthRequestItem(body.version, body.api)];

      schemas.forEach(function(schema, index) {
        const state = {
          bindings: bindingsInfo.bindingsPerStep[index],
          variables: generatedVariables,
          repeatableOverrides: scenario.repeatableOverrides || {}
        };
        folderItems.push(buildMethodRequestItem(schema, state, body.api));
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
      item: postmanFolders
    };

    ensureOutputDir();
    const fileName = sanitizeSegment(body.collectionName || postmanFolders[0].name || 'bantotal-collection') + '-xml-postman-' + Date.now() + '.postman_collection.json';
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
      "function pick(node, parts) {",
      "  if (node === null || node === undefined) return undefined;",
      "  if (!parts.length) return node;",
      "  var current = parts[0];",
      "  var rest = parts.slice(1);",
      "  if (Array.isArray(node)) {",
      "    if (current === 'item') {",
      "      for (var i = 0; i < node.length; i++) {",
      "        var foundItem = pick(node[i], rest);",
      "        if (foundItem !== undefined && foundItem !== null && foundItem !== '') return foundItem;",
      "      }",
      "      return undefined;",
      "    }",
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
      "  var collection = pick(node, pathParts.slice(0, itemIndex));",
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

  function buildJsonRawUrl(pathName, manualInputs, variableNameResolver) {
    const resolver = typeof variableNameResolver === 'function'
      ? variableNameResolver
      : function(input) { return input.key; };
    const replacedPath = String(pathName || '').replace(/\{([^}]+)\}/g, function(_, name) {
      const key = sanitizeVariableKey(name);
      return '{{' + resolver({ key, pathLabel: name, location: 'path' }) + '}}';
    });
    const queryParams = (manualInputs || []).filter(function(input) {
      return String(input.location || '').toLowerCase() === 'query';
    });
    if (!queryParams.length) return '{{base_url}}' + replacedPath;
    const queryString = queryParams.map(function(input) {
      return encodeURIComponent(input.pathLabel || input.key) + '={{' + resolver(input) + '}}';
    }).join('&');
    return '{{base_url}}' + replacedPath + '?' + queryString;
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

  function readJsonValueByPath(node, pathParts) {
    if (node === null || node === undefined) return undefined;
    if (!pathParts.length) return node;
    const current = pathParts[0];
    const rest = pathParts.slice(1);
    if (Array.isArray(node)) {
      if (current === 'item') {
        for (const item of node) {
          const found = readJsonValueByPath(item, rest);
          if (found !== undefined && found !== null && found !== '') return found;
        }
        return undefined;
      }
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
    const items = Array.isArray(collectionNode) ? collectionNode : [];
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

  function buildJsonRequestItem(operation, orderLabel, api, scenario) {
    const methodName = operation.methodName || operation.method || deriveMethodNameFromPath(operation.path, operation.httpMethod, operation);
    const resolvedOverrides = Object.assign(
      {},
      (scenario && scenario.variableOverrides) || {},
      (operation && operation.inputOverrides) || {}
    );
    const rawUrl = buildJsonRawUrl(operation.path, operation.manualInputs || [], function(input) {
      return resolveMappedVariableName(operation, input, scenario);
    });
    const resolvedUrl = buildJsonResolvedUrl(resolveJsonBaseUrl(api), operation.path, operation.manualInputs || [], resolvedOverrides);
    const headers = [
      { key: 'Canal', value: '{{channel}}', type: 'text' },
      { key: 'Device', value: '{{device}}', type: 'text' },
      { key: 'Usuario', value: '{{username}}', type: 'text' },
      { key: 'Requerimiento', value: '{{requirement}}', type: 'text' },
      { key: 'Token', value: '{{token}}', type: 'text' }
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
    if (operation.bodyTemplate && method !== 'GET') {
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
      SWAGGER_AUTH_URL: resolveJsonAuthUrl(body)
    });
    scenarios.forEach(function(scenario) {
      const folderItems = [buildAuthRequestItem(body.version, effectiveApi)];
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
        folderItems.push(buildJsonRequestItem(item, index + 1, effectiveApi, scenario));
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
      variable: buildCollectionVariables(body.version, effectiveApi, generatedVariables, mergedOverrides),
      item: postmanFolders
    };

    ensureOutputDir();
    const fileName = sanitizeSegment(body.collectionName || postmanFolders[0].name || 'bantotal-json-collection') + '-json-postman-' + Date.now() + '.postman_collection.json';
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
    const authContext = resolveExecutionAuthContext(api);
    const authUrl = version === 'V3'
      ? `${api.API_AUTH_URL}?Execute`
      : resolveJsonAuthUrl(api);
    const body = isV4
      ? JSON.stringify({
          UserId: authContext.username,
          UserPassword: authContext.password
        })
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
      const btHeaders = isV4 ? Object.assign(
        buildBantotalJsonHeaders(authContext, ''),
        { 'idempotency-key': '1' }
      ) : {};
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
    const token = parsedJson.SessionToken;
    if (!token) {
      throw Object.assign(new Error(parsedJson.Btoutreq && parsedJson.Btoutreq.Mensaje || parsedJson.Mensaje || JSON.stringify(parsedJson).slice(0, 200)), { raw });
    }
    return { token, raw };
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
      const steps = [{
        index: 0,
        name: 'Authenticate',
        ok: false,
        requestUrl: resolveJsonAuthUrl(body)
      }];
      const runtimeValues = Object.assign({}, body.variableOverrides || {}, {
        channel: authContext.channel,
        username: authContext.username,
        device: authContext.device,
        requirement: authContext.requirement
      });
      try {
        const auth = await authenticateSession(body.version, body);
        runtimeValues.token = auth.token;
        steps[0].ok = true;
        steps[0].responseStatus = 200;
        steps[0].extractedValues = { token: auth.token };
        steps[0].responseXml = auth.raw;
      } catch (e) {
        steps[0].error = e.message || 'No se pudo autenticar contra el ambiente.';
        if (e.raw) steps[0].responseXml = e.raw;
        throw Object.assign(new Error(steps[0].error), { steps, runtimeValues });
      }

      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        const step = {
          index: i + 1,
          name: item.method || item.path || ('Paso ' + (i + 1))
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
          const requestUrl = buildJsonExecutionUrl(resolveJsonBaseUrl(body), item.path, item.manualInputs || [], stepRuntimeValues);
          const headers = buildBantotalJsonHeaders({
            channel: stepRuntimeValues.channel,
            username: stepRuntimeValues.username,
            device: stepRuntimeValues.device,
            requirement: stepRuntimeValues.requirement
          }, stepRuntimeValues.token);
          const bodyValue = item.bodyTemplate ? fillJsonTemplate(item.bodyTemplate, stepRuntimeValues) : null;
          Object.assign(runtimeValues, stepRuntimeValues);
          const response = await invokeJsonRequest(requestUrl, item.httpMethod, headers, bodyValue);
          step.requestUrl = requestUrl;
          step.responseStatus = response.statusCode;
          step.requestXml = bodyValue == null ? '' : JSON.stringify(bodyValue, null, 2);
          step.responseXml = response.body;
          let parsed = null;
          try { parsed = response.body ? JSON.parse(response.body) : null; } catch (_) {}
          if (parsed) {
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

    const schemas = await loadSchemasForItems(body);
    const bindingsInfo = computeBindingsAndMappings(schemas);
    const steps = [{
      index: 0,
      name: 'Authenticate',
      ok: false,
      requestUrl: body.version === 'V4'
        ? resolveV4AuthUrl(body.api)
        : (body.api.API_AUTH_URL || (String(body.api.API_BASE_URL || '').replace(/\/+$/g, '') + '/servlet/com.dlya.bantotal.ardwsbt_Authenticate'))
    }];
    const runtimeValues = Object.assign({}, body.variableOverrides || {}, {
      channel: body.api.API_CANAL || 'BTDIGITAL',
      username: body.api.API_USER || 'INSTALADOR',
      device: body.api.API_DEVICE || 'INSTALADOR',
      requirement: body.api.API_REQUERIMIENTO || '1'
    });
    try {
      const auth = await authenticateSession(body.version, body.api);
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
          repeatableOverrides: body.repeatableOverrides || {}
        };
        step.requestUrl = buildSoapRequestUrl(body.api, schema);
        step.soapAction = buildSoapAction(schema);
        step.requestXml = buildSoapRequestXml(schema, state);
        const response = await invokeSoapXml(step.requestUrl, step.soapAction, step.requestXml);
        step.responseStatus = response.statusCode;
        step.responseXml = response.body;

        const parsed = await parseSoapXml(response.body);
        const businessError = extractBusinessError(parsed);
        const extracted = extractOutputValues(schema, parsed);
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
        const loaded = await loadSwaggerDocument(body.swaggerUrl, body.api || {});
        const operationsByService = extractSwaggerOperations(loaded.doc);
        const baseUrl = resolveSwaggerServerUrl(loaded.doc, loaded.resolvedUrl);
        const authUrl = resolveSwaggerAuthUrl(loaded.doc, loaded.resolvedUrl, baseUrl);
        const services = Object.keys(operationsByService).sort();
        json(200, {
          ok: true,
          resolvedUrl: loaded.resolvedUrl,
          baseUrl,
          authUrl,
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
        const loaded = await buildDatabaseOperations(body.platform, body.db, body.version);
        json(200, {
          ok: true,
          services: loaded.services,
          operationsByService: loaded.operationsByService,
          source: 'database',
          warning: 'Los endpoints y bodies se inferieron desde BTI014/BTI019. Si el ambiente JSON difiere del convenio estandar, puede requerir ajustes manuales.'
        });
      } catch (e) {
        json(200, { ok: false, message: e.message });
      }
      return true;
    }

    if (req.method === 'POST' && req.url === '/api/collection/database/operation') {
      try {
        const body = await readBody(req);
        const operation = await buildDatabaseOperationDetails(body.platform, body.db, body.service, body.method);
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
    styles,
    panelHtml,
    clientScript,
    handleApi
  };
}

module.exports = { createCollectionFeature };



