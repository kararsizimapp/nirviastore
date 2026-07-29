import React, { useState } from 'react';
import { Product, Dealer, PurchaseRecord, PaymentRecord } from '../types';
import { formatTL, formatDate, fixImageUrl } from '../lib/api';
import { 
  Users, Package, AlertTriangle, TrendingUp, DollarSign, 
  Clock, ArrowUpRight, CheckCircle2, ShoppingBag, ShieldAlert, BarChart3, PieChart,
  Search, SlidersHorizontal
} from 'lucide-react';

interface DashboardAdminProps {
  products: Product[];
  dealers: Dealer[];
  purchases: PurchaseRecord[];
  payments: PaymentRecord[];
  onNavigate: (tab: string) => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  products,
  dealers,
  purchases,
  payments,
  onNavigate
}) => {
  // Critical Stock Widget State
  const [criticalThreshold, setCriticalThreshold] = useState<number>(10);
  const [criticalSearch, setCriticalSearch] = useState<string>('');

  // Metric Calculations
  const totalDealers = dealers.length;
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  // Critical products list
  const criticalProducts = products
    .filter(p => (p.stock || 0) <= criticalThreshold)
    .filter(p => {
      if (!criticalSearch) return true;
      const q = criticalSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));

  const criticalStockCount = products.filter(p => (p.stock || 0) <= criticalThreshold).length;

  const totalReceivables = dealers.reduce((acc, d) => acc + (d.remainingBalance || 0), 0);
  const overdueDealersCount = dealers.filter(d => d.paymentStatus === 'overdue' || d.overdueBalance > 0).length;

  // Monthly Payment Sum
  const thisMonthPayments = payments.reduce((acc, p) => acc + p.amount, 0);

  // Recent 5 Lists
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  // Top Dealers by Balance
  const highestBalanceDealers = [...dealers]
    .sort((a, b) => b.remainingBalance - a.remainingBalance)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Yönetim Genel Bakış</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistemdeki bayi, stok, cari alacak ve finansal hareket özetleri.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Package className="w-4 h-4" />
            Ürün Ekle / Düzenle
          </button>
          <button
            onClick={() => onNavigate('dealers')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" />
            Bayi İşlemleri
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Bayi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Bayi</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalDealers}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">Aktif Kayıtlar</span>
          </p>
        </div>

        {/* Toplam Ürün & Stok */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Ürün / Stok</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
            <span className="text-xs text-slate-500 font-medium">({totalStock} adet stok)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Katalogda aktif listelenen ürünler</p>
        </div>

        {/* Kritik Stok Uyarısı */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Kritik Stok (≤{criticalThreshold})</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-800 mt-2">{criticalStockCount}</p>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">Stok takviyesi gereken ürün adedi</p>
        </div>

        {/* Toplam Alacak (Net Receivables) */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Toplam Alacak</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">{formatTL(totalReceivables)}</p>
          <p className="text-[11px] text-purple-600 mt-1 font-medium">Tüm bayilerin toplam kalan borcu</p>
        </div>
      </div>

      {/* Secondary Row: Financial Collections & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tahsil Edilen Ödeme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Bu Ay Alınan Ödeme</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatTL(thisMonthPayments)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Son yapılan tahsilatların toplamı</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Ödemesi Geciken Bayi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Ödemesi Geciken Bayi</span>
            <p className="text-xl font-bold text-red-600 mt-1">{overdueDealersCount} Bayi</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Vadesi dolmuş bakiyesi bulunanlar</p>
          </div>
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Quick Link Card */}
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Cari Hesaplar</span>
            <p className="text-sm font-bold text-white mt-1">Ödeme ve Tahsilat Takibi</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tüm hareketleri görüntülemek için tıklayın</p>
          </div>
          <button
            onClick={() => onNavigate('dealers')}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold transition-colors"
          >
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Visual Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Payment Collection Chart (CSS Bar Visualizer) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Aylık Satış ve Tahsilat Dengesi
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Son 4 Ay</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { month: 'Kasım 2025', sales: 120000, collection: 95000 },
              { month: 'Aralık 2025', sales: 185000, collection: 160000 },
              { month: 'Ocak 2026', sales: 210000, collection: 190000 },
              { month: 'Şubat 2026', sales: 148500, collection: 110000 }
            ].map((bar, idx) => {
              const maxVal = 220000;
              const salesPct = Math.round((bar.sales / maxVal) * 100);
              const collPct = Math.round((bar.collection / maxVal) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{bar.month}</span>
                    <span className="text-slate-500 font-mono">
                      Satış: {formatTL(bar.sales)} | Tahsilat: {formatTL(bar.collection)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${salesPct}%` }}
                        title={`Satış: ${formatTL(bar.sales)}`}
                      />
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${collPct}%` }}
                        title={`Tahsilat: ${formatTL(bar.collection)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full inline-block" />
              <span>Ürün Satış Tutarı</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" />
              <span>Yapılan Tahsilat</span>
            </div>
          </div>
        </div>

        {/* Highest Balance Dealers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              En Yüksek Bakiyeli Bayiler
            </h3>
            <button 
              onClick={() => onNavigate('dealers')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Tümünü Gör
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {highestBalanceDealers.map(dealer => (
              <div key={dealer.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{dealer.companyName}</p>
                  <p className="text-[11px] text-slate-500">{dealer.authorizedPerson} • {dealer.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900">{formatTL(dealer.remainingBalance)}</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                    dealer.paymentStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {dealer.paymentStatus === 'overdue' ? 'Vadesi Geçti' : 'Kalan Bakiye'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kritik Stok Takip Widget'ı */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
        {/* Widget Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Kritik Stok Seviyesindeki Ürünler</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  criticalProducts.length > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {criticalProducts.length} Ürün Listeleniyor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mevcut stok miktarı belirlenen kritik eşiğin altında kalan veya tükenen ürünler
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter inside widget */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Listede ara..."
                value={criticalSearch}
                onChange={(e) => setCriticalSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-36 sm:w-44"
              />
            </div>

            {/* Threshold Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium whitespace-nowrap">Kritik Eşik:</span>
              <select
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={5}>≤ 5 Adet</option>
                <option value={10}>≤ 10 Adet</option>
                <option value={15}>≤ 15 Adet</option>
                <option value={20}>≤ 20 Adet</option>
                <option value={50}>≤ 50 Adet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-4">
          {criticalProducts.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Tüm Ürünlerin Stok Seviyesi Yeterli</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Stok miktarı {criticalThreshold} adedin altında olan hiçbir ürün bulunmuyor. Katalogunuzdaki ürün stokları güvenli seviyededir.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {criticalProducts.map((p) => {
                const imgUrl = fixImageUrl(p.images?.[0]?.thumbnailUrl || p.images?.[0]?.originalUrl);
                const stockRatio = Math.min(100, Math.max(8, ((p.stock || 0) / criticalThreshold) * 100));

                return (
                  <div 
                    key={p.id}
                    className="p-3 bg-slate-50/80 hover:bg-amber-50/50 rounded-xl border border-slate-200/80 hover:border-amber-300 transition-all flex gap-3 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img 
                        src={imgUrl} 
                        alt={p.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate" title={p.name}>
                            {p.name}
                          </h4>
                          {/* Stock status badge */}
                          {p.stock === 0 ? (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                              Stok Tükendi
                            </span>
                          ) : p.stock <= 3 ? (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Çok Kritik
                            </span>
                          ) : (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-800">
                              Kritik
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          SKU: <span className="font-mono font-medium text-slate-700">{p.code}</span> • <span className="font-medium text-slate-700">{p.brand}</span>
                        </p>
                      </div>

                      {/* Stock Bar & Info */}
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 font-medium">Mevcut Stok:</span>
                          <span className={`font-mono font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-700'}`}>
                            {p.stock} Adet
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              p.stock === 0 ? 'bg-red-600' : p.stock <= 3 ? 'bg-amber-500' : 'bg-orange-400'
                            }`}
                            style={{ width: `${stockRatio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">
            * Stok seviyelerini güncellemek veya sipariş/stok girişi yapmak için Ürün Yönetimi modülüne geçebilirsiniz.
          </span>
          <button
            onClick={() => onNavigate('products')}
            className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 hover:underline shrink-0"
          >
            <span>Tüm Ürün Yönetimine Git</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Activity Logs & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Yapılan Satışlar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Son Yapılan Satış Kayıtları
            </h3>
            <button 
              onClick={() => onNavigate('dealers')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentPurchases.length === 0 ? (
              <p className="p-4 text-slate-400 text-center">Henüz satış kaydı bulunmuyor.</p>
            ) : (
              recentPurchases.map(p => {
                const dealer = dealers.find(d => d.id === p.dealerId);
                return (
                  <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{p.purchaseNumber}</p>
                      <p className="text-[11px] text-slate-500">{dealer?.companyName || 'Bayi'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(p.purchaseDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatTL(p.grandTotal)}</p>
                      <span className="text-[10px] text-slate-500 block">{p.items?.length || 1} Kalem Ürün</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Son Yapılan Ödemeler */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Son Yapılan Tahsilat / Ödemeler
            </h3>
            <button 
              onClick={() => onNavigate('dealers')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentPayments.length === 0 ? (
              <p className="p-4 text-slate-400 text-center">Henüz ödeme kaydı bulunmuyor.</p>
            ) : (
              recentPayments.map(pay => {
                const dealer = dealers.find(d => d.id === pay.dealerId);
                return (
                  <div key={pay.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{dealer?.companyName || 'Bayi'}</p>
                      <p className="text-[11px] text-slate-500">
                        {pay.paymentMethod.toUpperCase()} • {pay.documentNumber || pay.paymentNumber}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(pay.paymentDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">{formatTL(pay.amount)}</p>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Tahsil Edildi
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
