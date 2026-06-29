/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  email: string;
  phone: string;
  avatar?: string;
  attendanceRate: number; // calculated % of attendance
  outstandingFees: number;
  paidFees: number;
  gpa: number;
  status: 'Active' | 'Suspended';
  parentName: string;
  parentEmail: string;
  address: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  assignedClass: string; // e.g., "10th - A"
  email: string;
  phone: string;
  avatar?: string;
  status: 'Active' | 'On Leave';
  salary: number;
  hireDate: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number; // 0 - 100
  gradeLetter: string; // A, B, C, D, F
  examType: 'Homework' | 'Quiz' | 'Midterm' | 'Final';
  date: string; // YYYY-MM-DD
  academicYear?: string; // e.g., "2025-2026" or "2026-2027"
}

export interface SystemActivityLog {
  id: string;
  timestamp: string; // ISO string or exact time
  operator: string;  // Who did it
  role: string;      // Admin, Teacher, Parent, Student, System
  category: 'Attendance' | 'Grade' | 'Payment' | 'System' | 'Session';
  description: string;
  academicYear: string;
  status: 'In Progress' | 'Completed';
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paidDate?: string;
  paymentMethod?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Administrative' | 'Event' | 'Urgent';
  date: string;
  author: string;
  targetAudience: 'All' | 'Teachers' | 'Parents' | 'Students';
}

export interface DirectMessage {
  id: string;
  studentId: string; // link to context child
  sender: 'Parent' | 'Teacher';
  text: string;
  timestamp: string; // "10:30 AM" or similar
}

export interface UserCredential {
  id: string;       // Matches Teacher.id, or 'ADMIN-USER' or similar
  username: string;
  password: string;
  role: UserRole;
  name: string;     // Staff name for context
  status: 'Active' | 'Cancelled'; // Active or cancelled (disabled)
  email?: string;   // Optional email (especially for parents/staff)
  theme?: 'light' | 'dark';      // Preferred UI theme
  language?: 'somali' | 'english'; // Preferred language
  avatarUrl?: string; // Avatar icon or custom URL
}

export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Parent';

export interface DocumentMaterial {
  id: string;
  title: string;
  subject: string;
  grade: string;
  content: string;
  url: string; // URL link or mock filename
  date: string; // YYYY-MM-DD
  author: string;
}

export interface QnaItem {
  id: string;
  question: string;
  answer: string;
  subject: string;
  askedBy: string;
  answeredBy: string;
  date: string;
  category: string;
}

export interface VirtualClass {
  id: string;
  subject: string;
  grade: string;
  teacherName: string;
  topic: string;
  dateTime: string;
  meetUrl: string;
  isLive: boolean;
}

export interface SchedulePeriod {
  id: string;
  grade: string; // e.g., "Grade 10" or "Grade 10 - A"
  academicYear: string; // e.g., "2026-2027"
  day: string; // "Axad", "Isniin", "Talaado", "Arbaco", "Khamiis"
  periodIndex: number; // 1 to 7
  subject: string; // e.g., "Math"
  teacherName: string; // e.g., "Bashiir Maxamed Ali"
}

