import React, { useState, useMemo } from 'react';
import { Product, Dealer, FilterState } from '../types';
import { formatTL, fixImageUrl } from '../lib/api';
import { 
  Search, Filter, Package, Tag, Sparkles, Check, 
  X, Layers, Eye, RefreshCw, ChevronRight, ShoppingBag
} from 'lucide-react';

interface DashboardDealerProps {
  products: Product[];
  currentDealer?: Dealer;
  categories: string[];
  brands: string[];
  onOpenProductDetail: (product: Product) => void;
}

export const DashboardDealer: React.FC<DashboardDealerProps> = ({
  products,
  currentDealer,
  categories,
  brands,
  onOpenProductDetail
}) => {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: 'all',
    brand: 'all',
    color: 'all',
    size: 'all',
    stockStatus: 'all',
    isNew: false,
    isCampaign: false,
    isFeatured: false
  });

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status !== 'active') return false;

      // Search filter
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchBarcode = p.barcode?.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBarcode && !matchBrand) return false;
      }

      // Category filter
      if (filter.category !== 'all' && p.category !== filter.category) return false;

      // Brand filter
      if (filter.brand !== 'all' && p.brand !== filter.brand) return false;

      // Stock status filter
      if (filter.stockStatus === 'in_stock' && p.stock <= 0) return false;
      if (filter.stockStatus === 'critical' && (p.stock <= 0 || p.stock > 10)) return false;

      // Badges
      if (filter.isNew && !p.isNew) return false;
      if (filter.isCampaign && !p.isCampaign) return false;
      if (filter.isFeatured && !p.isFeatured) return false;

      return true;
    });
  }, [products, filter]);

  return (
    <div className="space-y-6">
      {/* Dealer Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Bayi Özel Ürün Kataloğu
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Hoş Geldiniz, {currentDealer?.companyName || 'Degerli Bayimiz'}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Güncel stok durumlarımızı, bayinize tanımlanmış özel alış fiyatlarını ve yeni sezon ürünlerimizi inceleyebilir; arama ve filtreleme araçları ile hızla ürün detaylarına ulaşabilirsiniz.
          </p>

          {/* Balance Pill for current dealer */}
          {currentDealer && (
            <div className="pt-3 flex flex-wrap gap-4 text-xs">
              <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase">Güncel Bakiyeniz</span>
                <span className={`font-bold text-sm ${currentDealer.remainingBalance > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                  {formatTL(currentDealer.remainingBalance)}
                </span>
              </div>
              <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase">Ödeme Durumunuz</span>
                <span className="font-bold text-xs uppercase text-blue-300">
                  {currentDealer.paymentStatus === 'paid' && 'Ödendi'}
                  {currentDealer.paymentStatus === 'partial' && 'Kısmi Ödeme'}
                  {currentDealer.paymentStatus === 'pending' && 'Ödeme Bekliyor'}
                  {currentDealer.paymentStatus === 'overdue' && 'Vadesi Geçti'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Ürün adı, stok kodu (SKU), barkod veya marka arayın..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {filter.search && (
              <button
                onClick={() => setFilter({ ...filter, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilter({ ...filter, isNew: !filter.isNew })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                filter.isNew
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Yeni Ürünler
            </button>

            <button
              onClick={() => setFilter({ ...filter, isCampaign: !filter.isCampaign })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                filter.isCampaign
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Kampanyalı
            </button>

            <button
              onClick={() => setFilter({ ...filter, stockStatus: filter.stockStatus === 'in_stock' ? 'all' : 'in_stock' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                filter.stockStatus === 'in_stock'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Sadece Stokta Olanlar
            </button>
          </div>
        </div>

        {/* Dropdown Filters (Category & Brand) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Kategori:</span>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Marka:</span>
            <select
              value={filter.brand}
              onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tüm Markalar</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {(filter.category !== 'all' || filter.brand !== 'all' || filter.search || filter.isNew || filter.isCampaign || filter.stockStatus !== 'all') && (
            <button
              onClick={() => setFilter({
                search: '', category: 'all', brand: 'all', color: 'all', size: 'all', stockStatus: 'all', isNew: false, isCampaign: false, isFeatured: false
              })}
              className="text-red-600 hover:text-red-700 font-semibold text-xs ml-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Listelenen Ürünler ({filteredProducts.length})
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-sm">Aramanıza Uygun Ürün Bulunamadı</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Filtre kriterlerinizi genişleterek veya arama kelimenizi değiştirerek tekrar deneyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              // Custom dealer price if set
              const customPrice = currentDealer?.customPrices?.[product.id];
              const effectivePrice = customPrice !== undefined ? customPrice : product.dealerPrice;

              const mainImg = product.images?.find(i => i.isMain) || product.images?.[0];
              const rawUrl = mainImg?.optimizedUrl || mainImg?.originalUrl;
              const imgUrl = fixImageUrl(rawUrl);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Photo Frame Container (Spec Requirement: object-fit contain, center, light/white bg) */}
                  <div 
                    className="relative w-full h-48 border-b border-slate-100 flex items-center justify-center p-3 overflow-hidden"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {product.isNew && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-sm">
                          YENİ
                        </span>
                      )}
                      {product.isCampaign && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                          KAMPANYA
                        </span>
                      )}
                    </div>

                    {/* Stock status pill */}
                    <div className="absolute bottom-2.5 right-2.5">
                      {product.stock > 10 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Stokta ({product.stock})
                        </span>
                      ) : product.stock > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Son {product.stock} Adet!
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200">
                          Stok Tükendi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                        <span>{product.brand}</span>
                        <span>{product.code}</span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Colors and Sizes preview */}
                    {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                      <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                        {product.colors?.slice(0, 3).map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                            {c}
                          </span>
                        ))}
                        {product.sizes?.slice(0, 3).map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price & Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Bayi Alış Fiyatı
                        </span>
                        <span className="text-sm font-extrabold text-blue-700">
                          {formatTL(effectivePrice)}
                        </span>
                      </div>

                      <button
                        onClick={() => onOpenProductDetail(product)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        İncele
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
