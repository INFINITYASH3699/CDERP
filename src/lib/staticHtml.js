// lib/staticHtml.js
import fs from 'fs';
import path from 'path';

export function getStaticHtml(filename) {
  try {
    const filePath = path.join(process.cwd(), 'src/pages', `${filename}.html`);
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading static HTML file ${filename}:`, error);
    return '';
  }
}