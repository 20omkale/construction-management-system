import { useState, useEffect } from 'react';
import StatsCards from './components/StatsCards';
import CompanyTable from './components/CompanyTable';
import CreateCompanyModal from './components/CreateCompanyModal';
import CompanyDetailModal from './components/CompanyDetailModal';
import SuspendCompanyModal from './components/SuspendCompanyModal';
import { fetchCompanies, createCompany, deleteCompany, updateCompanyStatus, fetchCompanyDetails } from '../services/adminServices';
import { companiesData } from '../services/mockData'; // fallback or temp remove if you want strict pure API

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const mapCompanyData = (apiCompany) => {
    // Both getAllCompanies and getCompanyDetails might have different structures for admins and counts
    const adminsList = apiCompany.companyAdmins || apiCompany.users || [];
    const firstAdmin = adminsList[0] || {};

    const projectsCount = apiCompany.stats?.projects || apiCompany.projectCount || apiCompany._count?.projects || 0;
    const usersCount = apiCompany.stats?.employees || apiCompany.adminCount || apiCompany.employeeCount || apiCompany._count?.users || 0;

    return {
      id: apiCompany.id,
      name: apiCompany.name,
      subId: apiCompany.registrationNumber || `ID-${(apiCompany.id || '').substring(0,6)}`,
      gst: apiCompany.gstNumber || 'N/A',
      location: apiCompany.officeAddress || 'India',
      projects: projectsCount,
      users: usersCount,
      joined: apiCompany.createdAt ? new Date(apiCompany.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
      lastActive: 'Today',
      status: apiCompany.isActive ? 'Active' : 'Suspended',
      
      // Detailed view fields
      registrationNumber: apiCompany.registrationNumber,
      email: apiCompany.email,
      website: apiCompany.website,
      phone: apiCompany.phone,
      address: apiCompany.officeAddress || apiCompany.address,
      createdAt: apiCompany.createdAt ? new Date(apiCompany.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A',
      totalProjects: projectsCount,
      activeProjectCount: apiCompany.stats?.activeProjects || 0,
      inactiveProjects: apiCompany.stats?.completedProjects || 0,
      totalStaff: usersCount,
      totalWorkers: 0,
      admin: {
        name: firstAdmin.name || 'N/A',
        role: 'Company Admin',
        phone: firstAdmin.phone || 'N/A',
        email: firstAdmin.email || 'N/A',
      },
      bank: { bankName: '—', accountNumber: '—', ifscCode: '—', branch: '—' },
    };
  };

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await fetchCompanies();
      if (res.success && res.data) {
        setCompanies(res.data.companies.map(mapCompanyData));
      } else {
        // use mock data if backend fails
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error(error);
      // Optional fallback for pure testing without backend running
      // setCompanies(companiesData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompany = async (formData) => {
    try {
      // CreateCompanyModal should be updated to pass mapped fields or we map them here
      const payload = {
        companyName: formData.companyName,
        registrationNumber: formData.registrationNumber,
        gstNumber: formData.gstNumber,
        officeAddress: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || '',
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        permissions: formData.giveAllPermissions ? ['FULL_COMPANY_ACCESS'] : [],
      };

      const res = await createCompany(payload);
      if (res.success) {
        // Optomistically reload data or parse from response
        await loadCompanies();
        setShowCreateModal(false);
      }
    } catch (error) {
      alert(`Error creating company: ${error.message}`);
    }
  };

  const handleViewCompany = async (company) => {
    try {
      // Opt: you can add a loading state here if needed
      const res = await fetchCompanyDetails(company.id);
      if (res.success && res.data) {
        // Map the detailed response, or update the selected company with additional fields
        const detailedMapped = mapCompanyData(res.data);
        setSelectedCompany(detailedMapped);
      } else {
        setSelectedCompany(company); // Fallback to list data
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      setSelectedCompany(company); // Fallback to list data
    }
    setShowDetailModal(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowCreateModal(true);
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await deleteCompany(company.id);
        setCompanies((prev) => prev.filter((c) => c.id !== company.id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleSuspendClick = async (company) => {
    // Instead of instantly suspending, we just trigger the confirm modal
    setSelectedCompany(company);
    setShowSuspendModal(true);
  };

  const handleSuspendConfirm = async (company, reason) => {
    try {
      const isCurrentlyActive = company.status === 'Active';
      const newStatus = !isCurrentlyActive;
      
      await updateCompanyStatus(company.id, newStatus);
      const updatedStatusLabel = newStatus ? 'Active' : 'Suspended';
      
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, status: updatedStatusLabel } : c))
      );
      
      setSelectedCompany((prev) => prev ? { ...prev, status: updatedStatusLabel } : null);
      setShowSuspendModal(false);
      
    } catch (error) {
      alert(`Error updating status: ${error.message}`);
    }
  };

  return (
    <>
      <StatsCards />
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-slate-500">Loading companies...</p>
        </div>
      ) : (
        <CompanyTable
          companies={companies}
          onCreateClick={() => setShowCreateModal(true)}
          onViewClick={handleViewCompany}
          onEditClick={handleEditCompany}
          onDeleteClick={handleDeleteCompany}
        />
      )}
      <CreateCompanyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={handleCreateCompany}
      />
      <CompanyDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        company={selectedCompany}
        onSuspendClick={handleSuspendClick}
      />
      <SuspendCompanyModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        company={selectedCompany}
        onConfirm={handleSuspendConfirm}
      />
    </>
  );
}
