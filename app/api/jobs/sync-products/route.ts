import { NextResponse } from "next/server";
import { syncProductsFromGoogleSheetCsv } from "@/server/services/sync/google-sheet-products";

export const runtime = "nodejs";

function getSecretFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return req.headers.get("x-sync-secret")?.trim() || "";
}

export async function POST(req: Request) {
  const configuredSecret = process.env.PRODUCT_SYNC_SECRET?.trim();
  const requestSecret = getSecretFromRequest(req);

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "PRODUCT_SYNC_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!requestSecret || requestSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL?.trim();
  if (!csvUrl) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_CSV_URL is not configured" },
      { status: 500 },
    );
  }

  try {
    const summary = await syncProductsFromGoogleSheetCsv(csvUrl);
    return NextResponse.json(
      {
        ok: true,
        message: "Product sync completed",
        summary,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown sync error";
    return NextResponse.json(
      {
        error: `Sync failed: ${details}`,
      },
      { status: 500 },
    );
  }
}
