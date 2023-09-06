import { executeConfig } from "./config.js";
import * as search from "./src/searchIndex.js";
import { exportGlobalHelper } from "./src/helper.js";

(async () => {
  // Init config
  await executeConfig();

  exportGlobalHelper("print", "defineArgs", "printProgress", "extractRoute");

  search.start();
})();
