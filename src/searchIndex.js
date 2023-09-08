import chalk from "chalk";
import * as fs from "fs";
import { dirname, extname, join } from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { spreadsheet, writeAfterIndex } from "./gsheet.js";

/**
 *
 * @param {string} path
 * @param {string} allowExt
 * @param {string} search
 * @param {Object} opts
 *
 * @return {Promise<void>}
 */
const execute = async (search, path, allowExt, opts = {}) => {
  // Init data
  const data = [];

  // Ambil data include
  await walkRead(search, path, allowExt, data, opts);

  if (data.length > 0) {
    const localPath = join(dirname(fileURLToPath(import.meta.url)), "..");
    let exportedPath = localPath + "/exported";
    let isDirExist = fs.existsSync(exportedPath);

    // jika belum ada buat direktori baru
    if (!isDirExist) {
      fs.mkdirSync(exportedPath);
    }

    // Hanya mapping path
    const paths = data.map((v) => {
      return v.path;
    });

    // Hanya mapping routes
    const routes = data
      ?.filter((v) => {
        return v.route != null;
      })
      ?.map((v) => {
        return v.route;
      });

    // Buat direktori baru
    if (output) {
      exportedPath = join(exportedPath, output);
    } else {
      exportedPath = join(
        exportedPath,
        `${search}_${(Math.random() + 1).toString(36).substring(7)}`,
      );
    }

    isDirExist = fs.existsSync(exportedPath);

    if (!isDirExist) {
      await fs.promises.mkdir(exportedPath);
    }

    // Export data berupa json
    fs.writeFileSync(exportedPath + "/detail.json", JSON.stringify(data, null, 2));

    // Export data berupa text
    fs.writeFileSync(exportedPath + "/file.txt", paths?.join("\n"));

    // Export data routing text jika withRoute bernilai true
    if (opts.withRoute) {
      fs.writeFileSync(exportedPath + "/routes.txt", routes?.join("\n"));
    }

    print.success("\n\nSuccessfully exported file to " + exportedPath);

    if (opts.exportToSheet && configs.google_private_key) {
      try {
        print.info("\nExporting to google sheet..");
        const doc = await spreadsheet();
        const sheetId = doc.sheetsByTitle[output].sheetId;
        const sheet = doc.sheetsById[sheetId];
        await sheet.loadCells("A1:Z");
        const ranges = await sheet.getCellsInRange("A1:Z");

        // Export path ke spreadsheet
        await writeAfterIndex(configs.gsheet.exported.file, sheet, ranges, paths);

        // Export route ke spreadsheet
        await writeAfterIndex(configs.gsheet.exported.route, sheet, ranges, routes);

        // Simpan perubahan data
        await sheet.saveUpdatedCells();
      } catch (error) {
        print.error(error);
      }
    }
  } else {
    print.warn("\nKey didn't match!");
  }
};

/**
 *
 * @param {string} search
 * @param {string} path
 * @param {string} allowExt
 * @param {Array<Object>} exported
 * @param {Object} opts
 *
 * @return {Promise<void>}
 */
const walkRead = async (search, path, allowExt, exported, opts) => {
  if (opts.withRoute && (configs.routePath == "" || !configs.routePath)) {
    print.warn("\nPlease configure routePath first!");
    process.exit(1);
  }

  const filePaths = fs.readdirSync(path);
  for await (let filePath of filePaths) {
    let isExceptedPath =
      configs.excepts?.filter((value) => {
        return join(path, filePath).split("/").includes(value);
      })?.length > 0;

    // Jika path terdaftar di except config maka skip
    if (isExceptedPath) {
      continue;
    }

    const originalPath = filePath;
    filePath = join(path, filePath);
    const isDirectory = fs.lstatSync(filePath).isDirectory();
    // Jika directory maka panggil recursive
    if (isDirectory) {
      await walkRead(search, filePath, allowExt, exported, opts);
      continue;
    } else {
      const extName = extname(originalPath);
      // Jika file extension sesuai
      if (extName.includes(allowExt) && extName !== "") {
        printProgress(chalk.blue("Analyze file " + filePath.replace("../", "")));

        // Baca file
        const fileStream = fs.createReadStream(filePath);
        const lines = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        // Inisialisasi data
        const data = {
          path: filePath.replace("../", ""),
          original: originalPath,
        };

        if (opts.withRoute) {
          const route = extractRoute(filePath.replace("../", ""));
          if (route != false) {
            data.route = route;
          } else {
            data.route = null;
          }
        }

        let index = 1;

        // Inisialisasi list detail
        data.details = [];

        // Mulai melakukan pencarian perbaris
        for await (const line of lines) {
          // Pencarian multi
          let searchValues = [];
          const matches = [...search.matchAll(/{{(.*?)}}/g)];

          const multiSearchValue = matches.map((match) => match[1]);

          if (multiSearchValue.length > 0) {
            searchValues = multiSearchValue;
          } else {
            searchValues = [search];
          }

          for (const searchVal of searchValues) {
            // Pencarian strict atau tidak
            let match = false;
            if (opts.strict) {
              const escapedSearch = searchVal.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

              let pattern;
              if (!searchVal.includes("(")) {
                pattern = new RegExp(`\\b${escapedSearch}\\b`, "gi");
              } else {
                pattern = new RegExp(`${escapedSearch}`, "gi");
              }

              match = line.match(pattern);
            } else {
              match = line.toLowerCase().includes(searchVal.toLowerCase());
            }

            // Hanya ambil yang sesuai pencarian
            if (match) {
              const detail = {};
              detail.line = index;
              detail.search = searchVal;
              detail.content = line.trim();
              data.details.push(detail);
            }
          }

          index++;
        }

        if (data.details.length > 0) {
          exported.push(data);
        }
        continue;
      }
    }
  }
};

export const start = async () => {
  // Bersihkan console
  clearln();

  // Definisikan argumen
  await defineArgs(
    "!key",
    "!path",
    "!allowExt",
    "output",
    "--withRoute",
    "--strict",
    "--exportToSheet",
  );

  // Jalankan fungsi utama
  execute(key, path, allowExt, { withRoute, strict, exportToSheet });
};
