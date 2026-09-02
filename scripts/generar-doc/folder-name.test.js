const test = require('node:test');
const assert = require('node:assert/strict');

const { toFolderName } = require('./folder-name');

test('saca el prefijo Public', () => {
  assert.equal(toFolderName('PublicGeneral'), 'General');
});

test('convierte PascalCase a kebab-case', () => {
  assert.equal(toFolderName('PublicLoanParameters'), 'Loan-Parameters');
});

test('respeta siglas seguidas de palabra (grupo de mayusculas + minuscula)', () => {
  assert.equal(toFolderName('PublicCASHManagement'), 'CASH-Management');
});

test('sin prefijo Public: no rompe', () => {
  assert.equal(toFolderName('SavingsAccounts'), 'Savings-Accounts');
});
