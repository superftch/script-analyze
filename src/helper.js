import chalk from "chalk";
import { join } from "path";

/**
 *
 * @return {void}
 */
global.clearln = () =>
  process.platform === "win32" ? console.clear() : process.stdout.write("\x1Bc");

/**
 *
 * @param {string} text
 * @return {void}
 */
export const printProgress = (text) => {
  if (process.platform === "win32") {
    console.log(text);
  } else {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(text);
  }
};

export const print = {
  /**
   *
   * @param {Array<Object>} args
   * @return {void}
   */
  default: (...args) => {
    console.info(chalk.whiteBright(...args));
  },

  /**
   *
   * @param {Array<Object>} args
   * @return {void}
   */
  magenta: (...args) => {
    console.info(chalk.magentaBright(...args));
  },

  /**
   *
   * @param {Array<Object>} args
   * @return {void}
   */
  info: (...args) => {
    console.info(chalk.blue(...args));
  },

  /**
   *
   * @param {Array<Object>} args
   * @return {void}
   */
  success: (...args) => {
    console.info(chalk.green(...args));
  },

  /**
   *
   * @param {Array<Object>} args
   * @return {void}
   */
  warn: (...args) => {
    console.info(chalk.yellow(...args));
  },

  /**
   *
   * @param {Array<Object>} args
   * @return {void}
   */
  error: (...args) => {
    console.error(chalk.redBright(...args));
  },
};

/**
 *
 * @param {Array<Object>} args
 * @return {Object}
 */
export const defineArgs = async (...args) => {
  const { argv } = process;
  const result = {};
  const optLists = [];

  for await (let arg of args) {
    const isRequired = arg.includes("!");
    const isOptions = arg.includes("--");

    arg = arg.replace("!", "");
    arg = arg.replace("--", "");
    global[arg] = undefined;
    for await (const argvItem of argv) {
      if (argvItem.includes(arg)) {
        let _, value;
        if (!isOptions) {
          [_, value] = argvItem.split("=");
        } else {
          value = true;
        }

        result[arg] = value || "";
        global[arg] = value;
        !isOptions ? print.default(arg + ": " + value) : optLists.push(`--${arg}`);
      }
    }

    if (isRequired && (global[arg] == "" || !global[arg])) {
      print.error(`The ${arg} argument cannot be empty!`);
      process.exit(1);
    }
  }

  if (optLists.length > 0) {
    print.magenta("Options: " + optLists.join(", ") + "\n");
  } else {
    print.default("");
  }

  return result;
};

/**
 *
 * @param {string} path
 * @return {string|boolean}
 */
export const extractRoute = (path) => {
  const mainRoute = `/${configs.routePath}/`;
  const index = path.indexOf(mainRoute);
  const match = path.match(new RegExp(`\/${configs.routePath}\/(.*)`));

  if (match) {
    let splittedMatch = match[1]?.split("/");
    let isFile = splittedMatch[0]?.split(".").length > 1;

    if (isFile) {
      const extractedPath = join(path.substring(0, index), match[1]);
      let pathLists = extractedPath.split("/");
      // Hapus path paling depan
      pathLists = pathLists
        .filter((_, i) => {
          return i != 0;
        })
        ?.map((value) => {
          // Hapus extensions file
          const values = value.split(".");
          return values[0];
        });

      const validRoute = "/" + pathLists.join("/");
      return validRoute;
    }
  }

  return false;
};

/**
 *
 * @param {Array<Object>} args
 * @return {void}
 */
export const exportGlobalHelper = (...args) => {
  args.forEach((arg) => {
    eval(`global.${arg} = ${arg}`);
  });
};
