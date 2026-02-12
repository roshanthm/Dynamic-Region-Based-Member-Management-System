
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, MapPin, TrendingUp, UserCheck, Filter, Activity, Cloud, CloudOff, ArrowRight } from 'lucide-react';
import { KERALA_DISTRICTS } from '../constants';
import { dbEngine } from '../services/db';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

const Dashboard = ({ stats, regionData, onDistrictFilter, currentFilter, onOpenSync }: any) => {
  const hasSync = !!dbEngine.getSyncKey();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sync Warning / Success Bar */}
      {!hasSync ? (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <CloudOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Cloud Sync Inactive</h3>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Data is currently stored only on this browser.</p>
            </div>
          </div>
          <button 
            onClick={onOpenSync}
            className="px-6 py-3 bg-white border border-amber-200 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 transition-all"
          >
            Setup Shared Sync <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 p-4 px-6 rounded-full flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3">
             <Cloud className="w-4 h-4 text-emerald-500" />
             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Shared Database Active: <span className="text-slate-900 ml-1">{dbEngine.getSyncKey()}</span></span>
           </div>
           <div className="hidden md:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Global Persistent Node</span>
           </div>
        </div>
      )}

      {/* Global Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Registry Filter</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentFilter || 'All-Kerala Statistics'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:w-64 px-6 py-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-xs font-black appearance-none cursor-pointer uppercase tracking-widest"
            value={currentFilter || ''}
            onChange={(e) => onDistrictFilter(e.target.value)}
          >
            <option value="">Kerala State (Global)</option>
            {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {currentFilter && (
            <button 
              onClick={() => onDistrictFilter('')}
              className="px-6 py-4 bg-red-50 text-red-500 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Registry Size" value={stats.totalMembers} icon={Users} color="indigo" />
        <MetricCard label="Node Clusters" value={stats.panchayatCount} icon={MapPin} color="blue" />
        <MetricCard label="Median Age" value={stats.avgAge.toFixed(1)} icon={UserCheck} color="emerald" />
        <MetricCard label="DBMS Sync" value="ACTIVE" icon={Activity} color="amber" sub="Real-time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Regional Density</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Coverage Analytics</p>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                {/* Fix: Changed fontWeights to fontWeight to match expected SVG/Recharts property */}
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} fontWeight="900" tick={{fill: '#94a3b8'}} textAnchor="end" height={60} interval={0} angle={-45} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="900" tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Cluster Split</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Top Node Performance</p>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Fix: Moved cornerRadius prop from Cell to Pie as it is not valid for Cell component */}
                <Pie data={regionData.slice(0, 5)} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value" cornerRadius={8}>
                  {regionData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 space-y-4">
             {regionData.slice(0, 4).map((r: any, i: number) => (
               <div key={r.name} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-4 h-4 rounded-lg shadow-sm" style={{backgroundColor: COLORS[i]}}></div>
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{r.name}</span>
                 </div>
                 <span className="text-xs font-black text-indigo-600 group-hover:scale-110 transition-transform">{r.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, sub }: any) => {
  const colorMap: any = {
    indigo: 'from-indigo-600 to-indigo-700 shadow-indigo-200',
    blue: 'from-blue-600 to-blue-700 shadow-blue-200',
    emerald: 'from-emerald-600 to-emerald-700 shadow-emerald-200',
    amber: 'from-amber-600 to-amber-700 shadow-amber-200',
  };

  return (
    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col hover:-translate-y-2 transition-all duration-500 cursor-default group">
      <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${colorMap[color]} text-white flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{label}</p>
      <div className="flex items-end gap-3">
        <h4 className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{value}</h4>
        {sub && <span className="text-[10px] font-black text-emerald-500 mb-1 uppercase tracking-widest">{sub}</span>}
      </div>
    </div>
  );
};

export default Dashboard;
