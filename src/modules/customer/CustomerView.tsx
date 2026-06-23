import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headset,
  MessageSquare,
  Zap,
  X,
  MapPin,
  User,
  Paperclip,
  Send,
  PhoneCall,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";
import { TiltCard } from "../../components/layout/TiltCard";
import { Floating3DBackground } from "../../components/layout/Floating3DBackground";
import { THEME } from "../../constants";

export const CustomerView = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const {
    db,
    createTicket,
    sendMessage,
    customerActiveTicketId,
    setCustomerActiveTicketId,
    isTyping,
    endChatCustomer,
    requestCallback,
  } = useGlobalContext();
  const [inputText, setInputText] = useState("");
  const [callbackData, setCallbackData] = useState({
    issueCategory: "",
    preferredTime: "",
    notes: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customerActiveTicketId) setIsChatOpen(true);
  }, [customerActiveTicketId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [db.messages, isChatOpen, isTyping]);

  const handleSend = (e?: React.FormEvent, prefill: string | null = null) => {
    e?.preventDefault();
    const textToSend = prefill || inputText;
    if (!textToSend.trim()) return;

    let currentId = customerActiveTicketId;
    if (!currentId) {
      currentId = createTicket(
        "General Support",
        "Medium",
        textToSend.substring(0, 30) + "...",
        textToSend,
      );
      setCustomerActiveTicketId(currentId);
    } else {
      sendMessage(currentId, db.currentUser.id, "customer", textToSend);
    }
    setInputText("");
  };

  const handleCustomerEndChat = () => {
    if (customerActiveTicketId) endChatCustomer(customerActiveTicketId);
    setIsChatOpen(false);
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestCallback(callbackData);
    setIsCallbackModalOpen(false);
    setCallbackData({ issueCategory: "", preferredTime: "", notes: "" });
  };

  const chatMessages = customerActiveTicketId
    ? db.messages.filter((m: any) => m.ticketId === customerActiveTicketId)
    : [];
  const currentTicket = customerActiveTicketId
    ? db.tickets.find((t: any) => t.id === customerActiveTicketId)
    : null;

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col bg-[#050505] overflow-hidden">
      <Floating3DBackground />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto w-full py-12 z-10">
        <TiltCard>
          <div className="relative mb-10">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-[#FFD100] rounded-full blur-2xl"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="w-28 h-28 bg-gradient-to-br from-[#FFD100] to-yellow-600 shadow-[0_20px_50px_-10px_rgba(255,209,0,0.5)] rounded-[2rem] flex items-center justify-center relative z-10 border border-white/20"
            >
              <Headset className="w-14 h-14 text-black drop-shadow-md" />
            </motion.div>
          </div>
        </TiltCard>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
        >
          Always{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD100] to-yellow-500">
            Connected.
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed font-medium max-w-lg"
        >
          Experience support that moves as fast as you do. AI powered, human
          backed.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row w-full justify-center gap-4"
        >
          <Button
            onClick={() => setIsChatOpen(true)}
            className="w-full sm:w-auto px-10 py-5 text-lg rounded-[1.5rem]"
          >
            <MessageSquare className="w-6 h-6 mr-3" /> Get Help Now
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsCallbackModalOpen(true)}
            className="w-full sm:w-auto px-10 py-5 text-lg rounded-[1.5rem]"
          >
            <PhoneCall className="w-6 h-6 mr-3 text-blue-400" /> Request
            Callback
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full md:w-[440px] h-full md:h-[720px] md:max-h-[85vh] flex flex-col ${THEME.panel} md:rounded-[2.5rem] z-50 overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]`}
          >
            <div className="bg-white/[0.02] backdrop-blur-3xl p-5 border-b border-white/10 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-tr from-[#FFD100] to-yellow-400 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#050505] rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-black text-lg tracking-tight leading-tight">
                    MILES Copilot
                  </h3>
                  {currentTicket && (
                    <p className="text-[9px] text-[#FFD100] font-mono tracking-widest uppercase mt-0.5 opacity-80">
                      {currentTicket.id}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {customerActiveTicketId && (
                  <button
                    onClick={handleCustomerEndChat}
                    className="text-[10px] uppercase tracking-widest text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/40 px-3 py-2 rounded-xl font-bold transition-all border border-red-500/20"
                  >
                    End Chat
                  </button>
                )}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/60 relative">
              {!customerActiveTicketId ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-8"
                >
                  <div className="mb-6 inline-block p-4 bg-white/5 rounded-3xl border border-white/10">
                    <MapPin className="w-8 h-8 text-[#FFD100] mx-auto mb-2" />
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                      Recent Ride Detect
                    </p>
                    <p className="text-white font-bold text-sm mt-1">
                      {db.recentRide.from} → {db.recentRide.to}
                    </p>
                  </div>
                  <h4 className="text-white font-black text-3xl mb-3">
                    Hi {db.currentUser.name.split(" ")[0]} 👋
                  </h4>
                  <p className="text-base text-zinc-400 mb-8 font-medium">
                    How can we assist you with your recent trip?
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      { text: "Driver took a long/wrong route", icon: MapPin },
                      { text: "I was overcharged for this ride", icon: Zap },
                      { text: "Talk to a live support agent", icon: User },
                    ].map((opt, i) => (
                      <motion.button
                        key={opt.text}
                        onClick={(e) => handleSend(e, opt.text)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-full flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/5 hover:border-[#FFD100]/50"
                      >
                        <div className="p-2 bg-black/50 rounded-xl">
                          <opt.icon className="w-4 h-4 text-[#FFD100]" />
                        </div>
                        {opt.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {chatMessages.map((msg: any) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex flex-col ${msg.senderType === "customer" ? "items-end" : "items-start"}`}
                    >
                      {msg.senderType === "system" ? (
                        <div className="w-full flex justify-center my-3">
                          <span className="text-[10px] text-[#FFD100] font-black uppercase tracking-widest bg-[#FFD100]/10 border border-[#FFD100]/20 px-4 py-2 rounded-full text-center">
                            {msg.text}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] px-6 py-4 text-sm shadow-2xl ${msg.senderType === "customer" ? "bg-[#FFD100] text-black rounded-3xl rounded-tr-lg font-bold" : "bg-white/10 text-white border border-white/10 rounded-3xl rounded-tl-lg backdrop-blur-md"}`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* AI Action Buttons */}
                      {msg.actionRequired === "Escalate" && (
                        <div className="mt-2 ml-2">
                          <Button
                            onClick={() =>
                              handleSend(undefined, "Connect to human agent")
                            }
                            className="h-8 text-[10px] px-3 py-0 !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                          >
                            Connect to Human Agent
                          </Button>
                        </div>
                      )}
                      {msg.actionRequired === "Callback" && (
                        <div className="mt-2 ml-2">
                          <Button
                            onClick={() => setIsCallbackModalOpen(true)}
                            className="h-8 text-[10px] px-3 py-0 !bg-purple-600 hover:!bg-purple-500 text-white shadow-none border-0"
                          >
                            Request Callback
                          </Button>
                        </div>
                      )}

                      {msg.senderType !== "system" && (
                        <span className="text-[10px] text-zinc-500 mt-2 mx-2 font-bold tracking-widest uppercase">
                          {msg.senderType === "agent"
                            ? "Agent"
                            : msg.senderType === "ai"
                              ? "AI"
                              : ""}{" "}
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start"
                    >
                      <div className="bg-white/10 border border-white/10 rounded-3xl rounded-tl-lg px-5 py-4 flex gap-1.5 items-center">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="w-2 h-2 bg-[#FFD100] rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-[#FFD100] rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-[#FFD100] rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 bg-[#0A0A0A]/90 backdrop-blur-3xl border-t border-white/10 shrink-0 pb-safe">
              {currentTicket?.status === "offline_queued" ? (
                <div className="text-center p-3 border border-red-500/20 bg-red-500/10 rounded-xl">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest">
                    Chat Unavailable
                  </p>
                  <Button
                    onClick={() => setIsCallbackModalOpen(true)}
                    className="mt-2 h-8 text-[10px] px-3 py-0 !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                  >
                    Request Callback Instead
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => handleSend(e, null)}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={currentTicket?.status === "Resolved"}
                      placeholder={
                        currentTicket?.status === "Resolved"
                          ? "Chat ended."
                          : "Type your message..."
                      }
                      className="w-full bg-black/60 border border-white/10 rounded-2xl pl-5 pr-12 py-4.5 text-sm text-white focus:outline-none focus:border-[#FFD100]/50 transition-all placeholder:text-zinc-600 font-semibold disabled:opacity-50"
                    />
                    <Paperclip className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 cursor-pointer hover:text-[#FFD100] transition-colors" />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      !inputText.trim() || currentTicket?.status === "Resolved"
                    }
                    className="w-14 h-14 bg-[#FFD100] hover:bg-yellow-400 disabled:bg-white/5 disabled:text-zinc-600 text-black rounded-2xl flex items-center justify-center transition-all active:scale-95"
                  >
                    <Send className="w-6 h-6 ml-1" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {isCallbackModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121214] border border-blue-500/30 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-xl flex items-center gap-2">
                  <PhoneCall className="w-6 h-6 text-blue-400" /> Request a
                  Callback
                </h3>
                <button
                  onClick={() => setIsCallbackModalOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                We'll have an expert reach out to you directly. Please provide
                some details.
              </p>

              <form onSubmit={handleCallbackSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                    Issue Category
                  </label>
                  <select
                    required
                    value={callbackData.issueCategory}
                    onChange={(e) =>
                      setCallbackData({
                        ...callbackData,
                        issueCategory: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Payment / Billing">Payment / Billing</option>
                    <option value="Safety Incident">Safety Incident</option>
                    <option value="Driver Behavior">Driver Behavior</option>
                    <option value="Lost Item">Lost Item</option>
                    <option value="Account Issue">Account Issue</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                    Preferred Time
                  </label>
                  <select
                    required
                    value={callbackData.preferredTime}
                    onChange={(e) =>
                      setCallbackData({
                        ...callbackData,
                        preferredTime: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="ASAP">As Soon As Possible</option>
                    <option value="Morning (9AM - 12PM)">
                      Morning (9AM - 12PM)
                    </option>
                    <option value="Afternoon (12PM - 4PM)">
                      Afternoon (12PM - 4PM)
                    </option>
                    <option value="Evening (4PM - 8PM)">
                      Evening (4PM - 8PM)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={callbackData.notes}
                    onChange={(e) =>
                      setCallbackData({
                        ...callbackData,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Please describe the issue..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsCallbackModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                  >
                    Request Call
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
