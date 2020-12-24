import { Configuration, Stats } from "webpack";
import { join } from "path";
import * as util from "./util";
import chalk from "chalk";
import { WorkerRun } from "./types";

type WebpackImport = {
  default: typeof import("webpack");
};

const USER_WEBPACK_PATH = join(process.cwd(), "/node_modules/webpack");

const webpackRun = async (config: Configuration) => {
  const { default: webpack } = (await import(USER_WEBPACK_PATH).catch(
    () => import("webpack")
  )) as WebpackImport;

  return new Promise<string | undefined>(async (resolve, reject) =>
    webpack(config).run((error, stats) => {
      if (error) {
        return reject(error);
      }

      if (stats?.hasErrors()) {
        return reject(stats.toJson()?.errors);
      }

      return resolve(stats?.toString());
    })
  );
};

const parseBuildTitle = (config: Configuration) => config.name || config.output?.filename;

export const run: WorkerRun = async (path, options, index = 0) => {
  if (options?.logLevel) {
    util.logger.setLevel(options.logLevel);
  }

  util.timer.start("bundling");

  let config;

  try {
    // load the webpack configurations again
    config = (await util.readWebpackConfig(path, options))[index];
    util.logger.debug(false, `From '${path}', using:`, config);

    // in theory an error shouldn't occur here, as the main process should have
    // already loaded these same configs and potentially already caught an error
    // but keeping it here for 'just in case'
  } catch (error) {
    util.logger.error(error);
    return;
  }

  // parse the title and decorate it with color
  const title = util.logger.decorateTitle(parseBuildTitle(config));

  // attempt bundling
  try {
    util.logger.log(false, `Started Bundling ${title}`);

    const stats = await webpackRun(config);

    util.logger.success(true, `Finished Bundling ${title}`);
    util.logger.success(false, `Bundled in ${util.formatTime(util.timer.end("bundling")!)}`);
    if (stats && options?.emitStats) {
      util.logger.log(false, `Stats\n`, chalk.yellowBright(stats));
    }
  } catch (error) {
    util.logger.error(false, title, error);
  }
};

export function getWorkerId() {
  return process.env.JEST_WORKER_ID;
}
