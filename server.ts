import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { Product, Dealer, PurchaseRecord, PaymentRecord, ProductImage } from './src/types';

const app = express();
const PORT = 3000;

// Enable JSON and CORS
app.use(express.json({ limit: '20mb' }));
app.use(cors());

// Ensure Uploads Directory Exists (in public/uploads for static builds like Vercel)
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.webp';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB Limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya WEBP yükleyin.'));
    }
  }
});

// API ROUTES //

// 1. Authentication Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const users = db.get().users;
  
  // Quick demo passwords check or match username
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }

  // Simple validation for demo
  if (password === 'admin123' || password === 'bayi123' || password === '123456' || username === user.username) {
    return res.json({ user });
  }

  return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
});

// 2. File Upload via Multipart
app.post('/api/upload-file', (req: Request, res: Response) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Dosya çok büyük. Maksimum 10 MB yükleyebilirsiniz.' });
      }
      return res.status(400).json({ error: err.message || 'Görsel yüklenirken bir hata oluştu.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Yüklenecek bir dosya bulunamadı.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const imageMeta: ProductImage = {
      id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalUrl: fileUrl,
      optimizedUrl: fileUrl,
      thumbnailUrl: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      width: 1000,
      height: 1000,
      uploadDate: new Date().toISOString(),
      order: 1,
      isMain: false
    };

    return res.json({ success: true, image: imageMeta });
  });
});

// 3. Image URL Upload (Server-side fetch with smart Imgur & OpenGraph HTML extraction)
async function getDirectImageBuffer(targetUrl: string, depth = 0): Promise<{ buffer: Buffer; contentType: string; finalUrl: string }> {
  if (depth > 3) throw new Error('Çok fazla yönlendirme isteği.');

  let requestUrl = targetUrl.trim();

  // Handle Imgur URLs (e.g., https://imgur.com/a/VkhbhMf or https://imgur.com/VkhbhMf)
  const imgurMatch = requestUrl.match(/imgur\.com\/(?:a|gallery)?\/([a-zA-Z0-9]+)/i);
  
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    if (imgurMatch && imgurMatch[1]) {
      const directImgurUrl = `https://i.imgur.com/${imgurMatch[1]}.jpg`;
      return getDirectImageBuffer(directImgurUrl, depth + 1);
    }
    throw new Error(`Görsel indirilemedi (${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';

  // If response is an image
  if (contentType.includes('image') || contentType.includes('octet-stream')) {
    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType, finalUrl: requestUrl };
  }

  // If response is HTML (e.g., Imgur album page, Pinterest, blog page)
  if (contentType.includes('text/html')) {
    const html = await response.text();

    // Look for og:image or twitter:image
    const ogMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']/i);

    if (ogMatch && ogMatch[1]) {
      let ogUrl = ogMatch[1].replace(/&amp;/g, '&');
      if (ogUrl.startsWith('//')) ogUrl = 'https:' + ogUrl;
      else if (ogUrl.startsWith('/')) {
        const u = new URL(requestUrl);
        ogUrl = `${u.origin}${ogUrl}`;
      }
      return getDirectImageBuffer(ogUrl, depth + 1);
    }

    // Direct i.imgur.com match inside HTML
    const imgurDirectMatch = html.match(/https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(?:jpg|jpeg|png|webp|gif)/i);
    if (imgurDirectMatch && imgurDirectMatch[0]) {
      return getDirectImageBuffer(imgurDirectMatch[0], depth + 1);
    }

    // Try i.imgur.com/ID.jpg if imgur ID exists
    if (imgurMatch && imgurMatch[1]) {
      const directImgurUrl = `https://i.imgur.com/${imgurMatch[1]}.jpg`;
      return getDirectImageBuffer(directImgurUrl, depth + 1);
    }

    throw new Error('Bağlantı sayfasında doğrudan resim elementi (og:image) bulunamadı.');
  }

  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType: contentType || 'image/jpeg', finalUrl: requestUrl };
}

app.post('/api/upload-url', async (req: Request, res: Response) => {
  const { imageUrl } = req.body;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'Geçerli bir görsel bağlantısı giriniz.' });
  }

  try {
    const urlObj = new URL(imageUrl.trim());
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ error: 'Geçersiz protokol. URL http:// veya https:// ile başlamalıdır.' });
    }

    const { buffer, contentType, finalUrl } = await getDirectImageBuffer(imageUrl.trim());

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Bağlantıdaki görsel çok büyük. Maksimum 10 MB desteklenir.' });
    }

    // Determine extension
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
    else if (finalUrl.endsWith('.png')) ext = '.png';
    else if (finalUrl.endsWith('.webp')) ext = '.webp';

    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const filename = `url_image_${uniqueSuffix}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${filename}`;
    const imageMeta: ProductImage = {
      id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalUrl: localUrl,
      optimizedUrl: localUrl,
      thumbnailUrl: localUrl,
      fileName: filename,
      fileType: contentType || 'image/jpeg',
      fileSize: buffer.length,
      width: 1000,
      height: 1000,
      uploadDate: new Date().toISOString(),
      order: 1,
      isMain: false
    };

    return res.json({ success: true, image: imageMeta });
  } catch (err: any) {
    console.error('Error fetching image URL:', err.message);

    // Clean up Imgur URL if possible on fallback
    let cleanUrl = imageUrl.trim();
    const imgurMatch = cleanUrl.match(/imgur\.com\/(?:a|gallery)?\/([a-zA-Z0-9]+)/i);
    if (imgurMatch && imgurMatch[1] && !cleanUrl.includes('i.imgur.com')) {
      cleanUrl = `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }

    const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'remote_image.jpg';
    const imageMeta: ProductImage = {
      id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalUrl: cleanUrl,
      optimizedUrl: cleanUrl,
      thumbnailUrl: cleanUrl,
      fileName: filename.length < 30 ? filename : 'remote_image.jpg',
      fileType: 'image/jpeg',
      fileSize: 100000,
      width: 1000,
      height: 1000,
      uploadDate: new Date().toISOString(),
      order: 1,
      isMain: false
    };
    return res.json({ success: true, image: imageMeta });
  }
});

// 4. Products APIs
app.get('/api/products', (req: Request, res: Response) => {
  const products = db.getProducts();
  return res.json(products);
});

app.post('/api/products', (req: Request, res: Response) => {
  const productData = req.body as Product;
  if (!productData.name || !productData.code) {
    return res.status(400).json({ error: 'Ürün adı ve ürün kodu zorunludur.' });
  }

  if (!productData.id) {
    productData.id = `prd-${Date.now()}`;
  }

  const saved = db.saveProduct(productData, req.headers['x-user-name'] as string || 'admin');
  return res.json(saved);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const productData = req.body as Product;
  productData.id = id;

  const saved = db.saveProduct(productData, req.headers['x-user-name'] as string || 'admin');
  return res.json(saved);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteProduct(id, req.headers['x-user-name'] as string || 'admin');
  if (!success) {
    return res.status(404).json({ error: 'Ürün bulunamadı.' });
  }
  return res.json({ success: true });
});

// 5. Product Excel Export & Bulk Import
app.get('/api/products/export', (req: Request, res: Response) => {
  const products = db.getProducts();
  const exportData = products.map(p => ({
    'Ürün Kodu': p.code,
    'Ürün Adı': p.name,
    'Barkod': p.barcode,
    'Marka': p.brand,
    'Kategori': p.category,
    'Alt Kategori': p.subcategory || '',
    'Stok Adedi': p.stock,
    'Genel Satış Fiyatı (TL)': p.price,
    'Bayi Alış Fiyatı (TL)': p.dealerPrice,
    'KDV Oranı (%)': p.vatRate,
    'Durum': p.status === 'active' ? 'Aktif' : 'Pasif'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="urun_listesi.xlsx"');
  return res.send(buffer);
});

app.post('/api/products/import', upload.single('excel'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Lütfen bir Excel veya CSV dosyası yükleyin.' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let importedCount = 0;
    rawData.forEach(row => {
      const name = row['Ürün Adı'] || row['Name'] || row['Urun Adi'];
      const code = row['Ürün Kodu'] || row['SKU'] || row['Code'] || `PRD-IMP-${Date.now()}`;
      if (name && code) {
        const newProd: Product = {
          id: `prd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: String(name),
          code: String(code),
          barcode: String(row['Barkod'] || row['Barcode'] || ''),
          brand: String(row['Marka'] || row['Brand'] || 'Genel'),
          category: String(row['Kategori'] || row['Category'] || 'Genel'),
          subcategory: String(row['Alt Kategori'] || ''),
          description: String(row['Açıklama'] || row['Description'] || ''),
          colors: [],
          sizes: [],
          variants: [],
          stock: Number(row['Stok Adedi'] || row['Stok'] || row['Stock'] || 0),
          price: Number(row['Genel Satış Fiyatı (TL)'] || row['Fiyat'] || row['Price'] || 0),
          dealerPrice: Number(row['Bayi Alış Fiyatı (TL)'] || row['Bayi Fiyatı'] || row['Dealer Price'] || 0),
          vatRate: Number(row['KDV Oranı (%)'] || row['KDV'] || 20),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: [
            {
              id: `img-default-${Date.now()}`,
              originalUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
              optimizedUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
              thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
              fileName: 'default_product.jpg',
              fileType: 'image/jpeg',
              fileSize: 100000,
              uploadDate: new Date().toISOString(),
              order: 1,
              isMain: true
            }
          ]
        };
        db.saveProduct(newProd, 'admin');
        importedCount++;
      }
    });

    // Clean up file
    fs.unlinkSync(req.file.path);

    return res.json({ success: true, count: importedCount });
  } catch (err: any) {
    console.error('Excel import error:', err);
    return res.status(500).json({ error: 'Excel dosyası işlenirken hata oluştu: ' + err.message });
  }
});

// 6. Dealer APIs
app.get('/api/dealers', (req: Request, res: Response) => {
  const dealers = db.getDealers();
  return res.json(dealers);
});

app.post('/api/dealers', (req: Request, res: Response) => {
  const dealerData = req.body as Dealer;
  if (!dealerData.companyName || !dealerData.code) {
    return res.status(400).json({ error: 'Firma adı ve bayi kodu zorunludur.' });
  }

  if (!dealerData.id) {
    dealerData.id = `dlr-${Date.now()}`;
  }

  const saved = db.saveDealer(dealerData, req.headers['x-user-name'] as string || 'admin');
  return res.json(saved);
});

app.put('/api/dealers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const dealerData = req.body as Dealer;
  dealerData.id = id;

  const saved = db.saveDealer(dealerData, req.headers['x-user-name'] as string || 'admin');
  return res.json(saved);
});

app.delete('/api/dealers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteDealer(id, req.headers['x-user-name'] as string || 'admin');
  if (!success) {
    return res.status(404).json({ error: 'Bayi bulunamadı.' });
  }
  return res.json({ success: true });
});

// Dealer Purchases
app.get('/api/dealers/:id/purchases', (req: Request, res: Response) => {
  const { id } = req.params;
  const purchases = db.get().purchases.filter(p => p.dealerId === id);
  return res.json(purchases);
});

app.post('/api/dealers/:id/purchases', (req: Request, res: Response) => {
  const { id } = req.params;
  const purchaseData = req.body as PurchaseRecord;
  purchaseData.dealerId = id;
  if (!purchaseData.id) {
    purchaseData.id = `pur-${Date.now()}`;
  }

  const saved = db.addPurchase(purchaseData, req.headers['x-user-name'] as string || 'admin');
  return res.json(saved);
});

// Dealer Payments
app.get('/api/dealers/:id/payments', (req: Request, res: Response) => {
  const { id } = req.params;
  const payments = db.get().payments.filter(p => p.dealerId === id);
  return res.json(payments);
});

app.post('/api/dealers/:id/payments', (req: Request, res: Response) => {
  const { id } = req.params;
  const paymentData = req.body as PaymentRecord;
  paymentData.dealerId = id;
  if (!paymentData.id) {
    paymentData.id = `pay-${Date.now()}`;
  }

  const saved = db.addPayment(paymentData, req.headers['x-user-name'] as string || 'admin');
  return res.json(saved);
});

// Dealer Current Account Transactions
app.get('/api/dealers/:id/transactions', (req: Request, res: Response) => {
  const { id } = req.params;
  const txs = db.get().transactions.filter(t => t.dealerId === id);
  return res.json(txs);
});

// 7. Audit Logs & System Categories/Brands
app.get('/api/audit-logs', (req: Request, res: Response) => {
  return res.json(db.get().auditLogs);
});

app.get('/api/brands-categories', (req: Request, res: Response) => {
  return res.json({
    categories: db.get().categories,
    brands: db.get().brands
  });
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Geçersiz kategori verisi.' });
  }
  const updated = db.saveCategories(categories, req.headers['x-user-name'] as string || 'admin');
  return res.json({ success: true, categories: updated });
});

app.post('/api/brands', (req: Request, res: Response) => {
  const { brands } = req.body;
  if (!Array.isArray(brands)) {
    return res.status(400).json({ error: 'Geçersiz marka verisi.' });
  }
  const updated = db.saveBrands(brands, req.headers['x-user-name'] as string || 'admin');
  return res.json({ success: true, brands: updated });
});

// VITE MIDDLEWARE OR PRODUCTION SERVING //
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
