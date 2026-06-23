export interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "offline" | "online";
  clockInTime?: string;
  clockOutTime?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  role: string;
  tags: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rides: number;
  rating: number;
  joined: string;
}

export type TicketStatus =
  | "Submitted"
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting For Customer"
  | "Escalated"
  | "Resolved"
  | "Closed"
  | "ai_handling"
  | "offline_queued";

export interface Ticket {
  id: string;
  customerId?: string; // Optional for driver applications
  issueType: string;
  category: string;
  priority: string;
  subject: string;
  status: TicketStatus | string;
  createdAt: string;
  assignedTo: string | null;
  assignedTeam?: string; // Support, Verification, Operations, Training
  isCallRequested: boolean;
  aiInsights?: AIInsights | null;
  environment?: string;
  applicationId?: string; // Link to DriverApplication
}

export interface CallbackRequest {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  issueCategory: string;
  preferredTime: string;
  notes: string;
  priority: string;
  ticketId?: string;
  rideId?: string;
  status: "Callback Requested" | "Claimed" | "In Progress" | "Closed";
  assignedTo: string | null;
  createdAt: string;
}

export interface AIInsights {
  confidenceScore: number;
  analysis: string;
  recommendedAction: string;
  fraudRisk: string;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: "customer" | "agent" | "ai" | "system" | "internal" | "applicant";
  text: string;
  timestamp: string;
  actionRequired?: "Escalate" | "Callback" | "Provide Info" | null;
}

export interface Permissions {
  dashboard: string[];
  hr: string[];
  operations: string[];
  support: string[];
  admin: string[];
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  role: string;
  department: string;
  leaveBalance: number;
  workType: string;
  employmentType?: "Intern" | "Full Time" | "Contractor";
  accountStatus?: "Active" | "Inactive" | "Separated";
  status: "offline" | "online";
  permissions?: Permissions;
  clockInTime?: string;
  clockOutTime?: string;
}

export type DriverStatus =
  | "Submitted"
  | "Documents Uploaded"
  | "HR Review"
  | "Assigned"
  | "In Progress"
  | "Waiting For Documents"
  | "Verification"
  | "Training"
  | "Approved"
  | "Rejected";

export interface DriverApplication {
  id: string; // e.g. DRV-2026-45812

  // Step 1
  name: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  emergencyContact: string;

  // Step 2
  dlNumber: string;
  dlExpiry: string;
  experience: number;
  languages: string[];
  dlFile?: any;

  // Step 3
  vehicleCategory: string;
  vehicleNumber: string;
  rcNumber: string;
  vehicleModel: string;
  manufacturingYear: string;
  rcFile?: any;
  insuranceFile?: any;
  pucFile?: any;
  fitnessFile?: any;

  // Step 4
  accountName: string;
  accountNumber: string;
  ifscCode: string;

  // Workflow
  status: DriverStatus | string;
  submittedAt: string;
  assignedOpsExecutive?: string;
  assignedTeam?: string;
}

export interface ActiveDriver {
  id: string;
  applicationId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleNumber: string;
  joiningDate: string;
  status: "Active" | "Suspended";
}

export interface OnboardingRequest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  role: string;
  department: string;
  type: string; // 'Intern' | 'Contractor' | 'Full Time'
  status: string;
  reportingManager?: string;
  joiningDate?: string;
}

export interface Contractor {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface LeaveRequest {
  id: string;
  agentId?: string;
  type: string;
  date: string;
  reason: string;
  status: string;
  requestedAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assignedTo?: string;
}

export interface ComplianceAlert {
  id: string;
  title: string;
  target: string;
  daysLeft: number;
  type: string;
}

export interface RecentRide {
  id: string;
  from: string;
  to: string;
  fare: number;
  driver: string;
  date: string;
}

export interface GlobalDatabase {
  currentUser: Customer;
  recentRide: RecentRide;
  tickets: Ticket[];
  messages: Message[];
  callbackRequests: CallbackRequest[];
  customers: Record<string, Customer>;
  adminUsers: AdminUser[];
  agents: Agent[];
  employees: Employee[];
  driverApplications: DriverApplication[];
  activeDrivers: ActiveDriver[];
  onboardingRequests: OnboardingRequest[];
  contractors: Contractor[];
  leaveRequests: LeaveRequest[];
  tasks: Task[];
  complianceAlerts: ComplianceAlert[];
  systemOffline: boolean;
}
