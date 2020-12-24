import { performance } from "perf_hooks";
import chalk from "chalk";
import { Configuration } from "webpack";
import { isArray, isFunction, isSerializableObject } from "isntnt";
import { ParallelWebpackOptions } from "./types";

export const timer = new (class Timer {
  timeMap = new Map<string, number>();

  /**
   * @param label - the label given to the new timer,
   *  use the same value when calling `timer.end(<label>)`
   */
  start(label: string): void {
    this.timeMap.set(label, performance.now());
  }

  /**
   * @param label - the label of the timer that should stop.
   * if no timer with the passed `label` is active, then it will return `null`
   */
  end(label: string): number | null {
    return this.timeMap.has(label) ? performance.now() - this.timeMap.get(label)! : null;
  }
})();

const PREFIX_COPY = "[WEBPACK]";

type LogLevel = "silent" | "debug" | "default" | "error";
type LogFunc = "debug" | "success" | "log" | "error";

export const logger = new (class Logger {
  level: LogLevel = "default";

  setLevel(level: this["level"] = "default"): void {
    this.level = level;
  }

  // based on https://github.com/prettier/prettier/blob/master/src/cli/logger.js#L26
  shouldLog(logger: LogFunc) {
    switch (this.level) {
      case "silent":
        return false;
      case "debug":
        if (logger === "debug") {
          return true;
        }
      case "default":
        if (logger === "log" || logger === "success") {
          return true;
        }
      case "error":
        return logger === "error";
    }
  }

  logFuncFactory(funcName: LogFunc, consoleFuncName: "log" | "error", prefix: string = "") {
    return (newLine: boolean, ...text: unknown[]) => {
      if (this.shouldLog(funcName))
        console[consoleFuncName](
          `${newLine ? "\n" : ""}${prefix}`,
          ...text.map((text) => (isSerializableObject(text) ? JSON.stringify(text, null, 2) : text))
        );
    };
  }

  decorateTitle = chalk.cyan.bold;

  success = this.logFuncFactory("success", "log", chalk.green(PREFIX_COPY));
  log = this.logFuncFactory("log", "log", chalk.blue(PREFIX_COPY));
  debug = this.logFuncFactory("debug", "log");
  error = this.logFuncFactory("error", "error", chalk.red(PREFIX_COPY));
})();

/**
 * @param time - time in milliseconds
 */
export function formatTime(time: number): string {
  return chalk.yellow(`${(time / 1000).toFixed(2)}s`);
}

// TODO: could config importing be cached between the main process and the worker?
export async function readWebpackConfig(
  path: string,
  options?: ParallelWebpackOptions
): Promise<Configuration[]> {
  const configOrFunction = (await import(path)).default;

  const configOrConfigs = isFunction(configOrFunction)
    ? configOrFunction(...(options?.arguments ?? []))
    : configOrFunction;

  return isArray(configOrConfigs) ? configOrConfigs : [configOrConfigs];
}
