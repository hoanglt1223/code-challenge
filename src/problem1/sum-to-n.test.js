const test = require('node:test');
const assert = require('node:assert/strict');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum-to-n');

const testCases = [
  [0, 0],
  [1, 1],
  [2, 3],
  [5, 15],
  [10, 55],
  [100, 5050],
  [-3, 0],
];

const implementations = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

for (const [implementationName, implementation] of Object.entries(implementations)) {
  test(implementationName, () => {
    for (const [inputN, expected] of testCases) {
      assert.equal(
        implementation(inputN),
        expected,
        `${implementationName}(${inputN})`,
      );
    }
  });
}

test('all three implementations agree on n = 0..1000', () => {
  for (let inputN = 0; inputN <= 1000; inputN++) {
    assert.equal(sum_to_n_a(inputN), sum_to_n_b(inputN));
    assert.equal(sum_to_n_b(inputN), sum_to_n_c(inputN));
  }
});
