const parallelWebpack = require("../../lib/cjs").default;
const { join } = require("path");

(async () => {
  console.log("Building Parallel");
  await parallelWebpack(
    ["./webpack.config.prod", "./webpack.config.func", "./webpack.config.multi"].map((path) =>
      join(process.cwd(), path)
    ),
    { arguments: ["hello"] }
  );
  console.log("Done Building Parallel");
})();
