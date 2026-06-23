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

export interface Ticket {
  id: string;
  customerId: string;
  issueType: string;
  category: string;
  priority: string;
  subject: string;
  status: string;
  createdAt: string;
  assignedTo: string | null;
  isCallRequested: boolean;
  aiInsights: AIInsights | null;
  environment: string;
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
  senderType: "customer" | "agent" | "ai" | "system" | "internal";
  text: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  leaveBalance: number;
  workType: string;
  status: "offline" | "online";
  clockInTime?: string;
  clockOutTime?: string;
}

export interface DriverApplication {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: string;
  submittedAt: string;
}

export interface OnboardingRequest {
  id: string;
  name: string;
  role: string;
  department: string;
  type: string;
  status: string;
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
  customers: Record<string, Customer>;
  adminUsers: AdminUser[];
  agents: Agent[];
  employees: Employee[];
  driverApplications: DriverApplication[];
  onboardingRequests: OnboardingRequest[];
  contractors: Contractor[];
  leaveRequests: LeaveRequest[];
  tasks: Task[];
  complianceAlerts: ComplianceAlert[];
  systemOffline: boolean;
}
