// Assume n is a non-negative integer. For n <= 0 we return 0.

var sum_to_n_a = function (n) {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
};

var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
};

if (require.main === module) {
  for (const n of [0, 1, 5, 100, -3]) {
    console.log(`n=${n}`, sum_to_n_a(n), sum_to_n_b(n), sum_to_n_c(n));
  }
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
