import React, { useState } from "react";
import { X, Check, Loader2, ChevronDown } from "lucide-react";
import { approvalService } from "../services/approval.service"; // REAL SERVICE IMPORTED

export default function ApprovalDetailsModal({ isOpen, onClose, data, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(null); 
  const [showConfirmation, setShowConfirmation] = useState(null); 
  const [remarks, setRemarks] = useState("");
  const [expandedWeek, setExpandedWeek] = useState(1);

  if (!isOpen || !data) return null;

  const isPending = data.status === "PENDING" || data.status === "SUBMITTED";
  const isTimeline = data.approvalType?.toLowerCase() === "timeline";

  // REAL-TIME DATABASE UPDATE ACTION
  const handleAction = async (status) => {
    setIsProcessing(status); 
    
    try {
      // 1. Call your real backend API
      await approvalService.updateStatus(data.approvalType, data.id, status, remarks);
      
      // 2. Show Success/Reject Visual Popup
      setShowConfirmation(status);
      
      // 3. Trigger parent to re-fetch from database so the list updates behind the modal
      if (onSuccess) onSuccess(); 
      
      // 4. Wait 2 seconds for user to see the success tick, then close modal
      setTimeout(() => {
        setShowConfirmation(null);
        setRemarks("");
        setExpandedWeek(1);
        onClose();
      }, 2000);

    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
      alert(error.response?.data?.message || "Failed to process request. Please check your database connection.");
    } finally {
      setIsProcessing(null); 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", { 
      day: "2-digit", month: "short", year: "numeric" 
    }).toUpperCase(); 
  };

  // ==========================================
  // VIEW 3: CONFIRMATION POPUP
  // ==========================================
  if (showConfirmation) {
    const isApproved = showConfirmation === 'APPROVED';
    const typeName = data.approvalType ? data.approvalType.charAt(0).toUpperCase() + data.approvalType.slice(1) : "Request";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 min-w-[350px]">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {typeName} {isApproved ? 'Approved' : 'Rejected'}
          </h3>
          {isApproved ? (
            <div className="w-16 h-16 bg-[#00C292] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check className="text-white" size={36} strokeWidth={4} />
            </div>
          ) : (
            <div className="w-16 h-16 bg-[#FF4D4F] rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
              <X className="text-white" size={36} strokeWidth={4} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TIMELINE SPECIFIC RENDER
  // ==========================================
  const renderTimelineView = () => {
    // Uses real data. Falls back gracefully if backend hasn't populated arrays yet.
    const tData = data.timelineDetails || {
      monthYear: "Timeline", totalMonths: "-", totalWeeks: "-", totalDays: "-",
      startDate: data.createdAt, endDate: data.displayDate, weeks: []
    };

    return (
      <div className="mb-6 w-full">
        <div className="border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm bg-white">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-base font-bold text-gray-900">{tData.monthYear}</h3>
            <div className="flex gap-8 text-center">
              <div><div className="text-xl font-black text-gray-900">{tData.totalMonths}</div><div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Months</div></div>
              <div><div className="text-xl font-black text-gray-900">{tData.totalWeeks}</div><div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Weeks</div></div>
              <div><div className="text-xl font-black text-gray-900">{tData.totalDays}</div><div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Days</div></div>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="px-5 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 bg-gray-50">Start: <span className="text-[#0f62fe] ml-1">{formatDate(tData.startDate)}</span></span>
            <span className="px-5 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 bg-gray-50">Estimated End: <span className="text-[#0f62fe] ml-1">{formatDate(tData.endDate)}</span></span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {tData.weeks && tData.weeks.length > 0 ? (
            tData.weeks.map(week => (
              <div key={week.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-gray-300">
                <button onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)} className="w-full flex items-center justify-between p-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-[#0f62fe] text-white flex items-center justify-center font-bold text-base">{week.id}</div>
                    <div className="ml-5 font-bold text-sm text-gray-900">{week.title}</div>
                  </div>
                  <div className="flex items-center gap-4 pr-5">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{week.taskCount || 0} tasks</span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${expandedWeek === week.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {expandedWeek === week.id && week.tasks && week.tasks.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-slate-50/50">
                    {week.tasks.map((task, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <div className={`px-4 py-3 text-sm font-bold rounded-xl ${task.subtasks?.length > 0 ? "bg-blue-50/80 text-[#0f62fe]" : "text-gray-700 bg-white border border-gray-100"}`}>{task.title}</div>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <ul className="list-disc pl-14 pr-4 py-2 text-sm font-medium text-gray-600 marker:text-[#0f62fe] space-y-2">
                            {task.subtasks.map((sub, sIdx) => <li key={sIdx}>{sub}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-sm font-bold text-gray-400 border border-dashed border-gray-200 rounded-xl">No weekly timeline data available.</div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // BUDGET SPECIFIC RENDER (Table)
  // ==========================================
  const renderBudgetView = () => {
    // Maps to real backend arrays (accommodating common naming conventions)
    const tableItems = data.items || data.particulars || data.budgetItems || [];
    const totalQuantity = tableItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalAmount = tableItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
      <div className="mb-6 w-full">
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="col-span-2">SR. NO.</div>
          <div className="col-span-5">PARTICULARS</div>
          <div className="col-span-2">QUANTITY</div>
          <div className="col-span-3 text-right">AMOUNT</div>
        </div>

        <div className="flex flex-col">
          {tableItems.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold text-gray-400 border-b border-gray-100 border-dashed">No particulars provided in this budget.</div>
          ) : (
            tableItems.map((item, index) => (
              <div key={item.id || index} className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 text-sm font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                <div className="col-span-2 text-gray-400">{String(index + 1).padStart(2, '0')}</div>
                <div className="col-span-5 truncate pr-2">{item.particular || item.name}</div>
                <div className="col-span-2">{item.quantity || "—"}</div>
                <div className="col-span-3 text-right text-gray-900">₹{(item.amount || 0).toLocaleString('en-IN')}</div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-12 gap-4 py-5 text-sm font-black text-gray-900 border-b-2 border-gray-100 bg-slate-50/30">
          <div className="col-span-7 pl-2">Total</div>
          <div className="col-span-2">{totalQuantity || "—"}</div>
          <div className="col-span-3 text-right pr-2 text-[#0f62fe]">₹{(totalAmount || data.totalAmount || data.totalBudget || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 1 & 2: MAIN MODAL WRAPPER
  // ==========================================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={() => { setRemarks(""); setExpandedWeek(1); setIsProcessing(null); onClose(); }}
          className="absolute top-6 right-6 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all z-10"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          <div className="mb-8 pr-12">
            <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
              {isTimeline ? (data.timelineDetails?.monthYear || "Timeline Request") : (data.project?.name || data.projectName || "Project Budget")}
            </h2>
            <p className="text-sm font-bold text-[#0f62fe] mt-2">
              {isTimeline ? (data.project?.name || data.projectName || "Company Name") : (data.submitterName || "Manager Name")}
            </p>
            {!isTimeline && (
              <div className="flex items-center gap-4 mt-4">
                <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">Received: {formatDate(data.createdAt)}</span>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">Sent: {formatDate(data.displayDate || data.createdAt)}</span>
              </div>
            )}
          </div>

          {isTimeline ? renderTimelineView() : renderBudgetView()}

          <div className="mb-2 mt-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Remarks / Notes</label>
            <textarea
              value={isPending ? remarks : (data.remarks || remarks)}
              onChange={(e) => setRemarks(e.target.value)}
              readOnly={!isPending}
              placeholder={isPending ? "Enter your review notes here..." : "No remarks were provided."}
              className={`w-full border rounded-2xl p-5 text-sm font-medium outline-none resize-none h-28 transition-all ${
                isPending ? "border-gray-200 focus:border-[#0f62fe] focus:ring-4 focus:ring-blue-500/10 bg-white text-gray-900" : "border-transparent bg-gray-50 text-gray-500"
              }`}
            />
          </div>
        </div>

        {isPending && (
          <div className="flex justify-center items-center gap-4 p-6 shrink-0 border-t border-gray-100 bg-white">
            <button
              onClick={() => handleAction('APPROVED')}
              disabled={isProcessing !== null}
              className="bg-[#00C292] hover:bg-[#00A87D] text-white px-12 py-3.5 rounded-xl text-sm font-black transition-colors w-44 flex justify-center items-center shadow-lg shadow-emerald-500/20 disabled:opacity-70"
            >
              {isProcessing === 'APPROVED' ? <Loader2 size={18} className="animate-spin" /> : 'Approve Request'}
            </button>
            <button
              onClick={() => handleAction('REJECTED')}
              disabled={isProcessing !== null}
              className="bg-[#FF4D4F] hover:bg-[#E63E40] text-white px-12 py-3.5 rounded-xl text-sm font-black transition-colors w-44 flex justify-center items-center shadow-lg shadow-red-500/20 disabled:opacity-70"
            >
              {isProcessing === 'REJECTED' ? <Loader2 size={18} className="animate-spin" /> : 'Reject Request'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}