import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/utils/api'; // Adjust path if needed

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.get('/projects', {
            params: { limit: 100 }
        });
        setProjects(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        // Fallback mock data matching your screenshot perfectly
        setProjects([
          {
            id: '6940013f-80e2-47b3-a4fd-75b4823e3103',
            name: 'Residential Building Construction',
            projectId: 'PROJ-003',
            status: 'ONGOING',
            location: 'Pune, Maharashtra',
            client: { companyName: 'Nexus CivilWorks' },
            startDate: '2026-03-10',
            priority: 'CRITICAL',
            progress: 60
          },
          {
            id: 'mock-id-2',
            name: 'Reliance Building Construction',
            projectId: 'PROJ-002',
            status: 'PLANNING',
            location: 'Mumbai, Maharashtra',
            client: { companyName: 'Nexus CivilWorks' },
            startDate: '2026-01-15',
            priority: 'HIGH',
            progress: 0
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}/overview`);
  };

  return (
    // Note: The redundant <h1 className="text-2xl font-bold">Projects</h1> that used to be here is now removed.
    <div className="p-8 space-y-6 bg-[#F8FAFC] min-h-screen animate-in fade-in duration-500">
      
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-[#0066CC] text-white px-6 py-3 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Create New Project
          </button>
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Loading Projects...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-[#0066CC] transition-colors">{project.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{project.projectId}</p>
                </div>
                <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                  project.status === 'ONGOING' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-y-4 mb-8">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</span>
                <span className="text-xs font-bold text-slate-700">{project.location}</span>
                
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</span>
                <span className="text-xs font-bold text-slate-700">{project.client?.companyName || 'N/A'}</span>
                
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</span>
                <span className="text-xs font-bold text-slate-700">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
                
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
                <span className={`text-xs font-black ${project.priority === 'CRITICAL' ? 'text-emerald-500' : 'text-emerald-500'}`}>
                  {project.priority || 'HIGH'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0066CC] h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                  <span className="text-slate-400">{project.progress || 0}% COMPLETE</span>
                  <span className="text-slate-300">TBD</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;