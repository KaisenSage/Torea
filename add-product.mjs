import readline from "readline";
import {
  prisma,
  toKobo,
  formatNairaFromKobo,
  findProductBySlug,
  upsertVariantImage,
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

async function promptVariantImages(product, variant) {
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

    await upsertVariantImage({
      productId: product.id,
      variantId: variant.id,
      imageIdOrUrl: imageInput,
      alt: alt || `${product.name} - ${variant.color || variant.sku}`,
      sortOrder: sortOrderStr.trim() ? Number(sortOrderStr) : count,
      color: color || variant.color || null,
    });

    count += 1;
    const more = await question("Add another image for this variant? (y/n): ");
    addMore = more.toLowerCase() === "y";
  }

  return count;
}

async function main() {
  console.log("\n=== Add New Product ===\n");

  try {
    const name = await question("Product name: ");
    const slug = await question("Product slug (e.g., my-product): ");
    const description = await question("Description (optional): ");
    const category = await question("Category (optional): ");
    const priceStr = await question("Default variant price in Naira (e.g., 25990): ");
    const stockStr = await question("Default stock per variant: ");
    const sizesInput = await question("Sizes comma-separated (e.g., M,L): ");
    const colorsInput = await question("Colors comma-separated (e.g., black,grey): ");

    const priceKobo = toKobo(priceStr);
    const stock = Number(stockStr || 0);
    const sizes = sizesInput
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const colors = colorsInput
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        availableSizes: sizes.length ? sizes : null,
        availableColors: colors.length ? colors : null,
        stockTotal: stock * Math.max(1, sizes.length) * Math.max(1, colors.length),
        isActive: true,
      },
    });

    console.log(`\n✅ Product created: ${product.name} (${product.slug})`);

    const variantSizes = sizes.length ? sizes : [null];
    const variantColors = colors.length ? colors : [null];
    const variants = [];

    for (const size of variantSizes) {
      for (const color of variantColors) {
        const skuParts = [product.slug, size, color].filter(Boolean);
        const sku = skuParts.join("-").toLowerCase().replace(/\s+/g, "-");

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku,
            size,
            color,
            priceKobo,
            stock,
          },
        });
        variants.push(variant);
      }
    }

    console.log(`✅ Created ${variants.length} variant(s) at ${formatNairaFromKobo(priceKobo)}`);

    const addImages = await question("\nAdd variant images now? (y/n): ");
    if (addImages.toLowerCase() === "y") {
      for (const variant of variants) {
        console.log(
          `\nVariant: ${variant.sku} (${variant.size || "no size"} / ${variant.color || "no color"})`,
        );
        const imageCount = await promptVariantImages(product, variant);
        console.log(`✓ Added/updated ${imageCount} image(s) for ${variant.sku}`);
      }
    }

    console.log("\n✅ Product setup complete!\n");
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
