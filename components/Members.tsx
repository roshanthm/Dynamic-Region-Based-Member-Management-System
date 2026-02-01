
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, MapPin, Phone, UserCircle2, Home, Hash, ChevronRight, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { JoinMemberRegion, Region, User, UserRole } from '../types';

interface MembersProps {
  members: JoinMemberRegion[];
  regions: Region[];
  currentUser: User;
  onAdd: (member: any) => void;
  onUpdate: (id: string, member: any) => void;
  onDelete: (id: string) => void;
}

const Members: React.FC<MembersProps> = ({ members, regions, currentUser, onAdd, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Region Select, 2: Member Details
  
  // Cascading state for region selection
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [formData, setFormData] = useState({ 
    full_name: '', 
    age: 25, 
    phone: '', 
    address: '', 
    house_number: '',
    region_id: '' 
  });

  // ROBUST SEARCH & FILTERING
  const filtered = members.filter((m: JoinMemberRegion) => {
    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return true;
    
    return (
      m.full_name.toLowerCase().includes(searchTerm) || 
      m.phone.includes(searchTerm) || 
      m.house_number.toLowerCase().includes(searchTerm) ||
      m.region_name.toLowerCase().includes(searchTerm)
    );
  });

  const getLevelOptions = (parentId: string | null) => {
    return regions.filter(r => r.parent_region_id === parentId);
  };

  useEffect(() => {
    if (currentUser.role === UserRole.STAFF && currentUser.assigned_region_id) {
      setSelectedPath([currentUser.assigned_region_id]);
      setFormData(prev => ({ ...prev, region_id: currentUser.assigned_region_id! }));
    }
  }, [currentUser, showModal]);

  const handleRegionSelect = (regionId: string, levelIndex: number) => {
    const newPath = selectedPath.slice(0, levelIndex + 1);
    newPath[levelIndex] = regionId;
    setSelectedPath(newPath);
    setFormData(prev => ({ ...prev, region_id: regionId }));
  };

  const resetModal = () => {
    setShowModal(false);
    setRegStep(1);
    setSelectedPath(currentUser.role === UserRole.STAFF ? [currentUser.assigned_region_id!] : []);
    setFormData({ full_name: '', age: 25, phone: '', address: '', house_number: '', region_id: currentUser.assigned_region_id || '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Member Directory</h2>
          <p className="text-sm text-slate-400 font-medium">
            {currentUser.role === UserRole.STAFF ? 'Managing assigned jurisdictional records' : 'Institutional membership registry.'}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Start Registration
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone or house #..." 
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-widest hidden lg:block">
          {filtered.length} Records Found
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching records</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria or register a new member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m: JoinMemberRegion) => (
            <div key={m.member_id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group animate-fadeIn">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all duration-500">
                  {m.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-800 leading-tight truncate">{m.full_name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{m.region_name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-2">
                     <Hash className="w-4 h-4 text-slate-400" />
                     <span className="text-xs font-bold text-slate-500">House No</span>
                   </div>
                   <span className="text-xs font-black text-slate-900">{m.house_number}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-2">
                     <Phone className="w-4 h-4 text-slate-400" />
                     <span className="text-xs font-bold text-slate-500">Contact</span>
                   </div>
                   <span className="text-xs font-black text-slate-900">{m.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">{m.region_type}</span>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(m.member_id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-10 bg-indigo-600 text-white shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black tracking-tight">Systematic Registration</h3>
                  <p className="text-indigo-100 font-medium mt-1">Step {regStep} of 2</p>
                </div>
                <button onClick={resetModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${regStep >= 1 ? 'bg-white' : 'bg-white/20'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full ${regStep >= 2 ? 'bg-white' : 'bg-white/20'}`}></div>
              </div>
            </div>
            
            <div className="p-10 overflow-auto flex-1">
              {regStep === 1 ? (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">Regional Placement</h4>
                      <p className="text-sm text-slate-400">Select the administrative hierarchy first.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Level 1: Root */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Region</label>
                        <select 
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none"
                          value={selectedPath[0] || ''}
                          disabled={currentUser.role === UserRole.STAFF}
                          onChange={(e) => handleRegionSelect(e.target.value, 0)}
                        >
                          <option value="">-- Select Root --</option>
                          {getLevelOptions(null).map(r => <option key={r.region_id} value={r.region_id}>{r.region_name} ({r.region_type})</option>)}
                        </select>
                      </div>

                      {/* Level 2: District/Sub */}
                      {(selectedPath[0] || currentUser.assigned_region_id) && (
                        <div className="animate-fadeIn">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sub-Division / Ward</label>
                          <select 
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                            value={selectedPath[1] || ''}
                            onChange={(e) => handleRegionSelect(e.target.value, 1)}
                          >
                            <option value="">-- Choose Level 2 --</option>
                            {getLevelOptions(selectedPath[0] || currentUser.assigned_region_id).map(r => <option key={r.region_id} value={r.region_id}>{r.region_name} ({r.region_type})</option>)}
                          </select>
                        </div>
                      )}

                      {/* Level 3: Panchayat/Village */}
                      {selectedPath[1] && (
                        <div className="animate-fadeIn">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Panchayat / Village / Office</label>
                          <select 
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                            value={selectedPath[2] || ''}
                            onChange={(e) => handleRegionSelect(e.target.value, 2)}
                          >
                            <option value="">-- Choose Level 3 --</option>
                            {getLevelOptions(selectedPath[1]).map(r => <option key={r.region_id} value={r.region_id}>{r.region_name} ({r.region_type})</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    {formData.region_id && (
                      <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <p className="text-xs font-bold text-emerald-700">Location Locked: {regions.find(r => r.region_id === formData.region_id)?.region_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <UserCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">Member Details</h4>
                      <p className="text-sm text-slate-400">Entering demographics for the selected location.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                      <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Official Name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Age</label>
                      <input type="number" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">House Number</label>
                      <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} placeholder="e.g. 101/A" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Street Address</label>
                      <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Nearby landmark or street" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Phone</label>
                      <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="10-digit mobile" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
              {regStep === 1 ? (
                <button 
                  onClick={() => { if(formData.region_id) setRegStep(2); else alert("Please select a location hierarchy."); }}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 active:scale-95"
                >
                  Continue to Details
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setRegStep(1)}
                    className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={() => { if(!formData.full_name) alert("Full name is required."); else { onAdd(formData); resetModal(); } }}
                    className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 active:scale-95"
                  >
                    Commit to Database
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
