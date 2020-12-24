import type JestWorker from "jest-worker";
import type { FarmOptions, ForkOptions } from "jest-worker/build/types";
import type * as util from "./util";

type WorkerOptions = Pick<
  FarmOptions,
  "maxRetries" | "numWorkers" | "resourceLimits" | "enableWorkerThreads"
> & {
  forkOptions?: Exclude<ForkOptions, "stdio">;
};

export type ParallelWebpackOptions = WorkerOptions & {
  emitStats?: boolean;
  arguments?: unknown[];
  logLevel?: typeof util.logger["level"];
};

export type WorkerRun = (
  configPath: string,
  options?: ParallelWebpackOptions,
  index?: number
) => Promise<void>;

export interface Worker extends JestWorker {
  run: WorkerRun;
}
