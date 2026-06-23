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
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";

export const DriverDashboard = () => {
  const { db, currentEmployee, updateDriverApp } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDriverForOpsReview, setSelectedDriverForOpsReview] =
    useState<any>(null);

  const totalDrivers = db.driverApplications.length;
  const pendingDrivers = db.driverApplications.filter(
    (d: any) => d.status.includes("pending") || d.status === "applied",
  ).length;
  const approvedDrivers = db.driverApplications.filter(
    (d: any) => d.status === "active" || d.status === "approved",
  ).length;
  const rejectedDrivers = db.driverApplications.filter(
    (d: any) => d.status === "rejected",
  ).length;
  const inTraining = db.driverApplications.filter(
    (d: any) => d.status === "training",
  ).length;
  const assignedToMe = db.driverApplications.filter(
    (d: any) =>
      d.assignedOpsExecutive === currentEmployee?.id &&
      d.status !== "approved" &&
      d.status !== "rejected",
  );

  const pipelineStages = [
    { id: "applied", label: "Applied" },
    { id: "documents_uploaded", label: "Documents Uploaded" },
    { id: "pending_hr", label: "HR Review" },
    { id: "assigned_ops", label: "Assigned To Operations" },
    { id: "ops_review", label: "Operations Review" },
    { id: "training", label: "Training" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "active", label: "Active" },
  ];

  const handleOpsReviewSubmit = (id: string, action: string) => {
    let newStatus = "ops_review";
    if (action === "approve") newStatus = "training";
    if (action === "reject") newStatus = "rejected";
    if (action === "return_hr") newStatus = "pending_hr";
    if (action === "request_docs") newStatus = "documents_uploaded"; // Back to user

    updateDriverApp(id, { status: newStatus });
    setSelectedDriverForOpsReview(null);
  };

  const advancePipelineStage = (driverId: string, currentStatus: string) => {
    const currentIndex = pipelineStages.findIndex(
      (s) => s.id === currentStatus,
    );
    if (currentIndex !== -1 && currentIndex < pipelineStages.length - 1) {
      updateDriverApp(driverId, {
        status: pipelineStages[currentIndex + 1].id,
      });
    }
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
                Driver Operations
              </h1>
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest mt-1">
                Workspace for {currentEmployee?.name}
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-white/10 overflow-x-auto pb-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "my_queue", label: "My Review Queue" },
              { id: "pipeline", label: "Driver Pipeline (Kanban)" },
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
                    label: "Total Drivers",
                    val: totalDrivers,
                    color: "text-white",
                  },
                  {
                    label: "Pending",
                    val: pendingDrivers,
                    color: "text-yellow-400",
                  },
                  {
                    label: "In Training",
                    val: inTraining,
                    color: "text-blue-400",
                  },
                  {
                    label: "Approved/Active",
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
                Assigned to Me
              </h2>
              {assignedToMe.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest bg-[#121214] rounded-2xl border border-white/5">
                  No drivers assigned to your queue
                </div>
              ) : (
                <div className="grid gap-4">
                  {assignedToMe.map((drv: any) => (
                    <div
                      key={drv.id}
                      className="bg-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                          <Car className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">
                            {drv.name}{" "}
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded ml-2 uppercase border border-green-500/20">
                              {drv.status.replace("_", " ")}
                            </span>
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            {drv.phone} • {drv.vehicle}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedDriverForOpsReview(drv)}
                        className="h-10 px-6 py-0 text-xs !bg-green-600 hover:!bg-green-500 text-white shadow-none border-0 w-full sm:w-auto"
                      >
                        Start Ops Review
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
                          <p className="text-white font-bold text-sm truncate">
                            {drv.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 truncate">
                            {drv.vehicle} • {drv.phone}
                          </p>
                          {stage.id !== "active" && stage.id !== "rejected" && (
                            <button
                              onClick={() =>
                                advancePipelineStage(drv.id, drv.status)
                              }
                              className="mt-3 w-full bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 py-2 rounded-lg transition-colors border border-white/5"
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
                  <ShieldCheck className="w-6 h-6 text-green-500" /> Operations
                  Review
                </h3>
                <button
                  onClick={() => setSelectedDriverForOpsReview(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                    Driver Details
                  </p>
                  <p className="text-white font-bold">
                    {selectedDriverForOpsReview.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {selectedDriverForOpsReview.phone}
                  </p>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                    Vehicle Details
                  </p>
                  <p className="text-white font-bold">
                    {selectedDriverForOpsReview.vehicle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <FileText className="w-5 h-5 text-blue-400" /> Documents
                    Status
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-green-500/10 text-green-400">
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <Car className="w-5 h-5 text-purple-400" /> Vehicle Physical
                    Verification
                  </div>
                  <select
                    value={
                      selectedDriverForOpsReview.vehicleVerification ||
                      "Pending"
                    }
                    onChange={(e) =>
                      updateDriverApp(selectedDriverForOpsReview.id, {
                        vehicleVerification: e.target.value,
                      })
                    }
                    className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified Pass</option>
                    <option value="Failed">Failed Inspection</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />{" "}
                    Insurance & RC Verification
                  </div>
                  <select
                    value={
                      selectedDriverForOpsReview.insuranceVerification ||
                      "Pending"
                    }
                    onChange={(e) =>
                      updateDriverApp(selectedDriverForOpsReview.id, {
                        insuranceVerification: e.target.value,
                      })
                    }
                    className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified Pass</option>
                    <option value="Failed">Failed Checks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="danger"
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "reject",
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
                      "return_hr",
                    )
                  }
                  className="h-10 text-[10px]"
                >
                  Return to HR
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "request_docs",
                    )
                  }
                  className="h-10 text-[10px]"
                >
                  Request Docs
                </Button>
                <Button
                  onClick={() =>
                    handleOpsReviewSubmit(
                      selectedDriverForOpsReview.id,
                      "approve",
                    )
                  }
                  className="h-10 text-[10px] !bg-green-600 hover:!bg-green-500 text-white shadow-none border-0"
                >
                  Approve & Train
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
