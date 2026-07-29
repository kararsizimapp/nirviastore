import React, { useState, useEffect } from 'react';
import { 
  User, Product, Dealer, PurchaseRecord, PaymentRecord, 
  AccountTransaction, AuditLog 
} from './types';
import { ApiClient } from './lib/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardAdmin } from './components/DashboardAdmin';
import { DashboardDealer } from './components/DashboardDealer';
import { ProductManagement } from './components/ProductManagement';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DealerManagement } from './components/DealerManagement';
import { DealerFormModal } from './components/DealerFormModal';
import { DealerProfileDetail } from './components/DealerProfileDetail';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BrandManagerModal } from './components/BrandManagerModal';
import { LoginModal } from './components/LoginModal';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  // Current User Session (Null if logged out, or stored session)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('b2b_session_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'usr-admin-1',
      username: 'admin',
      name: 'Sistem Yöneticisi',
      email: 'admin@bayisistemi.com',
      role: 'admin'
    };
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('b2b_session_user', JSON.stringify(user));
    } catch (e) {}
    if (user.role === 'dealer') {
      setActiveTab('catalog');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('b2b_session_user');
    } catch (e) {}
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Dealer Profile state
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealerPurchases, setDealerPurchases] = useState<PurchaseRecord[]>([]);
  const [dealerPayments, setDealerPayments] = useState<PaymentRecord[]>([]);
  const [dealerTransactions, setDealerTransactions] = useState<AccountTransaction[]>([]);

  // Modals
  const [productFormModalOpen, setProductFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [dealerFormModalOpen, setDealerFormModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [categoryManagerModalOpen, setCategoryManagerModalOpen] = useState(false);
  const [brandManagerModalOpen, setBrandManagerModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initial Load
  const loadData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const [prodsData, dealersData, bcData, logsData] = await Promise.all([
        ApiClient.getProducts(),
        ApiClient.getDealers(),
        ApiClient.getBrandsAndCategories(),
        ApiClient.getAuditLogs()
      ]);

      // Read local deletion records and custom categories/brands
      let deletedProductIds: string[] = [];
      let deletedDealerIds: string[] = [];
      let customCats: string[] | null = null;
      let customBrands: string[] | null = null;

      try {
        deletedProductIds = JSON.parse(localStorage.getItem('b2b_deleted_product_ids') || '[]');
      } catch (e) { deletedProductIds = []; }

      try {
        deletedDealerIds = JSON.parse(localStorage.getItem('b2b_deleted_dealer_ids') || '[]');
      } catch (e) { deletedDealerIds = []; }

      try {
        const rawCats = localStorage.getItem('b2b_custom_categories');
        if (rawCats) customCats = JSON.parse(rawCats);
      } catch (e) { customCats = null; }

      try {
        const rawBrands = localStorage.getItem('b2b_custom_brands');
        if (rawBrands) customBrands = JSON.parse(rawBrands);
      } catch (e) { customBrands = null; }

      // Filter out deleted items from server response
      const activeProducts = prodsData.filter(p => !deletedProductIds.includes(p.id));
      const activeDealers = dealersData.filter(d => !deletedDealerIds.includes(d.id));

      // Sync backend if server restarted or re-seeded deleted items
      deletedProductIds.forEach((id: string) => {
        if (prodsData.some(p => p.id === id)) {
          ApiClient.deleteProduct(id, 'admin').catch(() => {});
        }
      });
      deletedDealerIds.forEach((id: string) => {
        if (dealersData.some(d => d.id === id)) {
          ApiClient.deleteDealer(id, 'admin').catch(() => {});
        }
      });

      let activeCategories = bcData.categories || [];
      if (customCats && Array.isArray(customCats)) {
        activeCategories = customCats;
        if (JSON.stringify(customCats) !== JSON.stringify(bcData.categories)) {
          ApiClient.saveCategories(customCats, 'admin').catch(() => {});
        }
      }

      let activeBrands = bcData.brands || [];
      if (customBrands && Array.isArray(customBrands)) {
        activeBrands = customBrands;
        if (JSON.stringify(customBrands) !== JSON.stringify(bcData.brands)) {
          ApiClient.saveBrands(customBrands, 'admin').catch(() => {});
        }
      }

      setProducts(activeProducts);
      setDealers(activeDealers);
      setCategories(activeCategories);
      setBrands(activeBrands);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.error('Data load error:', err);
      setGlobalError(err.message || 'Veriler yüklenirken sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When User Role switches
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('catalog');
      // If dealer user, auto select their dealer profile
      const d = dealers.find(dlr => dlr.id === user.dealerId);
      if (d) {
        handleOpenDealerDetail(d);
      }
    }
  };

  // Open Dealer Detail
  const handleOpenDealerDetail = async (dealer: Dealer) => {
    setSelectedDealer(dealer);
    try {
      const [pData, payData, txData] = await Promise.all([
        ApiClient.getDealerPurchases(dealer.id),
        ApiClient.getDealerPayments(dealer.id),
        ApiClient.getDealerTransactions(dealer.id)
      ]);
      setDealerPurchases(pData);
      setDealerPayments(payData);
      setDealerTransactions(txData);
      setActiveTab('dealer_detail');
    } catch (err: any) {
      console.error('Error loading dealer profile detail:', err);
    }
  };

  // Product Save
  const handleSaveProduct = async (product: Product) => {
    try {
      try {
        const deletedProductIds: string[] = JSON.parse(localStorage.getItem('b2b_deleted_product_ids') || '[]');
        if (deletedProductIds.includes(product.id)) {
          const updated = deletedProductIds.filter(id => id !== product.id);
          localStorage.setItem('b2b_deleted_product_ids', JSON.stringify(updated));
        }
      } catch (e) {}

      await ApiClient.saveProduct(product, currentUser?.name || 'admin');
      await loadData();
      setProductFormModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    try {
      let deletedProductIds: string[] = [];
      try {
        deletedProductIds = JSON.parse(localStorage.getItem('b2b_deleted_product_ids') || '[]');
      } catch (e) { deletedProductIds = []; }

      if (!deletedProductIds.includes(id)) {
        deletedProductIds.push(id);
        localStorage.setItem('b2b_deleted_product_ids', JSON.stringify(deletedProductIds));
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      await ApiClient.deleteProduct(id, currentUser?.name || 'admin');
    } catch (err: any) {
      console.error('Delete product error:', err);
    }
  };

  // Dealer Delete
  const handleDeleteDealer = async (id: string) => {
    try {
      let deletedDealerIds: string[] = [];
      try {
        deletedDealerIds = JSON.parse(localStorage.getItem('b2b_deleted_dealer_ids') || '[]');
      } catch (e) { deletedDealerIds = []; }

      if (!deletedDealerIds.includes(id)) {
        deletedDealerIds.push(id);
        localStorage.setItem('b2b_deleted_dealer_ids', JSON.stringify(deletedDealerIds));
      }

      setDealers(prev => prev.filter(d => d.id !== id));
      await ApiClient.deleteDealer(id, currentUser?.name || 'admin');
    } catch (err: any) {
      console.error('Delete dealer error:', err);
    }
  };

  // Categories Save
  const handleSaveCategories = async (newCategories: string[]) => {
    try {
      localStorage.setItem('b2b_custom_categories', JSON.stringify(newCategories));
      setCategories(newCategories);
      await ApiClient.saveCategories(newCategories, currentUser?.name || 'admin');
      await loadData();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Brands Save
  const handleSaveBrands = async (newBrands: string[]) => {
    try {
      localStorage.setItem('b2b_custom_brands', JSON.stringify(newBrands));
      setBrands(newBrands);
      await ApiClient.saveBrands(newBrands, currentUser?.name || 'admin');
      await loadData();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Dealer Save
  const handleSaveDealer = async (dealer: Dealer) => {
    try {
      try {
        const deletedDealerIds: string[] = JSON.parse(localStorage.getItem('b2b_deleted_dealer_ids') || '[]');
        if (deletedDealerIds.includes(dealer.id)) {
          const updated = deletedDealerIds.filter(id => id !== dealer.id);
          localStorage.setItem('b2b_deleted_dealer_ids', JSON.stringify(updated));
        }
      } catch (e) {}

      await ApiClient.saveDealer(dealer, currentUser?.name || 'admin');
      await loadData();
      setDealerFormModalOpen(false);
      setEditingDealer(null);
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Add Dealer Purchase
  const handleAddDealerPurchase = async (purchase: PurchaseRecord) => {
    if (!selectedDealer) return;
    try {
      await ApiClient.addDealerPurchase(selectedDealer.id, purchase, currentUser?.name || 'admin');
      await loadData();
      // Reload current dealer profile details
      const updatedDealer = (await ApiClient.getDealers()).find(d => d.id === selectedDealer.id);
      if (updatedDealer) {
        handleOpenDealerDetail(updatedDealer);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Add Dealer Payment
  const handleAddDealerPayment = async (payment: PaymentRecord) => {
    if (!selectedDealer) return;
    try {
      await ApiClient.addDealerPayment(selectedDealer.id, payment, currentUser?.name || 'admin');
      await loadData();
      const updatedDealer = (await ApiClient.getDealers()).find(d => d.id === selectedDealer.id);
      if (updatedDealer) {
        handleOpenDealerDetail(updatedDealer);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Excel Product Import
  const handleImportExcel = async (file: File) => {
    await ApiClient.importProductsExcel(file);
    await loadData();
  };

  // Excel Export Products
  const handleExportExcel = () => {
    window.open('/api/products/export', '_blank');
  };

  const currentDealerObj = dealers.find(d => 
    (currentUser?.dealerId && d.id === currentUser.dealerId) ||
    (currentUser?.username && d.username === currentUser.username) ||
    (currentUser?.username && d.code.toLowerCase() === currentUser.username.toLowerCase())
  ) || dealers[0] || null;

  // Show login screen if no current user session
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col antialiased">
        <Navbar
          currentUser={null}
          onLogout={handleLogout}
          onToggleSidebar={() => {}}
        />
        <LoginModal dealers={dealers} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpenMobile(!sidebarOpenMobile)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'dealer_ledger' && currentDealerObj) {
              handleOpenDealerDetail(currentDealerObj);
            }
          }}
          isOpen={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Sistem verileri ve görseller yükleniyor...</p>
            </div>
          ) : globalError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold">Bağlantı Hatası</h3>
                <p className="mt-1 text-xs">{globalError}</p>
                <button
                  onClick={loadData}
                  className="mt-3 px-3.5 py-1.5 bg-red-600 text-white font-semibold rounded-lg text-xs"
                >
                  Yeniden Dene
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ADMIN VIEWS */}
              {currentUser.role === 'admin' && (
                <>
                  {activeTab === 'dashboard' && (
                    <DashboardAdmin
                      products={products}
                      dealers={dealers}
                      purchases={dealerPurchases.length > 0 ? dealerPurchases : []}
                      payments={dealerPayments.length > 0 ? dealerPayments : []}
                      onNavigate={(tab) => setActiveTab(tab)}
                    />
                  )}

                  {activeTab === 'products' && (
                    <ProductManagement
                      products={products}
                      categories={categories}
                      brands={brands}
                      onAddProduct={() => {
                        setEditingProduct(null);
                        setProductFormModalOpen(true);
                      }}
                      onEditProduct={(p) => {
                        setEditingProduct(p);
                        setProductFormModalOpen(true);
                      }}
                      onDeleteProduct={handleDeleteProduct}
                      onImportExcel={handleImportExcel}
                      onExportExcel={handleExportExcel}
                      onManageCategories={() => setCategoryManagerModalOpen(true)}
                      onManageBrands={() => setBrandManagerModalOpen(true)}
                    />
                  )}

                  {activeTab === 'dealers' && (
                    <DealerManagement
                      dealers={dealers}
                      onSelectDealer={handleOpenDealerDetail}
                      onAddDealer={() => {
                        setEditingDealer(null);
                        setDealerFormModalOpen(true);
                      }}
                      onEditDealer={(d) => {
                        setEditingDealer(d);
                        setDealerFormModalOpen(true);
                      }}
                      onDeleteDealer={handleDeleteDealer}
                    />
                  )}

                  {activeTab === 'dealer_detail' && selectedDealer && (
                    <DealerProfileDetail
                      dealer={selectedDealer}
                      products={products}
                      purchases={dealerPurchases}
                      payments={dealerPayments}
                      transactions={dealerTransactions}
                      onBack={() => setActiveTab('dealers')}
                      onAddPurchase={handleAddDealerPurchase}
                      onAddPayment={handleAddDealerPayment}
                      onUpdateDealer={handleSaveDealer}
                    />
                  )}
                </>
              )}

              {/* DEALER VIEWS */}
              {currentUser.role === 'dealer' && (
                <>
                  {(activeTab === 'catalog' || activeTab === 'dashboard') && (
                    <DashboardDealer
                      products={products}
                      currentDealer={currentDealerObj}
                      categories={categories}
                      brands={brands}
                      onOpenProductDetail={(p) => {
                        setViewingProduct(p);
                        setProductDetailModalOpen(true);
                      }}
                    />
                  )}

                  {(activeTab === 'dealer_ledger' || activeTab === 'dealer_purchases') && currentDealerObj && (
                    <DealerProfileDetail
                      dealer={currentDealerObj}
                      products={products}
                      purchases={dealerPurchases}
                      payments={dealerPayments}
                      transactions={dealerTransactions}
                      onBack={() => setActiveTab('catalog')}
                      onAddPurchase={() => {}} // Disabled for dealer user
                      onAddPayment={() => {}}  // Disabled for dealer user
                      onUpdateDealer={() => {}} // Disabled for dealer user
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {productFormModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onSave={handleSaveProduct}
          onClose={() => setProductFormModalOpen(false)}
        />
      )}

      {dealerFormModalOpen && (
        <DealerFormModal
          dealer={editingDealer}
          onSave={handleSaveDealer}
          onClose={() => setDealerFormModalOpen(false)}
        />
      )}

      {productDetailModalOpen && viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          currentDealer={currentDealerObj}
          onClose={() => setProductDetailModalOpen(false)}
        />
      )}

      {categoryManagerModalOpen && (
        <CategoryManagerModal
          categories={categories}
          onSave={handleSaveCategories}
          onClose={() => setCategoryManagerModalOpen(false)}
        />
      )}

      {brandManagerModalOpen && (
        <BrandManagerModal
          brands={brands}
          onSave={handleSaveBrands}
          onClose={() => setBrandManagerModalOpen(false)}
        />
      )}
    </div>
  );
}
