import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

type ClerkEmail = {
  email_address: string;
  id: string;
};

type ClerkUserData = {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string;
};

type ClerkWebhookEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserData;
};

function getPrimaryEmail(data: ClerkUserData) {
  if (!data.email_addresses?.length) {
    return null;
  }

  const primary = data.email_addresses.find(
    (entry) => entry.id === data.primary_email_address_id,
  );

  return primary?.email_address ?? data.email_addresses[0]?.email_address ?? null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  let event: ClerkWebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const email = getPrimaryEmail(event.data);

    if (!email) {
      return NextResponse.json({ error: "User has no email" }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { clerkId: event.data.id },
      create: {
        clerkId: event.data.id,
        email,
        firstName: event.data.first_name,
        lastName: event.data.last_name,
      },
      update: {
        email,
        firstName: event.data.first_name,
        lastName: event.data.last_name,
      },
    });
  }

  if (event.type === "user.deleted") {
    await prisma.user.deleteMany({
      where: {
        clerkId: event.data.id,
      },
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
