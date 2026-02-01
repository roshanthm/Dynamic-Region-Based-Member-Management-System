
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Activity,
  UserCircle
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activePage, setActivePage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERVISOR] },
    { id: 'regions', label: 'Regions', icon: MapPin, roles: [UserRole.ADMIN] },
    { id: 'members', label: 'Members', icon: Users, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERVISOR] },
    { id: 'analytics', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
    { id: 'users', label: 'System Users', icon: ShieldCheck, roles: [UserRole.ADMIN] },
    { id: 'logs', label: 'Audit Logs', icon: Activity, roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900">
      {/* Sidebar */}
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
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <h2 className="font-bold text-slate-800 text-lg capitalize">{activePage.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live DB Session
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
    </div>
  );
};

export default Layout;
