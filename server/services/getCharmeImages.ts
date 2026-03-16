import fs from 'fs';
import { parse } from 'csv-parse/sync';

export function getCharmeImages() {
  const csv = fs.readFileSync('./data/charme-set-images.csv', 'utf8');
  return parse(csv, { columns: true, skip_empty_lines: true });
}
