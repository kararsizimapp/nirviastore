import React, { useState } from 'react';
import { X, Plus, Edit3, Trash2, Check, Bookmark, Sparkles } from 'lucide-react';

interface BrandManagerModalProps {
  brands: string[];
  onSave: (brands: string[]) => Promise<void> | void;
  onClose: () => void;
}

export const BrandManagerModal: React.FC<BrandManagerModalProps> = ({
  brands: initialBrands,
  onSave,
  onClose
}) => {
  const [brands, setBrands] = useState<string[]>([...initialBrands]);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddBrand = () => {
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;
    if (brands.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Bu marka zaten mevcut.');
      return;
    }
    setErrorMsg(null);
    setBrands([...brands, trimmed]);
    setNewBrandInput('');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(brands[index]);
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    if (brands.some((b, i) => i !== index && b.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Bu isimde başka bir marka bulunuyor.');
      return;
    }
    setErrorMsg(null);
    const updated = [...brands];
    updated[index] = trimmed;
    setBrands(updated);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDeleteBrand = (index: number) => {
    setErrorMsg(null);
    setBrands(brands.filter((_, i) => i !== index));
  };

  const handleApplyChanges = async () => {
    setIsSaving(true);
    try {
      await onSave(brands);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Markalar kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Marka Yönetimi</h3>
              <p className="text-[11px] text-slate-400">Ürün markalarını ekleyin, düzenleyin veya kaldırın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          {/* New Brand Form */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Yeni Marka Ekle
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBrand())}
                placeholder="Örn: Nike, Adidas, Puma..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddBrand}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>
            </div>
          </div>

          {/* Current Brands List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mevcut Markalar ({brands.length})
              </span>
            </div>

            {brands.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                Henüz tanımlı marka bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2">
                {brands.map((brand, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100/60 transition-colors"
                  >
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                          className="flex-1 px-3 py-1 bg-white border border-amber-400 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          title="Kaydet"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-semibold text-slate-800">{brand}</span>
                      </div>
                    )}

                    {editingIndex !== idx && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Markayı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleApplyChanges}
            disabled={isSaving}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};
