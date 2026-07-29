import React, { useState } from 'react';
import { Dealer, PaymentStatus } from '../types';
import { formatTL } from '../lib/api';
import { 
  Users, Plus, Search, Phone, 
  MapPin, ShieldAlert, CheckCircle2, Clock, Edit3, Eye, Trash2
} from 'lucide-react';

interface DealerManagementProps {
  dealers: Dealer[];
  onSelectDealer: (dealer: Dealer) => void;
  onAddDealer: () => void;
  onEditDealer: (dealer: Dealer) => void;
  onDeleteDealer?: (id: string) => void;
}

export const DealerManagement: React.FC<DealerManagementProps> = ({
  dealers,
  onSelectDealer,
  onAddDealer,
  onEditDealer,
  onDeleteDealer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmDealer, setDeleteConfirmDealer] = useState<Dealer | null>(null);

  const filteredDealers = dealers.filter(d => {
    if (statusFilter !== 'all' && d.paymentStatus !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCompany = d.companyName.toLowerCase().includes(q);
      const matchCode = d.code.toLowerCase().includes(q);
      const matchPerson = d.authorizedPerson.toLowerCase().includes(q);
      const matchCity = d.city.toLowerCase().includes(q);
      return matchCompany || matchCode || matchPerson || matchCity;
    }
    return true;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Ödendi
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            Kısmi Ödeme
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3" />
            Ödeme Bekliyor
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <ShieldAlert className="w-3 h-3" />
            Vadesi Geçti
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bayi Yönetimi ve Cari Takip</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kayıtlı tüm bayilerinizin firma detayları, satın alımları, tahsilatları ve bakiye durumları.
          </p>
        </div>

        <button
          onClick={onAddDealer}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Yeni Bayi Tanımla
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Firma adı, bayi kodu veya il arayın..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto text-xs">
          <span className="font-semibold text-slate-500">Ödeme Durumu:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="paid">Ödendi (Borçsuz)</option>
            <option value="partial">Kısmi Ödeme</option>
            <option value="pending">Ödeme Bekliyor</option>
            <option value="overdue">Vadesi Geçenler</option>
          </select>
        </div>
      </div>

      {/* Dealer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm">
            Arama kriterlerinize uygun bayi bulunamadı.
          </div>
        ) : (
          filteredDealers.map(dealer => (
            <div
              key={dealer.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {dealer.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug line-clamp-1">
                      {dealer.companyName}
                    </h3>
                  </div>
                  {getStatusBadge(dealer.paymentStatus)}
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dealer.authorizedPerson}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dealer.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dealer.city} / {dealer.district}</span>
                  </p>
                </div>
              </div>

              {/* Financial Metrics Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Toplam Alış:</span>
                  <span className="font-semibold text-slate-800">{formatTL(dealer.totalPurchases)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Toplam Ödeme:</span>
                  <span className="font-semibold text-emerald-700">{formatTL(dealer.totalPayments)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60 font-bold">
                  <span className="text-slate-700 uppercase text-[11px]">Kalan Bakiye:</span>
                  <span className={`text-sm ${dealer.remainingBalance > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {formatTL(dealer.remainingBalance)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditDealer(dealer)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Düzenle
                  </button>

                  {onDeleteDealer && (
                    <button
                      onClick={() => setDeleteConfirmDealer(dealer)}
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                      title="Cariyi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectDealer(dealer)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Cari Profil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DELETE DEALER CONFIRMATION MODAL */}
      {deleteConfirmDealer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Bayi / Cari Hesabı Sil</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              <span className="font-bold text-slate-900">&quot;{deleteConfirmDealer.companyName}&quot;</span> ({deleteConfirmDealer.code}) firmasını ve cari kaydını tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmDealer(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteDealer) onDeleteDealer(deleteConfirmDealer.id);
                  setDeleteConfirmDealer(null);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Evet, Cariyi Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
