import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertCircle,
  Bug,
  HelpCircle,
  PhoneCall,
  X,
  User,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { TicketDetailWorkspace } from "../shared/TicketDetailWorkspace";
import { Button } from "../../components/ui/Button";

export const AgentDashboard = () => {
  const { db, currentAgent, claimCallback, updateCallbackStatus } =
    useGlobalContext();
  const [activeTab, setActiveTab] = useState("mine");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedCallback, setSelectedCallback] = useState<any>(null);

  const myTickets = db.tickets.filter(
    (t: any) =>
      t.assignedTo === currentAgent.id &&
      t.status !== "Resolved" &&
      t.status !== "Closed",
  );
  const unassignedTickets = db.tickets.filter(
    (t: any) =>
      !t.assignedTo && t.status !== "Resolved" && t.status !== "Closed",
  );
  const resolvedTickets = db.tickets.filter(
    (t: any) => t.status === "Resolved" || t.status === "Closed",
  );
  const callbacks = db.callbackRequests.filter(
    (c: any) => c.status !== "Closed",
  );

  const getActiveQueue = () => {
    if (activeTab === "mine") return myTickets;
    if (activeTab === "unassigned") return unassignedTickets;
    return resolvedTickets;
  };

  const getPriorityColor = (p: string) => {
    if (p.includes("P1")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (p.includes("P2"))
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    return "text-[#FFD100] bg-[#FFD100]/10 border-[#FFD100]/20";
  };

  const getTypeIcon = (type: string) => {
    if (type === "Incident")
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === "Bug") return <Bug className="w-4 h-4 text-red-500" />;
    if (type === "Safety")
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <HelpCircle className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      {!selectedTicketId ? (
        <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden z-10">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Issue Navigator
              </h1>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFD100]/50 w-full md:w-64 font-medium"
                />
              </div>
            </div>
            <div className="flex gap-4 border-b border-white/10 overflow-x-auto pb-1">
              {[
                {
                  id: "mine",
                  label: "My Open Issues",
                  count: myTickets.length,
                },
                {
                  id: "unassigned",
                  label: "Unassigned Queue",
                  count: unassignedTickets.length,
                },
                {
                  id: "callbacks",
                  label: "Callback Requests",
                  count: callbacks.length,
                },
                { id: "resolved", label: "Done", count: null },
                { id: "profile", label: "My Profile", count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-1 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-[#FFD100]" : "text-zinc-500 hover:text-white"}`}
                >
                  {tab.label}{" "}
                  {tab.count !== null && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${tab.count > 0 && tab.id === "callbacks" ? "bg-blue-500/20 text-blue-400" : "bg-white/10"}`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="dashTab"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD100]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#050505]">
            {activeTab === "profile" ? (
              <div className="p-8 max-w-lg mx-auto mt-10 text-center">
                <div className="w-24 h-24 bg-[#FFD100]/10 border border-[#FFD100]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <User className="w-12 h-12 text-[#FFD100]" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">
                  {currentAgent?.name}
                </h2>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-8">
                  {currentAgent?.role}
                </p>

                <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 text-left space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Agent ID
                    </p>
                    <p className="text-white font-mono">{currentAgent?.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Email Address
                    </p>
                    <p className="text-white">{currentAgent?.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Status
                    </p>
                    <p className="text-green-400 font-bold">Online / Active</p>
                  </div>
                </div>
              </div>
            ) : activeTab === "callbacks" ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                      CB Key
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/4">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/4">
                      Issue
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                      Pref. Time
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
                  {callbacks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest"
                      >
                        No pending callbacks
                      </td>
                    </tr>
                  ) : (
                    callbacks.map((cb: any) => (
                      <tr
                        key={cb.id}
                        className="hover:bg-white/[0.02] group transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-blue-400">
                          {cb.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm truncate">
                            {cb.customerName}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            {cb.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm truncate">
                            {cb.issueCategory}
                          </div>
                          <div className="text-[10px] font-bold px-2 py-1 rounded border inline-block mt-1 bg-red-500/10 text-red-500 border-red-500/20">
                            {cb.priority}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-zinc-300">
                          {cb.preferredTime}
                        </td>
                        <td className="px-6 py-4">
                          {cb.status === "Callback Requested" ? (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-300 px-2 py-1 rounded">
                              Open
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                              Claimed by{" "}
                              {
                                db.agents.find(
                                  (a: any) => a.id === cb.assignedTo,
                                )?.name
                              }
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => setSelectedCallback(cb)}
                            className="h-8 px-4 py-0 text-xs shadow-none bg-white/10 hover:bg-white/20 text-white"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
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
                      Priority
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {getActiveQueue().length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest"
                      >
                        No issues found
                      </td>
                    </tr>
                  ) : (
                    getActiveQueue().map((ticket: any) => (
                      <tr
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className="hover:bg-white/[0.02] cursor-pointer group transition-colors"
                      >
                        <td className="px-6 py-4">
                          {getTypeIcon(ticket.issueType)}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#FFD100] group-hover:underline">
                          {ticket.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm truncate">
                            {ticket.subject}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            {db.customers[ticket.customerId]?.name || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded border ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-300 px-2 py-1 rounded">
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-zinc-500 font-medium">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <TicketDetailWorkspace
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
        />
      )}

      <AnimatePresence>
        {selectedCallback && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121214] border border-blue-500/30 p-6 md:p-8 rounded-[2rem] w-full max-w-3xl shadow-2xl flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-black text-xl flex items-center gap-2">
                    <PhoneCall className="w-6 h-6 text-blue-400" /> Callback
                    Details
                  </h3>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-4">
                  <p className="text-xs font-mono text-blue-400 mb-1">
                    {selectedCallback.id}
                  </p>
                  <p className="text-white font-bold text-lg">
                    {selectedCallback.issueCategory}
                  </p>
                  <p className="text-sm text-zinc-400 mt-2">
                    {selectedCallback.notes}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
                      Requested Time
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {selectedCallback.preferredTime}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
                      Status
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {selectedCallback.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {selectedCallback.status === "Callback Requested" && (
                    <Button
                      onClick={() => {
                        claimCallback(selectedCallback.id, currentAgent.id);
                        setSelectedCallback({
                          ...selectedCallback,
                          status: "Claimed",
                          assignedTo: currentAgent.id,
                        });
                      }}
                      className="w-full !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                    >
                      Claim Callback
                    </Button>
                  )}
                  {selectedCallback.status === "Claimed" &&
                    selectedCallback.assignedTo === currentAgent.id && (
                      <>
                        <Button
                          onClick={() =>
                            updateCallbackStatus(
                              selectedCallback.id,
                              "In Progress",
                            )
                          }
                          className="w-full !bg-green-600 hover:!bg-green-500 text-white shadow-none border-0"
                        >
                          Start Call
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            updateCallbackStatus(selectedCallback.id, "Closed")
                          }
                          className="w-full"
                        >
                          Mark as Closed
                        </Button>
                      </>
                    )}
                  {selectedCallback.status === "In Progress" &&
                    selectedCallback.assignedTo === currentAgent.id && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          updateCallbackStatus(selectedCallback.id, "Closed")
                        }
                        className="w-full"
                      >
                        End Call & Close
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCallback(null)}
                    className="w-full border border-transparent"
                  >
                    Close Window
                  </Button>
                </div>
              </div>

              {/* Right Panel: Customer Context */}
              <div className="w-full md:w-80 bg-black/40 border border-white/5 rounded-2xl p-5 overflow-y-auto">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer Context
                </h4>

                <div className="mb-6">
                  <p className="text-white font-bold">
                    {selectedCallback.customerName}
                  </p>
                  <p className="text-blue-400 font-mono text-sm">
                    {selectedCallback.phone}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">
                      Joined {db.currentUser.joined}
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">
                      {db.currentUser.rating} ★
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Recent Ride
                  </h5>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-white font-semibold truncate">
                      {db.recentRide.from} → {db.recentRide.to}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Driver: {db.recentRide.driver}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Fare: ₹{db.recentRide.fare}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Ticket History
                  </h5>
                  <div className="space-y-2">
                    {db.tickets
                      .filter((t: any) => t.customerId === db.currentUser.id)
                      .slice(0, 3)
                      .map((t: any) => (
                        <div
                          key={t.id}
                          className="bg-white/5 p-2 rounded-lg border border-white/5"
                        >
                          <p className="text-[10px] text-[#FFD100] font-mono">
                            {t.id}
                          </p>
                          <p className="text-xs text-white truncate">
                            {t.subject}
                          </p>
                        </div>
                      ))}
                    {db.tickets.filter(
                      (t: any) => t.customerId === db.currentUser.id,
                    ).length === 0 && (
                      <p className="text-xs text-zinc-500 italic">
                        No previous tickets
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
