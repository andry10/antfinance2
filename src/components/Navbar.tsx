import React from 'react';
import { 
  Store, 
  Gamepad2, 
  ShoppingBag, 
  Crown, 
  LayoutDashboard,
  Package,
  ReceiptText,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { userProfile } = useAuth();
  const { settings, isRealtimeConnected } = useData();

  const isAdmin = userProfile?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                {settings.businessName || 'CatatUsaha'}
              </span>
              {/* Realtime Live Status Indicator */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isRealtimeConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title="Status koneksi database Firebase Firestore"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Firestore Realtime</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
              {settings.tagline || 'Kasir, BBM & Rental PS'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {[
            { id: 'dashboard', label: 'Dashboard Hari Ini' },
            { id: 'pos', label: 'Kasir Transaksi' },
            { id: 'products', label: 'Data Master' },
            { id: 'rental_ps', label: 'Rental PS' },
            { id: 'transactions', label: 'Riwayat Nota' },
            { id: 'reports', label: 'Laporan PDF' },
            { id: 'settings', label: 'Pengaturan' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Role Badge & Profile Trigger */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Kasir button for tablet/mobile */}
          <button
            onClick={() => setActiveTab('pos')}
            className="hidden sm:flex lg:hidden items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Kasir</span>
          </button>

          {/* Role switcher chip */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isAdmin
                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isAdmin ? (
              <Crown className="w-3.5 h-3.5 text-purple-600" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="capitalize">{userProfile?.role || 'Pengguna'}</span>
          </button>

          {/* User Avatar */}
          <div
            onClick={() => setActiveTab('settings')}
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-2 hover:ring-teal-500 transition"
            title={userProfile?.displayName || 'Pengguna'}
          >
            {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
