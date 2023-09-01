#!/usr/bin/env node
import { program } from "commander";
import { executeConfig } from "./config.js";
import * as search from "./src/searchIndex.js";
import { exportGlobalHelper } from "./src/helper.js";

// Init config
executeConfig();

exportGlobalHelper("print", "defineArgs", "printProgress", "extractRoute");

const version = "1.0.0";

program.version(version);

// Pencarian file yang include dengan kata kunci
program
  .command("search")
  .description("Cari file yang include dengan kata kunci")
  .option("--withRoute")
  .action(() => {
    search.start();
  });

program.parse(process.argv);
