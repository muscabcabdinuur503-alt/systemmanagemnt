/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  BookOpen,
  Mail,
  UserPlus,
  Megaphone,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Trash2,
  Calendar,
  Edit,
  Lock,
  Printer,
  LayoutDashboard,
  Heart,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
  Menu,
  Layers,
  Copy,
  MessageSquare
} from 'lucide-react';
import { Student, Teacher, Announcement, FeeInvoice, Grade, UserCredential, AttendanceRecord, SystemActivityLog, DocumentMaterial, SchedulePeriod, VirtualClass } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import CurriculumDocumentsHub from './CurriculumDocumentsHub';
import SchoolCalendar from './SchoolCalendar';
import { ChatComponent } from './ChatComponent';
import { ProfileSettings } from './ProfileSettings';

interface AdminDashboardProps {
  currentUser: UserCredential;
  students: Student[];
  teachers: Teacher[];
  fees: FeeInvoice[];
  announcements: Announcement[];
  grades: Grade[];
  users: UserCredential[];
  attendance: AttendanceRecord[];
  logs?: SystemActivityLog[];
  documents?: DocumentMaterial[];
  schedules?: SchedulePeriod[];
  onUpdateSchedule?: (updated: SchedulePeriod[]) => void;
  onSubmitAttendanceBatch?: (batch: AttendanceRecord[]) => void;
  onAddStudent: (stu: Student) => void;
  onAddTeacher: (tch: Teacher) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteTeacher: (id: string) => void;
  onPostAnnouncement: (ann: Announcement) => void;
  onPayInvoice: (invoiceId: string, paymentMethod: string) => void;
  onUpdateStudent: (stu: Student) => void;
  onUpdateTeacher: (tch: Teacher) => void;
  onUpdateFee: (fee: FeeInvoice) => void;
  onUpdateGrade: (grade: Grade) => void;
  onUpdateUser: (user: UserCredential) => void;
  onAddUser: (user: UserCredential) => void;
  onDeleteUser?: (id: string) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onDeleteGrade?: (id: string) => void;
  onDeleteFee?: (id: string) => void;
  onDeleteLog?: (id: string) => void;
  onAddInvoices: (newInvoices: FeeInvoice[]) => void;
  onAddLog?: (log: SystemActivityLog) => void;
  onAddDocument?: (doc: DocumentMaterial) => void;
  onDeleteDocument?: (id: string) => void;
  virtualClasses?: VirtualClass[];
  onAddVirtualClass?: (vc: VirtualClass) => void;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const convertToMonthInput = (readable: string): string => {
  const parts = readable.split(' ');
  if (parts.length !== 2) return '';
  const monthIdx = monthNames.indexOf(parts[0]);
  if (monthIdx === -1) return '';
  const monthStr = String(monthIdx + 1).padStart(2, '0');
  return `${parts[1]}-${monthStr}`;
};

const convertToReadableMonth = (input: string): string => {
  const parts = input.split('-');
  if (parts.length !== 2) return input;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${monthNames[monthIdx]} ${year}`;
  }
  return input;
};

export default function AdminDashboard({
  currentUser,
  students,
  teachers,
  fees,
  announcements,
  grades,
  users,
  attendance,
  logs = [],
  documents = [],
  schedules = [],
  onUpdateSchedule,
  onSubmitAttendanceBatch,
  onAddStudent,
  onAddTeacher,
  onDeleteStudent,
  onDeleteTeacher,
  onDeleteAnnouncement,
  onDeleteGrade,
  onDeleteFee,
  onDeleteLog,
  onPostAnnouncement,
  onPayInvoice,
  onUpdateStudent,
  onUpdateTeacher,
  onUpdateFee,
  onUpdateGrade,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onAddInvoices,
  onAddLog,
  onAddDocument,
  onDeleteDocument,
  virtualClasses = [],
  onAddVirtualClass
}: AdminDashboardProps) {
  const [activeTab, setActiveTab ] = useState<'overview' | 'students' | 'teachers' | 'parents' | 'payments' | 'announcements' | 'grades' | 'users' | 'logs' | 'schedules' | 'calendar' | 'chat'>('overview');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>('warbixinta-maalintii');
  const [selectedChatReceiverName, setSelectedChatReceiverName] = useState<string | null>('Warbixinta Maalintii');
  const [showProfile, setShowProfile] = useState(false);

  // Custom premium iframe-proof confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    user: UserCredential;
    newPass: string;
  } | null>(null);

  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  // Custom states for Class-based payments and Monthly cycle management
  const [selectedPaymentClass, setSelectedPaymentClass] = useState<string>('Grade 7 - A');
  const [selectedBillingMonth, setSelectedBillingMonth] = useState<string>('June 2026');
  const [billingAmountInput, setBillingAmountInput] = useState<number>(150);

  // States for schedules (moved to top level to comply with React's Rules of Hooks)
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedClass, setSelectedClass] = useState('Grade 7 - A');
  const [localSchedules, setLocalSchedules] = useState<SchedulePeriod[]>([]);
  const [newYearInput, setNewYearInput] = useState('');
  const [showNewYearForm, setShowNewYearForm] = useState(false);
  const [copyTargetClass, setCopyTargetClass] = useState('');
  const [addedClasses, setAddedClasses] = useState<string[]>(() => {
    const defaultClasses = [
      'Grade 7 - A', 'Grade 7 - B',
      'Grade 8 - A', 'Grade 8 - B',
      'Grade 9 - A', 'Grade 9 - B',
      'Grade 10 - A', 'Grade 10 - B',
      'Grade 11 - A', 'Grade 11 - B',
      'Grade 12 - A', 'Grade 12 - B'
    ];
    const studentClasses = (students || []).map(s => `${s.grade} - ${s.section}`);
    const scheduleClasses = (schedules || []).map(s => s.grade);
    const vClasses = (virtualClasses || []).map(v => `${v.grade} - ${v.subject}`);
    let localSaved: string[] = [];
    try {
      const saved = localStorage.getItem('school_system_added_classes');
      if (saved) localSaved = JSON.parse(saved);
    } catch (e) {}
    return Array.from(new Set([...defaultClasses, ...studentClasses, ...scheduleClasses, ...vClasses, ...localSaved]));
  });

  // Save addedClasses to localStorage whenever it updates
  React.useEffect(() => {
    try {
      localStorage.setItem('school_system_added_classes', JSON.stringify(addedClasses));
    } catch (e) {}
  }, [addedClasses]);

  // Synchronize addedClasses when database schedules or students load
  React.useEffect(() => {
    const studentClasses = (students || []).map(s => `${s.grade} - ${s.section}`);
    const scheduleClasses = (schedules || []).map(s => s.grade);
    const vClasses = (virtualClasses || []).map(v => `${v.grade} - ${v.subject}`);
    
    setAddedClasses(prev => {
      const merged = Array.from(new Set([...prev, ...studentClasses, ...scheduleClasses, ...vClasses]));
      if (merged.length !== prev.length) {
        return merged;
      }
      return prev;
    });
  }, [students, schedules, virtualClasses]);
  const [newClassInput, setNewClassInput] = useState('');

  // Sync schedules local view with global state (moved to top level to comply with React's Rules of Hooks)
  React.useEffect(() => {
    const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
    const PERIOD_RANGE = [1, 2, 3, 4, 5, 6, 7];
    const currentClassSchedules = (schedules || []).filter(
      s => s.grade === selectedClass && s.academicYear === selectedYear
    );
    const temp: SchedulePeriod[] = [];
    DAYS.forEach(day => {
      PERIOD_RANGE.forEach(period => {
        const match = currentClassSchedules.find(s => s.day === day && s.periodIndex === period);
        temp.push({
          id: match?.id || `SCH-${selectedClass}-${day}-${period}-${Date.now()}`,
          grade: selectedClass,
          academicYear: selectedYear,
          day,
          periodIndex: period,
          subject: match?.subject || '',
          teacherName: match?.teacherName || ''
        });
      });
    });
    setLocalSchedules(temp);
  }, [selectedClass, selectedYear, schedules]);

  // Custom states for tracking attendance in Overview
  const [activeAttendanceClass, setActiveAttendanceClass] = useState<string>('Grade 7 - A');
  const [activeAttendanceDate, setActiveAttendanceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeAttendanceMonth, setActiveAttendanceMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [activeAttendanceRange, setActiveAttendanceRange] = useState<'today' | 'yesterday' | 'month'>('today');

  // Print preview states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState<'attendance' | 'payments'>('attendance');
  const [printClass, setPrintClass] = useState<string>('Grade 7 - A');
  const [printMonth, setPrintMonth] = useState<string>('June 2026');

  const handleDirectPrint = () => {
    const printContent = document.getElementById('print-modal-container');
    if (!printContent) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'height=750,width=1000,resizable=yes,scrollbars=yes');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${printType === 'attendance' ? 'WARBIXINTA_XADIRINTA_' + printClass : 'WARBIXINTA_LACAGAHA_' + printClass}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  margin: 40px;
                  color: #0f172a;
                  background-color: #ffffff;
                }
                .text-center { text-align: center; }
                .pb-6 { padding-bottom: 24px; }
                .border-b-4 { border-bottom-width: 4px; }
                .border-double { border-style: double; }
                .border-slate-350 { border-color: #cbd5e1; }
                .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 8px; }
                .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 24px; }
                .font-sans { font-family: sans-serif; }
                .font-extrabold { font-weight: 800; }
                .font-bold { font-weight: 700; }
                .font-semibold { font-weight: 600; }
                .text-2xl { font-size: 24px; }
                .text-indigo-900 { color: #1e1b4b; }
                .text-[10px] { font-size: 10px; }
                .text-xs { font-size: 12px; }
                .text-sm { font-size: 14px; }
                .text-base { font-size: 16px; }
                .text-slate-500 { color: #64748b; }
                .text-slate-600 { color: #475569; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-650 { color: #334155; }
                .text-[9px] { font-size: 9px; }
                .text-indigo-700 { color: #4338ca; }
                .text-emerald-700 { color: #047857; }
                .text-emerald-800 { color: #065f46; }
                .text-rose-700 { color: #be123c; }
                .tracking-wide { letter-spacing: 0.025em; }
                .tracking-wider { letter-spacing: 0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .uppercase { text-transform: uppercase; }
                .pt-2 { padding-top: 8px; }
                .pt-16 { padding-top: 64px; }
                .px-4 { padding-left: 16px; padding-right: 16px; }
                .py-1.5 { padding-top: 6px; padding-bottom: 6px; }
                .bg-slate-100 { background-color: #f1f5f9; }
                .bg-slate-50 { background-color: #f8fafc; }
                .rounded-full { border-radius: 9999px; }
                .rounded-xl { border-radius: 12px; }
                .border { border: 1px solid #e2e8f0; }
                .border-t { border-top: 1px solid #cbd5e1; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .gap-4 { gap: 16px; }
                .p-4 { padding: 16px; }
                .p-5 { padding: 20px; }
                .p-3 { padding: 12px; }
                .overflow-x-auto { overflow-x: auto; }
                table {
                  width: 100%;
                  font-size: 12px;
                  border: 1px solid #cbd5e1;
                  border-collapse: collapse;
                  margin-top: 16px;
                }
                th, td {
                  border: 1px solid #cbd5e1;
                  padding: 10px;
                  text-align: left;
                }
                th {
                  background-color: #f8fafc;
                  font-weight: bold;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-mono { font-family: monospace; }
                .gap-12 { gap: 48px; }
                .w-2\/3 { width: 66.666667%; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .inline-block { display: inline-block; }
                .mt-0.5 { margin-top: 2px; }
                .bg-emerald-50 { background-color: #ecfdf5; }
                .border-emerald-100 { border-color: #d1fae5; }
                .bg-rose-50 { background-color: #fff1f2; }
                .border-rose-250 { border-color: #fecdd3; }
                .bg-indigo-50 { background-color: #e0e7ff; }
                .border-indigo-100 { border-color: #c7d2fe; }
                .no-print { display: none !important; }
                
                @media print {
                  body { margin: 20px; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  th, td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <div id="print-modal-container">
                ${printContent.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  window.focus();
                  setTimeout(function() {
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  const handleDirectPrintGrades = () => {
    const printContent = document.getElementById('print-grades-container');
    if (!printContent) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'height=750,width=1100,resizable=yes,scrollbars=yes');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>XAL_NATIIJO_FASALKA_${printableClass || 'Report'}</title>
              <style>
                @page {
                  size: landscape;
                  margin: 20mm;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  margin: 30px;
                  color: #0f172a;
                  background-color: #ffffff;
                }
                .text-center { text-align: center; }
                .pb-6 { padding-bottom: 24px; }
                .border-b-2 { border-bottom-width: 2px; }
                .border-slate-900 { border-color: #0f172a; }
                .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 4px; }
                .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 16px; }
                .font-sans { font-family: sans-serif; }
                .font-extrabold { font-weight: 800; }
                .font-black { font-weight: 900; }
                .font-bold { font-weight: 700; }
                .font-semibold { font-weight: 600; }
                .text-xl { font-size: 20px; }
                .text-xs { font-size: 11px; }
                .text-sm { font-size: 13px; }
                .text-[10px] { font-size: 10px; }
                .text-[9px] { font-size: 9px; }
                .text-indigo-800 { color: #3730a3; }
                .text-indigo-950 { color: #1e1b4b; }
                .text-slate-500 { color: #64748b; }
                .text-slate-650 { color: #334155; }
                .text-slate-700 { color: #334155; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-900 { color: #0f172a; }
                .uppercase { text-transform: uppercase; }
                .tracking-tight { letter-spacing: -0.025em; }
                .tracking-wider { letter-spacing: 0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .mt-2 { margin-top: 8px; }
                .mt-6 { margin-top: 24px; }
                .mt-12 { margin-top: 48px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-6 { margin-bottom: 24px; }
                .pt-8 { padding-top: 32px; }
                .px-2.5 { padding-left: 10px; padding-right: 10px; }
                .py-1 { padding-top: 4px; padding-bottom: 4px; }
                .px-4 { padding-left: 16px; padding-right: 16px; }
                .bg-indigo-50 { background-color: #e0e7ff; }
                .border-indigo-100 { border-color: #c7d2fe; }
                .bg-slate-50 { background-color: #f8fafc; }
                .bg-slate-100 { background-color: #f1f5f9; }
                .border { border: 1px solid #cbd5e1; }
                .border-t { border-top: 1px solid #cbd5e1; }
                .border-b { border-bottom: 1px solid #cbd5e1; }
                .border-r { border-right: 1px solid #e2e8f0; }
                .rounded-md { border-radius: 6px; }
                .rounded-xl { border-radius: 12px; }
                .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                .inline-block { display: inline-block; }
                .text-right { text-align: right; }
                .font-mono { font-family: monospace; }
                .grid { display: grid; }
                .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .gap-6 { gap: 24px; }
                .w-2\/3 { width: 66.666667%; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .h-1 { height: 4px; }
                .bg-slate-350 { background-color: #cbd5e1; }
                .bg-slate-300 { background-color: #cbd5e1; }
                .w-16 { width: 64px; }
                .h-16 { height: 64px; }
                .border-4 { border-width: 4px; }
                .border-dashed { border-style: dashed; }
                .rounded-full { border-radius: 9999px; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .transform { transform: rotate(-12deg); }
                .select-none { user-select: none; }
                
                table {
                  width: 100%;
                  font-size: 10px;
                  border: 1px solid #cbd5e1;
                  border-collapse: collapse;
                  table-layout: auto;
                }
                th, td {
                  border: 1px solid #cbd5e1;
                  padding: 6px 8px;
                  text-align: left;
                }
                th {
                  background-color: #f8fafc;
                  font-weight: bold;
                }
                td {
                  font-weight: 500;
                }
                .no-print { display: none !important; }
                
                @media print {
                  body { margin: 10px; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  th, td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <div id="print-grades-container">
                ${printContent.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  window.focus();
                  setTimeout(function() {
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  const handleTogglePaymentStatus = (invoice: FeeInvoice) => {
    const isPaid = invoice.status === 'Paid';
    const student = students.find((s) => s.id === invoice.studentId);
    if (!student) return;

    const newStatus = isPaid ? 'Unpaid' : 'Paid';
    const updatedInvoice: FeeInvoice = {
      ...invoice,
      status: newStatus,
      paidDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: newStatus === 'Paid' ? 'Cash' : undefined
    };

    const updatedStudent: Student = {
      ...student,
      outstandingFees: newStatus === 'Paid'
        ? Math.max(0, student.outstandingFees - invoice.amount)
        : student.outstandingFees + invoice.amount,
      paidFees: newStatus === 'Paid'
        ? student.paidFees + invoice.amount
        : Math.max(0, student.paidFees - invoice.amount)
    };

    onUpdateFee(updatedInvoice);
    onUpdateStudent(updatedStudent);
  };

  // New Student state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStuName, setNewStuName] = useState('');
  const [newStuGrade, setNewStuGrade] = useState('Grade 10');
  const [newStuSection, setNewStuSection] = useState('A');
  const [newStuParentName, setNewStuParentName] = useState('');
  const [newStuParentPhone, setNewStuParentPhone] = useState('');
  const [newStuFees, setNewStuFees] = useState(1500);
  const [newStuAddress, setNewStuAddress] = useState('');

  // New Teacher state
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [newTchName, setNewTchName] = useState('');
  const [newTchSubject, setNewTchSubject] = useState('MATH');
  const [newTchClasses, setNewTchClasses] = useState<string[]>(['Grade 10 - A']);
  const [newTchEmail, setNewTchEmail] = useState('');
  const [newTchPhone, setNewTchPhone] = useState('');
  const [newTchSalary, setNewTchSalary] = useState(6500);
  const [newTchUsername, setNewTchUsername] = useState('');
  const [newTchPassword, setNewTchPassword] = useState('');

  // Payment filter state
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // New Announcement state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'Academic' | 'Administrative' | 'Event' | 'Urgent'>('Academic');
  const [newAnnAudience, setNewAnnAudience] = useState<'All' | 'Teachers' | 'Parents' | 'Students'>('All');
  const [newAnnContent, setNewAnnContent] = useState('');

  // Staff User credentials management state
  const [editingUser, setEditingUser] = useState<UserCredential | null>(null);

  // New Parent account creation states
  const [showParentModal, setShowParentModal] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentUsername, setNewParentUsername] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [parentStudentSearch, setParentStudentSearch] = useState('');

  // Editing individual item state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingFee, setEditingFee] = useState<FeeInvoice | null>(null);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [selectedStudentResults, setSelectedStudentResults] = useState<Student | null>(null);
  const [printableClass, setPrintableClass] = useState<string | null>(null);
  const [selectedExamTypeFilter, setSelectedExamTypeFilter] = useState<'Midterm' | 'Final' | 'Total'>('Midterm');
  const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] = useState<string>('2026-2027');

  // Financial Metrics
  const totalPaid = fees.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const totalOutstanding = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const collectionsRatio = totalPaid / (totalPaid + totalOutstanding || 1);

  // Average Student GPA
  const averageGpa = parseFloat(
    (students.reduce((acc, curr) => acc + curr.gpa, 0) / (students.length || 1)).toFixed(2)
  );

  // Class distribution chart data
  const chartData = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map((g) => ({
    name: g,
    value: students.filter((s) => s.grade === g).length
  })).filter((item) => item.value > 0);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuName) return;

    const studentId = `STU${Math.floor(Math.random() * 900 + 100)}`;
    const slug = newStuName.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
    // Automating internal structure variables silently
    const autoEmail = `${slug || studentId.toLowerCase()}@ibnukhuzeyma.edu`;

    const newStudent: Student = {
      id: studentId,
      name: newStuName,
      grade: newStuGrade,
      section: newStuSection,
      email: autoEmail,
      phone: newStuParentPhone || '(555) 555-5555',
      attendanceRate: 100.0,
      outstandingFees: Number(newStuFees) || 0,
      paidFees: 0,
      gpa: 4.0,
      status: 'Active',
      parentName: newStuParentName || 'Parent',
      parentEmail: `${slug || 'parent'}@ibnukhuzeyma.edu`,
      address: newStuAddress || 'Mogadishu, Somalia'
    };

    onAddStudent(newStudent);
    setShowStudentModal(false);
    // Reset states
    setNewStuName('');
    setNewStuParentName('');
    setNewStuParentPhone('');
    setNewStuFees(1500);
    setNewStuAddress('');
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTchName || !newTchEmail || !newTchPassword) {
      alert('Fadlan buuxi dhammaan xogta muhiimka ah (Magaca, Gmail-ka, iyo Password-ka)!');
      return;
    }

    const cleanEmail = newTchEmail.trim().toLowerCase();
    
    // Simple email format validation
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      alert('Fadlan geli Gmail/Email sax ah!');
      return;
    }

    // Use email as the login username directly for unified identity check
    const cleanUsername = cleanEmail;
    
    const exists = (users || []).some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      alert('Gmail-kaan mar hore ayaa loo diiwangeliyey akoon kale! Fadlan geli Gmail kale.');
      return;
    }

    const newTeacherId = `TCH${Math.floor(Math.random() * 900 + 100)}`;

    const newTeacher: Teacher = {
      id: newTeacherId,
      name: newTchName,
      subject: newTchSubject,
      assignedClass: newTchClasses.join(', ') || 'None',
      email: cleanEmail,
      phone: newTchPhone || '(555) 750-' + Math.floor(Math.random() * 900 + 100),
      status: 'Active',
      salary: Number(newTchSalary) || 6500,
      hireDate: new Date().toISOString().split('T')[0]
    };

    const newUserObj: UserCredential = {
      id: newTeacherId,
      name: newTchName,
      username: cleanUsername,
      password: newTchPassword.trim(),
      role: 'Teacher',
      status: 'Active',
      email: cleanEmail
    };

    onAddTeacher(newTeacher);
    onAddUser(newUserObj);

    setShowTeacherModal(false);
    
    // Reset states
    setNewTchName('');
    setNewTchEmail('');
    setNewTchPhone('');
    setNewTchSalary(6500);
    setNewTchClasses(['Grade 10 - A']);
    setNewTchUsername('');
    setNewTchPassword('');
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentName || !newParentEmail || !newParentPassword) {
      alert('Fadlan buuxi dhammaan xogta muhiimka ah (Magaca Waalidka, Gmail-ka, iyo Password-ka)!');
      return;
    }

    const cleanEmail = newParentEmail.trim().toLowerCase();
    
    // Simple email format validation
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      alert('Fadlan geli Gmail/Email sax ah waalidka!');
      return;
    }

    // Use email as the login username directly for unified identity check
    const cleanUsername = cleanEmail;
    
    const exists = (users || []).some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      alert('Gmail-kaan waalidka mar hore ayaa loo diiwangeliyey akoon kale! Fadlan geli Gmail kale.');
      return;
    }

    const newParentId = `PRN${Math.floor(Math.random() * 900 + 100)}`;

    const newUserObj: UserCredential = {
      id: newParentId,
      name: newParentName,
      username: cleanUsername,
      password: newParentPassword.trim(),
      role: 'Parent',
      status: 'Active',
      email: cleanEmail
    };

    // Update parent name and email for selected children
    selectedChildIds.forEach((studentId) => {
      const targetStudent = students.find((s) => s.id === studentId);
      if (targetStudent) {
        onUpdateStudent({
          ...targetStudent,
          parentName: newParentName,
          parentEmail: cleanEmail
        });
      }
    });

    onAddUser(newUserObj);

    // Dynamic Activity Logger integration
    if (onAddLog) {
      onAddLog({
        id: `LOG-${Math.floor(Math.random() * 900000 + 100000)}`,
        timestamp: new Date().toISOString(),
        operator: 'Admin Head',
        role: 'Admin',
        category: 'System',
        description: `Waxaa la abuuray akaun waalid cusub (${newParentName}) oo loo xiray ${selectedChildIds.length} caruur ah.`,
        academicYear: '2026-2027',
        status: 'Completed'
      });
    }

    setShowParentModal(false);

    // Reset parent inputs
    setNewParentName('');
    setNewParentEmail('');
    setNewParentUsername('');
    setNewParentPassword('');
    setSelectedChildIds([]);
    setParentStudentSearch('');
  };

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const newAnn: Announcement = {
      id: `ANC${Math.floor(Math.random() * 900 + 100)}`,
      title: newAnnTitle,
      content: newAnnContent,
      category: newAnnCategory,
      date: new Date().toISOString().split('T')[0],
      author: 'Administrative Head',
      targetAudience: newAnnAudience
    };

    onPostAnnouncement(newAnn);
    setShowAnnModal(false);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  // Filter students or teachers
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'All' || s.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const filteredTeachers = teachers.filter((t) => {
    return t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const navigationTabs = [
    { id: 'overview', label: 'Qeybta Guud (Overview)', icon: LayoutDashboard },
    { id: 'schedules', label: 'Jadwalka Xiisadaha (Schedules)', icon: Clock },
    { id: 'calendar', label: 'Kalandarka (Calendar)', icon: Calendar },
    { id: 'students', label: 'Ardayda (Students)', icon: GraduationCap },
    { id: 'teachers', label: 'Macallimiinta (Teachers)', icon: Users },
    { id: 'parents', label: 'Waalidiinta (Parents)', icon: Heart },
    { id: 'payments', label: 'Lacagaha (Payments)', icon: DollarSign },
    { id: 'grades', label: 'Natiijooyinka (Grades)', icon: Award },
    { id: 'announcements', label: 'Ogaysiisyada (Broadcast)', icon: Megaphone },
    { id: 'chat', label: 'Sheekaysiga (Chat)', icon: MessageSquare },
    { id: 'users', label: 'Xisaabaadka (Staff Users)', icon: Lock },
    { id: 'logs', label: 'Kormeerka Live (Logs)', icon: Activity },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="admin-panel">
      {/* 1. Sidebar Navigation (Left Column) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Mobile Navigation (Scrollable / Grid) - Visible on small/med screens */}
        <div className="block lg:hidden bg-slate-100 p-3 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center px-1">
            <div>
              <span className="text-[9px] text-indigo-650 font-extrabold uppercase tracking-wider block">Ibnu Khuzeyma Academy</span>
              <span className="text-xs font-extrabold text-slate-800">Portalka Maamulka</span>
            </div>
            <button
              onClick={() => setIsMenuExpanded(!isMenuExpanded)}
              className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {isMenuExpanded ? (
                <>✕ Xir Menu-ga</>
              ) : (
                <>☰ Menu-ga ({navigationTabs.find((t) => t.id === activeTab)?.label.split(' ')[0]})</>
              )}
            </button>
          </div>

          {isMenuExpanded && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 animate-fade-in focus:outline-none">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery('');
                      setIsMenuExpanded(false); // collapse on select
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Sidebar (Sticky vertical menu) - Visible only on large screens */}
        <div className="hidden lg:block bg-white border border-slate-150 rounded-2xl p-5 space-y-6 shadow-sm sticky top-6">
          <div className="border-b border-indigo-50 pb-4">
            <span className="text-[10px] text-indigo-500 font-extrabold tracking-widest uppercase block mb-1">Maamulka Sare</span>
            <span className="text-base font-extrabold text-slate-800 font-sans tracking-tight">Ibnu Khuzeyma Hub</span>
            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">{currentUser.name}</span>
              <button 
                onClick={() => setShowProfile(true)}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                Wax ka beddel Profile
              </button>
            </div>
          </div>

          {showProfile && (
            <ProfileSettings
              currentUser={currentUser}
              onUpdate={onUpdateUser}
              onClose={() => setShowProfile(false)}
            />
          )}

          {/* Quick single active tab preview badge when collapsed */}
          {!isMenuExpanded && (
            <div className="bg-indigo-50/55 p-3 rounded-xl border border-indigo-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-xs text-indigo-950 font-bold">Furan: {navigationTabs.find((t) => t.id === activeTab)?.label.split(' ')[0]}</span>
              </div>
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">T tucked</span>
            </div>
          )}

          {/* Collapsible toggle button */}
          <button
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100/80 text-slate-700 rounded-xl text-xs font-extrabold transition-all text-center flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-indigo-650 shrink-0" />
              <span>Qeybaha Portalka Hub-ka</span>
            </div>
            {isMenuExpanded ? (
              <ChevronUp className="w-4 h-4 shrink-0 text-slate-400 animate-pulse" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 animate-bounce" />
            )}
          </button>

          {isMenuExpanded && (
            <nav className="space-y-1.5 animate-fade-in pt-1 focus:outline-none">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.01]'
                        : 'bg-white border-transparent text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Elegant Sidebar Badge info */}
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
            <span className="text-[9px] text-emerald-600 font-extrabold tracking-wider uppercase block leading-none">Security Active</span>
            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Hab-dhismeedka nidaamka waa mid sugan oo si toos ah u xiriirinaya macallimiinta, waalidiinta & ardayda.
            </p>
          </div>
        </div>

      </div>

      {/* 2. Main Content Area (Right Column) */}
      <div className="lg:col-span-9 space-y-6">

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">TOTAL STUDENTS</span>
                <p className="text-xl md:text-2xl font-bold text-slate-800">{students.length}</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">FACULTY MEMBERS</span>
                <p className="text-xl md:text-2xl font-bold text-slate-800">{teachers.length}</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">FEES SETTLED (PAID)</span>
                <p className="text-xl md:text-2xl font-bold text-slate-800">${totalPaid.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">CUMULATIVE GPA</span>
                <p className="text-xl md:text-2xl font-bold text-slate-800">{averageGpa}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Financial ledger card (Emerald green focused theme as per user color mandate) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Financial Solvency & Collections</h3>
                  <p className="text-xs text-slate-400">Comparing Paid Ledger vs Outstanding Accounts receivable</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  EcoSync Financials
                </span>
              </div>

              {/* Solvency balance ledger bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Collections Efficiency ({Math.round(collectionsRatio * 100)}%)</span>
                  <span>Goal: 95%</span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${collectionsRatio * 100}%` }}
                    title={`Paid: $${totalPaid}`}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${(1 - collectionsRatio) * 100}%` }}
                    title={`Outstanding: $${totalOutstanding}`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                    <span>Received: ${totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                    <span>Uncollected Invoices: ${totalOutstanding.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rapid Actions */}
              <div className="pt-4 border-t border-slate-50 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Administrative Fast-Actions</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowStudentModal(true)}
                    className="p-3 bg-blue-50/50 hover:bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    Student
                  </button>
                  <button
                    onClick={() => setShowTeacherModal(true)}
                    className="p-3 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-100 flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    Teacher
                  </button>
                  <button
                    onClick={() => setShowAnnModal(true)}
                    className="p-3 bg-violet-50/50 hover:bg-violet-50 text-violet-800 rounded-xl border border-violet-100 flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer transition-all"
                  >
                    <Megaphone className="w-4 h-4 text-violet-600" />
                    Broadcast
                  </button>
                </div>
              </div>
            </div>

            {/* School Registration by Grades chart */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Class Distribution</h3>
                <p className="text-xs text-slate-400">Total student enrollment density per instructional level</p>
              </div>

              <div className="h-44 w-full mt-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} />
                    <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#3b82f6' : '#1e3a8a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Core announcements view */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Live Bulletins Feed</h3>
                <p className="text-xs text-slate-400">Current announcements broadcasting across academy profiles</p>
              </div>
              <button
                onClick={() => setShowAnnModal(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Bulletin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.slice(0, 4).map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    ann.category === 'Urgent'
                      ? 'bg-rose-50/40 border-rose-100 text-rose-900'
                      : ann.category === 'Event'
                      ? 'bg-amber-50/40 border-amber-100 text-amber-900'
                      : 'bg-slate-50/50 border-slate-100 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ann.category === 'Urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : ann.category === 'Event'
                            ? 'bg-amber-100 text-amber-700'
                            : ann.category === 'Academic'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{ann.date}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">{ann.title}</h4>
                    <p className="text-xs text-slate-600 text-justify line-clamp-3">{ann.content}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-3 border-t border-slate-100/50 pt-2 flex justify-between">
                    <span>By: {ann.author}</span>
                    <span>For: {ann.targetAudience}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {onAddDocument && onDeleteDocument && (
            <div className="mt-8" id="overview-curriculum-documents">
              <CurriculumDocumentsHub
                documents={documents}
                role="Admin"
                authorName="Ibnu Khuzeyma Admin"
                onAddDocument={onAddDocument}
                onDeleteDocument={onDeleteDocument}
              />
            </div>
          )}

          {/* Class Attendance & Student Tracking (Kormeerka & Xaadirista) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm mt-8" id="admin-attendance-tracking-system">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider text-slate-500">📊 KORMEERKA & XAADIRISTA FASALADA (Attendance & Student Tracking)</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Kala soco xaadirinta fasal kasta tii manta, shalay ama bishaan oo dhan iyo macluumaadka ardada.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActiveAttendanceRange('today');
                    setActiveAttendanceDate(new Date().toISOString().split('T')[0]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeAttendanceRange === 'today'
                      ? 'bg-indigo-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Manta (Today)
                </button>
                <button
                  onClick={() => {
                    setActiveAttendanceRange('yesterday');
                    setActiveAttendanceDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeAttendanceRange === 'yesterday'
                      ? 'bg-indigo-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Shalay (Yesterday)
                </button>
                <button
                  onClick={() => setActiveAttendanceRange('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeAttendanceRange === 'month'
                      ? 'bg-indigo-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bishaan (This Month)
                </button>
              </div>
            </div>

            {/* Class Selector Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dooro Fasal si aad u kormeerto (Choose Class to Inspect)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Array.from(new Set(students.map(s => `${s.grade} - ${s.section}`))).map(cls => {
                  const classStudents = students.filter(s => `${s.grade} - ${s.section}` === cls);
                  const isSelected = activeAttendanceClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => setActiveAttendanceClass(cls)}
                      className={`p-3 rounded-xl border text-left transition duration-250 hover:shadow-sm cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 ring-1 ring-indigo-200 font-bold'
                          : 'bg-white border-slate-150 text-slate-700 hover:border-slate-300 font-bold'
                      }`}
                    >
                      <span className="block text-xs font-extrabold">{cls}</span>
                      <span className="block text-[9.5px] text-slate-400 mt-0.5">{classStudents.length} Arday</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Class Details & Attendance Summary */}
            {(() => {
              const activeStudents = students.filter(s => `${s.grade} - ${s.section}` === activeAttendanceClass);
              
              let presentCount = 0;
              let absentCount = 0;
              let lateCount = 0;

              if (activeAttendanceRange !== 'month') {
                activeStudents.forEach(stu => {
                  const record = attendance.find(a => a.studentId === stu.id && a.date === activeAttendanceDate);
                  if (!record || record.status === 'Present') presentCount++;
                  else if (record.status === 'Absent') absentCount++;
                  else if (record.status === 'Late') lateCount++;
                });
              } else {
                activeStudents.forEach(stu => {
                  const records = attendance.filter(a => a.studentId === stu.id && a.date.startsWith(activeAttendanceMonth));
                  if (records.length === 0) {
                    presentCount++;
                  } else {
                    const pres = records.filter(r => r.status === 'Present').length;
                    const lat = records.filter(r => r.status === 'Late').length;
                    const abs = records.filter(r => r.status === 'Absent').length;
                    presentCount += pres;
                    lateCount += lat;
                    absentCount += abs;
                  }
                });
              }

              const totalCount = activeStudents.length;
              const rate = totalCount > 0 
                ? activeAttendanceRange !== 'month'
                  ? Math.round(((presentCount + lateCount * 0.5) / totalCount) * 100)
                  : Math.round(((presentCount + lateCount * 0.5) / (presentCount + lateCount + absentCount || 1)) * 100)
                : 100;

              return (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Fasalka la doortay</span>
                      <span className="text-xs font-bold text-slate-800">{activeAttendanceClass}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">
                        {activeAttendanceRange === 'month' ? 'Celceliska bishan' : `Xaadirada (${activeAttendanceDate})`}
                      </span>
                      <span className="text-xs font-black text-indigo-900 font-mono">{rate}%</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Jooga (Present)</span>
                      <span className="text-xs font-bold text-emerald-600 font-mono">{presentCount}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Dahsan (Late)</span>
                      <span className="text-xs font-bold text-amber-500 font-mono">{lateCount}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Ma Joogo (Absent)</span>
                      <span className="text-xs font-bold text-rose-600 font-mono">{absentCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    {activeAttendanceRange !== 'month' ? (
                      <div className="flex items-center gap-2 max-w-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Tariikhda Kormeerka:</span>
                        <input
                          type="date"
                          value={activeAttendanceDate}
                          onChange={(e) => setActiveAttendanceDate(e.target.value)}
                          className="p-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">📅 Dooro Bisha (Select Month):</span>
                        <input
                          type="month"
                          value={activeAttendanceMonth}
                          onChange={(e) => {
                            if (e.target.value) {
                              setActiveAttendanceMonth(e.target.value);
                            }
                          }}
                          className="p-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full border-collapse text-left text-xs text-slate-700">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-3">ID</th>
                          <th className="p-3">Ardayga (Student Name)</th>
                          <th className="p-3 text-center">Xaaladda (Attendance Status)</th>
                          <th className="p-3 text-center">Macluumaadka Xiriirka</th>
                          <th className="p-3 text-right">Falka (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeStudents.map(stu => {
                          let record = attendance.find(a => a.studentId === stu.id && a.date === activeAttendanceDate);
                          let currentStatus: 'Present' | 'Absent' | 'Late' = record ? record.status : 'Present';

                          const monthRecords = attendance.filter(a => a.studentId === stu.id && a.date.startsWith(activeAttendanceMonth));
                          const presentDays = monthRecords.filter(r => r.status === 'Present').length + (activeAttendanceRange === 'month' && monthRecords.length === 0 ? 1 : 0);
                          const absentDays = monthRecords.filter(r => r.status === 'Absent').length;
                          const lateDays = monthRecords.filter(r => r.status === 'Late').length;

                          return (
                            <tr key={stu.id} className="hover:bg-slate-50/40 transition">
                              <td className="p-3 font-mono text-[10.5px] font-bold text-slate-500">{stu.id}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={stu.avatar || 'https://via.placeholder.com/150'}
                                    alt={stu.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-inner"
                                  />
                                  <div>
                                    <span className="font-extrabold text-slate-800 block text-xs">{stu.name}</span>
                                    <span className="text-[10px] text-slate-400 block font-medium">Waalidka: {stu.parentName}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {activeAttendanceRange !== 'month' ? (
                                  <span className={`inline-block p-1 px-3.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    currentStatus === 'Present'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : currentStatus === 'Absent'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {currentStatus === 'Present' ? '🟢 Jooga' : currentStatus === 'Absent' ? '🔴 Ma Joogo' : '🟡 Dahsan'}
                                  </span>
                                ) : (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="font-mono text-xs font-bold text-slate-800">{stu.attendanceRate}%</span>
                                    <span className="text-[9px] text-slate-400">Rate</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="block text-[10.5px] font-medium text-slate-600">{stu.parentEmail}</span>
                                <span className="block text-[9.5px] text-slate-400 font-mono">{stu.phone}</span>
                              </td>
                              <td className="p-3 text-right">
                                {activeAttendanceRange !== 'month' ? (
                                  <div className="inline-flex gap-1">
                                    <button
                                      onClick={() => {
                                        if (onSubmitAttendanceBatch) {
                                          onSubmitAttendanceBatch([{
                                            id: record?.id || `ATT-${stu.id}-${activeAttendanceDate}-${Date.now()}`,
                                            date: activeAttendanceDate,
                                            studentId: stu.id,
                                            status: 'Present'
                                          }]);
                                        }
                                      }}
                                      className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] rounded-lg border border-emerald-150 transition cursor-pointer"
                                    >
                                      Jooga
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (onSubmitAttendanceBatch) {
                                          onSubmitAttendanceBatch([{
                                            id: record?.id || `ATT-${stu.id}-${activeAttendanceDate}-${Date.now()}`,
                                            date: activeAttendanceDate,
                                            studentId: stu.id,
                                            status: 'Late'
                                          }]);
                                        }
                                      }}
                                      className="p-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] rounded-lg border border-amber-150 transition cursor-pointer"
                                    >
                                      Dahsan
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (onSubmitAttendanceBatch) {
                                          onSubmitAttendanceBatch([{
                                            id: record?.id || `ATT-${stu.id}-${activeAttendanceDate}-${Date.now()}`,
                                            date: activeAttendanceDate,
                                            studentId: stu.id,
                                            status: 'Absent'
                                          }]);
                                        }
                                      }}
                                      className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px] rounded-lg border border-rose-150 transition cursor-pointer"
                                    >
                                      Ma Joogo
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    <span className="text-emerald-600 font-bold">{presentDays}P</span> • <span className="text-amber-500 font-bold">{lateDays}L</span> • <span className="text-rose-600 font-bold">{absentDays}A</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 font-bold" />
                Students Registry & Attendance Print Hub
              </h3>
              <p className="text-xs text-slate-400">Arag diiwaanka ardayda, ama hoos ka daabac maqnaanshaha bishaan/bishii hore.</p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="p-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
              >
                <option value="All">All Grades</option>
                {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Register student button */}
              <button
                onClick={() => setShowStudentModal(true)}
                className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 animate-pulse" /> Register Scholar
              </button>
            </div>
          </div>

          {/* Attendance Printing / Report Panel */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-indigo-600 animate-pulse" />
                Daabacaadda Maqnaashaha (Print Attendance Reports)
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Dooro fasal iyo bil gaar ah si aad u daabacdo xogta xadirinta ugana jawaabto baahiyaha waalidka.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Fasalka (Class)</label>
                <select
                  value={printClass}
                  onChange={(e) => setPrintClass(e.target.value)}
                  className="w-full mt-1 p-2 bg-white border border-slate-250 rounded-lg text-xs font-semibold text-slate-705 outline-none"
                >
                  {Array.from(new Set(students.map((s) => `${s.grade} - ${s.section}`)))
                    .sort()
                    .map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">📅 Bisha (Reporting Month Calendar)</label>
                <input
                  type="month"
                  value={convertToMonthInput(printMonth)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPrintMonth(convertToReadableMonth(e.target.value));
                    }
                  }}
                  className="w-full mt-1 p-2 bg-white border border-slate-250 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex">
              <button
                type="button"
                onClick={() => {
                  setPrintType('attendance');
                  setShowPrintModal(true);
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-indigo-600/10 cursor-pointer"
              >
                🖨️ Daabac Maqnaanshaha Fasalkan
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or record ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Students Directory Grid/Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Grade & Section</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">GPA</th>
                  <th className="p-4 text-center">Fees Status</th>
                  <th className="p-4 text-center">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            alt={s.name}
                            src={s.avatar || 'https://via.placeholder.com/150'}
                            className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{s.name}</p>
                            <p className="text-[10px] text-slate-400">Parent: {s.parentName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-600">{s.id}</td>
                      <td className="p-4">
                        <span className="font-medium text-slate-700">{s.grade}</span>
                        <p className="text-[10px] text-slate-400">Section {s.section}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-600">{s.email}</p>
                        <p className="text-[10px] text-slate-400">{s.phone}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                          s.gpa >= 3.75 ? 'bg-emerald-50 text-emerald-700' : s.gpa >= 3.0 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {s.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold inline-block ${
                          s.outstandingFees === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {s.outstandingFees === 0 ? 'Settled' : `$${s.outstandingFees.toLocaleString()} Due`}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            title="Wax ka badal Ardayga (Edit)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(s.id)}
                            className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Deregister Scholar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No matching students located in the registers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          {/* TEACHERS CREDENTIALS DIRECTORY (Xogta Loginka Macalimiinta) */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight text-white">ELEGANT LOGIN CREDENTIALS DIRECTORY (Xogta Loginka Macalimiinta)</h4>
                <p className="text-xs text-slate-400">Hoos ka eeg username-ka iyo password-ka 12-ka Macalin si ay ugu galaan Dashboard-kooda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teachers.map((t) => {
                const cleanName = t.name.toLowerCase();
                const defaultUsername = cleanName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
                const userCred = users.find(u => u.id === t.id || u.username.toLowerCase() === defaultUsername.toLowerCase()) || {
                  username: defaultUsername,
                  password: '123'
                };

                return (
                  <div key={t.id} className="p-3 bg-slate-805 bg-slate-800/60 border border-slate-800 rounded-xl flex items-start gap-3">
                    <img
                      src={t.avatar || 'https://via.placeholder.com/150'}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 mt-0.5"
                    />
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-white leading-tight">{t.name}</p>
                      <p className="text-[10px] text-indigo-300 font-medium">{t.subject} • {t.assignedClass}</p>
                      
                      <div className="pt-1.5 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-450 text-slate-400 uppercase tracking-wider font-semibold">User:</span>
                          <span className="font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-bold select-all">
                            {userCred.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-450 text-slate-400 uppercase tracking-wider font-semibold">Pass:</span>
                          <span className="font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300 font-bold select-all">
                            {userCred.password}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Academic Faculty</h3>
              <p className="text-xs text-slate-400">Manage teachers, subjects, levels, and monthly compensation pay-slips</p>
            </div>

            <button
              onClick={() => setShowTeacherModal(true)}
              className="bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Appoint Instructor
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teachers by subject expertise or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 text-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          {/* Teachers table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Subject Expertise</th>
                  <th className="p-4">Homeroom assignment</th>
                  <th className="p-4">Salary</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            alt={t.name}
                            src={t.avatar || 'https://via.placeholder.com/150'}
                            className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{t.name}</p>
                            <p className="text-[10px] text-slate-400">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-700 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs">
                          {t.subject}
                        </span>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const classCount = t.assignedClass 
                            ? t.assignedClass.split(',').map(c => c.trim()).filter(Boolean).length 
                            : 0;
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit">
                                {classCount} {classCount === 1 ? 'Fasal' : 'Fasalo'} (Classes)
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono block max-w-[150px] truncate" title={t.assignedClass}>
                                {t.assignedClass || 'None'}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4 font-semibold text-slate-800">${t.salary.toLocaleString()}/mo</td>
                      <td className="p-4 text-slate-500">{t.hireDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingTeacher(t)}
                            className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            title="Wax ka badal Macallinka (Edit)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTeacher(t.id)}
                            className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Relieve Faculty member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No matching instructors cataloged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600 font-extrabold" />
                Diiwaanka & Warbixinta Lacag-bixinta (Payments Dashboard)
              </h3>
              <p className="text-xs text-slate-400">Arag dhammaan fasallada, ku shub ama ka noqo lacagaha bil kasta oo la soco xogta maqnaanshaha (attendance statistics) arday kasta bishii.</p>
            </div>
            
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px]">
                <span className="text-slate-400 block font-medium uppercase text-[9px]">TOTAL PAID</span>
                <span className="font-bold text-emerald-700 text-sm">${totalPaid.toLocaleString()}</span>
              </div>
              <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-[11px]">
                <span className="text-slate-400 block font-medium uppercase text-[9px]">TOTAL OUTSTANDING</span>
                <span className="font-bold text-amber-700 text-sm">${totalOutstanding.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Interactive Class Selector & Monthly Cycle Control Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            
            {/* COLUMN 1: SELECT CLASS */}
            <div className="space-y-3 xl:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Dooro Fasalka Si Aad Ula Socoto (Select Class):</span>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded uppercase">Fasalada Diiwaangashan</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from(new Set(students.map((s) => `${s.grade} - ${s.section}`)))
                  .sort()
                  .map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedPaymentClass(cls)}
                      className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                        selectedPaymentClass === cls
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/10'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
              </div>
            </div>

            {/* COLUMN 2: NEW MONTH REFRESH / BILLING CYCLE TRIGGER */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>BILLAREE BIL CUSUB (New Invoice Cycle)</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400">📅 Dooro Bisha (Billing Calendar Month)</label>
                  <input
                    type="month"
                    value={convertToMonthInput(selectedBillingMonth)}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedBillingMonth(convertToReadableMonth(e.target.value));
                      }
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400">Lacagta (Amount in USD)</label>
                  <input
                    type="number"
                    value={billingAmountInput}
                    onChange={(e) => setBillingAmountInput(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    placeholder="150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const listToBill = students.filter(s => `${s.grade} - ${s.section}` === selectedPaymentClass);
                      const outstandingToBill = listToBill.filter(s =>
                        !fees.some(f => f.studentId === s.id && f.title.toLowerCase().includes(selectedBillingMonth.toLowerCase()))
                      );

                      if (outstandingToBill.length === 0) {
                        alert(`Dhammaan ardayda fasalka ${selectedPaymentClass} horay ayaa loogu soo dhalay biilka ${selectedBillingMonth}!`);
                        return;
                      }

                      requestConfirmation(
                        'Dhalista Biilka Fasalka',
                        `Ma hubtaa inaad u dhaliso biil cusub oo dhan $${billingAmountInput} oo bisha ${selectedBillingMonth} ah dhamaan ardayda tiradoodu tahay ${outstandingToBill.length} oo ka tirsan fasalka ${selectedPaymentClass}?`,
                        () => {
                          const monthMapCodes: Record<string, string> = {
                            'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
                            'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
                          };
                          const monthWord = selectedBillingMonth.split(' ')[0];
                          const monthNum = monthMapCodes[monthWord] || '06';

                          const newInvs: FeeInvoice[] = outstandingToBill.map(s => ({
                            id: `INV-${selectedBillingMonth.replace(/\s+/g, '-')}-${s.id}-${Math.floor(Math.random() * 900 + 100)}`,
                            studentId: s.id,
                            title: `Tuition Fee - ${selectedBillingMonth}`,
                            amount: billingAmountInput,
                            dueDate: `2026-${monthNum}-28`,
                            status: 'Unpaid'
                          }));

                          onAddInvoices(newInvs);
                        }
                      );
                    }}
                    className="p-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-[9px] font-bold text-center transition cursor-pointer"
                  >
                    Dhal Biilka Fasalkan
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const outstandingToBill = students.filter(s =>
                        !fees.some(f => f.studentId === s.id && f.title.toLowerCase().includes(selectedBillingMonth.toLowerCase()))
                      );

                      if (outstandingToBill.length === 0) {
                        alert(`Dhammaan ardayda dugsiga (120 student) horay ayaa loogu dhalay biilka bisha ${selectedBillingMonth}!`);
                        return;
                      }

                      requestConfirmation(
                        'Dhalista Biilka Dhamaan Fasallada',
                        `Ma hubtaa inaad u soo saarto biil cusub ($${billingAmountInput}) oo bisha ${selectedBillingMonth} ah dhammaan ardayda tiradoodu tahay ${outstandingToBill.length}?`,
                        () => {
                          const monthMapCodes: Record<string, string> = {
                            'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
                            'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
                          };
                          const monthWord = selectedBillingMonth.split(' ')[0];
                          const monthNum = monthMapCodes[monthWord] || '06';

                          const newInvs: FeeInvoice[] = outstandingToBill.map(s => ({
                            id: `INV-${selectedBillingMonth.replace(/\s+/g, '-')}-${s.id}-${Math.floor(Math.random() * 900 + 100)}`,
                            studentId: s.id,
                            title: `Tuition Fee - ${selectedBillingMonth}`,
                            amount: billingAmountInput,
                            dueDate: `2026-${monthNum}-28`,
                            status: 'Unpaid'
                          }));

                          onAddInvoices(newInvs);
                        }
                      );
                    }}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold text-center transition cursor-pointer"
                  >
                    Dhal Dhamaan 12 Fasal
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ACTIVE PAYMENT CLASS VIEW */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="p-1 px-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{selectedPaymentClass}</span>
                  <span>Ardayda Fasalkan & Biilasha bisha {selectedBillingMonth}</span>
                </h4>
                <p className="text-[11px] text-slate-400">Hoos ka hubi ama kaga dhig "Wuu shubay / Ma bixin" arday kasta, iyo xogta maqnaanshaha bishaan.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPrintClass(selectedPaymentClass);
                    setPrintMonth(selectedBillingMonth);
                    setPrintType('payments');
                    setShowPrintModal(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                >
                  <Printer className="w-3.5 h-3.5 animate-pulse" />
                  <span>Daabac Lacagaha Fasalkan (Print)</span>
                </button>

                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ku qor magac si aad u shaandheyso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 focus:bg-white text-slate-800 text-xs border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Student (Ardayga)</th>
                    <th className="p-4 text-center">Fasalka (Class)</th>
                    <th className="p-4 text-center">Biilka Bisha (Monthly Invoice)</th>
                    <th className="p-4 text-right">Cadadka Due</th>
                    <th className="p-4 text-center">Xaaladda (Payment Status)</th>
                    <th className="p-4 text-center">Diiwaanka Xadirinta Bishan (Monthly Attendance)</th>
                    <th className="p-4 text-center">Ficilada (Operations)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students
                    .filter((s) => `${s.grade} - ${s.section}` === selectedPaymentClass)
                    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .length > 0 ? (
                    students
                      .filter((s) => `${s.grade} - ${s.section}` === selectedPaymentClass)
                      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((s) => {
                        const monthInvoice = fees.find(
                          (f) => f.studentId === s.id && f.title.toLowerCase().includes(selectedBillingMonth.toLowerCase())
                        );

                        const monthMapCodes: Record<string, string> = {
                          'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
                          'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
                        };
                        const monthWord = selectedBillingMonth.split(' ')[0];
                        const monthNum = monthMapCodes[monthWord] || '06';

                        const monthAttendance = attendance.filter(
                          (a) => a.studentId === s.id && a.date.includes(`-${monthNum}-`)
                        );
                        const absents = monthAttendance.filter(a => a.status === 'Absent').length;
                        const lates = monthAttendance.filter(a => a.status === 'Late').length;
                        const presents = monthAttendance.filter(a => a.status === 'Present').length;

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  alt={s.name}
                                  src={s.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80'}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                                <div>
                                  <p className="font-bold text-slate-800">{s.name}</p>
                                  <p className="text-[10px] text-slate-400">ID: {s.id} • Parent: {s.parentName}</p>
                                </div>
                              </div>
                            </td>
                            
                            <td className="p-4 text-center font-bold text-slate-500">
                              {s.grade} - {s.section}
                            </td>

                            <td className="p-4 text-center">
                              {monthInvoice ? (
                                <span className="font-semibold text-slate-700 block text-[11px] truncate max-w-[150px]">
                                  {monthInvoice.title}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Ma jiro biil bishan ah</span>
                              )}
                            </td>

                            <td className="p-4 text-right font-bold text-slate-800">
                              {monthInvoice ? `$${monthInvoice.amount}` : '-'}
                            </td>

                            <td className="p-4 text-center">
                              {monthInvoice ? (
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                                  monthInvoice.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {monthInvoice.status === 'Paid' ? 'WUU BIXIYAY (Paid)' : 'MA BIXIN (Unpaid)'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold text-[10px]">Eber</span>
                              )}
                            </td>

                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-mono text-[9px] font-bold" title="Joogay">
                                  Presents: {presents}
                                </span>
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded font-mono text-[9px] font-bold" title="Daahay">
                                  Lates: {lates}
                                </span>
                                {absents > 0 ? (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-extrabold text-[9px] animate-pulse" title="Ka Maqnaa">
                                    🚫 {absents} Maqnaansho (Absent)
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-mono text-[9px] font-medium">
                                    Filan (0 abs)
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {monthInvoice ? (
                                  <div className="flex gap-1.5 justify-center items-center">
                                    <button
                                      onClick={() => handleTogglePaymentStatus(monthInvoice)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-white transition shadow-sm cursor-pointer whitespace-nowrap ${
                                        monthInvoice.status === 'Paid'
                                          ? 'bg-amber-600 hover:bg-amber-700'
                                          : 'bg-emerald-600 hover:bg-emerald-700'
                                      }`}
                                    >
                                      {monthInvoice.status === 'Paid' ? 'U beddel Ma Bixin' : 'U beddel Wuu Bixiyay'}
                                    </button>
                                    {onDeleteFee && (
                                      <button
                                        onClick={() => {
                                          requestConfirmation(
                                            'Tirtirista Biilka',
                                            'Ma xaqiiqsan tahay inaad tirtirto biilkaan/invoicekaan? Waxa ay ka tirtirmaysaa gabi ahaanba diiwaanka iyo database-ka.',
                                            () => {
                                              onDeleteFee(monthInvoice.id);
                                            }
                                          );
                                        }}
                                        className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                        title="Tirtir Biilka"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const monthMapCodes: Record<string, string> = {
                                        'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
                                        'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
                                      };
                                      const monthWord = selectedBillingMonth.split(' ')[0];
                                      const monthNum = monthMapCodes[monthWord] || '06';

                                      const singleInv: FeeInvoice = {
                                        id: `INV-${selectedBillingMonth.replace(/\s+/g, '-')}-${s.id}-${Math.floor(Math.random() * 900 + 100)}`,
                                        studentId: s.id,
                                        title: `Tuition Fee - ${selectedBillingMonth}`,
                                        amount: billingAmountInput,
                                        dueDate: `2026-${monthNum}-28`,
                                        status: 'Unpaid'
                                      };
                                      onAddInvoices([singleInv]);
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded text-[9px] font-bold border border-slate-200 cursor-pointer transition-all"
                                  >
                                    Soo saar biil bishan
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        Ma jiraan arday buuxisay shuruuda iyo shaandheynta ee halkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto">
            <h3 className="font-black text-slate-800 mb-2 text-xs uppercase tracking-wider text-slate-400">Group-yada Guud</h3>
            <div className="space-y-1.5 mb-6">
              <button
                onClick={() => {
                  setSelectedChatUser('warbixinta-maalintii');
                  setSelectedChatReceiverName('Warbixinta Maalintii');
                }}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${selectedChatUser === 'warbixinta-maalintii' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${selectedChatUser === 'warbixinta-maalintii' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                  GP
                </div>
                <div>
                  <span className="block text-xs font-black">Warbixinta Maalintii</span>
                  <span className={`block text-[8px] font-semibold ${selectedChatUser === 'warbixinta-maalintii' ? 'text-indigo-200' : 'text-slate-400'}`}>Wada-sheekaysiga Macallimiinta & Maamulka</span>
                </div>
              </button>
            </div>

            <h3 className="font-black text-slate-800 mb-2 text-xs uppercase tracking-wider text-slate-400">Xubnaha Kale</h3>
            <div className="space-y-1.5">
              {[...teachers, ...users.filter(u => u.role === 'Parent')].map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedChatUser(u.id);
                    setSelectedChatReceiverName(u.name || (u as any).username || 'User');
                  }}
                  className={`w-full p-3 rounded-xl text-left text-xs flex items-center gap-2.5 transition-all cursor-pointer ${selectedChatUser === u.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${selectedChatUser === u.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {(u.name || (u as any).username || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-xs font-black truncate max-w-[150px]">{u.name || (u as any).username || 'User'}</span>
                    <span className={`block text-[8px] font-semibold ${selectedChatUser === u.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {'role' in u ? ((u as any).role === 'Parent' ? 'Waalid' : (u as any).role) : 'Macallin'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            {selectedChatUser ? (
              <ChatComponent currentUserId={currentUser.id} senderName={currentUser.name || 'Admin'} chatId={selectedChatUser} receiverName={selectedChatReceiverName || 'User'} />
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
                Dooro qof aad la sheekaysato
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Broadcast Bulletins</h3>
              <p className="text-xs text-slate-400">Post announcements seen by teachers, parents, and students immediately</p>
            </div>
            <button
              onClick={() => setShowAnnModal(true)}
              className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Bulletin
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 flex flex-col justify-between md:flex-row gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ann.category === 'Urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.category === 'Event'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-xs text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-normal text-justify">{ann.content}</p>
                </div>

                <div className="md:text-right flex md:flex-col justify-between items-end shrink-0 border-t md:border-t-0 md:pl-4 border-slate-100 pt-3 md:pt-0">
                  <div className="flex flex-col gap-2 items-end header-actions-container">
                    <div>
                      <p className="text-[10px] text-slate-400">Target Audience</p>
                      <span className="text-xs font-semibold text-slate-700">{ann.targetAudience}</span>
                    </div>
                    {onDeleteAnnouncement && (
                      <button
                        onClick={() => {
                          requestConfirmation(
                            'Tirtirista Warbixinta',
                            'Ma xaqiiqsan tahay inaad tirtirto warbixintan?',
                            () => {
                              onDeleteAnnouncement(ann.id);
                            }
                          );
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-black"
                        title="Tirtir Warbixinta"
                      >
                        <Trash2 className="w-3 h-3" /> Tirtir
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sender: <span className="font-medium text-slate-600">{ann.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Natiijooyinka Imtixaanada (Exam Results Board)
              </h3>
              <p className="text-xs text-slate-400">Arag, shaandhee, oo beddel natiijooyinka imtixaanada fasal kasta adoo u raacaya wadarta buundada (Sorted by Total Score)</p>
            </div>
            
            <div className="flex gap-2">
              {selectedClassFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setPrintableClass(selectedClassFilter)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <BookOpen className="w-4 h-4" /> Daabac Natiijada Falkan ({selectedClassFilter})
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 w-full md:w-auto">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Fasalka (Class Filter):</span>
                <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner max-w-full overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedClassFilter('All')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedClassFilter === 'All'
                        ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Dhammaan (All)
                  </button>
                  {Array.from(new Set(students.map((s) => `${s.grade} - ${s.section}`)))
                    .sort()
                    .map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClassFilter(cls)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          selectedClassFilter === cls
                            ? 'bg-white text-indigo-900 shadow-sm font-extrabold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Imtixaanka (Exam Period):</span>
                <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner w-fit">
                  <button
                    type="button"
                    onClick={() => setSelectedExamTypeFilter('Midterm')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedExamTypeFilter === 'Midterm'
                        ? 'bg-indigo-900 text-white shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Nus-Sanad (Midterm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExamTypeFilter('Final')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedExamTypeFilter === 'Final'
                        ? 'bg-indigo-900 text-white shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Dhamaadka Sano (Final)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExamTypeFilter('Total')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedExamTypeFilter === 'Total'
                        ? 'bg-indigo-900 text-white shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Wadarta Guud (Annual Total)
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Sannad-Dugsiyeedka (Academic Year):</span>
                <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner w-fit">
                  <button
                    type="button"
                    onClick={() => setSelectedAcademicYearFilter('2026-2027')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedAcademicYearFilter === '2026-2027'
                        ? 'bg-indigo-900 text-white shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2026-2027 (Hadda)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAcademicYearFilter('2025-2026')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedAcademicYearFilter === '2025-2026'
                        ? 'bg-indigo-900 text-white shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2025-2026 (Hore)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAcademicYearFilter('All')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedAcademicYearFilter === 'All'
                        ? 'bg-indigo-900 text-white shadow-sm font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Dhammaan (All Years)
                  </button>
                </div>
              </div>
            </div>

            <div className="relative w-full md:max-w-xs self-end md:self-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ku qor magaca ardayga si aad u baarto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white text-slate-800 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Results Table sorted by total marks */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 text-center w-12">Kala-horrayn (Rank)</th>
                  <th className="p-4">Ardayga (Student Name)</th>
                  <th className="p-4">Fasalka (Class)</th>
                  <th className="p-4 text-center">Tirada Imtixaanada (Exams)</th>
                  <th className="p-4 text-center">Celceliska (Average %)</th>
                  <th className="p-4 text-center">GPA</th>
                  <th className="p-4 text-center font-bold text-slate-900 bg-indigo-50/50">Wadarta Buundada (Total Marks)</th>
                  <th className="p-4 text-center">Ficilada (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const sortedStudentsByResult = students
                    .filter((s) => {
                      const sClass = `${s.grade} - ${s.section}`;
                      const matchesClass = selectedClassFilter === 'All' || sClass === selectedClassFilter || s.grade === selectedClassFilter;
                      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesClass && matchesSearch;
                    })
                    .map((s) => {
                      let studentGrades: Grade[] = [];
                      const academicYearFilteredGrades = grades.filter((g) => {
                        if (selectedAcademicYearFilter === 'All') return true;
                        if (!g.academicYear) {
                          return selectedAcademicYearFilter === '2026-2027';
                        }
                        return g.academicYear === selectedAcademicYearFilter;
                      });

                      if (selectedExamTypeFilter === 'Total') {
                        const midTerms = academicYearFilteredGrades.filter((g) => g.studentId === s.id && g.examType === 'Midterm');
                        const finals = academicYearFilteredGrades.filter((g) => g.studentId === s.id && g.examType === 'Final');
                        const subjects = Array.from(new Set([...midTerms.map(g => g.subject), ...finals.map(g => g.subject)]));
                        
                        studentGrades = subjects.map(sub => {
                          const midG = midTerms.find(g => g.subject === sub);
                          const finG = finals.find(g => g.subject === sub);
                          const score = (midG ? midG.score : 0) + (finG ? finG.score : 0);
                          const percentage = score; 
                          let gradeLetter = 'F';
                          if (percentage >= 90) gradeLetter = 'A';
                          else if (percentage >= 80) gradeLetter = 'B';
                          else if (percentage >= 70) gradeLetter = 'C';
                          else if (percentage >= 60) gradeLetter = 'D';

                          return {
                            id: `TOT-${s.id}-${sub}`,
                            studentId: s.id,
                            subject: sub,
                            score,
                            gradeLetter,
                            examType: 'Final' as any,
                            date: new Date().toISOString()
                          };
                        });
                      } else {
                        studentGrades = academicYearFilteredGrades.filter((g) => g.studentId === s.id && g.examType === selectedExamTypeFilter);
                      }

                      const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
                      const averageRaw = studentGrades.length > 0 ? totalScore / studentGrades.length : 0;
                      // Midterm/Final max per subject is 50. Total is 100.
                      const maxPerSubject = selectedExamTypeFilter === 'Total' ? 100 : 50;
                      const averagePct = maxPerSubject === 50 ? averageRaw * 2 : averageRaw;
                      const maxPossibleScore = studentGrades.length * maxPerSubject;

                      return {
                        ...s,
                        totalScore,
                        maxPossibleScore,
                        averagePct,
                        gradesCount: studentGrades.length,
                        gradesList: studentGrades
                      };
                    })
                    .sort((a, b) => b.totalScore - a.totalScore);

                  if (sortedStudentsByResult.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          Maba jiraan natiijooyin ladiwaan geliyay ama u dhigmo baaritaankaaga.
                        </td>
                      </tr>
                    );
                  }

                  return sortedStudentsByResult.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 text-center font-mono">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          index === 0
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 font-black'
                            : index === 1
                            ? 'bg-slate-200 text-slate-700 border border-slate-300 font-gray-800'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'text-slate-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {entry.name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{entry.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{entry.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">
                        {entry.grade} - {entry.section}
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-700">
                        {entry.gradesCount} maado
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          entry.averagePct >= 90
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : entry.averagePct >= 75
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : entry.averagePct >= 50
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {entry.averagePct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-700">
                        {entry.gpa.toFixed(2)}
                      </td>
                      <td className="p-4 text-center font-mono font-black text-sm bg-indigo-50/50 text-indigo-950">
                        {entry.totalScore} / {entry.maxPossibleScore}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentResults(entry as any)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5" /> Beddel / Arag
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'parents' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          {/* Header section with Abuur button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                Maamulka & Diiwaan-galinta Waalidiinta (Parents Directory & Accounts)
              </h3>
              <p className="text-xs text-slate-400">
                Halkan ku maamul xisaabaadka waalidiinta, dhalashada caruurta, ku xir ardayda dugsiga iyo xogtooda maaliyadeed.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setNewParentName('');
                setNewParentUsername('');
                setNewParentPassword('');
                setNewParentEmail('');
                setSelectedChildIds([]);
                setParentStudentSearch('');
                setShowParentModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" /> Abuur Waalid Cusub (Parent Form)
            </button>
          </div>

          {/* Quick Metrics for Parents Tab */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">GUIDE / CODES</span>
              <p className="text-xs font-bold text-slate-700 mt-1">Sida mobile loogu galo:</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Waalid kasta wuxuu dashboard-ka ka soo geli karaa mobile/screen kasta isagoo isticmaalaya username iyo password la siiyay.
              </p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex flex-col justify-center">
              <span className="text-[10px] text-emerald-700 font-extrabold uppercase block tracking-wider">WAALIDINTA DIIWAANGASHAN</span>
              <span className="text-xl font-bold text-slate-800 mt-0.5">{users.filter(u => u.role === 'Parent').length} Waalid</span>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex flex-col justify-center">
              <span className="text-[10px] text-blue-700 font-extrabold uppercase block tracking-wider">ARDAYDA U XIRAN</span>
              <span className="text-xl font-bold text-slate-800 mt-0.5">
                {students.filter(s => s.parentEmail).length} Arday linked ah
              </span>
            </div>
          </div>

          {/* Search/Filter bar for parents page */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ku baar magaca waalidka ama username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 font-medium"
            />
          </div>

          {/* List/Table of Parents */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">SN</th>
                  <th className="p-4">Waalidka (Parent Profile)</th>
                  <th className="p-4">Xogta Loginka Mobile (Contact & Credentials)</th>
                  <th className="p-4">Caruurta u Xiran (Linked Children)</th>
                  <th className="p-4 text-center">Xaaladda (Status)</th>
                  <th className="p-4 text-center">Ficilada (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(() => {
                  const parentUsers = users.filter((u) => {
                    if (u.role !== 'Parent') return false;
                    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
                  });

                  if (parentUsers.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          Wali ma jiraan waalidiin u dhigma baaristaada.
                        </td>
                      </tr>
                    );
                  }

                  return parentUsers.map((parent, idx) => {
                    // Match children linked to this parent (by parent email, username, or name)
                    const linkedKids = students.filter((s) => {
                      const pEmail = parent.email?.trim().toLowerCase();
                      const pName = parent.name.trim().toLowerCase();
                      const pUser = parent.username.trim().toLowerCase();
                      
                      const sParentEmail = s.parentEmail?.trim().toLowerCase();
                      const sParentName = s.parentName?.trim().toLowerCase();
                      
                      if (pEmail && sParentEmail === pEmail) return true;
                      if (pUser && sParentEmail === pUser) return true;
                      if (pUser && sParentEmail === `${pUser}@gmail.com`) return true;
                      if (pName && sParentName === pName) return true;
                      return false;
                    });

                    return (
                      <tr key={parent.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-bold text-slate-905 text-slate-905">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                              {parent.name.charAt(0)}
                            </span>
                            <div>
                              <span className="block font-bold text-slate-800">{parent.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono uppercase">{parent.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-400">Email:</span>
                            <span className="font-bold">{parent.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-semibold text-slate-400">Username:</span>
                            <span className="font-mono bg-slate-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">{parent.username}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-semibold text-slate-400">Password:</span>
                            <span className="font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{parent.password}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {linkedKids.length === 0 ? (
                            <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg font-bold">
                              ⚠️ Caruur kuma xirna
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 md:max-w-xs">
                              {linkedKids.map(kid => (
                                <span 
                                  key={kid.id} 
                                  className="text-[10px] bg-slate-100 border border-slate-200/50 hover:bg-slate-150 text-slate-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors"
                                >
                                  <GraduationCap className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {kid.name} ({kid.grade})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                            parent.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-250 border-rose-200'
                          }`}>
                            {parent.status === 'Active' ? '● Active' : '● Cancelled'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Update User info */}
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateUser) {
                                  setPasswordModal({
                                    isOpen: true,
                                    user: parent,
                                    newPass: parent.password
                                  });
                                }
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-all border border-indigo-100 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" /> Beddel Pass
                            </button>

                            {onDeleteUser && (
                              <button
                                type="button"
                                onClick={() => {
                                  requestConfirmation(
                                    'Tirtirista Akoonka Waalidka',
                                    `Ma hubtaa inaad tirtirto akoonka waalidka: ${parent.name}?`,
                                    () => {
                                      onDeleteUser(parent.id);
                                    }
                                  );
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-all border border-red-100 cursor-pointer inline-flex items-center gap-0.5"
                              >
                                <Trash2 className="w-3 h-3" /> Tirtir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Maamulka Xisaabaadka Staff-ka (Staff Accounts & Security)
              </h3>
              <p className="text-xs text-slate-400">
                Ugu talagay maamulaha si uu u beddelo password-ka maamulka iyo macallimiinta, u xayiro/u joojiyo (cancel) isticmaalayaasha, ama u abuuro xisaab macallin cusub.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewTchName('');
                  setNewTchUsername('');
                  setNewTchPassword('');
                  setNewTchEmail('');
                  setNewTchPhone('');
                  setNewTchSubject('MATH');
                  setNewTchClasses(['Grade 10 - A']);
                  setNewTchSalary(6500);
                  setShowTeacherModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Plus className="w-4 h-4" /> Abuur Macallin (Teacher Form)
              </button>

            </div>
          </div>

          {/* Search/Filter Bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ku baar magaca ama username-ka..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 font-medium"
            />
          </div>

          {/* List of Users */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">SN</th>
                  <th className="p-4">Magaca Staff-ka (Name)</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Password (Heli karo)</th>
                  <th className="p-4 text-center">Doorka (Role)</th>
                  <th className="p-4 text-center">Xaaladda (Status)</th>
                  <th className="p-4 text-center">Ficilada (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(() => {
                  const filteredUsers = users.filter((u) => {
                    if (u.role === 'Parent') return false; // Exclude parents from Staff view
                    const math = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 u.username.toLowerCase().includes(searchQuery.toLowerCase());
                    return math;
                  });

                  if (filteredUsers.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Ma jiraan wax xisaabaad ah oo u dhigma baaristaada.
                        </td>
                      </tr>
                    );
                  }

                  return filteredUsers.map((usr, idx) => (
                    <tr key={usr.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-805 text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {usr.name.charAt(0)}
                          </span>
                          <div>
                            <span className="block font-bold text-slate-800">{usr.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono uppercase">{usr.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        <span className="bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded font-mono text-xs">{usr.username}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-700">
                        <span className="bg-indigo-50/50 border border-indigo-100/30 px-2 py-1 rounded text-xs">
                          {usr.password}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                          usr.role === 'Admin'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : usr.role === 'Teacher'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {usr.role === 'Admin' 
                            ? '💎 Maamule (Admin)' 
                            : usr.role === 'Teacher' 
                            ? '👨‍🏫 Macallin (Teacher)' 
                            : '🏡 Waalid (Parent)'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                          usr.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {usr.status === 'Active' ? 'Active (Hawlgala)' : 'Cancelled (Laga Joojiyay)'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser({ ...usr })}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Beddel
                          </button>
                          
                          {usr.username !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetStatus = usr.status === 'Active' ? 'Cancelled' : 'Active';
                                const msg = usr.status === 'Active' 
                                  ? `Ma hubtaa inaad XANIBTO (Cancel) login-ka: ${usr.name}? Ma awoodi doono inuu soo galo.`
                                  : `Ma hubtaa inaad FIRISO (Activate) login-ka: ${usr.name}?`;
                                requestConfirmation(
                                  usr.status === 'Active' ? 'Xanibaadda Akoonka' : 'Ogolaanshaha Akoonka',
                                  msg,
                                  () => {
                                    onUpdateUser({
                                      ...usr,
                                      status: targetStatus
                                    });
                                  }
                                );
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                                usr.status === 'Active'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              {usr.status === 'Active' ? 'Cancel User' : 'U Ogolaan'}
                            </button>
                          )}

                          {usr.username !== 'admin' && onDeleteUser && (
                            <button
                              type="button"
                              onClick={() => {
                                requestConfirmation(
                                  'Tirtirista Login-ka',
                                  `Ma hubtaa inaad gabi ahaanba JAASTID/TIRTIRTID (Delete) login-ka: ${usr.name}?`,
                                  () => {
                                    onDeleteUser(usr.id);
                                  }
                                );
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all border border-red-100 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Tirtir Login
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase border border-indigo-500/20">
                School Live Operation Monitor
              </span>
              <h3 className="font-bold text-xl md:text-2xl font-sans tracking-tight">Kormeerka & Diiwaanka System-ka (Live Logs)</h3>
              <p className="text-xs text-slate-400">Dhamaan shaqooyinka ka socda dugsiga: Xadirinta, Lacag-bixinta, iyo Natiijada macalimiinta ee live-ka ah.</p>
            </div>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 relative z-10">
              <div className="p-3 bg-slate-800/80 border border-slate-700/50 rounded-xl min-w-[130px] shadow-inner text-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Xadirintii Ugu Dambeysay</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5 text-xs font-mono font-bold text-indigo-300">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>Maanta 08:30 AM</span>
                </div>
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700/50 rounded-xl min-w-[130px] shadow-inner text-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Macalimiinta Hadda Active</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-xs font-mono font-bold text-emerald-400">3 Macallin</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live active sessions of teachers */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Macalimiinta Nidaamka ku Jira (Live Sessions)</h4>
                  <p className="text-xs text-slate-400 font-sans">Liiska macallimiinta hadda firfircoon iyo shaqada ay dhab ahaan wadaan ee live-ka ah.</p>
                </div>

                <div className="space-y-3.5">
                  {teachers.filter((t) => t.status === 'Active').slice(0, 3).map((tch, index) => {
                    const initials = tch.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const borderColors = index === 0 
                      ? 'border-indigo-50/70 bg-gradient-to-br from-indigo-50/30 to-white' 
                      : (index === 1 
                        ? 'border-emerald-50/70 bg-gradient-to-br from-emerald-50/30 to-white'
                        : 'border-slate-100 bg-slate-50/50');
                    const badgeClasses = index === 0
                      ? 'text-indigo-600 bg-indigo-50'
                      : (index === 1
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-amber-600 bg-amber-50');
                    const activityDot = index === 0
                      ? 'bg-indigo-500'
                      : (index === 1
                        ? 'bg-emerald-500'
                        : 'bg-amber-500');
                    const statusText = index === 2 ? 'Idle' : 'Active';

                    const actions = [
                      'Waxay xareyneysaa buundooyinka fasalka.',
                      'Wuxuu xadirinayaa Ardayda fasalka.',
                      'Waxay daabaceysaa ogeysiis kusaabsan shaqada guriga.',
                      'Wuxuu sameynayaa diyaarinta casharada guud.',
                    ];
                    const action = actions[index % actions.length];

                    return (
                      <div key={tch.id} className={`p-3.5 rounded-xl border flex gap-3 ${borderColors}`}>
                        {tch.avatar ? (
                          <img referrerPolicy="no-referrer" src={tch.avatar} alt={tch.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 self-start" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 self-start border border-slate-200">
                            {initials}
                          </div>
                        )}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">{tch.name}</span>
                            <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${badgeClasses}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${activityDot} animate-pulse`} /> {statusText}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-700 font-medium">Fasalka: {tch.assignedClass} • {tch.subject}</p>
                          <p className="text-[10px] text-slate-400">Hawsha: {action}</p>
                          <p className="text-[9px] text-slate-500 flex items-center gap-1 font-mono mt-1">
                            <Clock className="w-2.5 h-2.5" /> {index === 0 ? 'Hadda' : `${index * 12 + 5} daqiiqo ka hor`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real Log Entry Panel */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Diiwaan Geli Dhacdo Cusub (Add Activity Log)</h4>
                  <p className="text-xs text-slate-500">U isticmaal foomkaan si aad u diiwaangeliso hawl rasmi ah oo ka dhacday dugsiga si ay ugu dhowaato sooyaalka.</p>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const operator = (target.elements.namedItem('operator') as HTMLInputElement).value || 'Admin Operator';
                  const category = (target.elements.namedItem('category') as HTMLSelectElement).value as 'Attendance' | 'Grade' | 'Payment' | 'System';
                  const description = (target.elements.namedItem('description') as HTMLTextAreaElement).value;
                  const role = (target.elements.namedItem('role') as HTMLSelectElement).value;

                  if (!description) return;

                  if (onAddLog) {
                    onAddLog({
                      id: `LOG-${Math.floor(Math.random() * 900000 + 100000)}`,
                      timestamp: new Date().toISOString(),
                      operator: operator,
                      role: role,
                      category: category === 'System' ? 'System' : category,
                      description: description,
                      academicYear: '2026-2027',
                      status: 'Completed'
                    });
                  }
                  target.reset();
                }} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Magaca Shaqaalaha / Operator *</label>
                    <input
                      name="operator"
                      type="text"
                      required
                      placeholder="Tusaale: Musab Abdi"
                      className="w-full p-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nooca Qeybta / Category *</label>
                      <select name="category" className="w-full p-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs">
                        <option value="Attendance">Attendance (Xadirinta)</option>
                        <option value="Grade">Grade (Natiijada)</option>
                        <option value="Payment">Payment (Lacag bixinta)</option>
                        <option value="System">System (Maamulka)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Booska Operator / Role *</label>
                      <select name="role" className="w-full p-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs">
                        <option value="Admin">Admin</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Parent">Parent</option>
                        <option value="Student">Student</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Faahfaahinta / Activity Description *</label>
                    <textarea
                      name="description"
                      rows={2}
                      required
                      placeholder="Faahfaahin ku saabsan waxa dhacay..."
                      className="w-full p-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 border border-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    Diiwaangeli Hawsha (Save Official Log)
                  </button>
                </form>
              </div>
            </div>

            {/* Main Log Table Filter */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Dhamaan Logs-ka Dhaqdhaqaaqa (Activity Registry)</h4>
                    <p className="text-xs text-slate-400">Diiwaanka sooyaalka nidaamka oo dhan.</p>
                  </div>

                  {/* Search logs */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Baar logs-ka hawsha..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Log Feed Flow */}
                <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                  {logs
                    .filter(log => {
                      if (!searchQuery) return true;
                      return (
                        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.category.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                    })
                    .slice()
                    .reverse()
                    .map((log) => {
                      const isCompleted = log.status === 'Completed';
                      return (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white flex items-start gap-3.5 transition-all"
                        >
                          {/* Badge indicator */}
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            log.category === 'Attendance'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : log.category === 'Grade'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {log.category === 'Attendance' ? (
                              <Users className="w-4 h-4" />
                            ) : log.category === 'Grade' ? (
                              <GraduationCap className="w-4 h-4" />
                            ) : (
                              <DollarSign className="w-4 h-4" />
                            )}
                          </div>

                           <div className="flex-1 min-w-0 space-y-1">
                             <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                               <span className="text-xs font-bold text-slate-800">
                                 {log.operator} <span className="font-normal text-slate-400 font-sans">({log.role})</span>
                               </span>
                               <div className="flex items-center gap-1.5">
                                 <span className="text-[10px] text-slate-500 font-mono">
                                   {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                                 </span>
                                 {onDeleteLog && (
                                   <button
                                     onClick={() => {
                                       requestConfirmation(
                                         'Tirtirista Log-ga',
                                         'Ma xaqiiqsan tahay inaad tirtirto diiwaankaan (log-kaan)?',
                                         () => {
                                           onDeleteLog(log.id);
                                         }
                                       );
                                     }}
                                     className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer transition-colors"
                                     title="Tirtir Log"
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </button>
                                 )}
                               </div>
                             </div>
                             <p className="text-xs text-slate-700 font-medium leading-relaxed">{log.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full uppercase border border-slate-200">
                                {log.category}
                              </span>
                              {log.academicYear && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full uppercase border border-slate-200">
                                  {log.academicYear}
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {logs.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1.5 animate-pulse" />
                      Qeybtaan wali wax logs ah kuma jiraan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in" id="admin-calendar-view">
          <SchoolCalendar
            virtualClasses={virtualClasses}
            announcements={announcements}
            fees={fees}
            role="Admin"
          />
        </div>
      )}

      {activeTab === 'schedules' && (() => {
        const uniqueYears = Array.from(new Set([
          '2026-2027',
          '2027-2028',
          ...schedules.map(s => s.academicYear)
        ]));

        const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
        const PERIOD_RANGE = [1, 2, 3, 4, 5, 6, 7];

        const currentClassSchedules = schedules.filter(
          s => s.grade === selectedClass && s.academicYear === selectedYear
        );

        const handleCellChange = (day: string, period: number, field: 'subject' | 'teacherName', value: string) => {
          setLocalSchedules(prev => prev.map(item => {
            if (item.day === day && item.periodIndex === period) {
              return { ...item, [field]: value };
            }
            return item;
          }));
        };

        const handleSave = () => {
          const otherSchedules = schedules.filter(
            s => !(s.grade === selectedClass && s.academicYear === selectedYear)
          );
          const merged = [...otherSchedules, ...localSchedules];
          if (onUpdateSchedule) {
            onUpdateSchedule(merged);
            alert('Jadwalka xiisadaha waa la kaydiyay si guul leh!');
          }
        };

        const handleAddNewYear = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newYearInput.trim()) return;
          setSelectedYear(newYearInput.trim());
          setNewYearInput('');
          setShowNewYearForm(false);
        };

        const handleCopyTimetable = () => {
          if (!copyTargetClass || copyTargetClass === selectedClass) {
            alert('Fadlan dooro fasal kale oo ka duwan kan hadda la doortay si loo koobiyeeyo!');
            return;
          }
          if (window.confirm(`Ma hubtaa inaad rabto inaad jadwalka ${selectedClass} u nuquliso (Copy) ${copyTargetClass} ee sanadka ${selectedYear}?`)) {
            const sourceSchedules = currentClassSchedules.length > 0 ? currentClassSchedules : localSchedules;
            const copied = sourceSchedules.map(s => ({
              ...s,
              id: `SCH-${copyTargetClass.replace(/\s+/g, '')}-${s.day}-${s.periodIndex}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              grade: copyTargetClass
            }));
            const otherSchedules = schedules.filter(
              s => !(s.grade === copyTargetClass && s.academicYear === selectedYear)
            );
            if (onUpdateSchedule) {
              onUpdateSchedule([...otherSchedules, ...copied]);
              alert(`Jadwalkii ${selectedClass} waxaa loo koobiyeeyay ${copyTargetClass} si guul leh!`);
            }
          }
        };

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header section */}
            <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase border border-indigo-500/20">
                  School Schedule Manager
                </span>
                <h3 className="font-bold text-xl md:text-2xl font-sans tracking-tight">Qorshaynta & Gelinta Jadwalka Xiisadaha</h3>
                <p className="text-xs text-slate-400">U Samee jadwal dhameystiran fasal kasta (5 maalin, 7 xiisadood maalinkastana).</p>
              </div>
            </div>

            {/* --- VISUAL CLASS-WISE SCHEDULE OVERVIEW STATUS PANEL (User requested to see which classes have active schedules) --- */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" /> Fasallada uu Jadwalku Khuseeyo & Xaaladdooda (Connected Classes Status)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Riix fasal kasta si aad toos ugu beddelato, ugana shaqeyso jadwalkiisa. Fasalada leh jadwal buuxa waxay leeyihiin calaamad cagaaran.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {addedClasses.map((cls) => {
                  const numSlots = schedules.filter(s => s.grade === cls && s.academicYear === selectedYear && s.subject).length;
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`p-3 rounded-xl border text-left transition duration-200 cursor-pointer hover:shadow-sm ${
                        isSelected
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 ring-1 ring-indigo-200'
                          : 'bg-slate-50/40 border-slate-150 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black block leading-tight">{cls}</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${numSlots > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-1 block">
                        {numSlots > 0 ? `📊 ${numSlots} xiisadood` : '⚠️ Ma jiro jadwal'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic class creation form */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] text-slate-500 font-medium">
                  ➕ Haddii fasalku uusan kor ku jirin, halkan kaga dar liiska jadwalada (Add Class to Schedule list):
                </p>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newClassInput.trim()) return;
                    const formatted = newClassInput.trim();
                    if (addedClasses.includes(formatted)) {
                      alert('Fasalkani mar hore ayuu ku jiray liiska!');
                      return;
                    }
                    
                    // Add to local classes list and select it
                    setAddedClasses(prev => [...prev, formatted]);
                    setSelectedClass(formatted);
                    setNewClassInput('');

                    // Create and immediately save blank schedule records to PostgreSQL database for full durability
                    const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
                    const PERIOD_RANGE = [1, 2, 3, 4, 5, 6, 7];
                    const blankSchedules: SchedulePeriod[] = [];
                    const timestamp = Date.now();
                    
                    DAYS.forEach(day => {
                      PERIOD_RANGE.forEach(period => {
                        blankSchedules.push({
                          id: `SCH-${formatted.replace(/\s+/g, '')}-${day}-${period}-${timestamp}`,
                          grade: formatted,
                          academicYear: selectedYear,
                          day,
                          periodIndex: period,
                          subject: '',
                          teacherName: ''
                        });
                      });
                    });

                    // Add to VirtualClasses if supported
                    if (onAddVirtualClass) {
                      onAddVirtualClass({
                        id: `vc-${Date.now()}`,
                        subject: formatted,
                        grade: formatted,
                        teacherName: 'Maamulka',
                        topic: `Fasal cusub: ${formatted}`,
                        dateTime: 'Scheduled',
                        meetUrl: 'https://meet.google.com/',
                        isLive: false
                      });
                    }

                    if (onUpdateSchedule) {
                      onUpdateSchedule([...schedules, ...blankSchedules]);
                    }
                  }}
                  className="flex gap-2 max-w-sm"
                >
                  <input 
                    type="text" 
                    value={newClassInput}
                    onChange={(e) => setNewClassInput(e.target.value)}
                    placeholder="Tusaale: Grade 11 - C"
                    className="bg-white border border-slate-250 text-slate-800 text-xs rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                  >
                    + Kudar Fasal
                  </button>
                </form>
              </div>

              {/* Fast Replicate/Copy Timetable tool */}
              <div className="p-3.5 bg-indigo-50/40 border border-indigo-100/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h5 className="text-[11.5px] font-bold text-slate-800">Nuqul Samee (Quick Copy Timetable Utility)</h5>
                  <p className="text-[10px] text-slate-400">Ku koobiyeey dhammaan jadwalka fasalka hadda la doortay ({selectedClass}) fasal kale.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={copyTargetClass}
                    onChange={(e) => setCopyTargetClass(e.target.value)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-bold outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Dooro Fasal Kale --</option>
                    {addedClasses.filter(c => c !== selectedClass).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleCopyTimetable}
                    disabled={!copyTargetClass}
                    className="p-1.5 px-4 bg-indigo-900 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    Nuqul Samee
                  </button>
                </div>
              </div>
            </div>

            {/* Selector Card and Tools */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Select Class */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Gacanta ku Dooro Fasalka (Manual Select)</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {addedClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Year */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Sanad-dugsiyeedka (Academic Year)</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {uniqueYears.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewYearForm(!showNewYearForm)}
                    className="px-3.5 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                  >
                    + Ku Dar Sanad Cusub
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    Kaydi Jadwalka (Save Timetable)
                  </button>
                </div>
              </div>

              {showNewYearForm && (
                <form onSubmit={handleAddNewYear} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/60 flex items-center gap-3 max-w-md animate-fade-in">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">Ku dar Sanad Dugsiyeed Cusub</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 2027-2028"
                      value={newYearInput}
                      onChange={(e) => setNewYearInput(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                  <div className="flex items-end gap-1.5 pt-4">
                    <button
                      type="submit"
                      className="p-2 px-4 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Ku Dar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewYearForm(false)}
                      className="p-2 px-3 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Buri
                    </button>
                  </div>
                </form>
              )}

              {/* Grid 5 Days x 7 Periods Form */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full border-collapse text-left text-xs text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-center">
                      <th className="p-3.5 font-bold uppercase text-slate-400 text-[10px] border-r border-slate-100 w-24">Xiisadaha</th>
                      {DAYS.map(day => (
                        <th key={day} className="p-3.5 font-black text-indigo-900 uppercase tracking-wide border-r border-slate-100">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PERIOD_RANGE.map(period => (
                      <tr key={period} className="hover:bg-slate-50/40 transition-all">
                        <td className="p-3.5 font-extrabold text-slate-800 bg-slate-50 border-r border-slate-100 text-center">
                          <span className="block text-[11px]">Xiisada {period}</span>
                          <span className="block text-[9px] text-slate-400 font-mono">Period {period}</span>
                        </td>
                        {DAYS.map(day => {
                          const cell = localSchedules.find(s => s.day === day && s.periodIndex === period);
                          return (
                            <td key={day} className="p-3 border-r border-slate-150 align-top min-w-[170px] text-center">
                              <div className="space-y-2">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] font-bold text-slate-400 block text-left uppercase">Maddada:</span>
                                  <input
                                    type="text"
                                    placeholder="e.g. SOMALI, MATH"
                                    value={cell?.subject || ''}
                                    onChange={(e) => handleCellChange(day, period, 'subject', e.target.value)}
                                    className="w-full p-1.5 px-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded text-xs font-bold outline-none focus:border-indigo-500"
                                  />
                                </div>

                                <div className="space-y-0.5">
                                  <span className="text-[8px] font-bold text-slate-400 block text-left uppercase">Macallinka:</span>
                                  <select
                                    value={cell?.teacherName || ''}
                                    onChange={(e) => handleCellChange(day, period, 'teacherName', e.target.value)}
                                    className="w-full p-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-[11px] outline-none focus:border-indigo-500 cursor-pointer"
                                  >
                                    <option value="">-- Dooro Macallinka --</option>
                                    {teachers.map(t => (
                                      <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>
                                    ))}
                                    <option value="Staff Member">Staff Member</option>
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="Ama gacanta ku qor magac kale..."
                                    value={teachers.some(t => t.name === cell?.teacherName) || !cell?.teacherName ? '' : cell.teacherName}
                                    onChange={(e) => handleCellChange(day, period, 'teacherName', e.target.value)}
                                    className="w-full p-1 px-1.5 bg-slate-50 border border-slate-100 rounded text-[10px] outline-none mt-1 focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action bar */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Kaydi Dhammaan Isbedelada (Save Timetable)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* STUDENT REGISTRATION INTERACTIVE MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowStudentModal(false)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
              <span>Student Registration Form</span>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleStudentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SCHOLAR FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="Liam Vance, etc."
                    value={newStuName}
                    onChange={(e) => setNewStuName(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">REQUIRED FEES ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1500"
                    value={newStuFees}
                    onChange={(e) => setNewStuFees(Number(e.target.value))}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">GRADE LEVEL</label>
                  <select
                    value={newStuGrade}
                    onChange={(e) => setNewStuGrade(e.target.value)}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SECTION</label>
                  <select
                    value={newStuSection}
                    onChange={(e) => setNewStuSection(e.target.value)}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="A">Section A (Homeroom)</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PARENT FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="David Jenkins"
                    value={newStuParentName}
                    onChange={(e) => setNewStuParentName(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PARENT PHONE NUMBER *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. (555) 124-5832"
                    value={newStuParentPhone}
                    onChange={(e) => setNewStuParentPhone(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">RESIDENTIAL STREET ADDRESS</label>
                <input
                  type="text"
                  placeholder="34 Ocean View Blvd, CA 94021"
                  value={newStuAddress}
                  onChange={(e) => setNewStuAddress(e.target.value)}
                  className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Register Scholar Record
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* TEACHER APPOINTMENT INTERACTIVE MODAL */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTeacherModal(false)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10 max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center shrink-0">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Diiwaangelinta Macallinka Cusub (Appoint Instructor)
              </span>
              <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleTeacherSubmit} className="p-6 space-y-4 overflow-y-auto text-left flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAGACA MACALLINKA (FULL NAME) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. Richard Feynman"
                    value={newTchName}
                    onChange={(e) => setNewTchName(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">GMAIL-KA LOGIN-KA (TEACHER GMAIL) *</label>
                  <input
                    type="email"
                    required
                    placeholder="macallin@gmail.com"
                    value={newTchEmail}
                    onChange={(e) => {
                      setNewTchEmail(e.target.value);
                      setNewTchUsername(e.target.value);
                    }}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAADADA MACALLINKA (SUBJECT) *</label>
                  <select
                    value={newTchSubject}
                    onChange={(e) => setNewTchSubject(e.target.value)}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none font-medium focus:ring-2 focus:ring-slate-200"
                  >
                    {['TARBIYO', 'ARABIC', 'SOMALI', 'MATH', 'TECHNOLOGY', 'BUSSINESS', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH', 'TARIIKH', 'JOGURAFI'].map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">FASALADA UU MACALLINKA DHIGO (ASSIGNED CLASSES) *</label>
                  <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Dooro dhammaan fasalada u dhigayo:</p>
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-36 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).flatMap((g) => {
                        const clsA = `Grade ${g} - A`;
                        const clsB = `Grade ${g} - B`;
                        return [clsA, clsB];
                      }).map((cls) => {
                        const isChecked = newTchClasses.includes(cls);
                        return (
                          <label key={cls} className={`flex items-center gap-1.5 p-1.5 rounded-md border text-[11px] font-semibold cursor-pointer select-none transition-all ${
                            isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTchClasses(prev => [...prev, cls]);
                                } else {
                                  setNewTchClasses(prev => prev.filter(c => c !== cls));
                                }
                              }}
                              className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <span>{cls.replace('Grade ', 'G')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">TELEFOONKA (PHONE)</label>
                  <input
                    type="text"
                    placeholder="(555) 303-1122"
                    value={newTchPhone}
                    onChange={(e) => setNewTchPhone(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MUSHAARKA (MONTHLY SALARY $) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Monthly standard salary"
                    value={newTchSalary}
                    onChange={(e) => setNewTchSalary(Number(e.target.value))}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              {/* Secure Passwords & Accounts details added */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-bold text-indigo-650 text-xs uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Xogta Akoonka Login-ka (Teacher Login Credentials)
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">LOGIN USERNAME (GMAIL) *</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Geli Gmail-ka sare..."
                      value={newTchEmail}
                      className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-2.5 text-xs font-bold font-mono focus:outline-none"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Sida loo qoray Gmail-ka sare.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 font-mono">PASSWORD *</label>
                    <input
                      type="text"
                      required
                      placeholder="Geli Password..."
                      value={newTchPassword}
                      onChange={(e) => setNewTchPassword(e.target.value)}
                      className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Abuur Macallinka & Akoonka Login-ka
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* PARENT REGISTRATION INTERACTIVE MODAL */}
      {showParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowParentModal(false)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10 max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center shrink-0">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Diiwaangelinta Waalidka Cusub (Parent Registration Form)
              </span>
              <button type="button" onClick={() => setShowParentModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleParentSubmit} className="p-6 space-y-4 overflow-y-auto text-left flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAGACA WAALIDKA (PARENT FULL NAME) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tusaale: Ahmed Farah Abdi"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">GMAIL-KA WAALIDKA (PARENT GMAIL) *</label>
                  <input
                    type="email"
                    required
                    placeholder="waalidka@gmail.com"
                    value={newParentEmail}
                    onChange={(e) => {
                      setNewParentEmail(e.target.value);
                      setNewParentUsername(e.target.value);
                    }}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              {/* Child Student Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  XULO CARUURTA (LINK WARD / STUDENTS) *
                </label>
                <p className="text-[10px] text-slate-400 font-medium">U dooro mid ama dhowr arday oo uu waalidan ka mas'uul yahay (xitaa haddii ay kala fasal yihiin):</p>
                
                {/* Interactive Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ka raadi magaca ardayga, fasalka ama ID..."
                    value={parentStudentSearch}
                    onChange={(e) => setParentStudentSearch(e.target.value)}
                    className="w-full text-slate-850 bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  {parentStudentSearch && (
                    <button
                      type="button"
                      onClick={() => setParentStudentSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 text-xs font-bold font-sans"
                    >
                      Kiriiri
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto space-y-1.5 shadow-inner">
                  {(students || []).filter(s => {
                    if (!parentStudentSearch.trim()) return true;
                    const q = parentStudentSearch.toLowerCase().trim();
                    return s.name.toLowerCase().includes(q) || 
                           s.id.toLowerCase().includes(q) || 
                           s.grade.toLowerCase().includes(q) ||
                           (s.section && s.section.toLowerCase().includes(q));
                  }).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      Student laga helay ma jiro raadintaada: "{parentStudentSearch}"
                    </div>
                  ) : (
                    (students || []).filter(s => {
                      if (!parentStudentSearch.trim()) return true;
                      const q = parentStudentSearch.toLowerCase().trim();
                      return s.name.toLowerCase().includes(q) || 
                             s.id.toLowerCase().includes(q) || 
                             s.grade.toLowerCase().includes(q) ||
                             (s.section && s.section.toLowerCase().includes(q));
                    }).map((student) => {
                      const isChecked = selectedChildIds.includes(student.id);
                      return (
                        <label 
                          key={student.id} 
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                            isChecked 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                              : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedChildIds(prev => [...prev, student.id]);
                                } else {
                                  setSelectedChildIds(prev => prev.filter(id => id !== student.id));
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                            />
                            <div>
                              <span className="block font-bold">{student.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono tracking-wider">{student.id}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-150 border border-slate-200/50 px-2 py-0.5 rounded-full text-slate-500 font-bold">
                            {student.grade} - {student.section}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Login Credentials */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-bold text-emerald-650 text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Xogta Akoonka Login-ka Waalidka (Parent Login Credentials)
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">LOGIN USERNAME (GMAIL) *</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Geli Gmail-ka sare..."
                      value={newParentEmail}
                      className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-2.5 text-xs font-bold font-mono focus:outline-none"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Sida loo qoray Gmail-ka sare.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">PASSWORD *</label>
                    <input
                      type="text"
                      required
                      placeholder="Geli Password..."
                      value={newParentPassword}
                      onChange={(e) => setNewParentPassword(e.target.value)}
                      className="w-full text-slate-800 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
                >
                  Abuur Waalidka & Akoonka Login-ka
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* BROADCAST BULLETIN INTERACTIVE MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAnnModal(false)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
              <span>Compose School Broadcast BULLETIN</span>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleAnnSubmit} className="p-6 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">BULLETIN TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="School closure, upcoming examinations, sports matches..."
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">BULLETIN CLASSIFICATION</label>
                  <select
                    value={newAnnCategory}
                    onChange={(e) => setNewAnnCategory(e.target.value as any)}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="Academic">Academic Schedule</option>
                    <option value="Administrative">Administrative Notification</option>
                    <option value="Event">Festivals & Sports Event</option>
                    <option value="Urgent">⚠️ Urgent Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">TARGET AUDIENCE RECIPIENT</label>
                  <select
                    value={newAnnAudience}
                    onChange={(e) => setNewAnnAudience(e.target.value as any)}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="All">All Audiences (General)</option>
                    <option value="Teachers">Faculty Staff Only</option>
                    <option value="Parents">Parents Circle</option>
                    <option value="Students">Scholars Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">BODY MEMORANDUM CONTENT *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear details of the bulletin standard guidelines..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Broadcast Bulletin Live
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* STUDENT EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingStudent(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
              <span>Wax ka badal Macluumaadka Ardayga (Edit Student)</span>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateStudent(editingStudent);
                setEditingStudent(null);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAGACA ARDAYGA (STUDENT NAME) *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">LACAGTA LAGA RABO (OUTSTANDING FEE) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingStudent.outstandingFees}
                    onChange={(e) => setEditingStudent({ ...editingStudent, outstandingFees: Number(e.target.value) })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">FALKA/DARASADA (GRADE)</label>
                  <select
                    value={editingStudent.grade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SECTION</label>
                  <select
                    value={editingStudent.section}
                    onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAGACA WAALIDKA (PARENT NAME) *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">TEL-KA WAALIDKA (PARENT PHONE) *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">GPA (Darajada)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    required
                    value={editingStudent.gpa}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gpa: parseFloat(e.target.value) || 0 })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">STATUS</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">CINWAANKA (ADDRESS)</label>
                <input
                  type="text"
                  value={editingStudent.address}
                  onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                  className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Ku Diiri Changes-ka (Save Changes)
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* TEACHER EDIT MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingTeacher(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
              <span>Wax ka badal Macallinka (Edit Teacher Info)</span>
              <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateTeacher(editingTeacher);
                setEditingTeacher(null);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MAGACA MACALLINKA *</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">EMAIL-KA MACALLINKA *</label>
                  <input
                    type="email"
                    required
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MADOOBADA/MAADADA (SUBJECT) *</label>
                  <select
                    value={editingTeacher.subject}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none font-medium"
                  >
                    {['TARBIYO', 'ARABIC', 'SOMALI', 'MATH', 'TECHNOLOGY', 'BUSSINESS', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH', 'TARIIKH', 'JOGURAFI'].map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">FASALADA UU MACALLINKA DHIGO (ASSIGNED CLASSES) *</label>
                  <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Dooro dhammaan fasalada u dhigayo:</p>
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-44 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).flatMap((g) => {
                        const clsA = `Grade ${g} - A`;
                        const clsB = `Grade ${g} - B`;
                        return [clsA, clsB];
                      }).map((cls) => {
                        const currentClasses = editingTeacher.assignedClass
                          ? editingTeacher.assignedClass.split(',').map(c => c.trim()).filter(Boolean)
                          : [];
                        const isChecked = currentClasses.includes(cls);
                        return (
                          <label key={cls} className={`flex items-center gap-1.5 p-1.5 rounded-md border text-[11px] font-semibold cursor-pointer select-none transition-all ${
                            isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated: string[];
                                if (e.target.checked) {
                                  updated = [...currentClasses, cls];
                                } else {
                                  updated = currentClasses.filter(c => c !== cls);
                                }
                                setEditingTeacher({
                                  ...editingTeacher,
                                  assignedClass: updated.join(', ')
                                });
                              }}
                              className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <span>{cls.replace('Grade ', 'G')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">TEL-KA MACALLINKA</label>
                  <input
                    type="text"
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">MUSHAAHAR ($) *</label>
                  <input
                    type="number"
                    required
                    value={editingTeacher.salary}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, salary: Number(e.target.value) })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">STATUS</label>
                <select
                  value={editingTeacher.status}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, status: e.target.value as any })}
                  className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Ku Diiri Macallinka (Save Changes)
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* FEE/INVOICE EDIT MODAL */}
      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingFee(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
              <span>Wax ka badal Qaansada/Bixinta (Edit Invoice #{editingFee.id})</span>
              <button onClick={() => setEditingFee(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateFee(editingFee);
                setEditingFee(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">CYNWAANKA BIILKA (BILLING TITLE) *</label>
                <input
                  type="text"
                  required
                  value={editingFee.title}
                  onChange={(e) => setEditingFee({ ...editingFee, title: e.target.value })}
                  className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">CADADKA LACAGTA (AMOUNT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingFee.amount}
                    onChange={(e) => setEditingFee({ ...editingFee, amount: Number(e.target.value) })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DUE DATE (Taariikhda Bixinta) *</label>
                  <input
                    type="date"
                    required
                    value={editingFee.dueDate}
                    onChange={(e) => setEditingFee({ ...editingFee, dueDate: e.target.value })}
                    className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">STATUS (XAALADDA)</label>
                  <select
                    value={editingFee.status}
                    onChange={(e) => setEditingFee({ ...editingFee, status: e.target.value as any })}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                {editingFee.status === 'Paid' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">QAABKA PAY-KA (PAYMENT METHOD)</label>
                    <input
                      type="text"
                      placeholder="e.g. Cash, EVC Plus, Zaad, Sahal"
                      value={editingFee.paymentMethod || ''}
                      onChange={(e) => setEditingFee({ ...editingFee, paymentMethod: e.target.value })}
                      className="w-full text-slate-800 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Ku Diiri Biilka (Save Changes)
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ADMIN STUDENT RESULTS DETAILED LIST MODAL */}
      {selectedStudentResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudentResults(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-900 text-white font-bold flex justify-between items-center">
              <div>
                <span className="block text-sm">Buundooyinka: {selectedStudentResults.name}</span>
                <span className="block text-[10px] text-slate-300 font-mono">ID: {selectedStudentResults.id} • Fasal: {selectedStudentResults.grade} - {selectedStudentResults.section}</span>
              </div>
              <button onClick={() => setSelectedStudentResults(null)} className="text-white hover:text-slate-200 text-xl font-bold">×</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                {(() => {
                  const list = (() => {
                    if (selectedExamTypeFilter === 'Total') {
                      const midTerms = grades.filter((g) => g.studentId === selectedStudentResults.id && g.examType === 'Midterm');
                      const finals = grades.filter((g) => g.studentId === selectedStudentResults.id && g.examType === 'Final');
                      const subjects = Array.from(new Set([...midTerms.map(g => g.subject), ...finals.map(g => g.subject)]));
                      return subjects.map(sub => {
                        const midG = midTerms.find(g => g.subject === sub);
                        const finG = finals.find(g => g.subject === sub);
                        const score = (midG ? midG.score : 0) + (finG ? finG.score : 0);
                        const pct = score;
                        let gradeLetter = 'F';
                        if (pct >= 90) gradeLetter = 'A';
                        else if (pct >= 80) gradeLetter = 'B';
                        else if (pct >= 70) gradeLetter = 'C';
                        else if (pct >= 60) gradeLetter = 'D';

                        return {
                          id: `TOT-${selectedStudentResults.id}-${sub}`,
                          subject: sub,
                          score,
                          gradeLetter,
                          examType: 'Wadarta (Total)' as any,
                          date: midG?.date || finG?.date || 'N/A'
                        };
                      });
                    } else {
                      return grades.filter((g) => g.studentId === selectedStudentResults.id && g.examType === selectedExamTypeFilter);
                    }
                  })();

                  const sum = list.reduce((acc, c) => acc + c.score, 0);
                  const isTotal = selectedExamTypeFilter === 'Total';
                  const maxVal = isTotal ? 100 : 50;
                  const totalPossible = list.length * maxVal;
                  const averagePct = list.length > 0 ? (isTotal ? (sum / list.length) : (sum / list.length) * 2) : 0;

                  return (
                    <>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Celceliska Boqolleyda (Average Pct)</p>
                        <p className="text-sm font-black text-slate-800">
                          {averagePct.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wadarta Buundooyinka (Total Score)</p>
                        <p className="text-sm font-black text-indigo-700 font-mono">
                          {sum} / {totalPossible}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Natiijooyinka la Sifeeyay ({selectedExamTypeFilter === 'Total' ? 'Wadarta Guud' : selectedExamTypeFilter})</h4>
                {(() => {
                  const list = (() => {
                    if (selectedExamTypeFilter === 'Total') {
                      const midTerms = grades.filter((g) => g.studentId === selectedStudentResults.id && g.examType === 'Midterm');
                      const finals = grades.filter((g) => g.studentId === selectedStudentResults.id && g.examType === 'Final');
                      const subjects = Array.from(new Set([...midTerms.map(g => g.subject), ...finals.map(g => g.subject)]));
                      return subjects.map(sub => {
                        const midG = midTerms.find(g => g.subject === sub);
                        const finG = finals.find(g => g.subject === sub);
                        const score = (midG ? midG.score : 0) + (finG ? finG.score : 0);
                        const pct = score;
                        let gradeLetter = 'F';
                        if (pct >= 90) gradeLetter = 'A';
                        else if (pct >= 80) gradeLetter = 'B';
                        else if (pct >= 70) gradeLetter = 'C';
                        else if (pct >= 60) gradeLetter = 'D';

                        return {
                          id: `TOT-${selectedStudentResults.id}-${sub}`,
                          subject: sub,
                          score,
                          gradeLetter,
                          examType: 'Wadarta (Total)' as any,
                          date: midG?.date || finG?.date || 'N/A'
                        };
                      });
                    } else {
                      return grades.filter((g) => g.studentId === selectedStudentResults.id && g.examType === selectedExamTypeFilter);
                    }
                  })();

                  if (list.length === 0) {
                    return <p className="text-xs text-slate-400 text-center py-6">Maba jiraan wax buundo ah oo u diiwaan-gashan.</p>;
                  }

                  return (
                    <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {list.map((grd) => (
                        <div key={grd.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800 uppercase block">{grd.subject}</span>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded">
                                {grd.examType}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">Diiwaan-geliyay: {grd.date}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-mono font-black text-slate-800 text-sm block">
                                {grd.score}{selectedExamTypeFilter === 'Total' ? '/100' : '/50'}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-mono font-bold block">Grade {grd.gradeLetter}</span>
                            </div>
                            {selectedExamTypeFilter !== 'Total' && (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingGrade(grd)}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  Beddel (Edit)
                                </button>
                                {onDeleteGrade && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      requestConfirmation(
                                        'Tirtirista Buundada',
                                        `Ma xaqiiqsan tahay inaad tirtirto buundada maadada ${grd.subject}?`,
                                        () => {
                                          onDeleteGrade(grd.id);
                                        }
                                      );
                                    }}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" /> Tirtir
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentResults(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs rounded-xl"
              >
                Xir (Close Window)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADMIN EDIT GRADE INDIVIDUAL MODAL */}
      {editingGrade && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setEditingGrade(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 z-10"
          >
            <div className="px-6 py-4 bg-indigo-900 text-white font-bold text-slate-800 flex justify-between items-center">
              <span>Wax ka Beddelka Buundada Ardayga</span>
              <button onClick={() => setEditingGrade(null)} className="text-white hover:text-slate-200 text-xl">×</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingGrade) return;
                const percentage = (Number(editingGrade.score) / 50) * 100;
                let letter = 'F';
                if (percentage >= 90) letter = 'A';
                else if (percentage >= 80) letter = 'B';
                else if (percentage >= 70) letter = 'C';
                else if (percentage >= 60) letter = 'D';

                onUpdateGrade({
                  ...editingGrade,
                  gradeLetter: letter
                });
                setEditingGrade(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">MAADADA (SUBJECT) *</label>
                <select
                  value={editingGrade.subject}
                  onChange={(e) => setEditingGrade({ ...editingGrade, subject: e.target.value })}
                  className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['TARBIYO', 'ARABIC', 'SOMALI', 'MATH', 'TECHNOLOGY', 'BUSSINESS', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH', 'TARIIKH', 'JOGURAFI'].map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">QAABKA IMTIXAANKA (EVALUATION TIER) *</label>
                <select
                  value={editingGrade.examType}
                  onChange={(e) => setEditingGrade({ ...editingGrade, examType: e.target.value as any })}
                  className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Midterm">Nus-Sanad (Midterm)</option>
                  <option value="Final">Dhamaadka Sano (Final)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">BUUNDADA (NUMERICAL SCORE 0-50) *</label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={editingGrade.score}
                    onChange={(e) => setEditingGrade({ ...editingGrade, score: Number(e.target.value) })}
                    className="flex-1 accent-indigo-900 cursor-pointer h-2 bg-slate-100 rounded-lg self-center"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editingGrade.score}
                    onChange={(e) => setEditingGrade({ ...editingGrade, score: Math.min(50, Math.max(0, Number(e.target.value))) })}
                    className="w-20 border border-slate-200 rounded-lg p-2 text-center text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Ka Sifay (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-indigo-900/10"
                >
                  Diiwaan-geli Buundada
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CLASS ROSTER TRANSCRIPT PRINTABLE MODAL */}
      {printableClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm print-modal-outer animate-fade-in animate-fade-in">
          <div className="absolute inset-0 cursor-pointer no-print" onClick={() => setPrintableClass(null)} />
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
          >
            {/* Modal Actions Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print py-3">
              <span className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600 font-bold" />
                Daaqadda Natiijooyinka (Class Transcript - Print Preview)
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs mr-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExamTypeFilter('Midterm')}
                    className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                      selectedExamTypeFilter === 'Midterm'
                        ? 'bg-indigo-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Nus-Sanad (Midterm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExamTypeFilter('Final')}
                    className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                      selectedExamTypeFilter === 'Final'
                        ? 'bg-indigo-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dhamaadka Sano (Final)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExamTypeFilter('Total')}
                    className={`px-3 py-1 font-bold rounded-md transition cursor-pointer ${
                      selectedExamTypeFilter === 'Total'
                        ? 'bg-indigo-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Wadarta Guud (Annual Total)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleDirectPrintGrades}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Daabac Hada (Print Report)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableClass(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Xir (Close)
                </button>
              </div>
            </div>

            {/* Print Container Content (This is printed) */}
            <div id="print-grades-container" className="p-8 md:p-12 bg-white text-slate-900 space-y-6 overflow-y-auto print:overflow-visible print:max-h-none print:p-0">
              <style>{`
                @media print {
                  @page {
                    size: landscape;
                    margin: 12mm;
                  }
                  body * {
                    visibility: hidden !important;
                  }
                  #print-grades-container, #print-grades-container * {
                    visibility: visible !important;
                  }
                  #print-grades-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 12px !important;
                    display: block !important;
                    background: white !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  .no-print, .no-print * {
                    display: none !important;
                    height: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  table {
                    page-break-inside: auto !important;
                    width: 100% !important;
                    border-collapse: collapse !important;
                    table-layout: auto !important;
                  }
                  tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                  }
                  th, td {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    border: 1px solid #cbd5e1 !important;
                    padding: 5px 6px !important;
                    font-size: 8px !important;
                  }
                }
              `}</style>
              {/* Header info */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">AKADEEMIYADA IBNU KHUZEYMA</h2>
                  <p className="text-xs font-mono text-slate-500 font-semibold uppercase">Mogadishu, Somalia • Wasaaradda Waxbarashada & Tacliinta Sare</p>
                  <div className="inline-block bg-indigo-50 text-indigo-900 font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider mt-2 border border-indigo-100">
                    Xaashida Natiijada: {selectedExamTypeFilter === 'Midterm' ? 'NUS-SANAD (MIDTERM TRANSCRIPT SHEET)' : selectedExamTypeFilter === 'Final' ? 'DHAMAADKA SANO (TERM FINAL TRANSCRIPT SHEET)' : 'WADARTA GUUD (MIDTERM + FINAL ANNUAL TOTAL)'}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-sm font-black text-slate-900 block font-mono font-bold font-bold">FASALKA: {printableClass}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Imtixaanka: {selectedExamTypeFilter === 'Midterm' ? 'NUS-SANADKA' : selectedExamTypeFilter === 'Final' ? 'DHAMAADKA SANO' : 'WADARTA GUUD'}</p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider font-mono">Taariikhda Daabacaada: {new Date().toLocaleDateString('so-SO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Content Roster */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 text-center uppercase tracking-wider mb-2">Liiska Kala-horraynta Buundooyinka Ardayda - {selectedExamTypeFilter === 'Midterm' ? 'Nus-Sanadka (Midterm Exams)' : selectedExamTypeFilter === 'Final' ? 'Dhamaadka Sano (Final Exams)' : 'Wadarta Guud (Midterm + Final Exams)'} (Sorted by Total Score)</h3>
                <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-[10px] font-bold text-slate-700 uppercase">
                        <th className="p-3 text-center w-12 border-r border-slate-200">K/H (Rank)</th>
                        <th className="p-3 border-r border-slate-200">ID No</th>
                        <th className="p-3 border-r border-slate-200 font-bold text-slate-900">Magaca Ardayga (Full Name)</th>
                        {['TARBIYO', 'ARABIC', 'SOMALI', 'MATH', 'TECHNOLOGY', 'BUSSINESS', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH', 'TARIIKH', 'JOGURAFI'].map(subj => (
                          <th key={subj} className="p-2 text-center text-[9px] font-mono border-r border-slate-200">{subj.substring(0, 4)}</th>
                        ))}
                        <th className="p-3 text-center bg-slate-100 font-black">Wadarta (Total)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {students
                        .filter(s => `${s.grade} - ${s.section}` === printableClass || s.grade === printableClass)
                        .map(s => {
                          let studentGrades = [];
                          if (selectedExamTypeFilter === 'Total') {
                            const midTerms = grades.filter(g => g.studentId === s.id && g.examType === 'Midterm');
                            const finals = grades.filter(g => g.studentId === s.id && g.examType === 'Final');
                            const subjects = Array.from(new Set([...midTerms.map(g => g.subject), ...finals.map(g => g.subject)]));
                            studentGrades = subjects.map(sub => {
                              const midG = midTerms.find(g => g.subject === sub);
                              const finG = finals.find(g => g.subject === sub);
                              return {
                                subject: sub,
                                score: (midG ? midG.score : 0) + (finG ? finG.score : 0)
                              };
                            });
                          } else {
                            studentGrades = grades.filter(g => g.studentId === s.id && g.examType === selectedExamTypeFilter);
                          }
                          const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
                          return { s, totalScore, gradesList: studentGrades };
                        })
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((item, idx) => (
                          <tr key={item.s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-center font-mono font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">{idx + 1}</td>
                            <td className="p-3 font-mono text-slate-600 border-r border-slate-200">{item.s.id}</td>
                            <td className="p-3 font-bold text-slate-900 border-r border-slate-200">{item.s.name}</td>
                            {['TARBIYO', 'ARABIC', 'SOMALI', 'MATH', 'TECHNOLOGY', 'BUSSINESS', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH', 'TARIIKH', 'JOGURAFI'].map(subj => {
                              const found = item.gradesList.find(g => g.subject.toUpperCase() === subj.toUpperCase());
                              return (
                                <td key={subj} className="p-2 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                                  {found ? `${found.score}` : '-'}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-mono font-black text-indigo-950 bg-indigo-50/30 text-sm">
                              {item.totalScore}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official seal/stamps footer */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200 text-center text-[10px]">
                <div className="space-y-4">
                  <p className="text-slate-400 uppercase tracking-widest font-bold">Diyaariyay (Prepared By)</p>
                  <div className="h-1 bg-slate-300 w-2/3 mx-auto mt-6" />
                  <p className="text-slate-700 font-bold font-mono">Macallinka Homeroom-ka</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-dashed border-slate-300 rounded-full flex items-center justify-center font-bold text-slate-300 transform -rotate-12 select-none">
                    OFFICIAL SEAL
                  </div>
                  <p className="text-slate-400 uppercase tracking-widest font-bold mt-2">Isha hubinta</p>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-400 uppercase tracking-widest font-bold">Anbaqaaday (Approved By)</p>
                  <div className="h-1 bg-slate-300 w-2/3 mx-auto mt-6" />
                  <p className="text-slate-700 font-bold font-mono font-semibold">Xafiiska Maamulaha (Principal)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL TO EDIT USER CREDENTIALS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 z-10"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
              <span>Beddelka Xogta Login-ka</span>
              <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingUser.username.trim() || !editingUser.password.trim()) {
                alert('Fadlan buuxi username-ka iyo password-ka!');
                return;
              }
              onUpdateUser(editingUser);
              setEditingUser(null);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Magaca Shaqaalaha / Waalidka</label>
                <div className="text-slate-800 text-sm font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {editingUser.name} ({editingUser.role === 'Admin' ? 'Maamule' : editingUser.role === 'Teacher' ? 'Macallin' : 'Waalid'})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="Geli Username..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password-ka Cusub</label>
                <input
                  type="text"
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none font-mono"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Geli Password..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                >
                  Sakah (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Kaydi (Save Room)
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* OFFICIAL SCHOOL REPORT PRINT COMPONENT */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm print-modal-outer animate-fade-in">
          <div className="absolute inset-0 cursor-pointer no-print" onClick={() => setShowPrintModal(false)} />
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
          >
            {/* Modal Actions Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center no-print">
              <span className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600 font-bold" />
                Daaqadda Daabacaadda Dugsiga (School Report Ledger - Print Preview)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Daabac Hada (Print Report)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Xir (Close)
                </button>
              </div>
            </div>

            {/* Print Container Content (This is printed) */}
            <div id="print-modal-container" className="p-8 md:p-12 bg-white text-slate-900 space-y-6 overflow-y-auto print:overflow-visible print:max-h-none print:p-0">
              
              <style>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #print-modal-container, #print-modal-container * {
                    visibility: visible !important;
                  }
                  #print-modal-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 24px !important;
                    display: block !important;
                    background: white !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  .no-print, .no-print * {
                    display: none !important;
                    height: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  table {
                    page-break-inside: auto !important;
                    width: 100% !important;
                    border-collapse: collapse !important;
                  }
                  tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                  }
                  th, td {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    border: 1px solid #cbd5e1 !important;
                  }
                }
              `}</style>

              {/* School Board Header / Letterhead */}
              <div className="text-center pb-6 border-b-4 border-double border-slate-350 space-y-2">
                <h1 className="font-sans font-extrabold text-2xl text-indigo-900 tracking-wide uppercase">IBNU KHUZEYMA INTEGRATED SCHOOL</h1>
                <p className="text-xs text-slate-500 font-bold tracking-wider">Mogadishu, Somalia • Email: info@ibnukhuzeymaschool.edu.so • Tell: +252-61-555-1234</p>
                <div className="pt-2">
                  <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-extrabold text-slate-800 uppercase tracking-widest border border-slate-250">
                    {printType === 'attendance' ? 'WARBIXINTA XADIRINTA (ATTENDANCE REPORT)' : 'WARBIXINTA MALEESHIYADA / LACAGAHA (PAYMENTS REPORT)'}
                  </span>
                </div>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left">
                <div>
                  <span className="block text-[10px] uppercase font-extrabold text-slate-400">FA SALKA (CLASS)</span>
                  <span className="font-extrabold text-slate-800 text-sm">{printClass}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-extrabold text-slate-400">BISHA (REPORTING MONTH)</span>
                  <span className="font-extrabold text-slate-800 text-sm">{printMonth}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-extrabold text-slate-400">MAALINTA LA DAABACAY (DATE)</span>
                  <span className="font-mono text-slate-650 font-bold">{new Date().toLocaleDateString('so-SO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-extrabold text-slate-400">MAAMULAHA SOO SAARAY</span>
                  <span className="font-extrabold text-indigo-700">Office of Administration</span>
                </div>
              </div>

              {/* Attendance Table */}
              {printType === 'attendance' ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-slate-350 border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wide">
                          <th className="p-3 border border-slate-300 text-left">Student ID</th>
                          <th className="p-3 border border-slate-300 text-left">Full Name (Ardayga)</th>
                          <th className="p-3 border border-slate-300 text-center">Presents (Joogay)</th>
                          <th className="p-3 border border-slate-300 text-center">Lates (Daahay)</th>
                          <th className="p-3 border border-slate-300 text-center">Absents (Maqnaa)</th>
                          <th className="p-3 border border-slate-300 text-center">Attendance % (Rate)</th>
                          <th className="p-3 border border-slate-300 text-left">Waalidka (Parent)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter((s) => `${s.grade} - ${s.section}` === printClass)
                          .map((s) => {
                            const monthMapCodes: Record<string, string> = {
                              'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
                              'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
                            };
                            const monthWord = printMonth.split(' ')[0];
                            const monthNum = monthMapCodes[monthWord] || '06';

                            const monthAttendance = attendance.filter(
                              (a) => a.studentId === s.id && a.date.includes(`-${monthNum}-`)
                            );
                            const absents = monthAttendance.filter(a => a.status === 'Absent').length;
                            const lates = monthAttendance.filter(a => a.status === 'Late').length;
                            const presents = monthAttendance.filter(a => a.status === 'Present').length;
                            
                            const totalDays = presents + lates + absents;
                            const calculatedRate = totalDays > 0 ? Math.round(((presents + lates * 0.5) / totalDays) * 100) : 100;

                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 border border-slate-300 font-mono text-slate-650">{s.id}</td>
                                <td className="p-3 border border-slate-300 font-extrabold text-slate-800">{s.name}</td>
                                <td className="p-3 border border-slate-300 text-center font-bold text-emerald-800">{presents} maalmood</td>
                                <td className="p-3 border border-slate-300 text-center font-bold text-amber-700">{lates}</td>
                                <td className="p-3 border border-slate-300 text-center font-extrabold text-rose-700">
                                  {absents > 0 ? `${absents} Maqnaan` : '-'}
                                </td>
                                <td className="p-3 border border-slate-300 text-center font-mono font-extrabold text-sm">{calculatedRate}%</td>
                                <td className="p-3 border border-slate-300 text-slate-600">
                                  {s.parentName} ({s.phone})
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer Statistics */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-left">
                    <div>
                      <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Total scholars inside class:</span>
                      <span className="text-sm font-extrabold text-slate-800">
                        {students.filter((s) => `${s.grade} - ${s.section}` === printClass).length} Students
                      </span>
                    </div>

                    <div>
                      <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Average attendance percentage:</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {(() => {
                          const classStus = students.filter((s) => `${s.grade} - ${s.section}` === printClass);
                          const rates = classStus.map(s => {
                            const monthMapCodes: Record<string, string> = {
                              'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
                              'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
                            };
                            const monthWord = printMonth.split(' ')[0];
                            const monthNum = monthMapCodes[monthWord] || '06';

                            const monthAttendance = attendance.filter(
                              (a) => a.studentId === s.id && a.date.includes(`-${monthNum}-`)
                            );
                            const absents = monthAttendance.filter(a => a.status === 'Absent').length;
                            const lates = monthAttendance.filter(a => a.status === 'Late').length;
                            const presents = monthAttendance.filter(a => a.status === 'Present').length;
                            
                            const totalDays = presents + lates + absents;
                            return totalDays > 0 ? ((presents + lates * 0.5) / totalDays) * 100 : 100;
                          });
                          const avg = rates.length > 0 ? (rates.reduce((sum, r) => sum + r, 0) / rates.length) : 100;
                          return `${Math.round(avg)}% General Average`;
                        })()}
                      </span>
                    </div>

                    <div>
                      <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Report Authenticity:</span>
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded font-extrabold uppercase inline-block mt-0.5">
                        Xaqiijiyay (Official Register)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-slate-350 border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wide">
                          <th className="p-3 border border-slate-300 text-left">Student ID</th>
                          <th className="p-3 border border-slate-300 text-left">Full Name (Ardayga)</th>
                          <th className="p-3 border border-slate-300 text-left">Billing Item (Faahfaahinta)</th>
                          <th className="p-3 border border-slate-300 text-right">Invoice Amount</th>
                          <th className="p-3 border border-slate-300 text-center">Status</th>
                          <th className="p-3 border border-slate-300 text-center">Receipt ID</th>
                          <th className="p-3 border border-slate-300 text-left">Waalidka (Parent)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter((s) => `${s.grade} - ${s.section}` === printClass)
                          .map((s) => {
                            const monthInvoice = fees.find(
                              (f) => f.studentId === s.id && f.title.toLowerCase().includes(printMonth.toLowerCase())
                            );

                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 border border-slate-300 font-mono text-slate-650">{s.id}</td>
                                <td className="p-3 border border-slate-300 font-extrabold text-slate-800 text-left">{s.name}</td>
                                <td className="p-3 border border-slate-300 text-left">
                                  {monthInvoice ? monthInvoice.title : `${printMonth} Tuition Fee`}
                                </td>
                                <td className="p-3 border border-slate-300 text-right font-extrabold text-slate-800">
                                  ${monthInvoice ? monthInvoice.amount : 0}
                                </td>
                                <td className="p-3 border border-slate-300 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                    monthInvoice?.status === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}>
                                    {monthInvoice?.status === 'Paid' ? 'WUU BIXIYAY (PAID)' : 'MA BIXIN (UNPAID)'}
                                  </span>
                                </td>
                                <td className="p-3 border border-slate-300 font-mono text-center text-slate-500">
                                  {monthInvoice ? monthInvoice.id : 'N/A'}
                                </td>
                                <td className="p-3 border border-slate-300 text-slate-600">
                                  {s.parentName} ({s.phone})
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer Statistics */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-left">
                    {(() => {
                      const classStus = students.filter((s) => `${s.grade} - ${s.section}` === printClass);
                      const classInvs = fees.filter(f =>
                        f.title.toLowerCase().includes(printMonth.toLowerCase()) &&
                        classStus.some(s => s.id === f.studentId)
                      );
                      const totalBilledVal = classInvs.reduce((sum, inv) => sum + inv.amount, 0);
                      const totalPaidVal = classInvs.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
                      const totalUnpaidVal = totalBilledVal - totalPaidVal;

                      return (
                        <>
                          <div>
                            <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Total Billed (Isugeynta Biilka):</span>
                            <span className="text-base font-extrabold text-indigo-900">${totalBilledVal.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Total Collected (La Bixiyay):</span>
                            <span className="text-base font-extrabold text-emerald-700">${totalPaidVal.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Total Outstanding (Ka dhiman):</span>
                            <span className="text-base font-extrabold text-rose-700">${totalUnpaidVal.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-400 uppercase block text-[9px] tracking-wider">Collection Ratio (Ficilada %):</span>
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] rounded font-bold uppercase inline-block mt-0.5">
                              {totalBilledVal > 0 ? `${Math.round((totalPaidVal / totalBilledVal) * 100)}% Collected` : '0%'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Verified signatures section for paper validation */}
              <div className="pt-16 grid grid-cols-2 gap-12 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-2/3 mx-auto pt-2">
                    <p className="font-bold text-slate-800">Maamulaha Dugsiga</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Principal Seal / Stamp</p>
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-2/3 mx-auto pt-2">
                    <p className="font-bold text-slate-800">Waaxda Lacagaha (Finance Officer)</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Finance Dept Sign-off</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* Safe Premium Custom Confirmation Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm md:text-base">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Ka laabo (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/10 transition cursor-pointer"
              >
                Haa, Hubaa (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {passwordModal && passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-150 shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                <Edit className="w-6 h-6" />
              </div>
              <div className="space-y-1 w-full">
                <h4 className="font-bold text-slate-800 text-sm md:text-base">
                  Beddel Password-ka
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Geli Password-ka cusub ee uu <strong>{passwordModal.user.name}</strong> ku geli doono mobile-ka:
                </p>
                <div className="pt-3 w-full">
                  <input
                    type="text"
                    value={passwordModal.newPass}
                    onChange={(e) => setPasswordModal({ ...passwordModal, newPass: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="Geli password-ka cusub"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPasswordModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Ka laabo (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateUser && passwordModal.newPass.trim()) {
                    onUpdateUser({
                      ...passwordModal.user,
                      password: passwordModal.newPass.trim()
                    });
                    if (onAddLog) {
                      onAddLog({
                        id: `LOG-${Math.floor(Math.random() * 900000 + 100000)}`,
                        timestamp: new Date().toISOString(),
                        operator: 'Admin Head',
                        role: 'Admin',
                        category: 'System',
                        description: `Waxaa la beddelay password-ka akoonka: ${passwordModal.user.name}`,
                        academicYear: '2026-2027',
                        status: 'Completed'
                      });
                    }
                  }
                  setPasswordModal(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition cursor-pointer"
              >
                Kaydi Password-ka
              </button>
            </div>
          </div>
        </div>
      )}

      </div> {/* Closing lg:col-span-9 wrapper */}
    </div>
  );
}
