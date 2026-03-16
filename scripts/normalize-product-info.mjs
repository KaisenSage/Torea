import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const inputCsv = fs.readFileSync('./data/ProductInformation - Form Responses 1.csv', 'utf8');
const matrix = parse(inputCsv, { columns: false, skip_empty_lines: true });

const headers = matrix[0];
const rows = matrix.slice(1);

// Find all indexes where 'Product Name' appears
const productNameIndexes = headers.reduce((all, header, idx) => {
  if (header === 'Product Name') all.push(idx);
  return all;
}, []);

const normalized = [];
for (const row of rows) {
  for (let blockIdx = 0; blockIdx < productNameIndexes.length; blockIdx++) {
    const start = productNameIndexes[blockIdx];
    const end = productNameIndexes[blockIdx + 1] || headers.length;
    const sectionHeaders = headers.slice(start, end);
    const sectionValues = row.slice(start, end);
    const product = Object.fromEntries(sectionHeaders.map((h, i) => [h, sectionValues[i] || '']));
    if (product['Product Name']) normalized.push(product);
  }
}

const outputCsv = stringify(normalized, { header: true });
fs.writeFileSync('./data/products-normalized.csv', outputCsv);
console.log('Normalized product info written to data/products-normalized.csv');
