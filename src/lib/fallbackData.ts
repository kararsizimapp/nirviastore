import { Product, Dealer, PurchaseRecord, PaymentRecord, AccountTransaction, AuditLog } from '../types';

export const FALLBACK_USERS = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    name: 'Sistem Yöneticisi',
    email: 'admin@bayisistemi.com',
    role: 'admin' as const
  },
  {
    id: 'usr-dealer-1',
    username: 'bayi1',
    name: 'Marmara Spor Ltd. Şti.',
    email: 'info@marmaraspor.com',
    role: 'dealer' as const,
    dealerId: 'dlr-101'
  },
  {
    id: 'usr-dealer-2',
    username: 'bayi2',
    name: 'Ege Atletik Mağazaları',
    email: 'siparis@egeatletik.com',
    role: 'dealer' as const,
    dealerId: 'dlr-102'
  }
];

export const FALLBACK_CATEGORIES: string[] = [
  "Kısa Kadın Çorap",
  "Uzun Kadın Çorap"
];

export const FALLBACK_BRANDS: string[] = [
  "Chanel",
  "Adidas",
  "Calvin Klein",
  "Tommy Hilfiger",
  "Alo",
  "Louis Vuitton",
  "Nike",
  "Lacoste",
  "Victoria Secret"
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prd-new-1785320359244",
    name: "Uzun Kadın Çorap",
    code: "UZU-KAD-COR-840",
    barcode: "8698239569292",
    brand: "Calvin Klein",
    category: "Uzun Kadın Çorap",
    subcategory: "",
    description: "Kutu içerisinde 6 çift çorap bulunmaktadır.",
    colors: [],
    sizes: [],
    variants: [],
    stock: 20,
    price: 360,
    dealerPrice: 230,
    vatRate: 20,
    status: "active",
    isNew: true,
    isCampaign: false,
    isFeatured: false,
    createdAt: "2026-07-29T10:19:19.244Z",
    updatedAt: "2026-07-29T10:20:16.613Z",
    images: [
      {
        id: "img-1785320406802-37",
        originalUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        optimizedUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        fileName: "calvin_klein_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 375530,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T10:20:06.802Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785319812931",
    name: "Uzun Kadın Çorap",
    code: "UZU-KAD-COR-747",
    barcode: "8691827773354",
    brand: "Nike",
    category: "Uzun Kadın Çorap",
    subcategory: "",
    description: "Kutu içerisinde 6 çift çorap bulunmaktadır.",
    colors: [],
    sizes: [],
    variants: [],
    stock: 20,
    price: 360,
    dealerPrice: 230,
    vatRate: 20,
    status: "active",
    isNew: true,
    isCampaign: false,
    isFeatured: false,
    createdAt: "2026-07-29T10:10:12.931Z",
    updatedAt: "2026-07-29T10:20:14.195Z",
    images: [
      {
        id: "img-1785319925629-139",
        originalUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
        optimizedUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
        fileName: "nike_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 329884,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T10:12:05.630Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318299525",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-855",
    barcode: "8690144238521",
    brand: "Tommy Hilfiger",
    category: "Kısa Kadın Çorap",
    subcategory: "",
    description: "Kutu içerisinde 5 çift çorap bulunmaktadır.",
    colors: [],
    sizes: [],
    variants: [],
    stock: 20,
    price: 300,
    dealerPrice: 150,
    vatRate: 20,
    status: "active",
    isNew: true,
    isCampaign: false,
    isFeatured: false,
    createdAt: "2026-07-29T09:44:59.525Z",
    updatedAt: "2026-07-29T09:59:55.525Z",
    images: [
      {
        id: "img-1785318357590-321",
        originalUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        optimizedUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        fileName: "tommy_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 288563,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:45:57.590Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318155609",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-537",
    barcode: "8693791326977",
    brand: "Adidas",
    category: "Kısa Kadın Çorap",
    subcategory: "",
    description: "Kutu içerisinde 5 çift çorap bulunmaktadır.",
    colors: [],
    sizes: [],
    variants: [],
    stock: 20,
    price: 300,
    dealerPrice: 150,
    vatRate: 20,
    status: "active",
    isNew: true,
    isCampaign: false,
    isFeatured: false,
    createdAt: "2026-07-29T09:42:35.609Z",
    updatedAt: "2026-07-29T09:59:57.692Z",
    images: [
      {
        id: "img-1785318316131-995",
        originalUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
        optimizedUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
        fileName: "adidas_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 384126,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:45:16.131Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318053918",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-917",
    barcode: "8693272842855",
    brand: "Chanel",
    category: "Kısa Kadın Çorap",
    subcategory: "",
    description: "Kutu içerisinde 5 çift çorap bulunmaktadır.",
    colors: [],
    sizes: [],
    variants: [],
    stock: 20,
    price: 300,
    dealerPrice: 150,
    vatRate: 20,
    status: "active",
    isNew: true,
    isCampaign: false,
    isFeatured: false,
    createdAt: "2026-07-29T09:40:53.918Z",
    updatedAt: "2026-07-29T09:59:47.674Z",
    images: [
      {
        id: "img-1785318165371-705",
        originalUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        optimizedUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500&auto=format&fit=crop&q=80",
        fileName: "chanel_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 384370,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:42:45.371Z",
        order: 1,
        isMain: true
      }
    ]
  }
];

export const FALLBACK_DEALERS: Dealer[] = [
  {
    id: "dlr-new-1785320504224",
    code: "BAYI-8107",
    companyName: "Fırat Arı",
    authorizedPerson: "Fırat Arı",
    phone: "0532 000 00 00",
    email: "firatari@bayi.com",
    taxOffice: "Samsun Vergi Dairesi",
    taxNumber: "1234567890",
    city: "Samsun",
    district: "Atakum",
    address: "Atakum Mah. Samsun",
    status: "active",
    registerDate: "2026-07-29T10:21:44.224Z",
    totalPurchases: 0,
    totalPayments: 0,
    remainingBalance: 0,
    overdueBalance: 0,
    paymentStatus: "paid",
    adminNote: "",
    username: "fıratarı",
    password: "123456"
  }
];

export const FALLBACK_PURCHASES: PurchaseRecord[] = [];
export const FALLBACK_PAYMENTS: PaymentRecord[] = [];
export const FALLBACK_TRANSACTIONS: AccountTransaction[] = [];
export const FALLBACK_AUDITLOGS: AuditLog[] = [
  {
    id: "log-1785320841402-664",
    timestamp: "2026-07-29T10:27:21.402Z",
    user: "Sistem Yöneticisi (Admin)",
    action: "Bayi Güncellendi",
    details: "Fırat Arı (BAYI-8107) bayi bilgileri güncellendi.",
    entityType: "dealer",
    entityId: "dlr-new-1785320504224"
  }
];
