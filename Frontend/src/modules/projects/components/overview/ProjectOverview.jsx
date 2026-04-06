import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, FileText, CheckCircle2, UserCheck, Package, MapPin, Building, User, TrendingUp, Check } from 'lucide-react';
import api from '../../../../shared/utils/api';

const ProjectOverview = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data?.data);
      } catch (err) { 
        console.error("Overview load error:", err); 
      }
    };
    fetchOverview();
  }, [projectId]);

  if (!project) return (
    <div className="p-10 text-center text-slate-600 font-bold bg-white rounded-3xl border border-slate-100">
      Loading project overview...
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-16 animate-in fade-in duration-500">
      
      {/* TOP SECTION: Side-by-side Info and Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* 1. PROJECT INFO */}
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-800" /> PROJECT INFO
          </h3>
          <div className="space-y-6">
              <Item label="Client" value={project.client?.companyName || 'ABC Infrastructure Pvt Ltd'} isLink />
              <Item label="Location" value={project.location || 'Pune, Maharashtra'} />
              <Item label="Project Manager" value="Rahul Mehta" />
              <Item label="Site Engineer" value="Ankit Verma" />
          </div>
        </div>

        {/* 2. MILESTONES */}
        <div className="lg:border-l border-slate-100 lg:pl-16">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-800" /> MILESTONES
          </h3>
          <div className="space-y-8">
            <MS title="Foundation Work" date="28 Dec 2025" status="completed" />
            <MS title="Structural Frame" date="15 Feb 2026" status="completed" />
            <MS title="Plumbing & Electrical" date="20 Apr 2026" status="current" />
            <MS title="Finishing & Handover" date="13 Oct 2026" status="pending" />
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Full-width Recent Activities */}
      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-800" /> RECENT ACTIVITIES
        </h3>
        <div className="space-y-2">
            <Activity icon={FileText} text="DPR submitted by Site Engineer" time="Today 6:30 PM" color="blue" />
            <Activity icon={Package} text="Material request approved: Cement (50 Bags)" time="Yesterday 6:30 PM" color="emerald" />
            <Activity icon={CheckCircle2} text="Task marked completed: Excavation work" time="12 Dec 2025" color="emerald" />
            <Activity icon={UserCheck} text="Attendance updated for 42 workers" time="11 Dec 2025" color="purple" />
        </div>
      </div>

    </div>
  );
};

const Item = ({ label, value, isLink }) => (
    <div className="flex items-center justify-between group">
        <span className="text-sm font-bold text-slate-500">{label}</span>
        <span className={`text-sm font-black ${isLink ? 'text-[#0066CC] hover:underline cursor-pointer' : 'text-slate-900'}`}>
            {value}
        </span>
    </div>
);

const Activity = ({ icon: Icon, text, time, color }) => {
    const bg = { 
        blue: "bg-blue-50 text-blue-600", 
        emerald: "bg-emerald-50 text-emerald-600", 
        purple: "bg-purple-50 text-purple-600" 
    };
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${bg[color]} transition-colors shadow-sm`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[14px] font-black text-slate-800">{text}</span>
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{time}</span>
        </div>
    );
};

const MS = ({ title, date, status }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            {status === 'completed' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-emerald-50">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                </div>
            ) : status === 'current' ? (
                <div className="w-5 h-5 rounded-full border-[5px] border-[#0066CC] bg-white ring-4 ring-blue-50" />
            ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
            )}
            <span className={`text-[13px] font-black ${status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">{date}</span>
            {status === 'completed' && <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />}
        </div>
    </div>
);

export default ProjectOverview;