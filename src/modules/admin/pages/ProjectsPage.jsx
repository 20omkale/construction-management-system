import { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';

import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get("/projects");

        console.log("🔥 PROJECTS FROM BACKEND:", res.data.data);

        // ✅ IMPORTANT: normalize data for your UI
        const formattedProjects = res.data.data.map((p) => ({
          ...p,

          // fallback values so UI doesn't break
          idCode: p.projectCode || p.id,
          client: p.clientName || 'N/A',
          location: p.location || 'N/A',
          manager: p.managerName || 'N/A',
          engineer: p.engineerName || 'N/A',

          budget: p.budget || '—',
          contract: p.contractValue || '—',
          advance: p.advanceReceived || '—',

          start: p.startDate || '—',
          end: p.endDate || '—',

          progress: p.progress || 0,
          status: p.status || 'Ongoing',
          priority: p.priority || 'Medium',

          daysLeft: p.daysLeft || 0,
          tasks: p.tasksSummary || '0/0',

          milestones: p.milestones || [],
          activities: p.activities || [],
        }));

        setProjects(formattedProjects);

      } catch (err) {
        console.error("❌ Failed to fetch projects:", err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // ✅ Computed
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // ✅ Handlers
  const handleOpenDetail = (id) => {
    setSelectedProjectId(id);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedProjectId(null);
    setView('list');
  };

  // ⚠️ NOTE: These are UI-only (backend integration later)
  const handleCreate = (data) => {
    const newProject = {
      ...data,
      id: crypto.randomUUID(), // temporary (frontend only)
      idCode: 'TEMP',
      status: 'Ongoing',
      progress: 0,
      daysLeft: 365,
      tasks: '0/0',
      milestones: [],
      activities: [{ icon: 'doc', text: 'Project created', time: 'Just now' }]
    };

    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
  };

  const handleEdit = (data) => {
    setProjects(projects.map(p =>
      p.id === selectedProjectId ? { ...p, ...data } : p
    ));
    setShowEditModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      handleBackToList();
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4">

      {/* ✅ Loading State */}
      {loading && (
        <div className="text-center text-slate-500">Loading projects...</div>
      )}

      {/* ❌ Error State */}
      {error && (
        <div className="text-center text-red-500">{error}</div>
      )}

      {/* ✅ LIST VIEW */}
      {!loading && view === 'list' && (
        <ProjectList
          projects={projects}
          onOpenDetail={handleOpenDetail}
          onCreateClick={() => setShowCreateModal(true)}
        />
      )}

      {/* ✅ DETAIL VIEW */}
      {!loading && view === 'detail' && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToList}
          onEditClick={() => setShowEditModal(true)}
          onDeleteClick={() => handleDelete(selectedProject.id)}
        />
      )}

      {/* MODALS */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      {showEditModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={selectedProject}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}