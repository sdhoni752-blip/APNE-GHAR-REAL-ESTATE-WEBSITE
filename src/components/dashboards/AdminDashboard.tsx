import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { User, Property, UserRole } from '../../types';
import { formatINR } from '../../utils/format';
import {
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Settings,
  Activity,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileCheck,
  Trash2,
  Edit,
  RefreshCw,
  Check,
  Clock,
  Eye,
  Sliders,
  BarChart3,
  Mail,
  UserCheck,
  Lock,
  KeyRound
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectProperty: (property: Property) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  setActiveTab,
  onSelectProperty
}) => {
  const {
    currentUser,
    properties,
    users,
    leases,
    applications,
    maintenance,
    auditLogs,
    settings,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthMode,
    approvePropertyListing,
    rejectPropertyListing,
    toggleFeaturedProperty,
    updateUserStatus,
    updateUserRole,
    addUser,
    updateUser,
    deleteUser,
    updateSettings
  } = useRealEstate();

  // Confirmation banner state for Admin feedback requirements
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
      showConfirmation(`Access Denied: You must be signed in as an Administrator to ${actionDescription}.`, 'error');
      return false;
    }
    return true;
  };

  // User Management state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('manager');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserCity, setNewUserCity] = useState('Mumbai');

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('tenant');
  const [editCompany, setEditCompany] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');

  // Property Listing Management state
  const [propSearch, setPropSearch] = useState('');
  const [propStatusFilter, setPropStatusFilter] = useState<string>('all');

  // Settings form state
  const [commissionRate, setCommissionRate] = useState(settings.platformCommissionRate.toString());
  const [autoApprove, setAutoApprove] = useState(settings.autoApproveListings);
  const [requireId, setRequireId] = useState(settings.requireIdentityVerification);
  const [onlineSignatures, setOnlineSignatures] = useState(settings.allowOnlineSignatures);
  const [gracePeriod, setGracePeriod] = useState(settings.defaultGracePeriodDays.toString());
  const [notificationEmail, setNotificationEmail] = useState(settings.systemNotificationEmail);

  // Activity Monitoring state
  const [activitySearch, setActivitySearch] = useState('');
  const [activityRoleFilter, setActivityRoleFilter] = useState<string>('all');

  // Computed metrics
  const totalVolume = properties
    .filter(p => p.status === 'rented')
    .reduce((sum, p) => sum + p.price, 0);

  const pendingApprovals = properties.filter(p => p.status === 'pending_approval');
  const availableProperties = properties.filter(p => p.status === 'available');
  const rentedProperties = properties.filter(p => p.status === 'rented');
  const activeLeaseCount = leases.filter(l => l.status === 'active').length;

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (user.city && user.city.toLowerCase().includes(userSearch.toLowerCase())) ||
      (user.company && user.company.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Properties for Admin Listing Management
  const filteredProperties = properties.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.address.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.managerName.toLowerCase().includes(propSearch.toLowerCase());
    const matchesStatus = propStatusFilter === 'all' || p.status === propStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Audit Logs for Activity Monitoring
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.details.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesRole = activityRoleFilter === 'all' || log.actorRole === activityRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth('create new user accounts')) return;
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const res = addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+91 98000 00000',
      role: newUserRole,
      city: newUserCity,
      company: newUserCompany.trim() || undefined,
      avatar: newUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      status: 'active',
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserCompany('');
    setShowAddUserModal(false);
    showConfirmation(res.message);
  };

  const handleOpenEditUser = (user: User) => {
    if (!guardAuth('edit user account details')) return;
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditCompany(user.company || '');
    setEditCity(user.city || 'Mumbai');
    setEditStatus(user.status);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth('save user modifications')) return;
    if (!editingUser) return;

    const res = updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      role: editRole,
      company: editCompany.trim() || undefined,
      city: editCity.trim(),
      status: editStatus,
      avatar: editName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    });

    setEditingUser(null);
    showConfirmation(res.message);
  };

  const handleConfirmDeleteUser = () => {
    if (!guardAuth('delete user accounts')) return;
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    setUserToDelete(null);
    if (res.success) {
      showConfirmation(res.message, 'success');
    } else {
      showConfirmation(res.message, 'error');
    }
  };

  const handleApproveListing = (propertyId: string) => {
    if (!guardAuth('approve property listings')) return;
    const res = approvePropertyListing(propertyId);
    showConfirmation(res.message, 'success');
  };

  const handleRejectListing = (propertyId: string) => {
    if (!guardAuth('reject property listings')) return;
    const res = rejectPropertyListing(propertyId);
    showConfirmation(res.message, 'info');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth('update system settings')) return;
    const res = updateSettings({
      platformCommissionRate: Number(commissionRate) || 0,
      autoApproveListings: autoApprove,
      requireIdentityVerification: requireId,
      allowOnlineSignatures: onlineSignatures,
      defaultGracePeriodDays: Number(gracePeriod) || 5,
      systemNotificationEmail: notificationEmail.trim() || 'compliance@apnaghar.in'
    });
    showConfirmation(res.message, 'success');
  };

  // Performance Report Aggregates
  const managerCounts = users.filter(u => u.role === 'manager').length;
  const tenantCounts = users.filter(u => u.role === 'tenant').length;
  const adminCounts = users.filter(u => u.role === 'admin').length;
  const platformRevenue = Math.round(totalVolume * (settings.platformCommissionRate / 100));

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
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {confirmationBanner.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {confirmationBanner.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {confirmationBanner.type === 'info' && <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0" />}
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
                <span>Protected Admin Mode · Authentication Required</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Without logging in, you cannot add, edit, or delete user accounts, approve or reject listings, or change system settings.
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
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
              Administrator Portal
            </span>
            <span className="text-xs text-slate-500">System Admin: {currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            System Administration & Platform Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage user accounts, review and approve property listings, tune system settings, monitor live audit trails, and inspect performance analytics.
          </p>
        </div>

        {/* 5 Primary Navigation Tabs as explicitly requested */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs self-start lg:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-purple-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'properties' ? 'bg-white text-purple-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2. Property Listings</span>
            {pendingApprovals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-white text-purple-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>3. System Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-white text-purple-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. Activity Monitoring</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-purple-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>5. Performance Reports</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Registered Accounts</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            {users.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-purple-700 font-semibold">{managerCounts} Managers</span> · <span>{tenantCounts} Tenants</span> · <span>{adminCounts} Admin</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Property Inventory</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            {properties.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-semibold">{availableProperties.length} active</span> ·{' '}
            <span className="text-amber-600 font-semibold">{pendingApprovals.length} pending review</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Rent Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            ₹{formatINR(totalVolume)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Fee ({settings.platformCommissionRate}%): <strong className="font-mono text-emerald-800">₹{formatINR(platformRevenue)}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Registered Leases</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
            {activeLeaseCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {applications.length} total applications processed
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USER MANAGEMENT (Table listing accounts with edit & delete options) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>User Account Management</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input user details to create, edit roles, suspend, or delete accounts with immediate confirmation.
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New User</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, city, company..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="admin">Administrators ({adminCounts})</option>
                  <option value="manager">Property Managers ({managerCounts})</option>
                  <option value="tenant">Tenants ({tenantCounts})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">City / Org</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No users match the search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-xs">
                              {user.avatar || user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.id === currentUser.id && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-semibold">You</span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px] truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold capitalize text-[11px] ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'manager'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {user.phone || '—'}
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          <div className="font-medium text-slate-900">{user.city || 'India'}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{user.company || 'Individual'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              const newStatus = user.status === 'active' ? 'suspended' : 'active';
                              updateUserStatus(user.id, newStatus);
                              showConfirmation(`Account status for ${user.name} set to ${newStatus}.`);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {user.status === 'active' ? '● Active' : '✕ Suspended'}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {user.createdAt}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(user)}
                              disabled={user.id === currentUser.id}
                              className={`p-1.5 rounded-md transition-colors ${
                                user.id === currentUser.id
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                              }`}
                              title={user.id === currentUser.id ? 'Cannot delete current session' : 'Delete user account'}
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
      {/* TAB 2: PROPERTY LISTING MANAGEMENT (Approve or reject property listings) */}
      {/* ========================================================================= */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Property Listing Management & Approvals</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approve or reject property listings submitted by property managers to maintain portal quality.
                </p>
              </div>

              {pendingApprovals.length > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{pendingApprovals.length} listings awaiting your approval</span>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={propSearch}
                  onChange={e => setPropSearch(e.target.value)}
                  placeholder="Search property title, city, manager name..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={propStatusFilter}
                  onChange={e => setPropStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">All Statuses ({properties.length})</option>
                  <option value="pending_approval">Pending Approval ({pendingApprovals.length})</option>
                  <option value="available">Approved / Available ({availableProperties.length})</option>
                  <option value="rented">Leased / Rented ({rentedProperties.length})</option>
                  <option value="maintenance">Maintenance / Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Listings Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-3">Location & Type</th>
                    <th className="py-3 px-3">Property Manager</th>
                    <th className="py-3 px-3 text-right">Rent / Mo</th>
                    <th className="py-3 px-3">Approval Status</th>
                    <th className="py-3 px-4 text-right">Administrative Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No property listings match the specified filter.
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
                              className="w-12 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0 max-w-[240px]">
                              <div className="font-bold text-slate-900 truncate">{property.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">{property.address}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{property.city}, {property.state}</div>
                          <div className="text-[11px] text-slate-500">{property.bedrooms} BHK · {property.type}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{property.managerName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{property.managerEmail}</div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{formatINR(property.price)}
                        </td>

                        <td className="py-3 px-3">
                          {property.status === 'pending_approval' && (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                              <span>Pending Review</span>
                            </span>
                          )}
                          {property.status === 'available' && (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Approved & Active</span>
                            </span>
                          )}
                          {property.status === 'rented' && (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 w-fit">
                              <FileCheck className="w-3 h-3 text-indigo-600" />
                              <span>Occupied / Leased</span>
                            </span>
                          )}
                          {property.status === 'maintenance' && (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected / Maint</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {property.status === 'pending_approval' ? (
                              <>
                                <button
                                  onClick={() => handleApproveListing(property.id)}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer shadow-2xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectListing(property.id)}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  if (property.status === 'available') {
                                    handleRejectListing(property.id);
                                  } else {
                                    handleApproveListing(property.id);
                                  }
                                }}
                                className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              >
                                {property.status === 'available' ? 'Delist' : 'Publish'}
                              </button>
                            )}

                            <button
                              onClick={() => onSelectProperty(property)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="View full listing details"
                            >
                              <Eye className="w-4 h-4" />
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
      {/* TAB 3: SYSTEM SETTINGS (Panel for managing system-wide configurations)     */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span>System-Wide Platform Settings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure global system parameters, brokerage commission rates, compliance workflows, and automated approval rules.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={commissionRate}
                      onChange={e => setCommissionRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    System fee calculated on monthly rent collected via the platform.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Rent Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={gracePeriod}
                    onChange={e => setGracePeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Calendar days allowed past the 1st before late notice triggers.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Compliance & Notification Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={e => setNotificationEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="compliance@apnaghar.in"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Administrative email for system audit alerts, tenant disputes, and RERA notices.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={e => setAutoApprove(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">Auto-Approve Property Listings</div>
                    <div className="text-slate-500">Allow verified property managers to list properties directly without admin manual gatekeeping.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireId}
                    onChange={e => setRequireId(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">Mandate Tenant KYC & Income Screening</div>
                    <div className="text-slate-500">Enforce Aadhaar / PAN and employment documentation on all tenant rental applications.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlineSignatures}
                    onChange={e => setOnlineSignatures(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">Allow Digital e-Signatures (Model Tenancy Act)</div>
                    <div className="text-slate-500">Enable legally binding digital signatures on bilateral lease agreements directly in the browser.</div>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update System Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* Settings Info Card */}
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>Regulatory Compliance</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                APNA GHAR platform operates in alignment with the <strong>Model Tenancy Act, 2021</strong> and State Real Estate Regulatory Authorities (RERA). All updates made here immediately apply to real-time lease drafting and tenant onboarding.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-purple-200/60 space-y-1">
                <div>• Active Commission: <strong className="text-slate-800">{settings.platformCommissionRate}%</strong></div>
                <div>• Auto-Approval: <strong className="text-slate-800">{settings.autoApproveListings ? 'Enabled' : 'Disabled'}</strong></div>
                <div>• Digital Signature: <strong className="text-slate-800">{settings.allowOnlineSignatures ? 'Enforced' : 'Optional'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACTIVITY MONITORING (Real-time updates on system activities)        */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Live System Activity Monitoring</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time audit log tracking user authentication, property listing lifecycle changes, and financial events.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-slate-700">Real-time Stream Active</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  placeholder="Search activity by action, details, actor name..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={activityRoleFilter}
                  onChange={e => setActivityRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="all">All Roles ({auditLogs.length})</option>
                  <option value="admin">Admin Actions</option>
                  <option value="manager">Manager Actions</option>
                  <option value="tenant">Tenant Actions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No system activity matches the current query.
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3 text-xs">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      log.actorRole === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : log.actorRole === 'manager'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {log.actorRole[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            log.actorRole === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : log.actorRole === 'manager'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {log.actorRole}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-600 font-medium">{log.actorName}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
                    </div>

                    <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PERFORMANCE REPORTS (Graphs and tables displaying metrics & summary)*/}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Platform Performance Analytics & User Activity Summaries</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive system conversion metrics, monthly rent volume trajectories, and active user engagement summaries.
            </p>
          </div>

          {/* Metric Graphs & Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Rent Volume Bar Chart */}
            <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Rent Volume & Revenue Trajectory (Last 6 Months)
                  </h3>
                  <p className="text-[11px] text-slate-500">Gross rental transactions processed via APNA GHAR</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700">₹{formatINR(totalVolume)} Current</span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="pt-4 grid grid-cols-6 gap-3 items-end h-48 border-b border-slate-100 pb-2">
                {[
                  { month: 'May', amount: 85000, height: '35%' },
                  { month: 'Jun', amount: 120000, height: '48%' },
                  { month: 'Jul', amount: 160000, height: '62%' },
                  { month: 'Aug', amount: 210000, height: '78%' },
                  { month: 'Sep', amount: 285000, height: '90%' },
                  { month: 'Oct', amount: totalVolume || 345000, height: '100%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-500">₹{(item.amount / 1000).toFixed(0)}k</span>
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-md transition-all duration-500 hover:opacity-90"
                    />
                    <span className="text-[11px] font-medium text-slate-700">{item.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Platform Commission ({settings.platformCommissionRate}%): <strong className="text-slate-800">₹{formatINR(platformRevenue)}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +24% YoY Expansion
                </span>
              </div>
            </div>

            {/* Property Status Distribution */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Portfolio Utilization
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-600">Available for Rent</span>
                    <span className="font-mono font-bold text-slate-900">{availableProperties.length} ({Math.round((availableProperties.length / (properties.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.round((availableProperties.length / (properties.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-600">Leased & Occupied</span>
                    <span className="font-mono font-bold text-slate-900">{rentedProperties.length} ({Math.round((rentedProperties.length / (properties.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.round((rentedProperties.length / (properties.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-600">Pending Review</span>
                    <span className="font-mono font-bold text-slate-900">{pendingApprovals.length} ({Math.round((pendingApprovals.length / (properties.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${Math.round((pendingApprovals.length / (properties.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Average Time to Lease:</span>
                  <span className="font-semibold text-slate-800">14 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Application Approval Rate:</span>
                  <span className="font-semibold text-slate-800">78.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Activity Summary Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                User Activity & Engagement Summary
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">{users.length} accounts analyzed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">City</th>
                    <th className="py-3 px-3 text-right">Associated Units</th>
                    <th className="py-3 px-3 text-right">Activity Events</th>
                    <th className="py-3 px-3">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const userLogsCount = auditLogs.filter(l => l.actorName === u.name).length;
                    const propCount = properties.filter(p => p.managerId === u.id).length;
                    const leaseCount = leases.filter(l => l.tenantId === u.id).length;
                    const unitsCount = u.role === 'manager' ? propCount : u.role === 'tenant' ? leaseCount : properties.length;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {u.name}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold capitalize text-[10px] ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'manager'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {u.city || 'India'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {unitsCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-purple-700 font-bold">
                          {userLogsCount || 1}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD USER (With confirmation message for user creation)              */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Create New System User</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="ramesh.chandra@example.in"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="manager">Property Manager</option>
                    <option value="tenant">Tenant / Renter</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newUserCity}
                    onChange={e => setNewUserCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={newUserCompany}
                    onChange={e => setNewUserCompany(e.target.value)}
                    placeholder="e.g. Prestige Estates"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER (With confirmation message for user update)                */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-purple-600" />
                <span>Edit User Account</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Property Manager</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={e => setEditCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION (With confirmation message on deletion)          */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
