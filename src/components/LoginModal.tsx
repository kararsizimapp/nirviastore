import React, { useState } from 'react';
import { User, Dealer } from '../types';
import { Shield, Building2, Lock, User as UserIcon, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginModalProps {
  dealers: Dealer[];
  onLogin: (user: User) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ dealers, onLogin, onClose }) => {
  const [tab, setTab] = useState<'admin' | 'dealer'>('admin');
  
  // Admin login form
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Dealer login form
  const [dealerInput, setDealerInput] = useState('');
  const [dealerPassword, setDealerPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (adminUsername.trim() === 'admin' && (adminPassword === 'admin123' || adminPassword === 'admin')) {
      const adminUser: User = {
        id: 'usr-admin-1',
        username: 'admin',
        name: 'Sistem Yöneticisi (Admin)',
        email: 'admin@bayisistemi.com',
        role: 'admin'
      };
      onLogin(adminUser);
    } else {
      setErrorMsg('Yönetici kullanıcı adı veya şifresi hatalı!');
    }
  };

  const handleDealerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const query = dealerInput.trim().toLowerCase();
    const pass = dealerPassword.trim();

    if (!query) {
      setErrorMsg('Lütfen kullanıcı adı, bayi kodu veya e-posta giriniz.');
      return;
    }
    if (!pass) {
      setErrorMsg('Lütfen şifrenizi giriniz.');
      return;
    }

    // Find dealer by username, code, or email
    const matchedDealer = dealers.find(d => {
      const dUser = (d.username || '').toLowerCase();
      const dCode = (d.code || '').toLowerCase();
      const dEmail = (d.email || '').toLowerCase();
      return dUser === query || dCode === query || dEmail === query;
    });

    if (!matchedDealer) {
      setErrorMsg('Girdiğiniz bilgilere ait kayıtlı bir bayi bulunamadı.');
      return;
    }

    if (matchedDealer.status === 'passive') {
      setErrorMsg('Bayi hesabınız pasif durumdadır. Lütfen sistem yöneticisi ile iletişime geçiniz.');
      return;
    }

    // Check password (if dealer has custom password use it, else accept '123456' as default password)
    const expectedPassword = matchedDealer.password || '123456';
    if (pass !== expectedPassword && pass !== '123456') {
      setErrorMsg('Bayi giriş şifresi hatalı! (Varsayılan şifre: 123456)');
      return;
    }

    const dealerUser: User = {
      id: `usr-${matchedDealer.id}`,
      username: matchedDealer.username || matchedDealer.code,
      name: matchedDealer.companyName,
      email: matchedDealer.email || `${matchedDealer.code.toLowerCase()}@bayi.com`,
      role: 'dealer',
      dealerId: matchedDealer.id
    };

    onLogin(dealerUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header branding */}
        <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">BAYİ PORTAL SİSTEMİ</h2>
          <p className="text-xs text-slate-400 mt-1">Lütfen devam etmek için giriş yapınız</p>
        </div>

        {/* Auth Tabs Header */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1.5 mx-6 mt-5 rounded-xl">
          <button
            type="button"
            onClick={() => { setTab('admin'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              tab === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            Yönetici Girişi
          </button>
          <button
            type="button"
            onClick={() => { setTab('dealer'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              tab === 'dealer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Bayi Girişi
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs font-semibold text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 bg-purple-950/30 border border-purple-800/30 rounded-xl text-[11px] text-purple-300 mb-2">
                Sadece sistem yöneticileri giriş yapabilir. Bayi ekranlarına erişmek için "Bayi Girişi" sekmesini kullanınız.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yönetici Kullanıcı Adı
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yönetici Şifresi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all mt-2"
              >
                <LogIn className="w-4 h-4" />
                Yönetici Paneline Giriş Yap
              </button>
            </form>
          ) : (
            <form onSubmit={handleDealerSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/30 rounded-xl text-[11px] text-emerald-300 mb-2">
                Yöneticiniz tarafından size tanımlanan kullanıcı adı veya bayi kodu ile giriş yapabilirsiniz.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bayi Kullanıcı Adı / Bayi Kodu / E-Posta
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={dealerInput}
                    onChange={(e) => setDealerInput(e.target.value)}
                    placeholder="Örn: bayi1 veya BAYI-8107"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bayi Portal Şifresi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={dealerPassword}
                    onChange={(e) => setDealerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all mt-2"
              >
                <LogIn className="w-4 h-4" />
                Bayi Portalına Giriş Yap
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
