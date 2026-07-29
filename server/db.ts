import fs from 'fs';
import path from 'path';
import { 
  Product, Dealer, PurchaseRecord, PaymentRecord, 
  AccountTransaction, AuditLog, User 
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  dealers: Dealer[];
  purchases: PurchaseRecord[];
  payments: PaymentRecord[];
  transactions: AccountTransaction[];
  auditLogs: AuditLog[];
  categories: string[];
  brands: string[];
}

// Initial Seed Data
const defaultData: DatabaseSchema = {
  users: [
    {
      id: 'usr-admin-1',
      username: 'admin',
      name: 'Sistem Yöneticisi',
      email: 'admin@bayisistemi.com',
      role: 'admin',
    },
    {
      id: 'usr-dealer-1',
      username: 'bayi1',
      name: 'Marmara Spor Ltd. Şti.',
      email: 'info@marmaraspor.com',
      role: 'dealer',
      dealerId: 'dlr-101',
    },
    {
      id: 'usr-dealer-2',
      username: 'bayi2',
      name: 'Ege Atletik Mağazaları',
      email: 'siparis@egeatletik.com',
      role: 'dealer',
      dealerId: 'dlr-102',
    }
  ],
  categories: ['Ayakkabı', 'Tekstil', 'Çanta & Aksesuar', 'Spor Ekipmanları'],
  brands: ['Nike', 'Adidas', 'Puma', 'Hummel', 'Under Armour', 'Venum'],
  products: [
    {
      id: 'prd-101',
      name: 'Pro Runner Elite Koşu Ayakkabısı',
      code: 'PRD-RN-01',
      barcode: '8690001122331',
      brand: 'Nike',
      category: 'Ayakkabı',
      subcategory: 'Koşu',
      description: 'Yüksek darbe emici tabanlı, nefes alabilir file yüzeyli performans koşu ayakkabısı.',
      colors: ['Siyah', 'Beyaz', 'Kırmızı'],
      sizes: ['40', '41', '42', '43', '44'],
      variants: [
        { id: 'v-1', productId: 'prd-101', color: 'Siyah', size: '41', sku: 'PRD-RN-01-BLK-41', barcode: '8690001122332', stock: 15 },
        { id: 'v-2', productId: 'prd-101', color: 'Siyah', size: '42', sku: 'PRD-RN-01-BLK-42', barcode: '8690001122333', stock: 20 },
        { id: 'v-3', productId: 'prd-101', color: 'Beyaz', size: '43', sku: 'PRD-RN-01-WHT-43', barcode: '8690001122334', stock: 8 },
        { id: 'v-4', productId: 'prd-101', color: 'Kırmızı', size: '42', sku: 'PRD-RN-01-RED-42', barcode: '8690001122335', stock: 5 },
      ],
      stock: 48,
      price: 3450,
      dealerPrice: 2200,
      discountedPrice: 3100,
      vatRate: 20,
      status: 'active',
      isNew: true,
      isCampaign: true,
      isFeatured: true,
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-02-01T12:00:00.000Z',
      images: [
        {
          id: 'img-1',
          originalUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          optimizedUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
          fileName: 'nike_red_shoes.jpg',
          fileType: 'image/jpeg',
          fileSize: 184200,
          width: 800,
          height: 800,
          uploadDate: '2026-01-10T10:00:00.000Z',
          order: 1,
          isMain: true
        }
      ]
    },
    {
      id: 'prd-102',
      name: 'Tech Fleece Fermuarlı Eşofman Üstü',
      code: 'PRD-TS-02',
      barcode: '8690001122340',
      brand: 'Adidas',
      category: 'Tekstil',
      subcategory: 'Eşofman',
      description: 'Termal sıcaklık sağlayan, pamuk karışımlı premium esnek kumaşlı eşofman üstü.',
      colors: ['Gri', 'Siyah', 'Lacivert'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      variants: [
        { id: 'v-10', productId: 'prd-102', color: 'Gri', size: 'M', sku: 'PRD-TS-02-GRY-M', barcode: '8690001122341', stock: 12 },
        { id: 'v-11', productId: 'prd-102', color: 'Gri', size: 'L', sku: 'PRD-TS-02-GRY-L', barcode: '8690001122342', stock: 18 },
        { id: 'v-12', productId: 'prd-102', color: 'Lacivert', size: 'L', sku: 'PRD-TS-02-NVY-L', barcode: '8690001122343', stock: 4 },
      ],
      stock: 34,
      price: 2850,
      dealerPrice: 1750,
      vatRate: 20,
      status: 'active',
      isNew: true,
      isFeatured: true,
      createdAt: '2026-01-15T14:30:00.000Z',
      updatedAt: '2026-02-05T09:15:00.000Z',
      images: [
        {
          id: 'img-2',
          originalUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
          optimizedUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
          fileName: 'jacket_grey.jpg',
          fileType: 'image/jpeg',
          fileSize: 142000,
          width: 800,
          height: 800,
          uploadDate: '2026-01-15T14:30:00.000Z',
          order: 1,
          isMain: true
        }
      ]
    },
    {
      id: 'prd-103',
      name: 'Pro Training 30L Spor Sırt Çantası',
      code: 'PRD-BG-03',
      barcode: '8690001122350',
      brand: 'Puma',
      category: 'Çanta & Aksesuar',
      subcategory: 'Sırt Çantası',
      description: 'Su geçirmez alt tabanlı, ayakkabı bölmeli ve laptop cepli ergonomik spor sırt çantası.',
      colors: ['Siyah', 'Antrasit'],
      sizes: ['Standart'],
      variants: [
        { id: 'v-20', productId: 'prd-103', color: 'Siyah', size: 'Standart', sku: 'PRD-BG-03-BLK-STD', barcode: '8690001122351', stock: 6 },
      ],
      stock: 6, // Critical stock!
      price: 1450,
      dealerPrice: 890,
      vatRate: 20,
      status: 'active',
      isCampaign: true,
      createdAt: '2026-01-20T11:00:00.000Z',
      updatedAt: '2026-02-10T16:00:00.000Z',
      images: [
        {
          id: 'img-3',
          originalUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          optimizedUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
          fileName: 'backpack_black.jpg',
          fileType: 'image/jpeg',
          fileSize: 110000,
          width: 800,
          height: 800,
          uploadDate: '2026-01-20T11:00:00.000Z',
          order: 1,
          isMain: true
        }
      ]
    },
    {
      id: 'prd-104',
      name: 'Authentic Kulüp Maç Forması',
      code: 'PRD-FR-04',
      barcode: '8690001122360',
      brand: 'Hummel',
      category: 'Tekstil',
      subcategory: 'Forma',
      description: 'Ter tutmayan Dri-Fit dokuma, havalandırma panelleri ve özel amblem baskılı profesyonel forma.',
      colors: ['Kırmızı', 'Mavi', 'Sarı'],
      sizes: ['S', 'M', 'L', 'XL'],
      variants: [
        { id: 'v-30', productId: 'prd-104', color: 'Kırmızı', size: 'M', sku: 'PRD-FR-04-RED-M', barcode: '8690001122361', stock: 25 },
        { id: 'v-31', productId: 'prd-104', color: 'Mavi', size: 'L', sku: 'PRD-FR-04-BLU-L', barcode: '8690001122362', stock: 30 }
      ],
      stock: 55,
      price: 1850,
      dealerPrice: 1150,
      vatRate: 20,
      status: 'active',
      isNew: true,
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-12T10:00:00.000Z',
      images: [
        {
          id: 'img-4',
          originalUrl: 'https://images.unsplash.com/photo-1580089580638-83904ab28a8f?w=800&auto=format&fit=crop&q=80',
          optimizedUrl: 'https://images.unsplash.com/photo-1580089580638-83904ab28a8f?w=800&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1580089580638-83904ab28a8f?w=400&auto=format&fit=crop&q=80',
          fileName: 'sports_jersey.jpg',
          fileType: 'image/jpeg',
          fileSize: 135000,
          width: 800,
          height: 800,
          uploadDate: '2026-01-22T08:00:00.000Z',
          order: 1,
          isMain: true
        }
      ]
    },
    {
      id: 'prd-105',
      name: 'Pro Match Karbon Tenis Raketi',
      code: 'PRD-EQ-05',
      barcode: '8690001122370',
      brand: 'Under Armour',
      category: 'Spor Ekipmanları',
      subcategory: 'Tenis',
      description: '300g %100 Karbon lifli yapısı ile yüksek kontrol ve dönüş spini sağlayan profesyonel raket.',
      colors: ['Siyah-Sarı'],
      sizes: ['G3'],
      variants: [
        { id: 'v-40', productId: 'prd-105', color: 'Siyah-Sarı', size: 'G3', sku: 'PRD-EQ-05-YLW-G3', barcode: '8690001122371', stock: 3 }
      ],
      stock: 3, // Critical stock!
      price: 6800,
      dealerPrice: 4500,
      vatRate: 20,
      status: 'active',
      isFeatured: true,
      createdAt: '2026-01-25T13:00:00.000Z',
      updatedAt: '2026-02-14T11:00:00.000Z',
      images: [
        {
          id: 'img-5',
          originalUrl: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=800&auto=format&fit=crop&q=80',
          optimizedUrl: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=800&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=400&auto=format&fit=crop&q=80',
          fileName: 'tennis_racket.jpg',
          fileType: 'image/jpeg',
          fileSize: 150000,
          width: 800,
          height: 800,
          uploadDate: '2026-01-25T13:00:00.000Z',
          order: 1,
          isMain: true
        }
      ]
    }
  ],
  dealers: [
    {
      id: 'dlr-101',
      code: 'BAYI-3401',
      companyName: 'Marmara Spor Giyim Ltd. Şti.',
      authorizedPerson: 'Ahmet Yılmaz',
      phone: '0212 555 12 34',
      email: 'info@marmaraspor.com',
      taxOffice: 'Mecidiyeköy V.D.',
      taxNumber: '1234567890',
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Halaskargazi Cad. No:142 Kat:3 Şişli / İstanbul',
      status: 'active',
      registerDate: '2025-06-15T09:00:00.000Z',
      totalPurchases: 148500,
      totalPayments: 110000,
      remainingBalance: 38500,
      overdueBalance: 12500,
      paymentStatus: 'partial',
      lastPaymentDate: '2026-02-10T14:30:00.000Z',
      lastPurchaseDate: '2026-02-18T11:20:00.000Z',
      adminNote: 'Müşteri ödemelerini genelde 30 gün vadede yapıyor. Güvenilir bayi, indirim talep ediyor.'
    },
    {
      id: 'dlr-102',
      code: 'BAYI-3502',
      companyName: 'Ege Atletik Mağazaları A.Ş.',
      authorizedPerson: 'Mehmet Demir',
      phone: '0232 444 88 99',
      email: 'siparis@egeatletik.com',
      taxOffice: 'Kordon V.D.',
      taxNumber: '9876543210',
      city: 'İzmir',
      district: 'Konak',
      address: 'Atatürk Cad. No:88 Alsancak Konak / İzmir',
      status: 'active',
      registerDate: '2025-08-20T11:00:00.000Z',
      totalPurchases: 235000,
      totalPayments: 235000,
      remainingBalance: 0,
      overdueBalance: 0,
      paymentStatus: 'paid',
      lastPaymentDate: '2026-02-15T16:00:00.000Z',
      lastPurchaseDate: '2026-02-12T09:45:00.000Z',
      adminNote: 'Peşin çalışan VIP bayi. %5 ekstra iskonto uygulanmaktadır.'
    },
    {
      id: 'dlr-103',
      code: 'BAYI-0603',
      companyName: 'Anadolu Spor Malzemeleri San. Tic.',
      authorizedPerson: 'Zeynep Kaya',
      phone: '0312 310 45 67',
      email: 'anadolu@spormarket.com',
      taxOffice: 'Ulus V.D.',
      taxNumber: '4567891230',
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Tunalı Hilmi Cad. No:45 Çankaya / Ankara',
      status: 'active',
      registerDate: '2025-10-01T10:30:00.000Z',
      totalPurchases: 92000,
      totalPayments: 45000,
      remainingBalance: 47000,
      overdueBalance: 47000,
      paymentStatus: 'overdue',
      lastPaymentDate: '2026-01-05T12:00:00.000Z',
      lastPurchaseDate: '2026-01-20T15:10:00.000Z',
      adminNote: 'Son ödeme tarihi 30 gün geçti. Hatırlatma araması yapıldı.'
    }
  ],
  purchases: [
    {
      id: 'pur-101',
      dealerId: 'dlr-101',
      purchaseNumber: 'SAT-2026-001',
      purchaseDate: '2026-01-15T10:00:00.000Z',
      dueDate: '2026-02-15T10:00:00.000Z',
      items: [
        {
          id: 'pi-1',
          productId: 'prd-101',
          productName: 'Pro Runner Elite Koşu Ayakkabısı',
          productCode: 'PRD-RN-01',
          color: 'Siyah',
          size: '42',
          quantity: 20,
          unitPrice: 2200,
          discount: 2000,
          vatRate: 20,
          totalAmount: 50400 // (20 * 2200 - 2000) * 1.20
        },
        {
          id: 'pi-2',
          productId: 'prd-102',
          productName: 'Tech Fleece Fermuarlı Eşofman Üstü',
          productCode: 'PRD-TS-02',
          color: 'Gri',
          size: 'L',
          quantity: 15,
          unitPrice: 1750,
          discount: 0,
          vatRate: 20,
          totalAmount: 31500 // (15 * 1750) * 1.20
        }
      ],
      subtotal: 70250,
      totalDiscount: 2000,
      totalVat: 13650,
      grandTotal: 81900,
      paidAmount: 50000,
      remainingAmount: 31900,
      paymentStatus: 'partial',
      description: 'Ocak Ayı Toplu Siparişi',
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
      id: 'pur-102',
      dealerId: 'dlr-101',
      purchaseNumber: 'SAT-2026-002',
      purchaseDate: '2026-02-18T11:20:00.000Z',
      dueDate: '2026-03-18T11:20:00.000Z',
      items: [
        {
          id: 'pi-3',
          productId: 'prd-104',
          productName: 'Authentic Kulüp Maç Forması',
          productCode: 'PRD-FR-04',
          color: 'Kırmızı',
          size: 'M',
          quantity: 30,
          unitPrice: 1150,
          discount: 1500,
          vatRate: 20,
          totalAmount: 39600
        }
      ],
      subtotal: 34500,
      totalDiscount: 1500,
      totalVat: 6600,
      grandTotal: 39600,
      paidAmount: 0,
      remainingAmount: 39600,
      paymentStatus: 'pending',
      description: 'Yeni Sezon Forma Siparişi',
      createdAt: '2026-02-18T11:20:00.000Z'
    }
  ],
  payments: [
    {
      id: 'pay-101',
      dealerId: 'dlr-101',
      paymentNumber: 'ODM-2026-001',
      paymentDate: '2026-01-20T14:00:00.000Z',
      amount: 50000,
      paymentMethod: 'havale',
      documentNumber: 'DEK-998811',
      description: 'SAT-2026-001 Kısmi Havale Ödemesi',
      recordedBy: 'admin',
      createdAt: '2026-01-20T14:00:00.000Z'
    },
    {
      id: 'pay-102',
      dealerId: 'dlr-101',
      paymentNumber: 'ODM-2026-002',
      paymentDate: '2026-02-10T14:30:00.000Z',
      amount: 60000,
      paymentMethod: 'kredi_karti',
      documentNumber: 'KK-442110',
      description: 'Cari Hesap Ara Ödemesi',
      recordedBy: 'admin',
      createdAt: '2026-02-10T14:30:00.000Z'
    }
  ],
  transactions: [
    {
      id: 'tx-101',
      dealerId: 'dlr-101',
      date: '2026-01-15T10:00:00.000Z',
      transactionType: 'purchase',
      description: 'Fatura / Ürün Alışı (SAT-2026-001)',
      debit: 81900,
      credit: 0,
      balance: 81900,
      recordedBy: 'admin',
      referenceId: 'pur-101'
    },
    {
      id: 'tx-102',
      dealerId: 'dlr-101',
      date: '2026-01-20T14:00:00.000Z',
      transactionType: 'payment',
      description: 'Havale Ödemesi (DEK-998811)',
      debit: 0,
      credit: 50000,
      balance: 31900,
      recordedBy: 'admin',
      referenceId: 'pay-101'
    },
    {
      id: 'tx-103',
      dealerId: 'dlr-101',
      date: '2026-02-10T14:30:00.000Z',
      transactionType: 'payment',
      description: 'Kredi Kartı Ödemesi (KK-442110)',
      debit: 0,
      credit: 60000,
      balance: -28100, // Geçici alacaklı durum
      recordedBy: 'admin',
      referenceId: 'pay-102'
    },
    {
      id: 'tx-104',
      dealerId: 'dlr-101',
      date: '2026-02-18T11:20:00.000Z',
      transactionType: 'purchase',
      description: 'Fatura / Ürün Alışı (SAT-2026-002)',
      debit: 39600,
      credit: 0,
      balance: 11500, // Güncel bakiye
      recordedBy: 'admin',
      referenceId: 'pur-102'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2026-02-18T11:20:00.000Z',
      user: 'admin',
      action: 'Satın Alma Oluşturuldu',
      details: 'Marmara Spor için 39.600,00 ₺ tutarında SAT-2026-002 numaralı alış kaydı girildi.',
      entityType: 'purchase',
      entityId: 'pur-102'
    },
    {
      id: 'log-2',
      timestamp: '2026-02-10T14:30:00.000Z',
      user: 'admin',
      action: 'Ödeme Kaydedildi',
      details: 'Marmara Spor bayisinden 60.000,00 ₺ Kredi Kartı tahsilatı eklendi.',
      entityType: 'payment',
      entityId: 'pay-102'
    }
  ]
};

// Database Storage Helper
export class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db.json, re-initializing seed data:', err);
        this.data = defaultData;
        this.save();
      }
    } else {
      this.data = defaultData;
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  // Audit log helper
  public addAuditLog(user: string, action: string, details: string, entityType: AuditLog['entityType'], entityId?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      details,
      entityType,
      entityId
    };
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  // Products
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public saveProduct(product: Product, username: string = 'admin'): Product {
    const existingIndex = this.data.products.findIndex(p => p.id === product.id);
    product.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      this.data.products[existingIndex] = product;
      this.addAuditLog(username, 'Ürün Güncellendi', `${product.name} (${product.code}) ürünü güncellendi.`, 'product', product.id);
    } else {
      if (!product.createdAt) product.createdAt = new Date().toISOString();
      this.data.products.unshift(product);
      this.addAuditLog(username, 'Yeni Ürün Eklendi', `${product.name} (${product.code}) yeni ürün olarak sisteme eklendi.`, 'product', product.id);
    }

    // Auto extract new brands / categories if needed
    if (product.category && !this.data.categories.includes(product.category)) {
      this.data.categories.push(product.category);
    }
    if (product.brand && !this.data.brands.includes(product.brand)) {
      this.data.brands.push(product.brand);
    }

    this.save();
    return product;
  }

  public deleteProduct(id: string, username: string = 'admin'): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    const p = this.data.products[index];
    this.data.products.splice(index, 1);
    this.addAuditLog(username, 'Ürün Silindi', `${p.name} (${p.code}) ürünü sistemden silindi.`, 'product', id);
    this.save();
    return true;
  }

  // Dealers
  public getDealers(): Dealer[] {
    return this.data.dealers;
  }

  public getDealerById(id: string): Dealer | undefined {
    return this.data.dealers.find(d => d.id === id);
  }

  public saveDealer(dealer: Dealer, username: string = 'admin'): Dealer {
    const existingIndex = this.data.dealers.findIndex(d => d.id === dealer.id);
    if (existingIndex >= 0) {
      this.data.dealers[existingIndex] = dealer;
      this.addAuditLog(username, 'Bayi Güncellendi', `${dealer.companyName} (${dealer.code}) bayi bilgileri güncellendi.`, 'dealer', dealer.id);
    } else {
      if (!dealer.registerDate) dealer.registerDate = new Date().toISOString();
      this.data.dealers.unshift(dealer);
      this.addAuditLog(username, 'Yeni Bayi Tanımlandı', `${dealer.companyName} (${dealer.code}) yeni bayi olarak kaydedildi.`, 'dealer', dealer.id);
    }
    this.save();
    return dealer;
  }

  public deleteDealer(id: string, username: string = 'admin'): boolean {
    const index = this.data.dealers.findIndex(d => d.id === id);
    if (index === -1) return false;
    const d = this.data.dealers[index];
    this.data.dealers.splice(index, 1);
    this.addAuditLog(username, 'Bayi Silindi', `${d.companyName} (${d.code}) bayisi silindi.`, 'dealer', id);
    this.save();
    return true;
  }

  public saveCategories(categories: string[], username: string = 'admin'): string[] {
    this.data.categories = categories;
    this.addAuditLog(username, 'Kategoriler Güncellendi', `Kategori listesi güncellendi.`, 'system');
    this.save();
    return this.data.categories;
  }

  public saveBrands(brands: string[], username: string = 'admin'): string[] {
    this.data.brands = brands;
    this.addAuditLog(username, 'Markalar Güncellendi', `Marka listesi güncellendi.`, 'system');
    this.save();
    return this.data.brands;
  }

  // Recalculate Dealer Balance & Payment Status
  public recalculateDealerFinancials(dealerId: string) {
    const dealer = this.getDealerById(dealerId);
    if (!dealer) return;

    const purchases = this.data.purchases.filter(p => p.dealerId === dealerId);
    const payments = this.data.payments.filter(p => p.dealerId === dealerId);

    const totalPurchases = purchases.reduce((acc, p) => acc + p.grandTotal, 0);
    const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingBalance = Math.max(0, totalPurchases - totalPayments);

    let overdueBalance = 0;
    const now = new Date();
    purchases.forEach(p => {
      if (p.dueDate && new Date(p.dueDate) < now && p.remainingAmount > 0) {
        overdueBalance += p.remainingAmount;
      }
    });

    let paymentStatus: Dealer['paymentStatus'] = 'paid';
    if (remainingBalance <= 0) {
      paymentStatus = 'paid';
    } else if (overdueBalance > 0) {
      paymentStatus = 'overdue';
    } else if (totalPayments > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'pending';
    }

    dealer.totalPurchases = totalPurchases;
    dealer.totalPayments = totalPayments;
    dealer.remainingBalance = remainingBalance;
    dealer.overdueBalance = overdueBalance;
    dealer.paymentStatus = paymentStatus;

    if (payments.length > 0) {
      const sortedPayments = [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      dealer.lastPaymentDate = sortedPayments[0].paymentDate;
    }
    if (purchases.length > 0) {
      const sortedPurchases = [...purchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      dealer.lastPurchaseDate = sortedPurchases[0].purchaseDate;
    }

    this.save();
  }

  // Purchases
  public addPurchase(purchase: PurchaseRecord, username: string = 'admin'): PurchaseRecord {
    this.data.purchases.unshift(purchase);

    // Update stock for purchased products
    purchase.items.forEach(item => {
      const p = this.getProductById(item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        if (item.variantId && p.variants) {
          const v = p.variants.find(v => v.id === item.variantId);
          if (v) {
            v.stock = Math.max(0, v.stock - item.quantity);
          }
        }
      }
    });

    // Add Account Transaction (Cari Hareket)
    const dealer = this.getDealerById(purchase.dealerId);
    const currentBalance = (dealer?.remainingBalance || 0) + purchase.grandTotal;

    const tx: AccountTransaction = {
      id: `tx-${Date.now()}`,
      dealerId: purchase.dealerId,
      date: purchase.purchaseDate || new Date().toISOString(),
      transactionType: 'purchase',
      description: `Fatura / Ürün Alışı (${purchase.purchaseNumber})`,
      debit: purchase.grandTotal,
      credit: 0,
      balance: currentBalance,
      recordedBy: username,
      referenceId: purchase.id
    };
    this.data.transactions.unshift(tx);

    this.recalculateDealerFinancials(purchase.dealerId);
    this.addAuditLog(username, 'Satın Alma Kaydedildi', `${dealer?.companyName} için ${purchase.grandTotal.toLocaleString('tr-TR')} ₺ tutarlı alış kaydedildi.`, 'purchase', purchase.id);

    this.save();
    return purchase;
  }

  // Payments
  public addPayment(payment: PaymentRecord, username: string = 'admin'): PaymentRecord {
    this.data.payments.unshift(payment);

    const dealer = this.getDealerById(payment.dealerId);
    const currentBalance = (dealer?.remainingBalance || 0) - payment.amount;

    const tx: AccountTransaction = {
      id: `tx-${Date.now()}`,
      dealerId: payment.dealerId,
      date: payment.paymentDate || new Date().toISOString(),
      transactionType: 'payment',
      description: `${payment.paymentMethod.toUpperCase()} Ödemesi (${payment.documentNumber || payment.paymentNumber})`,
      debit: 0,
      credit: payment.amount,
      balance: currentBalance,
      recordedBy: username,
      referenceId: payment.id
    };
    this.data.transactions.unshift(tx);

    this.recalculateDealerFinancials(payment.dealerId);
    this.addAuditLog(username, 'Ödeme Kaydedildi', `${dealer?.companyName} bayisinden ${payment.amount.toLocaleString('tr-TR')} ₺ ödeme alındı.`, 'payment', payment.id);

    this.save();
    return payment;
  }
}

export const db = new Database();
