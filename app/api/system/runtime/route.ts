import { NextResponse } from "next/server";
import { getRuntimeStatus } from "@/server/config/runtime";

export async function GET() {
  const status = getRuntimeStatus();

  return NextResponse.json(status, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
