'use strict';

/**
 * Categorías semánticas soportadas explícitamente por el generador.
 * Mantener la whitelist en un único lugar evita generar datos de riesgo.
 */
const BUSINESS_SEMANTIC_TYPES = {
  PERSON_FIRST_NAME: 'person.firstName',
  PERSON_LAST_NAME: 'person.lastName',
  PERSON_FULL_NAME: 'person.fullName',
  COMPANY_NAME: 'company.name',
  CONTACT_EMAIL: 'contact.email',
  CONTACT_PHONE: 'contact.phone',
  ADDRESS_STREET: 'address.street',
  ADDRESS_STREET_NUMBER: 'address.streetNumber',
  ADDRESS_FULL: 'address.fullAddress',
  ADDRESS_CITY: 'address.city',
  ADDRESS_STATE: 'address.state',
  ADDRESS_COUNTRY: 'address.country',
  ADDRESS_POSTAL_CODE: 'address.postalCode',
  DATE_BIRTH: 'date.birthDate',
  DATE_EXPECTED: 'date.expectedDate',
  DATE_DUE: 'date.dueDate',
  DATE_START: 'date.startDate',
  DATE_END: 'date.endDate',
  FINANCE_AMOUNT: 'finance.amount',
  FINANCE_PRICE: 'finance.price',
  FINANCE_PERCENTAGE: 'finance.percentage',
  QUANTITY_UNITS: 'quantity.units',
  TERM_DAYS: 'term.days',
  TERM_MONTHS: 'term.months',
  INSTALLMENTS_COUNT: 'installments.count',
  TEXT_DESCRIPTION: 'text.description',
  TEXT_OBSERVATION: 'text.observation',
  TEXT_COMMENT: 'text.comment'
};

/**
 * Configuración por defecto del motor.
 * Se concentra acá para poder cambiar reglas sin tocar la orquestación.
 */
const DEFAULT_RESOLVER_CONFIG = {
  locale: 'es-UY',
  fillOnlyEmptyFields: true,
  collectionGenerationThreshold: 0.9,
  manualFillThreshold: 0.75,
  semanticLinkThreshold: 0.95,
  generation: {
    amounts: { min: 100, max: 100000, decimals: 2 },
    percentages: { min: 1, max: 100, decimals: 2 },
    expectedDates: { minDaysFromNow: 1, maxDaysFromNow: 30 },
    dueDates: { allowedDaysFromNow: [7, 15, 30, 45, 60, 90] },
    terms: {
      allowedDays: [7, 15, 30, 45, 60, 90],
      allowedMonths: [3, 6, 12, 18, 24, 36],
      allowedInstallments: [1, 3, 6, 12, 18, 24]
    },
    addresses: {
      defaultCountry: 'Uruguay',
      cities: ['Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Paysandu'],
      states: ['Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Paysandu'],
      streets: ['Avenida Rivera', 'Avenida Italia', '18 de Julio', 'Bulevar Artigas']
    }
  },
  customMappings: {},
  excludedFields: [],
  businessSemanticTypes: BUSINESS_SEMANTIC_TYPES
};

module.exports = {
  BUSINESS_SEMANTIC_TYPES,
  DEFAULT_RESOLVER_CONFIG
};
