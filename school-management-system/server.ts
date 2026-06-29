import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { 
  users, 
  students, 
  teachers, 
  attendance, 
  grades, 
  feeInvoices, 
  announcements, 
  directMessages, 
  systemLogs,
  documentMaterials,
  qnaHub,
  virtualClasses,
  schedules
} from './src/db/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { seedDatabase } from './src/db/seed.ts';
import { requireAuth, createSessionToken, removeSession, AuthRequest } from './src/middleware/auth.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Essential parsers
  app.use(express.json());
  app.use(cors({
    origin: '*', // Allow all origins for the deployed frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Database Seed Initializer on boot
  try {
    await seedDatabase();
  } catch (seedErr) {
    console.error('Failed to trigger database seeding:', seedErr);
  }

  // ---- 1. AUTHENTICATION API ----

  // Check login credentials from Postgres database 'users' table
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const cleanUsername = username.trim().toLowerCase();
      const foundUsers = await db.select().from(users).where(eq(sql`LOWER(${users.username})`, cleanUsername)).limit(1);
      if (foundUsers.length === 0) {
        return res.status(401).json({ error: 'User-ka aad gelisey laguma dhex heli karo database-ka!' });
      }

      const userRecord = foundUsers[0];
      if (userRecord.password !== password) {
        return res.status(401).json({ error: 'Password-ka aad gelisey waa khaldan yahay!' });
      }

      if (userRecord.status === 'Cancelled') {
        return res.status(401).json({ error: 'Akoon-kaaga waa ka joojiyay adeega maamulka!' });
      }

      // Generate a memory session token
      const token = createSessionToken({
        id: userRecord.id,
        username: userRecord.username,
        role: userRecord.role,
        name: userRecord.name,
        email: userRecord.email
      });

      res.json({
        user: {
          id: userRecord.id,
          username: userRecord.username,
          role: userRecord.role,
          name: userRecord.name,
          email: userRecord.email,
          status: userRecord.status
        },
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'System internal error occurred during login verification' });
    }
  });

  // Handle Firebase user sync/lookup
  app.post('/api/auth/firebase-sync', async (req, res) => {
    const { uid, email, name, role } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing sync inputs' });
    }

    try {
      // Find user by email or uid
      const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      let userRecord;

      if (foundUsers.length > 0) {
        userRecord = foundUsers[0];
        // Ensure uid is locked inside the user record
        if (!userRecord.uid) {
          await db.update(users).set({ uid }).where(eq(users.id, userRecord.id));
          userRecord.uid = uid;
        }
      } else {
        // Automatically register Google login as Parent if unknown
        const autoId = `PARENT-${Math.random().toString(36).substring(4, 9).toUpperCase()}`;
        const username = email.split('@')[0];
        const inserted = await db.insert(users).values({
          id: autoId,
          username,
          password: 'google-auth-no-local-pass',
          role: role || 'Parent',
          name: name || email,
          status: 'Active',
          email,
          uid
        }).returning();
        userRecord = inserted[0];
      }

      res.json({
        user: {
          id: userRecord.id,
          username: userRecord.username,
          role: userRecord.role,
          name: userRecord.name,
          email: userRecord.email,
          status: userRecord.status
        }
      });
    } catch (err) {
      console.error('Firebase sync error:', err);
      res.status(500).json({ error: 'Database synchronization failed' });
    }
  });

  // ---- 2. SCHOOL CORE DATA APIS (PROTECTED REST API ENDPOINTS) ----

  // Fetch complete dataset of the school (used by the frontend state cache)
  app.get('/api/school-data', async (req, res) => {
    try {
      const allStudents = await db.select().from(students);
      const allTeachers = await db.select().from(teachers);
      const allGrades = await db.select().from(grades);
      const allFees = await db.select().from(feeInvoices);
      const allAnnouncements = await db.select().from(announcements);
      const allMessages = await db.select().from(directMessages);
      const allAttendance = await db.select().from(attendance);
      const rawUsers = await db.select().from(users);
      const allUsers = rawUsers.map(u => ({
        ...u,
        password: '********'
      }));
      const allLogs = await db.select().from(systemLogs);
      
      // New tables
      const allDocuments = await db.select().from(documentMaterials);
      const allQnas = await db.select().from(qnaHub);
      const allVirtualClasses = await db.select().from(virtualClasses);
      const allSchedules = await db.select().from(schedules);

      res.json({
        students: allStudents,
        teachers: allTeachers,
        grades: allGrades,
        fees: allFees,
        announcements: allAnnouncements,
        messages: allMessages,
        attendance: allAttendance,
        users: allUsers,
        logs: allLogs,
        documents: allDocuments,
        qna: allQnas,
        virtualClasses: allVirtualClasses,
        schedules: allSchedules
      });
    } catch (err: any) {
      console.error('Error fetching comprehensive dataset:', err);
      res.status(500).json({ error: 'Database read operation failed', details: err.message });
    }
  });

  // Students Rest APIs
  app.post('/api/students', async (req, res) => {
    try {
      const newStudent = req.body;
      const inserted = await db.insert(students).values(newStudent).returning();
      
      // Auto-generate Fee Invoice if outstanding fees exists
      if (newStudent.outstandingFees > 0) {
        await db.insert(feeInvoices).values({
          id: `INV${Math.floor(Math.random() * 9000 + 1000)}`,
          studentId: newStudent.id,
          title: 'Enrollment Tuition & Registration Fee',
          amount: newStudent.outstandingFees,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Unpaid'
        });
      }

      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed to register student record:', err);
      res.status(500).json({ error: 'Database insert student record failed' });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      const studentId = req.params.id;
      await db.delete(students).where(eq(students.id, studentId));
      await db.delete(grades).where(eq(grades.studentId, studentId));
      await db.delete(feeInvoices).where(eq(feeInvoices.studentId, studentId));
      await db.delete(directMessages).where(eq(directMessages.studentId, studentId));
      await db.delete(attendance).where(eq(attendance.studentId, studentId));
      await db.delete(users).where(eq(users.id, studentId));
      res.json({ success: true, message: 'Student and related grades, invoices, messages and attendance completely deleted from database.' });
    } catch (err) {
      console.error('Failed to delete student:', err);
      res.status(500).json({ error: 'Database delete operation failed' });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const studentId = req.params.id;
      const { id, ...updateFields } = req.body;
      await db.update(students).set(updateFields).where(eq(students.id, studentId));
      res.json({ success: true, message: 'Student record updated successfully' });
    } catch (err) {
      console.error('Failed to update student:', err);
      res.status(500).json({ error: 'Database update student failed' });
    }
  });

  // Teachers Rest APIs
  app.post('/api/teachers', async (req, res) => {
    try {
      const newTeacher = req.body;
      const inserted = await db.insert(teachers).values(newTeacher).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed to insert teacher:', err);
      res.status(500).json({ error: 'Database insert teacher failed' });
    }
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    try {
      await db.delete(teachers).where(eq(teachers.id, req.params.id));
      await db.delete(users).where(eq(users.id, req.params.id)); // Delete linked login
      res.json({ success: true, message: 'Teacher record removed successfully' });
    } catch (err) {
      console.error('Failed to delete teacher:', err);
      res.status(500).json({ error: 'Database delete teacher failed' });
    }
  });

  app.put('/api/teachers/:id', async (req, res) => {
    try {
      const teacherId = req.params.id;
      const { id, ...updateFields } = req.body;
      await db.update(teachers).set(updateFields).where(eq(teachers.id, teacherId));
      res.json({ success: true, message: 'Teacher record updated successfully' });
    } catch (err) {
      console.error('Failed to update teacher:', err);
      res.status(500).json({ error: 'Database update teacher failed' });
    }
  });

  // Grades Rest APIs
  app.post('/api/grades', async (req, res) => {
    try {
      const newGrade = req.body;
      const inserted = await db.insert(grades).values(newGrade).returning();

      // Recalculate GPA dynamically for this specific student
      const scholarGrades = await db.select().from(grades).where(eq(grades.studentId, newGrade.studentId));
      const totalScore = scholarGrades.reduce((acc, curr) => acc + curr.score, 0);
      const averagePercent = totalScore / (scholarGrades.length || 1);
      const dynamicGPA = Math.min(4.0, parseFloat(((averagePercent / 100) * 4 + 0.2).toFixed(2)));

      await db.update(students).set({ gpa: dynamicGPA }).where(eq(students.id, newGrade.studentId));

      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed to insert grade:', err);
      res.status(500).json({ error: 'Database insert grade failed' });
    }
  });

  app.put('/api/grades/:id', async (req, res) => {
    try {
      const updatedGrade = req.body;
      await db.update(grades).set(updatedGrade).where(eq(grades.id, req.params.id));

      const scholarGrades = await db.select().from(grades).where(eq(grades.studentId, updatedGrade.studentId));
      const totalScore = scholarGrades.reduce((acc, curr) => acc + curr.score, 0);
      const averagePercent = totalScore / (scholarGrades.length || 1);
      const dynamicGPA = Math.min(4.0, parseFloat(((averagePercent / 100) * 4 + 0.2).toFixed(2)));

      await db.update(students).set({ gpa: dynamicGPA }).where(eq(students.id, updatedGrade.studentId));

      res.json({ success: true });
    } catch (err) {
      console.error('Failed to edit grade:', err);
      res.status(500).json({ error: 'Database edit grade failed' });
    }
  });

  app.delete('/api/grades/:id', async (req, res) => {
    try {
      const gradeId = req.params.id;
      const foundGrades = await db.select().from(grades).where(eq(grades.id, gradeId)).limit(1);
      if (foundGrades.length > 0) {
        const studentId = foundGrades[0].studentId;
        await db.delete(grades).where(eq(grades.id, gradeId));
        
        const scholarGrades = await db.select().from(grades).where(eq(grades.studentId, studentId));
        const totalScore = scholarGrades.reduce((acc, curr) => acc + curr.score, 0);
        const averagePercent = scholarGrades.length > 0 ? (totalScore / scholarGrades.length) : 0;
        const dynamicGPA = scholarGrades.length > 0 ? Math.min(4.0, parseFloat(((averagePercent / 100) * 4 + 0.2).toFixed(2))) : 0.0;
        await db.update(students).set({ gpa: dynamicGPA }).where(eq(students.id, studentId));
      } else {
        await db.delete(grades).where(eq(grades.id, gradeId));
      }
      res.json({ success: true, message: 'Grade deleted successfully and GPA recalculated.' });
    } catch (err) {
      console.error('Failed to delete grade:', err);
      res.status(500).json({ error: 'Database delete grade failed' });
    }
  });

  // Attendance Rest APIs
  app.post('/api/attendance', async (req, res) => {
    try {
      const records = req.body;
      if (Array.isArray(records)) {
        for (const record of records) {
          await db.insert(attendance).values(record).onConflictDoNothing();
        }
      } else {
        await db.insert(attendance).values(records).onConflictDoNothing();
      }
      res.json({ success: true, message: 'Classroom attendance logged successfully' });
    } catch (err) {
      console.error('Attendance batch insert failure:', err);
      res.status(500).json({ error: 'Failed logging classroom attendance records' });
    }
  });

  // Announcements Rest APIs
  app.post('/api/announcements', async (req, res) => {
    try {
      const newAnn = req.body;
      const inserted = await db.insert(announcements).values(newAnn).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Post announcement failure:', err);
      res.status(500).json({ error: 'Could not write announcement bulletin' });
    }
  });

  app.delete('/api/announcements/:id', async (req, res) => {
    try {
      await db.delete(announcements).where(eq(announcements.id, req.params.id));
      res.json({ success: true, message: 'Announcement bulletin removed' });
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      res.status(500).json({ error: 'Database delete announcement failed' });
    }
  });

  // Direct messages APIS
  app.post('/api/messages', async (req, res) => {
    try {
      const newMsg = req.body;
      const inserted = await db.insert(directMessages).values(newMsg).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed sending message:', err);
      res.status(500).json({ error: 'Failed writing message' });
    }
  });

  // ---- NEW: DOCUMENTS / CURRICULUM APIS ----
  app.post('/api/documents', async (req, res) => {
    try {
      const newDoc = req.body;
      const inserted = await db.insert(documentMaterials).values(newDoc).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed registering document material:', err);
      res.status(500).json({ error: 'Failed adding document material' });
    }
  });

  app.delete('/api/documents/:id', async (req, res) => {
    try {
      await db.delete(documentMaterials).where(eq(documentMaterials.id, req.params.id));
      res.json({ success: true, message: 'Material archived successfully' });
    } catch (err) {
      console.error('Failed to delete document material:', err);
      res.status(500).json({ error: 'Failed deleting document material' });
    }
  });

  // ---- NEW: Q&A CLUB / HUB APIS ----
  app.post('/api/qna', async (req, res) => {
    try {
      const newQna = req.body;
      const inserted = await db.insert(qnaHub).values(newQna).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed posting Q&A item:', err);
      res.status(500).json({ error: 'Failed adding Q&A' });
    }
  });

  app.delete('/api/qna/:id', async (req, res) => {
    try {
      await db.delete(qnaHub).where(eq(qnaHub.id, req.params.id));
      res.json({ success: true, message: 'Q&A was deleted successfully' });
    } catch (err) {
      console.error('Failed to delete Q&A:', err);
      res.status(500).json({ error: 'Failed deleting Q&A' });
    }
  });

  app.put('/api/qna/:id', async (req, res) => {
    try {
      const updatedQna = req.body;
      await db.update(qnaHub).set(updatedQna).where(eq(qnaHub.id, req.params.id));
      res.json({ success: true, message: 'Q&A was updated successfully' });
    } catch (err) {
      console.error('Failed to update Q&A:', err);
      res.status(500).json({ error: 'Failed updating Q&A' });
    }
  });

  // ---- NEW: VIRTUAL LIVE CLASSES APIS ----
  app.post('/api/virtual-classes', async (req, res) => {
    try {
      const newClass = req.body;
      const inserted = await db.insert(virtualClasses).values(newClass).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Failed scheduling live session:', err);
      res.status(500).json({ error: 'Failed creating virtual class' });
    }
  });

  app.put('/api/virtual-classes/:id', async (req, res) => {
    try {
      const updatedClass = req.body;
      await db.update(virtualClasses).set(updatedClass).where(eq(virtualClasses.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      console.error('Failed updating virtual class:', err);
      res.status(500).json({ error: 'Failed updating virtual class' });
    }
  });

  app.delete('/api/virtual-classes/:id', async (req, res) => {
    try {
      await db.delete(virtualClasses).where(eq(virtualClasses.id, req.params.id));
      res.json({ success: true, message: 'Live class entry session removed' });
    } catch (err) {
      console.error('Failed deleting virtual class:', err);
      res.status(500).json({ error: 'Failed removing virtual class session' });
    }
  });

  // ---- NEW: SCHEDULES / TIMETABLE APIS ----
  app.post('/api/schedules', async (req, res) => {
    try {
      const body = req.body;
      if (Array.isArray(body)) {
        // Bulk upsert
        for (const item of body) {
          const existing = await db.select().from(schedules).where(eq(schedules.id, item.id)).limit(1);
          if (existing.length > 0) {
            await db.update(schedules).set({
              grade: item.grade,
              academicYear: item.academicYear,
              day: item.day,
              periodIndex: item.periodIndex,
              subject: item.subject,
              teacherName: item.teacherName
            }).where(eq(schedules.id, item.id));
          } else {
            await db.insert(schedules).values({
              id: item.id,
              grade: item.grade,
              academicYear: item.academicYear,
              day: item.day,
              periodIndex: item.periodIndex,
              subject: item.subject,
              teacherName: item.teacherName
            });
          }
        }
        return res.json({ success: true, message: `${body.length} schedule periods bulk updated successfully` });
      }

      // Single item upsert
      const item = body;
      const existing = await db.select().from(schedules).where(eq(schedules.id, item.id)).limit(1);
      if (existing.length > 0) {
        await db.update(schedules).set({
          grade: item.grade,
          academicYear: item.academicYear,
          day: item.day,
          periodIndex: item.periodIndex,
          subject: item.subject,
          teacherName: item.teacherName
        }).where(eq(schedules.id, item.id));
        res.json({ success: true, updated: true });
      } else {
        await db.insert(schedules).values({
          id: item.id,
          grade: item.grade,
          academicYear: item.academicYear,
          day: item.day,
          periodIndex: item.periodIndex,
          subject: item.subject,
          teacherName: item.teacherName
        });
        res.status(201).json({ success: true, created: true });
      }
    } catch (err: any) {
      console.error('Failed saving schedule period:', err);
      res.status(500).json({ error: 'Failed saving schedule period', details: err.message });
    }
  });

  // System Credentials / Users APIs
  app.post('/api/users', async (req, res) => {
    try {
      const newUser = req.body;
      const inserted = await db.insert(users).values(newUser).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Create user failed:', err);
      res.status(500).json({ error: 'Failed making new login profile' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id, ...updateFields } = req.body;
      if (updateFields.password === '********' || updateFields.password === '•' || !updateFields.password) {
        delete updateFields.password;
      }
      await db.update(users).set(updateFields).where(eq(users.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      console.error('Edit user failed:', err);
      res.status(500).json({ error: 'Failed editing login profile' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      await db.delete(users).where(eq(users.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      console.error('Archiving user failed:', err);
      res.status(550).json({ error: 'Failed removing login credentials profile' });
    }
  });

  // Logs Rest APIs
  app.post('/api/logs', async (req, res) => {
    try {
      const newLog = req.body;
      const inserted = await db.insert(systemLogs).values(newLog).returning();
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error('Error posting activity log:', err);
      res.status(500).json({ error: 'Logging activity record failure' });
    }
  });

  app.delete('/api/logs/:id', async (req, res) => {
    try {
      await db.delete(systemLogs).where(eq(systemLogs.id, req.params.id));
      res.json({ success: true, message: 'System log record removed from database' });
    } catch (err) {
      console.error('Failed to delete log:', err);
      res.status(500).json({ error: 'Database delete log failure' });
    }
  });

  app.delete('/api/fees/:id', async (req, res) => {
    try {
      await db.delete(feeInvoices).where(eq(feeInvoices.id, req.params.id));
      res.json({ success: true, message: 'Invoice completely deleted' });
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      res.status(500).json({ error: 'Database delete invoice failure' });
    }
  });

  app.put('/api/fees/:id', async (req, res) => {
    try {
      const feeId = req.params.id;
      const { id, ...updateFields } = req.body;
      await db.update(feeInvoices).set(updateFields).where(eq(feeInvoices.id, feeId));
      res.json({ success: true, message: 'Invoice record updated successfully' });
    } catch (err) {
      console.error('Failed to update invoice:', err);
      res.status(500).json({ error: 'Database update invoice failed' });
    }
  });

  // Fee invoices / checkout api
  app.post('/api/fees/pay', async (req, res) => {
    const { invoiceId, paymentMethod, paidDate } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ error: 'Invoice reference is required' });
    }

    try {
      // Fetch invoice details
      const foundInvoices = await db.select().from(feeInvoices).where(eq(feeInvoices.id, invoiceId)).limit(1);
      if (foundInvoices.length === 0) {
        return res.status(404).json({ error: 'Tuition invoice not found' });
      }

      const invoice = foundInvoices[0];
      if (invoice.status === 'Paid') {
        return res.status(400).json({ error: 'This ticket invoice is already paid' });
      }

      // 1. Mark Invoice as Paid in Database
      await db.update(feeInvoices).set({
        status: 'Paid',
        paidDate: paidDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod || 'Mobile Money'
      }).where(eq(feeInvoices.id, invoiceId));

      // 2. Adjust Student cash accounts
      const studentId = invoice.studentId;
      const scholarList = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
      if (scholarList.length > 0) {
        const student = scholarList[0];
        const newOutstanding = Math.max(0, student.outstandingFees - invoice.amount);
        const newPaid = student.paidFees + invoice.amount;
        await db.update(students).set({
          outstandingFees: newOutstanding,
          paidFees: newPaid
        }).where(eq(students.id, studentId));
      }

      // 3. Post a direct transaction log entry
      await db.insert(systemLogs).values({
        id: `LOG-PAY-${Math.random().toString(36).substring(4, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        operator: 'Somali Mobile Money Integration',
        role: 'System',
        category: 'Payment',
        description: `Bixinta ujrada dugsiga ($${invoice.amount}) ee Invoice-ka ${invoiceId} waa la oggolaaday laguna dhammaystiray ${paymentMethod || 'E-DAHAB'}.`,
        academicYear: '2026-2027',
        status: 'Completed'
      });

      res.json({ success: true, message: 'Tuition transaction successfully approved!' });
    } catch (err: any) {
      console.error('Invoice pay endpoint error:', err);
      res.status(500).json({ error: 'Tuition checkout portal payment failure', details: err.message });
    }
  });

  // ---- 3. MIDDLEWARE & SPA FALLBACKS FOR PRODUCTION ----

  // Vite development middleware OR static assets compiler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express and Vite development hub booted successfully on port ${PORT}`);
  });
}

startServer();
