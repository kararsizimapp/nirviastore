import React, { useState } from 'react';
import { Product } from '../types';
import { formatTL, fixImageUrl } from '../lib/api';
import { InvalidImageWarningBanner } from './InvalidImageWarningBanner';
import { 
  Package, Plus, Search, Filter, Download, Upload, 
  Edit3, Trash2, Eye, LayoutGrid, List, Sparkles, CheckCircle2, AlertTriangle, FileSpreadsheet, X, Tag, Bookmark
} from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  categories: string[];
  brands: string[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onImportExcel: (file: File) => Promise<void>;
  onExportExcel: () => void;
  onManageCategories?: () => void;
  onManageBrands?: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  brands,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onImportExcel,
  onExportExcel,
  onManageCategories,
  onManageBrands
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Filtered List
  const filteredProducts = products.filter(p => {
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchBarcode = p.barcode?.toLowerCase().includes(q);
      return matchName || matchCode || matchBarcode;
    }
    return true;
  });

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      await onImportExcel(importFile);
      setImportMessage('Excel ürün verileri başarıyla sisteme aktarıldı!');
      setTimeout(() => {
        setShowImportModal(false);
        setImportFile(null);
        setImportMessage(null);
      }, 1500);
    } catch (err: any) {
      setImportMessage('Aktarım Hatası: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ürün Kataloğu ve Stok Yönetimi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistemdeki tüm ürünleri, stok adetlerini, bayi alış fiyatlarını ve görselleri yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export & Import */}
          <button
            onClick={onExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Ürünleri Excel dosyası olarak indir"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Excel'e Aktar
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Excel dosyasından toplu ürün yükle"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            Excel'den Yükle
          </button>

          {onManageCategories && (
            <button
              onClick={onManageCategories}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Kategori ekle, düzenle veya sil"
            >
              <Tag className="w-4 h-4 text-purple-600" />
              Kategorileri Yönet
            </button>
          )}

          {onManageBrands && (
            <button
              onClick={onManageBrands}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Marka ekle, düzenle veya sil"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              Markaları Yönet
            </button>
          )}

          <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Migration / Invalid Image Detection Banner */}
      <InvalidImageWarningBanner products={products} onEditProduct={onEditProduct} />

      {/* Filter and View Toggle Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, SKU veya barkod arayın..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tüm Markalar</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif Ürünler</option>
              <option value="passive">Pasif Ürünler</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tablo Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE VIEW (Exact prompt spec: Görsel, Adı, Kodu, Marka, Kategori, Stok, Fiyat, Durum, Düzenle) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Görsel</th>
                  <th className="py-3 px-4">Ürün Adı</th>
                  <th className="py-3 px-4">Ürün Kodu</th>
                  <th className="py-3 px-4">Marka</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4 text-right">Genel Fiyat</th>
                  <th className="py-3 px-4 text-right">Bayi Alış</th>
                  <th className="py-3 px-4 text-center">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      Listelenecek ürün bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const mainImg = p.images?.find(i => i.isMain) || p.images?.[0];
                    const rawUrl = p.imageUrl || mainImg?.optimizedUrl || mainImg?.originalUrl;
                    const imgUrl = fixImageUrl(rawUrl);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Image Thumbnail with Exact Specs */}
                        <td className="py-2.5 px-4">
                          <div 
                            className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0"
                            style={{ backgroundColor: '#ffffff' }}
                          >
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="w-full h-full object-contain object-center"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400&auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>
                        </td>

                        {/* Name & Badges */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 max-w-xs">
                          <div className="line-clamp-1">{p.name}</div>
                          <div className="flex gap-1 mt-0.5">
                            {p.isNew && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-semibold">Yeni</span>
                            )}
                            {p.isCampaign && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-semibold">Kampanya</span>
                            )}
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-2.5 px-4 font-mono text-slate-600">{p.code}</td>

                        {/* Brand */}
                        <td className="py-2.5 px-4">{p.brand}</td>

                        {/* Category */}
                        <td className="py-2.5 px-4">{p.category}</td>

                        {/* Stock */}
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            p.stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.stock}
                          </span>
                        </td>

                        {/* Prices */}
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-600">
                          {formatTL(p.price)}
                        </td>

                        <td className="py-2.5 px-4 text-right font-extrabold text-blue-700">
                          {formatTL(p.dealerPrice)}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {p.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>

                        {/* Action Edit & Delete */}
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditProduct(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ürünü Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmProduct(p)}
                              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                              title="Ürünü Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => {
            const mainImg = p.images?.find(i => i.isMain) || p.images?.[0];
            const rawUrl = p.imageUrl || mainImg?.optimizedUrl || mainImg?.originalUrl;
            const imgUrl = fixImageUrl(rawUrl);

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-3">
                <div 
                  className="w-full h-40 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center p-2 relative"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="w-full h-full object-contain object-center"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {p.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                    <span>{p.brand}</span>
                    <span>{p.code}</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-2">{p.name}</h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Bayi Fiyatı</span>
                    <span className="font-extrabold text-blue-700">{formatTL(p.dealerPrice)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProduct(p)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1"
                      title="Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => setDeleteConfirmProduct(p)}
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                      title="Ürünü Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Excel / CSV Dosyasından Toplu Ürün Yükleme
              </h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Excel dosyanızda şu sütun adlarının yer alması önerilir: <br/>
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">Ürün Adı, Ürün Kodu, Barkod, Marka, Kategori, Stok Adedi, Fiyat, Bayi Fiyatı</code>
              </p>

              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {importFile ? importFile.name : 'Excel (.xlsx, .csv) dosyası seçin'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Tıklayarak cihazınızdan dosya seçebilirsiniz</span>
              </label>

              {importMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs">
                  {importMessage}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!importFile || isImporting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  {isImporting ? 'Yükleniyor...' : 'İçe Aktar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Ürünü Sil</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              <span className="font-bold text-slate-900">&quot;{deleteConfirmProduct.name}&quot;</span> ({deleteConfirmProduct.code}) ürününü sistemden tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(deleteConfirmProduct.id);
                  setDeleteConfirmProduct(null);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Evet, Ürünü Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
