// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// سرو استاتیک برای فرانت و تصاویر
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// بارگذاری manifest
const manifestPath = path.join(__dirname, 'manifest.json');
let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} else {
  console.warn('manifest.json وجود ندارد؛ ابتدا generate_manifest.js را اجرا کن.');
}

// API جستجو
app.get('/api/search', (req, res) => {
  const code = String(req.query.code || '').trim();
  if (!code) return res.status(400).json({ ok:false, message: 'کد وارد نشده' });
  if (!/^\d+$/.test(code)) return res.status(400).json({ ok:false, message: 'فرمت کد معتبر نیست' });

  const rel = manifest[code];
  if (rel) {
    const fullUrl = `${req.protocol}://${req.get('host')}${rel}`;
    return res.json({ ok:true, url: fullUrl });
  } else {
    return res.json({ ok:false, message: 'مدرکی با این کد پیدا نشد' });
  }
});

// دانلود امن
app.get('/download/:code', (req, res) => {
  const code = String(req.params.code || '').trim();
  const rel = manifest[code];
  if (!rel) return res.status(404).send('مدرکی با این کد وجود ندارد');

  const filePath = path.join(__dirname, rel);
  if (!fs.existsSync(filePath)) return res.status(404).send('فایل پیدا نشد');

  res.download(filePath, path.basename(filePath), (err) => {
    if (err) console.error(err);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started http://localhost:${port}`));
