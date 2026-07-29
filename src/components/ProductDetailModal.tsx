import React, { useState } from 'react';
import { Product, Dealer } from '../types';
import { formatTL, fixImageUrl } from '../lib/api';
import { X, Check, AlertTriangle, Sparkles, Tag, ShieldCheck, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  currentDealer?: Dealer;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentDealer,
  onClose
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

  // Calculate price
  const customPrice = currentDealer?.customPrices?.[product.id];
  const effectivePrice = customPrice !== undefined ? customPrice : product.dealerPrice;

  const currentImage = product.images?.[selectedImageIndex] || product.images?.[0];
  const mainImgUrl = fixImageUrl(currentImage?.optimizedUrl || currentImage?.originalUrl);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {product.code}
            </span>
            <h3 className="font-bold text-sm tracking-wide truncate max-w-md">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Image Gallery Frame */}
          <div className="space-y-3">
            <div 
              className="relative w-full h-72 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-4 shadow-sm"
              style={{ backgroundColor: '#ffffff' }}
            >
              <img
                src={mainImgUrl}
                alt={product.name}
                className="w-full h-full object-contain object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
                }}
              />

              {product.isNew && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  YENİ
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg border-2 overflow-hidden shrink-0 flex items-center justify-center p-1 transition-all ${
                      selectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <img
                      src={fixImageUrl(img.thumbnailUrl || img.originalUrl)}
                      alt={img.fileName}
                      className="w-full h-full object-contain object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specifications & Dealer Pricing */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                {product.brand} • {product.category}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                {product.name}
              </h2>
              <p className="text-slate-500 mt-2 leading-relaxed">
                {product.description || 'Açıklama belirtilmemiş.'}
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Bayinize Tanımlı Özel Alış Fiyatı
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-700">
                  {formatTL(effectivePrice)}
                </span>
                <span className="text-xs text-slate-400 line-through font-semibold">
                  {formatTL(product.price)} (Genel Satış)
                </span>
              </div>
            </div>

            {/* Colors Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Mevcut Renk Seçenekleri
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                        selectedColor === color 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Mevcut Beden / Ölçü
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                        selectedSize === size 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability Pill */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-600">Stok Durumu:</span>
              <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                product.stock > 10 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : product.stock > 0 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `${product.stock} Adet Stokta Var` : 'Stok Tükendi'}
              </span>
            </div>

            {/* Technical Specs Footer */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>• Barkod: <span className="font-mono text-slate-700">{product.barcode || '-'}</span></p>
              <p>• Stok Kodu (SKU): <span className="font-mono text-slate-700">{product.code}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
