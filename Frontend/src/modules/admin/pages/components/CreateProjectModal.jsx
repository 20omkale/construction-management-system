import { useState } from 'react';

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    client: '',
    desc: '',
    start: '',
    end: '',
    budget: '',
    advance: '',
    contract: '',
    manager: '',
    priority: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const formatDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Please enter a project name to continue.');
      return;
    }
    setError('');
    
    const finalData = {
      name: formData.name.trim(),
      location: formData.location || 'N/A',
      client: formData.client || 'N/A',
      desc: formData.desc,
      start: formatDate(formData.start) || 'TBD',
      end: formatDate(formData.end) || 'TBD',
      budget: `₹0/₹${formData.budget || '0'}`,
      advance: `₹${formData.advance || '0'}`,
      contract: `₹${formData.contract || '0'}`,
      manager: formData.manager || 'Unassigned',
      priority: formData.priority || 'Medium',
    };
    
    // reset form
    setFormData({ name: '', location: '', client: '', desc: '', start: '', end: '', budget: '', advance: '', contract: '', manager: '', priority: '' });
    onCreate(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-wrap bg-black/40">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 fade-up">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create new project</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 md:px-6 py-5 space-y-5">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-700">
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Project details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project name <span className="text-red-500">*</span></label>
              <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Enter the project name" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} type="text" placeholder="Enter the location name" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Client Name</label>
              <input name="client" value={formData.client} onChange={handleChange} type="text" placeholder="Enter the client name" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label>
            <textarea name="desc" value={formData.desc} onChange={handleChange} rows="3" placeholder="Enter description" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 resize-none"></textarea>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start date</label>
              <div className="relative">
                <input name="start" value={formData.start} onChange={handleChange} type="date" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm pr-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End date</label>
              <div className="relative">
                <input name="end" value={formData.end} onChange={handleChange} type="date" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm pr-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Budget (₹)</label>
              <input name="budget" value={formData.budget} onChange={handleChange} type="number" placeholder="Enter the..." className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Advanced received (₹)</label>
              <input name="advance" value={formData.advance} onChange={handleChange} type="number" placeholder="Enter the..." className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contract Value (₹)</label>
              <input name="contract" value={formData.contract} onChange={handleChange} type="number" placeholder="Enter the..." className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Manager</label>
              <select name="manager" value={formData.manager} onChange={handleChange} className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm">
                <option value="">Select manager</option>
                <option>Rahul Mehta</option><option>Priya Sharma</option><option>Vijay Nair</option><option>Anita Desai</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm">
                <option value="">Select priority</option>
                <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium -mt-1">{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-colors shadow-sm">Add</button>
        </div>
      </div>
    </div>
  );
}
