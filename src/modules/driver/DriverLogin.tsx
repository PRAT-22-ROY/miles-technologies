import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  ChevronRight,
  Search,
  FileText,
  CheckCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { TiltCard } from "../../components/layout/TiltCard";
import { Floating3DBackground } from "../../components/layout/Floating3DBackground";
import { THEME } from "../../constants";
import { Button } from "../../components/ui/Button";

export const DriverLogin = () => {
  const { db, submitDriverApplication, setActiveMode } = useGlobalContext();
  const [view, setView] = useState<"portal" | "apply" | "track" | "success">(
    "portal",
  );

  // Application Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [generatedAppId, setGeneratedAppId] = useState("");

  // Track State
  const [trackQuery, setTrackQuery] = useState("");
  const [trackedApp, setTrackedApp] = useState<any>(null);

  const handleApplyNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit
      const appId = submitDriverApplication(formData);
      setGeneratedAppId(appId);
      setView("success");
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = db.driverApplications.find(
      (d: any) => d.id === trackQuery || d.phone === trackQuery,
    );
    setTrackedApp(found || "not_found");
  };

  const pipelineStages = [
    { id: "Submitted", label: "Application Submitted" },
    { id: "HR Review", label: "HR Review" },
    { id: "Assigned", label: "Assigned To Operations" },
    { id: "In Progress", label: "In Progress" },
    { id: "Waiting For Documents", label: "Documents Requested" },
    { id: "Verification", label: "In Verification" },
    { id: "Training", label: "Training" },
    { id: "Approved", label: "Approved" },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden py-12">
      <Floating3DBackground />

      <AnimatePresence mode="wait">
        {view === "portal" && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-10 w-full max-w-4xl"
          >
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10">
                <Car className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                Drive With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
                  MILES.
                </span>
              </h1>
              <p className="text-lg text-zinc-400 font-medium">
                Join the premium fleet of Bengaluru.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <TiltCard
                className={`${THEME.panel} p-8 rounded-[2.5rem] text-left group cursor-pointer hover:border-green-500/30 transition-colors`}
              >
                <div onClick={() => setView("apply")}>
                  <div className="w-14 h-14 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">
                    Submit Application
                  </h3>
                  <p className="text-zinc-400 text-sm mb-8">
                    Start your journey by providing your personal, driving, and
                    vehicle details.
                  </p>
                  <div className="flex items-center text-green-400 font-bold text-sm uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </TiltCard>
              <TiltCard
                className={`${THEME.panel} p-8 rounded-[2.5rem] text-left group cursor-pointer hover:border-blue-500/30 transition-colors`}
              >
                <div onClick={() => setView("track")}>
                  <div className="w-14 h-14 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">
                    Track Application
                  </h3>
                  <p className="text-zinc-400 text-sm mb-8">
                    Check the real-time status of your submitted driver
                    application.
                  </p>
                  <div className="flex items-center text-blue-400 font-bold text-sm uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
                    Track Status <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </TiltCard>
            </div>
          </motion.div>
        )}

        {view === "apply" && (
          <motion.div
            key="apply"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${THEME.panel} p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl z-10 relative`}
          >
            <button
              onClick={() => {
                setView("portal");
                setStep(1);
              }}
              className="absolute top-8 right-8 text-zinc-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                Application Form
              </h2>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
                Step {step} of 4
              </p>

              <div className="flex gap-2 mt-6">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full ${step >= s ? "bg-green-500" : "bg-white/10"}`}
                  ></div>
                ))}
              </div>
            </div>

            <form onSubmit={handleApplyNext} className="space-y-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Mobile Number
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Date of Birth
                      </label>
                      <input
                        required
                        type="date"
                        value={formData.dob || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, dob: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Address
                    </label>
                    <textarea
                      required
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500 h-20 resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Emergency Contact
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.emergencyContact || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: e.target.value,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Driving Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Driving License No.
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.dlNumber || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, dlNumber: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        License Expiry
                      </label>
                      <input
                        required
                        type="date"
                        value={formData.dlExpiry || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, dlExpiry: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Experience (Years)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.experience || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Languages Known (Comma separated)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.languages?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          languages: e.target.value
                            .split(",")
                            .map((s: string) => s.trim()),
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Upload Driving License
                    </label>
                    <input
                      required
                      type="file"
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-zinc-400 focus:outline-none focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Vehicle Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Vehicle Category
                      </label>
                      <select
                        required
                        value={formData.vehicleCategory || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleCategory: e.target.value,
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      >
                        <option value="">Select...</option>
                        <option value="AC Mini">AC Mini</option>
                        <option value="AC Sedan">AC Sedan</option>
                        <option value="AC XL">AC XL</option>
                        <option value="AC Electric">AC Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Vehicle Number
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.vehicleNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleNumber: e.target.value,
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        RC Number
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.rcNumber || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, rcNumber: e.target.value })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Vehicle Model
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.vehicleModel || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleModel: e.target.value,
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Manufacturing Year
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.manufacturingYear || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufacturingYear: e.target.value,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Upload RC
                      </label>
                      <input
                        required
                        type="file"
                        className="text-xs text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Upload Insurance
                      </label>
                      <input
                        required
                        type="file"
                        className="text-xs text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Upload PUC
                      </label>
                      <input
                        required
                        type="file"
                        className="text-xs text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Fitness Cert.
                      </label>
                      <input
                        required
                        type="file"
                        className="text-xs text-zinc-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Banking Information
                  </h3>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Account Holder Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.accountName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountName: e.target.value,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      Account Number
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.accountNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                      IFSC Code
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.ifscCode || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ifscCode: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="!bg-green-600 hover:!bg-green-500 text-white shadow-none border-0 px-10"
                >
                  {step === 4 ? "Submit Application" : "Next"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {view === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${THEME.panel} p-12 text-center rounded-[2.5rem] w-full max-w-lg z-10`}
          >
            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
              Application Submitted
            </h2>
            <p className="text-zinc-400 mb-8">
              Your application has been received and is under review. Save your
              Application ID to track its progress.
            </p>
            <div className="bg-black/50 border border-white/10 p-6 rounded-2xl mb-8 inline-block">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Application ID
              </p>
              <p className="text-2xl font-mono font-bold text-green-400 tracking-widest">
                {generatedAppId}
              </p>
            </div>
            <div>
              <Button
                onClick={() => setView("portal")}
                className="w-full !bg-green-600 hover:!bg-green-500 text-white shadow-none border-0"
              >
                Return Home
              </Button>
            </div>
          </motion.div>
        )}

        {view === "track" && (
          <motion.div
            key="track"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl z-10 relative`}
          >
            <button
              onClick={() => setView("portal")}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <TiltCard
              className={`${THEME.panel} p-8 md:p-10 rounded-[2.5rem] mb-6`}
            >
              <h2 className="text-2xl font-black text-white mb-2">
                Track Application
              </h2>
              <p className="text-zinc-400 text-sm mb-6 font-bold uppercase tracking-widest">
                Enter Details
              </p>
              <form onSubmit={handleTrackSubmit} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter Mobile Number or Application ID"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
                <Button
                  type="submit"
                  className="!bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0 px-8"
                >
                  Track
                </Button>
              </form>
            </TiltCard>

            {trackedApp === "not_found" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-2xl"
              >
                <p className="text-red-400 font-bold uppercase tracking-widest text-sm">
                  Application Not Found
                </p>
              </motion.div>
            )}

            {trackedApp && trackedApp !== "not_found" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${THEME.panel} p-8 md:p-10 rounded-[2.5rem]`}
              >
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/10">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {trackedApp.name}
                    </h3>
                    <p className="text-sm font-mono text-zinc-500 mt-1">
                      {trackedApp.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                      {trackedApp.status}
                    </span>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-white/10 space-y-8">
                  {pipelineStages.map((stage, idx) => {
                    const currentIndex = pipelineStages.findIndex(
                      (s) => s.id === trackedApp.status,
                    );
                    const isPassed = currentIndex > idx;
                    const isCurrent = currentIndex === idx;
                    const isRejected =
                      trackedApp.status === "Rejected" &&
                      stage.id === "Rejected";

                    if (stage.id === "Rejected" && !isRejected) return null; // Hide rejected stage unless rejected

                    return (
                      <div
                        key={stage.id}
                        className={`relative ${isPassed || isCurrent ? "opacity-100" : "opacity-40"}`}
                      >
                        <div
                          className={`absolute -left-[35px] w-6 h-6 rounded-full border-4 flex items-center justify-center bg-[#050505] ${
                            isRejected
                              ? "border-red-500"
                              : isCurrent
                                ? "border-blue-500"
                                : isPassed
                                  ? "border-green-500"
                                  : "border-zinc-700"
                          }`}
                        >
                          {isPassed && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <p
                          className={`font-bold ${
                            isRejected
                              ? "text-red-400"
                              : isCurrent
                                ? "text-blue-400"
                                : isPassed
                                  ? "text-green-400"
                                  : "text-zinc-500"
                          }`}
                        >
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
