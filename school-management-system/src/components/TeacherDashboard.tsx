/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  ListFilter,
  Check,
  AlertCircle,
  MessageSquare,
  Send,
  Video,
  Layers,
  Search,
  BookMarked,
  Info,
  Clock,
  Inbox
} from 'lucide-react';
import { Student, Grade, Teacher, AttendanceRecord, DirectMessage, DocumentMaterial, QnaItem, VirtualClass, SchedulePeriod, Announcement, UserCredential } from '../types';
import CurriculumDocumentsHub from './CurriculumDocumentsHub';
import SchoolCalendar from './SchoolCalendar';
import { ChatComponent } from './ChatComponent';
import { ProfileSettings } from './ProfileSettings';

interface TeacherDashboardProps {
  teacher: Teacher;
  currentUser: UserCredential;
  students: Student[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  onAddGrade: (grade: Grade) => void;
  onSubmitAttendanceBatch: (records: AttendanceRecord[]) => void;
  messages?: DirectMessage[];
  onSendMessage?: (msg: DirectMessage) => void;
  documents?: DocumentMaterial[];
  qna?: QnaItem[];
  virtualClasses?: VirtualClass[];
  onAddDocument?: (doc: DocumentMaterial) => void;
  onDeleteDocument?: (id: string) => void;
  schedules?: SchedulePeriod[];
  announcements?: Announcement[];
  onUpdateUser: (user: UserCredential) => void;
}

export default function TeacherDashboard({
  teacher,
  currentUser,
  students,
  grades,
  attendance,
  onAddGrade,
  onSubmitAttendanceBatch,
  messages = [],
  onSendMessage,
  documents = [],
  qna = [],
  virtualClasses = [],
  onAddDocument,
  onDeleteDocument,
  schedules = [],
  announcements = [],
  onUpdateUser
}: TeacherDashboardProps) {
  // Mobile app navigation state: we default to 'attendance'
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'chat' | 'subjects' | 'schedules' | 'calendar'>('attendance');
  const [showProfile, setShowProfile] = useState(false);

  // Unique sorted list of classes from student records - filtered to enforce strictly teacher's assigned classes
  const uniqueClasses = Array.from(new Set(students.map(s => `${s.grade} - ${s.section}`)))
    .filter(c => {
      if (!teacher) return true;
      const assigned = teacher.assignedClass.split(',').map(ac => ac.trim().toLowerCase());
      return assigned.includes(c.trim().toLowerCase());
    })
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });

  // Calculate default class matching teacher homeroom advisor or first class
  const getInitialClass = () => {
    const assigned = (teacher.assignedClass || "").split(',').map(ac => ac.trim().toLowerCase());
    const matched = uniqueClasses.find(c => assigned.includes(c.toLowerCase()));
    return matched || uniqueClasses[0] || "Grade 10 - A";
  };

  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<string>(getInitialClass);
  const [selectedGradesClass, setSelectedGradesClass] = useState<string>(getInitialClass);
  const [selectedScheduleClass, setSelectedScheduleClass] = useState<string>(getInitialClass);

  // Derived student lists for chosen class
  const [attGradeSplit, attSectionSplit] = selectedAttendanceClass.split(" - ");
  const attendanceStudents = students.filter(
    (s) => s.grade === attGradeSplit && s.section === attSectionSplit
  );

  const [grdGradeSplit, grdSectionSplit] = selectedGradesClass.split(" - ");
  const gradesStudents = students.filter(
    (s) => s.grade === grdGradeSplit && s.section === grdSectionSplit
  );

  // Attendance statuses mapping state
  const [attendanceStatuses, setAttendanceStatuses] = useState<
    Record<string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }>
  >(() => {
    const initial: Record<string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }> = {};
    const initialClass = getInitialClass();
    const [g, sec] = initialClass.split(" - ");
    const matchedStudents = students.filter(s => s.grade === g && s.section === sec);
    matchedStudents.forEach((s) => {
      initial[s.id] = { status: 'Present', remarks: '' };
    });
    return initial;
  });

  const [attendanceSubmitStatus, setAttendanceSubmitStatus] = useState<string | null>(null);

  // New Grade logging state
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    const initialClass = getInitialClass();
    const [g, sec] = initialClass.split(" - ");
    const matchedStudents = students.filter(s => s.grade === g && s.section === sec);
    return matchedStudents[0]?.id || '';
  });

  const [selectedSubject, setSelectedSubject] = useState((teacher.subject || "").split(',')[0].trim());
  const [scoreVal, setScoreVal] = useState<number>(40);
  const [examType, setExamType] = useState<'Homework' | 'Quiz' | 'Midterm' | 'Final'>('Midterm');
  const [selectedAcademicYearGrd, setSelectedAcademicYearGrd] = useState<string>('2026-2027');
  const [gradeSubmitStatus, setGradeSubmitStatus] = useState<string | null>(null);

  // Active chat state
  const [selectedParentStudentId, setSelectedParentStudentId] = useState<string>('warbixinta-maalintii');
  const [selectedChatType, setSelectedChatType] = useState<'parent' | 'group'>('group');
  const [typedMessage, setTypedMessage] = useState('');

  // Helper to switch Attendance Class and reinitialize statuses
  const handleAttendanceClassChange = (newClass: string) => {
    setSelectedAttendanceClass(newClass);
    const [g, sec] = newClass.split(" - ");
    const matchedStudents = students.filter(s => s.grade === g && s.section === sec);
    const initial: Record<string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }> = {};
    matchedStudents.forEach((s) => {
      initial[s.id] = { status: 'Present', remarks: '' };
    });
    setAttendanceStatuses(initial);
  };

  // Helper to switch Grades Class and select first student of that class
  const handleGradesClassChange = (newClass: string) => {
    setSelectedGradesClass(newClass);
    const [g, sec] = newClass.split(" - ");
    const matchedStudents = students.filter(s => s.grade === g && s.section === sec);
    if (matchedStudents.length > 0) {
      setSelectedStudentId(matchedStudents[0].id);
    } else {
      setSelectedStudentId('');
    }
  };

  // Mark attendance status toggle helper
  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  // Submit today's register checklist
  const submitTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const records: AttendanceRecord[] = (Object.entries(attendanceStatuses) as Array<[string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }]>).map(([studentId, data]) => ({
      id: `ATT${Math.floor(Math.random() * 900000 + 100000)}`,
      date: today,
      studentId,
      status: data.status,
      remarks: data.remarks || undefined
    }));

    onSubmitAttendanceBatch(records);
    setAttendanceSubmitStatus('XAADIRINTA MAANTA SI GUUL LEH AYAA LOO DIIWAANGELIYEY!');
    setTimeout(() => setAttendanceSubmitStatus(null), 4000);
  };

  // Log score gradebook (Scaled out of 50 for Midterm and Final)
  const submitGradeLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || isNaN(scoreVal)) return;

    // Check for duplicate grade
    const exists = grades.some(g => 
      g.studentId === selectedStudentId && 
      g.subject === selectedSubject && 
      g.examType === examType && 
      g.academicYear === selectedAcademicYearGrd
    );
    if (exists) {
      setGradeSubmitStatus('Hore ayaa ardaygan loogu galisay natiijada imtixaanka/maadadan.');
      setTimeout(() => setGradeSubmitStatus(null), 4000);
      return;
    }

    // Scale to percentage out of 50
    const percentage = (scoreVal / 50) * 100;
    let letter = 'F';
    if (percentage >= 90) letter = 'A';
    else if (percentage >= 80) letter = 'B';
    else if (percentage >= 70) letter = 'C';
    else if (percentage >= 60) letter = 'D';

    const newGrade: Grade = {
      id: `GRD${Math.floor(Math.random() * 90000 + 10000)}`,
      studentId: selectedStudentId,
      subject: selectedSubject,
      score: scoreVal,
      gradeLetter: letter,
      examType: examType,
      date: new Date().toISOString().split('T')[0],
      academicYear: selectedAcademicYearGrd
    };

    onAddGrade(newGrade);
    setGradeSubmitStatus(`BUUNDADA GEEBTEEGA ${scoreVal}/50 (${percentage.toFixed(0)}%) WAA LA DAALACAY!`);
    setTimeout(() => setGradeSubmitStatus(null), 4000);
  };

  // Send Direct Message to Parent
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedParentStudentId || !onSendMessage) return;

    const newMsg: DirectMessage = {
      id: `MSG${Math.floor(Math.random() * 900000 + 100000)}`,
      studentId: selectedParentStudentId,
      sender: 'Teacher',
      text: typedMessage,
      timestamp: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    onSendMessage(newMsg);
    setTypedMessage('');
  };

  // Get active parent thread messages
  const activeThreadMessages = messages.filter(m => m.studentId === selectedParentStudentId);
  const currentChattingStudent = students.find(s => s.id === selectedParentStudentId);

  return (
    <div className="space-y-6" id="teacher-workspace">
      {/* Teacher Profile Card Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-xl select-none">
        <img
          alt={teacher.name}
          src={teacher.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
          className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 shadow-lg relative z-10"
        />
        <div className="space-y-1 text-center md:text-left relative z-10">
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/30">
            Kulliyadda: {teacher.subject}
          </span>
          <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight">{teacher.name}</h2>
          <p className="text-xs text-slate-400">
            Fasalka Maamulka: <span className="text-slate-200 font-bold">{teacher.assignedClass}</span> • {teacher.email}
          </p>
          <button 
              onClick={() => setShowProfile(true)}
              className="text-[9px] bg-white text-indigo-900 font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 mt-2 hover:bg-slate-100"
          >
              Wax ka beddel Profile-ka
          </button>
        </div>

        {/* Floating schedule background */}
        <div className="absolute right-0 bottom-0 opacity-10 rotate-12 select-none translate-x-12 translate-y-12">
          <BookOpen className="w-64 h-64 text-indigo-400" />
        </div>
      </div>

      {showProfile && (
        <ProfileSettings
          currentUser={currentUser}
          onUpdate={onUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* --- APP-LIKE INTERACTIVE GRID CONTROLLERS (For Mobile Screen Comfort) --- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 select-none" id="mobile-teacher-tiles">
        {/* Attendance Button Card */}
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'attendance'
              ? 'bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-indigo-800 shadow-md shadow-indigo-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'attendance' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block">Xaadirinta</h3>
          <p className={`text-[10px] ${activeTab === 'attendance' ? 'text-indigo-200' : 'text-slate-400'} font-medium`}>Xaadirinta Ardayda</p>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Grades Button Card */}
        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'grades'
              ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-emerald-800 shadow-md shadow-emerald-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'grades' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block">Darajooyinka</h3>
          <p className={`text-[10px] ${activeTab === 'grades' ? 'text-emerald-200' : 'text-slate-400'} font-medium`}>Darajooyinka Qiimaynta</p>
        </button>

        {/* Chat / Messages Button Card */}
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'chat'
              ? 'bg-gradient-to-br from-amber-900 to-amber-950 text-white border-amber-800 shadow-md shadow-amber-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'chat' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'
          }`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block">Fariimaha</h3>
          <p className={`text-[10px] ${activeTab === 'chat' ? 'text-amber-200' : 'text-slate-400'} font-medium`}>Fariimaha Waalidiinta</p>
          {messages.filter(m => m.sender === 'Parent').length > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-[8px] text-white font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
              {messages.filter(m => m.sender === 'Parent').length}
            </span>
          )}
        </button>

        {/* Subjects Curriculum Library Card */}
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-br from-teal-900 to-teal-950 text-white border-teal-800 shadow-md shadow-teal-950/20'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'subjects' ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-600'
          }`}>
            <BookMarked className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block">Maaddooyinka</h3>
          <p className={`text-[10px] ${activeTab === 'subjects' ? 'text-teal-200' : 'text-slate-400'} font-medium`}>Qorshaha Waxbarashada</p>
        </button>

        {/* Schedules Timetable Card */}
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'schedules'
              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white border-amber-800 shadow-md shadow-amber-950/25'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'schedules' ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-600'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block">Jadwalka</h3>
          <p className={`text-[10px] ${activeTab === 'schedules' ? 'text-amber-200' : 'text-slate-400'} font-medium`}>Jadwalka Fasalka</p>
        </button>

        {/* Tab 6: Calendar */}
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            activeTab === 'calendar'
              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white border-amber-800 shadow-md shadow-amber-950/25'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            activeTab === 'calendar' ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-600'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider block">Kalandarka</h3>
          <p className={`text-[10px] ${activeTab === 'calendar' ? 'text-amber-200' : 'text-slate-400'} font-medium`}>Kalandarka Dugsiga</p>
        </button>

      </div>

      {/* --- CONTENT AREA TRANSITIONS --- */}

      {/* 0. CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in" id="teacher-calendar-view">
          <SchoolCalendar
            virtualClasses={virtualClasses}
            announcements={announcements}
            fees={[]}
            role="Teacher"
          />
        </div>
      )}

      {/* 1. ATTENDANCE GATE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-black text-slate-550 mb-1.5 uppercase tracking-wider text-slate-400">Dooro Fasalka Maanta</label>
              <div className="flex flex-wrap gap-1.5">
                {uniqueClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleAttendanceClassChange(cls)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedAttendanceClass === cls
                        ? 'bg-indigo-900 text-white shadow-md font-extrabold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h3 className="font-extrabold text-slate-850 text-slate-800 text-base">Diiwaanka Xaadirinta Ardayda</h3>
              <p className="text-xs text-slate-400">Fasalka: <span className="text-indigo-900 font-bold">{selectedAttendanceClass}</span> • Taariikhda Maanta: <span className="font-bold font-mono">{new Date().toISOString().split('T')[0]}</span></p>
            </div>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-bold self-start md:self-center">
              Wadar: {attendanceStudents.length} Arday
            </span>
          </div>

          {/* Success Confirm Notification */}
          {attendanceSubmitStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-150 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 font-black" />
              <span className="font-bold">{attendanceSubmitStatus}</span>
            </div>
          )}

          {/* Attendance Checkbox Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Magaca Ardayga</th>
                  <th className="p-4">Aqoonsiga (ID)</th>
                  <th className="p-4 text-center">Xaadirinta</th>
                  <th className="p-4">Xusuus-qor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attendanceStudents.map((s) => {
                  const curr = attendanceStatuses[s.id] || { status: 'Present', remarks: '' };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            alt={s.name}
                            src={s.avatar || 'https://via.placeholder.com/150'}
                            className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{s.name}</p>
                            <p className="text-[10px] text-slate-400">Garab-xaadiris: {s.attendanceRate}%</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{s.id}</td>
                      <td className="p-4 text-center flex justify-center">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 select-none">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Present')}
                            className={`p-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              curr.status === 'Present' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Jooga
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Late')}
                            className={`p-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              curr.status === 'Late' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Dahaaday
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Absent')}
                            className={`p-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              curr.status === 'Absent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Ma Joogo
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Sababta..."
                          value={curr.remarks}
                          onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Submit register */}
          <button
            type="button"
            onClick={submitTodayAttendance}
            className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-950/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <UserCheck className="w-4 h-4" /> Gudbi Xaadirinta Maanta
          </button>
        </div>
      )}

      {/* 2. GRADES JOURNAL ENTRY */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">DOORO FASALKA</label>
              <div className="flex flex-wrap gap-1.5">
                {uniqueClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleGradesClassChange(cls)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedGradesClass === cls
                        ? 'bg-emerald-900 text-white shadow-md font-extrabold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-900 font-bold self-start md:self-center border border-emerald-100/40">
              Fasalka la qiimaynayo: {selectedGradesClass}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Grade entry form */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Gali Darajo Cusub</h3>
                <p className="text-xs text-slate-400">Hubi buundooyinka oo u xaree ardayga si toos ah</p>
              </div>

              {gradeSubmitStatus && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-100 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">{gradeSubmitStatus}</span>
                </div>
              )}

              <form onSubmit={submitGradeLog} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">ARDAYGA</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-slate-750 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {gradesStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">SANAD-WAXBARASHEEDKA</label>
                  <select
                    value={selectedAcademicYearGrd}
                    onChange={(e) => setSelectedAcademicYearGrd(e.target.value)}
                    className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="2026-2027">2026-2027 (Sanadkan Jira)</option>
                    <option value="2025-2026">2025-2026 (Sanadkii Hore)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">MAADDADA</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-bold focus:outline-none"
                    >
                      {(teacher.subject || "").split(',').map(sub => (
                        <option key={sub.trim()} value={sub.trim()}>{sub.trim()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Qaybta Qiimaynta</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as any)}
                      className="w-full text-slate-700 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-bold focus:outline-none"
                    >
                      <option value="Midterm">Nus-Sanadka (Midterm)</option>
                      <option value="Final">Dhamaadka Sano (Final)</option>
                      <option value="Homework">Homework Check</option>
                      <option value="Quiz">Spontaneous Quiz</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">NATIIJADA (100-ka)</label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={scoreVal}
                      onChange={(e) => setScoreVal(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg self-center"
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={scoreVal}
                      onChange={(e) => setScoreVal(Number(e.target.value))}
                      className="w-16 border border-slate-200 rounded-lg p-2 text-center text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 shadow-md shadow-emerald-900/10 cursor-pointer uppercase tracking-wider"
                >
                  Daabac Darajada
                </button>
              </form>
            </div>

            {/* Recent grades feed journal */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Buugga Darajooyinka Fasalka</h3>
                  <p className="text-xs text-slate-400">Liiska dhibcaha u dambeeyey ee loo geliyey {selectedGradesClass}</p>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-3">Ardayga</th>
                        <th className="p-3">Maaddada</th>
                        <th className="p-3 text-center">Nooca</th>
                        <th className="p-3 text-center">Dhibcaha</th>
                        <th className="p-3 text-center">Darajada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(() => {
                        const teacherSubjects = (teacher.subject || "").split(',').map(s => s.trim().toLowerCase());
                        const classGrades = grades.filter((grd) => 
                          gradesStudents.some((s) => s.id === grd.studentId) &&
                          teacherSubjects.includes(grd.subject.trim().toLowerCase())
                        );
                        if (classGrades.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 text-[11px]">
                                Ma jiraan wax darajooyin ah oo loo geliyey fasalkan la doortay.
                              </td>
                            </tr>
                          );
                        }
                        return classGrades.slice().reverse().map((grd) => {
                          const studentName = students.find((s) => s.id === grd.studentId)?.name || 'Scholar';
                          return (
                            <tr key={grd.id} className="hover:bg-slate-50/50">
                              <td className="p-3">
                                <span className="font-bold text-slate-800 block text-xs">{studentName}</span>
                                <p className="text-[9px] text-slate-400 font-mono">{grd.studentId}</p>
                              </td>
                              <td className="p-3 text-slate-700 font-bold text-[11px]">{grd.subject}</td>
                              <td className="p-3 text-center">
                                <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                                  {grd.examType}
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono font-bold text-slate-800 text-xs">
                                {grd.score}/50
                              </td>
                              <td className="p-3 text-center">
                                <span className={`p-1 px-2.5 rounded-md font-mono font-bold text-xs ${
                                  grd.gradeLetter === 'A' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                                }`}>
                                  {grd.gradeLetter}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DIRECT PARENT ENCRYPTED CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Thread select sidebar */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedChatType('group');
                    setSelectedParentStudentId('warbixinta-maalintii');
                  }}
                  className={`flex-1 p-2 rounded-lg text-xs font-bold ${selectedChatType === 'group' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  Group Guud
                </button>
                <button 
                  onClick={() => {
                    setSelectedChatType('parent');
                    setSelectedParentStudentId(students[0]?.id || '');
                  }}
                  className={`flex-1 p-2 rounded-lg text-xs font-bold ${selectedChatType === 'parent' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  Waalidiin
                </button>
              </div>

              {selectedChatType === 'group' && (
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                  <h3 className="font-extrabold text-slate-850 text-slate-800 text-xs uppercase tracking-wider text-slate-400">Groups</h3>
                  <button
                    onClick={() => {
                        setSelectedParentStudentId('warbixinta-maalintii');
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer relative ${
                        selectedParentStudentId === 'warbixinta-maalintii'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/50 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                        <span className="text-xs font-bold text-indigo-700">WM</span>
                    </div>
                    <div className="truncate">
                        <span className="block text-xs font-bold truncate">Warbixinta Maalintii</span>
                        <span className="block text-[9px] text-slate-500 font-medium font-sans">Group Macallimiin</span>
                    </div>
                  </button>
                </div>
              )}

              {selectedChatType === 'parent' && (
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                  <h3 className="font-extrabold text-slate-850 text-slate-800 text-xs uppercase tracking-wider text-slate-400">Dooro Qeysha</h3>
                  {students.map((s) => {
                    const hasUnread = messages.filter(m => m.studentId === s.id && m.sender === 'Parent').length > 0;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedParentStudentId(s.id)}
                        className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer relative ${
                          selectedParentStudentId === s.id
                            ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/50 text-slate-700'
                        }`}
                      >
                        <img src={s.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt={s.name} />
                        <div className="truncate">
                          <span className="block text-xs font-bold truncate">{s.parentName}</span>
                          <span className="block text-[9px] text-slate-500 font-medium font-sans">Waalidka: {s.name} ({s.grade})</span>
                        </div>
                        {hasUnread && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-650 bg-red-500 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat conversation area */}
            <div className="md:col-span-8 flex flex-col justify-between border border-slate-100/90 bg-slate-50/50 p-4 rounded-2xl h-[420px]">
              
              {selectedParentStudentId === 'warbixinta-maalintii' ? (
                <ChatComponent 
                  currentUserId={currentUser.id} 
                  senderName={currentUser.name || 'Macallin'} 
                  chatId="warbixinta-maalintii" 
                  receiverName="Warbixinta Maalintii" 
                  members={['Macallimiin', 'Maamul']}
                />
              ) : (
                <>
                  {/* Header metadata */}
                  <div className="p-2 bg-white rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    {currentChattingStudent ? (
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">Wada-sheekaysiga: {currentChattingStudent.parentName}</h4>
                        <p className="text-[10px] text-slate-500">Child context study details: {currentChattingStudent.name} • {currentChattingStudent.grade}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">Saf weyn oo fariimo ah</span>
                    )}
                  </div>

                  {/* Message timeline stream */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
                    {activeThreadMessages.length === 0 ? (
                      <div className="text-center p-12 text-slate-400 space-y-2">
                        <Inbox className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300" />
                        <p className="text-xs">Ma jirto wax fariimo ah oo aad kala qorteen qoyskan.</p>
                        <p className="text-[10px] text-slate-300">U dir fariintii ugu horreysay si aad ula xiriirto.</p>
                      </div>
                    ) : (
                      activeThreadMessages.map((msg) => {
                        const isTeacher = msg.sender === 'Teacher';
                        return (
                          <div key={msg.id} className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 max-w-[80%] rounded-2xl shadow-sm space-y-1 block ${
                              isTeacher ? 'bg-indigo-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                            }`}>
                              <p className="text-xs font-medium leading-relaxed font-sans">{msg.text}</p>
                              <span className={`text-[9.5px] block text-right font-medium ${isTeacher ? 'text-indigo-300' : 'text-slate-400'}`}>
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message composer */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60 flex items-center gap-2">
                    <input
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="Qor fariin..."
                      className="flex-1 text-xs bg-transparent border-none focus:ring-0 p-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // @ts-ignore
                          onSendMessage(typedMessage);
                          setTypedMessage('');
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        // @ts-ignore
                        onSendMessage(typedMessage);
                        setTypedMessage('');
                      }}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBJECTS CURRICULUM, STUDY PDFS & LIVE VIDEOS */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Subject Overview Card */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2 z-10 relative">
                <span className="text-[9px] font-black tracking-widest text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full uppercase border border-teal-900/40 inline-block">
                  Teacher course summary
                </span>
                <h3 className="text-lg font-black">{teacher.subject} Syllabus</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The academic textbook curriculum for this class emphasizes core foundational concepts, interactive labs, weekly assessments, and progress reporting tracking.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 z-10 relative">
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">Subject Assigned to</p>
                <div className="flex items-center gap-2">
                  <img src={teacher.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-800 shadow-inner" alt="" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{teacher.name}</h5>
                    <p className="text-[9px] text-slate-400 font-medium">Head of subject faculty</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum PDF Library & Live classes summary combo */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* COMPREHENSIVE CURRICULUM DOCUMENTS HUB */}
              <div className="space-y-3" id="teacher-documents-hub-container">
                <CurriculumDocumentsHub
                  documents={documents}
                  role="Teacher"
                  authorName={teacher.name}
                  onAddDocument={onAddDocument}
                  onDeleteDocument={onDeleteDocument}
                />
              </div>

              {/* Scheduled Live / Virtual Class Sessions */}
              <div className="space-y-3 pt-3 border-t border-slate-200/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Kulanka Tooska ah ee Maqal & Muuqaal (Virtual Class)</h4>
                    <p className="text-[11px] text-slate-500 font-sans">Scheduled active online interactive sessions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {(() => {
                    const teacherSubjectArray = (teacher.subject || "").split(',').map(s => s.trim().toLowerCase());
                    const filteredVirtualClasses = virtualClasses.filter(v => teacherSubjectArray.includes(v.subject.toLowerCase()) || v.subject === 'Science');
                    
                    if (filteredVirtualClasses.length === 0) {
                      return (
                        <div className="p-6 bg-slate-50 rounded-xl text-center border border-slate-100 text-xs text-slate-400 font-medium">
                          Ma jiraan wax fasallo toos ah oo la qorsheeyey hadda.
                        </div>
                      );
                    }
                    return filteredVirtualClasses.map((meet) => (
                      <div key={meet.id} className="p-4 bg-slate-50 border border-slate-200/40 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full uppercase inline-block">
                            {meet.isLive ? '🔴 LIVE CASHAARKA' : '📅 SCHEDULED'}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800">{meet.topic}</h5>
                          <p className="text-[10px] text-slate-555 text-slate-400 font-medium">{meet.grade} • Scheduled time: {meet.dateTime}</p>
                        </div>
                        <a
                          href={meet.meetUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="px-3.5 py-2 bg-indigo-900 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" /> Ku Biir Fasalka
                        </a>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. SCHEDULES / TIMETABLE GATE */}
      {activeTab === 'schedules' && (() => {
        const activeYear = '2026-2027';
        const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
        const PERIODS = [1, 2, 3, 4, 5, 6, 7];

        const classSchedules = schedules.filter(
          s => s.grade.trim().toLowerCase() === selectedScheduleClass.trim().toLowerCase() && s.academicYear === activeYear
        );

        return (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 animate-fade-in shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-xl text-white shadow-md relative overflow-hidden">
              <div className="space-y-1 relative z-10 w-full md:w-auto flex-1">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-3 py-1 rounded-full uppercase border border-amber-500/30">
                  {selectedScheduleClass} Timetable
                </span>
                <h3 className="font-extrabold text-sm md:text-base mt-2">Jadwalka Xiisadaha ee Fasalkaaga (Class Timetable)</h3>
                <p className="text-xs text-slate-300 leading-normal">
                  Kala soco jadwalka 5-ta maalin iyo 7-da xiisadood ee fasalada aad dhigto.
                </p>
              </div>
              <div className="relative z-10 flex flex-col gap-2 w-full md:w-auto">
                {uniqueClasses.length > 1 && (
                  <select
                    value={selectedScheduleClass}
                    onChange={(e) => setSelectedScheduleClass(e.target.value)}
                    className="p-2 bg-indigo-950/50 border border-indigo-400/30 rounded-lg text-xs font-bold text-indigo-100 outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls} className="text-slate-900">{cls}</option>
                    ))}
                  </select>
                )}
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-center min-w-[130px]">
                  <span className="block text-[9px] uppercase font-bold text-amber-200">Sanad-Dugsiyeedka</span>
                  <span className="text-xs font-black font-mono">{activeYear}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full border-collapse text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-center">
                    <th className="p-3.5 font-bold uppercase text-slate-400 text-[10px] border-r border-slate-100 w-24">Xiisadaha</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-3.5 font-black text-indigo-950 uppercase tracking-wide border-r border-slate-100">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERIODS.map(period => (
                    <tr key={period} className="hover:bg-slate-50/40 transition-all">
                      <td className="p-3.5 font-extrabold text-slate-800 bg-slate-50 border-r border-slate-100 text-center">
                        <span className="block text-[11px]">Xiisada {period}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">Period {period}</span>
                      </td>
                      {DAYS.map(day => {
                        const cell = classSchedules.find(s => s.day === day && s.periodIndex === period);
                        const teacherSubjectArray = (teacher.subject || "").split(',').map(s => s.trim().toLowerCase());
                        const isMySubject = cell?.subject && teacherSubjectArray.includes(cell.subject.toLowerCase());

                        return (
                          <td key={day} className={`p-3 border-r border-slate-150 align-top min-w-[140px] text-center transition ${isMySubject ? 'bg-amber-50/30' : ''}`}>
                            <div className="py-1">
                              {cell?.subject ? (
                                <div className="space-y-0.5">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                                    isMySubject 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm shadow-amber-100/50' 
                                      : 'bg-slate-100 text-slate-800'
                                  }`}>
                                    {cell.subject}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 font-medium truncate mt-1">
                                    {cell.teacherName || 'Macallin la’aan'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-200 font-bold block py-2">---</span>
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

            <div className="p-4 bg-indigo-50/40 border border-indigo-100/60 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-indigo-950">Macluumaad Muhiim ah</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Xiisadaha leh midabka dahabiga ah (<span className="text-amber-700 font-bold">Gold Accent</span>) waa kuwa aad adigu dhigto oo ku aaddan maaddooyinkaaga <span className="font-bold">{teacher.subject}</span>. Jadwalkaan waxaa maamusha qeybta Adminka iskuulka.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
