import readline from "readline";
import {
  prisma,
  toKobo,
  formatNairaFromKobo,
  findProductBySlug,
  upsertVariantImage,
  updateAllVariantPricesBySlug,
  buildImageDeliveryUrl,
} from "./scripts/db-utils.mjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function viewProduct() {
  const slug = await question('Enter product slug (e.g., "skylar-set"): ');

  try {
    const product = await findProductBySlug(slug, {
      variants: {
        orderBy: [{ color: "asc" }, { size: "asc" }],
        include: {
          images: { orderBy: { sortOrder: "asc" } },
        },
      },
      images: { orderBy: { sortOrder: "asc" } },
    });

    console.log(`\n=== ${product.name} ===`);
    console.log(`Slug: ${product.slug}`);
    console.log(`Active: ${product.isActive}`);
    console.log(`Stock total: ${product.stockTotal}`);
    console.log(`Product-level images: ${product.images.length}`);

    product.images.forEach((image, index) => {
      const src = image.imageUrl || image.cloudflareImageId || "(no src)";
      console.log(`  ${index + 1}. [product] ${image.alt || "no alt"} → ${src}`);
    });

    console.log(`\nVariants: ${product.variants.length}`);
    product.variants.forEach((variant) => {
      console.log(
        `  - ${variant.sku} | ${variant.size || "-"} / ${variant.color || "-"} | ${formatNairaFromKobo(variant.priceKobo)} | stock ${variant.stock}`,
      );
      variant.images.forEach((image, index) => {
        const src = image.imageUrl || buildImageDeliveryUrl(image.cloudflareImageId) || image.cloudflareImageId;
        console.log(`      image ${index + 1}: ${image.alt || "no alt"} → ${src}`);
      });
    });

    console.log("");
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
  }
}

async function updateVariantPrices() {
  const slug = await question('Enter product slug (e.g., "skylar-set"): ');
  const priceStr = await question("Enter price in Naira (e.g., 25990): ");

  try {
    const result = await updateAllVariantPricesBySlug(slug, priceStr);
    console.log(
      `\n✓ Updated ${result.count} variant(s) for ${result.product.name} to ${formatNairaFromKobo(result.priceKobo)}\n`,
    );
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
  }
}

async function addProductImage() {
  const slug = await question('Enter product slug (e.g., "skylar-set"): ');
  const imageInput = await question("Cloudflare image ID or full URL: ");
  const alt = await question("Alt text: ");
  const sortOrderStr = await question("Sort order (default 0): ");

  try {
    const product = await findProductBySlug(slug);
    const image = await upsertVariantImage({
      productId: product.id,
      variantId: null,
      imageIdOrUrl: imageInput,
      alt,
      sortOrder: sortOrderStr.trim() ? Number(sortOrderStr) : 0,
    });

    console.log(`\n✓ Added/updated product image for ${product.name} (id: ${image.id})\n`);
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
  }
}

async function addVariantImages() {
  const slug = await question('Enter product slug (e.g., "skylar-set"): ');

  try {
    const product = await findProductBySlug(slug, {
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    });

    if (product.variants.length === 0) {
      throw new Error(`Product "${slug}" has no variants`);
    }

    console.log("\nAvailable variants:");
    product.variants.forEach((variant, index) => {
      console.log(
        `  ${index + 1}. ${variant.sku} (${variant.size || "-"} / ${variant.color || "-"})`,
      );
    });

    const variantChoice = await question("\nSelect variant number: ");
    const variantIndex = Number(variantChoice) - 1;
    const variant = product.variants[variantIndex];

    if (!variant) {
      throw new Error("Invalid variant selection");
    }

    let addMore = true;
    let count = 0;

    while (addMore) {
      const imageInput = await question(
        `\nImage ${count + 1} (Cloudflare ID or full URL): `,
      );
      if (!imageInput.trim()) {
        break;
      }

      const alt = await question("Alt text (optional): ");
      const sortOrderStr = await question("Sort order (default 0): ");
      const color = await question("Color label (optional): ");

      const image = await upsertVariantImage({
        productId: product.id,
        variantId: variant.id,
        imageIdOrUrl: imageInput,
        alt: alt || `${product.name} - ${variant.color || variant.sku}`,
        sortOrder: sortOrderStr.trim() ? Number(sortOrderStr) : count,
        color: color || variant.color || null,
      });

      console.log(`✓ Saved image ${image.id} for ${variant.sku}`);
      count += 1;

      const more = await question("Add another image for this variant? (y/n): ");
      addMore = more.toLowerCase() === "y";
    }

    console.log(`\n✓ Finished. ${count} image(s) added/updated for ${variant.sku}\n`);
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
  }
}

async function main() {
  console.log("\n=== TORÉA Database Editor ===\n");
  console.log("1. Update All Variant Prices");
  console.log("2. Add Product Image");
  console.log("3. View Product");
  console.log("4. Add Variant Images");
  console.log("5. Exit\n");

  const choice = await question("Select option (1-5): ");

  if (choice === "1") {
    await updateVariantPrices();
  } else if (choice === "2") {
    await addProductImage();
  } else if (choice === "3") {
    await viewProduct();
  } else if (choice === "4") {
    await addVariantImages();
  } else if (choice === "5") {
    console.log("\nBye.\n");
  } else {
    console.log("\n✗ Invalid option\n");
  }

  rl.close();
  await prisma.$disconnect();

  if (choice !== "5") {
    console.log("Run again: node edit-db.mjs\n");
  }
}

main();
