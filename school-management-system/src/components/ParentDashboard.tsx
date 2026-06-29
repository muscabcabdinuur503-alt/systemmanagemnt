/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Award,
  Wallet,
  Calendar,
  AlertCircle,
  FileText,
  Mail,
  Send,
  CheckCircle,
  Clock,
  Printer,
  TrendingUp,
  MessageSquareOff,
  MessageSquare,
  Video,
  BookOpen,
  HelpCircle,
  CreditCard,
  Inbox,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Student, Grade, FeeInvoice, Announcement, AttendanceRecord, DirectMessage, Teacher, SystemActivityLog, UserCredential, DocumentMaterial, QnaItem, VirtualClass, SchedulePeriod } from '../types';
import CurriculumDocumentsHub from './CurriculumDocumentsHub';
import SchoolCalendar from './SchoolCalendar';
import { ProfileSettings } from './ProfileSettings';

interface ParentDashboardProps {
  students: Student[]; // children of the parent (e.g., Liam and Sofia)
  grades: Grade[];
  fees: FeeInvoice[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  messages: DirectMessage[];
  onOpenPaymentModal: (invoice: FeeInvoice) => void;
  onSendMessage: (msg: DirectMessage) => void;
  logs?: SystemActivityLog[];
  teachers?: Teacher[];
  currentUser?: UserCredential | null;
  documents?: DocumentMaterial[];
  qna?: QnaItem[];
  virtualClasses?: VirtualClass[];
  schedules?: SchedulePeriod[];
  onUpdateSchedule?: (updated: SchedulePeriod[]) => void;
  onUpdateUser?: (updatedUser: UserCredential) => void;
}

export default function ParentDashboard({
  students,
  grades,
  fees,
  announcements,
  attendance,
  messages,
  onOpenPaymentModal,
  onSendMessage,
  logs = [],
  teachers = [],
  currentUser = null,
  documents = [],
  qna = [],
  virtualClasses = [],
  schedules = [],
  onUpdateSchedule,
  onUpdateUser
}: ParentDashboardProps) {
  // Current child selection state based on login matching
  const parentChildren = React.useMemo(() => {
    if (!currentUser) {
      return students.filter((s) => s.parentEmail?.toLowerCase() === 'aymanaarka2020@gmail.com');
    }

    // Attempt to match students dynamically
    const matched = students.filter((s) => {
      // 1. Match by login user email
      if (currentUser.email && s.parentEmail) {
        if (s.parentEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) {
          return true;
        }
      }

      // 2. Match by login user username
      if (currentUser.username && s.parentEmail) {
        const uLower = currentUser.username.trim().toLowerCase();
        const pEmailLower = s.parentEmail.trim().toLowerCase();
        if (pEmailLower === uLower) return true;
        if (pEmailLower === `${uLower}@gmail.com`) return true;
      }

      // 3. Match by name
      if (currentUser.name && s.parentName) {
        const uName = currentUser.name.trim().toLowerCase();
        const pName = s.parentName.trim().toLowerCase();
        if (pName === uName) return true;
      }

      return false;
    });

    if (matched.length > 0) {
      return matched;
    }

    // Only fallback to pre-seeded children for demo testing ('parent' account or 'aymanaarka2020@gmail.com')
    if (!currentUser || currentUser.username === 'parent' || currentUser.email?.toLowerCase() === 'aymanaarka2020@gmail.com') {
      return students.filter((s) => s.parentEmail?.toLowerCase() === 'aymanaarka2020@gmail.com');
    }

    // Otherwise strictly segment families
    return [];
  }, [students, currentUser]);

  const [selectedChildId, setSelectedChildId] = useState(parentChildren[0]?.id || '');
  const [showProfile, setShowProfile] = useState(false);

  // App style mobile navigation tabs: default is 'academics'
  const [activeTab, setActiveTab ] = useState<'academics' | 'attendance' | 'messages' | 'fees' | 'subjects' | 'docs' | 'schedules' | 'calendar'>('calendar');

  // Active chat state
  const [typedMessage, setTypedMessage] = useState('');

  // Selected child object
  const activeChild = students.find((s) => s.id === selectedChildId) || parentChildren[0];

  // States for schedules (moved to top level to comply with React's Rules of Hooks)
  const [selectedScheduleYear, setSelectedScheduleYear] = useState('2026-2027');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [localSchedules, setLocalSchedules] = useState<SchedulePeriod[]>([]);
  const [newYearInput, setNewYearInput] = useState('');
  const [showNewYearForm, setShowNewYearForm] = useState(false);

  // Sync schedules local view with global state (moved to top level to comply with React's Rules of Hooks)
  React.useEffect(() => {
    if (!activeChild) return;
    const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
    const PERIOD_RANGE = [1, 2, 3, 4, 5, 6, 7];
    const childClassKey = `${activeChild.grade} - ${activeChild.section}`;
    const currentClassSchedules = (schedules || []).filter(
      s => s.grade === childClassKey && s.academicYear === selectedScheduleYear
    );
    const temp: SchedulePeriod[] = [];
    DAYS.forEach(day => {
      PERIOD_RANGE.forEach(period => {
        const match = currentClassSchedules.find(s => s.day === day && s.periodIndex === period);
        temp.push({
          id: match?.id || `SCH-${activeChild.id}-${day}-${period}-${Date.now()}`,
          grade: childClassKey,
          academicYear: selectedScheduleYear,
          day,
          periodIndex: period,
          subject: match?.subject || '',
          teacherName: match?.teacherName || ''
        });
      });
    });
    setLocalSchedules(temp);
  }, [activeChild, selectedScheduleYear, schedules]);

  React.useEffect(() => {
    if (parentChildren.length > 0) {
      const match = parentChildren.some(c => c.id === selectedChildId);
      if (!match) {
        setSelectedChildId(parentChildren[0].id);
      }
    }
  }, [parentChildren, selectedChildId]);

  if (!activeChild) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white border border-slate-150 rounded-2xl shadow-sm space-y-4 my-12 select-none">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
          <AlertCircle className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Ma jiro wax arday ah oo lagugu xiriiriyay (No Connected Students)</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto font-medium">
            Ku soo dhowow Portalka Waalidiinta ee **Ibnu Khuzeyma Academy**. Wali ma jiro wax arday ah oo lagu xiriiriyay nidaamka xisaabtaada.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-md mx-auto">
          <p className="text-xs text-slate-550 leading-normal font-semibold text-left">
            💡 <span className="text-indigo-900 font-extrabold">Tallaabada xigta:</span> Fadlan la xiriir maamulka dugsiga si ay kuugu xiraan ardaygaaga adoo siiya e-mailka saxda ah ee xisaabtaada: <span className="font-mono text-indigo-600 font-black">{currentUser?.email || currentUser?.username}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Filter child-specific items
  const childGrades = grades.filter((g) => g.studentId === activeChild.id);
  const childFees = fees.filter((f) => f.studentId === activeChild.id);
  const childAttendance = attendance.filter((a) => a.studentId === activeChild.id);
  const childMessages = messages.filter((m) => m.studentId === activeChild.id);

  // Computed financial stats
  const outstandingCost = childFees
    .filter((f) => f.status !== 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: DirectMessage = {
      id: `MSG${Math.floor(Math.random() * 900000 + 100000)}`,
      studentId: activeChild.id,
      sender: 'Parent',
      text: typedMessage,
      timestamp: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    onSendMessage(newMsg);
    setTypedMessage('');
  };

  return (
    <div className="space-y-6" id="parent-portal">
      {currentUser && onUpdateUser && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between shadow-sm select-none">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
            <div className="text-left">
              <span className="block text-[8px] text-indigo-650 font-extrabold uppercase leading-none">Macluumaadka Waalidka (Account Profile)</span>
              <span className="block text-xs font-black text-slate-800">{currentUser.name || currentUser.username} ({currentUser.email || 'No email'})</span>
            </div>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-sm border-0"
          >
            ⚙️ Wax ka beddel Profile-ka
          </button>
        </div>
      )}

      {showProfile && currentUser && onUpdateUser && (
        <ProfileSettings
          currentUser={currentUser}
          onUpdate={onUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Ward Status Overview Cover Banner (Now positioned at the very top for better visual hierarchy) */}
      <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl select-none">
        <div className="flex items-center gap-5 relative z-10 text-center md:text-left flex-col md:flex-row">
          <img
            alt={activeChild.name}
            src={activeChild.avatar || 'https://via.placeholder.com/150'}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md"
          />
          <div className="space-y-1">
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
              Arday firfircoon • barashada: {activeChild.grade}
            </span>
            <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight">{activeChild.name}</h2>
            <p className="text-xs text-slate-400">
              Iskuulka: <span className="font-bold text-slate-100">IBNU KHUZEYMA ACADEMY</span> • Fasalka: Section {activeChild.section}
            </p>
          </div>
        </div>

        {/* Rapid stats details & Print action button */}
        <div className="flex flex-col md:flex-row items-center gap-4 relative z-10 self-stretch md:self-auto justify-center">
          <div className="flex gap-4">
            <div className="p-3 px-4 bg-slate-800 rounded-xl text-center min-w-[120px] border border-slate-700/40">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Garab-xaadiris (Presence)</p>
              <span className="text-xs font-bold font-mono text-emerald-400">{activeChild.attendanceRate}% Logged</span>
            </div>
            <div className="p-3 px-4 bg-slate-800 rounded-xl text-center min-w-[120px] border border-slate-700/40">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">GPA Darajooyinka</p>
              <span className="text-xs font-bold font-mono text-indigo-400">{activeChild.gpa} Average</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full md:w-auto p-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 border-0"
            title="Download / Print student report card"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>Daabaco Warbixinta (Print Report Card)</span>
          </button>
        </div>

        {/* Decorative math/science circle outline background */}
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-10 opacity-5 pointer-events-none">
          <svg className="w-96 h-96" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Dynamic multiple children selector tab (Moved below the profile banner card) */}
      {parentChildren.length > 1 && (
        <div className="space-y-2 select-none bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DOORO ILMAHAAD RADOO (SELECT CHILD ACCOUNT)</span>
          <div className="flex flex-wrap gap-2">
            {parentChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                }}
                className={`flex items-center gap-3 p-2.5 px-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedChildId === child.id
                    ? 'bg-indigo-900 border-indigo-950 text-white shadow-md shadow-indigo-900/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <img
                  alt={child.name}
                  src={child.avatar || 'https://via.placeholder.com/150'}
                  className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                />
                <div>
                  <h4 className="font-extrabold text-xs">{child.name}</h4>
                  <p className={`text-[9px] uppercase font-bold ${selectedChildId === child.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {child.grade} • Sec {child.section}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
               {/* --- MOBILE APP DASHBOARD STYLE GRID TABS (Aad u Habaysan) --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 select-none" id="parent-portal-mobile-tiles">
        
        {/* Tab 1: Grades & Academics */}
        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'academics'
              ? 'bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-indigo-850 shadow-md shadow-indigo-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'academics' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Darajooyinka</h3>
          <p className={`text-[10px] ${activeTab === 'academics' ? 'text-indigo-200' : 'text-slate-400'} font-medium`}>Academic Report Cards</p>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Tab 2: Attendance Index */}
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'attendance'
              ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-emerald-850 shadow-md shadow-emerald-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'attendance' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Xaadirista</h3>
          <p className={`text-[10px] ${activeTab === 'attendance' ? 'text-emerald-200' : 'text-slate-400'} font-medium`}>Presence Tracking</p>
        </button>

        {/* Tab 3: Encrypted Messenger Chat */}
        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'messages'
              ? 'bg-gradient-to-br from-amber-900 to-amber-955 text-white border-amber-850 shadow-md shadow-amber-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'messages' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'
          }`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Xiriirka</h3>
          <p className={`text-[10px] ${activeTab === 'messages' ? 'text-amber-200' : 'text-slate-400'} font-medium`}>Teacher Direct Chat</p>
        </button>

        {/* Tab 4: Tuition Invoice Payments */}
        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'fees'
              ? 'bg-gradient-to-br from-rose-900 to-rose-950 text-white border-rose-850 shadow-md shadow-rose-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'fees' ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-650 text-rose-600'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Lacagaha</h3>
          <p className={`text-[10px] ${activeTab === 'fees' ? 'text-rose-200' : 'text-slate-400'} font-medium`}>Tuition & Expenses</p>
          {outstandingCost > 0 && (
            <span className="absolute top-2 right-2 bg-rose-600 text-[8px] text-white font-extrabold rounded-full px-2 py-0.5 animate-pulse uppercase">
              Haran
            </span>
          )}
        </button>

        {/* Tab 5: Subject Live Meetings */}
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-br from-teal-900 to-teal-950 text-white border-teal-850 shadow-md shadow-teal-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'subjects' ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-600'
          }`}>
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Fasalada</h3>
          <p className={`text-[10px] ${activeTab === 'subjects' ? 'text-teal-200' : 'text-slate-400'} font-medium`}>Virtual Live Meets</p>
        </button>

        {/* Tab 6: PDF Curriculum Library */}
        <button
          type="button"
          onClick={() => setActiveTab('docs')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'docs'
              ? 'bg-gradient-to-br from-cyan-900 to-cyan-950 text-white border-cyan-850 shadow-md shadow-cyan-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'docs' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Maktabada</h3>
          <p className={`text-[10px] ${activeTab === 'docs' ? 'text-cyan-200' : 'text-slate-400'} font-medium`}>Digital Library PDFs</p>
        </button>

        {/* Tab 7: Class Timetable Schedule */}
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'schedules'
              ? 'bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-indigo-850 shadow-md shadow-indigo-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'schedules' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-650'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Jadwalka</h3>
          <p className={`text-[10px] ${activeTab === 'schedules' ? 'text-indigo-205' : 'text-slate-400'} font-medium`}>Class Timetable</p>
        </button>

        {/* Tab 8: Calendar */}
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'calendar'
              ? 'bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-indigo-850 shadow-md shadow-indigo-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'calendar' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-650'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block text-slate-800 group-hover:text-black">Kalandarka</h3>
          <p className={`text-[10px] ${activeTab === 'calendar' ? 'text-indigo-205' : 'text-slate-400'} font-medium`}>School Calendar</p>
        </button>

      </div>

      {/* --- CONTENT AREA TRANSITIONS --- */}

      {/* 0. CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in" id="parent-calendar-view">
          <SchoolCalendar
            virtualClasses={[]}
            announcements={announcements}
            fees={fees.filter(f => f.studentId === activeChild.id)}
            role="Parent"
          />
        </div>
      )}

      {/* 1. ACADEMICS REPORT CARD VIEW */}
      {activeTab === 'academics' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Warbixinta Natiijooyinka (Academic Report Card)</h3>
              <p className="text-xs text-slate-400 leading-normal">Kala soco buundooyinka rasmiga ah oo uu ardaygu ka helay imtixaanadii nidaamiga ahaa.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Daabac (Print)
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Casharka/Imtixaanka (Evaluation Type)</th>
                  <th className="p-4">Maddada (Subject Course)</th>
                  <th className="p-4 text-center">Score %</th>
                  <th className="p-4 text-center">Darajada</th>
                  <th className="p-4 text-right">Taariikhda la daabacay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {childGrades.length > 0 ? (
                  childGrades.map((grd) => (
                    <tr key={grd.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 font-bold text-slate-800">
                        Imtixaanka: {grd.examType}
                      </td>
                      <td className="p-4 font-bold text-indigo-900 text-[13px]">{grd.subject}</td>
                      <td className="p-4 text-center font-mono font-bold text-slate-800 text-xs">
                        {grd.score}%
                      </td>
                      <td className="p-4 text-center">
                        <span className={`p-1 px-3.5 rounded-lg font-mono font-bold text-xs ${
                          grd.gradeLetter === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {grd.gradeLetter}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400 font-mono text-xs">{grd.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-semibold">
                      Ma jiraan wax natiijooyin ah oo hadda loo daabacay ardayga {activeChild.name}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* GPA Guidance note */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 text-xs text-indigo-800">
            <TrendingUp className="w-5 h-5 text-indigo-600 shrink-0 self-start" />
            <div className="space-y-1">
              <span className="font-extrabold uppercase tracking-wide">FIIRO GAAR AH • CULAYS-DARAJOOYINKA (GPA STANDARD)</span>
              <p className="leading-relaxed font-medium">
                Celceliska natiijooyinka imtixaanadu waxay si toos ah u xisaabiyaan GPA-ga ardayga. Marka ay macallimiintu galiyaan imtixaan kasta (Midterm / Final), xoguhu way isbeddelayaan si rasmiga ah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE STREAM */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">XAADIRISTA ISKUULKA (School Class Attendance)</h3>
            <p className="text-xs text-slate-400">Kala soco joogitaanka iyo dib-u-dhaca uu ardaygu sameeyo fasalka maalin kasta rasmiga ah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/30 flex flex-col justify-between text-center space-y-4">
              <span className="text-[10px] text-emerald-800 font-black uppercase tracking-widest block font-sans">CELCELISKA JOOGITAANKA</span>
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-white flex items-center justify-center mx-auto shadow-sm">
                <span className="font-mono text-xl font-black text-slate-800">{activeChild.attendanceRate}%</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Ardaygu wuxuu ku jiraa xaalad wanaagsan oo xagga xaadiritaanka rasmiga ah.</p>
            </div>

            <div className="md:col-span-8 overflow-hidden rounded-xl border border-slate-150/65">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Taariikhda (Date)</th>
                    <th className="p-3 text-center">Heerka Xaadirida (Status)</th>
                    <th className="p-3">Macluumaad / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {childAttendance.length > 0 ? (
                    childAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-600 text-xs">{rec.date}</td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-150'
                              : rec.status === 'Late'
                              ? 'bg-amber-50 text-amber-800 border border-amber-150'
                              : 'bg-rose-50 text-rose-800 border border-rose-150'
                          }`}>
                            {rec.status === 'Present' ? 'JOOGA' : rec.status === 'Late' ? 'DAAHAY' : 'MA JOOGO'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-medium italic max-w-xs truncate">{rec.remarks || 'Casharka si caadi ah ayuu u qaatay'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 text-xs font-semibold">
                        Ma jiro wax maalin ah oo loo galiyey xaadiris ardayga fasalkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. INSTRUCTOR DIRECT MESSENGER CHAT */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">LA-XIRIIRKA MACALINKA (Encrypted Faculty Chat)</h3>
            <p className="text-xs text-slate-400">Si toos ah ula xiriir macallinka mas'uulka ka ah ilmahaaga si aad u weydiso waxbarashada.</p>
          </div>

          <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex flex-col justify-between h-[380px]">
            {/* Thread timeline */}
            <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin flex-1 py-2">
              {childMessages.length === 0 ? (
                <div className="text-center p-12 text-slate-400 space-y-2">
                  <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold">Wali ma jiraan wax fariimo ah.</p>
                  <p className="text-[10px]">U qor fariinta hoose si aad ula sheekaysato macallimka.</p>
                </div>
              ) : (
                childMessages.map((msg) => {
                  const isParent = msg.sender === 'Parent';
                  return (
                    <div key={msg.id} className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 max-w-[80%] rounded-2xl shadow-sm space-y-1 block ${
                        isParent ? 'bg-indigo-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                      }`}>
                        <p className="text-xs font-medium leading-relaxed font-sans">{msg.text}</p>
                        <span className={`text-[9px] block text-right font-medium ${isParent ? 'text-indigo-300' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Writing box form */}
            <form onSubmit={handleMessageSubmit} className="flex gap-2 pt-3 border-t border-slate-200/50 mt-3 bg-white p-2 rounded-xl border border-slate-100 shadow-inner">
              <input
                type="text"
                placeholder="Fariin gaaban u dir macallinka dhowaan fasalka..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-xs px-3.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-900 hover:bg-slate-900 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL FEES PORTAL */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">KHIDMADAHA & LACAGAHA ILMAHA (Fee Ledger Dashboard)</h3>
            <p className="text-xs text-slate-400">Arag qaansheegyada ama lacagaha waajibka ah ee laga rabo ardayga si toos ah oo aamin ah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 p-5 rounded-2xl bg-rose-50/50 border border-rose-100/30 text-center space-y-4">
              <span className="text-[10px] text-rose-800 font-extrabold uppercase tracking-widest block">HAREEDA KHIDMADAHA (DUE AMOUNT)</span>
              <span className="font-mono text-3xl font-black text-slate-800 block">${outstandingCost || '0.00'}</span>
              <span className="text-xs bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] inline-block">
                {outstandingCost > 0 ? 'Weli waa lagugu leeyahay' : 'Waa la bixiyay dhamaan'}
              </span>
            </div>

            <div className="md:col-span-8 overflow-hidden rounded-xl border border-slate-150/65">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Invoice Desc</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Ddue Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Tallaabo (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {childFees.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-800 block text-xs">{invoice.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Invoice Ref: {invoice.id}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-705 font-mono text-xs">${invoice.amount}</td>
                      <td className="p-3 text-slate-400 font-mono text-xs">{invoice.dueDate}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          invoice.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-150'
                            : 'bg-rose-50 text-rose-800 border border-rose-150 animate-pulse'
                        }`}>
                          {invoice.status === 'Paid' ? 'Lagu Guuleystay' : 'Waa Baaqi'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {invoice.status !== 'Paid' ? (
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(invoice)}
                            className="bg-indigo-900 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-slate-900 transition flex items-center gap-1 cursor-pointer shadow-sm float-right"
                          >
                            <CreditCard className="w-3 h-3" /> Bixi Hada
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold">Lagu guuleystay</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBJECTS SYLLABUS, MATERIALS, MEETINGS & Q&A FORUM */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Virtual Class list */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider text-slate-500">📹 CASHARADA TOOSKA AH (Virtual Class Stream)</h3>
                <p className="text-xs text-slate-400 leading-normal">Casharada maqal-iyo-muuqaalka ah ee tooska ah oo uu ardaygu gurigiisa kaga biirayo.</p>
              </div>

              <div className="space-y-3">
                {virtualClasses.filter(v => v.grade.toLowerCase() === activeChild.grade.toLowerCase() || v.grade === 'Grade 10').length === 0 ? (
                  <div className="p-10 bg-slate-50 rounded-xl text-center border border-slate-100 text-slate-400 font-medium text-xs">
                    Ma jiraan wax casharro toos ah oo la qorsheeyey fasalka {activeChild.grade} xilligan.
                  </div>
                ) : (
                  virtualClasses.filter(v => v.grade.toLowerCase() === activeChild.grade.toLowerCase() || v.grade === 'Grade 10').map((meet) => (
                    <div key={meet.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 hover:shadow-sm transition-all">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase inline-block animate-pulse">
                          {meet.isLive ? '🔴 CASHAR TOOS AH' : '📅 LA JADWALEEYEY'}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs">{meet.topic}</h4>
                        <p className="text-[10px] text-slate-500 font-medium font-sans">Maaddada: {meet.subject} • Macallin: {meet.teacherName}</p>
                        <p className="text-[9.5px] text-indigo-900 font-bold font-mono">{meet.dateTime}</p>
                      </div>
                      <a
                        href={meet.meetUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="p-2 px-3.5 bg-indigo-900 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" /> Ku Biir
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: PDF Curriculum documents */}
            <div className="lg:col-span-6 space-y-4 lg:border-l lg:border-slate-100 lg:pl-6">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider text-slate-500">📚 MAKTABADA BUUGTA (Syllabus PDF Materials)</h3>
                <p className="text-xs text-slate-400 leading-normal">Ogoow buugaagta rasmiga ah oo uu akhrisanayo ilmahaagu guriga dhexdiisa si toos ah.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {documents.filter(d => d.grade.toLowerCase() === activeChild.grade.toLowerCase() || d.grade === 'Grade 10').length === 0 ? (
                  <div className="p-10 bg-slate-50 rounded-xl text-center border border-slate-105 text-slate-400 font-medium text-xs">
                    Ma jiraan wax buugaag PDF ah oo loo geliyey fasalka {activeChild.grade} wali.
                  </div>
                ) : (
                  documents.filter(d => d.grade.toLowerCase() === activeChild.grade.toLowerCase() || d.grade === 'Grade 10').map((doc) => (
                    <div key={doc.id} className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs hover:shadow-sm transition-all shadow-inner">
                      <div className="truncate">
                        <span className="font-bold text-slate-800 truncate block">📂 {doc.title}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Maaddada: {doc.subject} • Tariikhda: {doc.date}</span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="shrink-0 text-[10px] bg-slate-100 hover:bg-emerald-900 hover:text-white border border-slate-200 font-bold px-2.5 py-1.5 rounded-lg transition"
                      >
                        Ka Daalaco
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="mt-4" id="parent-curriculum-documents">
          <CurriculumDocumentsHub
            documents={documents}
            role="Parent"
            authorName={currentUser?.username || "Ku-Gedisan"}
          />
        </div>
      )}

      {activeTab === 'schedules' && (() => {
        const childClassKey = `${activeChild.grade} - ${activeChild.section}`;
        
        const uniqueYears = Array.from(new Set([
          '2026-2027',
          '2027-2028',
          ...schedules.map(s => s.academicYear)
        ]));

        const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
        const PERIOD_RANGE = [1, 2, 3, 4, 5, 6, 7];

        const currentClassSchedules = schedules.filter(
          s => s.grade === childClassKey && s.academicYear === selectedScheduleYear
        );

        return (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 animate-fade-in shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Jadwalka Xiisadaha (Class Timetable)</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Halkan waxaad ka arki kartaa jadwalka xiisadaha ubadkaaga ee sanad dugsiyeed kasta.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-500">Sanadka:</span>
                  <select
                    value={selectedScheduleYear}
                    onChange={(e) => setSelectedScheduleYear(e.target.value)}
                    className="p-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {uniqueYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full border-collapse text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-3.5 font-bold uppercase text-slate-400 text-[10px] border-r border-slate-100 w-24">Xiisadaha</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-3.5 font-black text-indigo-900 text-center uppercase tracking-wide border-r border-slate-100">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERIOD_RANGE.map(period => (
                    <tr key={period} className="hover:bg-slate-50/40 transition-all">
                      <td className="p-3.5 font-extrabold text-slate-800 bg-slate-50 border-r border-slate-100 text-center">
                        <span className="block text-[11px]">Xiisada {period}</span>
                        <span className="block text-[9px] text-slate-400 font-mono text-[9px]">Period {period}</span>
                      </td>
                      {DAYS.map(day => {
                        const cell = currentClassSchedules.find(s => s.day === day && s.periodIndex === period);

                        return (
                          <td key={day} className="p-3 border-r border-slate-150 align-top min-w-[140px] text-center">
                            <div className="py-1">
                              {cell?.subject ? (
                                <>
                                  <span className="block font-black text-slate-800 text-xs tracking-tight">{cell.subject}</span>
                                  <span className="block text-[10px] text-slate-500 font-medium truncate mt-0.5">{cell.teacherName || 'Macallin la’aan'}</span>
                                </>
                              ) : (
                                <span className="text-slate-300 font-bold block py-2">---</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
