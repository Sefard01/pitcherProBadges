
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Approximate character width calculator for crisp SVG layouts
function estimateTextWidth(text, fontSize = 11, isBold = false) {
  const charWidth = isBold ? 7.5 : 6.8;
  return Math.ceil(text.length * charWidth) + 14;
}

// ==========================================
// DYNAMIC SVG BADGE ENGINE ROUTE
// Example: /api/badge?label=LOC&value=2215&color=007acc&style=for-the-badge
// ==========================================
app.get('/api/badge', (req, res) => {
  const label = (req.query.label || 'Badge').trim();
  const value = (req.query.value || 'Value').trim();
  const color = req.query.color || '007acc';        // Value background hex
  const labelColor = req.query.labelColor || '333333'; // Label background hex
  const style = req.query.style || 'flat';             // flat | for-the-badge | rounded

  const isForTheBadge = style === 'for-the-badge';
  
  // Dynamic sizing (Sabhi styles ka size ab standard 20px rahega)
  const fontSize = 11;
  const height = 20; 
  const radius = style === 'rounded' ? 6 : (isForTheBadge ? 0 : 3);
  const textY = 14;

  const labelText = isForTheBadge ? label.toUpperCase() : label;
  const valueText = isForTheBadge ? value.toUpperCase() : value;

  const labelWidth = Math.max(30, estimateTextWidth(labelText, fontSize, false));
  const valueWidth = Math.max(30, estimateTextWidth(valueText, fontSize, true));
  const totalWidth = labelWidth + valueWidth;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#${labelColor.replace('#', '')}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="#${color.replace('#', '')}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana, Geneva, DejaVu Sans, sans-serif" font-size="${fontSize}">
    <!-- Label Shadow + Text -->
    <text x="${labelWidth / 2}" y="${textY}" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="${textY - 1}">${labelText}</text>

    <!-- Value Shadow + Text -->
    <text x="${labelWidth + valueWidth / 2}" y="${textY}" fill="#010101" fill-opacity=".3">${valueText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="${textY - 1}" font-weight="bold">${valueText}</text>
  </g>
</svg>
  `.trim();

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
  
  res.status(200).send(svg);
});

app.listen(PORT, () => {
  console.log(` PitcherPro Badge Service running on http://localhost:${PORT}`);
});
