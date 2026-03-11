# Google Sheet Auto Sync (Google Forms -> DB)

This setup syncs product rows from a Google Sheet CSV into PostgreSQL automatically.

## 1) Set environment variables
Add these to `.env.local`:

- `GOOGLE_SHEETS_CSV_URL`: direct CSV export URL for your sheet tab.
- `PRODUCT_SYNC_SECRET`: long random secret string used to protect sync endpoint.

Example CSV URL format:

`https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<TAB_GID>`

## 2) Use the secure sync endpoint
Endpoint:

`POST /api/jobs/sync-products`

Auth header:

`Authorization: Bearer <PRODUCT_SYNC_SECRET>`

## 3) Connect Google Forms responses with Apps Script trigger
In the bound Google Sheet:

1. Extensions -> Apps Script
2. Add this code:

```javascript
const APP_URL = "https://your-domain.com";
const SYNC_SECRET = "your-product-sync-secret";

function syncProductsToStore() {
  UrlFetchApp.fetch(`${APP_URL}/api/jobs/sync-products`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${SYNC_SECRET}`,
    },
    muteHttpExceptions: true,
  });
}
```

3. In Apps Script, open Triggers -> Add Trigger.
4. Choose function `syncProductsToStore`.
5. Event source: `From spreadsheet`.
6. Event type: `On form submit`.

Now each new form response can trigger a product sync.

## 4) Manual test
Run this with your local or deployed app:

```bash
curl -X POST "http://localhost:3000/api/jobs/sync-products" \
  -H "Authorization: Bearer $PRODUCT_SYNC_SECRET"
```

Expected response:

```json
{
  "ok": true,
  "message": "Product sync completed",
  "summary": {
    "processed": 17,
    "skipped": 0,
    "total": 17
  }
}
```

## Notes
- Keep one row per variant/SKU.
- Required columns: `slug`, `name`, `sku`, `priceNgn`.
- Upserts are idempotent by `slug` and `sku`.
- If `cloudflareImageId` is present, image rows are inserted/updated for that product variant.
