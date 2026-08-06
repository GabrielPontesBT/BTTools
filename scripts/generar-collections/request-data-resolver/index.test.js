const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveCollectionRequestData, RuleBasedSemanticFieldClassifier } = require('./index');
const { normalizeFieldName, tokenizeFieldName } = require('./field-normalizer');

/**
 * Genera un item mínimo para tests de resolución.
 */
function createItem(name, inputs, outputs) {
  return {
    operationKey: 'GET /public/Test/v1/' + name,
    service: 'Test',
    method: name,
    manualInputs: inputs || [],
    outputFields: outputs || [],
    inputOverrides: {}
  };
}

test('normalizeFieldName y tokenizeFieldName soportan varios formatos', function() {
  assert.equal(normalizeFieldName('customerFullName'), 'customer full name');
  assert.equal(normalizeFieldName('customer_full_name'), 'customer full name');
  assert.deepEqual(tokenizeFieldName('nombreCompletoCliente'), ['nombre', 'completo', 'cliente']);
});

test('semantic classifier diferencia personName y countryName', function() {
  const classifier = new RuleBasedSemanticFieldClassifier();
  assert.equal(classifier.classify({ fieldName: 'personName', fieldPath: 'customer.personName', type: 'string' }).semanticType, 'person.fullName');
  assert.equal(classifier.classify({ fieldName: 'countryName', fieldPath: 'country.name', type: 'string' }).semanticType, 'address.country');
});

test('semantic classifier no permite inventar identificadores tecnicos', function() {
  const classifier = new RuleBasedSemanticFieldClassifier();
  const result = classifier.classify({ fieldName: 'contractId', fieldPath: 'contract.contractId', type: 'integer' });
  assert.equal(result.isTechnicalIdentifier, true);
  assert.equal(result.semanticType, null);
});

test('resolver reutiliza respuesta previa antes de generar datos', function() {
  const collection = {
    scenarios: [{
      id: 'scenario_1',
      name: 'Caso 1',
      items: [
        createItem('getPerson', [], [{ key: 'personName', pathLabel: 'data.person.personName', type: 'string' }]),
        createItem('createSomething', [{ key: 'personName', pathLabel: 'personName', type: 'string' }], [])
      ],
      variableOverrides: {},
      inputMappings: {},
      inputAliases: {},
      outputAliases: {},
      repeatableOverrides: {}
    }]
  };

  const result = resolveCollectionRequestData(collection, { mode: 'collection-generation' });
  const scenario = result.scenarios[0];
  const mappingKey = 'GET /public/Test/v1/createSomething::personName';

  assert.equal(result.summary.linkedCount, 1);
  assert.equal(scenario.inputMappings[mappingKey].sourceVarKey, 'Test_getPerson_data_person_personName');
});

test('resolver preserva manuales en preview cuando fillOnlyEmptyFields esta activo', function() {
  const collection = {
    scenarios: [{
      id: 'scenario_1',
      name: 'Caso 1',
      items: [
        createItem('createLoan', [{ key: 'amount', pathLabel: 'amount', type: 'number' }], [])
      ],
      variableOverrides: {},
      inputMappings: {},
      inputAliases: {},
      outputAliases: {},
      repeatableOverrides: {}
    }]
  };
  collection.scenarios[0].items[0].inputOverrides.amount = '7500';

  const result = resolveCollectionRequestData(collection, { mode: 'preview' });
  assert.equal(result.scenarios[0].items[0].inputOverrides.amount, '7500');
  assert.equal(result.summary.preservedCount, 1);
});

test('resolver autogenera solo categorias whitelist y deja unresolved ids tecnicos', function() {
  const collection = {
    scenarios: [{
      id: 'scenario_1',
      name: 'Caso 1',
      items: [
        createItem('createCustomer', [
          { key: 'customerName', pathLabel: 'customer.name', type: 'string' },
          { key: 'contractId', pathLabel: 'contractId', type: 'integer' }
        ], [])
      ],
      variableOverrides: {},
      inputMappings: {},
      inputAliases: {},
      outputAliases: {},
      repeatableOverrides: {}
    }]
  };

  const result = resolveCollectionRequestData(collection, { mode: 'collection-generation' });
  const item = result.scenarios[0].items[0];

  assert.equal(item.inputOverrides.customerName, 'Lucia Fernandez');
  assert.equal(Object.prototype.hasOwnProperty.call(item.inputOverrides, 'contractId'), false);
  assert.equal(result.summary.generatedCount, 1);
  assert.equal(result.summary.unresolvedCount, 1);
});
