import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getStorage } from 'firebase/storage';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app, { storage, db, config } from './firebase';
import { Product, ProductImage } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  let authUser: any = null;
  try {
    const auth = getAuth(app);
    authUser = auth.currentUser;
  } catch (e) {
    // Ignore auth fetch error
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authUser?.uid,
      email: authUser?.email,
      emailVerified: authUser?.emailVerified,
      isAnonymous: authUser?.isAnonymous,
      tenantId: authUser?.tenantId,
      providerInfo: authUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
}

export interface FirebaseImageUploadResult {
  imageUrl: string;
  imagePath: string;
  imageName: string;
  imageContentType: string;
  imageSize: number;
  productImage: ProductImage;
}

// 1. Image preparation & WEBP conversion
export async function prepareAndCompressImageToWebp(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  maxSizeBytes = 5 * 1024 * 1024 // 5 MB
): Promise<{ blob: Blob; width: number; height: number; safeFileName: string }> {
  // Validate file format
  const validExtensions = /\.(jpe?g|png|webp)$/i;
  const isTypeValid = file.type.startsWith('image/') || validExtensions.test(file.name);

  if (!isTypeValid) {
    throw new Error('Geçersiz dosya formatı. Lütfen yalnızca JPG, JPEG, PNG veya WEBP görsel yükleyin.');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width || 800;
      let height = img.height || 800;

      // Scale down proportionally to fit inside maxWidth x maxHeight (1600x1600)
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Görsel işleme hatası oluştu (Canvas Context oluşturulamadı).'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Görsel WEBP formatına dönüştürülemedi.'));
            return;
          }

          if (blob.size > maxSizeBytes) {
            reject(
              new Error(
                `Dönüştürülen WEBP görselinin boyutu 5 MB sınırını aşıyor (${(blob.size / (1024 * 1024)).toFixed(2)} MB). Lütfen daha küçük bir dosya seçin.`
              )
            );
            return;
          }

          const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
          const safeFileName = `${rawName || 'image'}.webp`;

          resolve({
            blob,
            width,
            height,
            safeFileName
          });
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Görsel dosyası okunamadı veya bozuk.'));
    };

    img.src = objectUrl;
  });
}

// Helper to parse and translate specific Firebase Storage error codes
export function parseFirebaseStorageError(err: any): { code: string; message: string; fullError: string } {
  if (!err) {
    return {
      code: 'storage/unknown',
      message: 'Bilinmeyen bir hata oluştu.',
      fullError: '[storage/unknown] Bilinmeyen Hata'
    };
  }

  const code = err.code || err.name || 'storage/unknown';
  const rawMsg = err.message || String(err);
  let detailMessage = rawMsg;

  switch (code) {
    case 'storage/unauthorized':
      detailMessage = 'Depolama izni yetersiz. Firebase Storage güvenlik kurallarını kontrol edin.';
      break;
    case 'storage/object-not-found':
      detailMessage = 'Nesne bulunamadı veya belirtilen kova mevcut değil.';
      break;
    case 'storage/retry-limit-exceeded':
      detailMessage = 'Yükleme deneme sınırı aşıldı. Ağ bağlantınızı veya sunucu erişilebilirliğini kontrol edin.';
      break;
    case 'storage/quota-exceeded':
      detailMessage = 'Firebase Storage depolama kotası doldu.';
      break;
    case 'storage/canceled':
      detailMessage = 'Yükleme işlemi kullanıcı veya sistem tarafından iptal edildi.';
      break;
    case 'storage/invalid-checksum':
      detailMessage = 'Dosya doğrulama hatası (Checksum uyuşmazlığı).';
      break;
    case 'storage/cannot-slice-blob':
      detailMessage = 'Dosya okuma hatası oluştu.';
      break;
    case 'storage/server-file-wrong-size':
      detailMessage = 'Sunucuya iletilen dosya boyutu uyumsuz.';
      break;
    case 'storage/unknown':
      detailMessage = 'Bilinmeyen bir depolama hatası oluştu.';
      break;
  }

  const fullError = `Firebase Storage Hatası [${code}]: ${detailMessage} (${rawMsg})`;
  return { code, message: detailMessage, fullError };
}

// 2. Upload file to Firebase Cloud Storage with resilient error handling & timeout
export async function uploadImageToFirebaseStorage(
  productId: string,
  file: File,
  onProgress?: (progressPct: number) => void
): Promise<FirebaseImageUploadResult> {
  if (!productId) {
    throw new Error('Görsel yüklenemedi: Ürün Kimliği (productId) belirtilmedi.');
  }

  if (onProgress) onProgress(10);

  // Step 1: Compress & resize image to WEBP <= 1600x1600 and <= 5MB
  const { blob, width, height, safeFileName } = await prepareAndCompressImageToWebp(file);

  if (onProgress) onProgress(35);

  const timestamp = Date.now();
  const imagePath = `products/${productId}/${timestamp}-${safeFileName}`;

  // 8. Console.log ile storageBucket, projectId ve upload path değerlerini yazdır
  console.log('[Firebase Storage Upload Info]', {
    storageBucket: config.storageBucket,
    projectId: config.projectId,
    uploadPath: imagePath,
    fileName: safeFileName,
    fileSize: blob.size,
    fileType: blob.type
  });

  // Helper function for simple uploadBytes test & upload
  const performUpload = async (): Promise<{ downloadUrl: string; usedPath: string }> => {
    let activeStorage = storage;
    let storageRef = ref(activeStorage, imagePath);

    if (onProgress) onProgress(55);

    try {
      // 4. uploadBytes basit test ve yükleme işlemi
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'image/webp',
        customMetadata: { productId, safeFileName }
      });
      if (onProgress) onProgress(80);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return { downloadUrl, usedPath: imagePath };
    } catch (primaryError: any) {
      // 5. Firebase Storage bağlantı hatalarını ayrıntılı logla
      console.error('[Firebase Storage Connection/Upload Error Details]', {
        code: primaryError?.code,
        name: primaryError?.name,
        message: primaryError?.message,
        serverResponse: primaryError?.serverResponse,
        customData: primaryError?.customData,
        storageBucket: config.storageBucket,
        projectId: config.projectId,
        uploadPath: imagePath
      });

      // Alternatif storage kovası alan adlarını dene (örn. gs://<projectId>.firebasestorage.app vs gs://<projectId>.appspot.com)
      if (config.projectId) {
        const altBucketUrls = [
          `gs://${config.projectId}.firebasestorage.app`,
          `gs://${config.projectId}.appspot.com`
        ];
        for (const altBucketUrl of altBucketUrls) {
          try {
            console.log(`[Firebase Storage Retry] Alternatif kova deneniyor: ${altBucketUrl}`);
            const altStorage = getStorage(app, altBucketUrl);
            const altRef = ref(altStorage, imagePath);
            const altSnapshot = await uploadBytes(altRef, blob, {
              contentType: 'image/webp',
              customMetadata: { productId, safeFileName }
            });
            if (onProgress) onProgress(85);
            const downloadUrl = await getDownloadURL(altSnapshot.ref);
            return { downloadUrl, usedPath: imagePath };
          } catch (altErr: any) {
            console.warn(`[Firebase Storage Retry Failed] ${altBucketUrl}:`, altErr?.code || altErr?.message);
          }
        }
      }

      throw primaryError;
    }
  };

  // 6. Timeout süresini artır (60 saniye) ve zaman aşımında belirgin hata kodu üret
  const timeoutMs = 60000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const timeoutErr: any = new Error(`Firebase Cloud Storage yükleme süresi doldu (${timeoutMs / 1000}s Zaman Aşımı).`);
      timeoutErr.code = 'storage/retry-limit-exceeded';
      reject(timeoutErr);
    }, timeoutMs);
  });

  try {
    const { downloadUrl } = await Promise.race([performUpload(), timeoutPromise]);

    if (!downloadUrl || isInvalidImageUrl(downloadUrl)) {
      throw new Error('Geçersiz indirme adresi alındı.');
    }

    if (onProgress) onProgress(100);

    const productImage: ProductImage = {
      id: `img-${timestamp}-${Math.floor(Math.random() * 1000)}`,
      originalUrl: downloadUrl,
      optimizedUrl: downloadUrl,
      thumbnailUrl: downloadUrl,
      fileName: safeFileName,
      fileType: 'image/webp',
      fileSize: blob.size,
      width,
      height,
      uploadDate: new Date().toISOString(),
      order: 1,
      isMain: true
    };

    return {
      imageUrl: downloadUrl,
      imagePath,
      imageName: safeFileName,
      imageContentType: 'image/webp',
      imageSize: blob.size,
      productImage
    };
  } catch (err: any) {
    // 5 & 7. Detaylı loglama ve özel Firebase Storage hata kodu işleme
    const parsed = parseFirebaseStorageError(err);
    console.error('[Firebase Storage Upload Error Handled]', {
      code: parsed.code,
      message: parsed.message,
      fullError: parsed.fullError,
      storageBucket: config.storageBucket,
      projectId: config.projectId,
      uploadPath: imagePath,
      rawError: err
    });

    // 6. Gerçek Firebase hata kodunu ve açıklamasını kullanıcıya göster
    throw new Error(parsed.fullError);
  }
}

// 3. Delete single image from Storage
export async function deleteStorageImage(imagePath: string): Promise<void> {
  if (!imagePath) return;
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (err: any) {
    console.warn(`Storage görseli silinirken uyarı (${imagePath}):`, err?.message || err);
  }
}

// 4. Delete all images under product folder in Storage
export async function deleteAllProductImagesFromStorage(productId: string): Promise<void> {
  if (!productId) return;
  try {
    const folderRef = ref(storage, `products/${productId}`);
    const res = await listAll(folderRef);
    for (const item of res.items) {
      await deleteObject(item);
    }
  } catch (err: any) {
    console.warn(`Ürün görselleri Storage'dan silinirken uyarı (${productId}):`, err?.message || err);
  }
}

// 5. Invalid URL detector
export function isInvalidImageUrl(url?: string | null): boolean {
  if (!url) return true;
  const lower = url.toLowerCase().trim();
  return (
    lower.startsWith('blob:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('c:') ||
    lower.startsWith('c:\\') ||
    lower.includes('localhost') ||
    lower.includes('127.0.0.1')
  );
}

// 6. Firestore Product API methods
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const collectionPath = 'products';
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const products: Product[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as any;
      const id = docSnapshot.id || data.id;

      // Sanitize main image URL
      let mainImageUrl = data.imageUrl || (data.images && data.images[0]?.originalUrl) || '';
      if (isInvalidImageUrl(mainImageUrl)) {
        mainImageUrl = '';
      }

      // Sanitize images array
      const sanitizedImages: ProductImage[] = Array.isArray(data.images)
        ? data.images.filter((img: ProductImage) => img && !isInvalidImageUrl(img.originalUrl))
        : [];

      if (mainImageUrl && sanitizedImages.length === 0) {
        sanitizedImages.push({
          id: `img-${id}-1`,
          originalUrl: mainImageUrl,
          optimizedUrl: mainImageUrl,
          thumbnailUrl: mainImageUrl,
          fileName: data.imageName || 'image.webp',
          fileType: data.imageContentType || 'image/webp',
          fileSize: data.imageSize || 0,
          uploadDate: data.updatedAt || new Date().toISOString(),
          order: 1,
          isMain: true
        });
      }

      products.push({
        ...data,
        id,
        imageUrl: mainImageUrl,
        imagePath: data.imagePath || '',
        imageName: data.imageName || '',
        imageContentType: data.imageContentType || '',
        imageSize: data.imageSize || 0,
        images: sanitizedImages
      } as Product);
    });

    return products;
  } catch (err: any) {
    console.error('Firestore getDocs hatası:', err);
    if (err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('permission'))) {
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    }
    return [];
  }
}

export async function saveProductToFirestore(product: Product): Promise<Product> {
  if (!product.id) {
    product.id = `prd-${Date.now()}`;
  }
  const documentPath = `products/${product.id}`;

  // Sanitize main image URL before saving
  let mainImageUrl = product.imageUrl || (product.images && product.images[0]?.originalUrl) || '';
  if (isInvalidImageUrl(mainImageUrl)) {
    mainImageUrl = '';
  }

  let imagePath = product.imagePath || '';
  let imageName = product.imageName || '';
  let imageContentType = product.imageContentType || '';
  let imageSize = product.imageSize || 0;

  if (product.images && product.images.length > 0) {
    const mainImg = product.images.find(img => img.isMain) || product.images[0];
    if (mainImg && !isInvalidImageUrl(mainImg.originalUrl)) {
      mainImageUrl = mainImg.originalUrl;
      imageName = mainImg.fileName || imageName;
      imageContentType = mainImg.fileType || imageContentType;
      imageSize = mainImg.fileSize || imageSize;
    }
  }

  const firestoreData: Record<string, any> = {
    ...product,
    imageUrl: mainImageUrl,
    imagePath,
    imageName,
    imageContentType,
    imageSize,
    images: (product.images || []).filter(img => !isInvalidImageUrl(img.originalUrl)),
    updatedAt: new Date().toISOString()
  };

  const cleanedData: Record<string, any> = {};
  Object.keys(firestoreData).forEach((key) => {
    if (firestoreData[key] !== undefined) {
      cleanedData[key] = firestoreData[key];
    }
  });

  try {
    await setDoc(doc(db, 'products', product.id), cleanedData, { merge: true });
    return cleanedData as Product;
  } catch (err: any) {
    console.error('Firestore setDoc hatası:', err);
    if (err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('permission'))) {
      handleFirestoreError(err, OperationType.WRITE, documentPath);
    }
    return cleanedData as Product;
  }
}

export async function deleteProductFromFirestore(
  productId: string,
  imagePath?: string
): Promise<void> {
  if (!productId) return;
  const documentPath = `products/${productId}`;

  try {
    // Delete product document from Firestore
    await deleteDoc(doc(db, 'products', productId));

    // Delete associated image from Storage
    if (imagePath) {
      await deleteStorageImage(imagePath);
    }
    await deleteAllProductImagesFromStorage(productId);
  } catch (err: any) {
    console.error('Firestore deleteDoc hatası:', err);
    if (err?.code === 'permission-denied' || (err?.message && err.message.toLowerCase().includes('permission'))) {
      handleFirestoreError(err, OperationType.DELETE, documentPath);
    }
  }
}

// 7. Detection of invalid local images in list
export function findInvalidImageProducts(products: Product[]): Product[] {
  return products.filter((p) => {
    const mainInvalid = isInvalidImageUrl(p.imageUrl);
    const hasInvalidInArray = p.images?.some((img) => isInvalidImageUrl(img.originalUrl));
    return mainInvalid || hasInvalidInArray;
  });
}
