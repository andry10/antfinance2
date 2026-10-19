/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardTodayView } from './components/DashboardTodayView';
import { PosView } from './components/PosView';
import { PsRentalView } from './components/PsRentalView';
import { ProductsView } from './components/ProductsView';
import { TransactionsView } from './components/TransactionsView';
import { DashboardReportsView } from './components/DashboardReportsView';
import { SettingsView } from './components/SettingsView';

function MainApp() {
  // Default to the requested 'dashboard' view
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {activeTab === 'dashboard' && <DashboardTodayView onNavigateTab={setActiveTab} />}
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'rental_ps' && <PsRentalView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'reports' && <DashboardReportsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Modern E-commerce Bottom Menu */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
