import React, { useState } from 'react';
import { RealEstateProvider, useRealEstate } from './context/RealEstateContext';
import { Header } from './components/common/Header';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ManagerDashboard } from './components/dashboards/ManagerDashboard';
import { TenantDashboard } from './components/dashboards/TenantDashboard';
import { PropertyDetailModal } from './components/property/PropertyDetailModal';
import { PropertyListingFormModal } from './components/property/PropertyListingFormModal';
import { RentalApplicationModal } from './components/property/RentalApplicationModal';
import { LeaseAgreementModal } from './components/lease/LeaseAgreementModal';
import { RentPaymentModal } from './components/payment/RentPaymentModal';
import { MaintenanceModal } from './components/maintenance/MaintenanceModal';
import { MessagesModal } from './components/messages/MessagesModal';
import { AuthModal } from './components/auth/AuthModal';
import { Property, LeaseAgreement, MaintenanceRequest, UserRole } from './types';
import {
  ShieldCheck,
  Building2,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';

function MainApp() {
  const {
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setAuthMode,
    login
  } = useRealEstate();

  // Active subtab for current dashboard
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser.role === 'admin') return 'users';
    if (currentUser.role === 'manager') return 'properties';
    return 'browse';
  });

  // Keep active tab valid if role changes
  React.useEffect(() => {
    if (currentUser.role === 'admin' && !['users', 'properties', 'settings', 'activity', 'reports'].includes(activeTab)) {
      setActiveTab('users');
    } else if (currentUser.role === 'manager' && !['properties', 'leases', 'communication', 'applications', 'analytics'].includes(activeTab)) {
      setActiveTab('properties');
    } else if (currentUser.role === 'tenant' && !['browse', 'applications', 'mylease', 'profile', 'notifications'].includes(activeTab)) {
      setActiveTab('browse');
    }
  }, [currentUser.role]);

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [showCreatePropertyModal, setShowCreatePropertyModal] = useState(false);
  const [propertyToApply, setPropertyToApply] = useState<Property | null>(null);
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [leaseToPay, setLeaseToPay] = useState<LeaseAgreement | null>(null);
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<MaintenanceRequest | null>(null);
  const [showSubmitMaintenanceModal, setShowSubmitMaintenanceModal] = useState(false);
  
  // Messaging Modal state
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messageRecipientId, setMessageRecipientId] = useState<string | undefined>(undefined);
  const [messagePropertyTitle, setMessagePropertyTitle] = useState<string | undefined>(undefined);

  const handleOpenMessages = (recipientId?: string, propertyTitle?: string) => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setMessageRecipientId(recipientId);
    setMessagePropertyTitle(propertyTitle);
    setShowMessagesModal(true);
  };

  const handleRequireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  const handleQuickLogin = (email: string, role: UserRole) => {
    login(email, undefined, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openMessages={() => handleOpenMessages()}
      />

      {/* Indian Role Authentication Quick Access Bar */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-200/80 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-orange-900 uppercase tracking-wide">
              Authentication Portal:
            </span>
            <span className="text-slate-600 hidden sm:inline">
              Log in to any Indian stakeholder role with one click:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin: Rajat Yadav */}
            <button
              onClick={() => handleQuickLogin('rajat.yadav@apnaghar.in', 'admin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentUser.role === 'admin' && isAuthenticated
                  ? 'bg-purple-700 text-white ring-2 ring-purple-400'
                  : 'bg-white hover:bg-purple-50 text-purple-800 border border-purple-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Admin: <strong>Rajat Yadav</strong></span>
            </button>

            {/* Manager 1: Dhoni Kumar Singh */}
            <button
              onClick={() => handleQuickLogin('sdhoni752@gmail.com', 'manager')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentUser.name === 'Dhoni Kumar Singh' && isAuthenticated
                  ? 'bg-amber-700 text-white ring-2 ring-amber-400'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Mumbai Manager: <strong>Dhoni Kumar Singh</strong></span>
            </button>

            {/* Manager 2: Vikram Kumar */}
            <button
              onClick={() => handleQuickLogin('vikram.kumar@apnaghar.in', 'manager')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentUser.name === 'Vikram Kumar' && isAuthenticated
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-400'
                  : 'bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Bengaluru Manager: <strong>Vikram Kumar</strong></span>
            </button>

            {/* Tenant 1: Aanya Seth */}
            <button
              onClick={() => handleQuickLogin('aanya.seth@designstudio.in', 'tenant')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentUser.name === 'Aanya Seth' && isAuthenticated
                  ? 'bg-pink-700 text-white ring-2 ring-pink-400'
                  : 'bg-white hover:bg-pink-50 text-pink-900 border border-pink-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Tenant: <strong>Aanya Seth</strong></span>
            </button>

            {/* Tenant 2: Aarav Patel */}
            <button
              onClick={() => handleQuickLogin('aarav.patel@techcorp.in', 'tenant')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentUser.name === 'Aarav Patel' && isAuthenticated
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tenant: <strong>Aarav Patel</strong></span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'admin' && (
          <AdminDashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectProperty={property => setSelectedProperty(property)}
          />
        )}

        {currentUser.role === 'manager' && (
          <ManagerDashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCreateProperty={() => handleRequireAuth(() => setShowCreatePropertyModal(true))}
            onOpenEditProperty={property => handleRequireAuth(() => setPropertyToEdit(property))}
            onSelectProperty={property => setSelectedProperty(property)}
            onOpenLease={lease => setSelectedLease(lease)}
            onOpenMaintenance={request => handleRequireAuth(() => setMaintenanceToEdit(request))}
            onOpenMessages={handleOpenMessages}
          />
        )}

        {currentUser.role === 'tenant' && (
          <TenantDashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectProperty={property => setSelectedProperty(property)}
            onApplyProperty={property => handleRequireAuth(() => setPropertyToApply(property))}
            onOpenLease={lease => setSelectedLease(lease)}
            onOpenPayRent={lease => handleRequireAuth(() => setLeaseToPay(lease))}
            onOpenSubmitMaintenance={() => handleRequireAuth(() => setShowSubmitMaintenanceModal(true))}
            onOpenMessages={handleOpenMessages}
          />
        )}
      </main>

      {/* Footer conforming to domain-native minimal guidelines */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">APNA GHAR (अपना घर)</span>
            <span>· Indian Real Estate Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Model Tenancy Act (MTA) 2021</span>
            <span aria-hidden="true">·</span>
            <span>All amounts in Indian Rupees (₹)</span>
            <span aria-hidden="true">·</span>
            <span>Digital Rent e-Sign</span>
            <span aria-hidden="true">·</span>
            <span>Automated UPI Ledger</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onApply={property => {
            setSelectedProperty(null);
            handleRequireAuth(() => setPropertyToApply(property));
          }}
          onOpenMessages={handleOpenMessages}
        />
      )}

      {(showCreatePropertyModal || propertyToEdit) && (
        <PropertyListingFormModal
          propertyToEdit={propertyToEdit}
          onClose={() => {
            setShowCreatePropertyModal(false);
            setPropertyToEdit(null);
          }}
        />
      )}

      {propertyToApply && (
        <RentalApplicationModal
          property={propertyToApply}
          onClose={() => setPropertyToApply(null)}
          onSuccess={() => {
            setPropertyToApply(null);
            setActiveTab('applications');
          }}
        />
      )}

      {selectedLease && (
        <LeaseAgreementModal
          lease={selectedLease}
          onClose={() => setSelectedLease(null)}
        />
      )}

      {leaseToPay && (
        <RentPaymentModal
          lease={leaseToPay}
          onClose={() => setLeaseToPay(null)}
          onSuccess={() => setLeaseToPay(null)}
        />
      )}

      {(showSubmitMaintenanceModal || maintenanceToEdit) && (
        <MaintenanceModal
          requestToEdit={maintenanceToEdit}
          onClose={() => {
            setShowSubmitMaintenanceModal(false);
            setMaintenanceToEdit(null);
          }}
        />
      )}

      {showMessagesModal && (
        <MessagesModal
          onClose={() => {
            setShowMessagesModal(false);
            setMessageRecipientId(undefined);
            setMessagePropertyTitle(undefined);
          }}
          initialRecipientId={messageRecipientId}
          initialPropertyTitle={messagePropertyTitle}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <RealEstateProvider>
      <MainApp />
    </RealEstateProvider>
  );
}
