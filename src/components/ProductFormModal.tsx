import React, { useState } from 'react';
import { Product, ProductVariant, ProductImage } from '../types';
import { ImageUploader } from './ImageUploader';
import { 
  X, Save, Plus, Trash2, Package, Tag, 
  DollarSign, Image as ImageIcon, Layers, AlertCircle
} from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  categories: string[];
  brands: string[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  brands,
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'price' | 'variants' | 'images'>('info');

  const [formData, setFormData] = useState<Product>({
    id: product?.id || `prd-new-${Date.now()}`,
    name: product?.name || '',
    code: product?.code || '',
    barcode: product?.barcode || (product ? '' : `869${Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')}`),
    brand: product?.brand || (brands[0] || 'Genel'),
    category: product?.category || (categories[0] || 'Genel'),
    subcategory: product?.subcategory || '',
    description: product?.description || '',
    colors: product?.colors || ['Siyah', 'Beyaz'],
    sizes: product?.sizes || ['S', 'M', 'L'],
    variants: product?.variants || [],
    stock: product?.stock !== undefined ? product.stock : 10,
    price: product?.price || 0,
    dealerPrice: product?.dealerPrice || 0,
    discountedPrice: undefined,
    vatRate: 20,
    status: product?.status || 'active',
    isNew: product?.isNew || false,
    isCampaign: product?.isCampaign || false,
    isFeatured: product?.isFeatured || false,
    createdAt: product?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: product?.images || []
  });

  // Helper function to auto-generate SKU Code from Product Name
  const generateCodeFromName = (nameStr: string) => {
    if (!nameStr.trim()) return '';
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'I', 'İ': 'I',
      'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
    };
    const clean = nameStr
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, letter => trMap[letter] || letter)
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    let prefix = 'PRD';
    if (words.length >= 2) {
      prefix = words.slice(0, 3).map(w => w.slice(0, 3)).join('-');
    } else if (words.length === 1) {
      prefix = words[0].slice(0, 6);
    }
    return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  };

  // Helper to generate 13 digit random EAN Barcode
  const generateRandomBarcode = () => {
    const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    return `869${digits}`;
  };

  const handleNameChange = (newName: string) => {
    const isNewPrd = !product || !formData.code || formData.code.startsWith('PRD-') || formData.code.includes('-');
    const newCode = isNewPrd ? (generateCodeFromName(newName) || formData.code) : formData.code;
    setFormData(prev => ({
      ...prev,
      name: newName,
      code: newCode
    }));
  };

  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Variant addition
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: formData.id,
      color: formData.colors[0] || 'Siyah',
      size: formData.sizes[0] || 'M',
      sku: `${formData.code}-${formData.colors[0] || 'VAR'}-${Date.now().toString().slice(-4)}`,
      barcode: '',
      stock: 5
    };
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant]
    });
  };

  const handleRemoveVariant = (variantId: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== variantId)
    });
  };

  const handleUpdateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
    });
  };

  // Color tag management
  const addColor = () => {
    if (!colorInput.trim()) return;
    if (!formData.colors.includes(colorInput.trim())) {
      setFormData({ ...formData, colors: [...formData.colors, colorInput.trim()] });
    }
    setColorInput('');
  };

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) });
  };

  // Size tag management
  const addSize = () => {
    if (!sizeInput.trim()) return;
    if (!formData.sizes.includes(sizeInput.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
    }
    setSizeInput('');
  };

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Lütfen ürün adını giriniz.');
      setActiveTab('info');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('Lütfen ürün kodunu (SKU) giriniz.');
      setActiveTab('info');
      return;
    }

    if (formData.price <= 0) {
      setErrorMsg('Genel satış fiyatı 0\'dan büyük olmalıdır.');
      setActiveTab('price');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              {product ? 'Ürün Bilgilerini Düzenle' : 'Yeni Ürün Oluştur'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Error Banner */}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            1. Genel Bilgiler
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('price')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'price' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            2. Fiyat & Stok
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'variants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            3. Renk, Beden & Varyantlar ({formData.variants.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'images' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            4. Görseller ({formData.images.length})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: Genel Bilgiler */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Örn: Pro Runner Elite Koşu Ayakkabısı"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Ürün adını yazarken ürün kodu (SKU) otomatik oluşturulur.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Ürün Kodu (SKU) *</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, code: generateCodeFromName(prev.name || 'Ürün') }))}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Otomatik Yenile
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Örn: PRD-RN-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Barkod</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, barcode: generateRandomBarcode() }))}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Rastgele Ver
                    </button>
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Örn: 8690001122331"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Marka
                  </label>
                  <input
                    type="text"
                    list="brand-list"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Marka seçin veya yazın"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="brand-list">
                    {brands.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    list="cat-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Kategori seçin veya yazın"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="cat-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Alt Kategori
                </label>
                <input
                  type="text"
                  value={formData.subcategory || ''}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="Örn: Koşu / Eşofman / Sırt Çantası"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Ürün Açıklaması
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün hakkında detaylı bilgi, kumaş türü veya kullanım alanı yazabilirsiniz..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Fiyat & Stok */}
          {activeTab === 'price' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Genel Satış Fiyatı (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-blue-800 uppercase mb-1">
                    Bayi Alış Fiyatı (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.dealerPrice}
                    onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-lg text-blue-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Genel Stok Adedi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status and Badges */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <span className="block font-bold text-slate-700 uppercase">Ürün Durumu & Etiketler</span>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Aktif (Katalogda Görünsün)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="passive"
                      checked={formData.status === 'passive'}
                      onChange={() => setFormData({ ...formData, status: 'passive' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Pasif</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isNew || false}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Yeni Ürün Etiketi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isCampaign || false}
                      onChange={(e) => setFormData({ ...formData, isCampaign: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Kampanyalı Ürün Etiketi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured || false}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Öne Çıkan Ürün Etiketi</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Renk, Beden & Varyantlar */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {/* Colors */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mevcut Renkler
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Renk adı ekleyin (örn: Siyah, Kırmızı)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-3 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.colors.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-semibold text-slate-700 flex items-center gap-1">
                      {c}
                      <button type="button" onClick={() => removeColor(c)} className="text-red-500 hover:text-red-700">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mevcut Bedenler
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Beden ekleyin (örn: S, M, 42, Standart)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-3 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.sizes.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-semibold text-slate-700 flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => removeSize(s)} className="text-red-500 hover:text-red-700">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Variant Matrix Table */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase">Ürün Varyant Listesi</span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Varyant Ekle
                  </button>
                </div>

                {formData.variants.length === 0 ? (
                  <p className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                    Henüz özel varyant eklenmedi. Ürün genel renk ve beden bilgileri ile satılabilir.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                          <th className="p-2">Renk</th>
                          <th className="p-2">Beden</th>
                          <th className="p-2">SKU</th>
                          <th className="p-2">Stok</th>
                          <th className="p-2 text-right">Sil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.variants.map(v => (
                          <tr key={v.id}>
                            <td className="p-2">
                              <select
                                value={v.color}
                                onChange={(e) => handleUpdateVariant(v.id, 'color', e.target.value)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                              >
                                {formData.colors.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={v.size}
                                onChange={(e) => handleUpdateVariant(v.id, 'size', e.target.value)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                              >
                                {formData.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs w-full"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => handleUpdateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-xs w-20"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Görseller (Integrated ImageUploader) */}
          {activeTab === 'images' && (
            <ImageUploader
              images={formData.images}
              onChange={(newImages) => setFormData({ ...formData, images: newImages })}
            />
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              Ürünü Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
