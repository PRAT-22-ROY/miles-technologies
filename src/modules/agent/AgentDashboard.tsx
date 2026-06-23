import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, Bug, HelpCircle } from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { TicketDetailWorkspace } from "../shared/TicketDetailWorkspace";

export const AgentDashboard = () => {
  const { db, currentAgent } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("mine");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const myTickets = db.tickets.filter(
    (t: any) => t.assignedTo === currentAgent.id && t.status !== "resolved",
  );
  const unassignedTickets = db.tickets.filter(
    (t: any) => !t.assignedTo && t.status !== "resolved",
  );
  const resolvedTickets = db.tickets.filter(
    (t: any) => t.status === "resolved",
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
    return <HelpCircle className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      {!selectedTicketId ? (
        <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden z-10">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Issue Navigator
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFD100]/50 w-64 font-medium"
                />
              </div>
            </div>
            <div className="flex gap-4 border-b border-white/10">
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
                { id: "resolved", label: "Done", count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-[#FFD100]" : "text-zinc-500 hover:text-white"}`}
                >
                  {tab.label}{" "}
                  {tab.count !== null && (
                    <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
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
                          {db.customers[ticket.customerId]?.name}
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
          </div>
        </div>
      ) : (
        <TicketDetailWorkspace
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};
