import React, { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  CheckCircle,
  CalendarClock,
  FileWarning,
  Users,
  Car,
  UserPlus,
  Briefcase,
  AlertCircle,
  Bug,
  HelpCircle,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";
import { GenericFormModal } from "../../components/modals/GenericFormModal";
import { TicketDetailWorkspace } from "../shared/TicketDetailWorkspace";

export const AdminDashboard = () => {
  const {
    db,
    currentAdmin,
    toggleSystemOffline,
    advanceApproval,
    rejectApproval,
    createOnboarding,
  } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("global");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showInternForm, setShowInternForm] = useState(false);
  const [showContractorForm, setShowContractorForm] = useState(false);

  const isHR = currentAdmin?.tags.includes("HR");

  const getTypeIcon = (type: string) => {
    if (type === "Incident")
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === "Bug") return <Bug className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      {!selectedTicketId ? (
        <div className="flex-1 flex h-full bg-[#0A0A0A] border border-purple-500/20 rounded-[2rem] shadow-2xl overflow-hidden z-10 flex-col md:flex-row">
          <div className="w-full md:w-64 bg-[#121214] border-r border-white/5 flex flex-col shrink-0">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-500 rounded-lg flex items-center justify-center font-black text-lg">
                  {currentAdmin?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-white font-bold">{currentAdmin?.name}</h2>
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 font-bold uppercase">
                    {currentAdmin?.tags[0]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">
                  Support
                </p>
                <button
                  onClick={() => setActiveTab("global")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "global" ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <Activity className="w-4 h-4" /> Global Tickets
                </button>
              </div>

              {isHR && (
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">
                    HR & Operations
                  </p>
                  <div className="space-y-1">
                    {[
                      {
                        id: "hr_dashboard",
                        label: "Dashboard",
                        icon: LayoutDashboard,
                      },
                      {
                        id: "approvals",
                        label: "Approval Center",
                        icon: CheckCircle,
                      },
                      {
                        id: "attendance_shifts",
                        label: "Attendance & Shifts",
                        icon: CalendarClock,
                      },
                      {
                        id: "compliance",
                        label: "Compliance",
                        icon: FileWarning,
                      },
                      { id: "directory", label: "Directory", icon: Users },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isHR && (
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">
                    Management
                  </p>
                  <button
                    onClick={() => setActiveTab("approvals")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "approvals" ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    <CheckCircle className="w-4 h-4" /> Approvals
                  </button>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">
                  System
                </p>
                <div className="px-4 py-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-red-500">
                      Emergency Override
                    </span>
                    <button
                      onClick={toggleSystemOffline}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${db.systemOffline ? "bg-red-500" : "bg-zinc-700"}`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${db.systemOffline ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                  {db.systemOffline ? (
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                      SYSTEM OFFLINE
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                      System Online
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#050505] flex flex-col relative">
            {activeTab === "global" && (
              <>
                <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-black shrink-0">
                  <h2 className="text-2xl font-black text-white">
                    Global Tickets Database
                  </h2>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-16">
                        T
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Key
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">
                        Summary
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Assignee
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {db.tickets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest"
                        >
                          No tickets in system
                        </td>
                      </tr>
                    ) : (
                      db.tickets.map((ticket: any) => (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className="hover:bg-white/[0.02] cursor-pointer group transition-colors"
                        >
                          <td className="px-6 py-4">
                            {getTypeIcon(ticket.issueType)}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-purple-400 group-hover:underline">
                            {ticket.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm truncate">
                              {ticket.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-zinc-300">
                            {ticket.assignedTo || "Unassigned"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-300 px-2 py-1 rounded">
                              {ticket.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === "hr_dashboard" && isHR && (
              <div className="p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-black text-white mb-6">
                  HR Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    {
                      label: "Drivers Pending",
                      val: 128,
                      color: "text-blue-400",
                    },
                    {
                      label: "Interns Onboarding",
                      val: 5,
                      color: "text-purple-400",
                    },
                    {
                      label: "Contractors Pending",
                      val: 3,
                      color: "text-orange-400",
                    },
                    {
                      label: "Attendance",
                      val: "92%",
                      color: "text-green-400",
                    },
                    { label: "Clocked In", val: 27, color: "text-white" },
                    {
                      label: "Compliance Alerts",
                      val: 8,
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowDriverForm(true)}
                        className="w-full justify-start !bg-white/5 hover:!bg-white/10 text-white border border-white/10 shadow-none"
                      >
                        <Car className="w-5 h-5 mr-3" /> Add Driver
                      </Button>
                      <Button
                        onClick={() => setShowInternForm(true)}
                        className="w-full justify-start !bg-white/5 hover:!bg-white/10 text-white border border-white/10 shadow-none"
                      >
                        <UserPlus className="w-5 h-5 mr-3" /> Add Intern
                      </Button>
                      <Button
                        onClick={() => setShowContractorForm(true)}
                        className="w-full justify-start !bg-white/5 hover:!bg-white/10 text-white border border-white/10 shadow-none"
                      >
                        <Briefcase className="w-5 h-5 mr-3" /> Add Contractor
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "approvals" && (
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h2 className="text-2xl font-black text-white mb-6">
                  Approval Center
                </h2>
                <div className="space-y-8 flex-1 overflow-auto pr-2">
                  {/* INTERN SECTION */}
                  <div className="bg-[#121214] border border-purple-500/10 rounded-3xl p-6">
                    <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-purple-500" /> Intern
                      Onboarding
                    </h3>
                    <div className="space-y-4">
                      {db.onboardingRequests.filter((r: any) =>
                        isHR
                          ? r.status === "pending_hr"
                          : r.status === "pending_manager",
                      ).length === 0 ? (
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center py-4">
                          No pending approvals
                        </p>
                      ) : (
                        db.onboardingRequests
                          .filter((r: any) =>
                            isHR
                              ? r.status === "pending_hr"
                              : r.status === "pending_manager",
                          )
                          .map((req: any) => (
                            <div
                              key={req.id}
                              className="bg-black/50 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                              <div>
                                <p className="text-white font-bold text-lg">
                                  {req.name}{" "}
                                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded ml-2 uppercase">
                                    Awaiting {isHR ? "HR" : "Manager"}
                                  </span>
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                  {req.role} • {req.department}
                                </p>
                              </div>
                              <div className="flex gap-3 w-full md:w-auto">
                                <Button
                                  variant="danger"
                                  onClick={() =>
                                    rejectApproval("Intern", req.id)
                                  }
                                  className="flex-1 md:flex-none h-10 px-4 py-0 text-xs"
                                >
                                  Reject
                                </Button>
                                <Button
                                  onClick={() =>
                                    advanceApproval(
                                      "Intern",
                                      req.id,
                                      req.status,
                                    )
                                  }
                                  className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-purple-600 hover:!bg-purple-500 text-white shadow-none border-0"
                                >
                                  {isHR
                                    ? "Approve & Add to Directory"
                                    : "Approve & Send to HR"}
                                </Button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                  {/* DRIVER SECTION */}
                  <div className="bg-[#121214] border border-blue-500/10 rounded-3xl p-6">
                    <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-500" /> Driver
                      Onboarding
                    </h3>
                    <div className="space-y-4">
                      {db.driverApplications.filter((r: any) =>
                        isHR
                          ? r.status === "pending_hr"
                          : r.status === "pending_manager",
                      ).length === 0 ? (
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center py-4">
                          No pending approvals
                        </p>
                      ) : (
                        db.driverApplications
                          .filter((r: any) =>
                            isHR
                              ? r.status === "pending_hr"
                              : r.status === "pending_manager",
                          )
                          .map((req: any) => (
                            <div
                              key={req.id}
                              className="bg-black/50 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                              <div>
                                <p className="text-white font-bold text-lg">
                                  {req.name}{" "}
                                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2 uppercase">
                                    Awaiting {isHR ? "HR" : "Manager"}
                                  </span>
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                  {req.vehicle} • {req.phone}
                                </p>
                              </div>
                              <div className="flex gap-3 w-full md:w-auto">
                                <Button
                                  variant="danger"
                                  onClick={() =>
                                    rejectApproval("Driver", req.id)
                                  }
                                  className="flex-1 md:flex-none h-10 px-4 py-0 text-xs"
                                >
                                  Reject
                                </Button>
                                <Button
                                  onClick={() =>
                                    advanceApproval(
                                      "Driver",
                                      req.id,
                                      req.status,
                                    )
                                  }
                                  className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                                >
                                  {isHR
                                    ? "Approve & Activate Driver"
                                    : "Approve & Send to HR"}
                                </Button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODALS */}
            {showDriverForm && (
              <GenericFormModal
                title="Driver Registration Form"
                fields={[
                  {
                    name: "name",
                    label: "Full Name",
                    placeholder: "e.g. Ramesh Kumar",
                  },
                  {
                    name: "phone",
                    label: "Mobile Number",
                    placeholder: "+91...",
                  },
                  {
                    name: "vehicle",
                    label: "Vehicle Category & Model",
                    type: "select",
                    options: [
                      "AC Mini - Tata Tigor",
                      "AC Sedan - Swift Dzire",
                      "AC XL - Innova",
                    ],
                  },
                  {
                    name: "dl",
                    label: "Driving License No.",
                    placeholder: "DL-XXXX...",
                  },
                ]}
                onSubmit={(data) => {
                  createOnboarding("Driver", data);
                }}
                onClose={() => setShowDriverForm(false)}
              />
            )}
            {showInternForm && (
              <GenericFormModal
                title="Intern Onboarding Form"
                fields={[
                  {
                    name: "name",
                    label: "Full Name",
                    placeholder: "e.g. Pooja Singh",
                  },
                  {
                    name: "email",
                    label: "Email",
                    placeholder: "pooja@miles.com",
                  },
                  {
                    name: "department",
                    label: "Department",
                    type: "select",
                    options: ["Engineering", "Operations", "Marketing"],
                  },
                  {
                    name: "role",
                    label: "Role Title",
                    placeholder: "e.g. Backend Intern",
                  },
                ]}
                onSubmit={(data) => {
                  createOnboarding("Intern", data);
                }}
                onClose={() => setShowInternForm(false)}
              />
            )}
            {showContractorForm && (
              <GenericFormModal
                title="Contractor Onboarding Form"
                fields={[
                  {
                    name: "name",
                    label: "Vendor Name",
                    placeholder: "e.g. TechCorp Solutions",
                  },
                  {
                    name: "type",
                    label: "Contract Type",
                    type: "select",
                    options: [
                      "IT Support",
                      "Fleet Maintenance",
                      "Marketing Agency",
                    ],
                  },
                  {
                    name: "email",
                    label: "Primary Contact Email",
                    placeholder: "contact@vendor.com",
                  },
                ]}
                onSubmit={(data) => {
                  createOnboarding("Contractor", data);
                }}
                onClose={() => setShowContractorForm(false)}
              />
            )}
          </div>
        </div>
      ) : (
        <TicketDetailWorkspace
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
          asAdmin={true}
        />
      )}
    </div>
  );
};
