import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const spreadsheet = async () => {
  const serviceAccountAuth = new JWT(configs.gsheet.creds);
  const doc = new GoogleSpreadsheet(configs.gsheet.docId, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

export const filterRange = (key, ranges) => {
  for (let y = 0; y < ranges.length; y++) {
    for (let x = 0; x < ranges[y].length; x++) {
      if (ranges[y][x]?.toLowerCase()?.includes(key.toLowerCase())) {
        return { x, y };
      }
    }
  }

  return { y: null, x: null };
};

export const writeAfterIndex = async (key, sheet, ranges, data) => {
  let { y, x } = filterRange(key, ranges);
  let row = y + 1;
  for await (let value of data) {
    sheet.getCell(row, x).value = value;
    row++;
  }
};
