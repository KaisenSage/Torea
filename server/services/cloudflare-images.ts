export function getCloudflareDeliveryUrl(imageId: string, variant = "public") {
  const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;

  if (!accountHash) {
    throw new Error("CLOUDFLARE_IMAGES_ACCOUNT_HASH is not configured");
  }

  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

type CreateDirectUploadResponse = {
  result: {
    id: string;
    uploadURL: string;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
};

export async function createCloudflareDirectUploadUrl() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;

  if (!accountId || !token) {
    throw new Error("Cloudflare Images credentials are not configured");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Cloudflare direct upload failed with status ${res.status}`);
  }

  const json = (await res.json()) as CreateDirectUploadResponse;

  if (!json.success) {
    throw new Error(json.errors?.[0]?.message || "Failed to create upload URL");
  }

  return json.result;
}
