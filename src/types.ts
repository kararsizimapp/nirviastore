export type UserRole = 'admin' | 'dealer';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  dealerId?: string; // If user belongs to a dealer
}

export interface ProductImage {
  id: string;
  originalUrl: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  width?: number;
  height?: number;
  uploadDate: string;
  order: number;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  sku: string;
  barcode: string;
  stock: number;
  price?: number; // Override price if different from product base
}

export interface Product {
  id: string;
  name: string;
  code: string; // SKU
  barcode: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  colors: string[];
  sizes: string[];
  variants: ProductVariant[];
  stock: number; // Total or general stock
  price: number; // Genel satış fiyatı
  dealerPrice: number; // Bayi alış fiyatı
  discountedPrice?: number;
  vatRate: number; // KDV % (e.g. 20)
  status: 'active' | 'passive';
  isNew?: boolean;
  isCampaign?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  imagePath?: string;
  imageName?: string;
  imageContentType?: string;
  imageSize?: number;
  images: ProductImage[];
}

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface Dealer {
  id: string;
  code: string; // Bayi Kodu (e.g., BAYI-101)
  companyName: string;
  authorizedPerson: string;
  phone: string;
  email: string;
  taxOffice: string;
  taxNumber: string;
  city: string;
  district: string;
  address: string;
  status: 'active' | 'passive';
  registerDate: string;
  
  // Financial metrics
  totalPurchases: number; // Toplam Alış Tutarı
  totalPayments: number;  // Toplam Ödeme
  remainingBalance: number; // Kalan Bakiye
  overdueBalance: number; // Vadesi Geçmiş Bakiye
  paymentStatus: PaymentStatus;
  lastPaymentDate?: string;
  lastPurchaseDate?: string;
  adminNote?: string;

  // Login credentials for dealer portal
  username?: string;
  password?: string;

  // Custom prices per product
  customPrices?: Record<string, number>; // productId -> customDealerPrice
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  variantId?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
  totalAmount: number; // quantity * unitPrice - discount + KDV
}

export interface PurchaseRecord {
  id: string;
  dealerId: string;
  purchaseNumber: string; // e.g. SAT-2026-001
  purchaseDate: string;
  dueDate: string; // Vade Tarihi
  items: PurchaseItem[];
  subtotal: number;
  totalDiscount: number;
  totalVat: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  description?: string;
  createdAt: string;
}

export type PaymentMethod = 'nakit' | 'havale' | 'eft' | 'kredi_karti' | 'cek' | 'diger';

export interface PaymentRecord {
  id: string;
  dealerId: string;
  paymentNumber: string; // e.g. ODM-2026-001
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  documentNumber?: string;
  description?: string;
  recordedBy: string;
  createdAt: string;
}

export type TransactionType = 'purchase' | 'payment' | 'return' | 'discount' | 'debit_adj' | 'credit_adj';

export interface AccountTransaction {
  id: string;
  dealerId: string;
  date: string;
  transactionType: TransactionType;
  description: string;
  debit: number;  // Borç (bayinin borcu artar)
  credit: number; // Alacak (bayinin ödemesi / alacağı artar)
  balance: number; // İşlem sonrası bakiye
  recordedBy: string;
  referenceId?: string; // purchaseId or paymentId
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  entityType: 'product' | 'dealer' | 'purchase' | 'payment' | 'system';
  entityId?: string;
}

export interface FilterState {
  search: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus: 'all' | 'in_stock' | 'out_of_stock' | 'critical';
  isNew?: boolean;
  isCampaign?: boolean;
  isFeatured?: boolean;
}
