import chalk from "chalk";
import * as fs from "fs";
import { dirname, extname, join } from "path";
import readline from "readline";
import { fileURLToPath } from "url";

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
    const paths = data
      .map((v) => {
        return v.path;
      })
      .join("\n");

    // Hanya mapping routes
    const routes = data
      ?.filter((v) => {
        return v.route != null;
      })
      ?.map((v) => {
        return v.route;
      })
      ?.join("\n");

    // Buat direktori baru
    if (output) {
      exportedPath = exportedPath + "/" + output;
    } else {
      exportedPath =
        exportedPath +
        `/${search}_${(Math.random() + 1).toString(36).substring(7)}`;
    }

    isDirExist = fs.existsSync(exportedPath);

    if (!isDirExist) {
      await fs.promises.mkdir(exportedPath);

      // Export data berupa json
      fs.writeFileSync(
        exportedPath + "/detail.json",
        JSON.stringify(data, null, 2)
      );

      // Export data berupa text
      fs.writeFileSync(exportedPath + "/file.txt", paths);

      // Export data routing text jika withRoute bernilai true
      if (opts.withRoute) {
        fs.writeFileSync(exportedPath + "/routes.txt", routes);
      }
    }

    print.success("\n\nSuccessfully exported file to " + exportedPath);
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
    const originalPath = filePath;
    filePath = path + "/" + filePath;
    const isDirectory = fs.lstatSync(filePath).isDirectory();
    // Jika directory maka panggil recursive
    if (isDirectory) {
      await walkRead(search, filePath, allowExt, exported, opts);
      continue;
    } else {
      const extName = extname(originalPath);
      // Jika file extension sesuai
      if (extName.includes(allowExt) && extName !== "") {
        printProgress(
          chalk.blue("Analyze file " + filePath.replace("../", ""))
        );

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
          // Hanya ambil yang sesuai pencarian
          if (line.toLowerCase().includes(search.toLowerCase())) {
            const detail = {};
            detail.line = index;
            detail.search = search;
            detail.content = line.trim();
            data.details.push(detail);
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
  await defineArgs("!key", "!path", "!allowExt", "output", "--withRoute");

  // Jalankan fungsi utama
  execute(key, path, allowExt, { withRoute });
};
