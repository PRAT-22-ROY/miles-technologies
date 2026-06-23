import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlobalProvider } from "./store/GlobalContext";
import { useGlobalContext } from "./hooks/useGlobalContext";
import { TopNav } from "./components/layout/TopNav";
import { CustomerView } from "./modules/customer/CustomerView";
import { AgentLogin } from "./modules/agent/AgentLogin";
import { AgentDashboard } from "./modules/agent/AgentDashboard";
import { EmployeeLogin } from "./modules/employee/EmployeeLogin";
import { EmployeeDashboard } from "./modules/employee/EmployeeDashboard";
import { GateShift } from "./modules/employee/GateShift";
import { AdminLogin } from "./modules/admin/AdminLogin";
import { AdminDashboard } from "./modules/admin/AdminDashboard";
import { DriverPortal } from "./modules/driver/DriverPortal";
import "./index.css";

import { createRoot } from "react-dom/client";

const MainApp = () => {
  const {
    activeMode,
    currentAgent,
    currentEmployee,
    isAdminLogged,
    shiftStatus,
  } = useGlobalContext();

  return (
    <div className="bg-[#050505] min-h-screen font-sans selection:bg-[#FFD100]/30 selection:text-[#FFD100]">
      <TopNav />
      <AnimatePresence mode="wait">
        <motion.div
          key={
            activeMode +
            (currentAgent ? "-agt" : "") +
            (currentEmployee ? "-emp" : "") +
            (isAdminLogged ? "-adm" : "") +
            shiftStatus
          }
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.3 }}
          className="h-full pt-16"
        >
          {activeMode === "customer" && <CustomerView />}

          {activeMode === "agent" && !currentAgent && <AgentLogin />}
          {activeMode === "agent" &&
            currentAgent &&
            shiftStatus === "offline" && <GateShift userType="agent" />}
          {activeMode === "agent" &&
            currentAgent &&
            shiftStatus !== "offline" && <AgentDashboard />}

          {activeMode === "employee" && !currentEmployee && <EmployeeLogin />}
          {activeMode === "employee" &&
            currentEmployee &&
            shiftStatus === "offline" && <GateShift userType="employee" />}
          {activeMode === "employee" &&
            currentEmployee &&
            shiftStatus !== "offline" && <EmployeeDashboard />}

          {activeMode === "admin" && !isAdminLogged && <AdminLogin />}
          {activeMode === "admin" && isAdminLogged && <AdminDashboard />}

          {activeMode === "driver" && <DriverPortal />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <GlobalProvider>
      <MainApp />
    </GlobalProvider>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
