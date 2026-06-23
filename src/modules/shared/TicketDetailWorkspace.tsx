import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Zap,
  User,
  AlertCircle,
  Bug,
  HelpCircle,
  Activity,
  CircleDot,
  Paperclip,
  FileText,
  Tag,
  PhoneCall,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";

export const TicketDetailWorkspace = ({
  ticketId,
  onBack,
  asAdmin = false,
}: {
  ticketId: string;
  onBack: () => void;
  asAdmin?: boolean;
}) => {
  const {
    db,
    currentAgent,
    currentAdmin,
    sendMessage,
    assignTicket,
    endChatAgent,
    updateTicketDetails,
    linkTicket,
  } = useGlobalContext();
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editData, setEditData] = useState({ priority: "", category: "" });
  const [linkData, setLinkData] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ticket = db.tickets.find((t: any) => t.id === ticketId);
  const messages = db.messages.filter((m: any) => m.ticketId === ticketId);
  const customer = db.customers[ticket?.customerId] || db.currentUser;

  const activeUserName = asAdmin
    ? currentAdmin?.name || "Admin"
    : currentAgent?.name || "Agent";
  const activeUserId = asAdmin ? currentAdmin?.id || "ADMIN" : currentAgent?.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (!ticket) return null;

  const handleReply = (e?: React.FormEvent, predefinedText?: string) => {
    e?.preventDefault();
    const textToSend = predefinedText || replyText;
    if (!textToSend.trim()) return;
    if (!ticket.assignedTo && !asAdmin) assignTicket(ticket.id, activeUserId);

    if (isInternalNote && !predefinedText) {
      sendMessage(ticket.id, activeUserId, "internal", textToSend);
    } else {
      sendMessage(ticket.id, activeUserId, "agent", textToSend);
    }
    setReplyText("");
  };

  const handleAgentEndChat = () => {
    endChatAgent(ticket.id, activeUserName);
    onBack();
  };

  const handleCallCustomer = () => {
    sendMessage(
      ticket.id,
      activeUserId,
      "system",
      `Agent ${activeUserName} initiated an outbound call to customer.`,
    );
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

  const getSenderName = (msg: any) => {
    if (msg.senderType === "customer") return customer.name;
    if (msg.senderType === "ai") return "System Bot";
    if (msg.senderType === "agent" || msg.senderType === "internal") {
      const agent = db.agents.find((a: any) => a.id === msg.senderId);
      const admin = db.adminUsers.find((a: any) => a.id === msg.senderId);
      const emp = db.employees.find((e: any) => e.id === msg.senderId);
      return agent?.name || admin?.name || emp?.name || "Agent";
    }
    return "System";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute inset-0 z-40 md:relative md:z-auto flex h-full bg-[#0A0A0A] md:rounded-[2rem] border border-white/5 overflow-hidden flex-col md:flex-row shadow-2xl"
    >
      <div className="flex-1 flex flex-col min-w-0 md:border-r border-white/5 bg-[#050505] z-10">
        <div className="p-4 md:p-6 bg-white/5 border-b border-white/10 shrink-0 z-20">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-3">
            <button
              onClick={onBack}
              className="hover:text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <span className="mx-2">/</span>
            <span
              className={`${asAdmin ? "text-purple-400" : "text-[#FFD100]"} font-mono tracking-wider`}
            >
              {ticket.id}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <h2 className="text-white font-black text-xl md:text-2xl">
              {ticket.subject}
            </h2>
            <div className="hidden sm:flex gap-3">
              {!ticket.assignedTo && !asAdmin ? (
                <Button
                  onClick={() => assignTicket(ticket.id, activeUserId)}
                  className="h-9 py-0 text-xs rounded-xl"
                >
                  Assign to Me
                </Button>
              ) : ticket.status !== "Resolved" && !asAdmin ? (
                <Button
                  variant="danger"
                  onClick={handleAgentEndChat}
                  className="h-9 py-0 text-xs rounded-xl"
                >
                  Resolve Issue
                </Button>
              ) : ticket.status === "Resolved" ? (
                <span className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold uppercase tracking-widest">
                  Resolved
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Activity className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Activity Stream
            </span>
          </div>

          {ticket.aiInsights && (
            <div className="bg-[#FFD100]/5 border border-[#FFD100]/20 rounded-xl p-4 mb-6 shadow-inner shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#FFD100]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD100]">
                  AI Diagnosis Engine
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-medium mb-3">
                {ticket.aiInsights.analysis}
              </p>
              <div className="flex gap-4">
                <span className="text-xs bg-black/50 px-2 py-1 rounded border border-white/5 text-white">
                  <span className="text-zinc-500">Confidence:</span>{" "}
                  {ticket.aiInsights.confidenceScore}%
                </span>
                <span className="text-xs bg-black/50 px-2 py-1 rounded border border-white/5 text-white">
                  <span className="text-zinc-500">Risk:</span>{" "}
                  {ticket.aiInsights.fraudRisk}
                </span>
              </div>
            </div>
          )}

          {messages.map((msg: any) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col shrink-0 ${msg.senderType === "agent" || msg.senderType === "internal" ? "items-end" : "items-start"}`}
            >
              {msg.senderType === "system" ? (
                <div className="w-full flex justify-center my-2">
                  <span className="bg-white/5 text-zinc-500 text-[9px] font-bold uppercase tracking-widest py-1 px-3 rounded-md border border-white/10 flex items-center gap-1">
                    <CircleDot className="w-3 h-3" /> {msg.text}
                  </span>
                </div>
              ) : (
                <div
                  className={`max-w-[90%] md:max-w-[75%] ${msg.senderType === "agent" || msg.senderType === "internal" ? "" : "flex gap-3"}`}
                >
                  {msg.senderType !== "agent" &&
                    msg.senderType !== "internal" && (
                      <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                        {msg.senderType === "ai" ? (
                          <Zap
                            className={`w-4 h-4 ${asAdmin ? "text-purple-400" : "text-[#FFD100]"}`}
                          />
                        ) : (
                          <User className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                    )}
                  <div>
                    <div
                      className={`flex items-baseline gap-2 mb-1 ${msg.senderType === "agent" || msg.senderType === "internal" ? "justify-end" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {getSenderName(msg)}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-3 text-sm rounded-xl font-medium shadow-md ${
                        msg.senderType === "agent"
                          ? `bg-[#1A1A1C] border border-white/10 text-white rounded-tr-sm`
                          : msg.senderType === "internal"
                            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-tr-sm"
                            : "bg-white/5 text-white border border-white/5 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} className="shrink-0" />
        </div>

        {ticket.status !== "Resolved" && !asAdmin && (
          <div className="p-4 bg-[#0A0A0A] border-t border-white/5 shrink-0">
            <div className="flex gap-4 mb-2">
              <button
                onClick={() => setIsInternalNote(false)}
                className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${!isInternalNote ? "text-white bg-white/10" : "text-zinc-500 hover:text-white"}`}
              >
                Public Reply
              </button>
              <button
                onClick={() => setIsInternalNote(true)}
                className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 ${isInternalNote ? "text-yellow-500 bg-yellow-500/10" : "text-zinc-500 hover:text-yellow-500"}`}
              >
                Internal Note
              </button>
            </div>

            {!isInternalNote && (
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                {[
                  "I am looking into this right now.",
                  "Could you share a screenshot of the issue?",
                  "I've initiated a refund for you.",
                  "Is there anything else I can help with?",
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleReply(undefined, preset)}
                    className="text-[10px] whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleReply}
              className="relative flex flex-col gap-2"
            >
              <div
                className={`bg-black/50 border rounded-xl overflow-hidden transition-all p-1 ${isInternalNote ? "border-yellow-500/30" : "border-white/10 focus-within:border-[#FFD100]/50"}`}
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? "Add an internal note (customers won't see this)..."
                      : "Reply to customer..."
                  }
                  className={`w-full bg-transparent px-3 py-2 text-sm focus:outline-none resize-none font-medium h-20 ${isInternalNote ? "text-yellow-500" : "text-white"}`}
                />
                <div className="flex justify-between items-center px-2 pb-1">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white/10 rounded text-zinc-400"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white/10 rounded text-zinc-400"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="h-8 py-0 px-4 rounded-lg text-xs"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Right Column: Details Panel */}
      <div className="hidden md:flex flex-col w-80 bg-[#0A0A0A] overflow-y-auto border-l border-white/5 shrink-0">
        <div className="h-14 px-5 border-b border-white/5 flex items-center bg-white/5 shrink-0">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">
            Details
          </h3>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditData({
                  priority: ticket.priority,
                  category: ticket.category,
                });
                setIsEditModalOpen(true);
              }}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg text-xs font-bold text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg text-xs font-bold text-white transition-colors"
            >
              Link Issue
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Assignee
              </span>
              {asAdmin ? (
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  value={ticket.assignedTo || ""}
                  onChange={(e) => assignTicket(ticket.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {db.agents.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                  <div className="w-6 h-6 bg-[#FFD100]/20 text-[#FFD100] rounded-md flex items-center justify-center text-xs font-bold">
                    {ticket.assignedTo
                      ? db.agents
                          .find((a: any) => a.id === ticket.assignedTo)
                          ?.name.charAt(0)
                      : "?"}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {db.agents.find((a: any) => a.id === ticket.assignedTo)
                      ?.name || "Unassigned"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
                Reporter
                {!asAdmin && (
                  <button
                    onClick={handleCallCustomer}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </button>
                )}
              </span>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="w-6 h-6 bg-white/10 text-white rounded-md flex items-center justify-center text-xs font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">
                    {customer.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {ticket.customerId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Priority
              </span>
              <div
                className={`text-xs font-bold px-3 py-2 rounded-lg border flex items-center gap-2 ${getPriorityColor(ticket.priority)}`}
              >
                <AlertCircle className="w-4 h-4" /> {ticket.priority}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Labels
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {ticket.category}
                </span>
                <span className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> App
                </span>
              </div>
            </div>

            {ticket.feedback && (
              <div className="flex flex-col gap-1 mt-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Customer Feedback
                </span>
                <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                  <span className="text-lg font-bold text-[#FFD100] block mb-1">
                    {ticket.feedback.rating} ★
                  </span>
                  <p className="text-xs text-zinc-300 italic">
                    "{ticket.feedback.comment || "No comment provided"}"
                  </p>
                </div>
              </div>
            )}

            <div className="h-px bg-white/5 my-4"></div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Environment
              </span>
              <span className="text-xs text-zinc-300 font-mono">
                {ticket.environment}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Created
              </span>
              <span className="text-xs text-zinc-300">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Jira Modals (Edit / Link) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-white font-black text-lg mb-4">
                Edit Ticket
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">
                    Priority
                  </label>
                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                    className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none ${asAdmin ? "focus:border-purple-500" : "focus:border-[#FFD100]"}`}
                  >
                    <option value="P1 - Critical">P1 - Critical</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">
                    Category
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none ${asAdmin ? "focus:border-purple-500" : "focus:border-[#FFD100]"}`}
                  >
                    <option value="Payment / Billing">Payment / Billing</option>
                    <option value="Safety Incident">Safety Incident</option>
                    <option value="Driver Behavior">Driver Behavior</option>
                    <option value="Lost Item">Lost Item</option>
                    <option value="General Support">General Support</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateTicketDetails(ticket.id, editData);
                    setIsEditModalOpen(false);
                  }}
                  className={`flex-1 h-10 ${asAdmin ? "!bg-purple-600 hover:!bg-purple-500 shadow-none border-0 text-white" : ""}`}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {isLinkModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-white font-black text-lg mb-4">Link Issue</h3>
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-2">
                  Enter Ticket Key
                </label>
                <input
                  type="text"
                  value={linkData}
                  onChange={(e) => setLinkData(e.target.value)}
                  placeholder="e.g. CUST-001-XYZ123"
                  className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none ${asAdmin ? "focus:border-purple-500" : "focus:border-[#FFD100]"}`}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    linkTicket(ticket.id, linkData);
                    setIsLinkModalOpen(false);
                  }}
                  className={`flex-1 h-10 ${asAdmin ? "!bg-purple-600 hover:!bg-purple-500 shadow-none border-0 text-white" : ""}`}
                >
                  Link
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
