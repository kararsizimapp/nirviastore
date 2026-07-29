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

const imgSocks1 = "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80";
const imgSocks2 = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80";
const imgSocks3 = "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop&q=80";
const imgSocks4 = "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80";
const imgSocks5 = "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80";

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
        originalUrl: imgSocks1,
        optimizedUrl: imgSocks1,
        thumbnailUrl: imgSocks1,
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
        originalUrl: imgSocks2,
        optimizedUrl: imgSocks2,
        thumbnailUrl: imgSocks2,
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
    id: "prd-new-1785319692266",
    name: "Uzun Kadın Çorap",
    code: "UZU-KAD-COR-605",
    barcode: "8694635881639",
    brand: "Lacoste",
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
    createdAt: "2026-07-29T10:08:12.266Z",
    updatedAt: "2026-07-29T10:09:07.993Z",
    images: [
      {
        id: "img-1785319739549-488",
        originalUrl: imgSocks3,
        optimizedUrl: imgSocks3,
        thumbnailUrl: imgSocks3,
        fileName: "lacoste_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 284886,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T10:08:59.549Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785319617216",
    name: "Uzun Kadın Çorap",
    code: "UZU-KAD-COR-460",
    barcode: "8699824617896",
    brand: "Alo",
    category: "Uzun Kadın Çorap",
    subcategory: "",
    description: "Kutu içerisinde 6 çift çorap bulunmaktadır.",
    colors: [],
    sizes: [],
    variants: [],
    stock: 20,
    price: 360,
    dealerPrice: 260,
    vatRate: 20,
    status: "active",
    isNew: true,
    isCampaign: false,
    isFeatured: false,
    createdAt: "2026-07-29T10:06:57.216Z",
    updatedAt: "2026-07-29T10:07:48.873Z",
    images: [
      {
        id: "img-1785319663231-626",
        originalUrl: imgSocks4,
        optimizedUrl: imgSocks4,
        thumbnailUrl: imgSocks4,
        fileName: "alo_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 277591,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T10:07:43.231Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785319494006",
    name: "Uzun Kadın Çorap",
    code: "UZU-KAD-COR-886",
    barcode: "8694601396036",
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
    createdAt: "2026-07-29T10:04:54.006Z",
    updatedAt: "2026-07-29T10:06:12.507Z",
    images: [
      {
        id: "img-1785319558573-25",
        originalUrl: imgSocks2,
        optimizedUrl: imgSocks2,
        thumbnailUrl: imgSocks2,
        fileName: "nike_long_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 423472,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T10:05:58.573Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785319356851",
    name: "Uzun Kadın Çorap",
    code: "UZU-KAD-COR-243",
    barcode: "8698254187528",
    brand: "Victoria Secret",
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
    createdAt: "2026-07-29T10:02:36.851Z",
    updatedAt: "2026-07-29T10:04:32.489Z",
    images: [
      {
        id: "img-1785319456549-313",
        originalUrl: imgSocks5,
        optimizedUrl: imgSocks5,
        thumbnailUrl: imgSocks5,
        fileName: "vs_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 288819,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T10:04:16.549Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318558938",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-729",
    barcode: "8696338646981",
    brand: "Lacoste",
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
    createdAt: "2026-07-29T09:49:18.938Z",
    updatedAt: "2026-07-29T09:59:49.768Z",
    images: [
      {
        id: "img-1785318597864-458",
        originalUrl: imgSocks3,
        optimizedUrl: imgSocks3,
        thumbnailUrl: imgSocks3,
        fileName: "lacoste_short_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 339225,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:49:57.864Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318525765",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-994",
    barcode: "8692873273611",
    brand: "Alo",
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
    createdAt: "2026-07-29T09:48:45.765Z",
    updatedAt: "2026-07-29T09:59:51.654Z",
    images: [
      {
        id: "img-1785318568074-534",
        originalUrl: imgSocks4,
        optimizedUrl: imgSocks4,
        thumbnailUrl: imgSocks4,
        fileName: "alo_short_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 287564,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:49:28.074Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318494978",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-362",
    barcode: "8692579982082",
    brand: "Nike",
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
    createdAt: "2026-07-29T09:48:14.978Z",
    updatedAt: "2026-07-29T09:59:53.632Z",
    images: [
      {
        id: "img-1785318535341-46",
        originalUrl: imgSocks2,
        optimizedUrl: imgSocks2,
        thumbnailUrl: imgSocks2,
        fileName: "nike_ankle_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 320678,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:48:55.341Z",
        order: 1,
        isMain: true
      }
    ]
  },
  {
    id: "prd-new-1785318441868",
    name: "Kısa Kadın Çorap",
    code: "KIS-KAD-COR-726",
    barcode: "8696940777742",
    brand: "Louis Vuitton",
    category: "Kısa Kadın Çorap",
    subcategory: "",
    description: "",
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
    createdAt: "2026-07-29T09:47:21.868Z",
    updatedAt: "2026-07-29T09:48:15.418Z",
    images: [
      {
        id: "img-1785318494217-303",
        originalUrl: imgSocks5,
        optimizedUrl: imgSocks5,
        thumbnailUrl: imgSocks5,
        fileName: "lv_socks.jpg",
        fileType: "image/jpeg",
        fileSize: 345805,
        width: 1000,
        height: 1000,
        uploadDate: "2026-07-29T09:48:14.217Z",
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
        originalUrl: imgSocks1,
        optimizedUrl: imgSocks1,
        thumbnailUrl: imgSocks1,
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
        originalUrl: imgSocks2,
        optimizedUrl: imgSocks2,
        thumbnailUrl: imgSocks2,
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
        originalUrl: imgSocks1,
        optimizedUrl: imgSocks1,
        thumbnailUrl: imgSocks1,
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
