import React from 'react';
import { Bike, MapPin, Building2, FileSpreadsheet, ShieldCheck, Search } from 'lucide-react';

interface HeaderProps {
  currentTab: 'bikes' | 'leasing' | 'dealers' | 'admin';
  setCurrentTab: (tab: 'bikes' | 'leasing' | 'dealers' | 'admin') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedCity,
  setSelectedCity
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('bikes')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900">VeloFind</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">DEUTSCHLAND</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Echter Händlerbestand & Dienstrad-Leasing</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-bikes-btn"
              onClick={() => setCurrentTab('bikes')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'bikes'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Räder & E-Bikes</span>
            </button>

            <button
              id="nav-leasing-btn"
              onClick={() => setCurrentTab('leasing')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'leasing'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Dienstrad-Leasing</span>
            </button>

            <button
              id="nav-dealers-btn"
              onClick={() => setCurrentTab('dealers')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'dealers'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden md:inline">Partner-Händler</span>
              <span className="md:hidden">Händler</span>
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Händler-Portal</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
