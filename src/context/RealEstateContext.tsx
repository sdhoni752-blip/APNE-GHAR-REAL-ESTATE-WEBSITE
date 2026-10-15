import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Property,
  RentalApplication,
  LeaseAgreement,
  MaintenanceRequest,
  PaymentTransaction,
  ChatMessage,
  SystemAuditLog,
  SystemSettings,
  AppNotification,
  RentalHistoryItem,
  LeaseStatus,
  UserRole,
  ApplicationStatus,
  MaintenanceStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_APPLICATIONS,
  INITIAL_LEASES,
  INITIAL_MAINTENANCE,
  INITIAL_PAYMENTS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { formatINR } from '../utils/format';

interface RealEstateContextType {
  currentUser: User;
  users: User[];
  properties: Property[];
  applications: RentalApplication[];
  leases: LeaseAgreement[];
  maintenance: MaintenanceRequest[];
  payments: PaymentTransaction[];
  messages: ChatMessage[];
  auditLogs: SystemAuditLog[];
  settings: SystemSettings;
  notifications: AppNotification[];
  
  // Authentication & Session
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  login: (identifier: string, password?: string, targetRole?: UserRole) => { success: boolean; message?: string };
  registerUser: (data: { name: string; email: string; phone: string; role: UserRole; city?: string; company?: string; password?: string }) => void;
  logout: () => void;
  
  // Role & User Switching
  setCurrentUserById: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  
  // Property Actions
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'viewsCount'>) => { success: boolean; message: string; property: Property };
  updateProperty: (id: string, updates: Partial<Property>) => { success: boolean; message: string };
  deleteProperty: (id: string) => { success: boolean; message: string };
  approvePropertyListing: (id: string) => { success: boolean; message: string };
  rejectPropertyListing: (id: string) => { success: boolean; message: string };
  toggleFeaturedProperty: (id: string) => void;
  
  // Applications Actions
  submitApplication: (app: Omit<RentalApplication, 'id' | 'submittedAt' | 'status'>) => { success: boolean; message: string; applicationId: string };
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => { success: boolean; message: string };
  
  // Lease Actions
  createLease: (leaseData: Omit<LeaseAgreement, 'id'>) => { success: boolean; message: string; leaseId: string };
  signLease: (leaseId: string, role: 'manager' | 'tenant') => { success: boolean; message: string };
  updateLeaseStatus: (leaseId: string, status: LeaseStatus) => { success: boolean; message: string };
  
  // Maintenance Actions
  submitMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceStatus,
    contractor?: string,
    scheduledDate?: string,
    resolutionNotes?: string
  ) => void;
  
  // Payment Actions
  processRentPayment: (
    leaseId: string,
    amount: number,
    method: 'UPI (GPay / PhonePe / Paytm)' | 'Net Banking (IMPS / NEFT)' | 'Debit / Credit Card (RuPay/Visa)' | 'Direct RTGS Wire'
  ) => void;
  
  // Messaging Actions
  sendMessage: (receiverId: string, message: string, propertyId?: string, propertyTitle?: string) => { success: boolean; message: string };
  
  // Admin & User Management
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => { success: boolean; message: string; user: User };
  updateUser: (userId: string, updates: Partial<User>) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  updateUserProfile: (userId: string, profileData: Partial<User>) => { success: boolean; message: string };
  addRentalHistory: (userId: string, item: Omit<RentalHistoryItem, 'id'>) => void;
  deleteRentalHistory: (userId: string, itemId: string) => void;

  // System Settings
  updateSettings: (newSettings: Partial<SystemSettings>) => { success: boolean; message: string };

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId?: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  resetAllData: () => void;
}

const RealEstateContext = createContext<RealEstateContextType | undefined>(undefined);

export const RealEstateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe load helper using apnaghar_ namespace
  const load = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`apnaghar_v4_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [users, setUsers] = useState<User[]>(() => {
    const loaded = load<User[] | null>('users', null);
    // Explicitly filter out removed managers Balendra Kumar and Raj Singh
    const isRemovedManager = (u: User) =>
      u.name === 'Balendra Kumar' ||
      u.name === 'Raj Singh' ||
      u.email.includes('balendra') ||
      u.email.includes('raj.singh');

    const cleanInitial = INITIAL_USERS.filter(u => !isRemovedManager(u));
    if (!loaded) return cleanInitial;

    const map = new Map<string, User>();
    cleanInitial.forEach(u => map.set(u.id, u));
    loaded.forEach(u => {
      if (!map.has(u.id) && !isRemovedManager(u)) map.set(u.id, u);
    });
    return Array.from(map.values());
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = load<User | null>('currentUser', null);
    if (savedUser && savedUser.name !== 'Balendra Kumar' && savedUser.name !== 'Raj Singh' && !savedUser.email.includes('balendra') && !savedUser.email.includes('raj.singh')) {
      const match = INITIAL_USERS.find(u => u.id === savedUser.id);
      return match || savedUser;
    }
    // Default to Dhoni Kumar Singh (Property Manager)
    return INITIAL_USERS[1];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => load('auth_status', true));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [properties, setProperties] = useState<Property[]>(() => {
    const loaded = load<Property[] | null>('properties', null);
    if (!loaded) return INITIAL_PROPERTIES;
    const map = new Map<string, Property>();
    INITIAL_PROPERTIES.forEach(p => map.set(p.id, p));
    loaded.forEach(p => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  });
  const [applications, setApplications] = useState<RentalApplication[]>(() => load('applications', INITIAL_APPLICATIONS));
  const [leases, setLeases] = useState<LeaseAgreement[]>(() => load('leases', INITIAL_LEASES));
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(() => load('maintenance', INITIAL_MAINTENANCE));
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => load('payments', INITIAL_PAYMENTS));
  const [messages, setMessages] = useState<ChatMessage[]>(() => load('messages', INITIAL_MESSAGES));
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => load('auditLogs', INITIAL_AUDIT_LOGS));
  const [settings, setSettings] = useState<SystemSettings>(() => load('settings', INITIAL_SETTINGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => load('notifications', INITIAL_NOTIFICATIONS));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('apnaghar_v4_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_auth_status', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_leases', JSON.stringify(leases));
  }, [leases]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('apnaghar_v4_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Helper for audit logs
  const logAction = (action: string, details: string) => {
    const newLog: SystemAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Operations
  const login = (identifier: string, password?: string, targetRole?: UserRole) => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Find matching user by email, phone, or name
    let found = users.find(u =>
      u.email.toLowerCase() === cleanId ||
      u.phone.replace(/[\s()-]/g, '') === cleanId.replace(/[\s()-]/g, '') ||
      u.name.toLowerCase() === cleanId
    );

    // If targetRole specified and no direct match, match first user with that role
    if (!found && targetRole) {
      found = users.find(u => u.role === targetRole);
    }

    if (found) {
      if (found.status === 'suspended') {
        return { success: false, message: 'This account has been temporarily suspended by the administrator.' };
      }
      setCurrentUser(found);
      setIsAuthenticated(true);
      logAction('User Logged In', `${found.name} (${found.role}) authenticated successfully`);
      return { success: true };
    }

    return { success: false, message: 'Invalid credentials. Please check your email/mobile or select a demo profile.' };
  };

  const registerUser = (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    city?: string;
    company?: string;
    password?: string;
  }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      city: data.city || 'Mumbai',
      company: data.company,
      password: data.password || 'apnaghar123',
      avatar: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      assignedPropertiesCount: data.role === 'manager' ? 0 : undefined,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    logAction('User Registered', `${newUser.name} created account with role ${newUser.role}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    logAction('User Logged Out', `${currentUser.name} signed out`);
  };

  // Role switching
  const setCurrentUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const switchRole = (role: UserRole) => {
    const match = users.find(u => u.role === role);
    if (match) {
      setCurrentUser(match);
      setIsAuthenticated(true);
    }
  };

  // Strict Authentication Guard to enforce: "WITHOUT LOGIN NO ONE CAN CHANGE ANYTHING OF DASHBOARD"
  const requireAuth = (actionDescription?: string): boolean => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Notification Actions
  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    if (!requireAuth('update notifications')) return;
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = (userId?: string) => {
    if (!requireAuth('update notifications')) return;
    setNotifications(prev =>
      prev.map(n =>
        !userId || n.userId === userId || n.userId === 'tenant-broadcast'
          ? { ...n, read: true }
          : n
      )
    );
  };

  // Property Actions
  const addProperty = (data: Omit<Property, 'id' | 'createdAt' | 'viewsCount'>) => {
    if (!requireAuth('create property listing')) {
      return { success: false, message: 'Authentication required: You must be logged in to create property listings.' };
    }
    const newProperty: Property = {
      ...data,
      id: `prop-${Date.now()}`,
      status: settings.autoApproveListings ? 'available' : 'pending_approval',
      viewsCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties(prev => [newProperty, ...prev]);
    const statusMsg = settings.autoApproveListings
      ? 'Listing is now live on the public search directory.'
      : 'Listing submitted for administrative approval.';
    logAction('Property Created', `Created property "${newProperty.title}" in ${newProperty.city} (Status: ${newProperty.status})`);

    // Notification for manager
    addNotification({
      userId: newProperty.managerId,
      title: 'Property Listing Created',
      message: `"${newProperty.title}" in ${newProperty.city} has been created. ${statusMsg}`,
      type: 'system',
    });

    return {
      success: true,
      message: `Property listing "${newProperty.title}" created successfully! ${statusMsg}`,
      property: newProperty,
    };
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    if (!requireAuth('update property listing')) {
      return { success: false, message: 'Authentication required: You must be logged in to edit properties.' };
    }
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    const target = properties.find(p => p.id === id);
    logAction('Property Updated', `Updated property details for "${target?.title || id}"`);
    return {
      success: true,
      message: `Property "${target?.title || id}" updated successfully.`
    };
  };

  const deleteProperty = (id: string) => {
    if (!requireAuth('delete property listing')) {
      return { success: false, message: 'Authentication required: You must be logged in to delete properties.' };
    }
    const target = properties.find(p => p.id === id);
    setProperties(prev => prev.filter(p => p.id !== id));
    logAction('Property Removed', `Removed property "${target?.title || id}" from system`);
    return {
      success: true,
      message: `Property "${target?.title || id}" has been deleted successfully.`
    };
  };

  const approvePropertyListing = (id: string) => {
    if (!requireAuth('approve property listing')) {
      return { success: false, message: 'Authentication required: You must be logged in as an administrator.' };
    }
    const target = properties.find(p => p.id === id);
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'available' } : p))
    );
    logAction('Listing Approved', `Approved listing for "${target?.title || id}" - published to Apna Ghar search`);
    if (target) {
      addNotification({
        userId: target.managerId,
        title: 'Listing Approved',
        message: `Your property listing "${target.title}" was approved by administrator.`,
        type: 'system',
      });
      addNotification({
        userId: 'user-tenant-1',
        title: `New Property Listed in ${target.city}`,
        message: `"${target.title}" is now available for rent at ₹${formatINR(target.price)}/mo.`,
        type: 'search',
      });
    }
    return {
      success: true,
      message: `Listing for "${target?.title || 'Property'}" approved and published to search.`
    };
  };

  const rejectPropertyListing = (id: string) => {
    if (!requireAuth('reject property listing')) {
      return { success: false, message: 'Authentication required: You must be logged in as an administrator.' };
    }
    const target = properties.find(p => p.id === id);
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'maintenance' } : p))
    );
    logAction('Listing Rejected', `Rejected listing for "${target?.title || id}"`);
    if (target) {
      addNotification({
        userId: target.managerId,
        title: 'Listing Update Needed',
        message: `Your property listing "${target.title}" was rejected / placed into maintenance by administrator.`,
        type: 'system',
      });
    }
    return {
      success: true,
      message: `Listing for "${target?.title || 'Property'}" rejected.`
    };
  };

  const toggleFeaturedProperty = (id: string) => {
    if (!requireAuth('feature property')) return;
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  // Applications Actions
  const submitApplication = (appData: Omit<RentalApplication, 'id' | 'submittedAt' | 'status'>) => {
    if (!requireAuth('submit rental application')) {
      return { success: false, message: 'Authentication required: You must be logged in as a tenant to submit rental applications.' };
    }
    const newApp: RentalApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setApplications(prev => [newApp, ...prev]);
    logAction('Application Submitted', `${appData.applicantName} submitted application for "${appData.propertyTitle}"`);

    // Notification to manager
    addNotification({
      userId: appData.managerId,
      title: 'New Rental Application',
      message: `${appData.applicantName} submitted an application for "${appData.propertyTitle}".`,
      type: 'application',
    });
    // Notification to tenant
    addNotification({
      userId: appData.applicantId,
      title: 'Application Submitted Successfully',
      message: `Your application for "${appData.propertyTitle}" is currently under review by the property manager.`,
      type: 'application',
    });

    return {
      success: true,
      message: `Rental application submitted successfully! Confirmation ID: ${newApp.id}`,
      applicationId: newApp.id,
    };
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, notes?: string) => {
    if (!requireAuth('update application status')) {
      return { success: false, message: 'Authentication required: You must be logged in as a property manager.' };
    }
    setApplications(prev =>
      prev.map(a => (a.id === id ? { ...a, status, notes: notes || a.notes } : a))
    );
    const target = applications.find(a => a.id === id);
    logAction('Application Processed', `Application for "${target?.propertyTitle}" updated to ${status}`);
    if (target) {
      addNotification({
        userId: target.applicantId,
        title: `Application Status: ${status.toUpperCase().replace('_', ' ')}`,
        message: `Your application for "${target.propertyTitle}" has been updated to "${status}". ${notes ? `Note: ${notes}` : ''}`,
        type: 'application',
      });
    }
    return {
      success: true,
      message: `Application status updated to "${status}".`
    };
  };

  // Lease Actions
  const createLease = (leaseData: Omit<LeaseAgreement, 'id'>) => {
    if (!requireAuth('create lease agreement')) {
      return { success: false, message: 'Authentication required: You must be logged in as a property manager.' };
    }
    const newLease: LeaseAgreement = {
      ...leaseData,
      id: `lease-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setLeases(prev => [newLease, ...prev]);
    if (newLease.status === 'active') {
      updateProperty(newLease.propertyId, { status: 'rented' });
    }
    logAction('Lease Agreement Drafted', `Created registered tenancy agreement for "${newLease.propertyTitle}"`);

    addNotification({
      userId: newLease.tenantId,
      title: 'New Lease Agreement Issued',
      message: `Rental agreement #${newLease.id} for "${newLease.propertyTitle}" has been prepared for signature.`,
      type: 'lease',
    });

    return {
      success: true,
      message: `Rental agreement #${newLease.id} created successfully.`,
      leaseId: newLease.id,
    };
  };

  const signLease = (leaseId: string, role: 'manager' | 'tenant') => {
    if (!requireAuth('sign lease agreement')) {
      return { success: false, message: 'Authentication required: You must be logged in to sign agreements.' };
    }
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let propertyToRent: string | undefined;

    setLeases(prev =>
      prev.map(lease => {
        if (lease.id !== leaseId) return lease;
        const updated = { ...lease };
        if (role === 'manager') {
          updated.signedByManager = true;
          updated.signedByManagerAt = timestamp;
        } else {
          updated.signedByTenant = true;
          updated.signedByTenantAt = timestamp;
        }
        if (updated.signedByManager && updated.signedByTenant) {
          updated.status = 'active';
          propertyToRent = updated.propertyId;
        }
        return updated;
      })
    );

    if (propertyToRent) {
      setProperties(prev =>
        prev.map(p => (p.id === propertyToRent ? { ...p, status: 'rented' } : p))
      );
    }

    logAction('Lease Agreement Signed', `Lease #${leaseId} e-signed by ${role} (${currentUser.name})`);
    return {
      success: true,
      message: `Agreement #${leaseId} e-signed successfully by ${currentUser.name}.`
    };
  };

  const updateLeaseStatus = (leaseId: string, status: LeaseStatus) => {
    if (!requireAuth('update lease status')) {
      return { success: false, message: 'Authentication required: You must be logged in as a property manager.' };
    }
    const target = leases.find(l => l.id === leaseId);
    setLeases(prev =>
      prev.map(l => (l.id === leaseId ? { ...l, status } : l))
    );
    if (target && status === 'terminated') {
      setProperties(prev =>
        prev.map(p => (p.id === target.propertyId ? { ...p, status: 'available' } : p))
      );
    }
    logAction('Lease Status Changed', `Lease #${leaseId} status set to "${status}"`);
    return {
      success: true,
      message: `Agreement #${leaseId} status updated to "${status}".`
    };
  };

  // Maintenance Actions
  const submitMaintenanceRequest = (req: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>) => {
    if (!requireAuth('submit maintenance request')) return;
    const newReq: MaintenanceRequest = {
      ...req,
      id: `maint-${Math.floor(100 + Math.random() * 900)}`,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaintenance(prev => [newReq, ...prev]);
    logAction('Maintenance Requested', `Ticket "${newReq.title}" raised for ${newReq.propertyTitle}`);

    addNotification({
      userId: newReq.managerId,
      title: 'New Maintenance Request Raised',
      message: `${newReq.tenantName} reported "${newReq.title}" for ${newReq.propertyTitle}.`,
      type: 'system',
    });
  };

  const updateMaintenanceStatus = (
    id: string,
    status: MaintenanceStatus,
    contractor?: string,
    scheduledDate?: string,
    resolutionNotes?: string
  ) => {
    if (!requireAuth('update maintenance status')) return;
    setMaintenance(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        return {
          ...m,
          status,
          ...(contractor !== undefined ? { assignedContractor: contractor } : {}),
          ...(scheduledDate !== undefined ? { scheduledDate } : {}),
          ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
        };
      })
    );
    const target = maintenance.find(m => m.id === id);
    logAction('Maintenance Status Updated', `Ticket #${id} set to "${status}"`);
    if (target) {
      addNotification({
        userId: target.tenantId,
        title: `Maintenance Ticket #${id} Status: ${status}`,
        message: `Your maintenance ticket for ${target.propertyTitle} has been updated to "${status}".`,
        type: 'system',
      });
    }
  };

  // Payment Actions
  const processRentPayment = (
    leaseId: string,
    amount: number,
    method: 'UPI (GPay / PhonePe / Paytm)' | 'Net Banking (IMPS / NEFT)' | 'Debit / Credit Card (RuPay/Visa)' | 'Direct RTGS Wire'
  ) => {
    if (!requireAuth('process rent payment')) return;
    const lease = leases.find(l => l.id === leaseId);
    const receiptNum = `REC-IN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      leaseId,
      propertyTitle: lease?.propertyTitle || 'Residential Unit',
      tenantName: currentUser.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      method,
      status: 'completed',
      receiptNumber: receiptNum,
      notes: `Rent payment processed via ${method}`,
    };
    setPayments(prev => [newPayment, ...prev]);
    setLeases(prev =>
      prev.map(l => (l.id === leaseId ? { ...l, paymentStatus: 'paid' } : l))
    );
    logAction('Rent Payment Received', `₹${formatINR(amount)} received from ${currentUser.name} via ${method} (Receipt: ${receiptNum})`);

    if (lease) {
      addNotification({
        userId: lease.managerId,
        title: 'Rent Payment Received',
        message: `₹${formatINR(amount)} received from ${currentUser.name} for ${lease.propertyTitle}.`,
        type: 'payment',
      });
      addNotification({
        userId: currentUser.id,
        title: 'Payment Receipt Issued',
        message: `Rent payment of ₹${formatINR(amount)} confirmed. Receipt #${receiptNum}.`,
        type: 'payment',
      });
    }
  };

  // Messaging Actions
  const sendMessage = (
    receiverId: string,
    messageText: string,
    propertyId?: string,
    propertyTitle?: string
  ) => {
    if (!requireAuth('send message')) {
      return { success: false, message: 'Authentication required: You must be logged in to send messages.' };
    }
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      propertyId,
      propertyTitle,
      message: messageText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMessages(prev => [...prev, newMsg]);
    const receiver = users.find(u => u.id === receiverId);

    // Notification to receiver
    addNotification({
      userId: receiverId,
      title: `Message from ${currentUser.name}`,
      message: `${messageText.substring(0, 75)}${messageText.length > 75 ? '...' : ''}`,
      type: 'system',
    });

    return {
      success: true,
      message: `Message sent successfully to ${receiver?.name || 'recipient'}.`
    };
  };

  // Admin & User Management
  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    if (!requireAuth('update user status')) return;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status } : u)));
    logAction('User Status Changed', `User ID: ${userId} status set to ${status}`);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    if (!requireAuth('update user role')) return;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    logAction('User Role Changed', `User ID: ${userId} role set to ${role}`);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!requireAuth('create user')) {
      return { success: false, message: 'Authentication required: You must be logged in as an administrator to create users.' };
    }
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    logAction('User Registered', `Added user ${newUser.name} with role ${newUser.role}`);
    return {
      success: true,
      message: `User "${newUser.name}" created successfully with role "${newUser.role}".`,
      user: newUser,
    };
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    if (!requireAuth('update user')) {
      return { success: false, message: 'Authentication required: You must be logged in as an administrator to edit users.' };
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    const target = users.find(u => u.id === userId);
    logAction('User Updated', `Updated account information for ${target?.name || userId}`);
    return {
      success: true,
      message: `User account "${target?.name || userId}" updated successfully.`
    };
  };

  const deleteUser = (userId: string) => {
    if (!requireAuth('delete user')) {
      return { success: false, message: 'Authentication required: You must be logged in as an administrator to delete users.' };
    }
    const target = users.find(u => u.id === userId);
    if (userId === currentUser.id) {
      return {
        success: false,
        message: 'Cannot delete current logged-in user account. Please switch users first.'
      };
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    logAction('User Deleted', `Deleted user account "${target?.name || userId}" (${target?.role})`);
    return {
      success: true,
      message: `User account "${target?.name || userId}" deleted successfully.`
    };
  };

  const updateUserProfile = (userId: string, profileData: Partial<User>) => {
    if (!requireAuth('update profile')) {
      return { success: false, message: 'Authentication required: You must be logged in to update profile details.' };
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...profileData } : u)));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...profileData }));
    }
    logAction('Profile Updated', `Updated profile details for user ID: ${userId}`);
    return {
      success: true,
      message: 'Profile information updated successfully.'
    };
  };

  const addRentalHistory = (userId: string, item: Omit<RentalHistoryItem, 'id'>) => {
    if (!requireAuth('add rental history')) return;
    const newItem: RentalHistoryItem = {
      ...item,
      id: `rh-${Date.now()}`
    };
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const history = u.rentalHistory || [];
      return { ...u, rentalHistory: [newItem, ...history] };
    }));
    if (currentUser.id === userId) {
      setCurrentUser(prev => {
        const history = prev.rentalHistory || [];
        return { ...prev, rentalHistory: [newItem, ...history] };
      });
    }
  };

  const deleteRentalHistory = (userId: string, itemId: string) => {
    if (!requireAuth('delete rental history')) return;
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const history = (u.rentalHistory || []).filter(h => h.id !== itemId);
      return { ...u, rentalHistory: history };
    }));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        rentalHistory: (prev.rentalHistory || []).filter(h => h.id !== itemId)
      }));
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    if (!requireAuth('update settings')) {
      return { success: false, message: 'Authentication required: You must be logged in as an administrator to change system settings.' };
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAction('Settings Updated', 'Platform settings updated');
    return {
      success: true,
      message: 'Platform system configuration updated successfully.'
    };
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[1]);
    setIsAuthenticated(true);
    setProperties(INITIAL_PROPERTIES);
    setApplications(INITIAL_APPLICATIONS);
    setLeases(INITIAL_LEASES);
    setMaintenance(INITIAL_MAINTENANCE);
    setPayments(INITIAL_PAYMENTS);
    setMessages(INITIAL_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <RealEstateContext.Provider
      value={{
        currentUser,
        users,
        properties,
        applications,
        leases,
        maintenance,
        payments,
        messages,
        auditLogs,
        settings,
        notifications,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        registerUser,
        logout,
        setCurrentUserById,
        switchRole,
        addProperty,
        updateProperty,
        deleteProperty,
        approvePropertyListing,
        rejectPropertyListing,
        toggleFeaturedProperty,
        submitApplication,
        updateApplicationStatus,
        createLease,
        signLease,
        updateLeaseStatus,
        submitMaintenanceRequest,
        updateMaintenanceStatus,
        processRentPayment,
        sendMessage,
        updateUserStatus,
        updateUserRole,
        addUser,
        updateUser,
        deleteUser,
        updateUserProfile,
        addRentalHistory,
        deleteRentalHistory,
        updateSettings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        resetAllData,
      }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};

export const useRealEstate = () => {
  const context = useContext(RealEstateContext);
  if (!context) {
    throw new Error('useRealEstate must be used within a RealEstateProvider');
  }
  return context;
};
