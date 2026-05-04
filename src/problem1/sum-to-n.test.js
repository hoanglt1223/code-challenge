const test = require('node:test');
const assert = require('node:assert/strict');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum-to-n');

const cases = [
  [0, 0],
  [1, 1],
  [2, 3],
  [5, 15],
  [10, 55],
  [100, 5050],
  [-3, 0],
];

const impls = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

for (const [name, fn] of Object.entries(impls)) {
  test(name, () => {
    for (const [n, expected] of cases) {
      assert.equal(fn(n), expected, `${name}(${n})`);
    }
  });
}

test('all three agree on a wide range', () => {
  for (let n = 0; n <= 1000; n++) {
    assert.equal(sum_to_n_a(n), sum_to_n_b(n));
    assert.equal(sum_to_n_b(n), sum_to_n_c(n));
  }
});
