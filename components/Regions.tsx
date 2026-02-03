
import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, MapPin, Building2, Warehouse, Home, Settings2, Trash2 } from 'lucide-react';
import { Region, RegionLevel } from '../types';

interface RegionsProps {
  regions: Region[];
  onAddRegion: (region: Omit<Region, 'region_id'>) => void;
}

const Regions: React.FC<RegionsProps> = ({ regions, onAddRegion }) => {
  const [view, setView] = useState<'tree' | 'table'>('tree');
  const [showModal, setShowModal] = useState(false);
  // Fix: Aligning property name with Region interface (region_level) and using valid RegionLevel values
  const [newRegion, setNewRegion] = useState<Omit<Region, 'region_id'>>({
    region_name: '',
    region_level: 'STATE',
    parent_region_id: null
  });

  // Fix: Argument type updated to RegionLevel and cases updated to match expected type values
  const getIcon = (level: RegionLevel) => {
    switch (level) {
      case 'STATE': return Building2;
      case 'DISTRICT': return Warehouse;
      case 'WARD': return Home;
      default: return MapPin;
    }
  };

  const renderTree = (parentId: string | null = null, level: number = 0) => {
    const children = regions.filter(r => r.parent_region_id === parentId);
    if (children.length === 0) return null;

    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-8 mt-2 border-l-2 border-slate-100 dark:border-slate-800 pl-4' : ''}`}>
        {children.map(region => {
          // Fix: Accessing region_level correctly
          const Icon = getIcon(region.region_level);
          return (
            <div key={region.region_id} className="animate-fadeIn">
              <div className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{region.region_name}</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{region.region_level}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-1 hover:text-blue-500"><Settings2 className="w-4 h-4" /></button>
                   <button className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {renderTree(region.region_id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Region Management</h2>
          <p className="text-slate-500">Configure administrative hierarchies.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-900 border dark:border-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('tree')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'tree' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              Tree View
            </button>
            <button 
              onClick={() => setView('table')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'table' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              Table View
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Region
          </button>
        </div>
      </div>

      {view === 'tree' ? (
        <div className="max-w-4xl">
          {renderTree(null)}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Region Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Parent</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {regions.map((r) => (
                <tr key={r.region_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm">{r.region_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {r.region_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {regions.find(parent => parent.region_id === r.parent_region_id)?.region_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 p-2"><Settings2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg">Add New Region</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Region Name</label>
                <input 
                  type="text" 
                  value={newRegion.region_name}
                  onChange={e => setNewRegion({...newRegion, region_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. California"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Region Type</label>
                  <select 
                    value={newRegion.region_level}
                    onChange={e => setNewRegion({...newRegion, region_level: e.target.value as RegionLevel})}
                    className="w-full px-4 py-2 rounded-xl border dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="STATE">State</option>
                    <option value="DISTRICT">District</option>
                    <option value="BLOCK">Block</option>
                    <option value="GRAMA">Grama</option>
                    <option value="WARD">Ward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Region</label>
                  <select 
                    value={newRegion.parent_region_id || ''}
                    onChange={e => setNewRegion({...newRegion, parent_region_id: e.target.value || null})}
                    className="w-full px-4 py-2 rounded-xl border dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">None (Top Level)</option>
                    {regions.map(r => (
                      <option key={r.region_id} value={r.region_id}>{r.region_name} ({r.region_level})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onAddRegion(newRegion); setShowModal(false); }}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              >
                Save Region
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regions;
