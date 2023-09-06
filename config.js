import dotenv from "dotenv";
import { promisify } from "util";
import * as fs from "fs";

dotenv.config();

export const executeConfig = async () => {
  let googlePrivateKey = null;
  if (process.env.GOOGLE_PRIVATE_KEY) {
    const readFileAsync = promisify(fs.readFile);
    googlePrivateKey = await readFileAsync(process.env.GOOGLE_PRIVATE_KEY, {
      encoding: "utf8",
    });
    googlePrivateKey = JSON.parse(googlePrivateKey);
  }

  global.configs = {
    // Untuk defaultnya view didalam pages
    routePath: "pages",
    excepts: ["console", "assets", "live"],
    google_private_key: process.env.GOOGLE_PRIVATE_KEY,
    // Hak akses google sheet
    gsheet: {
      docId: process.env.GOOGLE_SPREADSHEET_ID,
      exported: {
        file: "List File",
        route: "List Entry point",
      },
      creds: {
        email: googlePrivateKey?.client_email || null,
        key: googlePrivateKey?.private_key.replace(/\\n/g, "\n") || null,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      },
    },
  };
};
