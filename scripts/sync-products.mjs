import { syncProductsFromGoogleSheetCsv } from "../server/services/sync/google-sheet-products.ts";
import "dotenv/config";
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFzV9KoZNIT1pDwlgfpKxaJL6EeKIB2a3PDpi5RFpyNmYQKnllC0fXynwLgeuR1Cf4AbVCmH47BVEW/pub?output=csv";

syncProductsFromGoogleSheetCsv(csvUrl)
  .then(result => {
    console.log("Sync complete:", result);
    process.exit(0);
  })
  .catch(err => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
