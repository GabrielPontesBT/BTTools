'use strict';

const { BUSINESS_SEMANTIC_TYPES } = require('./resolver-config');

/**
 * Construye el contexto coherente que luego consumen los generadores.
 */
function createBusinessDataContext(config) {
  var generation = config && config.generation ? config.generation : {};
  var addressConfig = generation.addresses || {};
  var city = (addressConfig.cities || ['Montevideo'])[0];
  var state = (addressConfig.states || [city])[0];
  var street = (addressConfig.streets || ['Avenida Rivera'])[0];
  var streetNumber = 2456;
  var firstName = 'Lucia';
  var lastName = 'Fernandez';
  var fullName = firstName + ' ' + lastName;
  var today = new Date();

  return {
    person: {
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email: 'lucia.fernandez@example.com',
      phone: '099123456'
    },
    company: {
      name: 'Servicios del Plata S.A.'
    },
    address: {
      street: street,
      streetNumber: streetNumber,
      fullAddress: street + ' ' + streetNumber,
      city: city,
      state: state,
      country: addressConfig.defaultCountry || 'Uruguay',
      postalCode: '11300'
    },
    finance: {
      amount: 18500.5,
      price: 4500,
      percentage: 12.5
    },
    dates: {
      birthDate: formatDate(addDays(today, -365 * 34)),
      expectedDate: formatDate(addDays(today, 7)),
      dueDate: formatDate(addDays(today, 30)),
      startDate: formatDate(addDays(today, 1)),
      endDate: formatDate(addDays(today, 31))
    },
    terms: {
      days: 30,
      months: 12,
      installments: 12
    },
    text: {
      description: 'Caso de prueba generado automaticamente',
      observation: 'Observacion generada para validar el flujo',
      comment: 'Comentario de ejemplo para pruebas internas'
    }
  };
}

/**
 * Registro extensible de generadores por tipo semántico.
 */
function buildGeneratorRegistry() {
  var registry = {};
  registry[BUSINESS_SEMANTIC_TYPES.PERSON_FIRST_NAME] = function(context) { return context.person.firstName; };
  registry[BUSINESS_SEMANTIC_TYPES.PERSON_LAST_NAME] = function(context) { return context.person.lastName; };
  registry[BUSINESS_SEMANTIC_TYPES.PERSON_FULL_NAME] = function(context) { return context.person.fullName; };
  registry[BUSINESS_SEMANTIC_TYPES.COMPANY_NAME] = function(context) { return context.company.name; };
  registry[BUSINESS_SEMANTIC_TYPES.CONTACT_EMAIL] = function(context) { return context.person.email; };
  registry[BUSINESS_SEMANTIC_TYPES.CONTACT_PHONE] = function(context) { return context.person.phone; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_STREET] = function(context) { return context.address.street; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_STREET_NUMBER] = function(context) { return context.address.streetNumber; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_FULL] = function(context) { return context.address.fullAddress; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_CITY] = function(context) { return context.address.city; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_STATE] = function(context) { return context.address.state; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_COUNTRY] = function(context) { return context.address.country; };
  registry[BUSINESS_SEMANTIC_TYPES.ADDRESS_POSTAL_CODE] = function(context) { return context.address.postalCode; };
  registry[BUSINESS_SEMANTIC_TYPES.DATE_BIRTH] = function(context) { return context.dates.birthDate; };
  registry[BUSINESS_SEMANTIC_TYPES.DATE_EXPECTED] = function(context) { return context.dates.expectedDate; };
  registry[BUSINESS_SEMANTIC_TYPES.DATE_DUE] = function(context) { return context.dates.dueDate; };
  registry[BUSINESS_SEMANTIC_TYPES.DATE_START] = function(context) { return context.dates.startDate; };
  registry[BUSINESS_SEMANTIC_TYPES.DATE_END] = function(context) { return context.dates.endDate; };
  registry[BUSINESS_SEMANTIC_TYPES.FINANCE_AMOUNT] = function(context) { return context.finance.amount; };
  registry[BUSINESS_SEMANTIC_TYPES.FINANCE_PRICE] = function(context) { return context.finance.price; };
  registry[BUSINESS_SEMANTIC_TYPES.FINANCE_PERCENTAGE] = function(context) { return context.finance.percentage; };
  registry[BUSINESS_SEMANTIC_TYPES.QUANTITY_UNITS] = function() { return 3; };
  registry[BUSINESS_SEMANTIC_TYPES.TERM_DAYS] = function(context) { return context.terms.days; };
  registry[BUSINESS_SEMANTIC_TYPES.TERM_MONTHS] = function(context) { return context.terms.months; };
  registry[BUSINESS_SEMANTIC_TYPES.INSTALLMENTS_COUNT] = function(context) { return context.terms.installments; };
  registry[BUSINESS_SEMANTIC_TYPES.TEXT_DESCRIPTION] = function(context) { return context.text.description; };
  registry[BUSINESS_SEMANTIC_TYPES.TEXT_OBSERVATION] = function(context) { return context.text.observation; };
  registry[BUSINESS_SEMANTIC_TYPES.TEXT_COMMENT] = function(context) { return context.text.comment; };
  return registry;
}

/**
 * Pide al registro un valor para el tipo semántico detectado.
 */
function generateValueForSemanticType(semanticType, context, registry) {
  var generatorRegistry = registry || buildGeneratorRegistry();
  var generator = generatorRegistry[semanticType];
  if (typeof generator !== 'function') return undefined;
  return generator(context);
}

/**
 * Suma días a una fecha de forma inmutable.
 */
function addDays(date, amount) {
  var clone = new Date(date.getTime());
  clone.setDate(clone.getDate() + amount);
  return clone;
}

/**
 * Devuelve fechas en formato ISO corto para requests JSON.
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = {
  createBusinessDataContext,
  buildGeneratorRegistry,
  generateValueForSemanticType
};
