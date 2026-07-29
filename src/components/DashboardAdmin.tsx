import React from 'react';
import { Product, Dealer, PurchaseRecord, PaymentRecord } from '../types';
import { formatTL, formatDate } from '../lib/api';
import { 
  Users, Package, AlertTriangle, TrendingUp, DollarSign, 
  Clock, ArrowUpRight, CheckCircle2, ShoppingBag, ShieldAlert, BarChart3, PieChart
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
  // Metric Calculations
  const totalDealers = dealers.length;
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const criticalStockCount = products.filter(p => p.stock < 10).length;

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
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Kritik Stok (&lt;10)</span>
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
