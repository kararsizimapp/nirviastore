import { Product, Dealer, PurchaseRecord, PaymentRecord, AccountTransaction, AuditLog, User, ProductImage } from '../types';

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
    return this.request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products');
  }

  static async saveProduct(product: Product, userName?: string): Promise<Product> {
    if (product.id && !product.id.startsWith('prd-new-')) {
      return this.request<Product>(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
      }, userName);
    } else {
      return this.request<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product)
      }, userName);
    }
  }

  static async deleteProduct(id: string, userName?: string): Promise<void> {
    await this.request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE'
    }, userName);
  }

  // Image Upload Methods
  static async uploadFile(file: File, onProgress?: (pct: number) => void): Promise<{ success: boolean; image: ProductImage }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-file');

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json);
          } catch (err) {
            reject(new Error('Yanıt işlenemedi.'));
          }
        } else {
          try {
            const json = JSON.parse(xhr.responseText);
            reject(new Error(json.error || 'Görsel yüklenirken hata oluştu.'));
          } catch (e) {
            reject(new Error(`Yükleme hatası: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Ağ bağlantısı kesildi veya sunucuya ulaşılamadı.'));
      xhr.ontimeout = () => reject(new Error('Görsel yükleme zaman aşımına uğradı.'));

      const formData = new FormData();
      formData.append('image', file);
      xhr.send(formData);
    });
  }

  static async uploadUrl(imageUrl: string): Promise<{ success: boolean; image: ProductImage }> {
    return this.request<{ success: boolean; image: ProductImage }>('/api/upload-url', {
      method: 'POST',
      body: JSON.stringify({ imageUrl })
    });
  }

  // Bulk Import / Export
  static async importProductsExcel(file: File): Promise<{ success: boolean; count: number }> {
    const formData = new FormData();
    formData.append('excel', file);
    return this.request<{ success: boolean; count: number }>('/api/products/import', {
      method: 'POST',
      body: formData
    });
  }

  // Dealers
  static async getDealers(): Promise<Dealer[]> {
    return this.request<Dealer[]>('/api/dealers');
  }

  static async saveDealer(dealer: Dealer, userName?: string): Promise<Dealer> {
    if (dealer.id && !dealer.id.startsWith('dlr-new-')) {
      return this.request<Dealer>(`/api/dealers/${dealer.id}`, {
        method: 'PUT',
        body: JSON.stringify(dealer)
      }, userName);
    } else {
      return this.request<Dealer>('/api/dealers', {
        method: 'POST',
        body: JSON.stringify(dealer)
      }, userName);
    }
  }

  static async deleteDealer(id: string, userName?: string): Promise<void> {
    await this.request<{ success: boolean }>(`/api/dealers/${id}`, {
      method: 'DELETE'
    }, userName);
  }

  static async getDealerPurchases(dealerId: string): Promise<PurchaseRecord[]> {
    return this.request<PurchaseRecord[]>(`/api/dealers/${dealerId}/purchases`);
  }

  static async addDealerPurchase(dealerId: string, purchase: PurchaseRecord, userName?: string): Promise<PurchaseRecord> {
    return this.request<PurchaseRecord>(`/api/dealers/${dealerId}/purchases`, {
      method: 'POST',
      body: JSON.stringify(purchase)
    }, userName);
  }

  static async getDealerPayments(dealerId: string): Promise<PaymentRecord[]> {
    return this.request<PaymentRecord[]>(`/api/dealers/${dealerId}/payments`);
  }

  static async addDealerPayment(dealerId: string, payment: PaymentRecord, userName?: string): Promise<PaymentRecord> {
    return this.request<PaymentRecord>(`/api/dealers/${dealerId}/payments`, {
      method: 'POST',
      body: JSON.stringify(payment)
    }, userName);
  }

  static async getDealerTransactions(dealerId: string): Promise<AccountTransaction[]> {
    return this.request<AccountTransaction[]>(`/api/dealers/${dealerId}/transactions`);
  }

  // Audit Logs & Categories/Brands
  static async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/api/audit-logs');
  }

  static async getBrandsAndCategories(): Promise<{ categories: string[]; brands: string[] }> {
    return this.request<{ categories: string[]; brands: string[] }>('/api/brands-categories');
  }

  static async saveCategories(categories: string[], userName?: string): Promise<string[]> {
    const res = await this.request<{ success: boolean; categories: string[] }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ categories })
    }, userName);
    return res.categories;
  }

  static async saveBrands(brands: string[], userName?: string): Promise<string[]> {
    const res = await this.request<{ success: boolean; brands: string[] }>('/api/brands', {
      method: 'POST',
      body: JSON.stringify({ brands })
    }, userName);
    return res.brands;
  }
}

// Fix Image URL Helper (Normalizes links, e.g. Imgur album links to direct image links)
export function fixImageUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
  const trimmed = url.trim();
  const imgurMatch = trimmed.match(/imgur\.com\/(?:a|gallery)?\/([a-zA-Z0-9]+)/i);
  if (imgurMatch && imgurMatch[1] && !trimmed.includes('i.imgur.com')) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
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
