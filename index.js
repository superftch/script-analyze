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

// Pencarian kata kunci dalam file
program
  .command("search")
  .description("Cari kata kunci yang include dalam file")
  .option("--withRoute")
  .option("--strict")
  .action(search.start);

program.parse(process.argv);
