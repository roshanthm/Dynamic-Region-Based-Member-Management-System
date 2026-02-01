
import React, { useState, useEffect } from 'react';
import { dbEngine } from './services/db';
import { User, UserRole } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import { ShieldCheck, Mail, KeyRound, ArrowRight, Activity, MapPin, Database, Filter, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', role: UserRole.ADMIN });
  
  // DBMS State
  const [regions, setRegions] = useState(dbEngine.getRegions());
  const [members, setMembers] = useState(dbEngine.getMembersJoined());
  const [stats, setStats] = useState(dbEngine.getDashboardSummary());
  const [logs, setLogs] = useState(dbEngine.getLogs());

  const refreshState = () => {
    setRegions(dbEngine.getRegions());
    setMembers(dbEngine.getMembersJoined(user?.role, user?.assigned_region_id));
    setStats(dbEngine.getDashboardSummary());
    setLogs(dbEngine.getLogs());
  };

  useEffect(() => {
    if (user) refreshState();
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = dbEngine.getUsers().find(u => u.username.trim().toLowerCase() === loginForm.username.trim().toLowerCase() && u.role === loginForm.role);
    if (found) {
      setUser(found);
    } else {
      alert("Invalid test credentials. Ensure Username and Role match.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[40px] border border-white/10 shadow-2xl relative z-10 animate-fadeIn">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">DRM Secure Login</h1>
            <p className="text-slate-400 font-medium">Regional Management DBMS Engine</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="System Username"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium transition-all"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium transition-all appearance-none"
                  value={loginForm.role}
                  onChange={e => setLoginForm({...loginForm, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.ADMIN}>System Administrator</option>
                  <option value={UserRole.STAFF}>Regional Staff</option>
                  <option value={UserRole.SUPERVISOR}>Auditor/Supervisor</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 transform active:scale-95"
            >
              Access Database
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Demo Credentials</p>
            <div className="flex flex-col gap-1 text-xs font-medium text-slate-400">
              <p>Admin: <span className="text-indigo-400">admin</span> (Admin Role)</p>
              <p>Staff: <span className="text-indigo-400">staff_la</span> (Staff Role)</p>
              <p>Supervisor: <span className="text-indigo-400">supervisor_sf</span> (Supervisor Role)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'dashboard' && <Dashboard stats={stats} regionData={dbEngine.getRegionStats()} />}
      
      {activePage === 'members' && (
        <Members 
          members={members} 
          regions={regions} 
          currentUser={user}
          onAdd={(m: any) => { dbEngine.addMember(m, user.user_id); refreshState(); }}
          onUpdate={(id: string, m: any) => { dbEngine.updateMember(id, m, user.user_id); refreshState(); }}
          onDelete={(id: string) => { dbEngine.deleteMember(id, user.user_id); refreshState(); }}
        />
      )}

      {activePage === 'regions' && (
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <div>
                <h3 className="text-xl font-black text-slate-800">Regional Hierarchy</h3>
                <p className="text-sm text-slate-400 font-medium">Managing parent-child relationships in SQL</p>
               </div>
               <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Database className="w-5 h-5" /></button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.map(r => (
                  <div key={r.region_id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{r.region_name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{r.region_type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { if(!dbEngine.deleteRegion(r.region_id, user.user_id)) alert("Cannot delete: Region has members (Foreign Key Constraint)"); refreshState(); }} 
                      className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {activePage === 'logs' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-800">Audit Trail</h3>
            <p className="text-sm text-slate-400 font-medium">Relational Activity Log indexing all DML operations.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">Action</th>
                  <th className="px-8 py-4">Entity</th>
                  <th className="px-8 py-4">Details</th>
                  <th className="px-8 py-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-medium text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                        log.action_performed === 'INSERT' ? 'bg-emerald-100 text-emerald-600' :
                        log.action_performed === 'DELETE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {log.action_performed}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-700">{log.entity}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{log.details}</td>
                    <td className="px-8 py-4 text-xs font-bold text-indigo-600">{log.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activePage === 'analytics' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-800 mb-6">SQL Aggregations</h3>
               <div className="space-y-6">
                 {dbEngine.getRegionStats().map(stat => (
                   <div key={stat.name}>
                     <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-slate-400">
                       <span>{stat.name}</span>
                       <span className="text-indigo-600">{stat.value} Members</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{width: `${(stat.value / (stats.totalMembers || 1)) * 100}%`}}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="bg-indigo-600 p-8 rounded-[32px] text-white flex flex-col justify-center">
               <h3 className="text-2xl font-black mb-4 tracking-tight">Generate Report</h3>
               <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
                 The DBMS has compiled all regional member records. You can now export the full normalized dataset as an official administrative document.
               </p>
               <button className="bg-white text-indigo-600 font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3">
                 <Activity className="w-5 h-5" />
                 Compile PDF Report
               </button>
            </div>
         </div>
      )}

      {activePage === 'users' && (
         <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">System Access Roles</h3>
                <p className="text-sm text-slate-400 font-medium">RBAC User management table</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbEngine.getUsers().map(u => (
                <div key={u.user_id} className="p-6 rounded-[28px] border border-slate-100 bg-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-slate-100">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{u.username}</h4>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
         </div>
      )}
    </Layout>
  );
};

export default App;
