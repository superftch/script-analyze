import chalk from "chalk";

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
    global[arg] = undefined;
    argv.forEach((argvItem) => {
      if (argvItem.includes(arg)) {
        const [_, value] = argvItem.split("=");
        result[arg] = value || "";
        global[arg] = value;
        print.default(arg + ": " + value);
      }
    });
  });

  return result;
};
