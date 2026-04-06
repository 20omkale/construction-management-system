import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import api from '../../../shared/utils/api';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data?.data || []);
      } catch (err) {
        console.error("Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Helper function to calculate days remaining
  const getDaysLeft = (endDate) => {
    if (!endDate) return 'TBD';
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Completed';
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Header Section with Light Blue background */}
      <div className="bg-[#EDF2F7] px-8 py-6">
        <h1 className="text-xl font-bold text-slate-800">Projects</h1>
      </div>

      <div className="p-8">
        {/* 2. Search & Action Bar (White Card) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 bg-[#0066CC] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create New Project
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 font-bold text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* 3. Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-400 font-medium italic">Syncing projects...</div>
          ) : filteredProjects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-[#0066CC] transition-colors">{project.name}</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{project.projectId || `ID-${project.id.substring(0,4)}`}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  project.status === 'ONGOING' ? 'bg-emerald-50 text-emerald-600' : 
                  project.status === 'ON HOLD' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                  <span className="w-20">Location</span>
                  <span className="text-slate-500 normal-case font-semibold">{project.location || 'Mumbai, India'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                  <span className="w-20">Client</span>
                  <span className="text-slate-500 normal-case font-semibold">{project.client?.companyName || 'Nexus Civil Works'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                  <span className="w-20">Start</span>
                  <span className="text-slate-500 normal-case font-semibold">
                    {new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tight">
                  <span className="w-20">Priority</span>
                  <span className={`font-black ${project.priority === 'High' ? 'text-red-500' : project.priority === 'Medium' ? 'text-orange-400' : 'text-emerald-500'}`}>
                    {project.priority || 'Medium'}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-[#0066CC] h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${project.progress || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <span>{project.progress || 0}% complete</span>
                <span>{getDaysLeft(project.endDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectListPage;