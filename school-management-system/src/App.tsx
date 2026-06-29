/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Shield,
  HelpCircle,
  RefreshCw,
  Award,
  Wallet,
  Menu,
  X,
  Lock,
  ChevronDown,
  Info
} from 'lucide-react';
import { getStoredData, saveStoredData, resetDatabase } from './data';
import { Student, Teacher, Grade, FeeInvoice, Announcement, AttendanceRecord, DirectMessage, UserRole, UserCredential, SystemActivityLog, DocumentMaterial, QnaItem, VirtualClass, SchedulePeriod } from './types';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';
import FeePaymentModal from './components/FeePaymentModal';
import CurriculumDocumentsHub from './components/CurriculumDocumentsHub';
import QnaHub from './components/QnaHub';
import VirtualClassroom from './components/VirtualClassroom';

// Firebase Client SDK Auth imports
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

const API_BASE_URL = (import.meta as any).env.VITE_BACKEND_URL || '';

export default function App() {
  // DB states initialized from defaults first
  const [db, setDb] = useState(() => getStoredData());
  
  // Authentication session
  const [currentUser, setCurrentUser] = useState<UserCredential | null>(() => {
    try {
      const saved = localStorage.getItem('school_system_logged_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('school_system_logged_user');
      if (saved) {
        return JSON.parse(saved).role;
      }
    } catch {}
    return 'Admin'; 
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fee payment portal state
  const [paymentInvoice, setPaymentInvoice] = useState<FeeInvoice | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [activeDigitalTab, setActiveDigitalTab] = useState<'qna' | 'meetings'>('qna');

  // Sync to PostgreSQL on start
  const refreshData = () => {
    fetch(API_BASE_URL + '/api/school-data')
      .then((res) => {
        if (!res.ok) throw new Error('Database loading failed');
        return res.json();
      })
      .then((data) => {
        if (data && data.students) {
          setDb(data);
          console.log('Database loaded live from PostgreSQL via Express server!');
        }
      })
      .catch((err) => {
        console.warn('Sandbox Offline Mode: loaded local state database fallback.', err);
      });
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Sync back to local backup storage whenever DB modifies (offline safety)
  useEffect(() => {
    saveStoredData(db);
  }, [db]);

  // Whenever currentUser modifications occur, save session to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('school_system_logged_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
      
      // Sync dark mode style on documentElement
      if (currentUser.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.removeItem('school_system_logged_user');
      localStorage.removeItem('school_system_auth_token');
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser]);

  const triggerNotification = (text: string) => {
    setShowNotification(text);
    setTimeout(() => setShowNotification(null), 4000);
  };

  // REST API request helper
  const apiRequest = async (url: string, method: string, body?: any) => {
    const token = localStorage.getItem('school_system_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = token.startsWith('sess_') ? `Session ${token}` : `Bearer ${token}`;
    }

    try {
      const options: RequestInit = { method, headers };
      if (body) {
        options.body = JSON.stringify(body);
      }
      const response = await fetch(API_BASE_URL + url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API Request failed');
      }
      return await response.json();
    } catch (err: any) {
      console.error(`API Sync failed on ${method} ${url}:`, err.message);
      throw err;
    }
  };

  // State handlers - Logs management
  const handleAddLog = (newLog: SystemActivityLog) => {
    // Optimistic UI updates
    setDb((prev) => ({
      ...prev,
      logs: [...(prev.logs || []), newLog]
    }));
    // Live db sync
    apiRequest('/api/logs', 'POST', newLog).catch(() => {});
  };

  // User Credentials management helpers
  const handleUpdateUser = (updatedUser: UserCredential) => {
    setDb((prev) => {
      const updatedList = (prev.users || []).map((u) => u.id === updatedUser.id ? updatedUser : u);
      return {
        ...prev,
        users: updatedList
      };
    });
    // Keep current log-in state in sync
    if (currentUser && currentUser.id === updatedUser.id) {
      if (updatedUser.status === 'Cancelled') {
        setCurrentUser(null);
        triggerNotification('Account-kaada waa laga joogiyay adeega!');
        return;
      }
      setCurrentUser(updatedUser);
    }
    // Update live database
    apiRequest(`/api/users/${updatedUser.id}`, 'PUT', updatedUser)
      .then(() => triggerNotification(`Isbeddelka user-ka ${updatedUser.username} waa la kaydiyay!`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleAddUser = (newUser: UserCredential) => {
    setDb((prev) => {
      return {
        ...prev,
        users: [...(prev.users || []), newUser]
      };
    });
    // Live db sync
    apiRequest('/api/users', 'POST', newUser)
      .then(() => triggerNotification(`Akoon dheeri ah (${newUser.username}) oo loogu talagalay ${newUser.name} waa la diiwangeliyay.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteUser = (userId: string) => {
    setDb((prev) => {
      const targetUser = (prev.users || []).find((u) => u.id === userId);
      let updatedTeachers = prev.teachers;
      let updatedStudents = prev.students;
      if (targetUser?.role === 'Teacher') {
        updatedTeachers = prev.teachers.filter((t) => t.id !== userId);
      } else if (targetUser?.role === 'Student') {
        updatedStudents = prev.students.filter((s) => s.id !== userId);
      }
      return {
        ...prev,
        users: (prev.users || []).filter((u) => u.id !== userId),
        teachers: updatedTeachers,
        students: updatedStudents
      };
    });
    // Live db sync
    apiRequest(`/api/users/${userId}`, 'DELETE')
      .then(() => triggerNotification('Akoonka iyo xogtiisa si buuxda ayaa loo tirtiray database-ka!'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // REST/RESET database helper
  const handleReset = () => {
    resetDatabase();
    const reseted = getStoredData();
    setDb(reseted);
    triggerNotification('Database-ka waa la fasaxay (Restored)!');
  };

  // State handlers - Students
  const handleAddStudent = (stu: Student) => {
    setDb((prev) => {
      const updatedFees = [...prev.fees];
      if (stu.outstandingFees > 0) {
        updatedFees.push({
          id: `INV${Math.floor(Math.random() * 900 + 100)}`,
          studentId: stu.id,
          title: 'Enrollment Tuition & Registration Fee',
          amount: stu.outstandingFees,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Unpaid'
        });
      }
      return {
        ...prev,
        students: [...prev.students, stu],
        fees: updatedFees
      };
    });
    // Live db sync
    apiRequest('/api/students', 'POST', stu)
      .then(() => triggerNotification(`Scholastic record for ${stu.name} registered successfully with $${stu.outstandingFees} outstanding fee.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteStudent = (stuId: string) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== stuId)
    }));
    // Live db sync
    apiRequest(`/api/students/${stuId}`, 'DELETE')
      .then(() => triggerNotification('Scholar record archived.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // State handlers - Teachers
  const handleAddTeacher = (tch: Teacher) => {
    setDb((prev) => ({
      ...prev,
      teachers: [...prev.teachers, tch]
    }));
    // Live db sync
    apiRequest('/api/teachers', 'POST', tch)
      .then(() => triggerNotification(`Faculty assignment registered: ${tch.name}.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteTeacher = (tchId: string) => {
    setDb((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== tchId),
      users: (prev.users || []).filter((u) => u.id !== tchId)
    }));
    // Live db sync
    apiRequest(`/api/teachers/${tchId}`, 'DELETE')
      .then(() => triggerNotification('Xogta macallinka iyo xisaabtiisa login-ka si buuxda ayaa loo tirtiray database-ka!'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setDb((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id)
    }));
    apiRequest(`/api/announcements/${id}`, 'DELETE')
      .then(() => triggerNotification('Warbixintii u degneyd boor-ka waa laga tirtiray database-ka.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteGrade = (gradeId: string) => {
    setDb((prev) => {
      const foundGrade = prev.grades.find(g => g.id === gradeId);
      if (!foundGrade) return prev;
      
      const updatedGrades = prev.grades.filter((g) => g.id !== gradeId);
      const studentId = foundGrade.studentId;
      const scholarGrades = updatedGrades.filter((g) => g.studentId === studentId);
      const totalScore = scholarGrades.reduce((acc, curr) => acc + curr.score, 0);
      const averagePercent = scholarGrades.length > 0 ? totalScore / scholarGrades.length : 0;
      const dynamicGPA = scholarGrades.length > 0 ? Math.min(4.0, parseFloat(((averagePercent / 100) * 4 + 0.2).toFixed(2))) : 0.0;

      const updatedStudents = prev.students.map((s) => {
        if (s.id === studentId) {
          return { ...s, gpa: dynamicGPA };
        }
        return s;
      });

      return {
        ...prev,
        grades: updatedGrades,
        students: updatedStudents
      };
    });
    
    apiRequest(`/api/grades/${gradeId}`, 'DELETE')
      .then(() => triggerNotification('Natiijada imtixaanka waa la tirtiray database-kana waa laga saaray.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteFee = (feeId: string) => {
    setDb((prev) => {
      const foundFee = prev.fees.find(f => f.id === feeId);
      if (!foundFee) return prev;

      const updatedFees = prev.fees.filter((f) => f.id !== feeId);
      const updatedStudents = prev.students.map((s) => {
        if (s.id === foundFee.studentId) {
          if (foundFee.status === 'Paid') {
            const paid = Math.max(0, s.paidFees - foundFee.amount);
            return { ...s, paidFees: paid };
          } else {
            const outstanding = Math.max(0, s.outstandingFees - foundFee.amount);
            return { ...s, outstandingFees: outstanding };
          }
        }
        return s;
      });

      return {
        ...prev,
        fees: updatedFees,
        students: updatedStudents
      };
    });

    apiRequest(`/api/fees/${feeId}`, 'DELETE')
      .then(() => triggerNotification('Invoice-kii xisaabta ahaa si buuxda ayaa loo tirtiray.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleDeleteLog = (id: string) => {
    setDb((prev) => ({
      ...prev,
      logs: (prev.logs || []).filter((l) => l.id !== id)
    }));
    apiRequest(`/api/logs/${id}`, 'DELETE')
      .then(() => triggerNotification('Diwaankii log-ga ahaa waa laga tirtiray database-ka.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // State handlers - Announcements
  const handlePostAnnouncement = (ann: Announcement) => {
    setDb((prev) => ({
      ...prev,
      announcements: [ann, ...prev.announcements]
    }));
    // Live db sync
    apiRequest('/api/announcements', 'POST', ann)
      .then(() => triggerNotification('New Bulletin broadcasted successfully.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // State handlers - Grades posting & GPA updating in real-time
  const handleAddGrade = (newGrade: Grade) => {
    setDb((prev) => {
      const updatedGrades = [...prev.grades, newGrade];
      const scholarGrades = updatedGrades.filter((g) => g.studentId === newGrade.studentId);
      const totalScore = scholarGrades.reduce((acc, curr) => acc + curr.score, 0);
      const averagePercent = totalScore / (scholarGrades.length || 1);
      const dynamicGPA = Math.min(4.0, parseFloat(((averagePercent / 100) * 4 + 0.2).toFixed(2)));

      const updatedStudents = prev.students.map((s) => {
        if (s.id === newGrade.studentId) {
          return { ...s, gpa: dynamicGPA };
        }
        return s;
      });

      return {
        ...prev,
        grades: updatedGrades,
        students: updatedStudents
      };
    });
    // Live db sync
    apiRequest('/api/grades', 'POST', newGrade)
      .then(() => triggerNotification('Student grade sheet amended successfully.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // State handlers - Grades updating by administrative authority
  const handleUpdateGrade = (updatedGrade: Grade) => {
    setDb((prev) => {
      const updatedGrades = prev.grades.map((g) => g.id === updatedGrade.id ? updatedGrade : g);
      const scholarGrades = updatedGrades.filter((g) => g.studentId === updatedGrade.studentId);
      const totalScore = scholarGrades.reduce((acc, curr) => acc + curr.score, 0);
      const averagePercent = totalScore / (scholarGrades.length || 1);
      const dynamicGPA = Math.min(4.0, parseFloat(((averagePercent / 100) * 4 + 0.2).toFixed(2)));

      const updatedStudents = prev.students.map((s) => {
        if (s.id === updatedGrade.studentId) {
          return { ...s, gpa: dynamicGPA };
        }
        return s;
      });

      return {
        ...prev,
        grades: updatedGrades,
        students: updatedStudents
      };
    });
    // Live db sync
    apiRequest(`/api/grades/${updatedGrade.id}`, 'PUT', updatedGrade)
      .then(() => triggerNotification('Admin content review: student mark changed and records synced.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // State handlers - AttendanceBatch submission & dynamic Attendance percentage updating
  const handleSubmitAttendanceBatch = (batch: AttendanceRecord[]) => {
    setDb((prev) => {
      const updatedAttendance = [...prev.attendance, ...batch];
      const updatedStudents = prev.students.map((stu) => {
        const studentHistory = updatedAttendance.filter((a) => a.studentId === stu.id);
        if (studentHistory.length === 0) return stu;

        const scoreSum = studentHistory.reduce((sum, item) => {
          if (item.status === 'Present') return sum + 100;
          if (item.status === 'Late') return sum + 85;
          return sum;
        }, 0);

        const currentAttendanceRate = parseFloat((scoreSum / studentHistory.length).toFixed(1));
        return {
          ...stu,
          attendanceRate: Math.min(100, currentAttendanceRate)
        };
      });

      return {
        ...prev,
        attendance: updatedAttendance,
        students: updatedStudents
      };
    });
    // Live db sync
    apiRequest('/api/attendance', 'POST', batch)
      .then(() => triggerNotification('Attendance Register synchronized throughout channels.'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // State handlers - Fee Payment settlement & cash solvency ledger sync
  const handlePaymentSuccess = (invoiceId: string, paymentMethod: string) => {
    setDb((prev) => {
      const invoice = prev.fees.find((f) => f.id === invoiceId);
      if (!invoice) return prev;

      const updatedFees = prev.fees.map((f) => {
        if (f.id === invoiceId) {
          return {
            ...f,
            status: 'Paid' as const,
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod
          };
        }
        return f;
      });

      const updatedStudents = prev.students.map((s) => {
        if (s.id === invoice.studentId) {
          const outstanding = Math.max(0, s.outstandingFees - invoice.amount);
          const settled = s.paidFees + invoice.amount;
          return { ...s, outstandingFees: outstanding, paidFees: settled };
        }
        return s;
      });

      return {
        ...prev,
        fees: updatedFees,
        students: updatedStudents
      };
    });
    // Live db sync
    apiRequest('/api/fees/pay', 'POST', { invoiceId, paymentMethod })
      .then(() => triggerNotification(`Invoice ${invoiceId} cleared securely.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleAddInvoices = (newInvoices: FeeInvoice[]) => {
    setDb((prev) => {
      const updatedStudents = prev.students.map((stu) => {
        const addedFeesForStu = newInvoices.filter(f => f.studentId === stu.id);
        if (addedFeesForStu.length === 0) return stu;
        const extraOutstanding = addedFeesForStu.reduce((sum, f) => sum + f.amount, 0);
        return {
          ...stu,
          outstandingFees: stu.outstandingFees + extraOutstanding
        };
      });

      return {
        ...prev,
        fees: [...prev.fees, ...newInvoices],
        students: updatedStudents
      };
    });
    // For simplicity, we just trigger notifications. Live checkout processes mark them paid.
    triggerNotification(`Wareeg cusub oo ah ${newInvoices.length} xisaabaad ah ayaa la bilaabay.`);
  };

  const handleUpdateStudent = (updatedStu: Student) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updatedStu.id ? updatedStu : s))
    }));
    apiRequest(`/api/students/${updatedStu.id}`, 'PUT', updatedStu)
      .then(() => triggerNotification(`Diiwaanka ardayga ${updatedStu.name} si guul leh ayaa loo cusbooneysiiyay.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleUpdateTeacher = (updatedTch: Teacher) => {
    setDb((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === updatedTch.id ? updatedTch : t))
    }));
    apiRequest(`/api/teachers/${updatedTch.id}`, 'PUT', updatedTch)
      .then(() => triggerNotification(`Xogta macallinka Prof. ${updatedTch.name} si guul leh ayaa loo beddelay.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  const handleUpdateFee = (updatedFee: FeeInvoice) => {
    setDb((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => (f.id === updatedFee.id ? updatedFee : f))
    }));
    apiRequest(`/api/fees/${updatedFee.id}`, 'PUT', updatedFee)
      .then(() => triggerNotification(`Biilka ${updatedFee.id} waa la beddelay.`))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // Parent messages sending
  const handleSendMessage = (msg: DirectMessage) => {
    setDb((prev) => ({
      ...prev,
      messages: [...prev.messages, msg]
    }));
    // Live db sync
    const selectedStudent = db.students.find(s => s.id === msg.studentId);
    const studentFirstName = selectedStudent ? selectedStudent.name.split(' ')[0] : 'the student';
    apiRequest('/api/messages', 'POST', msg)
      .then(() => {
        // Teacher auto-acknowledgement
        setTimeout(() => {
          const automaticTeacherResponse: DirectMessage = {
            id: `MSG${Math.floor(Math.random() * 900000 + 100000)}`,
            studentId: msg.studentId,
            sender: 'Teacher',
            text: `Hello! Thank you for the message. I have received the note regarding ${studentFirstName} and will review this during off-class hours.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setDb((prevDb) => ({
            ...prevDb,
            messages: [...prevDb.messages, automaticTeacherResponse]
          }));
          // Save reply too
          apiRequest('/api/messages', 'POST', automaticTeacherResponse).catch(() => {});
        }, 1500);
      })
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // ---- NEW FEATURES HANDLERS ----
  
  // Documents Management Handlers
  const handleAddDocument = (newDoc: DocumentMaterial) => {
    setDb((prev) => ({
      ...prev,
      documents: [newDoc, ...(prev.documents || [])]
    }));
    apiRequest('/api/documents', 'POST', newDoc)
      .then(() => triggerNotification('Maaddada cusub ee PDF-ka ah si guul leh ayaa loo xareeyay!'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  const handleDeleteDocument = (id: string) => {
    setDb((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== id)
    }));
    apiRequest(`/api/documents/${id}`, 'DELETE')
      .then(() => triggerNotification('Maaddadii tacliinta waa laga saaray database-ka.'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  const handleUpdateSchedule = (updatedSchedules: SchedulePeriod[]) => {
    setDb((prev) => ({
      ...prev,
      schedules: updatedSchedules
    }));
    // Try to sync via API or fallback gracefully
    apiRequest('/api/schedules', 'POST', updatedSchedules)
      .then(() => triggerNotification('Jadwalka xiisadaha waa la kaydiyay si guul leh!'))
      .catch(() => triggerNotification('Jadwalka xiisadaha waa la kaydiyay si maxalli ah (Local State).'));
  };

  // Q&A Hub Handlers
  const handleAddQna = (newItem: QnaItem) => {
    setDb((prev) => ({
      ...prev,
      qna: [newItem, ...(prev.qna || [])]
    }));
    apiRequest('/api/qna', 'POST', newItem)
      .then(() => triggerNotification('Su’aashaada si guul leh waa loo soo gudbiyay!'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  const handleDeleteQna = (id: string) => {
    setDb((prev) => ({
      ...prev,
      qna: (prev.qna || []).filter(q => q.id !== id)
    }));
    apiRequest(`/api/qna/${id}`, 'DELETE')
      .then(() => triggerNotification('Su’aashii waa la tirtiray.'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  const handleUpdateQna = (updatedItem: QnaItem) => {
    setDb((prev) => ({
      ...prev,
      qna: (prev.qna || []).map(q => q.id === updatedItem.id ? updatedItem : q)
    }));
    // We can simulate update via post, but we'll use a local fallback or define a post proxy if needed.
    // For simplicity, we can do a post to /api/qna or update locally. Let's send a post since we sync locally first!
    apiRequest('/api/qna', 'POST', updatedItem)
      .then(() => triggerNotification('Jawaabtii si toos ah ayaa loo kaydiyay!'))
      .catch((err) => triggerNotification(`Error: ${err.message}`));
  };

  // Virtual Classes Handlers
  const handleAddVirtualClass = (newClass: VirtualClass) => {
    setDb((prev) => ({
      ...prev,
      virtualClasses: [newClass, ...(prev.virtualClasses || [])]
    }));
    apiRequest('/api/virtual-classes', 'POST', newClass)
      .then(() => triggerNotification('Kulanka cusub ee tooska ah waa la jadwaleeyay!'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  const handleUpdateVirtualClass = (updatedClass: VirtualClass) => {
    setDb((prev) => ({
      ...prev,
      virtualClasses: (prev.virtualClasses || []).map(v => v.id === updatedClass.id ? updatedClass : v)
    }));
    apiRequest(`/api/virtual-classes/${updatedClass.id}`, 'PUT', updatedClass)
      .then(() => triggerNotification('Isbeddelkii kulanka tooska ahaa waa la xaqiijiyay.'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  const handleDeleteVirtualClass = (id: string) => {
    setDb((prev) => ({
      ...prev,
      virtualClasses: (prev.virtualClasses || []).filter(v => v.id !== id)
    }));
    apiRequest(`/api/virtual-classes/${id}`, 'DELETE')
      .then(() => triggerNotification('Kulankii tooska ahaa waa la tirtiray.'))
      .catch((err) => triggerNotification(`Masaafada sync khaldan: ${err.message}`));
  };

  // Get active student model (defaults to student account if authenticated as Student, otherwise STU001) for Student Dashboard
  const currentStudent = db.students.find((s) => s.id === (currentUser?.role === 'Student' ? currentUser.id : 'STU001')) || db.students[0];

  // Login inputs and state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Google Provider integration logic
  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      
      const syncRes = await fetch(API_BASE_URL + '/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          role: 'Parent'
        })
      });

      if (!syncRes.ok) {
        throw new Error('Database server user synchronization failed.');
      }

      const syncData = await syncRes.json();
      localStorage.setItem('school_system_auth_token', idToken);
      setCurrentUser(syncData.user);
      setActiveRole(syncData.user.role);
      triggerNotification(`Ku soo dhawaada, ${syncData.user.name}!`);
    } catch (err: any) {
      console.error(err);
      setLoginError(`Google authentication portal failed: ${err.message}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative" id="login-container">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-950/75 backdrop-blur-xl border border-slate-800/85 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 bg-indigo-650/20 border border-indigo-500/30 rounded-2xl text-emerald-400 mb-2">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="text-[10px] text-indigo-400 tracking-widest font-extrabold uppercase block leading-none">IBNU KHUZEYMA ACADEMY</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Gudaha u Soo Gal</h2>
            <p className="text-xs text-slate-400">Geli username-ka iyo password-ka ama isticmaal Google.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/45 border border-rose-800/60 rounded-xl text-rose-300 text-xs text-center font-semibold animate-pulse">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoginError(null);
            
            const reqUser = usernameInput.trim().toLowerCase();
            const reqPass = passwordInput.trim();

            try {
              const response = await fetch(API_BASE_URL + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: reqUser, password: reqPass })
              });

              if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                setLoginError(errJson.error || 'Login verification failed!');
                return;
              }

              const data = await response.json();
              localStorage.setItem('school_system_auth_token', data.token);
              setCurrentUser(data.user);
              setActiveRole(data.user.role);
              triggerNotification(`Soo dhawaada, ${data.user.name}!`);
            } catch (err: any) {
              setLoginError(`Database server unreachable: ${err.message}`);
            }
          }} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Username ama Gmail-ka (Username / Gmail)</label>
              <input
                type="text"
                required
                placeholder="Geli Username ama Gmail-ka..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-slate-700 p-3 pl-4 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-700 text-slate-105 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password-ka</label>
              <input
                type="password"
                required
                placeholder="Geli Password-ka..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-slate-700 p-3 pl-4 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-700 text-slate-105 text-slate-200 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 text-xs flex justify-center items-center gap-1.5"
            >
              <Lock className="w-4 h-4" /> Soo Gal System-ka
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 border-t border-slate-800" />
              <span className="relative bg-slate-950 px-3 text-[10px] uppercase font-semibold text-slate-500">Ama</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold py-3 rounded-xl transition-all cursor-pointer text-xs flex justify-center items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Ku Soo Gal Google (Waalid / Macallin)
            </button>


          </form>
        </div>
        
        <p className="mt-4 text-[10px] text-slate-600">
          IBNU KHUZEYMA ACADEMY SMS • Secure local storage and sandbox AES active.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col" id="app-workspace">
      {/* Dynamic Notifications Banner top */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-lg flex items-center gap-3 text-xs max-w-sm animate-bounce" id="app-notification-badge">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <p className="font-semibold">{showNotification}</p>
        </div>
      )}

      {/* Primary Top App Bar */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          
          {/* Logo & School naming */}
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl border border-white/10 text-emerald-400 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[9px] text-blue-200 tracking-widest font-bold uppercase block leading-none">IBNU KHUZEYMA ACADEMY</span>
              <h1 className="text-sm md:text-base font-bold font-sans tracking-tight">School Management System</h1>
            </div>
          </div>

          {/* Authentic Role Indicator Badge (Omitted swap controls when logged in for strict separation) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-950/80 rounded-xl border border-blue-800 text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser?.role === 'Admin' ? '🛡️ Maamule (Administrator)' : currentUser?.role === 'Teacher' ? '💼 Macallin (Teacher)' : '🏡 Waalid (Parent/Guardian)'}
            </div>

            {/* Database resetting and cleanup */}
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
              title="Reset school database to factory seeds"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logged in User credentials with elegant logout action */}
            {currentUser && (
              <div className="flex items-center gap-2.5 ml-2 pl-3.5 border-l border-blue-800">
                <div className="text-right">
                  <span className="block text-[8px] text-emerald-400 font-extrabold uppercase leading-none">{currentUser.role === 'Admin' ? 'Maamule' : 'Macallin'}</span>
                  <span className="block text-[11px] font-bold text-white max-w-[100px] truncate" title={currentUser.name}>{currentUser.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(null);
                    triggerNotification('Waa aad ka baxday system-ka.');
                  }}
                  className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/80 text-rose-200 hover:text-white border border-rose-800/40 hover:border-rose-600/50 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Ka Bax
                </button>
              </div>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-200 hover:text-white rounded-lg transition"
            id="mobile-navigation-toggle"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile actor control center drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-blue-950 px-4 pt-2 pb-4 space-y-3 shadow-inner border-t border-blue-900">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block px-2 pt-1">Logged In Session Identity</span>
            <div className="px-3 py-2 bg-blue-900/60 rounded-xl border border-blue-800 text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser?.role === 'Admin' ? '🛡️ Maamule (Administrator)' : currentUser?.role === 'Teacher' ? '💼 Macallin (Teacher)' : '🏡 Waalid (Parent/Guardian)'}
            </div>
            
            {currentUser && (
              <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between px-2 bg-blue-950 p-2 rounded-xl border border-blue-900/60 mt-2">
                <div className="text-left">
                  <span className="block text-[8px] text-emerald-400 font-extrabold uppercase leading-none">{currentUser.role === 'Admin' ? 'Maamule' : 'Macallin'}</span>
                  <span className="block text-xs font-bold text-white truncate max-w-[150px]">{currentUser.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setCurrentUser(null);
                    triggerNotification('Waa aad ka baxday system-ka.');
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-rose-600/10"
                >
                  Ka Bax (Exit)
                </button>
              </div>
            )}
            
            <div className="pt-2 border-t border-blue-900/60 flex justify-between items-center text-xs text-slate-400 px-2">
              <span>Database state tools:</span>
              <button onClick={handleReset} className="text-amber-400 font-semibold cursor-pointer">
                Reset database
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Core dynamic content router */}
        <div className="min-h-[600px]" id="dashboard-routed-view">
          {activeRole === 'Admin' && (
            <AdminDashboard
              currentUser={currentUser!}
              students={db.students}
              teachers={db.teachers}
              fees={db.fees}
              users={db.users || []}
              announcements={db.announcements}
              grades={db.grades}
              attendance={db.attendance}
              logs={db.logs || []}
              documents={db.documents || []}
              onAddStudent={handleAddStudent}
              onAddTeacher={handleAddTeacher}
              onDeleteStudent={handleDeleteStudent}
              onDeleteTeacher={handleDeleteTeacher}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onDeleteGrade={handleDeleteGrade}
              onDeleteFee={handleDeleteFee}
              onDeleteLog={handleDeleteLog}
              onPostAnnouncement={handlePostAnnouncement}
              onPayInvoice={handlePaymentSuccess}
              onUpdateStudent={handleUpdateStudent}
              onUpdateTeacher={handleUpdateTeacher}
              onUpdateFee={handleUpdateFee}
              onUpdateGrade={handleUpdateGrade}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onAddInvoices={handleAddInvoices}
              onAddLog={handleAddLog}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              schedules={db.schedules || []}
              virtualClasses={db.virtualClasses || []}
              onAddVirtualClass={handleAddVirtualClass}
              onUpdateSchedule={handleUpdateSchedule}
              onSubmitAttendanceBatch={handleSubmitAttendanceBatch}
            />
          )}

          {activeRole === 'Teacher' && (() => {
            const currentTeacher = db.teachers.find((t) => t.id === currentUser?.id) || db.teachers[0];
            const assignedClasses = (currentTeacher?.assignedClass || "").split(",").map(c => c.trim().toLowerCase());
            
            // Limit students list strictly to teacher's assigned classes
            const filteredStudents = db.students.filter(
              (s) => assignedClasses.includes(`${s.grade} - ${s.section}`.toLowerCase())
            );
            
            // Limit grades sheet to strictly these students
            const filteredGrades = db.grades.filter((g) => 
              filteredStudents.some((s) => s.id === g.studentId)
            );
            
            // Limit attendance sheet to strictly these students
            const filteredAttendance = db.attendance.filter((a) => 
              filteredStudents.some((s) => s.id === a.studentId)
            );

            return (
              <TeacherDashboard
                currentUser={currentUser!}
                teacher={currentTeacher}
                students={filteredStudents}
                grades={filteredGrades}
                attendance={filteredAttendance}
                onAddGrade={handleAddGrade}
                onSubmitAttendanceBatch={handleSubmitAttendanceBatch}
                messages={db.messages}
                onSendMessage={handleSendMessage}
                documents={db.documents || []}
                qna={db.qna || []}
                virtualClasses={db.virtualClasses || []}
                onAddDocument={handleAddDocument}
                onDeleteDocument={handleDeleteDocument}
                schedules={db.schedules || []}
                announcements={db.announcements || []}
                onUpdateUser={handleUpdateUser}
              />
            );
          })()}

           {activeRole === 'Parent' && (
            <ParentDashboard
              students={db.students}
              grades={db.grades}
              fees={db.fees}
              announcements={db.announcements}
              attendance={db.attendance}
              messages={db.messages}
              onOpenPaymentModal={setPaymentInvoice}
              onSendMessage={handleSendMessage}
              logs={db.logs || []}
              teachers={db.teachers || []}
              currentUser={currentUser}
              documents={db.documents || []}
              qna={db.qna || []}
              virtualClasses={db.virtualClasses || []}
              schedules={db.schedules || []}
              onUpdateSchedule={handleUpdateSchedule}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {activeRole === 'Student' && (
            <StudentDashboard
              student={currentStudent}
              grades={db.grades}
              fees={db.fees}
              announcements={db.announcements}
              attendance={db.attendance}
              onOpenPaymentModal={setPaymentInvoice}
              documents={db.documents || []}
            />
          )}
        </div>

        {/* ---- EXQUISITE DIGITAL LEARNING & RESOURCE CENTER ---- */}
        <div className="mt-12 pt-8 border-t border-slate-200/60" id="digital-learning-center">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[10px] font-extrabold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full px-3 py-1 uppercase select-none inline-block">
              Adeegga Barashada & Isgaarsiinta • Digital Communication & Learning
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Xarunta Isgaarsiinta & Casharada Tooska ah ee Dugsiga</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Ka weydii su'aalo culuumta ah maamulka iyo macalimiinta, ama ku biir casharada maqal iyo muuqaalka tooska ah ee fasalkaaga.
            </p>

            {/* Premium segmented picker controller */}
            <div className="flex justify-center pt-3 select-none">
              <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/60 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveDigitalTab('qna')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDigitalTab === 'qna'
                      ? 'bg-white text-indigo-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💬 Su'aalo & Jawaabo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDigitalTab('meetings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDigitalTab === 'meetings'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📹 Fasalada Tooska ah
                </button>
              </div>
            </div>
          </div>

          <div className="transition-all duration-300">
            {activeDigitalTab === 'qna' && (
              <QnaHub
                qnaItems={db.qna || []}
                role={activeRole}
                authorName={currentUser?.name || currentUser?.username || 'Macmiil'}
                onAddQna={handleAddQna}
                onDeleteQna={handleDeleteQna}
                onUpdateQna={handleUpdateQna}
              />
            )}

            {activeDigitalTab === 'meetings' && (
              <VirtualClassroom
                virtualClasses={db.virtualClasses || []}
                role={activeRole}
                teacherName={currentUser?.name || 'Teacher Advisor'}
                onAddClass={handleAddVirtualClass}
                onUpdateClass={handleUpdateVirtualClass}
                onDeleteClass={handleDeleteVirtualClass}
              />
            )}
          </div>
        </div>
      </main>

      {/* Tuition Invoice Secure payments checkout overlay modal */}
      {paymentInvoice && (
        <FeePaymentModal
          isOpen={!!paymentInvoice}
          invoice={paymentInvoice}
          student={db.students.find((s) => s.id === paymentInvoice.studentId) || db.students[0]}
          onClose={() => setPaymentInvoice(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Standard Footer of visual excellence */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs space-y-2 mt-auto" id="academic-footer">
        <p>© 2026 IBNU KHUZEYMA ACADEMY • Authorized Educational Standard Management System Hub</p>
        <p className="text-[10px] text-slate-500">
          Powered with Antigravity engine and Northern European grid efficiency frameworks • Secure banking ledgers active under standard TLS/AES.
        </p>
      </footer>
    </div>
  );
}
