import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, Package, Users, FileText, ShoppingBag, 
  CreditCard, Shield, ChevronRight, X, Layers
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile
}) => {
  const adminNavItems = [
    { id: 'dashboard', label: 'Yönetim Paneli', icon: LayoutDashboard },
    { id: 'products', label: 'Ürün Yönetimi', icon: Package },
    { id: 'dealers', label: 'Bayiler & Cari Takip', icon: Users },
  ];

  const dealerNavItems = [
    { id: 'catalog', label: 'Ürün Kataloğu', icon: ShoppingBag },
    { id: 'dealer_purchases', label: 'Satın Alma Kayıtlarım', icon: Layers },
    { id: 'dealer_ledger', label: 'Cari Hesap Detayım', icon: CreditCard },
  ];

  const navItems = currentRole === 'admin' ? adminNavItems : dealerNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ana Menü</span>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Indicator Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${currentRole === 'admin' ? 'text-purple-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {currentRole === 'admin' ? 'Yönetici Modu' : 'Bayi Kullanıcısı'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {currentRole === 'admin' 
              ? 'Tüm ürün, bayi ve finansal işlem yetkileri' 
              : 'Ürün arama, stok takibi ve bayi fiyatları'}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
          <p className="font-medium text-slate-400">Bayi & Cari Takip v2.0</p>
          <p className="mt-0.5">Türk Lirası (₺) Format Destekli</p>
        </div>
      </aside>
    </>
  );
};
