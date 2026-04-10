import React, { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom"; 
import { approvalService } from "../services/approval.service";
import ApprovalDetailsModal from "../components/ApprovalDetailsModal";

export default function ApprovalsPage() {
  const { globalSearch } = useOutletContext() || { globalSearch: "" }; 
  
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("budget"); 
  const [viewMode, setViewMode] = useState("MAIN"); // MAIN = Pending List | HISTORY = Approval History
  
  const [listSearch, setListSearch] = useState(""); 
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const statusParam = viewMode === "MAIN" ? "PENDING" : ""; 
      const data = await approvalService.getApprovals(statusParam);
      let filtered = data.filter(item => item.approvalType.toLowerCase() === activeTab);
      
      if (viewMode === "HISTORY") {
        filtered = filtered.filter(item => item.status !== "PENDING" && item.status !== "SUBMITTED");
      }
      setApprovals(filtered);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    setStatusFilter("ALL"); 
  }, [activeTab, viewMode]);

  const filteredApprovals = approvals.filter((item) => {
    const textToSearch = `${item.submitterName} ${item.project?.name || item.projectName || ''}`.toLowerCase();
    const matchesGlobal = !globalSearch || textToSearch.includes(globalSearch.toLowerCase());
    const matchesLocal = !listSearch || textToSearch.includes(listSearch.toLowerCase());
    const matchesDate = !dateFilter || (item.displayDate && new Date(item.displayDate).toISOString().split('T')[0] === dateFilter);
    
    const itemStatus = item.status?.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || itemStatus === statusFilter;

    return matchesGlobal && matchesLocal && matchesDate && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full pt-2">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        
        {/* Top Toggles */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-[#F1F5F9] rounded-full p-1 border border-gray-200/60">
            <button onClick={() => { setActiveTab("budget"); setViewMode("MAIN"); }}
              className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "budget" ? "bg-[#0f62fe] text-white shadow-md" : "text-gray-500 hover:text-gray-800"}`}>
              Budget
            </button>
            <button onClick={() => { setActiveTab("timeline"); setViewMode("MAIN"); }}
              className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "timeline" ? "bg-[#0f62fe] text-white shadow-md" : "text-gray-500 hover:text-gray-800"}`}>
              Timeline
            </button>
          </div>
          {/* Toggle between List and History */}
          <button onClick={() => setViewMode(viewMode === "MAIN" ? "HISTORY" : "MAIN")} className="text-[#0f62fe] text-sm font-bold hover:text-blue-800 transition-colors">
            {viewMode === "MAIN" ? "View History" : "Back to List"}
          </button>
        </div>

        {/* Title & Filter Row */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg text-gray-900">
            {viewMode === "MAIN" ? `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List` : "Approval History"}
          </h2>
          
          <div className="flex gap-3">
            <div className="flex items-center bg-[#F1F5F9] border border-gray-200/60 px-4 py-2.5 rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input className="ml-3 bg-transparent outline-none text-sm w-48 text-gray-700 placeholder-gray-400 font-medium"
                placeholder="Search" value={listSearch} onChange={(e) => setListSearch(e.target.value)} />
            </div>

            {/* 🚨 Filter Button - ONLY visible in HISTORY mode */}
            {viewMode === "HISTORY" && (
              <div className="relative" ref={filterRef}>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 bg-[#F1F5F9] border px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${statusFilter !== 'ALL' ? 'border-blue-500 text-blue-600' : 'border-gray-200/60 text-gray-600'}`}>
                  <SlidersHorizontal size={16} /> Filter
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2">
                    <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter Status</p>
                    <button onClick={() => { setStatusFilter("ALL"); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50">All</button>
                    <button onClick={() => { setStatusFilter("APPROVED"); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 text-green-600">Approved</button>
                    <button onClick={() => { setStatusFilter("REJECTED"); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 text-red-600">Rejected</button>
                  </div>
                )}
              </div>
            )}

            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#F1F5F9] border border-gray-200/60 px-4 py-2.5 rounded-xl text-sm outline-none text-gray-600 font-medium cursor-pointer" />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-[#f8fafc] rounded-2xl border border-gray-100 divide-y divide-gray-200/60 overflow-hidden min-h-[300px]">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0f62fe]" />
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="p-20 text-center text-gray-500 font-medium">No records found.</div>
          ) : (
            filteredApprovals.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-5 hover:bg-slate-100/50 transition-colors">
                <div>
                  <div className="font-bold text-gray-900 text-[15px] mb-1">{item.project?.name || item.projectName || "Project Name"}</div>
                  <div className="text-[#0f62fe] text-sm font-medium mb-0.5">{item.submitterName}</div>
                  <div className="text-[#0f62fe] text-sm font-medium capitalize">{activeTab}</div>
                </div>

                <div className="text-right flex flex-col items-end">
                  {viewMode === "MAIN" ? (
                    // 🚨 MAIN LIST SHOWS ONLY THE VIEW BUTTON
                    <button onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                      className="bg-[#0f62fe] hover:bg-blue-700 text-white px-8 py-2 rounded-xl text-xs font-bold transition-all shadow-sm mb-2">
                      View
                    </button>
                  ) : (
                    // 🚨 HISTORY VIEW SHOWS ONLY THE STATUS BADGE
                    <div className="mb-2">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'APPROVED' ? 'bg-[#E8F8F0] text-[#00A86B] border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 font-medium">Sent: {formatDate(item.displayDate)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ApprovalDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedItem} onSuccess={fetchApprovals} />
    </div>
  );
}