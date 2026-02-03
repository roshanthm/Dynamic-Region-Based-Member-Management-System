
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, MapPin, Phone, UserCircle2, Hash, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Database, Globe, Lock, Edit3 } from 'lucide-react';
import { JoinMemberRegion, Region, User, UserRole } from '../types';
import { KERALA_DISTRICTS } from '../constants';

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
  const [regStep, setRegStep] = useState(1); 
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    full_name: '', age: 25, phone: '', address: '', house_number: '',
    district: '', block_panchayat: '', grama_panchayat: '', ward_number: 1
  });

  const filtered = useMemo(() => {
    let list = members;
    // Note: Staff visibility can be restricted or open based on role. 
    // To solve "new members not appearing", we ensure they see members matching their search or district filter.
    const term = search.toLowerCase().trim();
    if (!term) return list;
    return list.filter(m => 
      m.full_name.toLowerCase().includes(term) || 
      m.member_id.toLowerCase().includes(term) || 
      m.district.toLowerCase().includes(term)
    );
  }, [members, search]);

  const resetModal = () => {
    setShowModal(false);
    setRegStep(1);
    setIsEditing(false);
    setCurrentMemberId(null);
    
    let defaultDistrict = '';
    if (currentUser.role === UserRole.STAFF && currentUser.assigned_district_id) {
       defaultDistrict = regions.find(r => r.region_id === currentUser.assigned_district_id)?.region_name || '';
    }

    setFormData({ 
      full_name: '', age: 25, phone: '', address: '', house_number: '',
      district: defaultDistrict, block_panchayat: '', grama_panchayat: '', ward_number: 1
    });
  };

  const handleEdit = (m: JoinMemberRegion) => {
    setFormData({
      full_name: m.full_name,
      age: m.age,
      phone: m.phone,
      address: m.address,
      house_number: m.house_number,
      district: m.district,
      block_panchayat: m.block_panchayat,
      grama_panchayat: m.grama_panchayat,
      ward_number: m.ward_number
    });
    setIsEditing(true);
    setCurrentMemberId(m.member_id);
    setRegStep(1);
    setShowModal(true);
  };

  const handleCommit = () => {
    if (!formData.full_name || !formData.district || !formData.block_panchayat || !formData.grama_panchayat) {
      alert("Missing Data: Please ensure District, Block, and Grama fields are populated.");
      return;
    }
    if (isEditing && currentMemberId) {
      onUpdate(currentMemberId, formData);
    } else {
      onAdd(formData);
    }
    resetModal();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Member Directory</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            {currentUser.role === UserRole.ADMIN ? 'System Administrator' : 'Institutional Registry Access'}
          </p>
        </div>
        <button 
          onClick={() => { resetModal(); setShowModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-[24px] font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-3 transform hover:-translate-y-1"
        >
          <Plus className="w-6 h-6" /> Add New Member
        </button>
      </div>

      <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, Member ID or District..." 
            className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-indigo-50 rounded-3xl border border-indigo-100">
          <Globe className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{filtered.length} Indexed Records</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(m => (
          <div key={m.member_id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group animate-fadeIn overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
               <Database className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-indigo-600 font-black text-3xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                {m.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 leading-tight truncate">{m.full_name}</h3>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{m.member_id}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <MapPin className="w-4 h-4 text-indigo-400" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">District</span>
                 </div>
                 <span className="text-xs font-black text-slate-800">{m.district}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <Hash className="w-4 h-4 text-indigo-400" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward</span>
                 </div>
                 <span className="text-xs font-black text-slate-800">{m.ward_number}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <Phone className="w-4 h-4 text-indigo-400" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
                 </div>
                 <span className="text-xs font-black text-slate-800">{m.phone}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Administrative Unit</span>
                <span className="text-xs font-bold text-slate-500">{m.grama_panchayat}</span>
              </div>
              <div className="flex items-center gap-2">
                {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.STAFF) && (
                   <button onClick={() => handleEdit(m)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                     <Edit3 className="w-4 h-4" />
                   </button>
                )}
                {currentUser.role !== UserRole.SUPERVISOR && (
                  <button onClick={() => onDelete(m.member_id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-12 bg-indigo-600 text-white shrink-0 relative">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
                    {isEditing ? 'Sync Record' : 'Registry Entry'}
                  </h3>
                  <p className="text-indigo-100 font-black mt-3 text-[10px] uppercase tracking-[0.3em]">
                    Institutional Mapping • Step {regStep} / 2
                  </p>
                </div>
                <button onClick={resetModal} className="p-3 hover:bg-white/10 rounded-full transition-all active:scale-90">
                  <Plus className="w-10 h-10 rotate-45" />
                </button>
              </div>
              <div className="flex gap-4">
                <div className={`h-2 flex-1 rounded-full transition-all duration-700 ${regStep >= 1 ? 'bg-white shadow-[0_0_20px_white]' : 'bg-white/20'}`}></div>
                <div className={`h-2 flex-1 rounded-full transition-all duration-700 ${regStep >= 2 ? 'bg-white shadow-[0_0_20px_white]' : 'bg-white/20'}`}></div>
              </div>
            </div>
            
            <div className="p-12 overflow-auto flex-1 bg-white">
              {regStep === 1 ? (
                <div className="space-y-10 animate-fadeIn">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                      <MapPin className="w-9 h-9" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Geo Hierarchy</h4>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Establishing node location</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select District</label>
                      <div className="relative">
                        <select 
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black appearance-none cursor-pointer"
                          value={formData.district}
                          onChange={(e) => setFormData({...formData, district: e.target.value})}
                        >
                          <option value="">-- Kerala Official Districts --</option>
                          {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Block Panchayat (Manual Entry)</label>
                      <input 
                        type="text" 
                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black" 
                        placeholder="Block Node Name..." 
                        value={formData.block_panchayat}
                        onChange={(e) => setFormData({...formData, block_panchayat: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Grama Panchayat (Manual Entry)</label>
                        <input 
                          type="text" 
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black" 
                          placeholder="e.g. Kumarakom" 
                          value={formData.grama_panchayat}
                          onChange={(e) => setFormData({...formData, grama_panchayat: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ward (1-20)</label>
                        <select 
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black appearance-none"
                          value={formData.ward_number}
                          onChange={(e) => setFormData({...formData, ward_number: parseInt(e.target.value)})}
                        >
                          {Array.from({length: 20}, (_, i) => i + 1).map(n => <option key={n} value={n}>Ward {n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-fadeIn">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                      <UserCircle2 className="w-9 h-9" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Identity Details</h4>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Demographic node profiling</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Legal Name</label>
                      <input type="text" className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Official Identity" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Age</label>
                      <input type="number" className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">House Number</label>
                      <input type="text" className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} placeholder="e.g. VK-202" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Phone</label>
                      <input type="text" className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 text-sm font-black" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Mobile Number" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-12 bg-slate-50/80 border-t border-slate-100 flex gap-6 shrink-0">
              {regStep === 1 ? (
                <button 
                  onClick={() => { 
                    if(formData.district && formData.block_panchayat && formData.grama_panchayat) setRegStep(2); 
                    else alert("Required fields missing: District, Block, and Grama are mandatory."); 
                  }}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 active:scale-95 text-xs uppercase tracking-widest"
                >
                  Verify Hierarchy Node
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setRegStep(1)}
                    className="flex-1 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all uppercase text-xs tracking-widest"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handleCommit}
                    className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 active:scale-95 text-xs uppercase tracking-widest"
                  >
                    {isEditing ? 'Update Registry Entry' : 'Commit to Database'}
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
