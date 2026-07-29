import React, { useState } from 'react';
import { Dealer } from '../types';
import { X, Save, Building2, MapPin, Phone, Mail, FileText, Key, Lock } from 'lucide-react';

interface DealerFormModalProps {
  dealer?: Dealer | null;
  onSave: (dealer: Dealer) => void;
  onClose: () => void;
}

export const DealerFormModal: React.FC<DealerFormModalProps> = ({
  dealer,
  onSave,
  onClose
}) => {
  const defaultCode = dealer?.code || `BAYI-${Math.floor(Math.random() * 9000 + 1000)}`;
  const [formData, setFormData] = useState<Dealer>({
    id: dealer?.id || `dlr-new-${Date.now()}`,
    code: defaultCode,
    companyName: dealer?.companyName || '',
    authorizedPerson: dealer?.authorizedPerson || '',
    phone: dealer?.phone || '',
    email: dealer?.email || '',
    taxOffice: dealer?.taxOffice || '',
    taxNumber: dealer?.taxNumber || '',
    city: dealer?.city || 'İstanbul',
    district: dealer?.district || '',
    address: dealer?.address || '',
    status: dealer?.status || 'active',
    registerDate: dealer?.registerDate || new Date().toISOString(),
    totalPurchases: dealer?.totalPurchases || 0,
    totalPayments: dealer?.totalPayments || 0,
    remainingBalance: dealer?.remainingBalance || 0,
    overdueBalance: dealer?.overdueBalance || 0,
    paymentStatus: dealer?.paymentStatus || 'paid',
    adminNote: dealer?.adminNote || '',
    username: dealer?.username || defaultCode.toLowerCase().replace('-', ''),
    password: dealer?.password || '123456'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Lütfen firma adını giriniz.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">
              {dealer ? 'Bayi Bilgilerini Düzenle' : 'Yeni Bayi Kaydı Tanımla'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Bayi Kodu *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Firma Adı *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Örn: Marmara Spor Ltd. Şti."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Yetkili Ad Soyad</label>
              <input
                type="text"
                value={formData.authorizedPerson}
                onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Telefon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0212 555 12 34"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">E-Posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Vergi Dairesi</label>
              <input
                type="text"
                value={formData.taxOffice}
                onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Vergi Numarası</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">İl</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">İlçe</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Açık Adres</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Portal Giriş Bilgileri Section */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Bayi Portal Giriş Bilgileri</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Bayiniz sistemi kullanırken aşağıdaki kullanıcı adı ve şifre ile giriş yapacaktır.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Giriş Kullanıcı Adı *</label>
                <input
                  type="text"
                  required
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Örn: marmaraspor"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Giriş Şifresi *</label>
                <input
                  type="text"
                  required
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Admin Özel Notu</label>
            <textarea
              rows={2}
              value={formData.adminNote || ''}
              onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
              placeholder="Özel anlaşmalar veya vadeler..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Bayiyi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
