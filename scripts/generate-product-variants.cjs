async function main() {
  const fs = await import("node:fs");
  const products = JSON.parse(fs.readFileSync("./data/merged-products.json", "utf8"));
  const rows = [];

  for (const product of products) {
    let sizes = Array.isArray(product.sizes)
      ? product.sizes
      : String(product.sizes)
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean);
    let colors = Array.isArray(product.colors)
      ? product.colors
      : String(product.colors)
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean);

    if (sizes.length === 0) sizes = [""];
    if (colors.length === 0) colors = [""];

    for (const size of sizes) {
      for (const color of colors) {
        rows.push({
          productId: product.product_id,
          sku: `${product.product_id}-${size}-${color}`,
          size,
          color,
          priceNgn: product.price.replace(/,/g, ""),
          stock: product.stock || 10,
        });
      }
    }
  }

  fs.writeFileSync(
    "./data/auto-product-variants.csv",
    [
      "productId,sku,size,color,priceNgn,stock",
      ...rows.map((row) => `${row.productId},${row.sku},${row.size},${row.color},${row.priceNgn},${row.stock}`),
    ].join("\n"),
  );

  console.log("auto-product-variants.csv generated with", rows.length, "rows");
}

main().catch(console.error);
