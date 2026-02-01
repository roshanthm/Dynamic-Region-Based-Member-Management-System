
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Users, MapPin, Shield, TrendingUp, UserCheck, Calendar } from 'lucide-react';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const Dashboard = ({ stats, regionData }: any) => {
  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Members" value={stats.totalMembers} icon={Users} color="indigo" />
        <MetricCard label="Total Regions" value={stats.totalRegions} icon={MapPin} color="blue" />
        <MetricCard label="System Users" value={stats.totalUsers} icon={Shield} color="emerald" />
        <MetricCard label="Average Age" value={stats.avgAge.toFixed(1)} icon={UserCheck} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Population Distribution</h3>
              <p className="text-sm text-slate-400 font-medium">Members per region (Aggregate SQL)</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
           <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800">Regional Split</h3>
              <p className="text-sm text-slate-400 font-medium">Composition by type</p>
           </div>
           <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData.slice(0, 5)}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {regionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
           </div>
           <div className="mt-4 space-y-2">
             {regionData.slice(0, 3).map((r: any, i: number) => (
               <div key={r.name} className="flex items-center justify-between text-xs font-bold">
                 <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                   <span className="text-slate-600">{r.name}</span>
                 </div>
                 <span className="text-slate-400">{r.value} Members</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col hover:scale-[1.02] transition-transform duration-300">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} text-white flex items-center justify-center mb-4 shadow-xl`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
    </div>
  );
};

export default Dashboard;
