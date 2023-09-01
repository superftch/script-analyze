#!/usr/bin/env node
import { program } from "commander";
import * as search from "./src/searchIndex.js";

const version = "1.0.0";

program.version(version);

program
  .command("search")
  .description("Cari file yang include dengan kata kunci")
  .action(() => {
    search.initialize();
  });

program.parse(process.argv);
