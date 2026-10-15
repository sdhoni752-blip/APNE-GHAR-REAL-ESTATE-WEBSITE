import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { Property, RentalApplication, LeaseAgreement, LeaseStatus, MaintenanceRequest, User } from '../../types';
import { formatINR } from '../../utils/format';
import {
  Building2,
  Plus,
  FileCheck,
  CheckCircle2,
  Check,
  XCircle,
  FileText,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  Eye,
  Edit,
  Trash2,
  Send,
  Users,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  Lock,
  KeyRound
} from 'lucide-react';

interface ManagerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateProperty: () => void;
  onOpenEditProperty: (property: Property) => void;
  onSelectProperty: (property: Property) => void;
  onOpenLease: (lease: LeaseAgreement) => void;
  onOpenMaintenance: (request: MaintenanceRequest) => void;
  onOpenMessages: (recipientId?: string, propertyTitle?: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateProperty,
  onOpenEditProperty,
  onSelectProperty,
  onOpenLease,
  onOpenMaintenance,
  onOpenMessages
}) => {
  const {
    currentUser,
    users,
    properties,
    applications,
    leases,
    maintenance,
    messages,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthMode,
    updateApplicationStatus,
    createLease,
    signLease,
    updateLeaseStatus,
    updateProperty,
    deleteProperty,
    sendMessage
  } = useRealEstate();

  // Confirmation banner state for Property Manager feedback requirements
  const [confirmationBanner, setConfirmationBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showConfirmation = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setConfirmationBanner({ type, message });
    setTimeout(() => {
      setConfirmationBanner(null);
    }, 5000);
  };

  // Strict Authentication Guard
  const guardAuth = (actionDescription: string): boolean => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      showConfirmation(`Access Denied: You must be signed in as a Property Manager to ${actionDescription}.`, 'error');
      return false;
    }
    return true;
  };

  // Filter items assigned to this manager (or all if admin)
  const myProperties = properties.filter(
    p => p.managerId === currentUser.id || currentUser.role === 'admin'
  );
  const myApplications = applications.filter(
    a => a.managerId === currentUser.id || currentUser.role === 'admin'
  );
  const myLeases = leases.filter(
    l => l.managerId === currentUser.id || currentUser.role === 'admin'
  );

  // Property Listings Tab states
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Rental Agreements Tab states
  const [leaseSearch, setLeaseSearch] = useState('');
  const [leaseStatusFilter, setLeaseStatusFilter] = useState('all');

  // Tenant Communication Tab states
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [messagePropertyId, setMessagePropertyId] = useState<string>('');
  const [messageText, setMessageText] = useState('');

  // Application Status Tab states
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [reviewingApp, setReviewingApp] = useState<RentalApplication | null>(null);
  const [appNotes, setAppNotes] = useState('');

  // Computed metrics
  const totalRentRoll = myProperties
    .filter(p => p.status === 'rented')
    .reduce((sum, p) => sum + p.price, 0);

  const occupancyRate = myProperties.length > 0
    ? Math.round((myProperties.filter(p => p.status === 'rented').length / myProperties.length) * 100)
    : 0;

  const pendingApps = myApplications.filter(a => a.status === 'pending');
  const activeLeases = myLeases.filter(l => l.status === 'active');

  // Filtered Properties
  const filteredProperties = myProperties.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.city.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.address.toLowerCase().includes(propertySearch.toLowerCase());
    const matchesStatus = propertyStatusFilter === 'all' || p.status === propertyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Leases
  const filteredLeases = myLeases.filter(l => {
    const matchesSearch =
      l.propertyTitle.toLowerCase().includes(leaseSearch.toLowerCase()) ||
      l.tenantName.toLowerCase().includes(leaseSearch.toLowerCase()) ||
      l.tenantEmail.toLowerCase().includes(leaseSearch.toLowerCase()) ||
      l.id.toLowerCase().includes(leaseSearch.toLowerCase());
    const matchesStatus = leaseStatusFilter === 'all' || l.status === leaseStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Applications
  const filteredApps = myApplications.filter(a => {
    const matchesSearch =
      a.applicantName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.propertyTitle.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.applicantEmail.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Unique Tenants who have applied or hold leases with this manager
  const relevantTenants = users.filter(u => {
    if (u.role !== 'tenant') return false;
    const hasApp = myApplications.some(a => a.applicantId === u.id || a.applicantEmail === u.email);
    const hasLease = myLeases.some(l => l.tenantId === u.id || l.tenantEmail === u.email);
    return hasApp || hasLease;
  });

  // Communication History
  const communicationHistory = messages.filter(
    m => m.senderId === currentUser.id || m.receiverId === currentUser.id
  );

  // Handlers
  const handlePropertyStatusChange = (propertyId: string, newStatus: Property['status']) => {
    if (!guardAuth('change property listing status')) return;
    const res = updateProperty(propertyId, { status: newStatus });
    showConfirmation(`Property status updated to "${newStatus.replace('_', ' ')}".`);
  };

  const handleConfirmDeleteProperty = () => {
    if (!guardAuth('delete property listings')) return;
    if (!propertyToDelete) return;
    const res = deleteProperty(propertyToDelete.id);
    setPropertyToDelete(null);
    showConfirmation(res.message);
  };

  const handleSignAgreement = (leaseId: string) => {
    if (!guardAuth('sign rental agreements')) return;
    const res = signLease(leaseId, 'manager');
    showConfirmation(res.message);
  };

  const handleUpdateAgreementStatus = (leaseId: string, status: LeaseStatus) => {
    if (!guardAuth('update agreement status')) return;
    const res = updateLeaseStatus(leaseId, status);
    showConfirmation(`Rental agreement #${leaseId} updated to status "${status}".`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth('send tenant communications')) return;
    if (!selectedTenantId || !messageText.trim()) return;

    const targetProp = properties.find(p => p.id === messagePropertyId);
    const res = sendMessage(
      selectedTenantId,
      messageText.trim(),
      messagePropertyId || undefined,
      targetProp?.title || undefined
    );

    setMessageText('');
    showConfirmation(res.message, 'success');
  };

  const handleProcessApplication = (status: 'approved' | 'rejected' | 'under_review') => {
    if (!guardAuth('process applications or draft agreements')) return;
    if (!reviewingApp) return;
    const res = updateApplicationStatus(reviewingApp.id, status, appNotes.trim() || undefined);
    
    if (status === 'approved') {
      // Auto-draft lease agreement
      createLease({
        propertyId: reviewingApp.propertyId,
        propertyTitle: reviewingApp.propertyTitle,
        propertyAddress: reviewingApp.propertyAddress,
        propertyImage: reviewingApp.propertyImage,
        managerId: currentUser.id,
        managerName: currentUser.name,
        tenantId: reviewingApp.applicantId,
        tenantName: reviewingApp.applicantName,
        tenantEmail: reviewingApp.applicantEmail,
        startDate: reviewingApp.moveInDate,
        endDate: '2027-10-31',
        monthlyRent: reviewingApp.monthlyRent,
        securityDeposit: reviewingApp.monthlyRent * 2,
        status: 'pending_signature',
        signedByManager: true,
        signedByManagerAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        signedByTenant: false,
        clauses: [
          'Monthly rent is due on the 1st of each calendar month via APNA GHAR.',
          'Late fees apply past grace period as governed by Model Tenancy Act.',
          'No subletting without prior written consent of property manager.',
          'Tenant is responsible for internal routine maintenance under ₹2,000.',
        ],
        nextRentDue: reviewingApp.moveInDate,
        paymentStatus: 'due',
      });
      showConfirmation(`Application approved! Tenancy Agreement drafted and forwarded to ${reviewingApp.applicantName}.`);
    } else {
      showConfirmation(res.message, status === 'rejected' ? 'info' : 'success');
    }

    setReviewingApp(null);
    setAppNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Confirmation Message Toast Banner */}
      {confirmationBanner && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            confirmationBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : confirmationBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {confirmationBanner.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {confirmationBanner.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {confirmationBanner.type === 'info' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            <span>{confirmationBanner.message}</span>
          </div>
          <button
            onClick={() => setConfirmationBanner(null)}
            className="text-xs p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Read-Only Protection Banner when not logged in */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Protected Manager Mode · Authentication Required</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Without logging in, you cannot create or edit properties, sign or update lease agreements, or communicate with tenants.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In to Enable Actions</span>
          </button>
        </div>
      )}

      {/* Top Welcome & Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wide">
              Property Manager Dashboard
            </span>
            <span className="text-xs text-slate-500">{currentUser.name} ({currentUser.company || 'Licensed Realty Manager'})</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Real Estate Operations & Tenancy Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and edit listings, manage bilateral tenancy agreements, send messages to tenants, review rental applications, and analyze listing performance.
          </p>
        </div>

        {/* 5 Primary Navigation Tabs as explicitly requested */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs self-start lg:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'properties' ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Property Listings ({myProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leases')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leases' ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Rental Agreements ({myLeases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('communication')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'communication' ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>3. Tenant Communication</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications' ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>4. Application Status</span>
            {pendingApps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                {pendingApps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>5. Listing Analytics</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio Units</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            {myProperties.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-semibold">{myProperties.filter(p => p.status === 'rented').length} rented</span> · {myProperties.filter(p => p.status === 'available').length} vacant
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Rent Roll</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            ₹{formatINR(totalRentRoll)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Occupancy: <strong className="text-slate-800 font-mono">{occupancyRate}%</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Agreements</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            {activeLeases.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {myLeases.filter(l => l.status === 'pending_signature').length} pending signature
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Applications</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            {pendingApps.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {myApplications.length} total applications received
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROPERTY LISTINGS (Table with editing, updating, adding options)  */}
      {/* ========================================================================= */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Managed Property Listings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input property details (address, description, rent) to list and manage your residential portfolio.
                </p>
              </div>

              <button
                onClick={() => {
                  if (guardAuth('create new property listings')) {
                    onOpenCreateProperty();
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Property Listing</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={propertySearch}
                  onChange={e => setPropertySearch(e.target.value)}
                  placeholder="Search listings by title, address, city..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={propertyStatusFilter}
                  onChange={e => setPropertyStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">All Statuses ({myProperties.length})</option>
                  <option value="available">Available / Published</option>
                  <option value="rented">Leased / Occupied</option>
                  <option value="pending_approval">Pending Admin Approval</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-3">Type & Specs</th>
                    <th className="py-3 px-3 text-right">Rent ₹</th>
                    <th className="py-3 px-3 text-right">Deposit ₹</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No property listings found. Click "Create New Property Listing" to add one!
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map(property => (
                      <tr key={property.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={property.image}
                              alt={property.title}
                              referrerPolicy="no-referrer"
                              className="w-14 h-11 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0 max-w-[250px]">
                              <div className="font-bold text-slate-900 truncate">{property.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">{property.address}, {property.city}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{property.bedrooms} BHK · {property.bathrooms} Bath</div>
                          <div className="text-[11px] text-slate-500">{property.sqft.toLocaleString()} sqft · {property.type}</div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{formatINR(property.price)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          ₹{formatINR(property.securityDeposit)}
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={property.status}
                            onChange={e => handlePropertyStatusChange(property.id, e.target.value as Property['status'])}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                              property.status === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : property.status === 'rented'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : property.status === 'pending_approval'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="available">Available</option>
                            <option value="rented">Rented</option>
                            <option value="pending_approval">Pending Approval</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (guardAuth('edit property listings')) {
                                  onOpenEditProperty(property);
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="Edit listing details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => onSelectProperty(property)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (guardAuth('delete property listings')) {
                                  setPropertyToDelete(property);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RENTAL AGREEMENT MANAGEMENT (Viewing & managing current statuses) */}
      {/* ========================================================================= */}
      {activeTab === 'leases' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Rental Agreement & Tenancy Contract Management</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Oversee Model Tenancy Act bilateral agreements, verify digital signatures, update status, and inspect rent schedules.
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={leaseSearch}
                  onChange={e => setLeaseSearch(e.target.value)}
                  placeholder="Search agreements by tenant, property, agreement ID..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={leaseStatusFilter}
                  onChange={e => setLeaseStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="all">All Agreements ({myLeases.length})</option>
                  <option value="active">Active ({activeLeases.length})</option>
                  <option value="pending_signature">Pending Signature</option>
                  <option value="draft">Draft</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leases Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Agreement ID & Property</th>
                    <th className="py-3 px-3">Tenant Details</th>
                    <th className="py-3 px-3">Tenancy Term</th>
                    <th className="py-3 px-3 text-right">Rent ₹</th>
                    <th className="py-3 px-3">Signatures</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No rental agreements found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeases.map(lease => (
                      <tr key={lease.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-indigo-700">#{lease.id}</div>
                          <div className="font-semibold text-slate-900 mt-0.5">{lease.propertyTitle}</div>
                          <div className="text-[11px] text-slate-500">{lease.propertyAddress}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{lease.tenantName}</div>
                          <div className="text-[11px] text-slate-500">{lease.tenantEmail}</div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          <div>{lease.startDate}</div>
                          <div className="text-slate-400">to {lease.endDate}</div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{formatINR(lease.monthlyRent)}
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-center gap-1 text-slate-700">
                              <span>Manager:</span>
                              {lease.signedByManager ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Signed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSignAgreement(lease.id)}
                                  className="text-[10px] px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded cursor-pointer"
                                >
                                  Sign Now
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-slate-700">
                              <span>Tenant:</span>
                              {lease.signedByTenant ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Signed
                                </span>
                              ) : (
                                <span className="text-amber-600 font-medium italic">Pending</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={lease.status}
                            onChange={e => handleUpdateAgreementStatus(lease.id, e.target.value as LeaseStatus)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                              lease.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : lease.status === 'pending_signature'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="pending_signature">Pending Signature</option>
                            <option value="draft">Draft</option>
                            <option value="terminated">Terminated</option>
                            <option value="expired">Expired</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenLease(lease)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Contract</span>
                            </button>
                            <button
                              onClick={() => onOpenMessages(lease.tenantId, lease.propertyTitle)}
                              className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                              title="Message tenant"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TENANT COMMUNICATION (Sending messages and viewing history)       */}
      {/* ========================================================================= */}
      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Send Message Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs self-start">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-600" />
                <span>Send Message to Tenant</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatch official notices, inspection updates, or rental inquiries directly to tenants.
              </p>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Tenant *
                </label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">-- Choose Tenant Recipient --</option>
                  {relevantTenants.length > 0 ? (
                    relevantTenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))
                  ) : (
                    users.filter(u => u.role === 'tenant').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city || 'Tenant'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Property (Optional)
                </label>
                <select
                  value={messagePropertyId}
                  onChange={e => setMessagePropertyId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">-- General Message (No specific property) --</option>
                  {myProperties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message, agreement notice, or maintenance update here..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTenantId || !messageText.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Message to Tenant</span>
              </button>
            </form>
          </div>

          {/* Right Col: Communication History Thread */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>Tenant Communication History</span>
                </h3>
                <p className="text-[11px] text-slate-500">Chronological archive of all tenant correspondence</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{communicationHistory.length} messages</span>
            </div>

            <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto divide-y divide-slate-100">
              {communicationHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No communication records found. Select a tenant on the left to start a thread!
                </div>
              ) : (
                communicationHistory.map(msg => {
                  const isSentByMe = msg.senderId === currentUser.id;
                  const receiver = users.find(u => u.id === msg.receiverId);

                  return (
                    <div key={msg.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isSentByMe ? 'text-amber-800' : 'text-slate-900'}`}>
                            {isSentByMe ? `You (to ${receiver?.name || 'Tenant'})` : msg.senderName}
                          </span>
                          {msg.propertyTitle && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate max-w-[200px]">
                              {msg.propertyTitle}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: APPLICATION STATUS (Overview of current rental applications)       */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                  <span>Tenant Rental Application Tracker</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review applicant income, employer credentials, background screening, and approve or reject applications.
                </p>
              </div>

              {pendingApps.length > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{pendingApps.length} applications awaiting decision</span>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                  placeholder="Search applicants, properties, email..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="all">All Applications ({myApplications.length})</option>
                  <option value="pending">Pending ({pendingApps.length})</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-3">Applied Property</th>
                    <th className="py-3 px-3">Occupation & Income</th>
                    <th className="py-3 px-3">Move-In</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Review Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No applications found for current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{app.applicantName}</div>
                          <div className="text-[11px] text-slate-500">{app.applicantEmail}</div>
                          <div className="text-[11px] font-mono text-slate-400">{app.applicantPhone}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{app.propertyTitle}</div>
                          <div className="font-mono text-emerald-800 text-[11px] font-bold">
                            ₹{formatINR(app.monthlyRent)}/mo
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{app.occupation}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Monthly: ₹{formatINR(app.monthlyIncome)} · Credit: {app.creditScore}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {app.moveInDate}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${
                              app.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : app.status === 'under_review'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setReviewingApp(app);
                                setAppNotes(app.notes || '');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                              Review & Decide
                            </button>
                            <button
                              onClick={() => onOpenMessages(app.applicantId, app.propertyTitle)}
                              className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                              title="Message applicant"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LISTING ANALYTICS (Graphs and reports showing performance metrics) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>Listing Analytics & Tenant Interaction Metrics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Property view frequency, inquiry conversion rates, and tenancy revenue performance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property View Count Bar Chart */}
            <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Listing Discovery Views (Past 30 Days)
                  </h3>
                  <p className="text-[11px] text-slate-500">Impressions across APNA GHAR search portal</p>
                </div>
                <span className="text-xs font-bold font-mono text-amber-800">
                  {myProperties.reduce((s, p) => s + (p.viewsCount || 45), 0)} Total Views
                </span>
              </div>

              {/* Bar visualization */}
              <div className="pt-4 space-y-3">
                {myProperties.map((p, idx) => {
                  const views = p.viewsCount || Math.floor(120 + idx * 45);
                  const maxViews = 300;
                  const pct = Math.min(100, Math.round((views / maxViews) * 100));

                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[280px]">{p.title}</span>
                        <span className="font-mono text-slate-600 font-bold">{views} views</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inquiries & Occupancy Summary Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Tenant Interaction Metrics
              </h3>

              <div className="space-y-4 pt-2">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <div className="text-[11px] text-amber-800 font-semibold uppercase">Application Conversion</div>
                  <div className="text-2xl font-black font-mono text-amber-950 mt-1">18.4%</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Views converted into submitted applications</div>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                  <div className="text-[11px] text-indigo-800 font-semibold uppercase">Average Response Time</div>
                  <div className="text-2xl font-black font-mono text-indigo-950 mt-1">&lt; 2.5 hrs</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5">To tenant inquiries and maintenance requests</div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <div className="text-[11px] text-emerald-800 font-semibold uppercase">On-Time Rent Collection</div>
                  <div className="text-2xl font-black font-mono text-emerald-950 mt-1">98.2%</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">Processed through UPI & Instant Bank Wire</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPLICATION REVIEW DECISION (Approve/Reject with notes)            */}
      {/* ========================================================================= */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rental Application Review</h3>
                <p className="text-xs text-slate-500">Applicant: {reviewingApp.applicantName}</p>
              </div>
              <button
                onClick={() => setReviewingApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">{reviewingApp.propertyTitle}</div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Employer: <strong>{reviewingApp.employer}</strong></div>
                <div>Monthly Income: <strong>₹{formatINR(reviewingApp.monthlyIncome)}</strong></div>
                <div>Requested Move-In: <strong>{reviewingApp.moveInDate}</strong></div>
                <div>Occupants: <strong>{reviewingApp.occupantsCount}</strong></div>
                <div>Credit Score: <strong className="text-emerald-700">{reviewingApp.creditScore}</strong></div>
                <div>Pets: <strong>{reviewingApp.pets || 'None'}</strong></div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Manager Notes / Decision Comments (Optional)
              </label>
              <textarea
                rows={3}
                value={appNotes}
                onChange={e => setAppNotes(e.target.value)}
                placeholder="Add condition, verification remarks, or move-in instructions..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => handleProcessApplication('under_review')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
              >
                Mark Under Review
              </button>
              <button
                onClick={() => handleProcessApplication('rejected')}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md cursor-pointer"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleProcessApplication('approved')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Issue Lease Agreement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE PROPERTY CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Property Listing?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{propertyToDelete.title}"</strong> from your listings portfolio?
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProperty}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs cursor-pointer"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
