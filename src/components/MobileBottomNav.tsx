import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gamepad2, 
  ReceiptText, 
  BarChart3, 
  Package,
  UserCircle2
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      id: 'pos',
      label: 'Kasir',
      icon: ShoppingBag,
    },
    {
      id: 'products',
      label: 'Master',
      icon: Package,
    },
    {
      id: 'rental_ps',
      label: 'Rental PS',
      icon: Gamepad2,
    },
    {
      id: 'transactions',
      label: 'Transaksi',
      icon: ReceiptText,
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: BarChart3,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
      <div className="flex items-center justify-between h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer relative ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700 scale-105' : 'bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-teal-800' : 'font-normal'}`}>
                {item.label}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-0.5 animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
