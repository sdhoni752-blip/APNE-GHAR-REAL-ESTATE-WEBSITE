import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { Property, LeaseAgreement, RentalApplication, RentalHistoryItem } from '../../types';
import { PropertyCard } from '../property/PropertyCard';
import { formatINR } from '../../utils/format';
import {
  Home,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Wrench,
  FileText,
  FileCheck,
  CreditCard,
  Building,
  Plus,
  MessageSquare,
  ArrowRight,
  Printer,
  Bell,
  User,
  History,
  Check,
  XCircle,
  AlertTriangle,
  Sparkles,
  Edit,
  Trash2,
  Sliders,
  Briefcase,
  DollarSign,
  Lock,
  KeyRound
} from 'lucide-react';

interface TenantDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectProperty: (property: Property) => void;
  onApplyProperty: (property: Property) => void;
  onOpenLease: (lease: LeaseAgreement) => void;
  onOpenPayRent: (lease: LeaseAgreement) => void;
  onOpenSubmitMaintenance: () => void;
  onOpenMessages: (recipientId?: string, propertyTitle?: string) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  activeTab,
  setActiveTab,
  onSelectProperty,
  onApplyProperty,
  onOpenLease,
  onOpenPayRent,
  onOpenSubmitMaintenance,
  onOpenMessages
}) => {
  const {
    currentUser,
    properties,
    leases,
    maintenance,
    payments,
    applications,
    notifications,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthMode,
    signLease,
    updateUserProfile,
    addRentalHistory,
    deleteRentalHistory,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useRealEstate();

  // Confirmation banner state for Tenant feedback requirements
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
      showConfirmation(`Access Denied: You must be signed in as a Tenant to ${actionDescription}.`, 'error');
      return false;
    }
    return true;
  };

  // Active lease for current tenant
  const myLeases = leases.filter(
    l => l.tenantId === currentUser.id || l.tenantEmail === currentUser.email
  );
  const activeLease = myLeases.find(l => l.status === 'active') || myLeases[0];

  // Tenant's submitted applications
  const myApplications = applications.filter(
    a => a.applicantId === currentUser.id || a.applicantEmail === currentUser.email
  );

  // Tenant's notifications
  const myNotifications = notifications.filter(
    n => n.userId === currentUser.id || n.userId === 'tenant-broadcast'
  );
  const unreadNotificationsCount = myNotifications.filter(n => !n.read).length;

  // Filter states for Property Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minBeds, setMinBeds] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(250000);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileCity, setProfileCity] = useState(currentUser.city || 'Mumbai');
  const [profileOccupation, setProfileOccupation] = useState(currentUser.occupation || '');
  const [profileIncome, setProfileIncome] = useState(currentUser.monthlyIncome?.toString() || '');

  // Add Rental History Modal states
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [prevAddress, setPrevAddress] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [prevMonthlyRent, setPrevMonthlyRent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter available properties
  const availableProperties = properties.filter(p => {
    // Show available properties or all for discovery
    const matchesAvailability = p.status === 'available' || p.status === 'rented';
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || p.type.toLowerCase() === selectedType.toLowerCase();
    const matchesCity = selectedCity === 'all' || p.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesBeds = minBeds === 0 || p.bedrooms >= minBeds;
    const matchesPrice = p.price <= maxPrice;
    return matchesAvailability && matchesSearch && matchesType && matchesCity && matchesBeds && matchesPrice;
  });

  // Unique cities from properties
  const cities = Array.from(new Set(properties.map(p => p.city)));

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth('save personal profile modifications')) return;
    const res = updateUserProfile(currentUser.id, {
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
      city: profileCity.trim(),
      occupation: profileOccupation.trim() || undefined,
      monthlyIncome: Number(profileIncome) || undefined,
    });
    setIsEditingProfile(false);
    showConfirmation(res.message);
  };

  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth('add rental history to profile')) return;
    if (!prevAddress.trim() || !landlordName.trim()) return;

    addRentalHistory(currentUser.id, {
      previousAddress: prevAddress.trim(),
      landlordName: landlordName.trim(),
      landlordPhone: landlordPhone.trim() || undefined,
      durationMonths: Number(durationMonths) || 12,
      monthlyRent: Number(prevMonthlyRent) || 50000,
      startDate: startDate || '2023-01-01',
      endDate: endDate || '2024-01-01',
    });

    setPrevAddress('');
    setLandlordName('');
    setLandlordPhone('');
    setPrevMonthlyRent('');
    setShowAddHistoryModal(false);
    showConfirmation('Rental history entry added to your personal profile successfully.');
  };

  const handleDeleteHistory = (itemId: string) => {
    if (!guardAuth('remove rental history from profile')) return;
    deleteRentalHistory(currentUser.id, itemId);
    showConfirmation('Rental history entry removed from profile.');
  };

  const handleSignLease = (leaseId: string) => {
    if (!guardAuth('sign tenancy agreements')) return;
    const res = signLease(leaseId, 'tenant');
    showConfirmation(res.message);
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
                <span>Protected Tenant Mode · Authentication Required</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Without logging in, you cannot submit rental applications, sign lease agreements, pay rent, or update your profile and rental history.
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
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 uppercase tracking-wide">
              Tenant Portal
            </span>
            <span className="text-xs text-slate-500">Welcome, {currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Search Homes, Manage Tenancy & Personal Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified Indian rental properties, track rental applications, manage digital agreements, update profile & rental history, and review alerts.
          </p>
        </div>

        {/* 5 Primary Navigation Tabs as explicitly requested */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs self-start lg:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'browse' ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>1. Property Search</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications' ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Application Management ({myApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mylease')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mylease' ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Agreement Management</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>4. Profile Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notifications' ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>5. Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Tenancy Quick Banner if tenant has an active lease */}
      {activeLease && activeTab !== 'mylease' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activeLease.propertyImage}
              alt={activeLease.propertyTitle}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-emerald-200"
            />
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-emerald-900">Current Residence (Lease #{activeLease.id})</span>
                <span className="text-emerald-700">•</span>
                <span className="text-emerald-700 capitalize font-medium">{activeLease.status}</span>
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{activeLease.propertyTitle}</div>
              <div className="text-xs text-slate-600 font-mono">
                Monthly Rent: <strong className="text-slate-900">₹{formatINR(activeLease.monthlyRent)}</strong> · Due: {activeLease.nextRentDue}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onOpenPayRent(activeLease)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Rent</span>
            </button>
            <button
              onClick={() => onOpenLease(activeLease)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Contract
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PROPERTY SEARCH (Interface for searching & filtering properties)   */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Property Search & Discovery Filters</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {availableProperties.length} Homes Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search input */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search city, neighborhood, society name..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* City filter */}
              <div>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="all">All Cities ({cities.length})</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartments</option>
                  <option value="house">Houses & Bungalows</option>
                  <option value="condo">Condos</option>
                  <option value="townhome">Townhomes</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <select
                  value={minBeds}
                  onChange={e => setMinBeds(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value={0}>Any BHK</option>
                  <option value={1}>1+ BHK</option>
                  <option value={2}>2+ BHK</option>
                  <option value={3}>3+ BHK</option>
                  <option value={4}>4+ BHK</option>
                </select>
              </div>
            </div>

            {/* Price Slider */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <span className="font-semibold text-slate-700 shrink-0">Max Budget:</span>
                <input
                  type="range"
                  min="30000"
                  max="250000"
                  step="5000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="font-mono font-bold text-emerald-800 shrink-0">
                  ₹{formatINR(maxPrice)}/mo
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('all');
                    setSelectedType('all');
                    setMinBeds(0);
                    setMaxPrice(250000);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {availableProperties.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
              <Building className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No properties match your filter criteria</div>
              <p className="text-xs text-slate-500">Try adjusting your budget or selecting a different city.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={onSelectProperty}
                  onApply={onApplyProperty}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLICATION MANAGEMENT (Managing & tracking status of applications) */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Rental Application Management & Tracking</span>
            </h2>
            <p className="text-xs text-slate-500">
              Track real-time decision status, landlord screening, and verified tenancy approvals.
            </p>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No active rental applications</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore available properties in the Property Search tab and submit an application to begin your tenancy!
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myApplications.map(app => (
                <div
                  key={app.id}
                  className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={app.propertyImage}
                      alt={app.propertyTitle}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-indigo-700">App Ref #{app.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">Submitted {app.submittedAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{app.propertyTitle}</h3>
                      <div className="text-xs text-slate-500">{app.propertyAddress}</div>
                      <div className="text-xs text-slate-700 flex flex-wrap items-center gap-4 pt-1">
                        <span>Rent: <strong className="font-mono text-slate-900">₹{formatINR(app.monthlyRent)}/mo</strong></span>
                        <span>Move-in Date: <strong className="font-mono text-slate-900">{app.moveInDate}</strong></span>
                        <span>Occupants: <strong className="text-slate-900">{app.occupantsCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2.5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold capitalize ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : app.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : app.status === 'under_review'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>

                    {app.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 max-w-sm">
                        <strong>Manager note:</strong> {app.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      {app.status === 'approved' && (
                        <button
                          onClick={() => setActiveTab('mylease')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View & Sign Agreement</span>
                        </button>
                      )}
                      <button
                        onClick={() => onOpenMessages(app.managerId, app.propertyTitle)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message Manager</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AGREEMENT MANAGEMENT (Viewing & managing rental agreements)        */}
      {/* ========================================================================= */}
      {activeTab === 'mylease' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Rental Agreement & Tenancy Ledger Management</span>
            </h2>
            <p className="text-xs text-slate-500">
              View your registered Model Tenancy Act contracts, e-sign agreements, track monthly rent due dates, and inspect payment receipts.
            </p>
          </div>

          {myLeases.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No registered rental agreements found</div>
              <p className="text-xs text-slate-500">
                Agreements are automatically generated once a property manager approves your rental application.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myLeases.map(lease => (
                <div key={lease.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-5">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-start gap-4">
                      <img
                        src={lease.propertyImage}
                        alt={lease.propertyTitle}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-indigo-700">Agreement #{lease.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`font-semibold capitalize ${lease.status === 'active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {lease.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{lease.propertyTitle}</h3>
                        <div className="text-xs text-slate-500">{lease.propertyAddress}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onOpenLease(lease)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Inspect Full Agreement</span>
                      </button>

                      {lease.status === 'active' && (
                        <button
                          onClick={() => onOpenPayRent(lease)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Monthly Rent</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial & Signature Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-500">Monthly Rent</div>
                      <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                        ₹{formatINR(lease.monthlyRent)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Due: {lease.nextRentDue}</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-500">Security Deposit</div>
                      <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                        ₹{formatINR(lease.securityDeposit)}
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Refundable on vacating</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-500">Tenancy Period</div>
                      <div className="font-semibold text-slate-900 mt-1 font-mono text-[11px]">
                        {lease.startDate}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">to {lease.endDate}</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-500">Your E-Signature</div>
                      {lease.signedByTenant ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1 mt-1 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>E-Signed ({lease.signedByTenantAt || 'Verified'})</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignLease(lease.id)}
                          className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                          E-Sign Agreement Now
                        </button>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5">Manager: {lease.signedByManager ? 'Signed' : 'Pending'}</div>
                    </div>
                  </div>

                  {/* Standard Clauses Preview */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                      Key Tenancy Terms (Model Tenancy Act)
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                      {lease.clauses.map((clause, idx) => (
                        <li key={idx}>{clause}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROFILE OVERVIEW (Personal profile details, rental history, & stats)*/}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Personal Profile & Verified Rental History</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage your personal credentials, contact details, employer background, and prior rental track record.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Profile Details Form */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-base flex items-center justify-center">
                    {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
                    <div className="text-xs text-slate-500">{currentUser.email} · {currentUser.city || 'India'}</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Current City</label>
                      <input
                        type="text"
                        value={profileCity}
                        onChange={e => setProfileCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation / Employer</label>
                      <input
                        type="text"
                        value={profileOccupation}
                        onChange={e => setProfileOccupation(e.target.value)}
                        placeholder="e.g. Senior Software Architect"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Gross Income (₹)</label>
                      <input
                        type="number"
                        value={profileIncome}
                        onChange={e => setProfileIncome(e.target.value)}
                        placeholder="e.g. 150000"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Contact Phone</span>
                    <div className="font-mono font-semibold text-slate-900 mt-0.5">{currentUser.phone || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">City / Location</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{currentUser.city || 'India'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Occupation</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{currentUser.occupation || currentUser.company || 'Professional'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Monthly Income</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {currentUser.monthlyIncome ? `₹${formatINR(currentUser.monthlyIncome)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Member Since</span>
                    <div className="font-mono text-slate-900 mt-0.5">{currentUser.createdAt}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Account Status</span>
                    <div className="text-emerald-700 font-bold capitalize mt-0.5">{currentUser.status}</div>
                  </div>
                </div>
              )}

              {/* Rental History Sub-section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>Past Rental History & Landlord References</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Documented past tenancies help accelerate application approvals</p>
                  </div>

                  <button
                    onClick={() => setShowAddHistoryModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Past Tenancy</span>
                  </button>
                </div>

                {(!currentUser.rentalHistory || currentUser.rentalHistory.length === 0) ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No rental history entries recorded yet. Click "+ Add Past Tenancy" to build your tenant credentials.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentUser.rentalHistory.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900">{item.previousAddress}</div>
                          <div className="text-slate-600">
                            Landlord: <strong>{item.landlordName}</strong> {item.landlordPhone && `(${item.landlordPhone})`}
                          </div>
                          <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                            <span>Duration: {item.durationMonths} Months</span>
                            <span>•</span>
                            <span>Rent: ₹{formatINR(item.monthlyRent)}/mo</span>
                            <span>•</span>
                            <span className="font-mono">{item.startDate} to {item.endDate}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Remove entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Summary Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Application & Lease Summary
                </h4>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Active Leases:</span>
                    <span className="font-mono font-bold text-slate-900">{myLeases.filter(l => l.status === 'active').length}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Submitted Applications:</span>
                    <span className="font-mono font-bold text-slate-900">{myApplications.length}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Approved Applications:</span>
                    <span className="font-mono font-bold text-emerald-700">{myApplications.filter(a => a.status === 'approved').length}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Pending Reviews:</span>
                    <span className="font-mono font-bold text-amber-700">{myApplications.filter(a => a.status === 'pending').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NOTIFICATIONS (Panel for viewing updates related to apps & search)  */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Tenant Activity & Search Notifications</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time alerts regarding application approvals, new property matches, lease signatures, and rent payment reminders.
              </p>
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                onClick={() => {
                  markAllNotificationsAsRead(currentUser.id);
                  showConfirmation('All notifications marked as read.');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              >
                Mark All Read
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
            {myNotifications.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No notifications to display at this time.
              </div>
            ) : (
              myNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 transition-colors flex items-start gap-3 text-xs cursor-pointer ${
                    notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'application'
                        ? 'bg-purple-100 text-purple-700'
                        : notif.type === 'search'
                        ? 'bg-amber-100 text-amber-700'
                        : notif.type === 'payment'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{notif.title}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                          {notif.type}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{notif.timestamp}</span>
                    </div>

                    <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD RENTAL HISTORY ENTRY                                           */}
      {/* ========================================================================= */}
      {showAddHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Add Past Tenancy Record</span>
              </h3>
              <button
                onClick={() => setShowAddHistoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHistory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Address *</label>
                <input
                  type="text"
                  required
                  value={prevAddress}
                  onChange={e => setPrevAddress(e.target.value)}
                  placeholder="e.g. Flat 301, Raheja Residency, Koramangala, Bengaluru"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Landlord Name *</label>
                  <input
                    type="text"
                    required
                    value={landlordName}
                    onChange={e => setLandlordName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Landlord Contact</label>
                  <input
                    type="text"
                    value={landlordPhone}
                    onChange={e => setLandlordPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent Paid (₹)</label>
                  <input
                    type="number"
                    required
                    value={prevMonthlyRent}
                    onChange={e => setPrevMonthlyRent(e.target.value)}
                    placeholder="e.g. 60000"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tenancy Months</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={durationMonths}
                    onChange={e => setDurationMonths(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
