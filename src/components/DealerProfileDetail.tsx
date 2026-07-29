import React, { useState } from 'react';
import { 
  Dealer, PurchaseRecord, PaymentRecord, AccountTransaction, Product, PurchaseItem 
} from '../types';
import { formatTL, formatDate } from '../lib/api';
import { 
  Building2, Phone, Mail, MapPin, FileText, ArrowLeft, Plus, 
  DollarSign, ShoppingBag, CreditCard, Layers, Save, CheckCircle2, AlertCircle, Calendar
} from 'lucide-react';

interface DealerProfileDetailProps {
  dealer: Dealer;
  products: Product[];
  purchases: PurchaseRecord[];
  payments: PaymentRecord[];
  transactions: AccountTransaction[];
  onBack: () => void;
  onAddPurchase: (purchase: PurchaseRecord) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  onUpdateDealer: (dealer: Dealer) => void;
}

export const DealerProfileDetail: React.FC<DealerProfileDetailProps> = ({
  dealer,
  products,
  purchases,
  payments,
  transactions,
  onBack,
  onAddPurchase,
  onAddPayment,
  onUpdateDealer
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'ledger' | 'payments' | 'prices' | 'notes'>('purchases');

  // Modals state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Admin note state
  const [noteText, setNoteText] = useState(dealer.adminNote || '');
  const [noteSavedMsg, setNoteSavedMsg] = useState(false);

  // Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    purchaseNumber: `SAT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
    purchaseDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: '',
    items: [] as PurchaseItem[]
  });

  // Purchase Item Form Line
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemDiscount, setItemDiscount] = useState(0);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentNumber: `ODM-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 1000,
    paymentMethod: 'havale' as PaymentRecord['paymentMethod'],
    documentNumber: '',
    description: ''
  });

  // Handle Select Product in Purchase Form
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      const customP = dealer.customPrices?.[prod.id];
      setItemPrice(customP !== undefined ? customP : prod.dealerPrice);
      setSelectedVariantId(prod.variants?.[0]?.id || '');
    }
  };

  // Add Item to Purchase List
  const handleAddItemToPurchase = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const variant = prod.variants?.find(v => v.id === selectedVariantId);
    const subtotalLine = (itemQty * itemPrice) - itemDiscount;
    const vatLine = subtotalLine * (prod.vatRate / 100);
    const totalLine = subtotalLine + vatLine;

    const newItem: PurchaseItem = {
      id: `pi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: prod.id,
      productName: prod.name,
      productCode: prod.code,
      variantId: variant?.id,
      color: variant?.color || prod.colors?.[0],
      size: variant?.size || prod.sizes?.[0],
      quantity: itemQty,
      unitPrice: itemPrice,
      discount: itemDiscount,
      vatRate: prod.vatRate,
      totalAmount: totalLine
    };

    setPurchaseForm({
      ...purchaseForm,
      items: [...purchaseForm.items, newItem]
    });

    // Reset line state
    setSelectedProductId('');
    setItemQty(1);
    setItemPrice(0);
    setItemDiscount(0);
  };

  // Save Purchase
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseForm.items.length === 0) {
      alert('Lütfen en az bir ürün ekleyiniz.');
      return;
    }

    const subtotal = purchaseForm.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
    const totalDiscount = purchaseForm.items.reduce((acc, i) => acc + i.discount, 0);
    const grandTotal = purchaseForm.items.reduce((acc, i) => acc + i.totalAmount, 0);
    const totalVat = grandTotal - (subtotal - totalDiscount);

    const newPurchase: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      dealerId: dealer.id,
      purchaseNumber: purchaseForm.purchaseNumber,
      purchaseDate: new Date(purchaseForm.purchaseDate).toISOString(),
      dueDate: new Date(purchaseForm.dueDate).toISOString(),
      items: purchaseForm.items,
      subtotal,
      totalDiscount,
      totalVat,
      grandTotal,
      paidAmount: 0,
      remainingAmount: grandTotal,
      paymentStatus: 'pending',
      description: purchaseForm.description,
      createdAt: new Date().toISOString()
    };

    onAddPurchase(newPurchase);
    setShowPurchaseModal(false);
  };

  // Save Payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentForm.amount <= 0) {
      alert('Lütfen geçerli bir ödeme tutarı giriniz.');
      return;
    }

    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      dealerId: dealer.id,
      paymentNumber: paymentForm.paymentNumber,
      paymentDate: new Date(paymentForm.paymentDate).toISOString(),
      amount: paymentForm.amount,
      paymentMethod: paymentForm.paymentMethod,
      documentNumber: paymentForm.documentNumber,
      description: paymentForm.description,
      recordedBy: 'admin',
      createdAt: new Date().toISOString()
    };

    onAddPayment(newPay);
    setShowPaymentModal(false);
  };

  // Save Note
  const handleSaveAdminNote = () => {
    onUpdateDealer({
      ...dealer,
      adminNote: noteText
    });
    setNoteSavedMsg(true);
    setTimeout(() => setNoteSavedMsg(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Bayi Listesine Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {dealer.code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {dealer.companyName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Yetkili: {dealer.authorizedPerson} • {dealer.city} / {dealer.district}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yeni Ürün Alışı Kaydet
          </button>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <DollarSign className="w-4 h-4" />
            Ödeme / Tahsilat Ekle
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Toplam Satın Alma</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatTL(dealer.totalPurchases)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fatura toplamı</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Toplam Yapılan Ödeme</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatTL(dealer.totalPayments)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tahsilatlar</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/10 shadow-sm">
          <span className="text-xs font-semibold text-amber-800 uppercase">Kalan Borç Bakiyesi</span>
          <p className="text-2xl font-bold text-amber-900 mt-1">{formatTL(dealer.remainingBalance)}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Güncel hesap bakiyesi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/10 shadow-sm">
          <span className="text-xs font-semibold text-red-800 uppercase">Vadesi Geçmiş Bakiye</span>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatTL(dealer.overdueBalance)}</p>
          <p className="text-[11px] text-red-600 mt-0.5">Son ödeme günü geçmiş tutar</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'purchases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Satın Alma Kayıtları ({purchases.length})
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'ledger' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Cari Hesap Hareketleri ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Ödeme Geçmişi ({payments.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
            }`}
          >
            <FileText className="w-4 h-4" />
            Admin Notları
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {/* TAB 1: PURCHASES */}
          {activeTab === 'purchases' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                      <th className="p-3">Sipariş No</th>
                      <th className="p-3">Tarih</th>
                      <th className="p-3">Vade Tarihi</th>
                      <th className="p-3 text-center">Ürün Kalemi</th>
                      <th className="p-3 text-right">Toplam Tutar</th>
                      <th className="p-3 text-center">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Henüz verilmiş bir satın alma kaydı bulunmamaktadır.
                        </td>
                      </tr>
                    ) : (
                      purchases.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold font-mono text-slate-900">{p.purchaseNumber}</td>
                          <td className="p-3">{formatDate(p.purchaseDate)}</td>
                          <td className="p-3">{formatDate(p.dueDate)}</td>
                          <td className="p-3 text-center">{p.items.length} Kalem</td>
                          <td className="p-3 text-right font-extrabold text-slate-900">{formatTL(p.grandTotal)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {p.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CARI HESAP LEDGER (Tarih, İşlem Türü, Açıklama, Borç, Alacak, Bakiye, Kullanıcı) */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                      <th className="p-3">Tarih</th>
                      <th className="p-3">İşlem Türü</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3 text-right">Borç (₺)</th>
                      <th className="p-3 text-right">Alacak (₺)</th>
                      <th className="p-3 text-right">Bakiye (₺)</th>
                      <th className="p-3 text-center">İşlemi Yapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Cari hareket bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/80">
                          <td className="p-3">{formatDate(tx.date)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.transactionType === 'purchase' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {tx.transactionType === 'purchase' ? 'Ürün Alışı' : 'Ödeme'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{tx.description}</td>
                          <td className="p-3 text-right font-bold text-amber-700">
                            {tx.debit > 0 ? formatTL(tx.debit) : '-'}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-700">
                            {tx.credit > 0 ? formatTL(tx.credit) : '-'}
                          </td>
                          <td className="p-3 text-right font-extrabold text-slate-900">
                            {formatTL(tx.balance)}
                          </td>
                          <td className="p-3 text-center text-slate-500">{tx.recordedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                      <th className="p-3">Makbuz / Dekont No</th>
                      <th className="p-3">Ödeme Tarihi</th>
                      <th className="p-3">Ödeme Yöntemi</th>
                      <th className="p-3 text-right">Tutar</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3 text-center">Kaydeden</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Tahsilat kaydı bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold font-mono">{pay.documentNumber || pay.paymentNumber}</td>
                          <td className="p-3">{formatDate(pay.paymentDate)}</td>
                          <td className="p-3 font-semibold uppercase">{pay.paymentMethod}</td>
                          <td className="p-3 text-right font-extrabold text-emerald-700">{formatTL(pay.amount)}</td>
                          <td className="p-3 text-slate-600">{pay.description || '-'}</td>
                          <td className="p-3 text-center text-slate-500">{pay.recordedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2 text-xs">
                  Bayiye Özel Admin Notları
                </label>
                <textarea
                  rows={5}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Bu bayi ile ilgili özel ödeme anlaşmaları, vadeler veya hatırlatmalar..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {noteSavedMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Admin notu başarıyla güncellendi.
                </div>
              )}

              <button
                onClick={handleSaveAdminNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Notu Kaydet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PURCHASE ADD MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Bayiye Yeni Satın Alma / Ürün Alışı Ekle
            </h3>

            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Fatura / Belge No</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.purchaseNumber}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Satın Alma Tarihi</label>
                  <input
                    type="date"
                    required
                    value={purchaseForm.purchaseDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              {/* Line Add */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 uppercase block">Ürün Kalemi Ekle</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                    >
                      <option value="">-- Ürün Seçiniz --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code}) - Stok: {p.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                      placeholder="Adet"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Birim Fiyat (TL)"
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-bold text-blue-700"
                  />
                  <button
                    type="button"
                    disabled={!selectedProductId}
                    onClick={handleAddItemToPurchase}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg"
                  >
                    Kalem Ekle
                  </button>
                </div>
              </div>

              {/* Items List */}
              {purchaseForm.items.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <span className="font-bold text-slate-800 uppercase block">Eklenecek Ürünler</span>
                  {purchaseForm.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[10px] text-slate-500">{item.quantity} Adet × {formatTL(item.unitPrice)}</p>
                      </div>
                      <span className="font-extrabold text-blue-800">{formatTL(item.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={purchaseForm.items.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl"
                >
                  Satın Almayı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT ADD MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Bayiden Ödeme / Tahsilat Kaydet
            </h3>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Tahsil Edilen Tutar (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-extrabold text-emerald-900 text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Ödeme Yöntemi</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="havale">Havale</option>
                  <option value="eft">EFT</option>
                  <option value="kredi_karti">Kredi Kartı</option>
                  <option value="nakit">Nakit</option>
                  <option value="cek">Çek</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Dekont / Belge No</label>
                <input
                  type="text"
                  value={paymentForm.documentNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, documentNumber: e.target.value })}
                  placeholder="Örn: DEK-992211"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
