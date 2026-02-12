
import React, { useState } from 'react';
import { 
  LayoutDashboard, MapPin, Users, BarChart3, ShieldCheck, LogOut, Menu, X, Bell, Activity, UserCircle, Globe, Cloud, CloudOff, RefreshCw, Key, Info, Share2, Copy, Check
} from 'lucide-react';
import { User, UserRole } from '../types';
import { dbEngine } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  onSync: () => void;
  showSyncModal: boolean;
  setShowSyncModal: (show: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activePage, setActivePage, onSync, showSyncModal, setShowSyncModal }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syncKeyInput, setSyncKeyInput] = useState(dbEngine.getSyncKey() || '');
  const [syncing, setSyncing] = useState(false);
  const [manualSyncing, setManualSyncing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERVISOR] },
    { id: 'regions', label: 'Regions', icon: MapPin, roles: [UserRole.ADMIN] },
    { id: 'members', label: 'Members', icon: Users, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERVISOR] },
    { id: 'analytics', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
    { id: 'users', label: 'System Users', icon: ShieldCheck, roles: [UserRole.ADMIN] },
    { id: 'logs', label: 'Audit Logs', icon: Activity, roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const handleSyncSetup = async () => {
    if (!syncKeyInput.trim()) {
      alert("Please enter a Sync Key (e.g. MySecretKey123)");
      return;
    }
    setSyncing(true);
    dbEngine.setSyncKey(syncKeyInput);
    const success = await dbEngine.pullFromCloud();
    if (success) {
      onSync();
    }
    setSyncing(false);
    setShowSyncModal(false);
  };

  const handleManualSync = async () => {
    if (!dbEngine.getSyncKey()) {
      setShowSyncModal(true);
      return;
    }
    setManualSyncing(true);
    const success = await dbEngine.pullFromCloud();
    if (success) {
      onSync();
    }
    // Artificial delay for visual feedback
    setTimeout(() => setManualSyncing(false), 800);
  };

  const handleCopyLink = () => {
    const key = dbEngine.getSyncKey();
    if (!key) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?db=${encodeURIComponent(key)}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-68 bg-white border-r shadow-sm flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">DRM Portal</span>
          <button className="lg:hidden ml-auto text-slate-400" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activePage === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.username}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <h2 className="font-bold text-slate-800 text-lg capitalize">{activePage.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Sync Status Button */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 shadow-inner">
              <button 
                onClick={() => setShowSyncModal(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${dbEngine.getSyncKey() ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {dbEngine.getSyncKey() ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
                {dbEngine.getSyncKey() ? 'Cloud Active' : 'Offline'}
              </button>
              {dbEngine.getSyncKey() && (
                <button 
                  onClick={handleManualSync}
                  className={`p-1.5 text-indigo-400 hover:text-indigo-600 transition-colors ${manualSyncing ? 'animate-spin' : ''}`}
                  title="Force Sync Now"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Node Live
            </div>
            
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>
        </div>
      </main>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-10 bg-indigo-600 text-white">
              <div className="flex justify-between items-center mb-6">
                <Globe className="w-12 h-12" />
                <button onClick={() => setShowSyncModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">Sync Settings</h3>
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Cross-browser data sharing</p>
            </div>
            <div className="p-10 space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                  Enter a secret key to share data. Use the same key on any other browser to see your members instantly.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Key className="w-3 h-3 text-indigo-500" /> Institutional Sync Key
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. KottayamRegistry2025" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                  value={syncKeyInput}
                  onChange={e => setSyncKeyInput(e.target.value)}
                />
              </div>

              {dbEngine.getSyncKey() && (
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    <Share2 className="w-3.5 h-3.5" /> Direct Access Link
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white px-4 py-2 rounded-xl text-[10px] font-bold text-slate-400 truncate border border-slate-100">
                      {window.location.origin}/?db={dbEngine.getSyncKey()}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className="p-3 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl transition-all shadow-sm border border-indigo-100"
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold text-center">Copy this link to another device to open this database instantly.</p>
                </div>
              )}

              <button 
                onClick={handleSyncSetup}
                disabled={syncing}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95"
              >
                {syncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Connect & Update
              </button>
              {dbEngine.getSyncKey() && (
                <button 
                  onClick={() => { setSyncKeyInput(''); dbEngine.setSyncKey(null); setShowSyncModal(false); onSync(); }}
                  className="w-full py-4 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors"
                >
                  Turn off Cloud Sync
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
