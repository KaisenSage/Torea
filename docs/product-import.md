# Product Import Workflow (Google Form + Excel)

Use this flow to load all 17 TORÉA products into the database.

## 1) Collect data in Google Sheet
- Keep one row per variant/SKU.
- Include required columns from `data/products-template.csv`.

## 2) Export to CSV
- In Google Sheets: File -> Download -> Comma-separated values (.csv)
- Save as `data/products.csv`

## 3) Run database migration (first time)
- `npm run prisma:migrate`
- `npm run prisma:generate`

## 4) Import products
- `npm run products:import -- data/products.csv`

## Required CSV columns
- `slug`
- `name`
- `sku`
- `priceNgn`

## Optional CSV columns
- `description`
- `size`
- `color`
- `stock`
- `allowBackorder`
- `isActive`
- `cloudflareImageId`
- `imageAlt`
- `imageSortOrder`

## Notes
- Prices are provided in NGN (`priceNgn`) and converted to kobo automatically.
- Re-running import updates existing products/variants by `slug` and `sku`.
- Add your Instagram URL to `.env.local` as `NEXT_PUBLIC_INSTAGRAM_URL`.

## Automatic sync from Google Forms/Sheets
- Follow [docs/google-sheet-auto-sync.md](docs/google-sheet-auto-sync.md) to trigger automatic product sync on each Google Form submission.
