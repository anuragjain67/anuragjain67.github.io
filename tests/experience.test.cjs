const test = require('node:test');
const assert = require('node:assert/strict');
const { completedYears } = require('../assets/js/experience.js');

test('experience counts completed years from June 2013', () => {
  assert.equal(completedYears('2013-06', new Date('2026-10-12T12:00:00Z')), 13);
  assert.equal(completedYears('2013-06', new Date('2027-01-01T12:00:00Z')), 13);
});

test('experience increases in June, using the site timezone', () => {
  assert.equal(completedYears('2013-06', new Date('2026-05-31T18:29:59Z')), 12);
  assert.equal(completedYears('2013-06', new Date('2026-05-31T18:30:00Z')), 13);
  assert.equal(completedYears('2013-06', new Date('2027-05-31T18:29:59Z')), 13);
  assert.equal(completedYears('2013-06', new Date('2027-05-31T18:30:00Z')), 14);
});

test('experience cannot become negative before the start month', () => {
  assert.equal(completedYears('2013-06', new Date('2013-05-01T00:00:00Z')), 0);
  assert.equal(completedYears('2013-06', new Date('2013-06-01T00:00:00Z')), 0);
});

test('an invalid start month does not replace the rendered fallback', () => {
  assert.equal(completedYears('2013-13'), null);
  assert.equal(completedYears('June 2013'), null);
});
