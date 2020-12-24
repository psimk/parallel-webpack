import "lodash";
import "moment";

const fibonacci = (n) => (n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2));

const N = 5;

console.log(`Fibonacci for ${N} is ${fibonacci(N)}.`);
