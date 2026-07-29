import React from 'react';
import { Product } from '../types';
import { isInvalidImageUrl } from '../lib/firebaseService';
import { AlertTriangle, Edit3, ImageOff } from 'lucide-react';

interface InvalidImageWarningBannerProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
}

export const InvalidImageWarningBanner: React.FC<InvalidImageWarningBannerProps> = ({
  products,
  onEditProduct
}) => {
  const invalidProducts = products.filter((p) => {
    const mainInvalid = isInvalidImageUrl(p.imageUrl);
    const hasInvalidInImages = p.images?.some((img) => isInvalidImageUrl(img.originalUrl));
    return mainInvalid || hasInvalidInImages;
  });

  if (invalidProducts.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-xl shrink-0 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
            Yerel / Geçici Görsel Tespit Edildi ({invalidProducts.length} Ürün)
          </h4>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Aşağıdaki ürünlerde <strong>blob, base64, localhost</strong> veya yerel bilgisayar klasör
            yolları tespit edildi. Görsellerin diğer bilgisayar, mobil cihaz ve gizli sekmelerden
            sorunsuz görüntülenmesi için lütfen bu ürünleri düzenleyip Firebase Cloud Storage'a yükleyin.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {invalidProducts.map((p) => (
          <div
            key={p.id}
            className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-xs"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <ImageOff className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{p.code}</p>
              </div>
            </div>
            <button
              onClick={() => onEditProduct(p)}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Düzenle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
