// generate_manifest.js
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const outFile = path.join(__dirname, 'manifest.json');

if (!fs.existsSync(imagesDir)) {
  console.error('پوشه images/ وجود ندارد. عکس‌ها را داخل آن قرار بده.');
  process.exit(1);
}

const files = fs.readdirSync(imagesDir).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.jpg','.jpeg','.png','.webp','.gif'].includes(ext);
});

const manifest = {};

// این regex هر عدد 7 تا 14 رقمی را از نام فایل استخراج می‌کند (اگر لازم داری عدد دقیق‌تر باشه بگو)
const re = /(\d{7,14})/;

files.forEach(f => {
  const basename = path.parse(f).name;
  const m = basename.match(re);
  if (m) {
    const code = m[1];
    manifest[code] = `/images/${f}`;
  } else {
    if (/^\d+$/.test(basename)) {
      manifest[basename] = `/images/${f}`;
    } else {
      console.warn('کدی از نام فایل استخراج نشد:', f);
    }
  }
});

fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8');
console.log('manifest.json ساخته شد — تعداد:', Object.keys(manifest).length);
