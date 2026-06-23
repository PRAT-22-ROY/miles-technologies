import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  MessageSquare, Headset, User, Phone, Inbox, ListTodo, CheckSquare, 
  ChevronLeft, Search, Paperclip, Send, Sparkles, X, Info, Menu,
  Clock, LogOut, ShieldAlert, Zap, Coffee, Power, ChevronRight, MapPin,
  AlertCircle, HelpCircle, Bug, Tag, CircleDot, Activity, FileText,
  UserPlus, Car, LayoutDashboard, CheckCircle, Plus, CalendarClock, Briefcase, Users, FileWarning, Settings2
} from 'lucide-react';

// --- MILES PREMIUM THEME ---
const THEME = {
  primary: '#FFD100', // MILES Yellow
  bg: '#050505',      // Deepest Black
  panel: 'bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-2xl',
  panelSolid: 'bg-[#0A0A0A] border border-white/[0.05]',
  text: 'text-white',
  textMuted: 'text-zinc-400',
};

// --- ID GENERATORS ---
const generateHash = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const generateTicketKey = (customerId) => `${customerId}-${generateHash()}`;
const generateId = (prefix) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

// --- MOCK DATABASE & STATE MANAGEMENT ---
const agentsList = [
  { id: 'AGT-001', name: 'Megha', role: 'Support Lead', email: 'megha@miles.com', status: 'offline' },
  { id: 'AGT-002', name: 'Rahul', role: 'Technical Support', email: 'rahul@miles.com', status: 'offline' },
  { id: 'AGT-003', name: 'Alex', role: 'Customer Success', email: 'alex@miles.com', status: 'offline' }
];

const adminUsersList = [
  { id: 'ADM-001', name: 'Pratik', role: 'Full Stack Dev & Eng Manager', tags: ['Manager', 'Admin'] },
  { id: 'ADM-002', name: 'Neha', role: 'Head of HR & Operations', tags: ['HR', 'Admin'] }
];

const initialDb = {
  currentUser: { id: 'CUST-001', name: 'Arjun Sharma', phone: '+91 98765 43210', email: 'arjun@example.com', rides: 142, rating: 4.9, joined: '2022' },
  recentRide: { id: 'RIDE-9921', from: 'Indiranagar', to: 'Koramangala', fare: 245.00, driver: 'Ramesh K.', date: new Date().toLocaleDateString() },
  tickets: [],
  messages: [],
  customers: {
    'CUST-001': { name: 'Arjun Sharma', phone: '+91 98765 43210', rides: 142, rating: 4.9, joined: '2022' },
    'CUST-002': { name: 'Priya Patel', phone: '+91 99999 88888', rides: 45, rating: 4.9, joined: '2023' },
  },
  adminUsers: adminUsersList,
  agents: agentsList,
  employees: [
    { id: 'EMP-001', name: 'Kabir', role: 'Operations Intern', department: 'Driver Onboarding', leaveBalance: 5, workType: 'Office', status: 'offline' }
  ],
  driverApplications: [
    { id: 'DRV-REQ-01', name: 'Suresh Kumar', phone: '+91 99999 11111', vehicle: 'Maruti Dzire', status: 'pending_manager', submittedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'DRV-REQ-02', name: 'Rajesh Verma', phone: '+91 99887 77665', vehicle: 'Tata Tigor', status: 'pending_hr', submittedAt: new Date(Date.now() - 10000000).toISOString() }
  ],
  onboardingRequests: [
    { id: 'ONB-01', name: 'Pooja', role: 'Backend Intern', department: 'Engineering', type: 'Intern', status: 'pending_manager' }
  ],
  contractors: [
    { id: 'CON-01', name: 'TechCorp Solutions', type: 'IT Vendor', status: 'pending_manager' }
  ],
  leaveRequests: [],
  tasks: [
    { id: 'TSK-01', title: 'Verify daily driver batches', status: 'todo', assignedTo: 'EMP-001' }
  ],
  complianceAlerts: [
    { id: 'CMP-1', title: 'Driver License Expiring', target: 'Ramesh K.', daysLeft: 12, type: 'warning' },
    { id: 'CMP-2', title: 'Vendor NDA Expired', target: 'TechCorp Solutions', daysLeft: 0, type: 'critical' }
  ],
  systemOffline: false
};

const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [db, setDb] = useState(initialDb);
  const [activeMode, setActiveMode] = useState('customer'); // customer, agent, employee, admin
  const [currentAgent, setCurrentAgent] = useState(null); 
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  
  const [customerActiveTicketId, setCustomerActiveTicketId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const [shiftStatus, setShiftStatus] = useState('offline');
  const [clockInTime, setClockInTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (shiftStatus === 'online' && clockInTime) {
      interval = setInterval(() => {
        setShiftDuration(Math.floor((new Date() - clockInTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftStatus, clockInTime]);

  const startShift = () => {
    setShiftStatus('online');
    const now = new Date();
    setClockInTime(now);
    setShiftDuration(0);
    setDb(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.id === currentAgent?.id ? { ...a, status: 'online', clockInTime: now.toISOString() } : a),
      employees: prev.employees.map(e => e.id === currentEmployee?.id ? { ...e, status: 'online', clockInTime: now.toISOString() } : e)
    }));
  };

  const endShift = (agentOverride, employeeOverride) => {
    setShiftStatus('offline');
    const now = new Date();
    const aId = agentOverride?.id || currentAgent?.id;
    const eId = employeeOverride?.id || currentEmployee?.id;
    setDb(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.id === aId ? { ...a, status: 'offline', clockOutTime: now.toISOString() } : a),
      employees: prev.employees.map(e => e.id === eId ? { ...e, status: 'offline', clockOutTime: now.toISOString() } : e)
    }));
    setClockInTime(null);
    setShiftDuration(0);
  };

  const toggleSystemOffline = () => {
    setDb(prev => ({ ...prev, systemOffline: !prev.systemOffline }));
  };

  const simulateAIResponse = (ticketId, text) => {
    if (db.systemOffline) {
      const msg = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM_AI', senderType: 'ai', text: "All agents are busy right now. Please leave an email to roypratik2000@gmail.com and our team will reach out to you shortly.", timestamp: new Date().toISOString() };
      setDb(prev => ({ 
        ...prev, 
        messages: [...prev.messages, msg],
        tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, status: 'offline_queued', assignedTo: 'Unassigned' } : t)
      }));
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const isRouteIssue = text.toLowerCase().match(/(route|long|extra|overcharge|fare|payment)/);
      const isEscalation = text.toLowerCase().match(/(agent|human|talk|real person|support)/);

      if (isRouteIssue) {
        const msg1 = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM_AI', senderType: 'ai', text: "Analyzing your recent trip telemetry and GPS logs...", timestamp: new Date().toISOString() };
        setDb(prev => ({ ...prev, messages: [...prev.messages, msg1] }));

        setTimeout(() => {
          const aiText = `I analyzed your ride from ${db.recentRide.from} to ${db.recentRide.to}. Our GPS data shows a 2.8km deviation due to traffic avoidance, which added ₹45 to your fare. I am routing this to a live agent to finalize your refund.`;
          const aiInsights = {
            confidenceScore: 94,
            analysis: `GPS telemetry confirms a 2.8km deviation from the optimal route from ${db.recentRide.from}. Traffic data does not justify the detour time. High customer loyalty detected.`,
            recommendedAction: "Issue partial refund of ₹45.00",
            fraudRisk: "Low"
          };

          const onlineAgents = db.agents.filter(a => a.status === 'online');
          const assignedAgentId = onlineAgents.length > 0 ? onlineAgents[0].id : null;

          const msg2 = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM_AI', senderType: 'ai', text: aiText, timestamp: new Date().toISOString() };
          const sysMsg = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM', senderType: 'system', text: assignedAgentId ? `Ticket auto-assigned to ${assignedAgentId}` : 'Ticket queued for assignment', timestamp: new Date().toISOString() };
          
          setDb(prev => ({
            ...prev,
            messages: [...prev.messages, msg2, sysMsg],
            tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, status: assignedAgentId ? 'in_progress' : 'open', assignedTo: assignedAgentId, aiInsights, issueType: 'Incident', priority: 'P2 - High' } : t)
          }));
          setIsTyping(false);
        }, 2500);

      } else if (isEscalation) {
        const aiText = "I am transferring you to our live MILES specialists. They will join this chat instantly.";
        const onlineAgents = db.agents.filter(a => a.status === 'online');
        const assignedAgentId = onlineAgents.length > 0 ? onlineAgents[0].id : null;

        const msg = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM_AI', senderType: 'ai', text: aiText, timestamp: new Date().toISOString() };
        const sysMsg = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM', senderType: 'system', text: assignedAgentId ? `Ticket auto-assigned to ${assignedAgentId}` : 'Ticket queued for assignment', timestamp: new Date().toISOString() };

        setDb(prev => ({
          ...prev,
          messages: [...prev.messages, msg, sysMsg],
          tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, status: assignedAgentId ? 'in_progress' : 'open', assignedTo: assignedAgentId, priority: 'P3 - Medium' } : t)
        }));
        setIsTyping(false);

      } else {
        const msg = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM_AI', senderType: 'ai', text: "I understand. Could you provide a bit more detail so I can investigate or connect you to the right team?", timestamp: new Date().toISOString() };
        setDb(prev => ({ ...prev, messages: [...prev.messages, msg] }));
        setIsTyping(false);
      }
    }, 1000);
  };

  const createTicket = (category, priority, subject, description) => {
    const newTicketId = generateTicketKey(db.currentUser.id);
    const newTicket = {
      id: newTicketId, customerId: db.currentUser.id, issueType: 'Request', category, priority: 'P3 - Medium',
      subject, status: db.systemOffline ? 'offline_queued' : 'ai_handling', createdAt: new Date().toISOString(), 
      assignedTo: null, isCallRequested: false, aiInsights: null, environment: 'MILES App v4.2 (iOS)'
    };
    
    const initialMessage = {
      id: generateId('MSG'), ticketId: newTicketId, senderId: db.currentUser.id, senderType: 'customer', text: description, timestamp: new Date().toISOString()
    };
    setDb(prev => ({ ...prev, tickets: [newTicket, ...prev.tickets], messages: [...prev.messages, initialMessage] }));
    
    simulateAIResponse(newTicketId, description);
    return newTicketId;
  };

  const sendMessage = (ticketId, senderId, senderType, text) => {
    const newMessage = { id: generateId('MSG'), ticketId, senderId, senderType, text, timestamp: new Date().toISOString() };
    setDb(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
    if (senderType === 'customer') {
      const ticket = db.tickets.find(t => t.id === ticketId);
      if (ticket && ticket.status === 'ai_handling') simulateAIResponse(ticketId, text);
    }
  };

  const assignTicket = (ticketId, agentId) => {
    setDb(prev => ({ ...prev, tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, assignedTo: agentId, status: 'in_progress' } : t) }));
    const name = db.agents.find(a=>a.id===agentId)?.name || currentAdmin?.name || 'System';
    addSystemAction(ticketId, `Ticket assigned to ${name}`);
  };

  const requestCall = (ticketId) => {
    setDb(prev => ({ ...prev, tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, isCallRequested: true, status: 'open', priority: 'P1 - Critical', issueType: 'Incident' } : t) }));
    addSystemAction(ticketId, `Priority Phone Support Requested. Escalated to P1.`);
  };

  const updateTicketStatus = (ticketId, status) => {
    setDb(prev => ({ ...prev, tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, status } : t) }));
  };

  const updateTicketDetails = (ticketId, updates) => {
    setDb(prev => ({ ...prev, tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, ...updates } : t) }));
    addSystemAction(ticketId, `Ticket details updated.`);
  };

  const linkTicket = (ticketId, targetId) => {
    addSystemAction(ticketId, `Linked to issue ${targetId}`);
  };

  const addSystemAction = (ticketId, text) => {
    const newMsg = { id: generateId('MSG'), ticketId, senderId: 'SYSTEM', senderType: 'system', text, timestamp: new Date().toISOString() };
    setDb(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
  };

  const endChatCustomer = (ticketId) => {
    updateTicketStatus(ticketId, 'resolved');
    addSystemAction(ticketId, `Chat ended by customer.`);
    setCustomerActiveTicketId(null); 
  };

  const endChatAgent = (ticketId, agentName) => {
    updateTicketStatus(ticketId, 'resolved');
    addSystemAction(ticketId, `Issue resolved. Chat ended by ${agentName}.`);
  };

  const requestLeaveWFH = (type, date, reason) => {
    const req = { id: generateId('REQ'), agentId: currentAgent?.id || currentEmployee?.id, type, date, reason, status: 'pending', requestedAt: new Date().toISOString() };
    setDb(prev => ({ ...prev, leaveRequests: [req, ...prev.leaveRequests] }));
  };

  const updateLeaveRequest = (reqId, status) => {
    setDb(prev => ({ ...prev, leaveRequests: prev.leaveRequests.map(r => r.id === reqId ? { ...r, status } : r) }));
  };

  const addTask = (title) => {
    const task = { id: generateId('TSK'), title, status: 'todo', assignedTo: currentEmployee?.id };
    setDb(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setDb(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) }));
  };

  // Workflow Approvals Manager -> HR
  const createOnboarding = (type, data) => {
    const req = { id: generateId(type.substring(0,3).toUpperCase()), type, ...data, status: 'pending_manager', submittedAt: new Date().toISOString() };
    if(type === 'Driver') setDb(prev => ({ ...prev, driverApplications: [req, ...prev.driverApplications] }));
    if(type === 'Intern') setDb(prev => ({ ...prev, onboardingRequests: [req, ...prev.onboardingRequests] }));
    if(type === 'Contractor') setDb(prev => ({ ...prev, contractors: [req, ...prev.contractors] }));
  };

  const advanceApproval = (type, id, currentStatus) => {
    const nextStatus = currentStatus === 'pending_manager' ? 'pending_hr' : 'approved';
    const updater = list => list.map(item => item.id === id ? { ...item, status: nextStatus } : item);
    
    setDb(prev => {
      let newState = { ...prev };
      if(type === 'Driver') newState.driverApplications = updater(prev.driverApplications);
      if(type === 'Intern') {
         newState.onboardingRequests = updater(prev.onboardingRequests);
         if(nextStatus === 'approved') {
            const req = prev.onboardingRequests.find(r=>r.id===id);
            newState.employees = [...prev.employees, { id: generateId('EMP'), name: req.name, role: req.role, department: req.department, leaveBalance: 5, workType: 'Office', status: 'offline' }];
         }
      }
      if(type === 'Contractor') newState.contractors = updater(prev.contractors);
      return newState;
    });
  };

  const rejectApproval = (type, id) => {
    const updater = list => list.map(item => item.id === id ? { ...item, status: 'rejected' } : item);
    setDb(prev => {
      let newState = { ...prev };
      if(type === 'Driver') newState.driverApplications = updater(prev.driverApplications);
      if(type === 'Intern') newState.onboardingRequests = updater(prev.onboardingRequests);
      if(type === 'Contractor') newState.contractors = updater(prev.contractors);
      return newState;
    });
  };

  return (
    <GlobalContext.Provider value={{ 
      db, activeMode, setActiveMode, currentAgent, setCurrentAgent, currentEmployee, setCurrentEmployee, currentAdmin, setCurrentAdmin, isAdminLogged, setIsAdminLogged,
      shiftStatus, setShiftStatus, shiftDuration, startShift, endShift, toggleSystemOffline,
      customerActiveTicketId, setCustomerActiveTicketId, isTyping,
      createTicket, sendMessage, assignTicket, updateTicketStatus, requestCall, addSystemAction, updateTicketDetails, linkTicket,
      endChatCustomer, endChatAgent, requestLeaveWFH, updateLeaveRequest, addTask, updateTaskStatus,
      createOnboarding, advanceApproval, rejectApproval
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const Floating3DBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-[#FFD100] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.06]"/>
    <motion.div animate={{ y: [0, 30, 0], x: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-screen filter blur-[180px] opacity-[0.04]"/>
  </div>
);

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [4, -4]);
  const rotateY = useTransform(x, [-100, 100], [-4, 4]);
  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }
  return (
    <motion.div onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ rotateX, rotateY, perspective: 1000 }} className={className}>{children}</motion.div>
  );
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold rounded-2xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants = {
    primary: "bg-[#FFD100] text-black shadow-[0_0_20px_rgba(255,209,0,0.3)] hover:shadow-[0_0_30px_rgba(255,209,0,0.5)] hover:bg-[#ffe040]",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

// --- CUSTOMER MODE ---
const CustomerView = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { db, createTicket, sendMessage, customerActiveTicketId, setCustomerActiveTicketId, isTyping, endChatCustomer } = useContext(GlobalContext);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { if (customerActiveTicketId) setIsChatOpen(true); }, [customerActiveTicketId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [db.messages, isChatOpen, isTyping]);

  const handleSend = (e, prefill = null) => {
    e?.preventDefault();
    const textToSend = prefill || inputText;
    if (!textToSend.trim()) return;
    
    let currentId = customerActiveTicketId;
    if (!currentId) {
      currentId = createTicket('Billing', 'Medium', textToSend.substring(0, 30) + '...', textToSend);
      setCustomerActiveTicketId(currentId);
    } else {
      sendMessage(currentId, db.currentUser.id, 'customer', textToSend);
    }
    setInputText('');
  };

  const handleCustomerEndChat = () => {
    if(customerActiveTicketId) endChatCustomer(customerActiveTicketId);
    setIsChatOpen(false);
  };

  const chatMessages = customerActiveTicketId ? db.messages.filter(m => m.ticketId === customerActiveTicketId) : [];
  const currentTicket = customerActiveTicketId ? db.tickets.find(t => t.id === customerActiveTicketId) : null;

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col bg-[#050505] overflow-hidden">
      <Floating3DBackground />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto w-full py-12 z-10">
        <TiltCard>
          <div className="relative mb-10">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-[#FFD100] rounded-full blur-2xl" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="w-28 h-28 bg-gradient-to-br from-[#FFD100] to-yellow-600 shadow-[0_20px_50px_-10px_rgba(255,209,0,0.5)] rounded-[2rem] flex items-center justify-center relative z-10 border border-white/20">
              <Headset className="w-14 h-14 text-black drop-shadow-md" />
            </motion.div>
          </div>
        </TiltCard>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Always <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD100] to-yellow-500">Connected.</span></motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed font-medium max-w-lg">Experience support that moves as fast as you do. AI powered, human backed.</motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex w-full justify-center">
          <Button onClick={() => setIsChatOpen(true)} className="w-full sm:w-auto px-10 py-5 text-lg rounded-[1.5rem]">
            <MessageSquare className="w-6 h-6 mr-3" /> Get Help Now
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed inset-0 md:inset-auto md:bottom-8 md:right-8 md:w-[440px] md:h-[720px] md:max-h-[85vh] flex flex-col ${THEME.panel} md:rounded-[2.5rem] z-50 overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]`}
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
                  <h3 className="text-white font-black text-lg tracking-tight leading-tight">MILES Copilot</h3>
                  {currentTicket && <p className="text-[9px] text-[#FFD100] font-mono tracking-widest uppercase mt-0.5 opacity-80">{currentTicket.id}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {customerActiveTicketId && (
                  <button onClick={handleCustomerEndChat} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/40 px-3 py-2 rounded-xl font-bold transition-all border border-red-500/20">End Chat</button>
                )}
                <button onClick={() => setIsChatOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/60 relative">
              {!customerActiveTicketId ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
                  <div className="mb-6 inline-block p-4 bg-white/5 rounded-3xl border border-white/10">
                    <MapPin className="w-8 h-8 text-[#FFD100] mx-auto mb-2" />
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Recent Ride Detect</p>
                    <p className="text-white font-bold text-sm mt-1">{db.recentRide.from} → {db.recentRide.to}</p>
                  </div>
                  <h4 className="text-white font-black text-3xl mb-3">Hi {db.currentUser.name.split(' ')[0]} 👋</h4>
                  <p className="text-base text-zinc-400 mb-8 font-medium">How can we assist you with your recent trip?</p>
                  <div className="flex flex-col gap-3">
                     {[ { text: "Driver took a long/wrong route", icon: MapPin }, { text: "I was overcharged for this ride", icon: Zap }, { text: "Talk to a live support agent", icon: User } ].map((opt, i) => (
                       <motion.button 
                         key={opt.text} onClick={(e) => handleSend(e, opt.text)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                         className="w-full flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/5 hover:border-[#FFD100]/50"
                       >
                         <div className="p-2 bg-black/50 rounded-xl"><opt.icon className="w-4 h-4 text-[#FFD100]" /></div>{opt.text}
                       </motion.button>
                     ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {chatMessages.map((msg, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex flex-col ${msg.senderType === 'customer' ? 'items-end' : 'items-start'}`}>
                      {msg.senderType === 'system' ? (
                         <div className="w-full flex justify-center my-3"><span className="text-[10px] text-[#FFD100] font-black uppercase tracking-widest bg-[#FFD100]/10 border border-[#FFD100]/20 px-4 py-2 rounded-full text-center">{msg.text}</span></div>
                      ) : (
                        <div className={`max-w-[85%] px-6 py-4 text-sm shadow-2xl ${msg.senderType === 'customer' ? 'bg-[#FFD100] text-black rounded-3xl rounded-tr-lg font-bold' : 'bg-white/10 text-white border border-white/10 rounded-3xl rounded-tl-lg backdrop-blur-md'}`}>
                          {msg.text}
                        </div>
                      )}
                      {msg.senderType !== 'system' && (
                         <span className="text-[10px] text-zinc-500 mt-2 mx-2 font-bold tracking-widest uppercase">{msg.senderType === 'agent' ? 'Agent' : msg.senderType === 'ai' ? 'AI' : ''} {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                      <div className="bg-white/10 border border-white/10 rounded-3xl rounded-tl-lg px-5 py-4 flex gap-1.5 items-center">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-[#FFD100] rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#FFD100] rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#FFD100] rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 bg-[#0A0A0A]/90 backdrop-blur-3xl border-t border-white/10 shrink-0 pb-safe">
              {currentTicket?.status === 'offline_queued' ? (
                <div className="text-center p-3 border border-red-500/20 bg-red-500/10 rounded-xl">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Chat Disabled</p>
                  <p className="text-sm text-zinc-400 mt-1">Please email us at roypratik2000@gmail.com</p>
                </div>
              ) : (
                <form onSubmit={(e) => handleSend(e, null)} className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={currentTicket?.status === 'resolved'} placeholder={currentTicket?.status === 'resolved' ? "Chat ended." : "Type your message..."} className="w-full bg-black/60 border border-white/10 rounded-2xl pl-5 pr-12 py-4.5 text-sm text-white focus:outline-none focus:border-[#FFD100]/50 transition-all placeholder:text-zinc-600 font-semibold disabled:opacity-50" />
                    <Paperclip className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 cursor-pointer hover:text-[#FFD100] transition-colors" />
                  </div>
                  <button type="submit" disabled={!inputText.trim() || currentTicket?.status === 'resolved'} className="w-14 h-14 bg-[#FFD100] hover:bg-yellow-400 disabled:bg-white/5 disabled:text-zinc-600 text-black rounded-2xl flex items-center justify-center transition-all active:scale-95"><Send className="w-6 h-6 ml-1" /></button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- TICKET WORKSPACE (SHARED AGENT/ADMIN) ---
const TicketDetailWorkspace = ({ ticketId, onBack, asAdmin = false }) => {
  const { db, currentAgent, currentAdmin, sendMessage, assignTicket, endChatAgent, updateTicketDetails, linkTicket } = useContext(GlobalContext);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editData, setEditData] = useState({ priority: '', category: '' });
  const [linkData, setLinkData] = useState('');
  const messagesEndRef = useRef(null);

  const ticket = db.tickets.find(t => t.id === ticketId);
  const messages = db.messages.filter(m => m.ticketId === ticketId);
  const customer = db.customers[ticket?.customerId] || db.currentUser;
  
  const activeUserName = asAdmin ? currentAdmin?.name || 'Admin' : currentAgent?.name || 'Agent';
  const activeUserId = asAdmin ? currentAdmin?.id || 'ADMIN' : currentAgent?.id;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  if (!ticket) return null;

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!ticket.assignedTo && !asAdmin) assignTicket(ticket.id, activeUserId);
    
    if (isInternalNote) {
      sendMessage(ticket.id, activeUserId, 'internal', replyText);
    } else {
      sendMessage(ticket.id, activeUserId, 'agent', replyText);
    }
    setReplyText('');
  };

  const handleAgentEndChat = () => {
    endChatAgent(ticket.id, activeUserName);
    onBack();
  };

  const getPriorityColor = (p) => {
    if(p.includes('P1')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if(p.includes('P2')) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-[#FFD100] bg-[#FFD100]/10 border-[#FFD100]/20';
  }

  const getTypeIcon = (type) => {
    if(type === 'Incident') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if(type === 'Bug') return <Bug className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4 text-blue-400" />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute inset-0 z-40 md:relative md:z-auto flex h-full bg-[#0A0A0A] md:rounded-[2rem] border border-white/5 overflow-hidden flex-col md:flex-row shadow-2xl">
      <div className="flex-1 flex flex-col min-w-0 md:border-r border-white/5 bg-[#050505] z-10">
        <div className="p-4 md:p-6 bg-white/5 border-b border-white/10 shrink-0 z-20">
           <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-3">
             <button onClick={onBack} className="hover:text-white flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Back</button>
             <span className="mx-2">/</span>
             <span className={`${asAdmin ? 'text-purple-400' : 'text-[#FFD100]'} font-mono tracking-wider`}>{ticket.id}</span>
           </div>
           <div className="flex justify-between items-start">
             <h2 className="text-white font-black text-xl md:text-2xl">{ticket.subject}</h2>
             <div className="hidden sm:flex gap-3">
               {!ticket.assignedTo && !asAdmin ? (
                  <Button onClick={() => assignTicket(ticket.id, activeUserId)} className="h-9 py-0 text-xs rounded-xl">Assign to Me</Button>
               ) : ticket.status !== 'resolved' && !asAdmin ? (
                  <Button variant="danger" onClick={handleAgentEndChat} className="h-9 py-0 text-xs rounded-xl">Resolve Issue</Button>
               ) : ticket.status === 'resolved' ? (
                  <span className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold uppercase tracking-widest">Resolved</span>
               ) : null}
             </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Activity className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Activity Stream</span>
          </div>

          {ticket.aiInsights && (
             <div className="bg-[#FFD100]/5 border border-[#FFD100]/20 rounded-xl p-4 mb-6 shadow-inner">
               <div className="flex items-center gap-2 mb-2">
                 <Zap className="w-4 h-4 text-[#FFD100]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD100]">AI Diagnosis Engine</span>
               </div>
               <p className="text-sm text-zinc-300 font-medium mb-3">{ticket.aiInsights.analysis}</p>
               <div className="flex gap-4">
                 <span className="text-xs bg-black/50 px-2 py-1 rounded border border-white/5 text-white"><span className="text-zinc-500">Confidence:</span> {ticket.aiInsights.confidenceScore}%</span>
                 <span className="text-xs bg-black/50 px-2 py-1 rounded border border-white/5 text-white"><span className="text-zinc-500">Risk:</span> {ticket.aiInsights.fraudRisk}</span>
               </div>
             </div>
          )}

          {messages.map(msg => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex flex-col ${msg.senderType === 'agent' || msg.senderType === 'internal' ? 'items-end' : 'items-start'}`}>
               {msg.senderType === 'system' ? (
                  <div className="w-full flex justify-center my-2">
                    <span className="bg-white/5 text-zinc-500 text-[9px] font-bold uppercase tracking-widest py-1 px-3 rounded-md border border-white/10 flex items-center gap-1"><CircleDot className="w-3 h-3"/> {msg.text}</span>
                  </div>
               ) : (
                <div className={`max-w-[90%] md:max-w-[75%] ${msg.senderType === 'agent' || msg.senderType === 'internal' ? '' : 'flex gap-3'}`}>
                  {msg.senderType !== 'agent' && msg.senderType !== 'internal' && (
                    <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                      {msg.senderType === 'ai' ? <Zap className={`w-4 h-4 ${asAdmin ? 'text-purple-400' : 'text-[#FFD100]'}`} /> : <User className="w-4 h-4 text-zinc-500" />}
                    </div>
                  )}
                  <div>
                    <div className={`flex items-baseline gap-2 mb-1 ${msg.senderType === 'agent' || msg.senderType === 'internal' ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {msg.senderType === 'agent' || msg.senderType === 'internal' ? activeUserName : msg.senderType === 'ai' ? 'System Bot' : customer.name}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className={`px-4 py-3 text-sm rounded-xl font-medium shadow-md ${
                      msg.senderType === 'agent' ? `bg-[#1A1A1C] border border-white/10 text-white rounded-tr-sm` : 
                      msg.senderType === 'internal' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-tr-sm' :
                      'bg-white/5 text-white border border-white/5 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
               )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== 'resolved' && !asAdmin && (
          <div className="p-4 bg-[#0A0A0A] border-t border-white/5 shrink-0">
            <div className="flex gap-4 mb-2">
              <button onClick={() => setIsInternalNote(false)} className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${!isInternalNote ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-white'}`}>Public Reply</button>
              <button onClick={() => setIsInternalNote(true)} className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 ${isInternalNote ? 'text-yellow-500 bg-yellow-500/10' : 'text-zinc-500 hover:text-yellow-500'}`}>Internal Note</button>
            </div>
            <form onSubmit={handleReply} className="relative flex flex-col gap-2">
              <div className={`bg-black/50 border rounded-xl overflow-hidden transition-all p-1 ${isInternalNote ? 'border-yellow-500/30' : 'border-white/10 focus-within:border-[#FFD100]/50'}`}>
                <textarea 
                  value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isInternalNote ? "Add an internal note (customers won't see this)..." : "Reply to customer..."}
                  className={`w-full bg-transparent px-3 py-2 text-sm focus:outline-none resize-none font-medium h-20 ${isInternalNote ? 'text-yellow-500' : 'text-white'}`}
                />
                <div className="flex justify-between items-center px-2 pb-1">
                  <div className="flex gap-2">
                    <button type="button" className="p-1.5 hover:bg-white/10 rounded text-zinc-400"><Paperclip className="w-4 h-4"/></button>
                    <button type="button" className="p-1.5 hover:bg-white/10 rounded text-zinc-400"><FileText className="w-4 h-4"/></button>
                  </div>
                  <Button type="submit" disabled={!replyText.trim()} className="h-8 py-0 px-4 rounded-lg text-xs">Comment</Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Right Column: Details Panel */}
      <div className="hidden md:flex flex-col w-80 bg-[#0A0A0A] overflow-y-auto border-l border-white/5">
        <div className="h-14 px-5 border-b border-white/5 flex items-center bg-white/5 shrink-0">
           <h3 className="text-xs font-black text-white uppercase tracking-widest">Details</h3>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="flex gap-2">
             <button onClick={() => { setEditData({priority: ticket.priority, category: ticket.category}); setIsEditModalOpen(true); }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg text-xs font-bold text-white transition-colors">Edit</button>
             <button onClick={() => setIsLinkModalOpen(true)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg text-xs font-bold text-white transition-colors">Link Issue</button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Assignee</span>
              {asAdmin ? (
                <select 
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  value={ticket.assignedTo || ''}
                  onChange={(e) => assignTicket(ticket.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {db.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                  <div className="w-6 h-6 bg-[#FFD100]/20 text-[#FFD100] rounded-md flex items-center justify-center text-xs font-bold">{ticket.assignedTo ? ticket.assignedTo.charAt(4) : '?'}</div>
                  <span className="text-sm font-semibold text-white">{ticket.assignedTo || 'Unassigned'}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reporter</span>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="w-6 h-6 bg-white/10 text-white rounded-md flex items-center justify-center text-xs font-bold">{customer.name.charAt(0)}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">{customer.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{ticket.customerId}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Priority</span>
              <div className={`text-xs font-bold px-3 py-2 rounded-lg border flex items-center gap-2 ${getPriorityColor(ticket.priority)}`}>
                <AlertCircle className="w-4 h-4"/> {ticket.priority}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Labels</span>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300 flex items-center gap-1"><Tag className="w-3 h-3"/> {ticket.category}</span>
                <span className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300 flex items-center gap-1"><Tag className="w-3 h-3"/> App</span>
              </div>
            </div>

            <div className="h-px bg-white/5 my-4"></div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Environment</span>
              <span className="text-xs text-zinc-300 font-mono">{ticket.environment}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Created</span>
              <span className="text-xs text-zinc-300">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jira Modals (Edit / Link) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
              <h3 className="text-white font-black text-lg mb-4">Edit Ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">Priority</label>
                  <select value={editData.priority} onChange={e=>setEditData({...editData, priority: e.target.value})} className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none ${asAdmin ? 'focus:border-purple-500' : 'focus:border-[#FFD100]'}`}>
                    <option value="P1 - Critical">P1 - Critical</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-2">Category</label>
                  <input type="text" value={editData.category} onChange={e=>setEditData({...editData, category: e.target.value})} className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none ${asAdmin ? 'focus:border-purple-500' : 'focus:border-[#FFD100]'}`} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={()=>setIsEditModalOpen(false)} className="flex-1 h-10">Cancel</Button>
                <Button onClick={()=>{ updateTicketDetails(ticket.id, editData); setIsEditModalOpen(false); }} className={`flex-1 h-10 ${asAdmin ? '!bg-purple-600 hover:!bg-purple-500 shadow-none border-0 text-white' : ''}`}>Save</Button>
              </div>
            </motion.div>
          </div>
        )}

        {isLinkModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
              <h3 className="text-white font-black text-lg mb-4">Link Issue</h3>
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-2">Enter Ticket Key</label>
                <input type="text" value={linkData} onChange={e=>setLinkData(e.target.value)} placeholder="e.g. CUST-001-XYZ123" className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none ${asAdmin ? 'focus:border-purple-500' : 'focus:border-[#FFD100]'}`} />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={()=>setIsLinkModalOpen(false)} className="flex-1 h-10">Cancel</Button>
                <Button onClick={()=>{ linkTicket(ticket.id, linkData); setIsLinkModalOpen(false); }} className={`flex-1 h-10 ${asAdmin ? '!bg-purple-600 hover:!bg-purple-500 shadow-none border-0 text-white' : ''}`}>Link</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const AgentLogin = () => {
  const { setCurrentAgent, db } = useContext(GlobalContext);
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
      <Floating3DBackground />
      <TiltCard className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10`}>
        <div className="w-24 h-24 bg-[#FFD100]/10 border border-[#FFD100]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#FFD100]/10">
          <Headset className="w-12 h-12 text-[#FFD100]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Agent Portal</h2>
        <p className="text-zinc-400 text-sm mb-10 font-bold uppercase tracking-widest">Internal Access</p>
        <div className="space-y-4">
          {db.agents.map((agent, i) => (
            <motion.button key={agent.id} onClick={() => setCurrentAgent(agent)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="w-full p-5 flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#FFD100]/50 rounded-2xl transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center font-black text-[#FFD100] text-xl">{agent.name.charAt(0)}</div>
                <div className="text-left"><div className="text-white font-bold text-lg">{agent.name}</div><div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{agent.role}</div></div>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-[#FFD100] transition-colors group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </TiltCard>
    </div>
  );
};

const AgentDashboard = () => {
  const { db, currentAgent } = useContext(GlobalContext);
  const [activeTab, setActiveTab] = useState('mine'); 
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const myTickets = db.tickets.filter(t => t.assignedTo === currentAgent.id && t.status !== 'resolved');
  const unassignedTickets = db.tickets.filter(t => !t.assignedTo && t.status !== 'resolved');
  const resolvedTickets = db.tickets.filter(t => t.status === 'resolved');

  const getActiveQueue = () => {
    if (activeTab === 'mine') return myTickets;
    if (activeTab === 'unassigned') return unassignedTickets;
    return resolvedTickets;
  };

  const getPriorityColor = (p) => {
    if(p.includes('P1')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if(p.includes('P2')) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-[#FFD100] bg-[#FFD100]/10 border-[#FFD100]/20';
  }

  const getTypeIcon = (type) => {
    if(type === 'Incident') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if(type === 'Bug') return <Bug className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4 text-blue-400" />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      {!selectedTicketId ? (
        <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden z-10">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black text-white tracking-tight">Issue Navigator</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="text" placeholder="Search issues..." className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFD100]/50 w-64 font-medium" />
              </div>
            </div>
            <div className="flex gap-4 border-b border-white/10">
              {[
                { id: 'mine', label: 'My Open Issues', count: myTickets.length },
                { id: 'unassigned', label: 'Unassigned Queue', count: unassignedTickets.length },
                { id: 'resolved', label: 'Done', count: null }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-[#FFD100]' : 'text-zinc-500 hover:text-white'}`}>
                  {tab.label} {tab.count !== null && <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{tab.count}</span>}
                  {activeTab === tab.id && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD100]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#050505]">
             <table className="w-full text-left border-collapse">
               <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                 <tr>
                   <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-16">T</th>
                   <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Key</th>
                   <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">Summary</th>
                   <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Priority</th>
                   <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Status</th>
                   <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">Created</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {getActiveQueue().length === 0 ? (
                   <tr><td colSpan="6" className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest">No issues found</td></tr>
                 ) : (
                   getActiveQueue().map((ticket) => (
                     <tr key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)} className="hover:bg-white/[0.02] cursor-pointer group transition-colors">
                       <td className="px-6 py-4">{getTypeIcon(ticket.issueType)}</td>
                       <td className="px-6 py-4 font-mono text-xs text-[#FFD100] group-hover:underline">{ticket.id}</td>
                       <td className="px-6 py-4">
                         <div className="font-bold text-white text-sm truncate">{ticket.subject}</div>
                         <div className="text-xs text-zinc-500 mt-1">{db.customers[ticket.customerId]?.name}</div>
                       </td>
                       <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded border ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span></td>
                       <td className="px-6 py-4"><span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-300 px-2 py-1 rounded">{ticket.status.replace('_',' ')}</span></td>
                       <td className="px-6 py-4 text-right text-xs text-zinc-500 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
      ) : (
         <TicketDetailWorkspace ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />
      )}
    </div>
  );
};


const AdminLogin = () => {
  const { setIsAdminLogged, setCurrentAdmin, db } = useContext(GlobalContext);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin') {
      setCurrentAdmin(selectedAdmin);
      setIsAdminLogged(true);
    } else {
      setError('Invalid master key.');
    }
  };

  if (!selectedAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
        <Floating3DBackground />
        <TiltCard className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10 border-purple-500/20`}>
          <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/10">
            <ShieldAlert className="w-12 h-12 text-purple-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Masterpower</h2>
          <p className="text-zinc-400 text-sm mb-10 font-bold uppercase tracking-widest">Select Admin Profile</p>
          
          <div className="space-y-4">
            {db.adminUsers.map((admin, i) => (
              <motion.button key={admin.id} onClick={() => setSelectedAdmin(admin)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="w-full p-5 flex items-center justify-between bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/50 rounded-2xl transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-black border border-purple-500/20 rounded-xl flex items-center justify-center font-black text-purple-500 text-xl">{admin.name.charAt(0)}</div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg flex items-center gap-2">{admin.name} <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">{admin.tags[0]}</span></div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{admin.role}</div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-purple-500 transition-colors group-hover:translate-x-1" />
              </motion.button>
            ))}
          </div>
        </TiltCard>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
      <Floating3DBackground />
      <TiltCard className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10 border-purple-500/20`}>
        <button onClick={() => setSelectedAdmin(null)} className="absolute top-6 left-6 text-zinc-500 hover:text-white"><ChevronLeft className="w-6 h-6"/></button>
        <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/10">
          <User className="w-12 h-12 text-purple-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{selectedAdmin.name}</h2>
        <p className="text-zinc-400 text-xs mb-8 font-bold uppercase tracking-widest">{selectedAdmin.role}</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter Master Key (admin)"
            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-center text-white focus:outline-none focus:border-purple-500 transition-all font-medium tracking-widest"
          />
          {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
          <Button type="submit" className="w-full !bg-purple-600 hover:!bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border-0">
            Authenticate Masterpower
          </Button>
        </form>
      </TiltCard>
    </div>
  );
};

const AdminDashboard = () => {
  const { db, currentAdmin, toggleSystemOffline, advanceApproval, rejectApproval, updateDriverApp, createOnboarding } = useContext(GlobalContext);
  const [activeTab, setActiveTab] = useState('global');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showInternForm, setShowInternForm] = useState(false);
  const [showContractorForm, setShowContractorForm] = useState(false);

  const isHR = currentAdmin?.tags.includes('HR');

  const getTypeIcon = (type) => {
    if(type === 'Incident') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if(type === 'Bug') return <Bug className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4 text-purple-400" />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
       {!selectedTicketId ? (
         <div className="flex-1 flex h-full bg-[#0A0A0A] border border-purple-500/20 rounded-[2rem] shadow-2xl overflow-hidden z-10 flex-col md:flex-row">
           
           <div className="w-full md:w-64 bg-[#121214] border-r border-white/5 flex flex-col shrink-0">
             <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-500 rounded-lg flex items-center justify-center font-black text-lg">{currentAdmin.name.charAt(0)}</div>
                  <div>
                    <h2 className="text-white font-bold">{currentAdmin.name}</h2>
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 font-bold uppercase">{currentAdmin.tags[0]}</span>
                  </div>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">Support</p>
                  <button onClick={()=>setActiveTab('global')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab==='global'?'bg-purple-500/20 text-purple-400':'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                    <Activity className="w-4 h-4"/> Global Tickets
                  </button>
                </div>
                
                {isHR && (
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">HR & Operations</p>
                    <div className="space-y-1">
                      {[
                        { id: 'hr_dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'approvals', label: 'Approval Center', icon: CheckCircle },
                        { id: 'attendance_shifts', label: 'Attendance & Shifts', icon: CalendarClock },
                        { id: 'compliance', label: 'Compliance', icon: FileWarning },
                        { id: 'directory', label: 'Directory', icon: Users }
                      ].map(tab => (
                        <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab===tab.id?'bg-purple-500/20 text-purple-400':'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                          <tab.icon className="w-4 h-4"/> {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {!isHR && (
                   <div>
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">Management</p>
                     <button onClick={()=>setActiveTab('approvals')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab==='approvals'?'bg-purple-500/20 text-purple-400':'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                       <CheckCircle className="w-4 h-4"/> Approvals
                     </button>
                   </div>
                )}

                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-2">System</p>
                  <div className="px-4 py-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-red-500">Emergency Override</span>
                      <button onClick={toggleSystemOffline} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${db.systemOffline ? 'bg-red-500' : 'bg-zinc-700'}`}>
                         <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${db.systemOffline ? 'translate-x-5' : 'translate-x-1'}`}/>
                      </button>
                    </div>
                    {db.systemOffline ? <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">SYSTEM OFFLINE</span> : <span className="text-[9px] text-zinc-500 uppercase tracking-widest">System Online</span>}
                  </div>
                </div>
             </div>
           </div>

           <div className="flex-1 overflow-auto bg-[#050505] flex flex-col relative">
              {activeTab === 'global' && (
                <>
                  <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-black shrink-0">
                    <h2 className="text-2xl font-black text-white">Global Tickets Database</h2>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0A0A0A] sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-16">T</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Key</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 w-1/3">Summary</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Assignee</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {db.tickets.length === 0 ? (
                        <tr><td colSpan="5" className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest">No tickets in system</td></tr>
                      ) : (
                        db.tickets.map((ticket) => (
                          <tr key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)} className="hover:bg-white/[0.02] cursor-pointer group transition-colors">
                            <td className="px-6 py-4">{getTypeIcon(ticket.issueType)}</td>
                            <td className="px-6 py-4 font-mono text-xs text-purple-400 group-hover:underline">{ticket.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-sm truncate">{ticket.subject}</div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-zinc-300">{ticket.assignedTo || 'Unassigned'}</td>
                            <td className="px-6 py-4"><span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-zinc-300 px-2 py-1 rounded">{ticket.status.replace('_',' ')}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              )}

              {activeTab === 'hr_dashboard' && isHR && (
                 <div className="p-6 md:p-8 space-y-6">
                    <h2 className="text-2xl font-black text-white mb-6">HR Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                       {[
                         {label: 'Drivers Pending', val: 128, color: 'text-blue-400'},
                         {label: 'Interns Onboarding', val: 5, color: 'text-purple-400'},
                         {label: 'Contractors Pending', val: 3, color: 'text-orange-400'},
                         {label: 'Attendance', val: '92%', color: 'text-green-400'},
                         {label: 'Clocked In', val: 27, color: 'text-white'},
                         {label: 'Compliance Alerts', val: 8, color: 'text-red-500'}
                       ].map(c => (
                         <div key={c.label} className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">{c.label}</span>
                           <span className={`text-3xl font-black mt-3 ${c.color}`}>{c.val}</span>
                         </div>
                       ))}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                       <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl">
                         <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Quick Actions</h3>
                         <div className="space-y-3">
                           <Button onClick={()=>setShowDriverForm(true)} className="w-full justify-start !bg-white/5 hover:!bg-white/10 text-white border border-white/10 shadow-none"><Car className="w-5 h-5 mr-3"/> Add Driver</Button>
                           <Button onClick={()=>setShowInternForm(true)} className="w-full justify-start !bg-white/5 hover:!bg-white/10 text-white border border-white/10 shadow-none"><UserPlus className="w-5 h-5 mr-3"/> Add Intern</Button>
                           <Button onClick={()=>setShowContractorForm(true)} className="w-full justify-start !bg-white/5 hover:!bg-white/10 text-white border border-white/10 shadow-none"><Briefcase className="w-5 h-5 mr-3"/> Add Contractor</Button>
                         </div>
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'approvals' && (
                 <div className="p-6 md:p-8 flex flex-col h-full">
                    <h2 className="text-2xl font-black text-white mb-6">Approval Center</h2>
                    <div className="space-y-8 flex-1 overflow-auto pr-2">
                       {/* INTERN SECTION */}
                       <div className="bg-[#121214] border border-purple-500/10 rounded-3xl p-6">
                         <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2"><UserPlus className="w-5 h-5 text-purple-500"/> Intern Onboarding</h3>
                         <div className="space-y-4">
                           {db.onboardingRequests.filter(r => isHR ? r.status==='pending_hr' : r.status==='pending_manager').length === 0 ? (
                             <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center py-4">No pending approvals</p>
                           ) : db.onboardingRequests.filter(r => isHR ? r.status==='pending_hr' : r.status==='pending_manager').map(req => (
                             <div key={req.id} className="bg-black/50 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                               <div>
                                 <p className="text-white font-bold text-lg">{req.name} <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded ml-2 uppercase">Awaiting {isHR?'HR':'Manager'}</span></p>
                                 <p className="text-sm text-zinc-400 mt-1">{req.role} • {req.department}</p>
                               </div>
                               <div className="flex gap-3 w-full md:w-auto">
                                 <Button variant="danger" onClick={()=>rejectApproval('Intern', req.id)} className="flex-1 md:flex-none h-10 px-4 py-0 text-xs">Reject</Button>
                                 <Button onClick={()=>advanceApproval('Intern', req.id, req.status)} className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-purple-600 hover:!bg-purple-500 text-white shadow-none border-0">{isHR?'Approve & Add to Directory':'Approve & Send to HR'}</Button>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                       {/* DRIVER SECTION */}
                       <div className="bg-[#121214] border border-blue-500/10 rounded-3xl p-6">
                         <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Car className="w-5 h-5 text-blue-500"/> Driver Onboarding</h3>
                         <div className="space-y-4">
                           {db.driverApplications.filter(r => isHR ? r.status==='pending_hr' : r.status==='pending_manager').length === 0 ? (
                             <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center py-4">No pending approvals</p>
                           ) : db.driverApplications.filter(r => isHR ? r.status==='pending_hr' : r.status==='pending_manager').map(req => (
                             <div key={req.id} className="bg-black/50 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                               <div>
                                 <p className="text-white font-bold text-lg">{req.name} <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2 uppercase">Awaiting {isHR?'HR':'Manager'}</span></p>
                                 <p className="text-sm text-zinc-400 mt-1">{req.vehicle} • {req.phone}</p>
                               </div>
                               <div className="flex gap-3 w-full md:w-auto">
                                 <Button variant="danger" onClick={()=>rejectApproval('Driver', req.id)} className="flex-1 md:flex-none h-10 px-4 py-0 text-xs">Reject</Button>
                                 <Button onClick={()=>advanceApproval('Driver', req.id, req.status)} className="flex-1 md:flex-none h-10 px-4 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0">{isHR?'Approve & Activate Driver':'Approve & Send to HR'}</Button>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                 </div>
              )}
              
              {/* MODALS */}
              {showDriverForm && (
                <GenericFormModal 
                  title="Driver Registration Form"
                  fields={[
                    {name: 'name', label: 'Full Name', placeholder: 'e.g. Ramesh Kumar'},
                    {name: 'phone', label: 'Mobile Number', placeholder: '+91...'},
                    {name: 'vehicle', label: 'Vehicle Category & Model', type: 'select', options: ['AC Mini - Tata Tigor', 'AC Sedan - Swift Dzire', 'AC XL - Innova']},
                    {name: 'dl', label: 'Driving License No.', placeholder: 'DL-XXXX...'},
                  ]}
                  onSubmit={(data) => {
                    createOnboarding('Driver', data);
                  }}
                  onClose={()=>setShowDriverForm(false)}
                />
              )}
              {showInternForm && (
                <GenericFormModal 
                  title="Intern Onboarding Form"
                  fields={[
                    {name: 'name', label: 'Full Name', placeholder: 'e.g. Pooja Singh'},
                    {name: 'email', label: 'Email', placeholder: 'pooja@miles.com'},
                    {name: 'department', label: 'Department', type: 'select', options: ['Engineering', 'Operations', 'Marketing']},
                    {name: 'role', label: 'Role Title', placeholder: 'e.g. Backend Intern'},
                  ]}
                  onSubmit={(data) => {
                    createOnboarding('Intern', data);
                  }}
                  onClose={()=>setShowInternForm(false)}
                />
              )}
              {showContractorForm && (
                <GenericFormModal 
                  title="Contractor Onboarding Form"
                  fields={[
                    {name: 'name', label: 'Vendor Name', placeholder: 'e.g. TechCorp Solutions'},
                    {name: 'type', label: 'Contract Type', type: 'select', options: ['IT Support', 'Fleet Maintenance', 'Marketing Agency']},
                    {name: 'email', label: 'Primary Contact Email', placeholder: 'contact@vendor.com'},
                  ]}
                  onSubmit={(data) => {
                    createOnboarding('Contractor', data);
                  }}
                  onClose={()=>setShowContractorForm(false)}
                />
              )}

           </div>
         </div>
       ) : (
         <TicketDetailWorkspace ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} asAdmin={true} />
       )}
    </div>
  );
};


const EmployeeLogin = () => {
  const { setCurrentEmployee, db } = useContext(GlobalContext);
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
      <Floating3DBackground />
      <TiltCard className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10`}>
        <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/10">
          <UserPlus className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Team Portal</h2>
        <p className="text-zinc-400 text-sm mb-10 font-bold uppercase tracking-widest">Internal Access</p>
        
        <div className="space-y-4">
          {db.employees.map((emp, i) => (
            <motion.button key={emp.id} onClick={() => setCurrentEmployee(emp)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="w-full p-5 flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center font-black text-blue-500 text-xl">{emp.name.charAt(0)}</div>
                <div className="text-left"><div className="text-white font-bold text-lg">{emp.name}</div><div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{emp.role}</div></div>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </TiltCard>
    </div>
  );
};

const EmployeeDashboard = () => {
  const { db, currentEmployee, requestLeaveWFH, updateTaskStatus, addTask, updateDriverApp } = useContext(GlobalContext);
  const [activeTab, setActiveTab] = useState('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({ type: 'Leave', date: '', reason: '' });
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleLeaveSubmit = () => {
    requestLeaveWFH(leaveData.type, leaveData.date, leaveData.reason);
    setIsLeaveModalOpen(false);
    setLeaveData({ type: 'Leave', date: '', reason: '' });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if(newTaskTitle.trim()) {
      addTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#050505] relative p-2 md:p-6">
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-blue-500/20 rounded-[2rem] shadow-2xl overflow-hidden z-10">
        <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-black shrink-0">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">Team Workspace</h1>
          <div className="flex gap-4 border-b border-white/10">
            {[ { id: 'tasks', label: 'Tasks Board' }, { id: 'drivers', label: 'Driver Verification' }, { id: 'leave', label: 'Leave / WFH' } ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}>
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="empTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#050505] p-6">
           {activeTab === 'tasks' && (
             <div className="space-y-6">
               <form onSubmit={handleAddTask} className="flex gap-3">
                 <input type="text" value={newTaskTitle} onChange={(e)=>setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className="flex-1 bg-[#121214] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                 <Button type="submit" className="!bg-blue-600 hover:!bg-blue-500 text-white shadow-none"><Plus className="w-5 h-5"/></Button>
               </form>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {['todo', 'in_progress', 'done'].map(status => (
                   <div key={status} className="bg-[#121214] rounded-2xl p-4 border border-white/5">
                     <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">{status.replace('_', ' ')}</h3>
                     <div className="space-y-3">
                       {db.tasks.filter(t=>t.status===status).map(task => (
                         <div key={task.id} className="bg-black/50 p-4 rounded-xl border border-white/5 shadow-sm">
                           <p className="text-sm font-semibold text-white mb-3">{task.title}</p>
                           <div className="flex justify-between items-center">
                             <span className="text-[9px] font-mono text-zinc-500">{task.id}</span>
                             <div className="flex gap-2">
                               {status !== 'todo' && <button onClick={()=>updateTaskStatus(task.id, 'todo')} className="text-xs text-zinc-400 hover:text-white">To Do</button>}
                               {status !== 'in_progress' && <button onClick={()=>updateTaskStatus(task.id, 'in_progress')} className="text-xs text-blue-400 hover:text-blue-300">Start</button>}
                               {status !== 'done' && <button onClick={()=>updateTaskStatus(task.id, 'done')} className="text-xs text-green-400 hover:text-green-300">Done</button>}
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

           {activeTab === 'drivers' && (
             <div className="space-y-4">
               <h3 className="text-white font-black text-xl mb-4">Pending Driver Verifications</h3>
               <div className="grid gap-4">
                 {db.driverApplications.filter(d=>d.status==='pending').length === 0 ? (
                   <div className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest bg-[#0A0A0A] rounded-2xl border border-white/5">No pending verifications</div>
                 ) : db.driverApplications.filter(d=>d.status==='pending').map(drv => (
                   <div key={drv.id} className="bg-[#121214] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center"><Car className="w-6 h-6 text-zinc-400"/></div>
                       <div>
                         <h4 className="text-white font-bold text-base">{drv.name} <span className="text-[10px] text-zinc-500 font-mono ml-2">{drv.id}</span></h4>
                         <p className="text-xs text-zinc-400 mt-1">{drv.phone} • Vehicle: {drv.vehicle}</p>
                       </div>
                     </div>
                     <Button onClick={() => setSelectedDriver(drv)} className="h-10 px-6 py-0 text-xs !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0">Review Documents</Button>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {activeTab === 'leave' && (
             <div className="max-w-md mx-auto space-y-6 pt-4">
               <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl text-center">
                 <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-4">{currentEmployee.name.charAt(0)}</div>
                 <h3 className="text-xl font-bold text-white mb-1">{currentEmployee.name}</h3>
                 <p className="text-sm text-zinc-500 mb-6">{currentEmployee.role} • {currentEmployee.department}</p>
                 <div className="flex justify-around bg-black/50 p-4 rounded-xl border border-white/5">
                   <div><p className="text-[10px] font-black uppercase text-zinc-500">Leave Balance</p><p className="text-lg font-bold text-white">{currentEmployee.leaveBalance} Days</p></div>
                   <div className="w-px bg-white/10"></div>
                   <div><p className="text-[10px] font-black uppercase text-zinc-500">Work Type</p><p className="text-lg font-bold text-white">{currentEmployee.workType}</p></div>
                 </div>
               </div>
               <Button className="w-full bg-white/10 hover:bg-white/20 text-white shadow-none" onClick={() => setIsLeaveModalOpen(true)}>Request PTO / Leave</Button>
             </div>
           )}
        </div>
      </div>
      
      <AnimatePresence>
        {isLeaveModalOpen && (
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
               <h3 className="text-white font-black text-lg mb-4">Request Leave / WFH</h3>
               <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-zinc-500 block mb-2">Request Type</label>
                   <select value={leaveData.type} onChange={e=>setLeaveData({...leaveData, type: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500">
                     <option value="Leave">Leave / Day Off</option>
                     <option value="WFH">Work From Home (WFH)</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-zinc-500 block mb-2">Date</label>
                   <input type="date" value={leaveData.date} onChange={e=>setLeaveData({...leaveData, date: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-zinc-500 block mb-2">Reason</label>
                   <textarea value={leaveData.reason} onChange={e=>setLeaveData({...leaveData, reason: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 h-20 resize-none" placeholder="Reason for request..."></textarea>
                 </div>
               </div>
               <div className="flex gap-3 mt-6">
                 <Button variant="secondary" onClick={()=>setIsLeaveModalOpen(false)} className="flex-1 h-10">Cancel</Button>
                 <Button onClick={handleLeaveSubmit} disabled={!leaveData.date || !leaveData.reason} className="flex-1 h-10 !bg-purple-600 hover:!bg-purple-500 text-white border-0 shadow-none">Submit Request</Button>
               </div>
             </motion.div>
           </div>
        )}

        {selectedDriver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-lg">Review Driver Documents</h3>
                <button onClick={()=>setSelectedDriver(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="bg-black/50 rounded-xl p-4 mb-4 border border-white/5">
                <p className="text-white font-bold">{selectedDriver.name}</p>
                <p className="text-sm text-zinc-400">{selectedDriver.vehicle} • {selectedDriver.phone}</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                   <div className="flex items-center gap-3 text-sm text-white"><FileText className="w-4 h-4 text-blue-400"/> Driver License</div>
                   <span className="text-[10px] font-bold text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                   <div className="flex items-center gap-3 text-sm text-white"><FileText className="w-4 h-4 text-blue-400"/> RC & Insurance</div>
                   <span className="text-[10px] font-bold text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">Verified</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="danger" onClick={()=>{updateDriverApp(selectedDriver.id, 'rejected'); setSelectedDriver(null);}} className="flex-1 h-10">Reject</Button>
                <Button onClick={()=>{updateDriverApp(selectedDriver.id, 'pending_manager'); setSelectedDriver(null);}} className="flex-[2] h-10 !bg-blue-600 hover:!bg-blue-500 text-white shadow-none border-0">Verify & Send to Manager</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GenericFormModal = ({ title, fields, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-purple-500/20 p-6 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black text-xl">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">{f.label}</label>
              {f.type === 'select' ? (
                <select required className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500" onChange={e=>setFormData({...formData, [f.name]: e.target.value})}>
                  <option value="">Select...</option>
                  {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type||'text'} required placeholder={f.placeholder} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500" onChange={e=>setFormData({...formData, [f.name]: e.target.value})} />
              )}
            </div>
          ))}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 h-12">Cancel</Button>
            <Button type="submit" className="flex-1 h-12 !bg-purple-600 hover:!bg-purple-500 text-white shadow-none border-0">Submit Request</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const GateShift = ({ userType }) => {
  const { currentAgent, currentEmployee, startShift } = useContext(GlobalContext);
  const name = userType === 'agent' ? currentAgent?.name : currentEmployee?.name;
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#050505] relative overflow-hidden">
      <Floating3DBackground />
      <div className="z-10 text-center max-w-lg px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 backdrop-blur-xl">
          <Clock className={`w-14 h-14 ${userType === 'agent' ? 'text-[#FFD100]' : 'text-blue-500'}`} />
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-black text-white mb-4">Welcome back, {name}</motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-400 text-lg mb-12 font-medium">You must clock in to access the system.</motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button onClick={startShift} className={`px-12 py-5 text-lg rounded-[2rem] w-full sm:w-auto ${userType==='employee'?'!bg-blue-600 hover:!bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border-0':''}`}>Start Shift</Button>
        </motion.div>
      </div>
    </div>
  );
};

const TopNav = () => {
  const { activeMode, setActiveMode, currentAgent, setCurrentAgent, currentEmployee, setCurrentEmployee, currentAdmin, setCurrentAdmin, isAdminLogged, setIsAdminLogged, shiftStatus, shiftDuration, endShift } = useContext(GlobalContext);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/10 z-[60] flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#FFD100] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,209,0,0.4)]">
          <span className="text-black font-black text-xl tracking-tighter">M</span>
        </div>
        <span className="text-white font-black text-xl tracking-tight hidden sm:block">MILES <span className="text-[#FFD100]">OS</span></span>
      </div>

      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative overflow-x-auto max-w-[50%] sm:max-w-none">
        {['customer', 'agent', 'employee', 'admin'].map((mode) => (
          <button
            key={mode} onClick={() => setActiveMode(mode)}
            className={`relative px-3 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors z-10 ${
              activeMode === mode ? 'text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {activeMode === mode && (
              <motion.div layoutId="navTab" className="absolute inset-0 bg-[#FFD100] rounded-lg shadow-md" transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{ zIndex: -1 }} />
            )}
            {mode}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {(activeMode === 'agent' && currentAgent) || (activeMode === 'employee' && currentEmployee) || (activeMode === 'admin' && isAdminLogged) ? (
          <>
            {shiftStatus !== 'offline' && (activeMode === 'agent' || activeMode === 'employee') && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span>
                <span className="hidden sm:block text-[11px] font-bold text-white uppercase tracking-widest">Online</span>
                <span className="text-xs font-mono text-zinc-400 ml-1">{formatDuration(shiftDuration)}</span>
              </div>
            )}
            <button 
              onClick={() => { 
                endShift(currentAgent, currentEmployee);
                if(activeMode === 'agent') setCurrentAgent(null); 
                if(activeMode === 'employee') setCurrentEmployee(null);
                if(activeMode === 'admin') { setIsAdminLogged(false); setCurrentAdmin(null); }
              }} 
              className="p-2 sm:px-4 sm:py-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center gap-2 group active:scale-95"
            >
              <LogOut className="w-5 h-5 sm:w-4 sm:h-4 group-hover:animate-pulse" />
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Log Out</span>
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <GlobalProvider>
      <div className="bg-[#050505] min-h-screen font-sans selection:bg-[#FFD100]/30 selection:text-[#FFD100]">
        <TopNav />
        <GlobalContext.Consumer>
          {({ activeMode, currentAgent, currentEmployee, isAdminLogged, shiftStatus }) => (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode + (currentAgent ? '-agt' : '') + (currentEmployee ? '-emp' : '') + (isAdminLogged ? '-adm' : '') + shiftStatus}
                initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.3 }}
                className="h-full pt-16"
              >
                {activeMode === 'customer' && <CustomerView />}
                
                {activeMode === 'agent' && !currentAgent && <AgentLogin />}
                {activeMode === 'agent' && currentAgent && shiftStatus === 'offline' && <GateShift userType="agent" />}
                {activeMode === 'agent' && currentAgent && shiftStatus !== 'offline' && <AgentDashboard />}
                
                {activeMode === 'employee' && !currentEmployee && <EmployeeLogin />}
                {activeMode === 'employee' && currentEmployee && shiftStatus === 'offline' && <GateShift userType="employee" />}
                {activeMode === 'employee' && currentEmployee && shiftStatus !== 'offline' && <EmployeeDashboard />}
                
                {activeMode === 'admin' && !isAdminLogged && <AdminLogin />}
                {activeMode === 'admin' && isAdminLogged && <AdminDashboard />}
              </motion.div>
            </AnimatePresence>
          )}
        </GlobalContext.Consumer>
      </div>
    </GlobalProvider>
  );
}