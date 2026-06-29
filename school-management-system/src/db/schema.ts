import { pgTable, text, integer, doublePrecision, timestamp, serial } from 'drizzle-orm/pg-core';

// 1. Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Will match user ID or Custom Username
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(), // 'Admin' | 'Teacher' | 'Student' | 'Parent'
  name: text('name').notNull(),
  status: text('status').notNull().default('Active'), // 'Active' | 'Cancelled'
  email: text('email'),
  uid: text('uid') // Optional Firebase Auth string
});

// 2. Students table
export const students = pgTable('students', {
  id: text('id').primaryKey(), // STU001...
  name: text('name').notNull(),
  grade: text('grade').notNull(),
  section: text('section').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar'),
  attendanceRate: doublePrecision('attendance_rate').notNull().default(100.0),
  outstandingFees: doublePrecision('outstanding_fees').notNull().default(0.0),
  paidFees: doublePrecision('paid_fees').notNull().default(0.0),
  gpa: doublePrecision('gpa').notNull().default(0.0),
  status: text('status').notNull().default('Active'),
  parentName: text('parent_name').notNull(),
  parentEmail: text('parent_email').notNull(),
  address: text('address').notNull()
});

// 3. Teachers table
export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(), // TCH001...
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  assignedClass: text('assigned_class').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar'),
  status: text('status').notNull().default('Active'),
  salary: integer('salary').notNull().default(0),
  hireDate: text('hire_date').notNull()
});

// 4. Attendance Records table
export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(), // ATT001 or serial
  date: text('date').notNull(), // YYYY-MM-DD
  studentId: text('student_id').notNull(),
  status: text('status').notNull(), // 'Present' | 'Absent' | 'Late'
  remarks: text('remarks')
});

// 5. Grades table
export const grades = pgTable('grades', {
  id: text('id').primaryKey(), // GRD-MID-OLD-STU001...
  studentId: text('student_id').notNull(),
  subject: text('subject').notNull(),
  score: doublePrecision('score').notNull(),
  gradeLetter: text('grade_letter').notNull(),
  examType: text('exam_type').notNull(), // 'Homework' | 'Quiz' | 'Midterm' | 'Final'
  date: text('date').notNull(),
  academicYear: text('academic_year').notNull()
});

// 6. Fee Invoices table
export const feeInvoices = pgTable('fee_invoices', {
  id: text('id').primaryKey(), // INV101...
  studentId: text('student_id').notNull(),
  title: text('title').notNull(),
  amount: doublePrecision('amount').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull(), // 'Paid' | 'Unpaid' | 'Overdue'
  paidDate: text('paid_date'),
  paymentMethod: text('payment_method')
});

// 7. Announcements table
export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(), // ANC001...
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // 'Academic' | 'Administrative' | 'Event' | 'Urgent'
  date: text('date').notNull(),
  author: text('author').notNull(),
  targetAudience: text('target_audience').notNull() // 'All' | 'Teachers' | 'Parents' | 'Students'
});

// 8. Direct Messages table
export const directMessages = pgTable('direct_messages', {
  id: text('id').primaryKey(), // MSG001...
  studentId: text('student_id').notNull(),
  sender: text('sender').notNull(), // 'Parent' | 'Teacher'
  text: text('text').notNull(),
  timestamp: text('timestamp').notNull()
});

// 9. System Activity Logs table
export const systemLogs = pgTable('system_logs', {
  id: text('id').primaryKey(), // LOG-001...
  timestamp: text('timestamp').notNull(),
  operator: text('operator').notNull(),
  role: text('role').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  academicYear: text('academic_year').notNull(),
  status: text('status').notNull() // 'In Progress' | 'Completed'
});

// 10. Document Materials table (PDF / Class Resources)
export const documentMaterials = pgTable('document_materials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  grade: text('grade').notNull(),
  content: text('content').notNull(),
  url: text('url').notNull(), // Link to manual document / file / PDF
  date: text('date').notNull(), // YYYY-MM-DD
  author: text('author').notNull() // Admin or Teacher
});

// 11. Q&A Questions and Answers table
export const qnaHub = pgTable('qna_hub', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  subject: text('subject').notNull(),
  askedBy: text('asked_by').notNull(),
  answeredBy: text('answered_by').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull()
});

// 12. Virtual Classes table (Remote learning stream room)
export const virtualClasses = pgTable('virtual_classes', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  grade: text('grade').notNull(),
  teacherName: text('teacher_name').notNull(),
  topic: text('topic').notNull(),
  dateTime: text('date_time').notNull(),
  meetUrl: text('meet_url').notNull(),
  isLive: text('is_live').notNull().default('false') // Stored as text 'true' / 'false' for easiest portability
});

// 13. Schedules/Timetable table
export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  grade: text('grade').notNull(), // e.g., "Grade 10" or "Grade 10 - A"
  academicYear: text('academic_year').notNull(), // e.g., "2026-2027"
  day: text('day').notNull(), // "Sabti", "Axad", "Isniin", "Talaado", "Arbaco"
  periodIndex: integer('period_index').notNull(), // 1 to 7
  subject: text('subject').notNull(), // e.g., "Math"
  teacherName: text('teacher_name').notNull() // e.g., "Bashiir Maxamed Ali"
});


