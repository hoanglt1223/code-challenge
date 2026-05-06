// Function name and parameter `n` come from the challenge spec.
// Assume n is a non-negative integer. For n <= 0 we return 0.

var sum_to_n_a = function (n) {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n) {
  let total = 0;
  for (let current = 1; current <= n; current++) total += current;
  return total;
};

var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return Array.from({ length: n }, (_unused, index) => index + 1).reduce(
    (sum, current) => sum + current,
    0,
  );
};

if (require.main === module) {
  for (const inputN of [0, 1, 5, 100, -3]) {
    console.log(`n=${inputN}`, sum_to_n_a(inputN), sum_to_n_b(inputN), sum_to_n_c(inputN));
  }
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
