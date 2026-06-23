import React, { useState, useEffect, createContext } from "react";
import { initialDb } from "../data/mockDb";
import { generateId, generateTicketKey } from "../utils/helpers";
import {
  GlobalDatabase,
  Agent,
  Employee,
  AdminUser,
  DriverApplication,
  Ticket,
  ActiveDriver,
} from "../types";

export const GlobalContext = createContext<any>(null);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<GlobalDatabase>(initialDb);
  const [activeMode, setActiveMode] = useState("customer"); // customer, agent, employee, admin, driver
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isAdminLogged, setIsAdminLogged] = useState(false);

  const [customerActiveTicketId, setCustomerActiveTicketId] = useState<
    string | null
  >(null);
  const [isTyping, setIsTyping] = useState(false);

  const [shiftStatus, setShiftStatus] = useState("offline");
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [shiftDuration, setShiftDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (shiftStatus === "online" && clockInTime) {
      interval = setInterval(() => {
        setShiftDuration(
          Math.floor((new Date().getTime() - clockInTime.getTime()) / 1000),
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftStatus, clockInTime]);

  const startShift = () => {
    setShiftStatus("online");
    const now = new Date();
    setClockInTime(now);
    setShiftDuration(0);
    setDb((prev) => ({
      ...prev,
      agents: prev.agents.map((a) =>
        a.id === currentAgent?.id
          ? { ...a, status: "online", clockInTime: now.toISOString() }
          : a,
      ),
      employees: prev.employees.map((e) =>
        e.id === currentEmployee?.id
          ? { ...e, status: "online", clockInTime: now.toISOString() }
          : e,
      ),
    }));
  };

  const endShift = (agentOverride?: Agent, employeeOverride?: Employee) => {
    setShiftStatus("offline");
    const now = new Date();
    const aId = agentOverride?.id || currentAgent?.id;
    const eId = employeeOverride?.id || currentEmployee?.id;
    setDb((prev) => ({
      ...prev,
      agents: prev.agents.map((a) =>
        a.id === aId
          ? { ...a, status: "offline", clockOutTime: now.toISOString() }
          : a,
      ),
      employees: prev.employees.map((e) =>
        e.id === eId
          ? { ...e, status: "offline", clockOutTime: now.toISOString() }
          : e,
      ),
    }));
    setClockInTime(null);
    setShiftDuration(0);
  };

  const toggleSystemOffline = () => {
    setDb((prev) => ({ ...prev, systemOffline: !prev.systemOffline }));
  };

  const simulateAIResponse = (ticketId: string, text: string) => {
    if (db.systemOffline) {
      const msg = {
        id: generateId("MSG"),
        ticketId,
        senderId: "SYSTEM_AI",
        senderType: "ai" as const,
        text: "All agents are busy right now. Please leave an email to roypratik2000@gmail.com and our team will reach out to you shortly.",
        timestamp: new Date().toISOString(),
      };
      setDb((prev) => ({
        ...prev,
        messages: [...prev.messages, msg],
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? { ...t, status: "offline_queued", assignedTo: "Unassigned" }
            : t,
        ),
      }));
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const isRouteIssue = text
        .toLowerCase()
        .match(/(route|long|extra|overcharge|fare|payment)/);
      const isEscalation = text
        .toLowerCase()
        .match(/(agent|human|talk|real person|support)/);

      if (isRouteIssue) {
        const msg1 = {
          id: generateId("MSG"),
          ticketId,
          senderId: "SYSTEM_AI",
          senderType: "ai" as const,
          text: "Analyzing your recent trip telemetry and GPS logs...",
          timestamp: new Date().toISOString(),
        };
        setDb((prev) => ({ ...prev, messages: [...prev.messages, msg1] }));

        setTimeout(() => {
          const aiText = `I analyzed your ride from ${db.recentRide.from} to ${db.recentRide.to}. Our GPS data shows a 2.8km deviation due to traffic avoidance, which added ₹45 to your fare. I am routing this to a live agent to finalize your refund.`;
          const aiInsights = {
            confidenceScore: 94,
            analysis: `GPS telemetry confirms a 2.8km deviation from the optimal route from ${db.recentRide.from}. Traffic data does not justify the detour time. High customer loyalty detected.`,
            recommendedAction: "Issue partial refund of ₹45.00",
            fraudRisk: "Low",
          };

          const onlineAgents = db.agents.filter((a) => a.status === "online");
          const assignedAgentId =
            onlineAgents.length > 0 ? onlineAgents[0].id : null;

          const msg2 = {
            id: generateId("MSG"),
            ticketId,
            senderId: "SYSTEM_AI",
            senderType: "ai" as const,
            text: aiText,
            timestamp: new Date().toISOString(),
          };
          const sysMsg = {
            id: generateId("MSG"),
            ticketId,
            senderId: "SYSTEM",
            senderType: "system" as const,
            text: assignedAgentId
              ? `Ticket auto-assigned to ${assignedAgentId}`
              : "Ticket queued for assignment",
            timestamp: new Date().toISOString(),
          };

          setDb((prev) => ({
            ...prev,
            messages: [...prev.messages, msg2, sysMsg],
            tickets: prev.tickets.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    status: assignedAgentId ? "in_progress" : "open",
                    assignedTo: assignedAgentId,
                    aiInsights,
                    issueType: "Incident",
                    priority: "P2 - High",
                  }
                : t,
            ),
          }));
          setIsTyping(false);
        }, 2500);
      } else if (isEscalation) {
        const aiText =
          "I am transferring you to our live MILES specialists. They will join this chat instantly.";
        const onlineAgents = db.agents.filter((a) => a.status === "online");
        const assignedAgentId =
          onlineAgents.length > 0 ? onlineAgents[0].id : null;

        const msg = {
          id: generateId("MSG"),
          ticketId,
          senderId: "SYSTEM_AI",
          senderType: "ai" as const,
          text: aiText,
          timestamp: new Date().toISOString(),
        };
        const sysMsg = {
          id: generateId("MSG"),
          ticketId,
          senderId: "SYSTEM",
          senderType: "system" as const,
          text: assignedAgentId
            ? `Ticket auto-assigned to ${assignedAgentId}`
            : "Ticket queued for assignment",
          timestamp: new Date().toISOString(),
        };

        setDb((prev) => ({
          ...prev,
          messages: [...prev.messages, msg, sysMsg],
          tickets: prev.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: assignedAgentId ? "in_progress" : "open",
                  assignedTo: assignedAgentId,
                  priority: "P3 - Medium",
                }
              : t,
          ),
        }));
        setIsTyping(false);
      } else {
        const msg = {
          id: generateId("MSG"),
          ticketId,
          senderId: "SYSTEM_AI",
          senderType: "ai" as const,
          text: "I understand. Could you provide a bit more detail so I can investigate or connect you to the right team?",
          timestamp: new Date().toISOString(),
        };
        setDb((prev) => ({ ...prev, messages: [...prev.messages, msg] }));
        setIsTyping(false);
      }
    }, 1000);
  };

  const createTicket = (
    category: string,
    priority: string,
    subject: string,
    description: string,
  ) => {
    const newTicketId = generateTicketKey(db.currentUser.id);
    const newTicket = {
      id: newTicketId,
      customerId: db.currentUser.id,
      issueType: "Request",
      category,
      priority: "P3 - Medium",
      subject,
      status: db.systemOffline ? "offline_queued" : "ai_handling",
      createdAt: new Date().toISOString(),
      assignedTo: null,
      isCallRequested: false,
      aiInsights: null,
      environment: "MILES App v4.2 (iOS)",
    };

    const initialMessage = {
      id: generateId("MSG"),
      ticketId: newTicketId,
      senderId: db.currentUser.id,
      senderType: "customer" as const,
      text: description,
      timestamp: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets],
      messages: [...prev.messages, initialMessage],
    }));

    simulateAIResponse(newTicketId, description);
    return newTicketId;
  };

  const sendMessage = (
    ticketId: string,
    senderId: string,
    senderType:
      | "customer"
      | "agent"
      | "ai"
      | "system"
      | "internal"
      | "applicant",
    text: string,
  ) => {
    const newMessage = {
      id: generateId("MSG"),
      ticketId,
      senderId,
      senderType,
      text,
      timestamp: new Date().toISOString(),
    };
    setDb((prev) => ({ ...prev, messages: [...prev.messages, newMessage] }));
    if (senderType === "customer") {
      const ticket = db.tickets.find((t) => t.id === ticketId);
      if (ticket && ticket.status === "ai_handling")
        simulateAIResponse(ticketId, text);
    }
  };

  const assignTicket = (ticketId: string, agentId: string) => {
    setDb((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, assignedTo: agentId, status: "in_progress" }
          : t,
      ),
    }));
    const name =
      db.agents.find((a) => a.id === agentId)?.name ||
      currentAdmin?.name ||
      "System";
    addSystemAction(ticketId, `Ticket assigned to ${name}`);
  };

  const requestCall = (ticketId: string) => {
    setDb((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              isCallRequested: true,
              status: "open",
              priority: "P1 - Critical",
              issueType: "Incident",
            }
          : t,
      ),
    }));
    addSystemAction(
      ticketId,
      `Priority Phone Support Requested. Escalated to P1.`,
    );
  };

  const updateTicketStatus = (ticketId: string, status: string) => {
    setDb((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, status } : t,
      ),
    }));
  };

  const updateTicketDetails = (ticketId: string, updates: any) => {
    setDb((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, ...updates } : t,
      ),
    }));
    addSystemAction(ticketId, `Ticket details updated.`);
  };

  const linkTicket = (ticketId: string, targetId: string) => {
    addSystemAction(ticketId, `Linked to issue ${targetId}`);
  };

  const addSystemAction = (ticketId: string, text: string) => {
    const newMsg = {
      id: generateId("MSG"),
      ticketId,
      senderId: "SYSTEM",
      senderType: "system" as const,
      text,
      timestamp: new Date().toISOString(),
    };
    setDb((prev) => ({ ...prev, messages: [...prev.messages, newMsg] }));
  };

  const endChatCustomer = (ticketId: string) => {
    updateTicketStatus(ticketId, "resolved");
    addSystemAction(ticketId, `Chat ended by customer.`);
    setCustomerActiveTicketId(null);
  };

  const endChatAgent = (ticketId: string, agentName: string) => {
    updateTicketStatus(ticketId, "resolved");
    addSystemAction(ticketId, `Issue resolved. Chat ended by ${agentName}.`);
  };

  const requestLeaveWFH = (type: string, date: string, reason: string) => {
    const req = {
      id: generateId("REQ"),
      agentId: currentAgent?.id || currentEmployee?.id,
      type,
      date,
      reason,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    setDb((prev) => ({ ...prev, leaveRequests: [req, ...prev.leaveRequests] }));
  };

  const updateLeaveRequest = (reqId: string, status: string) => {
    setDb((prev) => ({
      ...prev,
      leaveRequests: prev.leaveRequests.map((r) =>
        r.id === reqId ? { ...r, status } : r,
      ),
    }));
  };

  const addTask = (title: string) => {
    const task = {
      id: generateId("TSK"),
      title,
      status: "todo" as const,
      assignedTo: currentEmployee?.id,
    };
    setDb((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const updateTaskStatus = (
    taskId: string,
    newStatus: "todo" | "in_progress" | "done",
  ) => {
    setDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t,
      ),
    }));
  };

  const createOnboarding = (type: string, data: any) => {
    const req = {
      id: generateId(type.substring(0, 3).toUpperCase()),
      type,
      ...data,
      status: "pending_manager",
      submittedAt: new Date().toISOString(),
    };
    if (type === "Intern" || type === "Full Time")
      setDb((prev) => ({
        ...prev,
        onboardingRequests: [req, ...prev.onboardingRequests],
      }));
    if (type === "Contractor")
      setDb((prev) => ({ ...prev, contractors: [req, ...prev.contractors] }));
  };

  const advanceApproval = (type: string, id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "pending_manager" ? "pending_hr" : "approved";
    const updater = (list: any[]) =>
      list.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      );

    setDb((prev) => {
      let newState = { ...prev };
      if (type === "Intern" || type === "Full Time") {
        newState.onboardingRequests = updater(prev.onboardingRequests);
        if (nextStatus === "approved") {
          const req = prev.onboardingRequests.find((r) => r.id === id)!;

          // Auto generate Employee ID
          const hash = generateId("").split("-")[1];
          let newEmpId = "";
          if (type === "Full Time") newEmpId = `ML-${hash}`;
          if (type === "Intern") newEmpId = `INT-${hash}`;

          const newEmp: Employee = {
            id: generateId("EMP"),
            name: req.name,
            role: req.role,
            department: req.department,
            employeeId: newEmpId,
            leaveBalance: type === "Full Time" ? 20 : 5,
            workType: "Office",
            status: "offline",
            employmentType: type as any,
            accountStatus: "Active",
            permissions: {
              dashboard: [],
              hr: [],
              operations: [],
              support: [],
              admin: [],
            },
          };

          newState.employees = [...prev.employees, newEmp];

          // Auto create agent if Support
          if (
            newEmp.department === "Support" ||
            newEmp.role.includes("Support")
          ) {
            newState.agents = [
              ...prev.agents,
              {
                id: generateId("AGT"),
                name: newEmp.name,
                role: newEmp.role,
                email: req.email || `${newEmp.name.toLowerCase()}@miles.com`,
                status: "offline",
              },
            ];
          }
        }
      }
      if (type === "Contractor") {
        newState.contractors = updater(prev.contractors);
        if (nextStatus === "approved") {
          const req = prev.contractors.find((r) => r.id === id)!;
          const hash = generateId("").split("-")[1];
          const newEmpId = `CT-${hash}`;

          const newEmp: Employee = {
            id: generateId("EMP"),
            name: req.name,
            role: req.type,
            department: "External",
            employeeId: newEmpId,
            leaveBalance: 0,
            workType: "Remote",
            status: "offline",
            employmentType: "Contractor",
            accountStatus: "Active",
            permissions: {
              dashboard: [],
              hr: [],
              operations: [],
              support: [],
              admin: [],
            },
          };
          newState.employees = [...prev.employees, newEmp];
        }
      }
      return newState;
    });
  };

  const rejectApproval = (type: string, id: string) => {
    const updater = (list: any[]) =>
      list.map((item) =>
        item.id === id ? { ...item, status: "rejected" } : item,
      );
    setDb((prev) => {
      let newState = { ...prev };
      if (type === "Intern" || type === "Full Time")
        newState.onboardingRequests = updater(prev.onboardingRequests);
      if (type === "Contractor")
        newState.contractors = updater(prev.contractors);
      return newState;
    });
  };

  const updateDriverApp = (id: string, updates: any) => {
    setDb((prev) => {
      const updatedApps = prev.driverApplications.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      );

      // If approved, add to active drivers
      let newActiveDrivers = prev.activeDrivers;
      if (updates.status === "Approved") {
        const drv = updatedApps.find((d) => d.id === id);
        if (drv && !newActiveDrivers.find((a) => a.applicationId === drv.id)) {
          newActiveDrivers = [
            ...newActiveDrivers,
            {
              id: generateId("D"),
              applicationId: drv.id,
              name: drv.name,
              phone: drv.phone,
              vehicleType: drv.vehicleCategory,
              vehicleModel: drv.vehicleModel,
              vehicleNumber: drv.vehicleNumber,
              joiningDate: new Date().toISOString().split("T")[0],
              status: "Active",
            },
          ];
        }
      }

      return {
        ...prev,
        driverApplications: updatedApps,
        activeDrivers: newActiveDrivers,
      };
    });

    if (updates.status) {
      addSystemAction(id, `Status updated to ${updates.status}`);
    }
  };

  const submitDriverApplication = (data: Partial<DriverApplication>) => {
    // Create random ID based on mobile hash hash
    const mobileHash =
      data.phone?.substring(data.phone.length - 5) ||
      Math.floor(10000 + Math.random() * 90000).toString();
    const appId = `DRV-2026-${mobileHash}`;

    const newApp: DriverApplication = {
      ...(data as any),
      id: appId,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
    };

    const newTicket: Ticket = {
      id: appId,
      applicationId: appId,
      issueType: "Driver Onboarding",
      category: "Operations",
      priority: "P2 - High",
      subject: `Driver Application - ${data.name}`,
      status: "Submitted",
      createdAt: new Date().toISOString(),
      assignedTo: null,
      isCallRequested: false,
    };

    setDb((prev) => ({
      ...prev,
      driverApplications: [newApp, ...prev.driverApplications],
      tickets: [newTicket, ...prev.tickets],
    }));

    addSystemAction(appId, `Application Submitted.`);
    addSystemAction(appId, `Moved to HR Review queue.`);

    // Auto update status to HR Review
    setTimeout(() => {
      updateDriverApp(appId, { status: "HR Review" });
    }, 1000);

    return appId;
  };

  const addTeamMember = (data: Partial<Employee>) => {
    let prefix = "ML";
    if (data.employmentType === "Intern") prefix = "INT";
    if (data.employmentType === "Contractor") prefix = "CT";
    const hash = generateId("").split("-")[1];

    const newEmp: Employee = {
      id: generateId("EMP"),
      name: data.name || "",
      email: data.email,
      phone: data.phone,
      employeeId: data.employeeId || `${prefix}-${hash}`,
      role: data.role || "Employee",
      department: data.department || "General",
      leaveBalance: data.employmentType === "Intern" ? 5 : 20,
      workType: "Office",
      status: "offline",
      employmentType: data.employmentType || "Full Time",
      accountStatus: data.accountStatus || "Active",
      permissions: data.permissions || {
        dashboard: [],
        hr: [],
        operations: [],
        support: [],
        admin: [],
      },
    };

    setDb((prev) => {
      const newState = { ...prev, employees: [...prev.employees, newEmp] };
      if (
        newEmp.department === "Support" ||
        newEmp.permissions?.support?.length
      ) {
        newState.agents = [
          ...prev.agents,
          {
            id: generateId("AGT"),
            name: newEmp.name,
            role: newEmp.role,
            email: newEmp.email || `${newEmp.name.toLowerCase()}@miles.com`,
            status: "offline",
          },
        ];
      }
      return newState;
    });
  };

  const updateTeamMember = (id: string, data: Partial<Employee>) => {
    setDb((prev) => ({
      ...prev,
      employees: prev.employees.map((e) =>
        e.id === id ? { ...e, ...data } : e,
      ),
    }));
  };

  const separateEmployee = (id: string) => {
    setDb((prev) => {
      const empToSeparate = prev.employees.find((e) => e.id === id);
      if (!empToSeparate) return prev;

      return {
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === id ? { ...e, accountStatus: "Separated" as any } : e,
        ),
        agents: prev.agents.filter(
          (a) =>
            a.name !== empToSeparate.name && a.email !== empToSeparate.email,
        ),
      };
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        db,
        activeMode,
        setActiveMode,
        currentAgent,
        setCurrentAgent,
        currentEmployee,
        setCurrentEmployee,
        currentAdmin,
        setCurrentAdmin,
        isAdminLogged,
        setIsAdminLogged,
        shiftStatus,
        setShiftStatus,
        shiftDuration,
        startShift,
        endShift,
        toggleSystemOffline,
        customerActiveTicketId,
        setCustomerActiveTicketId,
        isTyping,
        createTicket,
        sendMessage,
        assignTicket,
        updateTicketStatus,
        requestCall,
        addSystemAction,
        updateTicketDetails,
        linkTicket,
        endChatCustomer,
        endChatAgent,
        requestLeaveWFH,
        updateLeaveRequest,
        addTask,
        updateTaskStatus,
        createOnboarding,
        advanceApproval,
        rejectApproval,
        updateDriverApp,
        submitDriverApplication,
        addTeamMember,
        updateTeamMember,
        separateEmployee,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
