import { GlobalDatabase, Agent, AdminUser } from "../types";

export const agentsList: Agent[] = [
  {
    id: "AGT-001",
    name: "Megha",
    role: "Support Lead",
    email: "megha@miles.com",
    status: "offline",
  },
  {
    id: "AGT-002",
    name: "Rahul",
    role: "Technical Support",
    email: "rahul@miles.com",
    status: "offline",
  },
  {
    id: "AGT-003",
    name: "Alex",
    role: "Customer Success",
    email: "alex@miles.com",
    status: "offline",
  },
];

export const adminUsersList: AdminUser[] = [
  {
    id: "ADM-001",
    name: "Pratik",
    role: "Full Stack Dev & Eng Manager",
    tags: ["Manager", "Admin"],
  },
  {
    id: "ADM-002",
    name: "Neha",
    role: "Head of HR & Operations",
    tags: ["HR", "Admin"],
  },
];

export const initialDb: GlobalDatabase = {
  currentUser: {
    id: "CUST-001",
    name: "Arjun Sharma",
    phone: "+91 98765 43210",
    email: "arjun@example.com",
    rides: 142,
    rating: 4.9,
    joined: "2022",
  },
  recentRide: {
    id: "RIDE-9921",
    from: "Indiranagar",
    to: "Koramangala",
    fare: 245.0,
    driver: "Ramesh K.",
    date: new Date().toLocaleDateString(),
  },
  tickets: [],
  messages: [],
  customers: {
    "CUST-001": {
      id: "CUST-001",
      name: "Arjun Sharma",
      phone: "+91 98765 43210",
      rides: 142,
      rating: 4.9,
      joined: "2022",
    },
    "CUST-002": {
      id: "CUST-002",
      name: "Priya Patel",
      phone: "+91 99999 88888",
      rides: 45,
      rating: 4.9,
      joined: "2023",
    },
  },
  adminUsers: adminUsersList,
  agents: agentsList,
  employees: [
    {
      id: "EMP-001",
      name: "Kabir",
      role: "Operations Intern",
      department: "Driver Onboarding",
      leaveBalance: 5,
      workType: "Office",
      status: "offline",
    },
  ],
  driverApplications: [
    {
      id: "DRV-REQ-01",
      name: "Suresh Kumar",
      phone: "+91 99999 11111",
      vehicle: "Maruti Dzire",
      status: "pending_manager",
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "DRV-REQ-02",
      name: "Rajesh Verma",
      phone: "+91 99887 77665",
      vehicle: "Tata Tigor",
      status: "pending_hr",
      submittedAt: new Date(Date.now() - 10000000).toISOString(),
    },
  ],
  onboardingRequests: [
    {
      id: "ONB-01",
      name: "Pooja",
      role: "Backend Intern",
      department: "Engineering",
      type: "Intern",
      status: "pending_manager",
    },
  ],
  contractors: [
    {
      id: "CON-01",
      name: "TechCorp Solutions",
      type: "IT Vendor",
      status: "pending_manager",
    },
  ],
  leaveRequests: [],
  tasks: [
    {
      id: "TSK-01",
      title: "Verify daily driver batches",
      status: "todo",
      assignedTo: "EMP-001",
    },
  ],
  complianceAlerts: [
    {
      id: "CMP-1",
      title: "Driver License Expiring",
      target: "Ramesh K.",
      daysLeft: 12,
      type: "warning",
    },
    {
      id: "CMP-2",
      title: "Vendor NDA Expired",
      target: "TechCorp Solutions",
      daysLeft: 0,
      type: "critical",
    },
  ],
  systemOffline: false,
};
