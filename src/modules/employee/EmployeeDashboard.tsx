import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Car,
  X,
  FileText,
  Users,
  CheckCircle,
  Clock,
  Activity,
  ShieldCheck,
  AlertTriangle,
  User,
  CalendarRange,
  PenTool,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";

export const EmployeeDashboard = () => {
  const {
    db,
    currentEmployee,
    requestLeaveWFH,
    updateTaskStatus,
    addTask,
    updateDriverApp,
    advanceApproval,
    rejectApproval,
    addSystemAction,
    submitTimesheet,
  } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("tasks");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Attendance & Timesheets
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    type: "Leave",
    date: "",
    reason: "",
  });
  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
  const [tsData, setTsData] = useState({
    weekStarting: "",
    entries: [
      { day: "Monday", hours: 8 },
      { day: "Tuesday", hours: 8 },
      { day: "Wednesday", hours: 8 },
      { day: "Thursday", hours: 8 },
      { day: "Friday", hours: 8 },
      { day: "Saturday", hours: 0 },
      { day: "Sunday", hours: 0 },
    ],
  });

  // Ops State
  const [selectedDriverForOpsReview, setSelectedDriverForOpsReview] =
    useState<any>(null);
  const [internalNote, setInternalNote] = useState("");

  const isManager =
    currentEmployee?.permissions?.admin?.includes("Team Management") ||
    currentEmployee?.role.toLowerCase().includes("manager");
  const isOps =
    currentEmployee?.department === "Operations" ||
    currentEmployee?.permissions?.operations?.length > 0;

  const handleLeaveSubmit = () => {
    requestLeaveWFH(leaveData.type, leaveData.date, leaveData.reason);
    setIsLeaveModalOpen(false);
    setLeaveData({ type: "Leave", date: "", reason: "" });
  };

  const handleTimesheetSubmit = () => {
    submitTimesheet(
      currentEmployee.id,
      currentEmployee.projectCode || "GENERAL",
      tsData.weekStarting,
      tsData.entries,
    );
    setIsTimesheetModalOpen(false);
    setTsData({
      weekStarting: "",
      entries: [
        { day: "Monday", hours: 8 },
        { day: "Tuesday", hours: 8 },
        { day: "Wednesday", hours: 8 },
        { day: "Thursday", hours: 8 },
        { day: "Friday", hours: 8 },
        { day: "Saturday", hours: 0 },
        { day: "Sunday", hours: 0 },
      ],
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle);
      setNewTaskTitle("");
    }
  };

  // Driver Ops Variables
  const totalDrivers = db.driverApplications.length;
  const pendingDrivers = db.driverApplications.filter(
    (d: any) =>
      d.status.includes("Review") ||
      d.status === "Submitted" ||
      d.status === "Waiting For Documents" ||
      d.status === "Assigned" ||
      d.status === "In Progress",
  ).length;
  const inTraining = db.driverApplications.filter(
    (d: any) => d.status === "Training" || d.status === "Verification",
  ).length;
  const approvedDrivers = db.driverApplications.filter(
    (d: any) => d.status === "Approved",
  ).length;
  const rejectedDrivers = db.driverApplications.filter(
    (d: any) => d.status === "Rejected",
  ).length;
  const myQueue = db.driverApplications.filter(
    (d: any) =>
      d.assignedTeam === currentEmployee?.department ||
      d.assignedOpsExecutive === currentEmployee?.id,
  );

  const pipelineStages = [
    { id: "Submitted", label: "Submitted" },
    { id: "HR Review", label: "HR Review" },
    { id: "Assigned", label: "Assigned" },
    { id: "In Progress", label: "In Progress" },
    { id: "Waiting For Documents", label: "Waiting For Documents" },
    { id: "Verification", label: "Verification" },
    { id: "Training", label: "Training" },
    { id: "Approved", label: "Approved" },
    { id: "Rejected", label: "Rejected" },
  ];

  const handleOpsReviewSubmit = (id: string, newStatus: string) => {
    updateDriverApp(id, { status: newStatus });
    if (internalNote) {
      addSystemAction(id, `${currentEmployee?.role} Note: ${internalNote}`);
    }
    setSelectedDriverForOpsReview(null);
    setInternalNote("");
  };

  const advancePipelineStage = (driverId: string, currentStatus: string) => {
    const currentIndex = pipelineStages.findIndex(
      (s) => s.id === currentStatus,
    );
    if (currentIndex !== -1 && currentIndex < pipelineStages.length - 2) {
      updateDriverApp(driverId, {
        status: pipelineStages[currentIndex + 1].id,
      });
    }
  };

  const renderActivityTimeline = (appId: string) => {
    const messages = db.messages.filter((m: any) => m.ticketId === appId);
    return (
      <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2 border border-white/5 bg-black/30 rounded-xl p-3">
        {messages.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center italic">
            No activity yet
          </p>
        ) : null}
        {messages.map((m: any) => (
          <div key={m.id} className="flex gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                {m.senderType === "system" ? "System" : "Update"}
              </p>
              <p className="text-xs text-zinc-300">{m.text}</p>
              <p className="text-[9px] text-zinc-600">
                {new Date(m.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [{ id: "tasks", label: "Tasks Board" }];

  if (isManager) {
    tabs.unshift({ id: "manager_overview", label: "Organization & Metrics" });
    tabs.unshift({ id: "manager_approvals", label: "Manager Approvals" });
  }

  if (isOps) {
    tabs.push({ id: "ops_overview", label: "Ops Overview" });
    tabs.push({ id: "ops_queue", label: "Driver Queue" });
    tabs.push({ id: "ops_pipeline", label: "Kanban Pipeline" });
  }

  tabs.push({ id: "attendance", label: "Attendance System" });
  tabs.push({ id: "profile", label: "My Profile" });

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-blue-500/20 rounded-[2rem] shadow-2xl overflow-hidden z-10">
        <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-black shrink-0">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1">
            {currentEmployee?.name}'s Workspace
          </h1>
          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-6">
            Employee ID: {currentEmployee?.employeeId}
          </p>

          <div className="flex gap-4 border-b border-white/10 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-500" : "text-zinc-500 hover:text-white"}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="empTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#050505] p-6">
          {activeTab === "profile" && (
            <div className="p-8 max-w-lg mx-auto mt-10 text-center">
              <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <User className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                {currentEmployee?.name}
              </h2>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-8">
                {currentEmployee?.role} • {currentEmployee?.department}
              </p>

              <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 text-left space-y-4">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Employee ID
                  </p>
                  <p className="text-white font-mono">
                    {currentEmployee?.employeeId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Email Address
                  </p>
                  <p className="text-white">{currentEmployee?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Project Code
                  </p>
                  <p className="text-white">
                    {currentEmployee?.projectCode || "General"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Status
                  </p>
                  <p className="text-green-400 font-bold">Online / Active</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "manager_overview" && isManager && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Organization &
                Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl shadow-lg">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">
                    Total Org Members
                  </span>
                  <span className="text-3xl font-black mt-3 text-blue-400 block">
                    {db.employees.length}
                  </span>
                </div>
                <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl shadow-lg">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">
                    Active Tickets
                  </span>
                  <span className="text-3xl font-black mt-3 text-orange-400 block">
                    {
                      db.tickets.filter(
                        (t: any) =>
                          t.status !== "Resolved" && t.status !== "Closed",
                      ).length
                    }
                  </span>
                </div>
                <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl shadow-lg">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">
                    Closed This Week
                  </span>
                  <span className="text-3xl font-black mt-3 text-green-400 block">
                    {
                      db.tickets.filter((t: any) => t.status === "Resolved")
                        .length
                    }
                  </span>
                </div>
                <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl shadow-lg">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">
                    Avg Feedback (All)
                  </span>
                  <span className="text-3xl font-black mt-3 text-[#FFD100] block">
                    4.8 ★
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Team Directory
                    By Department
                  </h3>
                  {["Operations", "Engineering", "HR", "Support"].map(
                    (dept) => {
                      const emps = db.employees.filter(
                        (e: any) =>
                          e.department === dept &&
                          e.accountStatus !== "Separated",
                      );
                      if (emps.length === 0) return null;
                      return (
                        <div key={dept} className="mb-4">
                          <h4 className="text-xs font-bold text-zinc-400 mb-2">
                            {dept}
                          </h4>
                          <table className="w-full text-left border-collapse bg-[#121214] rounded-2xl overflow-hidden border border-white/5">
                            <thead className="bg-[#0A0A0A] border-b border-white/5">
                              <tr>
                                <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  Role
                                </th>
                                <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {emps.map((emp: any) => (
                                <tr
                                  key={emp.id}
                                  className="cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                  <td className="px-4 py-3 font-bold text-white text-sm">
                                    {emp.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-zinc-400">
                                    {emp.role}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${emp.status === "online" ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-400"}`}
                                    >
                                      {emp.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    },
                  )}
                </div>

                <div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-blue-500" />{" "}
                    Timesheet Approvals
                  </h3>
                  <table className="w-full text-left border-collapse bg-[#121214] rounded-2xl overflow-hidden border border-white/5">
                    <thead className="bg-[#0A0A0A] border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Project
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Hours
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {db.timesheets
                        .filter(
                          (t: any) =>
                            t.status === "Submitted" ||
                            t.status === "Edit Requested",
                        )
                        .map((ts: any) => (
                          <tr
                            key={ts.id}
                            className="hover:bg-white/5 cursor-pointer"
                          >
                            <td className="px-4 py-3 font-bold text-white text-sm">
                              {
                                db.employees.find(
                                  (e: any) => e.id === ts.employeeId,
                                )?.name
                              }
                            </td>
                            <td className="px-4 py-3 text-xs text-blue-400 font-mono">
                              {ts.projectCode}
                            </td>
                            <td className="px-4 py-3 text-sm text-white">
                              {ts.totalHours}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                                {ts.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {db.timesheets.filter(
                        (t: any) =>
                          t.status === "Submitted" ||
                          t.status === "Edit Requested",
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-8 text-center text-zinc-500 text-xs uppercase tracking-widest font-bold"
                          >
                            No pending timesheets
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "manager_approvals" && isManager && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" /> Pending
                Approvals
              </h2>
              <div className="space-y-4">
                {db.onboardingRequests.filter(
                  (r: any) => r.status === "pending_manager",
                ).length === 0 &&
                db.driverApplications.filter(
                  (r: any) => r.status === "pending_manager",
                ).length === 0 &&
                db.contractors.filter(
                  (r: any) => r.status === "pending_manager",
                ).length === 0 ? (
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center py-4 bg-[#121214] rounded-2xl border border-white/5">
                    No pending approvals
                  </p>
                ) : (
                  <>
                    {db.onboardingRequests
                      .filter((r: any) => r.status === "pending_manager")
                      .map((req: any) => (
                        <div
                          key={req.id}
                          className="bg-[#121214] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                          <div>
                            <p className="text-white font-bold text-lg">
                              {req.name}{" "}
                              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded ml-2 uppercase">
                                {req.type} Onboarding
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">
                              {req.role} • {req.department}
                            </p>
                          </div>
                          <div className="flex gap-3 w-full md:w-auto">
                            <Button
                              variant="danger"
                              onClick={() => rejectApproval("Intern", req.id)}
                              className="flex-1 md:flex-none h-10 px-4 py-0 text-xs"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() =>
                                advanceApproval("Intern", req.id, req.status)
                              }
                              className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                            >
                              Approve & Send to HR
                            </Button>
                          </div>
                        </div>
                      ))}
                    {db.contractors
                      .filter((r: any) => r.status === "pending_manager")
                      .map((req: any) => (
                        <div
                          key={req.id}
                          className="bg-[#121214] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                          <div>
                            <p className="text-white font-bold text-lg">
                              {req.name}{" "}
                              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded ml-2 uppercase">
                                Contractor Onboarding
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">
                              {req.type}
                            </p>
                          </div>
                          <div className="flex gap-3 w-full md:w-auto">
                            <Button
                              variant="danger"
                              onClick={() =>
                                rejectApproval("Contractor", req.id)
                              }
                              className="flex-1 md:flex-none h-10 px-4 py-0 text-xs"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() =>
                                advanceApproval(
                                  "Contractor",
                                  req.id,
                                  req.status,
                                )
                              }
                              className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                            >
                              Approve & Send to HR
                            </Button>
                          </div>
                        </div>
                      ))}
                    {db.driverApplications
                      .filter((r: any) => r.status === "pending_manager")
                      .map((req: any) => (
                        <div
                          key={req.id}
                          className="bg-[#121214] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                          <div>
                            <p className="text-white font-bold text-lg">
                              {req.name}{" "}
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2 uppercase">
                                Driver Onboarding
                              </span>
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">
                              {req.vehicle} • {req.phone}
                            </p>
                          </div>
                          <div className="flex gap-3 w-full md:w-auto">
                            <Button
                              variant="danger"
                              onClick={() => rejectApproval("Driver", req.id)}
                              className="flex-1 md:flex-none h-10 px-4 py-0 text-xs"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() =>
                                advanceApproval("Driver", req.id, req.status)
                              }
                              className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                            >
                              Approve & Send to HR
                            </Button>
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "ops_overview" && isOps && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  {
                    label: "Total Applications",
                    val: totalDrivers,
                    color: "text-white",
                  },
                  {
                    label: "In Review",
                    val: pendingDrivers,
                    color: "text-yellow-400",
                  },
                  {
                    label: "Verification/Training",
                    val: inTraining,
                    color: "text-blue-400",
                  },
                  {
                    label: "Approved",
                    val: approvedDrivers,
                    color: "text-green-400",
                  },
                  {
                    label: "Rejected",
                    val: rejectedDrivers,
                    color: "text-red-500",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg"
                  >
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">
                      {c.label}
                    </span>
                    <span className={`text-3xl font-black mt-3 ${c.color}`}>
                      {c.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ops_queue" && isOps && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white mb-4">
                Assigned to {currentEmployee?.department}
              </h2>
              {myQueue.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest bg-[#121214] rounded-2xl border border-white/5">
                  No applications assigned to your team queue
                </div>
              ) : (
                <div className="grid gap-4">
                  {myQueue.map((drv: any) => (
                    <div
                      key={drv.id}
                      className="bg-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">
                            {drv.name}{" "}
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded ml-2 uppercase border border-green-500/20">
                              {drv.status}
                            </span>
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            {drv.id} • {drv.phone} • {drv.vehicleCategory}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedDriverForOpsReview(drv)}
                        className="h-10 px-6 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0 w-full sm:w-auto"
                      >
                        Process Application
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ops_pipeline" && isOps && (
            <div className="flex h-full gap-4 overflow-x-auto pb-4 snap-x">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.id}
                  className="min-w-[300px] w-[300px] bg-[#121214] border border-white/5 rounded-2xl p-4 flex flex-col snap-start shrink-0"
                >
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex justify-between items-center">
                    {stage.label}
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-white">
                      {
                        db.driverApplications.filter(
                          (d: any) => d.status === stage.id,
                        ).length
                      }
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {db.driverApplications
                      .filter((d: any) => d.status === stage.id)
                      .map((drv: any) => (
                        <div
                          key={drv.id}
                          className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors shadow-lg"
                        >
                          <p className="text-xs font-mono text-zinc-500 mb-1">
                            {drv.id}
                          </p>
                          <p className="text-white font-bold text-sm truncate">
                            {drv.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-1 truncate">
                            {drv.vehicleCategory} • {drv.phone}
                          </p>
                          {stage.id !== "Approved" &&
                            stage.id !== "Rejected" && (
                              <button
                                onClick={() =>
                                  advancePipelineStage(drv.id, drv.status)
                                }
                                className="mt-3 w-full bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-widest font-bold text-zinc-300 py-2 rounded-lg transition-colors border border-white/5"
                              >
                                Move Forward
                              </button>
                            )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              <form onSubmit={handleAddTask} className="flex gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 bg-[#121214] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <Button
                  type="submit"
                  className="!bg-blue-600 hover:!bg-blue-500 text-white shadow-none"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["todo", "in_progress", "done"].map((status) => (
                  <div
                    key={status}
                    className="bg-[#121214] rounded-2xl p-4 border border-white/5"
                  >
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">
                      {status.replace("_", " ")}
                    </h3>
                    <div className="space-y-3">
                      {db.tasks
                        .filter((t: any) => t.status === status)
                        .map((task: any) => (
                          <div
                            key={task.id}
                            className="bg-black/50 p-4 rounded-xl border border-white/5 shadow-sm"
                          >
                            <p className="text-sm font-semibold text-white mb-3">
                              {task.title}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono text-zinc-500">
                                {task.id}
                              </span>
                              <div className="flex gap-2">
                                {status !== "todo" && (
                                  <button
                                    onClick={() =>
                                      updateTaskStatus(task.id, "todo")
                                    }
                                    className="text-xs text-zinc-400 hover:text-white"
                                  >
                                    To Do
                                  </button>
                                )}
                                {status !== "in_progress" && (
                                  <button
                                    onClick={() =>
                                      updateTaskStatus(task.id, "in_progress")
                                    }
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    Start
                                  </button>
                                )}
                                {status !== "done" && (
                                  <button
                                    onClick={() =>
                                      updateTaskStatus(task.id, "done")
                                    }
                                    className="text-xs text-green-400 hover:text-green-300"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="max-w-4xl mx-auto space-y-6 pt-4">
              <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-3xl">
                    {currentEmployee?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {currentEmployee?.name}
                    </h3>
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">
                      {currentEmployee?.role}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Project Code:{" "}
                      <span className="text-blue-400 font-mono">
                        {currentEmployee?.projectCode || "General"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 bg-black/50 p-4 rounded-xl border border-white/5 shrink-0">
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Leave Balance
                    </p>
                    <p className="text-xl font-black text-white">
                      {currentEmployee?.leaveBalance} Days
                    </p>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Work Type
                    </p>
                    <p className="text-xl font-black text-white">
                      {currentEmployee?.workType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-blue-500" /> Leave &
                    Time Off
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    Submit requests for PTO, sick leave, or temporary work from
                    home.
                  </p>
                  <Button
                    className="w-full bg-white/5 hover:bg-white/10 text-white shadow-none border border-white/10"
                    onClick={() => setIsLeaveModalOpen(true)}
                  >
                    Submit Leave Request
                  </Button>
                </div>
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-500" /> Weekly
                    Timesheet
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    Log your weekly hours against your assigned project code.
                  </p>
                  <Button
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 shadow-none border border-blue-500/20"
                    onClick={() => setIsTimesheetModalOpen(true)}
                  >
                    Enter Timesheet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-white font-black text-lg mb-4">
                Request Leave / Time Off
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">
                    Request Type
                  </label>
                  <select
                    value={leaveData.type}
                    onChange={(e) =>
                      setLeaveData({ ...leaveData, type: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Leave">Full Day Leave</option>
                    <option value="Half Day">Half Day Leave</option>
                    <option value="WFH">Work From Home (WFH)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={leaveData.date}
                    onChange={(e) =>
                      setLeaveData({ ...leaveData, date: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">
                    Reason
                  </label>
                  <textarea
                    value={leaveData.reason}
                    onChange={(e) =>
                      setLeaveData({ ...leaveData, reason: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                    placeholder="Reason for request..."
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLeaveSubmit}
                  disabled={!leaveData.date || !leaveData.reason}
                  className="flex-1 h-10 !bg-blue-600 hover:!bg-blue-500 text-white border-0 shadow-none"
                >
                  Submit Request
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {isTimesheetModalOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-xl">
                  Weekly Timesheet
                </h3>
                <button
                  onClick={() => setIsTimesheetModalOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                  Week Starting (Monday)
                </label>
                <input
                  type="date"
                  required
                  value={tsData.weekStarting}
                  onChange={(e) =>
                    setTsData({ ...tsData, weekStarting: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 mb-4"
                />
              </div>
              <div className="space-y-2 mb-6">
                {tsData.entries.map((entry, idx) => (
                  <div
                    key={entry.day}
                    className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/5"
                  >
                    <span className="text-sm font-semibold text-zinc-300 w-24">
                      {entry.day}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={entry.hours}
                        onChange={(e) => {
                          const newEntries = [...tsData.entries];
                          newEntries[idx].hours = parseInt(e.target.value) || 0;
                          setTsData({ ...tsData, entries: newEntries });
                        }}
                        className="w-16 bg-black border border-white/10 rounded p-1 text-center text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs text-zinc-500">hrs</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-sm font-bold text-white">
                  Total:{" "}
                  <span className="text-blue-400">
                    {tsData.entries.reduce((a, c) => a + c.hours, 0)} hrs
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsTimesheetModalOpen(false)}
                    className="h-10 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTimesheetSubmit}
                    disabled={!tsData.weekStarting}
                    className="h-10 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                  >
                    Submit Timesheet
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedDriverForOpsReview && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-3xl w-full max-w-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-xl flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-500" /> Update
                  Application Status
                </h3>
                <button
                  onClick={() => setSelectedDriverForOpsReview(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
                <div>
                  <p className="text-xs font-mono text-blue-400 mb-1">
                    {selectedDriverForOpsReview.id}
                  </p>
                  <p className="text-white font-bold">
                    {selectedDriverForOpsReview.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {selectedDriverForOpsReview.phone} •{" "}
                    {selectedDriverForOpsReview.vehicleCategory}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                    Current Status
                  </span>
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-sm text-white font-bold">
                    {selectedDriverForOpsReview.status}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Activity Thread
              </h4>
              {renderActivityTimeline(selectedDriverForOpsReview.id)}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">
                    Add Notes / Comments
                  </label>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="e.g., Insurance document is missing..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
                <Button
                  variant="danger"
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "Rejected",
                    )
                  }
                  className="h-10 text-[10px]"
                >
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "Waiting For Documents",
                    )
                  }
                  className="h-10 text-[10px]"
                >
                  Req. Documents
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "Verification",
                    )
                  }
                  className="h-10 text-[10px]"
                >
                  To Verification
                </Button>
                <Button
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "Approved",
                    )
                  }
                  className="h-10 text-[10px] !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                >
                  Final Approve
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
