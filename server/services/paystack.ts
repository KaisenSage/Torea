const PAYSTACK_BASE_URL = "https://api.paystack.co";

type InitializePaystackInput = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

type InitializeResponseData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type VerifyTransactionData = {
  status: "success" | "failed" | string;
  reference: string;
  amount: number;
  paid_at?: string;
  metadata?: {
    orderId?: string;
  };
};

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  return key;
}

export async function initializePaystackTransaction(input: InitializePaystackInput) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getPaystackSecretKey()}`,
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: "NGN",
      metadata: input.metadata,
    }),
  });

  if (!res.ok) {
    let providerMessage = "";

    try {
      const errorJson = (await res.json()) as Partial<PaystackResponse<unknown>> & { error?: string };
      providerMessage = errorJson.message || errorJson.error || "";
    } catch {
      providerMessage = "";
    }

    throw new Error(
      providerMessage
        ? `Paystack initialize failed (${res.status}): ${providerMessage}`
        : `Paystack initialize failed with status ${res.status}`,
    );
  }

  const json = (await res.json()) as PaystackResponse<InitializeResponseData>;

  if (!json.status) {
    throw new Error(json.message || "Failed to initialize transaction");
  }

  return json.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Paystack verify failed with status ${res.status}`);
  }

  const json = (await res.json()) as PaystackResponse<VerifyTransactionData>;

  if (!json.status) {
    throw new Error(json.message || "Failed to verify transaction");
  }

  return json.data;
}
