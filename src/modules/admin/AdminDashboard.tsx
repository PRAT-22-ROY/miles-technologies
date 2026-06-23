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
  Shield,
  Edit,
  Trash,
  Check,
  X,
  FileText,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";
import { GenericFormModal } from "../../components/modals/GenericFormModal";
import { AdvancedFormModal } from "../../components/modals/AdvancedFormModal";
import { TicketDetailWorkspace } from "../shared/TicketDetailWorkspace";
import { motion, AnimatePresence } from "framer-motion";

export const AdminDashboard = () => {
  const {
    db,
    currentAdmin,
    toggleSystemOffline,
    advanceApproval,
    rejectApproval,
    createOnboarding,
    addTeamMember,
    updateTeamMember,
    updateDriverApp,
    addSystemAction,
  } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("global");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [showInternForm, setShowInternForm] = useState(false);
  const [showContractorForm, setShowContractorForm] = useState(false);
  const [showFullTimeForm, setShowFullTimeForm] = useState(false);
  const [showAddTeamMemberForm, setShowAddTeamMemberForm] = useState(false);

  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] =
    useState<any>(null);
  const [selectedDriverForReview, setSelectedDriverForReview] =
    useState<any>(null);
  const [selectedOpsTeam, setSelectedOpsTeam] = useState("Operations");
  const [assignNotes, setAssignNotes] = useState("");

  const isHR = currentAdmin?.tags.includes("HR");

  const getTypeIcon = (type: string) => {
    if (type === "Incident")
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === "Bug") return <Bug className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4 text-purple-400" />;
  };

  const handleEditMemberSave = (data: any) => {
    const formattedData = {
      ...data,
      permissions: {
        dashboard: data.perm_dashboard || [],
        hr: data.perm_hr || [],
        operations: data.perm_ops || [],
        support: data.perm_support || [],
        admin: data.perm_admin || [],
      },
    };
    updateTeamMember(selectedEmployeeForEdit.id, formattedData);
    setSelectedEmployeeForEdit(null);
  };

  const handleAddMemberSave = (data: any) => {
    const formattedData = {
      ...data,
      permissions: {
        dashboard: data.perm_dashboard || [],
        hr: data.perm_hr || [],
        operations: data.perm_ops || [],
        support: data.perm_support || [],
        admin: data.perm_admin || [],
      },
    };
    addTeamMember(formattedData);
    setShowAddTeamMemberForm(false);
  };

  const handleAssignToTeam = () => {
    if (selectedOpsTeam && selectedDriverForReview) {
      updateDriverApp(selectedDriverForReview.id, {
        status: "Assigned",
        assignedTeam: selectedOpsTeam,
      });
      if (assignNotes) {
        addSystemAction(selectedDriverForReview.id, `HR Note: ${assignNotes}`);
      }
      setSelectedDriverForReview(null);
      setSelectedOpsTeam("Operations");
      setAssignNotes("");
    }
  };

  const renderPermissionsView = (emp: any) => {
    const p = emp.permissions || {};
    const allPerms = [
      ...(p.dashboard || []),
      ...(p.hr || []),
      ...(p.operations || []),
      ...(p.support || []),
      ...(p.admin || []),
    ];
    if (allPerms.length === 0)
      return (
        <span className="text-zinc-500 text-xs italic">No permissions</span>
      );
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {allPerms.map((perm: string) => (
          <span
            key={perm}
            className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-zinc-300"
          >
            {perm}
          </span>
        ))}
      </div>
    );
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

              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">
                  Admin
                </p>
                <button
                  onClick={() => setActiveTab("team_management")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "team_management" ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <Shield className="w-4 h-4" /> Team Management
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
                      { id: "directory", label: "Team Directory", icon: Users },
                      {
                        id: "driver_apps",
                        label: "Driver Applications",
                        icon: Car,
                      },
                      {
                        id: "driver_dir",
                        label: "Driver Directory",
                        icon: Users,
                      },
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

            {activeTab === "driver_apps" && isHR && (
              <div className="flex flex-col h-full">
                <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-black shrink-0">
                  <h2 className="text-2xl font-black text-white">
                    Driver Applications Queue
                  </h2>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        App ID
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Driver
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Vehicle
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {db.driverApplications.filter(
                      (d: any) =>
                        d.status !== "Approved" &&
                        d.status !== "Active" &&
                        d.status !== "Rejected",
                    ).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest"
                        >
                          No pending applications
                        </td>
                      </tr>
                    ) : (
                      db.driverApplications
                        .filter(
                          (d: any) =>
                            d.status !== "Approved" &&
                            d.status !== "Active" &&
                            d.status !== "Rejected",
                        )
                        .map((drv: any) => (
                          <tr key={drv.id} className="hover:bg-white/[0.02]">
                            <td className="px-6 py-4 font-mono text-xs text-blue-400">
                              {drv.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-sm">
                                {drv.name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {drv.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-300">
                              {drv.vehicleCategory} - {drv.vehicleModel}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-300 px-2 py-1 rounded">
                                {drv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                onClick={() => {
                                  setSelectedTicketId(drv.id);
                                }}
                                className="h-8 px-4 py-0 text-xs shadow-none bg-white/10 hover:bg-white/20 text-white"
                              >
                                View Application
                              </Button>
                              {drv.status === "HR Review" && (
                                <Button
                                  onClick={() =>
                                    setSelectedDriverForReview(drv)
                                  }
                                  className="h-8 px-4 py-0 text-xs ml-2 shadow-none !bg-blue-600 hover:!bg-blue-500 text-white border-0"
                                >
                                  Assign to Team
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "driver_dir" && isHR && (
              <div className="flex flex-col h-full">
                <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-green-900/20 to-black shrink-0">
                  <h2 className="text-2xl font-black text-white">
                    Active Driver Directory
                  </h2>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Driver ID
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Name & Mobile
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Vehicle Details
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Joining Date
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {db.activeDrivers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest"
                        >
                          No active drivers
                        </td>
                      </tr>
                    ) : (
                      db.activeDrivers.map((drv: any) => (
                        <tr key={drv.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4 font-mono text-xs text-green-400">
                            {drv.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm">
                              {drv.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {drv.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-300">
                            {drv.vehicleType} • {drv.vehicleNumber}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-400">
                            {new Date(drv.joiningDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 px-2 py-1 rounded">
                              {drv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "team_management" && (
              <div className="p-6 md:p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white">
                    Team Management
                  </h2>
                  <Button
                    onClick={() => setShowAddTeamMemberForm(true)}
                    className="!bg-purple-600 hover:!bg-purple-500 text-white shadow-none h-10 px-4 py-0 text-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
                  </Button>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                          Role & Type
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">
                          Permissions
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                          Status
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {db.employees.map((emp: any) => (
                        <tr key={emp.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white text-sm">
                              {emp.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {emp.email} • {emp.employeeId}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-white text-sm">
                              {emp.role}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {emp.department} • {emp.employmentType}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {renderPermissionsView(emp)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${emp.accountStatus === "Active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                            >
                              {emp.accountStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedEmployeeForEdit(emp)}
                              className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                              title="Edit Member"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateTeamMember(emp.id, {
                                  accountStatus:
                                    emp.accountStatus === "Active"
                                      ? "Inactive"
                                      : "Active",
                                })
                              }
                              className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors ml-2"
                              title={
                                emp.accountStatus === "Active"
                                  ? "Disable"
                                  : "Activate"
                              }
                            >
                              {emp.accountStatus === "Active" ? (
                                <Trash className="w-4 h-4 text-red-400" />
                              ) : (
                                <Check className="w-4 h-4 text-green-400" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "directory" && isHR && (
              <div className="p-6 md:p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white">
                    Team Directory
                  </h2>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                          Role & Type
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">
                          Permissions
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                          Status
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {db.employees.map((emp: any) => (
                        <tr key={emp.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white text-sm">
                              {emp.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {emp.email} • {emp.employeeId}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-white text-sm">
                              {emp.role}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {emp.department} • {emp.employmentType}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {renderPermissionsView(emp)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${emp.accountStatus === "Active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                            >
                              {emp.accountStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedEmployeeForEdit(emp)}
                              className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                              title="Edit Member"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateTeamMember(emp.id, {
                                  accountStatus:
                                    emp.accountStatus === "Active"
                                      ? "Inactive"
                                      : "Active",
                                })
                              }
                              className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors ml-2"
                              title={
                                emp.accountStatus === "Active"
                                  ? "Disable"
                                  : "Activate"
                              }
                            >
                              {emp.accountStatus === "Active" ? (
                                <Trash className="w-4 h-4 text-red-400" />
                              ) : (
                                <Check className="w-4 h-4 text-green-400" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
                      val: db.driverApplications.filter(
                        (d: any) =>
                          d.status !== "Approved" && d.status !== "Active",
                      ).length,
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
                      <Button
                        onClick={() => setShowFullTimeForm(true)}
                        className="w-full justify-start !bg-purple-500/20 hover:!bg-purple-500/30 text-purple-400 border border-purple-500/20 shadow-none"
                      >
                        <Users className="w-5 h-5 mr-3" /> Full Time Onboarding
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
                      <UserPlus className="w-5 h-5 text-purple-500" /> Employee
                      & Intern Onboarding
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
                                  {req.role} • {req.department} • {req.type}
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
                </div>
              </div>
            )}

            {/* MODALS */}
            {showAddTeamMemberForm && (
              <AdvancedFormModal
                title="Add Team Member"
                fields={[
                  {
                    name: "name",
                    label: "Full Name",
                    placeholder: "e.g. Rahul Sharma",
                  },
                  {
                    name: "email",
                    label: "Email",
                    placeholder: "rahul@miles.com",
                  },
                  {
                    name: "phone",
                    label: "Phone Number",
                    placeholder: "+91...",
                  },
                  {
                    name: "employeeId",
                    label: "Employee ID",
                    placeholder: "M-1004",
                  },
                  {
                    name: "department",
                    label: "Department",
                    type: "select",
                    options: ["Operations", "HR", "Engineering", "Support"],
                  },
                  {
                    name: "role",
                    label: "Designation",
                    placeholder: "e.g. Operations Executive",
                  },
                  {
                    name: "employmentType",
                    label: "Employment Type",
                    type: "select",
                    options: ["Full Time", "Intern", "Contractor"],
                  },
                  {
                    name: "accountStatus",
                    label: "Status",
                    type: "select",
                    options: ["Active", "Inactive"],
                  },
                  {
                    name: "perm_dashboard",
                    label: "Dashboard Access",
                    type: "checkbox-group",
                    options: ["View Dashboard", "Edit Dashboard"],
                  },
                  {
                    name: "perm_hr",
                    label: "HR Access",
                    type: "checkbox-group",
                    options: [
                      "Employee Onboarding",
                      "Attendance",
                      "Compliance",
                    ],
                  },
                  {
                    name: "perm_ops",
                    label: "Operations Access",
                    type: "checkbox-group",
                    options: [
                      "Driver Onboarding",
                      "Driver Approval",
                      "Driver Management",
                    ],
                  },
                  {
                    name: "perm_support",
                    label: "Support Access",
                    type: "checkbox-group",
                    options: ["Tickets", "Customer Support", "Escalations"],
                  },
                  {
                    name: "perm_admin",
                    label: "Admin Access",
                    type: "checkbox-group",
                    options: ["User Management", "Team Management", "Settings"],
                  },
                ]}
                onSubmit={handleAddMemberSave}
                onClose={() => setShowAddTeamMemberForm(false)}
              />
            )}

            {selectedEmployeeForEdit && (
              <AdvancedFormModal
                title={`Edit Permissions: ${selectedEmployeeForEdit.name}`}
                fields={[
                  {
                    name: "role",
                    label: "Designation",
                    placeholder: selectedEmployeeForEdit.role,
                  },
                  {
                    name: "department",
                    label: "Department",
                    type: "select",
                    options: ["Operations", "HR", "Engineering", "Support"],
                  },
                  {
                    name: "employmentType",
                    label: "Employment Type",
                    type: "select",
                    options: ["Full Time", "Intern", "Contractor"],
                  },
                  {
                    name: "perm_dashboard",
                    label: "Dashboard Access",
                    type: "checkbox-group",
                    options: ["View Dashboard", "Edit Dashboard"],
                  },
                  {
                    name: "perm_hr",
                    label: "HR Access",
                    type: "checkbox-group",
                    options: [
                      "Employee Onboarding",
                      "Attendance",
                      "Compliance",
                    ],
                  },
                  {
                    name: "perm_ops",
                    label: "Operations Access",
                    type: "checkbox-group",
                    options: [
                      "Driver Onboarding",
                      "Driver Approval",
                      "Driver Management",
                    ],
                  },
                  {
                    name: "perm_support",
                    label: "Support Access",
                    type: "checkbox-group",
                    options: ["Tickets", "Customer Support", "Escalations"],
                  },
                  {
                    name: "perm_admin",
                    label: "Admin Access",
                    type: "checkbox-group",
                    options: ["User Management", "Team Management", "Settings"],
                  },
                ]}
                initialData={{
                  role: selectedEmployeeForEdit.role,
                  department: selectedEmployeeForEdit.department,
                  employmentType: selectedEmployeeForEdit.employmentType,
                  perm_dashboard:
                    selectedEmployeeForEdit.permissions?.dashboard || [],
                  perm_hr: selectedEmployeeForEdit.permissions?.hr || [],
                  perm_ops:
                    selectedEmployeeForEdit.permissions?.operations || [],
                  perm_support:
                    selectedEmployeeForEdit.permissions?.support || [],
                  perm_admin: selectedEmployeeForEdit.permissions?.admin || [],
                }}
                onSubmit={handleEditMemberSave}
                onClose={() => setSelectedEmployeeForEdit(null)}
              />
            )}

            {showFullTimeForm && (
              <AdvancedFormModal
                title="Full Time Employee Onboarding"
                fields={[
                  {
                    name: "name",
                    label: "Full Name",
                    placeholder: "e.g. Rahul Sharma",
                  },
                  {
                    name: "email",
                    label: "Email",
                    placeholder: "rahul@miles.com",
                  },
                  {
                    name: "phone",
                    label: "Phone Number",
                    placeholder: "+91...",
                  },
                  {
                    name: "address",
                    label: "Address",
                    placeholder: "Bangalore, India",
                  },
                  {
                    name: "department",
                    label: "Department",
                    type: "select",
                    options: ["Engineering", "Operations", "HR", "Marketing"],
                  },
                  {
                    name: "role",
                    label: "Designation",
                    placeholder: "e.g. Operations Manager",
                  },
                  {
                    name: "reportingManager",
                    label: "Reporting Manager",
                    placeholder: "e.g. Neha",
                  },
                  { name: "joiningDate", label: "Joining Date", type: "date" },
                  {
                    name: "docs_aadhaar",
                    label: "Upload Aadhaar",
                    type: "file",
                  },
                  { name: "docs_pan", label: "Upload PAN", type: "file" },
                  { name: "docs_resume", label: "Upload Resume", type: "file" },
                  {
                    name: "docs_offer",
                    label: "Upload Offer Letter",
                    type: "file",
                  },
                  { name: "docs_nda", label: "Upload NDA", type: "file" },
                  {
                    name: "equipment",
                    label: "Equipment Allocation",
                    type: "checkbox-group",
                    options: ["Laptop", "Email", "Company Access"],
                  },
                ]}
                onSubmit={(data) => {
                  createOnboarding("Full Time", data);
                }}
                onClose={() => setShowFullTimeForm(false)}
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

            <AnimatePresence>
              {selectedDriverForReview && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-black text-lg">
                        Assign Application to Team
                      </h3>
                      <button
                        onClick={() => setSelectedDriverForReview(null)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="bg-black/50 rounded-xl p-4 mb-4 border border-white/5">
                      <p className="text-xs font-mono text-blue-400 mb-1">
                        {selectedDriverForReview.id}
                      </p>
                      <p className="text-white font-bold">
                        {selectedDriverForReview.name}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {selectedDriverForReview.vehicleCategory} •{" "}
                        {selectedDriverForReview.phone}
                      </p>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-2">
                          Assign To Team
                        </label>
                        <select
                          value={selectedOpsTeam}
                          onChange={(e) => setSelectedOpsTeam(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Operations">Operations Team</option>
                          <option value="Verification">
                            Verification Team
                          </option>
                          <option value="Training">Training Team</option>
                          <option value="Support">Support Team</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-2">
                          Internal Notes
                        </label>
                        <textarea
                          value={assignNotes}
                          onChange={(e) => setAssignNotes(e.target.value)}
                          placeholder="Add a note for the assigned team..."
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedDriverForReview(null)}
                        className="flex-1 h-10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAssignToTeam}
                        disabled={!selectedOpsTeam}
                        className="flex-[2] h-10 !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                      >
                        Assign & Update Status
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
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
