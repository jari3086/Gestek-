const fs = require('fs');
const path = require('path');

let docx;
try {
  docx = require('docx');
} catch (e) {
  console.error('Error importing docx:', e.message);
  process.exit(1);
}

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, PageBreak,
  Header, Footer, PageNumber, ShadingType
} = docx;

// ─── Color palette ────────────────────────────────────────────────
const C = {
  primary: '1B4F72',
  secondary: '2E86C1',
  accent: '85C1E9',
  ligh