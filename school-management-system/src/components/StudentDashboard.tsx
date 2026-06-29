/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Award,
  Wallet,
  Calendar,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Clock,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { Student, Grade, FeeInvoice, Announcement, AttendanceRecord, DocumentMaterial } from '../types';
import CurriculumDocumentsHub from './CurriculumDocumentsHub';

interface StudentDashboardProps {
  student: Student;
  grades: Grade[];
  fees: FeeInvoice[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  onOpenPaymentModal: (invoice: FeeInvoice) => void;
  documents?: DocumentMaterial[];
}

export default function StudentDashboard({
  student,
  grades,
  fees,
  announcements,
  attendance,
  onOpenPaymentModal,
  documents = []
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'grades' | 'fees' | 'schedule' | 'docs'>('grades');

  // Filter student-specific records
  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const studentFees = fees.filter((f) => f.studentId === student.id);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);

  // Computed metrics
  const outstandingCost = studentFees
    .filter((f) => f.status !== 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const subjectTeacherMap: Record<string, { name: string, room: string }> = {
    'TARBIYO': { name: 'Maryan Yaasiin', room: 'Room 101' },
    'ISLAMIC STUDIES': { name: 'Maryan Yaasiin', room: 'Room 101' },
    'ARABIC': { name: 'Cabdiraxmaan Cilmi', room: 'Room 102' },
    'SOMALI': { name: 'Cali Maxamed Nuur', room: 'Room 103' },
    'MATH': { name: 'Bashiir Maxamed Ali', room: 'Room 104' },
    'MATHEMATICS': { name: 'Bashiir Maxamed Ali', room: 'Room 104' },
    'TECHNOLOGY': { name: 'Ahmed Maxamed', room: 'Room 105' },
    'COMPUTER SCIENCE': { name: 'Ahmed Maxamed', room: 'Room 105' },
    'BUSINESS': { name: 'Deeqa Axmed', room: 'Room 106' },
    'BUSINESS STUDIES': { name: 'Deeqa Axmed', room: 'Room 106' },
    'BIOLOGY': { name: 'Nimco Yaasin', room: 'Lab A' },
    'CHEMISTRY': { name: 'Sahra Abdi', room: 'Lab B' },
    'PHYSICS': { name: 'Maxamed Cumar', room: 'Lab C' },
    'ENGLISH': { name: 'Cabdisalaan Nuur', room: 'Room 107' },
    'ENGLISH LITERATURE': { name: 'Cabdisalaan Nuur', room: 'Room 107' },
    'TARIIKH': { name: 'Cismaan Cali', room: 'Room 108' },
    'HISTORY': { name: 'Cismaan Cali', room: 'Room 108' },
    'JOGURAFI': { name: 'Xaliimo Maxamuud', room: 'Room 109' },
    'GEOGRAPHY': { name: 'Xaliimo Maxamuud', room: 'Room 109' }
  };

  const courses = React.useMemo(() => {
    const subjects = Array.from(new Set(studentGrades.map((g) => g.subject)));
    if (subjects.length === 0) {
      return [
        { subject: 'MATH', teacher: 'Bashiir Maxamed Ali', grade: 'A', percent: 94 },
        { subject: 'SOMALI', teacher: 'Cali Maxamed Nuur', grade: 'A', percent: 95 },
        { subject: 'TARBIYO', teacher: 'Maryan Yaasiin', grade: 'A', percent: 98 },
        { subject: 'PHYSICS', teacher: 'Maxamed Cumar', grade: 'B+', percent: 88 }
      ];
    }
    
    return subjects.slice(0, 5).map((subj) => {
      const subjGrades = studentGrades.filter((g) => g.subject === subj);
      const avgScore = subjGrades.length > 0
        ? Math.round((subjGrades.reduce((acc, curr) => acc + curr.score, 0) / (subjGrades.length * 50)) * 100)
        : 85;
      const letter = avgScore >= 90 ? 'A' : (avgScore >= 80 ? 'B+' : (avgScore >= 70 ? 'C' : 'D'));
      const teacherInfo = subjectTeacherMap[subj.toUpperCase()] || { name: 'Staff Teacher', room: 'Room 110' };
      
      return {
        subject: subj,
        teacher: teacherInfo.name,
        grade: letter,
        percent: avgScore
      };
    });
  }, [studentGrades]);

  const classSchedule = React.useMemo(() => {
    const defaultSchedule = [
      { period: 'Period 1', time: '08:30 AM', subject: 'MATH', Teacher: 'Bashiir Maxamed Ali', room: 'Room 104' },
      { period: 'Period 2', time: '09:45 AM', subject: 'SOMALI', Teacher: 'Cali Maxamed Nuur', room: 'Room 103' },
      { period: 'Period 3', time: '11:00 AM', subject: 'TARBIYO', Teacher: 'Maryan Yaasiin', room: 'Room 101' },
      { period: 'Period 4', time: '01:15 PM', subject: 'PHYSICS', Teacher: 'Maxamed Cumar', room: 'Lab C' }
    ];
    
    if (courses.length >= 4) {
      return courses.slice(0, 4).map((c, i) => {
        const periodTimes = ['08:30 AM', '09:45 AM', '11:00 AM', '01:15 PM'];
        const teacherInfo = subjectTeacherMap[c.subject.toUpperCase()] || { name: c.teacher, room: 'Room A' };
        return {
          period: `Period ${i + 1}`,
          time: periodTimes[i],
          subject: c.subject,
          Teacher: c.teacher,
          room: teacherInfo.room
        };
      });
    }
    return defaultSchedule;
  }, [courses]);

  return (
    <div className="space-y-6 animate-fade-in" id="student-portal">
      {/* Student Jumbotron Welcome Header */}
      <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 border border-blue-950 text-white rounded-2xl flex flex-col md:flex-row shadow-xl relative overflow-hidden items-center justify-between gap-6">
        <div className="flex items-center gap-5 relative z-10 text-center md:text-left flex-col md:flex-row">
          <img
            alt={student.name}
            src={student.avatar}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
          />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              IBNU KHUZEYMA ACADEMY • {student.id}
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{student.name}</h2>
            <p className="text-xs text-slate-300">
              Grade Level: {student.grade} - Section {student.section} • {student.email}
            </p>
          </div>
        </div>

        {/* Dynamic GPA badge */}
        <div className="bg-white/10 border border-white/10 p-4 px-6 rounded-xl text-center backdrop-blur-md relative z-10 min-w-[130px]" id="scholar-gpa-display">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Enrollment GPA</p>
          <span className="text-2xl md:text-3xl font-bold font-mono text-emerald-400">{student.gpa.toFixed(2)}</span>
          <p className="text-[9px] text-slate-300">Excellent Standing</p>
        </div>

        {/* Backdrop visual art ornament */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">REGISTERED COURSES</span>
            <p className="text-lg font-bold text-slate-800">4 Core subjects</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">TOTAL MARKS EARNED</span>
            <p className="text-lg font-bold text-slate-800">{studentGrades.length} Grades logged</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">ATTENDANCE RATING</span>
            <p className="text-lg font-bold text-slate-800">{student.attendanceRate}%</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium font-sans">OUTSTANDING FEES</span>
            <p className="text-lg font-bold text-emerald-600">${outstandingCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tab toggle buttons */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-md shadow-inner overflow-x-auto">
        {(['grades', 'fees', 'schedule', 'docs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-center capitalize transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'grades' ? 'Marks/Grades' : tab === 'docs' ? '📚 Maktabada PDF' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active class rosters */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Core Curriculum Class Performance</h3>
              <p className="text-xs text-slate-400">Class subject letter grades</p>
            </div>

            <div className="space-y-3">
              {courses.map((crs, i) => (
                <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{crs.subject}</h4>
                    <p className="text-[10px] text-slate-400">Instructor: {crs.teacher}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 p-1 px-2.5 rounded-lg">
                      {crs.grade}
                    </span>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">{crs.percent}% Average</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Published exams marks list */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Grading Journal Logs</h3>
                <p className="text-xs text-slate-400 font-sans">Official timeline log of grades and assignment marks</p>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Examination / Evaluation</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-center">Score %</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-right">Published Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentGrades.length > 0 ? (
                      studentGrades.map((grd) => (
                        <tr key={grd.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className="font-bold text-slate-800 text-xs">{grd.examType} Evaluation</span>
                            <p className="text-[9px] text-slate-400">Ref ID: {grd.id}</p>
                          </td>
                          <td className="p-3 text-slate-700 font-medium">{grd.subject}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">
                            {grd.score}%
                          </td>
                          <td className="p-3 text-center">
                            <span className={`p-1 px-2.5 rounded-md font-mono font-bold ${
                              grd.gradeLetter === 'A' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {grd.gradeLetter}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-400 font-mono font-medium">{grd.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                          No grades documented currently. Keep checking back.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base font-sans">Scholar Ledger & Tuition Statements</h3>
              <p className="text-xs text-slate-400">Review outstanding fee payments, receipts, and past settlements</p>
            </div>
            <span className="p-1 px-3 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-100" id="tuition-balance-summary">
              Paid total: ${student.paidFees.toLocaleString()}
            </span>
          </div>

          <div className="space-y-4">
            {studentFees.map((fee) => (
              <div
                key={fee.id}
                className="p-5 rounded-2xl border border-slate-100 flex justify-between flex-col md:flex-row gap-4 hover:shadow-sm transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      fee.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-150'
                    }`}>
                      {fee.status}
                    </span>
                    <span className="text-xs text-slate-400">Due: {fee.dueDate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{fee.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">Invoice Reference: {fee.id}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                  <div className="md:text-right">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Transaction cost</p>
                    <span className="text-lg font-bold text-slate-800">${fee.amount.toLocaleString()}</span>
                  </div>
                  {fee.status !== 'Paid' ? (
                    <button
                      onClick={() => onOpenPaymentModal(fee)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      Pay Tuition Invoice
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 py-1 rounded-xl flex items-center gap-1 border border-emerald-100/50">
                      💰 Paid via {fee.paymentMethod || 'Portal'} on {fee.paidDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Instructional Schedule</h3>
            <p className="text-xs text-slate-400">Academic day plan for core high school divisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classSchedule.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/50 border border-slate-105 rounded-2xl flex justify-between items-center transition-all hover:bg-slate-50">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono block">
                    {item.period} • {item.time}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm">{item.subject}</h4>
                  <p className="text-xs text-slate-500">Instructor: {item.Teacher}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-xs text-slate-700 bg-white shadow-sm border border-slate-100 p-2 rounded-xl">
                    Room {item.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="mt-4" id="student-curriculum-documents">
          <CurriculumDocumentsHub
            documents={documents}
            role="Student"
            authorName={student.name}
          />
        </div>
      )}
    </div>
  );
}
