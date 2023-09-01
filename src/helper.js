import chalk from "chalk";

/**
 *
 * @return {void}
 */
global.clearln = () => process.stdout.write("\x1Bc");

/**
 *
 * @param {string} text
 * @return {void}
 */
export const printProgress = (text) => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(text);
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
export const defineArgs = (...args) => {
  const { argv } = process;
  const result = {};

  args.forEach((arg) => {
    const isRequired = arg.includes("!");

    global[arg] = undefined;
    arg = arg.replace("!", "");
    argv.forEach((argvItem) => {
      if (argvItem.includes(arg)) {
        const [_, value] = argvItem.split("=");
        result[arg] = value || "";
        global[arg] = value;
        print.default(arg + ": " + value);
      }
    });

    if (isRequired && (global[arg] == "" || !global[arg])) {
      print.error(`The ${arg} argument cannot be empty!`);
      process.exit(1);
    }
  });

  return result;
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
