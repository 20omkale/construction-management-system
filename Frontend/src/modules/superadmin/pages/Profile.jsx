import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { User, Mail, Phone, Shield, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">Manage your account settings and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#0f62fe]/10 flex items-center justify-center text-[#0f62fe] mb-4">
              <span className="text-3xl font-black">{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{user?.name || 'System Admin'}</h2>
            <p className="text-[11px] font-bold text-[#0f62fe] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mt-2">
              {user?.userType || 'SUPER_ADMIN'}
            </p>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Details</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Full Name</label>
                  <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{user?.name || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={14} /> Email Address</label>
                  <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{user?.email || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone size={14} /> Phone Number</label>
                  <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{user?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Shield size={14} /> System Role</label>
                  <p className="text-[15px] font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{user?.userType || 'Platform Owner'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Security Section Stub */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
             <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-500 rounded-lg"><KeyRound size={20} /></div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Change Password</h3>
                    <p className="text-[12px] font-semibold text-slate-500">Update your security credentials</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-[13px] rounded-xl hover:bg-slate-50 transition-colors">
                  Update
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;