import { db } from './index.ts';
import { users, students, teachers, attendance, grades, feeInvoices, announcements, directMessages, systemLogs, documentMaterials, qnaHub, virtualClasses, schedules } from './schema.ts';
import { 
  INITIAL_USERS, 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_GRADES, 
  INITIAL_FEES, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_MESSAGES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LOGS,
  INITIAL_DOCUMENTS,
  INITIAL_QNAS,
  INITIAL_VIRTUAL_CLASSES,
  INITIAL_SCHEDULES
} from '../data.ts';

// Dynamic chunking for safe bulk inserts
async function chunkInsert<T extends any>(table: any, items: T[], chunkSize = 100) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await db.insert(table).values(chunk).onConflictDoNothing();
  }
}

export async function seedDatabase() {
  try {
    console.log('Checking database table contents before seeding...');
    
    // Check if schedules already have some data
    const scheduleCountResult = await db.select().from(schedules).limit(1);
    if (scheduleCountResult.length === 0) {
      console.log('Schedules table is empty. Seeding initial schedules...');
      await chunkInsert(schedules, INITIAL_SCHEDULES.map(s => ({
        id: s.id,
        grade: s.grade,
        academicYear: s.academicYear,
        day: s.day,
        periodIndex: s.periodIndex,
        subject: s.subject,
        teacherName: s.teacherName
      })), 100);
    }

    // Check if users already have some data
    const userCountResult = await db.select().from(users).limit(1);
    if (userCountResult.length > 0) {
      console.log('Database already has data. Skipping main seed phase.');
      return;
    }
    
    console.log('Database is empty. Initiating data seed sequence...');
    
    // 1. Seed users
    console.log(`Seeding ${INITIAL_USERS.length} users...`);
    const usersToInsert = INITIAL_USERS.map(u => ({
      id: u.id,
      username: u.username,
      password: (u.password && u.password !== '********' && u.password !== '•') ? u.password : '123',
      role: u.role,
      name: u.name,
      status: u.status || 'Active',
      email: u.email || null,
      uid: null
    }));
    await chunkInsert(users, usersToInsert, 100);
    
    // 2. Seed teachers
    console.log(`Seeding ${INITIAL_TEACHERS.length} teachers...`);
    const teachersToInsert = INITIAL_TEACHERS.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      assignedClass: t.assignedClass,
      email: t.email,
      phone: t.phone,
      avatar: t.avatar || null,
      status: t.status || 'Active',
      salary: t.salary || 0,
      hireDate: t.hireDate
    }));
    await chunkInsert(teachers, teachersToInsert, 100);

    // 3. Seed students
    console.log(`Seeding ${INITIAL_STUDENTS.length} students...`);
    const studentsToInsert = INITIAL_STUDENTS.map(s => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      section: s.section,
      email: s.email,
      phone: s.phone,
      avatar: s.avatar || null,
      attendanceRate: s.attendanceRate,
      outstandingFees: s.outstandingFees,
      paidFees: s.paidFees,
      gpa: s.gpa,
      status: s.status || 'Active',
      parentName: s.parentName,
      parentEmail: s.parentEmail,
      address: s.address
    }));
    await chunkInsert(students, studentsToInsert, 50);

    // 4. Seed fee invoices
    console.log(`Seeding ${INITIAL_FEES.length} invoices...`);
    const feesToInsert = INITIAL_FEES.map(f => ({
      id: f.id,
      studentId: f.studentId,
      title: f.title,
      amount: f.amount,
      dueDate: f.dueDate,
      status: f.status,
      paidDate: f.paidDate || null,
      paymentMethod: f.paymentMethod || null
    }));
    await chunkInsert(feeInvoices, feesToInsert, 50);

    // 5. Seed announcements
    console.log(`Seeding ${INITIAL_ANNOUNCEMENTS.length} announcements...`);
    const announcementsToInsert = INITIAL_ANNOUNCEMENTS.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category,
      date: a.date,
      author: a.author,
      targetAudience: a.targetAudience
    }));
    await chunkInsert(announcements, announcementsToInsert, 50);

    // 6. Seed messages
    console.log(`Seeding ${INITIAL_MESSAGES.length} messages...`);
    const messagesToInsert = INITIAL_MESSAGES.map(m => ({
      id: m.id,
      studentId: m.studentId,
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp
    }));
    await chunkInsert(directMessages, messagesToInsert, 50);

    // 7. Seed attendance records
    console.log(`Seeding ${INITIAL_ATTENDANCE.length} attendance records...`);
    const attendanceToInsert = INITIAL_ATTENDANCE.map(at => ({
      id: at.id,
      date: at.date,
      studentId: at.studentId,
      status: at.status,
      remarks: at.remarks || null
    }));
    await chunkInsert(attendance, attendanceToInsert, 50);

    // 8. Seed system logs
    console.log(`Seeding ${INITIAL_LOGS.length} system logs...`);
    const logsToInsert = INITIAL_LOGS.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      operator: l.operator,
      role: l.role,
      category: l.category,
      description: l.description,
      academicYear: l.academicYear,
      status: l.status
    }));
    await chunkInsert(systemLogs, logsToInsert, 50);

    // 9. Seed grades (can be large, chunk of 100-200)
    console.log(`Seeding ${INITIAL_GRADES.length} student grade entries...`);
    const gradesToInsert = INITIAL_GRADES.map((g, index) => ({
      id: g.id || `GRD-SEED-${index}`,
      studentId: g.studentId,
      subject: g.subject,
      score: g.score,
      gradeLetter: g.gradeLetter,
      examType: g.examType,
      date: g.date,
      academicYear: g.academicYear || '2026-2027'
    }));
    await chunkInsert(grades, gradesToInsert, 250);

    // 10. Seed Document Materials
    console.log(`Seeding ${INITIAL_DOCUMENTS.length} document materials...`);
    await chunkInsert(documentMaterials, INITIAL_DOCUMENTS.map(d => ({
      id: d.id,
      title: d.title,
      subject: d.subject,
      grade: d.grade,
      content: d.content,
      url: d.url,
      date: d.date,
      author: d.author
    })), 50);

    // 11. Seed Q&A Hub
    console.log(`Seeding ${INITIAL_QNAS.length} Q&A items...`);
    await chunkInsert(qnaHub, INITIAL_QNAS.map(q => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      subject: q.subject,
      askedBy: q.askedBy,
      answeredBy: q.answeredBy,
      date: q.date,
      category: q.category
    })), 50);

    // 12. Seed Virtual Classes
    console.log(`Seeding ${INITIAL_VIRTUAL_CLASSES.length} virtual class sessions...`);
    await chunkInsert(virtualClasses, INITIAL_VIRTUAL_CLASSES.map(v => ({
      id: v.id,
      subject: v.subject,
      grade: v.grade,
      teacherName: v.teacherName,
      topic: v.topic,
      dateTime: v.dateTime,
      meetUrl: v.meetUrl,
      isLive: String(v.isLive)
    })), 50);

    // 13. Seed Schedules/Timetables
    console.log(`Seeding ${INITIAL_SCHEDULES.length} schedules/timetables...`);
    await chunkInsert(schedules, INITIAL_SCHEDULES.map(s => ({
      id: s.id,
      grade: s.grade,
      academicYear: s.academicYear,
      day: s.day,
      periodIndex: s.periodIndex,
      subject: s.subject,
      teacherName: s.teacherName
    })), 100);

    console.log('Database seeded successfully and initialized for production!');
  } catch (error) {
    console.error('Error occurred during database seeding operations:', error);
  }
}
