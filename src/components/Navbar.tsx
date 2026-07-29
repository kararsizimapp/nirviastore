import React from 'react';
import { User } from '../types';
import { 
  Menu, Shield, LogOut, Building2
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onToggleSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          {currentUser?.role === 'admin' && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none lg:hidden"
              title="Menüyü Aç/Kapat"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none text-white">
                BAYİ PORTAL
              </h1>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                {currentUser?.role === 'admin' ? 'Yönetim Paneli' : 'B2B Sipariş Platformu'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Active Role Badge & Logout */}
        {currentUser && (
          <div className="flex items-center gap-3">
            {/* Active User Role Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200">
              {currentUser.role === 'admin' ? (
                <>
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline text-slate-300">Rol:</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                    YÖNETİCİ (ADMIN)
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-slate-300">Bayi:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold max-w-[150px] truncate">
                    {currentUser.name}
                  </span>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              title="Oturumu Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
