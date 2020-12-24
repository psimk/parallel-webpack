const path = require("path");

module.exports = () =>
  ["1", "2", "3"].map((prefix) => ({
    devtool: false,
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "lib"),
      filename: `${prefix}-multi.bundle.js`,
    },
  }));
