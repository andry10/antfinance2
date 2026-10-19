import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  LogOut, 
  Save, 
  RefreshCw, 
  Database, 
  KeyRound, 
  Sparkles,
  CheckCircle2,
  Store,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const SettingsView: React.FC = () => {
  const { userProfile, loginWithGoogle, loginDemo, logout, switchRole } = useAuth();
  const { settings, updateSettings, seedInitialData, isSyncing } = useData();

  // Store form state
  const [storeForm, setStoreForm] = useState({
    businessName: settings.businessName || '',
    tagline: settings.tagline || '',
    address: settings.address || '',
    phone: settings.phone || '',
    receiptFooter: settings.receiptFooter || '',
  });

  const [isSavedMessage, setIsSavedMessage] = useState(false);

  // Demo Login form state
  const [demoUsername, setDemoUsername] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoLoginError, setDemoLoginError] = useState<string | null>(null);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(storeForm);
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 3000);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoLoginError(null);
    setIsDemoSubmitting(true);
    try {
      const res = await loginDemo(demoUsername, demoPassword);
      if (!res.success) {
        setDemoLoginError(res.message || 'Login gagal');
      } else {
        setDemoUsername('');
        setDemoPassword('');
      }
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  const handleQuickLogin = async (user: string, pw: string) => {
    setDemoUsername(user);
    setDemoPassword(pw);
    setDemoLoginError(null);
    setIsDemoSubmitting(true);
    try {
      await loginDemo(user, pw);
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Pengaturan Toko & Manajemen Akun</h1>
        <p className="text-xs text-slate-500">
          Kelola profil usaha, struk kasir, serta otentikasi Google dan akun demo (Admin / Kasir).
        </p>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LEFT: User Profile & Authentication */}
        <div className="space-y-5">
          {/* Active Account Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              Akun Aktif Saat Ini
            </h3>

            {userProfile ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {userProfile.displayName}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{userProfile.email || 'Akun Lokal'}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          userProfile.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        Role: {userProfile.role}
                      </span>
                      {userProfile.isDemo && (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          Mode Demo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Ubah Hak Akses:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => switchRole('admin')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        userProfile.role === 'admin'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => switchRole('kasir')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        userProfile.role === 'kasir'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      Kasir
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Akun (Logout)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 text-xs text-slate-500">
                Belum ada pengguna yang masuk.
              </div>
            )}

            {/* Google Sign-in */}
            <div className="pt-2">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-xs transition active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Akun Google</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-600" />
                Akun Cepat (Sesuai Permintaan)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Login instan menggunakan akun default admin & kasir yang diminta.
              </p>
            </div>

            {/* Quick 1-click buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin')}
                className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition"
              >
                <div className="font-bold text-purple-900">👑 Akun Admin</div>
                <div className="text-[10px] text-purple-700 mt-0.5 font-mono">user: admin | pw: admin</div>
                <div className="text-[10px] text-purple-500 mt-1">Klik untuk langsung masuk</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kasir', 'kasir')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition"
              >
                <div className="font-bold text-emerald-900">🛒 Akun Kasir</div>
                <div className="text-[10px] text-emerald-700 mt-0.5 font-mono">user: kasir | pw: kasir</div>
                <div className="text-[10px] text-emerald-500 mt-1">Klik untuk langsung masuk</div>
              </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleDemoSubmit} className="space-y-2.5 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="admin / kasir"
                    value={demoUsername}
                    onChange={(e) => setDemoUsername(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="admin / kasir"
                    value={demoPassword}
                    onChange={(e) => setDemoPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {demoLoginError && (
                <p className="text-rose-600 text-[11px]">{demoLoginError}</p>
              )}

              <button
                type="submit"
                disabled={isDemoSubmitting}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs transition"
              >
                {isDemoSubmitting ? 'Memverifikasi...' : 'Masuk dengan Kredensial'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Business Profile & Data Management */}
        <div className="space-y-5">
          {/* Store Profile Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-600" />
              Informasi Usaha & Struk Kasir
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Usaha / Toko</label>
                <input
                  type="text"
                  required
                  value={storeForm.businessName}
                  onChange={(e) => setStoreForm({ ...storeForm, businessName: e.target.value })}
                  placeholder="Contoh: Toko Berkah Mandiri"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Slogan / Tagline Usaha</label>
                <input
                  type="text"
                  value={storeForm.tagline}
                  onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                  placeholder="Solusi Usaha & Belanja Terpercaya"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 45, Jakarta Pusat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">No. WhatsApp / Telepon</label>
                <input
                  type="text"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  placeholder="0812-3456-7890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Pesan di Bawah Struk (Footer)</label>
                <input
                  type="text"
                  value={storeForm.receiptFooter}
                  onChange={(e) => setStoreForm({ ...storeForm, receiptFooter: e.target.value })}
                  placeholder="Terima kasih telah berbelanja! Barang tidak dapat ditukar."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {isSavedMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 border border-emerald-200 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pengaturan usaha berhasil disimpan ke Firestore!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-sm transition active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Informasi Usaha</span>
              </button>
            </form>
          </div>

          {/* Database & Demo Helper */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              Kelola Database Firestore
            </h3>
            <p className="text-xs text-slate-500">
              Sinkronisasi data langsung terhubung ke Google Firebase Firestore dengan listener realtime.
            </p>

            <button
              onClick={() => {
                seedInitialData();
              }}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Memuat Data...' : 'Muat Ulang Data Sampel Produk & Pengeluaran'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
