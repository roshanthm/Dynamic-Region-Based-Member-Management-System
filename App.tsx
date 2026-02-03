
import React, { useState, useEffect } from 'react';
import { dbEngine } from './services/db';
import { User, UserRole } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import { ShieldCheck, Mail, KeyRound, ArrowRight, Activity, MapPin, Plus, Database, X, FileBarChart, PieChart, Users, Download, Upload, RefreshCcw } from 'lucide-react';
import { KERALA_DISTRICTS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', role: UserRole.ADMIN });
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  
  // DBMS State
  const [regions, setRegions] = useState(dbEngine.getRegions());
  const [members, setMembers] = useState(dbEngine.getMembersJoined());
  const [stats, setStats] = useState(dbEngine.getDashboardStats());
  const [logs, setLogs] = useState(dbEngine.getLogs());

  const refreshState = () => {
    setRegions(dbEngine.getRegions());
    setMembers(dbEngine.getMembersJoined(user?.role, user?.assigned_district_id));
    setStats(dbEngine.getDashboardStats(districtFilter));
    setLogs(dbEngine.getLogs());
  };

  useEffect(() => {
    if (user) refreshState();
  }, [user, districtFilter]);

  // Initial Cloud Sync attempt on mount
  useEffect(() => {
    const initSync = async () => {
      if (dbEngine.getSyncKey()) {
        setIsCloudSyncing(true);
        await dbEngine.pullFromCloud();
        refreshState();
        setIsCloudSyncing(false);
      }
    };
    initSync();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = dbEngine.getUsers().find(u => u.username.trim().toLowerCase() === loginForm.username.trim().toLowerCase() && u.role === loginForm.role);
    if (found) {
      setUser(found);
      // Attempt to pull latest data for this user context
      if (dbEngine.getSyncKey()) {
        setIsCloudSyncing(true);
        await dbEngine.pullFromCloud();
        setIsCloudSyncing(false);
      }
      if (found.role === UserRole.STAFF && found.assigned_district_id) {
         const distRegion = dbEngine.getRegions().find(r => r.region_id === found.assigned_district_id);
         setDistrictFilter(distRegion?.region_name || '');
      }
    } else {
      alert("Invalid credentials. Please verify your Institutional ID and Role.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDistrictFilter('');
    setActivePage('dashboard');
  };

  const handleExport = () => {
    const data = dbEngine.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drm_registry_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const success = await dbEngine.importData(content);
        if (success) {
          alert("Database Imported Successfully.");
          refreshState();
        } else {
          alert("Import Failed: Invalid Data Format.");
        }
      };
      reader.readAsText(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-12 rounded-[56px] border border-white/10 shadow-2xl relative z-10 animate-fadeIn text-white">
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <ShieldCheck className="text-white w-12 h-12" />
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic leading-none">Institutional Portal</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Registry Node Access • 3NF DBMS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Official Username"
                  required
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none text-white font-bold transition-all"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              <div className="relative group">
                <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <select 
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none text-white font-bold transition-all appearance-none cursor-pointer"
                  value={loginForm.role}
                  onChange={e => setLoginForm({...loginForm, role: e.target.value as UserRole})}
                >
                  <option className="bg-slate-900" value={UserRole.ADMIN}>Administrator (Global)</option>
                  <option className="bg-slate-900" value={UserRole.STAFF}>Regional Staff</option>
                  <option className="bg-slate-900" value={UserRole.SUPERVISOR}>Supervisor</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-3 transform active:scale-95 text-xs uppercase tracking-widest disabled:bg-slate-700"
              disabled={isCloudSyncing}
            >
              {isCloudSyncing ? 'Syncing Archive...' : 'Verify Credentials'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Demo Nodes</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <span className="text-indigo-400">admin</span>
              <span className="text-slate-400">/ ROOT</span>
              <span className="text-indigo-400">staff_ktm</span>
              <span className="text-slate-400">/ REGIONAL</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activePage={activePage} setActivePage={setActivePage} onSync={refreshState}>
      {activePage === 'dashboard' && (
        <Dashboard 
          stats={stats} 
          regionData={dbEngine.getRegionStats()} 
          onDistrictFilter={setDistrictFilter}
          currentFilter={districtFilter}
        />
      )}
      
      {activePage === 'members' && (
        <Members 
          members={members} 
          regions={regions} 
          currentUser={user}
          onAdd={async (m: any) => { 
            await dbEngine.registerMember(m, user.user_id); 
            refreshState(); 
          }}
          onUpdate={async (id: string, m: any) => { 
            await dbEngine.updateMember(id, m, user.user_id); 
            refreshState(); 
          }}
          onDelete={async (id: string) => { 
            await dbEngine.deleteMember(id, user.user_id); 
            refreshState(); 
          }}
        />
      )}

      {activePage === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-12">
               <div>
                <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Institutional Reports</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Registry Metrics & Demographic Analytics</p>
               </div>
               <button onClick={handleExport} className="p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-3xl transition-all shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                 <Download className="w-4 h-4" /> Export Node Data
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Members</span>
                  </div>
                  <h4 className="text-3xl font-black text-slate-800">{members.length}</h4>
                </div>
                <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">District Coverage</span>
                  </div>
                  <h4 className="text-3xl font-black text-slate-800">{new Set(members.map(m => m.district)).size}</h4>
                </div>
                <div className="p-8 bg-emerald-50/50 rounded-[40px] border border-emerald-100/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Node Health</span>
                  </div>
                  <h4 className="text-3xl font-black text-slate-800">100% Active</h4>
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6 rounded-tl-3xl">Regional Node</th>
                      <th className="px-8 py-6">Member Count</th>
                      <th className="px-8 py-6">Unique Gramas</th>
                      <th className="px-8 py-6">Latest ID</th>
                      <th className="px-8 py-6 rounded-tr-3xl">Node Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {KERALA_DISTRICTS.map(dist => {
                      const distMembers = members.filter(m => m.district === dist);
                      if (distMembers.length === 0 && !districtFilter) return null;
                      if (districtFilter && dist !== districtFilter) return null;
                      
                      return (
                        <tr key={dist} className="hover:bg-slate-50/50 transition-all cursor-default group">
                          <td className="px-8 py-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                              {dist.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-black text-slate-800">{dist}</span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600">{distMembers.length}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600">{new Set(distMembers.map(m => m.grama_panchayat)).size}</td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                              {distMembers[0]?.member_id || 'STANDBY'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${distMembers.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              <span className="text-[10px] font-black uppercase text-slate-400">{distMembers.length > 0 ? 'Synchronized' : 'Offline'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {activePage === 'users' && (
         <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Data Management</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manual Portability Controls</p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={handleExport}
                      className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Download DB
                    </button>
                    <label className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-600 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm cursor-pointer">
                      <Upload className="w-4 h-4" /> 
                      Import DB
                      <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                 </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">System Personnel</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional RBAC Management</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {dbEngine.getUsers().map(u => (
                   <div key={u.user_id} className="p-8 rounded-[40px] border border-slate-100 bg-slate-50 flex items-center gap-6 group hover:border-indigo-400 transition-all cursor-default">
                     <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                       {u.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <h4 className="text-lg font-black text-slate-800">{u.username}</h4>
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{u.role}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
      )}

      {/* Other pages like 'regions', 'logs' remain same... */}
    </Layout>
  );
};

export default App;
