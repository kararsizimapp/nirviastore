import React, { useState } from 'react';
import { ProductImage } from '../types';
import { ApiClient, fixImageUrl } from '../lib/api';
import { 
  Upload, Link as LinkIcon, Image as ImageIcon, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, Star, ArrowUp, ArrowDown, FileCode
} from 'lucide-react';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Frontend Validations
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Desteklenmeyen dosya biçimi! Lütfen JPG, PNG veya WEBP yükleyin.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Dosya boyutu çok büyük! Maksimum dosya boyutu 10 MB olmalıdır.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const result = await ApiClient.uploadFile(file, (pct) => setUploadProgress(pct));
      if (result.success && result.image) {
        const newImg = result.image;
        newImg.isMain = images.length === 0; // First image becomes main
        newImg.order = images.length + 1;
        
        onChange([...images, newImg]);
        setSuccessMessage('Görsel başarıyla yüklendi ve optimize edildi!');
        setUploadProgress(100);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  // URL Upload Handler
  const handleUrlSubmit = async (e: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (customUrl || imageUrlInput).trim();
    if (!targetUrl) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      const result = await ApiClient.uploadUrl(targetUrl);
      if (result.success && result.image) {
        const newImg = result.image;
        newImg.isMain = images.length === 0;
        newImg.order = images.length + 1;

        onChange([...images, newImg]);
        setSuccessMessage('Görsel bağlantısı başarıyla eklendi!');
        setImageUrlInput('');
      }
    } catch (err: any) {
      // Fallback: Add directly client-side if API fails
      let cleanUrl = targetUrl;
      const imgurMatch = cleanUrl.match(/imgur\.com\/(?:a|gallery)?\/([a-zA-Z0-9]+)/i);
      if (imgurMatch && imgurMatch[1] && !cleanUrl.includes('i.imgur.com')) {
        cleanUrl = `https://i.imgur.com/${imgurMatch[1]}.jpg`;
      }

      const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'urun_gorseli.jpg';
      const fallbackImg: ProductImage = {
        id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        originalUrl: cleanUrl,
        optimizedUrl: cleanUrl,
        thumbnailUrl: cleanUrl,
        fileName: filename.length < 30 ? filename : 'urun_gorseli.jpg',
        fileType: 'image/jpeg',
        fileSize: 100000,
        uploadDate: new Date().toISOString(),
        order: images.length + 1,
        isMain: images.length === 0
      };
      onChange([...images, fallbackImg]);
      setSuccessMessage('Görsel bağlantısı doğrudan eklendi!');
      setImageUrlInput('');
    } finally {
      setIsUploading(false);
    }
  };

  // Set Main Image
  const setMainImage = (id: string) => {
    const updated = images.map(img => ({
      ...img,
      isMain: img.id === id
    }));
    onChange(updated);
  };

  // Delete Image
  const deleteImage = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    // If we deleted main image, set first remaining image as main
    if (filtered.length > 0 && !filtered.some(i => i.isMain)) {
      filtered[0].isMain = true;
    }
    onChange(filtered);
  };

  // Reorder Images
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // re-assign order property
    newImages.forEach((img, idx) => {
      img.order = idx + 1;
    });

    onChange(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => { setActiveTab('file'); setErrorMessage(null); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'file'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Dosya Yükle
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'url'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Görsel Linki Ekle
        </button>
      </div>

      {/* Status Alert Messages */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Yükleme Hatası</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button 
            type="button"
            onClick={() => setErrorMessage(null)} 
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="flex-1">{successMessage}</span>
          <button 
            type="button"
            onClick={() => setSuccessMessage(null)} 
            className="text-emerald-600 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: File Upload */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          <label className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all group">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Cihazınızdan ürün fotoğrafı seçin veya buraya sürükleyin
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Desteklenen formatlar: JPG, PNG, WEBP (Maks: 10 MB)
            </p>
          </label>

          {/* Progress Bar */}
          {isUploading && (
            <div className="bg-slate-100 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Görsel yükleniyor ve WebP formatında sıkıştırılıyor...
                </span>
                <span>%{uploadProgress}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Image URL Input */}
      {activeTab === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Görsel Bağlantı Adresi (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit(e as any);
                  }
                }}
                placeholder="https://images.unsplash.com/photo-... Veya görsel bağlantısı yapıştırın"
                className="flex-1 px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={(e) => handleUrlSubmit(e as any)}
                disabled={isUploading || !imageUrlInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shrink-0"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Ekleme Yapılıyor...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Link ile Yükle
                  </>
                )}
              </button>
            </div>
            
            {/* Quick Sample Links */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase block">
                Örnek Görsel Bağlantıları (Hızlı Test İçin Tıklayın):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => handleUrlSubmit(e, 'https://imgur.com/a/VkhbhMf')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                >
                  🧦 Imgur Çorap Linki (Örnek)
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUrlSubmit(e, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                >
                  👟 Kırmızı Ayakkabı
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUrlSubmit(e, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                >
                  🧥 Ceket / Eşofman
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUrlSubmit(e, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                >
                  🎒 Spor Çanta
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUrlSubmit(e, 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=800')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                >
                  🎾 Tenis Raketi
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              * İnternetteki herhangi bir görselin sağ tık &gt; &quot;Resim Adresini Kopyala&quot; diyerek linkini buraya yapıştırabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Image Gallery List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <span>Yüklenmiş Görseller ({images.length})</span>
          <span className="text-xs font-normal text-slate-500 lowercase">
            * görseller kırpılmadan orantılı görüntülenir
          </span>
        </h4>

        {images.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Henüz eklenmiş bir ürün görseli yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div 
                key={img.id}
                className={`relative flex items-center gap-3 p-2.5 border rounded-xl bg-white transition-all ${
                  img.isMain ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Image Preview Box with exact spec requirements */}
                <div 
                  className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <img
                    src={fixImageUrl(img.optimizedUrl || img.originalUrl)}
                    alt={img.fileName}
                    className="w-full h-full object-contain object-center"
                    onError={(e) => {
                      // Fallback preview
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {img.isMain && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        <Star className="w-3 h-3 fill-blue-600" />
                        Ana Görsel
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-400 truncate">
                      #{idx + 1} • {(img.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate" title={img.fileName}>
                    {img.fileName}
                  </p>

                  <div className="flex items-center gap-1 pt-1">
                    {!img.isMain && (
                      <button
                        type="button"
                        onClick={() => setMainImage(img.id)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Ana Yap
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-1 pl-2 border-l border-slate-100">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Yukarı taşı"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Aşağı taşı"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteImage(img.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Görseli Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
