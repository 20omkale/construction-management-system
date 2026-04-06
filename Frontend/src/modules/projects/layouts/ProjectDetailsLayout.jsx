import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useParams, useLocation } from 'react-router-dom';
import { Eye, Clock, FileText, CheckSquare, RefreshCcw, Calendar, Package, Users, Edit2, Trash2 } from 'lucide-react';
import api from '../../../shared/utils/api';

const ProjectDetailsLayout = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data?.data);
      } catch (err) { console.error(err); }
    };
    fetchDetails();
  }, [projectId]);

  if (!project) return null;

  const tabs = [
    { name: 'Overview', path: `overview`, icon: Eye },
    { name: 'Attendance', path: `attendance`, icon: Clock },
    { name: 'DPR', path: `dpr`, icon: FileText },
    { name: 'Tasks', path: `tasks`, icon: CheckSquare },
    { name: 'Transactions', path: `transactions`, icon: RefreshCcw },
    { name: 'Timeline', path: `timeline`, icon: Calendar },
    { name: 'Inventory', path: `inventory`, icon: Package },
    { name: 'Sub-contractor', path: `subcontractors`, icon: Users },
  ];

  return (
    <div className="p-8 space-y-6 bg-[#F8FAFC]">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 mb-1">{project.name}</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{project.location} | ID-{project.projectId || 'PROJ-001'} · {project.client?.companyName}</p>
          </div>
          <div className="flex gap-3">
            <button className="p-2 px-5 border border-slate-200 rounded-xl text-slate-600 text-xs font-black uppercase flex items-center gap-2 hover:bg-slate-50">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button className="p-2 px-5 border border-red-100 bg-red-50 text-red-600 text-xs font-black uppercase rounded-xl flex items-center gap-2 hover:bg-red-100">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest">{project.status}</span>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Priority: <span className="text-red-500">High</span></span>
          <span className="text-slate-200">|</span>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Start: {new Date(project.startDate).toLocaleDateString('en-GB')} → End: 13 Oct 2026</span>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-10">
            <div className="text-center">
                <h3 className="text-3xl font-black text-slate-800">₹42L<span className="text-sm text-slate-300 font-bold ml-1">/₹80L</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Budget Used</p>
            </div>
            <div className="text-center border-x border-slate-100 px-4">
                <h3 className="text-3xl font-black text-slate-800">124</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Days Left</p>
            </div>
            <div className="text-center">
                <h3 className="text-3xl font-black text-slate-800">18<span className="text-sm text-slate-300 font-bold ml-1">/30</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Tasks Done</p>
            </div>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3"><div className="bg-[#0066CC] h-full rounded-full transition-all duration-1000" style={{ width: '75%' }}></div></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">75% complete</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6">
        <nav className="flex space-x-10 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.includes(tab.path);
            return (
              <NavLink key={tab.name} to={tab.path} className={() => `flex items-center gap-2.5 py-5 px-1 border-b-2 transition-all text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0066CC]' : 'text-slate-300'}`} />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pb-10">
        <Outlet />
      </div>
    </div>
  );
};

export default ProjectDetailsLayout;