// src/modules/projects/pages/DPRListPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, Calendar, Trash2, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { dprService } from '../services/dpr.service';
import CreateDPRModal from '../components/CreateDPRModal';
import CreateWPRModal from '../components/CreateWPRModal';
import DPRDetailsModal from '../components/DPRDetailsModal';

const DPRListPage = () => {
  const { projectId } = useParams();
  const [reportType, setReportType] = useState('DPR'); // 'DPR' or 'WPR'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filter States
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState('Week 1');
  const [selectedMonthYear, setSelectedMonthYear] = useState(`${new Date().getMonth() + 1}/${new Date().getFullYear()}`);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (reportType === 'DPR') {
        // Backend might expect 'date' parameter. 
        // We ensure it is passed correctly to avoid 400 error.
        const data = await dprService.getDPRsByProject(projectId, { date: selectedDate });
        setReports(data.data || []);
      } else {
        // Fetch Weekly Reports
        const data = await dprService.getWeeklyReport(projectId, selectedMonthYear);
        setReports(data.data || [
          { id: 'w1', title: 'Sep 2025 - Week 1', status: 'Submitted' },
          { id: 'w2', title: 'Sep 2025 - Week 2', status: 'Submitted' }
        ]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]); // Clear reports on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [projectId, reportType, selectedDate, selectedMonthYear]);

  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-in fade-in duration-500">
      
      {/* TOP TOGGLE AND ACTIONS BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        
        {/* DPR/WPR Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setReportType('DPR')}
            className={`px-8 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              reportType === 'DPR' ? 'bg-[#0066CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            DPR
          </button>
          <button 
            onClick={() => setReportType('WPR')}
            className={`px-8 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              reportType === 'WPR' ? 'bg-[#0066CC] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            WPR
          </button>
        </div>

        {/* Dynamic Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {reportType === 'DPR' ? (
            <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <select 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 outline-none cursor-pointer"
                >
                  <option>Week 1</option><option>Week 2</option><option>Week 3</option><option>Week 4</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="MM/YYYY"
                  value={selectedMonthYear}
                  onChange={(e) => setSelectedMonthYear(e.target.value)}
                  className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 outline-none w-32"
                />
              </div>
            </>
          )}

          <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#0066CC] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create {reportType}
          </button>
          
          <button className="p-2.5 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-6">
        {reportType === 'DPR' ? 'Daily' : 'Weekly'} Progress Report List
      </h3>

      {/* REPORTS LIST */}
      <div className="space-y-1">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold italic font-mono">Syncing reports...</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-50 rounded-3xl font-bold uppercase tracking-widest text-xs">
            No {reportType} records found
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => handleOpenDetails(report)}
              className="flex items-center justify-between p-5 hover:bg-slate-50/80 border-b border-slate-50 transition-all cursor-pointer group"
            >
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-800">
                  {report.title || new Date(report.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                  Prepared by: <span className="text-[#0066CC]">{report.preparedBy?.name || 'Ajay Singh'}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  report.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {report.status}
                </span>
                <button className="text-[11px] font-black text-[#0066CC] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all underline underline-offset-4">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALS */}
      {reportType === 'DPR' ? (
        <CreateDPRModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            refresh={fetchReports} 
            projectId={projectId}
        />
      ) : (
        <CreateWPRModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            refresh={fetchReports} 
            projectId={projectId}
        />
      )}

      <DPRDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        dpr={selectedReport}
      />
    </div>
  );
};

export default DPRListPage;