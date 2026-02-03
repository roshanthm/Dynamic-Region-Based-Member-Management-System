
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, MapPin, Shield, TrendingUp, UserCheck, Filter, ArrowUpRight, Activity } from 'lucide-react';
import { KERALA_DISTRICTS } from '../constants';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

const Dashboard = ({ stats, regionData, onDistrictFilter, currentFilter }: any) => {
  return (
    <div className="space-y-8">
      {/* Global Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Analytics Pivot</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Targeting: {currentFilter || 'State of Kerala'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:w-64 px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none cursor-pointer"
            value={currentFilter || ''}
            onChange={(e) => onDistrictFilter(e.target.value)}
          >
            <option value="">All Districts (Kerala)</option>
            {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {currentFilter && (
            <button 
              onClick={() => onDistrictFilter('')}
              className="px-5 py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-xs uppercase hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Jurisdiction Population" value={stats.totalMembers} icon={Users} color="indigo" />
        <MetricCard label="Active Gramas" value={stats.panchayatCount} icon={MapPin} color="blue" />
        <MetricCard label="Avg Household Age" value={stats.avgAge.toFixed(1)} icon={UserCheck} color="emerald" />
        <MetricCard label="Data Velocity" value="+12%" icon={Activity} color="amber" sub="Real-time DBMS Sync" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* District Distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">Demographic Density</h3>
              <p className="text-sm text-slate-400 font-medium tracking-tight">Population concentration by District Node</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Breakdown */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-800">Cluster Split</h3>
            <p className="text-sm text-slate-400 font-medium">Top performing nodes</p>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={regionData.slice(0, 5)} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">
                  {regionData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {regionData.slice(0, 4).map((r: any, i: number) => (
               <div key={r.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                   <span className="text-xs font-black text-slate-700">{r.name}</span>
                 </div>
                 <span className="text-xs font-black text-indigo-600">{r.value}</span>
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
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col hover:-translate-y-2 transition-all duration-300 cursor-default group">
      <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${colorMap[color]} text-white flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <h4 className="text-3xl font-black text-slate-900 leading-none">{value}</h4>
        {sub && <span className="text-[10px] font-bold text-emerald-500 mb-1">{sub}</span>}
      </div>
    </div>
  );
};

export default Dashboard;
