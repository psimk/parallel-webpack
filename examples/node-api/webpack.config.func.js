const path = require("path");

module.exports = (prefix) => ({
  devtool: false,
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: `${prefix}-func.bundle.js`,
  },
});
