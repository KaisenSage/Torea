import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/server/db/prisma";

type NewsletterPayload = {
  email?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as NewsletterPayload;
    const email = normalizeEmail(payload.email || "");

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    // Keep newsletter independent from Prisma schema changes by using a small dedicated SQL table.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$executeRaw`
      INSERT INTO newsletter_subscribers (id, email)
      VALUES (${randomUUID()}, ${email})
      ON CONFLICT (email) DO NOTHING;
    `;

    // send welcome email via Resend if configured
    try {
      const { sendNewsletterWelcome } = await import("@/server/services/email");
      await sendNewsletterWelcome(email);
    } catch {}

    return NextResponse.json(
      { ok: true, message: "Subscription successful. You will hear from us soon." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to subscribe at the moment." }, { status: 500 });
  }
}