type RuntimeStatus = {
  paystack: {
    configured: boolean;
    missing: string[];
  };
};

function isFilled(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function getRuntimeStatus(): RuntimeStatus {
  const missing: string[] = [];

  if (!isFilled(process.env.PAYSTACK_SECRET_KEY)) {
    missing.push("PAYSTACK_SECRET_KEY");
  }

  if (!isFilled(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)) {
    missing.push("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY");
  }

  if (!isFilled(process.env.NEXT_PUBLIC_APP_URL)) {
    missing.push("NEXT_PUBLIC_APP_URL");
  }

  return {
    paystack: {
      configured: missing.length === 0,
      missing,
    },
  };
}
