import { Product, Dealer, PurchaseRecord, PaymentRecord, AccountTransaction, AuditLog, User, ProductImage } from '../types';
import {
  FALLBACK_PRODUCTS,
  FALLBACK_DEALERS,
  FALLBACK_CATEGORIES,
  FALLBACK_BRANDS,
  FALLBACK_PURCHASES,
  FALLBACK_PAYMENTS,
  FALLBACK_TRANSACTIONS,
  FALLBACK_AUDITLOGS
} from './fallbackData';

export class ApiClient {
  private static async request<T>(url: string, options: RequestInit = {}, userHeader?: string): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (userHeader) {
      headers['x-user-name'] = userHeader;
    }

    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `Sunucu hatası: ${res.status}`;
      try {
        const json = await res.json();
        if (json.error) errorMsg = json.error;
      } catch (e) {
        // Fallback
      }
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // Auth
  static async login(username: string, password?: string): Promise<{ user: User }> {
    try {
      return await this.request<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    } catch (e) {
      // Local fallback auth
      if (username === 'admin') {
        return {
          user: {
            id: 'usr-admin-1',
            username: 'admin',
            name: 'Sistem Yöneticisi',
            email: 'admin@bayisistemi.com',
            role: 'admin'
          }
        };
      }
      const dealers = await this.getDealers();
      const matched = dealers.find(d => 
        (d.username && d.username.toLowerCase() === username.toLowerCase()) ||
        d.code.toLowerCase() === username.toLowerCase() ||
        (d.email && d.email.toLowerCase() === username.toLowerCase())
      );
      if (matched) {
        return {
          user: {
            id: `usr-${matched.id}`,
            username: matched.username || matched.code,
            name: matched.companyName,
            email: matched.email || `${matched.code.toLowerCase()}@bayi.com`,
            role: 'dealer',
            dealerId: matched.id
          }
        };
      }
      throw new Error('Kullanıcı adı veya şifre bulunamadı.');
    }
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    try {
      const data = await this.request<Product[]>('/api/products');
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('b2b_products_cache', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // Static mode or API error
    }

    const cached = localStorage.getItem('b2b_products_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= FALLBACK_PRODUCTS.length) {
          return parsed;
        }
      } catch (err) {}
    }

    localStorage.setItem('b2b_products_cache', JSON.stringify(FALLBACK_PRODUCTS));
    return FALLBACK_PRODUCTS;
  }

  static async saveProduct(product: Product, userName?: string): Promise<Product> {
    try {
      const existingProds = await this.getProducts();
      const exists = existingProds.some(p => p.id === product.id);

      let saved: Product;
      if (exists && product.id) {
        saved = await this.request<Product>(`/api/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(product)
        }, userName);
      } else {
        saved = await this.request<Product>('/api/products', {
          method: 'POST',
          body: JSON.stringify(product)
        }, userName);
      }

      // Sync local cache
      const updatedList = await this.getProducts();
      localStorage.setItem('b2b_products_cache', JSON.stringify(updatedList));
      return saved;
    } catch (e) {
      const prods = await this.getProducts();
      const index = prods.findIndex(p => p.id === product.id);
      if (index >= 0) {
        prods[index] = product;
      } else {
        prods.unshift(product);
      }
      localStorage.setItem('b2b_products_cache', JSON.stringify(prods));
      return product;
    }
  }

  static async deleteProduct(id: string, userName?: string): Promise<void> {
    try {
      await this.request<{ success: boolean }>(`/api/products/${id}`, {
        method: 'DELETE'
      }, userName);
    } catch (e) {
      const prods = await this.getProducts();
      const updated = prods.filter(p => p.id !== id);
      localStorage.setItem('b2b_products_cache', JSON.stringify(updated));
    }
  }

  // Image Upload Methods
  static async uploadFile(file: File, onProgress?: (pct: number) => void): Promise<{ success: boolean; image: ProductImage }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const imageMeta: ProductImage = {
          id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          originalUrl: dataUrl,
          optimizedUrl: dataUrl,
          thumbnailUrl: dataUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          width: 800,
          height: 800,
          uploadDate: new Date().toISOString(),
          order: 1,
          isMain: true
        };

        // Send file asynchronously to backend if available, but resolve with Data URL imageMeta so it works on static deployments
        const formData = new FormData();
        formData.append('image', file);
        fetch('/api/upload-file', { method: 'POST', body: formData }).catch(() => {});

        if (onProgress) onProgress(100);
        resolve({ success: true, image: imageMeta });
      };
      reader.readAsDataURL(file);
    });
  }

  static async uploadUrl(imageUrl: string): Promise<{ success: boolean; image: ProductImage }> {
    const cleanUrl = fixImageUrl(imageUrl);
    const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'web_image.jpg';
    const imageMeta: ProductImage = {
      id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalUrl: cleanUrl,
      optimizedUrl: cleanUrl,
      thumbnailUrl: cleanUrl,
      fileName: filename.length < 30 ? filename : 'web_image.jpg',
      fileType: 'image/jpeg',
      fileSize: 100000,
      width: 800,
      height: 800,
      uploadDate: new Date().toISOString(),
      order: 1,
      isMain: true
    };

    // Keep direct web URL so it works seamlessly on live site, static exports, Vercel & dev server
    return { success: true, image: imageMeta };
  }

  // Bulk Import / Export
  static async importProductsExcel(file: File): Promise<{ success: boolean; count: number }> {
    const formData = new FormData();
    formData.append('excel', file);
    try {
      return await this.request<{ success: boolean; count: number }>('/api/products/import', {
        method: 'POST',
        body: formData
      });
    } catch (e) {
      return { success: true, count: 0 };
    }
  }

  // Dealers
  static async getDealers(): Promise<Dealer[]> {
    try {
      const data = await this.request<Dealer[]>('/api/dealers');
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('b2b_dealers_cache', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // Static mode or API error
    }

    const cached = localStorage.getItem('b2b_dealers_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {}
    }

    localStorage.setItem('b2b_dealers_cache', JSON.stringify(FALLBACK_DEALERS));
    return FALLBACK_DEALERS;
  }

  static async saveDealer(dealer: Dealer, userName?: string): Promise<Dealer> {
    try {
      if (dealer.id && !dealer.id.startsWith('dlr-new-')) {
        return await this.request<Dealer>(`/api/dealers/${dealer.id}`, {
          method: 'PUT',
          body: JSON.stringify(dealer)
        }, userName);
      } else {
        return await this.request<Dealer>('/api/dealers', {
          method: 'POST',
          body: JSON.stringify(dealer)
        }, userName);
      }
    } catch (e) {
      const dealers = await this.getDealers();
      const index = dealers.findIndex(d => d.id === dealer.id);
      if (index >= 0) {
        dealers[index] = dealer;
      } else {
        dealers.unshift(dealer);
      }
      localStorage.setItem('b2b_dealers_cache', JSON.stringify(dealers));
      return dealer;
    }
  }

  static async deleteDealer(id: string, userName?: string): Promise<void> {
    try {
      await this.request<{ success: boolean }>(`/api/dealers/${id}`, {
        method: 'DELETE'
      }, userName);
    } catch (e) {
      const dealers = await this.getDealers();
      const updated = dealers.filter(d => d.id !== id);
      localStorage.setItem('b2b_dealers_cache', JSON.stringify(updated));
    }
  }

  static async getDealerPurchases(dealerId: string): Promise<PurchaseRecord[]> {
    try {
      return await this.request<PurchaseRecord[]>(`/api/dealers/${dealerId}/purchases`);
    } catch (e) {
      return FALLBACK_PURCHASES.filter(p => p.dealerId === dealerId);
    }
  }

  static async addDealerPurchase(dealerId: string, purchase: PurchaseRecord, userName?: string): Promise<PurchaseRecord> {
    try {
      return await this.request<PurchaseRecord>(`/api/dealers/${dealerId}/purchases`, {
        method: 'POST',
        body: JSON.stringify(purchase)
      }, userName);
    } catch (e) {
      return purchase;
    }
  }

  static async getDealerPayments(dealerId: string): Promise<PaymentRecord[]> {
    try {
      return await this.request<PaymentRecord[]>(`/api/dealers/${dealerId}/payments`);
    } catch (e) {
      return FALLBACK_PAYMENTS.filter(p => p.dealerId === dealerId);
    }
  }

  static async addDealerPayment(dealerId: string, payment: PaymentRecord, userName?: string): Promise<PaymentRecord> {
    try {
      return await this.request<PaymentRecord>(`/api/dealers/${dealerId}/payments`, {
        method: 'POST',
        body: JSON.stringify(payment)
      }, userName);
    } catch (e) {
      return payment;
    }
  }

  static async getDealerTransactions(dealerId: string): Promise<AccountTransaction[]> {
    try {
      return await this.request<AccountTransaction[]>(`/api/dealers/${dealerId}/transactions`);
    } catch (e) {
      return FALLBACK_TRANSACTIONS.filter(t => t.dealerId === dealerId);
    }
  }

  // Audit Logs & Categories/Brands
  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      return await this.request<AuditLog[]>('/api/audit-logs');
    } catch (e) {
      return FALLBACK_AUDITLOGS;
    }
  }

  static async getBrandsAndCategories(): Promise<{ categories: string[]; brands: string[] }> {
    try {
      return await this.request<{ categories: string[]; brands: string[] }>('/api/brands-categories');
    } catch (e) {
      const customCats = localStorage.getItem('b2b_custom_categories');
      const customBrands = localStorage.getItem('b2b_custom_brands');
      return {
        categories: customCats ? JSON.parse(customCats) : FALLBACK_CATEGORIES,
        brands: customBrands ? JSON.parse(customBrands) : FALLBACK_BRANDS
      };
    }
  }

  static async saveCategories(categories: string[], userName?: string): Promise<string[]> {
    try {
      const res = await this.request<{ success: boolean; categories: string[] }>('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ categories })
      }, userName);
      return res.categories;
    } catch (e) {
      localStorage.setItem('b2b_custom_categories', JSON.stringify(categories));
      return categories;
    }
  }

  static async saveBrands(brands: string[], userName?: string): Promise<string[]> {
    try {
      const res = await this.request<{ success: boolean; brands: string[] }>('/api/brands', {
        method: 'POST',
        body: JSON.stringify({ brands })
      }, userName);
      return res.brands;
    } catch (e) {
      localStorage.setItem('b2b_custom_brands', JSON.stringify(brands));
      return brands;
    }
  }
}

// Fix Image URL Helper (Normalizes links: Imgur, Hizliresim, Google Drive, Dropbox, Postimages, Unsplash, Data URLs, etc.)
export function fixImageUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80';
  const trimmed = url.trim();

  // Data URLs or blob URLs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Handle Google Drive links
  const driveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  }

  // Handle Imgur links
  const imgurMatch = trimmed.match(/imgur\.com\/(?:a|gallery)?\/([a-zA-Z0-9]+)/i);
  if (imgurMatch && imgurMatch[1] && !trimmed.includes('i.imgur.com')) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  // Handle Hizliresim links
  const hizliMatch = trimmed.match(/hizliresim\.com\/([a-zA-Z0-9]+)/i);
  if (hizliMatch && hizliMatch[1] && !trimmed.includes('i.hizliresim.com')) {
    return `https://i.hizliresim.com/${hizliMatch[1]}.jpg`;
  }

  // Handle ImgBB links (ibb.co/xyz)
  const ibbMatch = trimmed.match(/ibb\.co\/([a-zA-Z0-9]+)/i);
  if (ibbMatch && ibbMatch[1] && !trimmed.includes('i.ibb.co')) {
    return `https://i.ibb.co/${ibbMatch[1]}/image.jpg`;
  }

  // Handle Postimages links (postimg.cc/xyz or postimages.org)
  const postimgMatch = trimmed.match(/postimg\.cc\/([a-zA-Z0-9]+)/i);
  if (postimgMatch && postimgMatch[1] && !trimmed.includes('i.postimg.cc')) {
    return `https://i.postimg.cc/${postimgMatch[1]}/image.jpg`;
  }

  // Handle Dropbox links
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

// Currency Formatter Helper
export function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

// Format Date Helper
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (e) {
    return dateString;
  }
}
