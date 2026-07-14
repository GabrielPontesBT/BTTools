'use strict';

const { BUSINESS_SEMANTIC_TYPES } = require('./resolver-config');
const { normalizeFieldName, tokenizeFieldName } = require('./field-normalizer');

const ENTITY_SYNONYMS = {
  person: ['person', 'customer', 'client', 'user', 'holder', 'applicant', 'beneficiary', 'member', 'persona', 'cliente', 'usuario', 'titular', 'solicitante', 'beneficiario', 'miembro'],
  company: ['company', 'business', 'organization', 'enterprise', 'empresa', 'organizacion', 'compania'],
  country: ['country', 'nation', 'pais', 'nacion'],
  address: ['address', 'street', 'location', 'direccion', 'domicilio', 'calle'],
  finance: ['finance', 'payment', 'loan', 'importe', 'monto', 'pago', 'prestamo'],
  date: ['date', 'fecha'],
  term: ['term', 'installment', 'plazo', 'cuota', 'repayment']
};

const PROPERTY_SYNONYMS = {
  firstName: ['firstname', 'first', 'given', 'nombre'],
  lastName: ['lastname', 'last', 'surname', 'family', 'apellido'],
  name: ['name', 'full', 'display', 'legal', 'nombre', 'completo', 'denomination', 'denominacion'],
  email: ['email', 'mail', 'correo'],
  phone: ['phone', 'mobile', 'telephone', 'telefono', 'celular'],
  street: ['street', 'avenue', 'road', 'calle', 'avenida'],
  number: ['number', 'numero', 'num'],
  city: ['city', 'ciudad'],
  state: ['state', 'province', 'department', 'departamento', 'provincia'],
  country: ['country', 'nation', 'pais', 'nacion'],
  postalCode: ['postal', 'zip', 'zipcode', 'postalcode', 'codigopostal'],
  amount: ['amount', 'total', 'importe', 'monto', 'valor'],
  price: ['price', 'precio'],
  percentage: ['percentage', 'percent', 'porcentaje'],
  description: ['description', 'descripcion'],
  observation: ['observation', 'observacion'],
  comment: ['comment', 'comentario'],
  birth: ['birth', 'nacimiento'],
  expected: ['expected', 'esperada', 'estimada'],
  due: ['due', 'vencimiento', 'expire'],
  start: ['start', 'inicio', 'desde'],
  end: ['end', 'fin', 'hasta'],
  days: ['days', 'dias'],
  months: ['months', 'meses'],
  installments: ['installments', 'cuotas'],
  quantity: ['quantity', 'cantidad', 'units', 'unidades']
};

const TECHNICAL_IDENTIFIER_TOKENS = [
  'id', 'uid', 'guid', 'uuid', 'token', 'sessiontoken', 'accesstoken', 'refreshtoken',
  'contractid', 'customerid', 'personid', 'operationid', 'accountid', 'serviceid',
  'transactionid', 'fileid', 'documentid', 'referenceid', 'sequence', 'correlative',
  'internalcode', 'codigointerno', 'numerooperacion', 'numerocuenta', 'accountnumber',
  'contractnumber', 'operationnumber', 'transactionnumber'
];

/**
 * Clasificador semántico rule-based.
 * Prioriza reglas deterministas y deja cualquier ambigüedad sin resolver.
 */
class RuleBasedSemanticFieldClassifier {
  /**
   * Recibe configuración opcional para thresholds o exclusiones futuras.
   */
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Clasifica un campo usando nombre, ruta, metadata y contexto textual.
   */
  classify(field) {
    var context = this.buildContext(field);

    if (this.isExcluded(context)) {
      return this.buildResult(null, 1, 'custom-mapping', 'Field excluded by configuration', context, true);
    }

    if (this.isTechnicalIdentifier(context)) {
      return this.buildResult(null, 1, 'exact-rule', 'Detected technical identifier', context, true);
    }

    var exactResult = this.classifyExact(context);
    if (exactResult) return exactResult;

    var contextualResult = this.classifyByEntityAndProperty(context);
    if (contextualResult) return contextualResult;

    return this.buildResult(null, 0, 'unresolved', 'No safe semantic category detected', context, false);
  }

  /**
   * Prepara el contexto normalizado que consumen las reglas.
   */
  buildContext(field) {
    var fieldPath = String((field && field.fieldPath) || (field && field.pathLabel) || (field && field.fieldName) || '');
    var fieldName = String((field && field.fieldName) || fieldPath.split('.').pop() || '');
    var alias = String((field && field.alias) || '');
    var description = String((field && field.description) || '');
    var parentFieldName = String((field && field.parentFieldName) || this.parentFromPath(fieldPath) || '');
    var ancestorNames = Array.isArray(field && field.ancestorNames) ? field.ancestorNames.slice() : this.ancestorsFromPath(fieldPath);
    var tokenPool = []
      .concat(tokenizeFieldName(fieldName))
      .concat(tokenizeFieldName(fieldPath))
      .concat(tokenizeFieldName(alias))
      .concat(tokenizeFieldName(description))
      .concat(tokenizeFieldName(parentFieldName))
      .concat(ancestorNames.reduce(function(acc, item) { return acc.concat(tokenizeFieldName(item)); }, []));

    return {
      fieldName,
      fieldPath,
      alias,
      description,
      dataType: String((field && field.dataType) || (field && field.type) || '').toLowerCase(),
      format: String((field && field.format) || '').toLowerCase(),
      enumValues: Array.isArray(field && field.enumValues) ? field.enumValues.slice() : [],
      parentFieldName,
      ancestorNames,
      normalizedName: normalizeFieldName(fieldName),
      normalizedPath: normalizeFieldName(fieldPath),
      tokens: Array.from(new Set(tokenPool.filter(Boolean)))
    };
  }

  /**
   * Obtiene el padre inmediato de una ruta tipo `customer.name`.
   */
  parentFromPath(fieldPath) {
    var parts = String(fieldPath || '').split('.').filter(Boolean);
    return parts.length > 1 ? parts[parts.length - 2] : '';
  }

  /**
   * Devuelve todos los ancestros disponibles de una ruta.
   */
  ancestorsFromPath(fieldPath) {
    var parts = String(fieldPath || '').split('.').filter(Boolean);
    return parts.slice(0, -1);
  }

  /**
   * Revisa si el proyecto marcó el campo como excluido del autocompletado.
   */
  isExcluded(context) {
    var excludedFields = Array.isArray(this.options.excludedFields) ? this.options.excludedFields : [];
    return excludedFields.some(function(match) {
      return match === context.fieldName || match === context.fieldPath;
    });
  }

  /**
   * Detecta IDs técnicos o referencias que nunca deben autogenerarse.
   */
  isTechnicalIdentifier(context) {
    var normalizedJoined = context.tokens.join('');
    if (TECHNICAL_IDENTIFIER_TOKENS.indexOf(normalizedJoined) >= 0) return true;
    if (context.tokens.indexOf('guid') >= 0 || context.tokens.indexOf('uuid') >= 0 || context.tokens.indexOf('token') >= 0) return true;
    if (context.tokens.indexOf('id') >= 0 && context.tokens.indexOf('address') < 0 && context.tokens.indexOf('street') < 0) return true;
    if (context.tokens.indexOf('number') >= 0) {
      var safeNumberContexts = ['address', 'street', 'installments', 'cuotas', 'days', 'months'];
      var hasSafeContext = safeNumberContexts.some(function(token) { return context.tokens.indexOf(token) >= 0; });
      if (!hasSafeContext) return true;
    }
    return false;
  }

  /**
   * Aplica reglas de alta confianza para campos muy claros.
   */
  classifyExact(context) {
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.email)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.CONTACT_EMAIL, 0.99, 'exact-rule', 'Detected email tokens', context, false, 'contact', 'email');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.phone)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.CONTACT_PHONE, 0.98, 'exact-rule', 'Detected phone tokens', context, false, 'contact', 'phone');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.birth)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.DATE_BIRTH, 0.98, 'exact-rule', 'Detected birth date tokens', context, false, 'date', 'birthDate');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.expected) && this.hasAny(context.tokens, ENTITY_SYNONYMS.date)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.DATE_EXPECTED, 0.97, 'exact-rule', 'Detected expected date tokens', context, false, 'date', 'expectedDate');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.due) && this.hasAny(context.tokens, ENTITY_SYNONYMS.date)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.DATE_DUE, 0.97, 'exact-rule', 'Detected due date tokens', context, false, 'date', 'dueDate');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.start) && this.hasAny(context.tokens, ENTITY_SYNONYMS.date)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.DATE_START, 0.97, 'exact-rule', 'Detected start date tokens', context, false, 'date', 'startDate');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.end) && this.hasAny(context.tokens, ENTITY_SYNONYMS.date)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.DATE_END, 0.97, 'exact-rule', 'Detected end date tokens', context, false, 'date', 'endDate');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.amount)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.FINANCE_AMOUNT, 0.96, 'exact-rule', 'Detected amount tokens', context, false, 'finance', 'amount');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.price)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.FINANCE_PRICE, 0.96, 'exact-rule', 'Detected price tokens', context, false, 'finance', 'price');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.percentage)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.FINANCE_PERCENTAGE, 0.96, 'exact-rule', 'Detected percentage tokens', context, false, 'finance', 'percentage');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.installments)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.INSTALLMENTS_COUNT, 0.96, 'exact-rule', 'Detected installments tokens', context, false, 'term', 'installments');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.months)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.TERM_MONTHS, 0.95, 'exact-rule', 'Detected months term tokens', context, false, 'term', 'months');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.days)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.TERM_DAYS, 0.95, 'exact-rule', 'Detected days term tokens', context, false, 'term', 'days');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.description)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.TEXT_DESCRIPTION, 0.9, 'exact-rule', 'Detected description tokens', context, false, 'text', 'description');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.observation)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.TEXT_OBSERVATION, 0.9, 'exact-rule', 'Detected observation tokens', context, false, 'text', 'observation');
    }
    if (this.hasAny(context.tokens, PROPERTY_SYNONYMS.comment)) {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.TEXT_COMMENT, 0.9, 'exact-rule', 'Detected comment tokens', context, false, 'text', 'comment');
    }
    return null;
  }

  /**
   * Combina entidad + propiedad + contexto para diferenciar nombres ambiguos.
   */
  classifyByEntityAndProperty(context) {
    var entity = this.detectEntity(context.tokens);
    var property = this.detectProperty(context.tokens);

    if (entity === 'person' && property === 'firstName') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.PERSON_FIRST_NAME, 0.97, 'context-rule', 'Detected person first name', context, false, entity, property);
    }
    if (entity === 'person' && property === 'lastName') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.PERSON_LAST_NAME, 0.97, 'context-rule', 'Detected person last name', context, false, entity, property);
    }
    if (entity === 'person' && property === 'name') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.PERSON_FULL_NAME, 0.96, 'context-rule', 'Detected person/customer name', context, false, entity, property);
    }
    if (entity === 'company' && property === 'name') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.COMPANY_NAME, 0.97, 'context-rule', 'Detected company name', context, false, entity, property);
    }
    if (entity === 'country' && property === 'name') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_COUNTRY, 0.97, 'context-rule', 'Detected country name', context, false, entity, property);
    }
    if ((entity === 'address' || entity === 'country') && property === 'country') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_COUNTRY, 0.97, 'context-rule', 'Detected country field', context, false, 'address', property);
    }
    if (entity === 'address' && property === 'street') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_STREET, 0.96, 'context-rule', 'Detected address street', context, false, entity, property);
    }
    if (entity === 'address' && property === 'number') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_STREET_NUMBER, 0.95, 'context-rule', 'Detected address street number', context, false, entity, property);
    }
    if (entity === 'address' && property === 'city') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_CITY, 0.95, 'context-rule', 'Detected address city', context, false, entity, property);
    }
    if (entity === 'address' && property === 'state') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_STATE, 0.95, 'context-rule', 'Detected address state', context, false, entity, property);
    }
    if (entity === 'address' && property === 'postalCode') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_POSTAL_CODE, 0.95, 'context-rule', 'Detected address postal code', context, false, entity, property);
    }
    if (entity === 'address' && property === 'name') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.ADDRESS_FULL, 0.82, 'context-rule', 'Detected address display/full name', context, false, entity, property);
    }
    if (property === 'quantity') {
      return this.buildResult(BUSINESS_SEMANTIC_TYPES.QUANTITY_UNITS, 0.9, 'context-rule', 'Detected quantity field', context, false, entity, property);
    }
    return null;
  }

  /**
   * Detecta una entidad conceptual a partir de sinónimos reducidos.
   */
  detectEntity(tokens) {
    return this.detectConcept(tokens, ENTITY_SYNONYMS);
  }

  /**
   * Detecta una propiedad conceptual a partir de sinónimos reducidos.
   */
  detectProperty(tokens) {
    return this.detectConcept(tokens, PROPERTY_SYNONYMS);
  }

  /**
   * Busca el primer concepto cuyo set de sinónimos aparece en el token pool.
   */
  detectConcept(tokens, dictionary) {
    var keys = Object.keys(dictionary);
    for (var i = 0; i < keys.length; i++) {
      if (this.hasAny(tokens, dictionary[keys[i]])) return keys[i];
    }
    return 'unknown';
  }

  /**
   * Ayuda mínima para comparar tokens contra un grupo de sinónimos.
   */
  hasAny(tokens, candidates) {
    return candidates.some(function(candidate) {
      return tokens.indexOf(String(candidate).toLowerCase()) >= 0;
    });
  }

  /**
   * Empaqueta la clasificación en un contrato estable y trazable.
   */
  buildResult(semanticType, confidence, source, explanation, context, isTechnicalIdentifier, entity, property) {
    return {
      semanticType: semanticType || null,
      entity: entity || 'unknown',
      property: property || 'unknown',
      confidence: confidence || 0,
      source: source || 'unresolved',
      explanation: explanation || '',
      isTechnicalIdentifier: !!isTechnicalIdentifier,
      normalizedName: context.normalizedName,
      normalizedPath: context.normalizedPath,
      tokens: context.tokens.slice()
    };
  }
}

module.exports = {
  RuleBasedSemanticFieldClassifier
};
