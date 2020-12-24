const webpack = require("webpack");

const webpackPromise = (config) =>
  new Promise(async (resolve, reject) =>
    webpack(config, (error, stats) => {
      if (error) {
        reject(error.stack || error);
      } else {
        // TODO: handle stats?.hasErrors()
        resolve(stats);
      }
    })
  );

(async () => {
  console.log("Building PROD");
  await webpackPromise(require("./webpack.config.prod"));
  console.log("Done Building PROD");

  console.log("Building MULTI");
  await webpackPromise(require("./webpack.config.multi"));
  console.log("Done Building MULTI");

  console.log("Building FUNC");
  await webpackPromise(require("./webpack.config.func"));
  console.log("Done Building FUNC");
})();
