export type UserRole = 'admin' | 'manager' | 'tenant';

export interface RentalHistoryItem {
  id: string;
  previousAddress: string;
  landlordName: string;
  landlordPhone?: string;
  durationMonths: number;
  monthlyRent: number;
  startDate: string;
  endDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  company?: string;
  city?: string;
  occupation?: string;
  monthlyIncome?: number;
  rentalHistory?: RentalHistoryItem[];
  password?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  assignedPropertiesCount?: number;
}

export interface AppNotification {
  id: string;
  userId: string; // target user id or 'tenant-broadcast'
  title: string;
  message: string;
  type: 'application' | 'search' | 'lease' | 'payment' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type PropertyType = 'Apartment' | 'House' | 'Condo' | 'Townhome' | 'Studio';
export type PropertyStatus = 'available' | 'rented' | 'pending_approval' | 'maintenance';

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: PropertyType;
  status: PropertyStatus;
  featured: boolean;
  image: string;
  additionalImages?: string[];
  description: string;
  amenities: string[];
  managerId: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  yearBuilt: number;
  petPolicy: string;
  parking: string;
  availableFrom: string;
  viewsCount: number;
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface RentalApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  monthlyRent: number;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  employer: string;
  occupation: string;
  monthlyIncome: number;
  creditScore: number;
  moveInDate: string;
  occupantsCount: number;
  pets: string;
  status: ApplicationStatus;
  notes: string;
  submittedAt: string;
  managerId: string;
}

export type LeaseStatus = 'draft' | 'pending_signature' | 'active' | 'terminated' | 'expired';
export type PaymentStatus = 'paid' | 'due' | 'overdue';

export interface LeaseAgreement {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  managerId: string;
  managerName: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;
  signedByManager: boolean;
  signedByManagerAt?: string;
  signedByTenant: boolean;
  signedByTenantAt?: string;
  clauses: string[];
  nextRentDue: string;
  paymentStatus: PaymentStatus;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'submitted' | 'scheduled' | 'in_progress' | 'resolved';

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  managerId: string;
  title: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Appliance' | 'Structural' | 'Other';
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  createdAt: string;
  assignedContractor?: string;
  scheduledDate?: string;
  resolutionNotes?: string;
}

export interface PaymentTransaction {
  id: string;
  leaseId: string;
  propertyTitle: string;
  tenantName: string;
  amount: number;
  date: string;
  method: 'UPI (GPay / PhonePe / Paytm)' | 'Net Banking (IMPS / NEFT)' | 'Debit / Credit Card (RuPay/Visa)' | 'Direct RTGS Wire';
  status: 'completed' | 'processing' | 'failed';
  receiptNumber: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
  timestamp: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}

export interface SystemSettings {
  platformCommissionRate: number; // percentage
  autoApproveListings: boolean;
  requireIdentityVerification: boolean;
  allowOnlineSignatures: boolean;
  defaultGracePeriodDays: number;
  systemNotificationEmail: string;
}
