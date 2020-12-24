import JestWorker from "jest-worker";
import { ParallelWebpackOptions, Worker } from "./types";

import * as util from "./util";

export default async function run(paths: string[], options?: ParallelWebpackOptions) {
  if (options?.logLevel) {
    util.logger.setLevel(options.logLevel);
  }

  util.logger.debug(true, `Passed options:`, options);

  options = {
    ...options,
    forkOptions: {
      ...options?.forkOptions,
      // below maps to ["stdin", "stdout", "stderr"] (https://nodejs.org/api/child_process.html#child_process_options_stdio);
      // "ipc" just makes sure that the forked process has a way of communicating with the main (this) process
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    },
  };

  util.logger.debug(true, `Used options:`, options);

  // create worker farm
  const worker = new JestWorker(require.resolve("./worker"), options) as Worker;

  // start timer for all compilations
  util.timer.start("all");

  // execute all compilations
  await Promise.all(
    paths.flatMap(async (path) => {
      try {
        // because webpack configs can contain factory functions which return multiple configs
        // we first have to read this config and get the total number of configs
        const configs = await util.readWebpackConfig(path, options);
        util.logger.debug(true, `Read from '${path}':`, configs);
        return Promise.all(configs.map((_, index) => worker.run(path, options, index)));
      } catch (error) {
        util.logger.error(error);
      }
    })
  );

  // end timer for all compilations
  util.logger.log(true, `Total bundle time ${util.formatTime(util.timer.end("all")!)}`);

  // wait for the workers to gracefully shutdown
  const { forceExited } = await worker.end();
  if (forceExited) {
    util.logger.error(false, "Workers failed to exit gracefully");
  }
}
