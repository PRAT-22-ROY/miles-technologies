import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Car, X, FileText } from "lucide-react";
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
  } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("tasks");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    type: "Leave",
    date: "",
    reason: "",
  });
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const handleLeaveSubmit = () => {
    requestLeaveWFH(leaveData.type, leaveData.date, leaveData.reason);
    setIsLeaveModalOpen(false);
    setLeaveData({ type: "Leave", date: "", reason: "" });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle);
      setNewTaskTitle("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-blue-500/20 rounded-[2rem] shadow-2xl overflow-hidden z-10">
        <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-black shrink-0">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">
            Team Workspace
          </h1>
          <div className="flex gap-4 border-b border-white/10">
            {[
              { id: "tasks", label: "Tasks Board" },
              { id: "drivers", label: "Driver Verification" },
              { id: "leave", label: "Leave / WFH" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-blue-500" : "text-zinc-500 hover:text-white"}`}
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

          {activeTab === "drivers" && (
            <div className="space-y-4">
              <h3 className="text-white font-black text-xl mb-4">
                Pending Driver Verifications
              </h3>
              <div className="grid gap-4">
                {db.driverApplications.filter(
                  (d: any) => d.status === "pending",
                ).length === 0 ? (
                  <div className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest bg-[#0A0A0A] rounded-2xl border border-white/5">
                    No pending verifications
                  </div>
                ) : (
                  db.driverApplications
                    .filter((d: any) => d.status === "pending")
                    .map((drv: any) => (
                      <div
                        key={drv.id}
                        className="bg-[#121214] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <Car className="w-6 h-6 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-base">
                              {drv.name}{" "}
                              <span className="text-[10px] text-zinc-500 font-mono ml-2">
                                {drv.id}
                              </span>
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1">
                              {drv.phone} • Vehicle: {drv.vehicle}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedDriver(drv)}
                          className="h-10 px-6 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                        >
                          Review Documents
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === "leave" && (
            <div className="max-w-md mx-auto space-y-6 pt-4">
              <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl text-center">
                <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-4">
                  {currentEmployee?.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {currentEmployee?.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-6">
                  {currentEmployee?.role} • {currentEmployee?.department}
                </p>
                <div className="flex justify-around bg-black/50 p-4 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Leave Balance
                    </p>
                    <p className="text-lg font-bold text-white">
                      {currentEmployee?.leaveBalance} Days
                    </p>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Work Type
                    </p>
                    <p className="text-lg font-bold text-white">
                      {currentEmployee?.workType}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-white/10 hover:bg-white/20 text-white shadow-none"
                onClick={() => setIsLeaveModalOpen(true)}
              >
                Request PTO / Leave
              </Button>
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
                Request Leave / WFH
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
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Leave">Leave / Day Off</option>
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
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 h-20 resize-none"
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
                  className="flex-1 h-10 !bg-purple-600 hover:!bg-purple-500 text-white border-0 shadow-none"
                >
                  Submit Request
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedDriver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-lg">
                  Review Driver Documents
                </h3>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-black/50 rounded-xl p-4 mb-4 border border-white/5">
                <p className="text-white font-bold">{selectedDriver.name}</p>
                <p className="text-sm text-zinc-400">
                  {selectedDriver.vehicle} • {selectedDriver.phone}
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3 text-sm text-white">
                    <FileText className="w-4 h-4 text-blue-400" /> Driver
                    License
                  </div>
                  <span className="text-[10px] font-bold text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3 text-sm text-white">
                    <FileText className="w-4 h-4 text-blue-400" /> RC &
                    Insurance
                  </div>
                  <span className="text-[10px] font-bold text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={() => {
                    updateDriverApp(selectedDriver.id, "rejected");
                    setSelectedDriver(null);
                  }}
                  className="flex-1 h-10"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    updateDriverApp(selectedDriver.id, "pending_manager");
                    setSelectedDriver(null);
                  }}
                  className="flex-[2] h-10 !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0"
                >
                  Verify & Send to Manager
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
