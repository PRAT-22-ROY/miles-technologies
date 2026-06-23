import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  FileText,
  CheckCircle,
  Clock,
  X,
  AlertTriangle,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";

export const DriverDashboard = () => {
  const { db, currentEmployee, updateDriverApp, addSystemAction } =
    useGlobalContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDriverForOpsReview, setSelectedDriverForOpsReview] =
    useState<any>(null);

  const [internalNote, setInternalNote] = useState("");

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

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-green-500/20 rounded-[2rem] shadow-2xl overflow-hidden z-10">
        <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-green-900/20 to-black shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500 font-black">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                {currentEmployee?.department} Workspace
              </h1>
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest mt-1">
                Driver Application Processing
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-white/10 overflow-x-auto pb-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "my_queue", label: "Team Queue" },
              { id: "pipeline", label: "Application Pipeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-green-500" : "text-zinc-500 hover:text-white"}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="driverTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#050505] p-6">
          {activeTab === "overview" && (
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

          {activeTab === "my_queue" && (
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
                        className="h-10 px-6 py-0 text-xs !bg-green-600 hover:!bg-green-500 text-white shadow-none border-0 w-full sm:w-auto"
                      >
                        Process Application
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "pipeline" && (
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
                          className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors shadow-lg"
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
                                Update Status
                              </button>
                            )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedDriverForOpsReview && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121214] border border-white/10 p-6 rounded-3xl w-full max-w-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-xl flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-500" /> Update
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
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 h-20 resize-none"
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
                  className="h-10 text-[10px] !bg-green-600 hover:!bg-green-500 text-white shadow-none border-0"
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
