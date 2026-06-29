/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Teacher, AttendanceRecord, Grade, FeeInvoice, Announcement, DirectMessage, UserCredential, SystemActivityLog, DocumentMaterial, QnaItem, VirtualClass, SchedulePeriod } from './types';

const SOMALI_FIRST_NAMES = [
  'Ayan', 'Bashiir', 'Cabdi', 'Deeqa', 'Farxaan', 'Halima', 'Ismaaciil', 'Jamal', 'Khader', 'Leyla', 
  'Maxamed', 'Nimco', 'Omer', 'Qamar', 'Rooda', 'Sahra', 'Tariq', 'Ubaah', 'Warsame', 'Xasan', 
  'Yasmin', 'Zahra', 'Khaalid', 'Zamzam', 'Sharmarke', 'Fartuun', 'Khadra', 'Hodan', 'Mustafe', 'Cali',
  'Yaxye', 'Nasra', 'Saynab', 'Barkhad', 'Guuleed', 'Aamina', 'Jibriil', 'Yuusuf', 'Hiba', 'Sacdiya',
  'Saciid', 'Ibraahim', 'Kaltuun', 'Raage', 'Rooble', 'Safiya', 'Cawaale', 'Sahal', 'Hassan', 'Faadumo',
  'Abdirashiid', 'Huda', 'Nawaal', 'Garaad', 'Muna', 'Khadija', 'Kawsar', 'Salma', 'Amira', 'Siraad',
  'Barre', 'Deeq', 'Guled', 'Idiriis', 'Mukhtaar'
];
const SOMALI_LAST_NAMES = [
  'Ali', 'Cumar', 'Jaamac', 'Farax', 'Yusuuf', 'Geedi', 'Warsame', 'Xuseen', 'Abdi', 'Axmed', 
  'Maxamuud', 'Bile', 'Rooble', 'Salaad', 'Cilmi', 'Aadan', 'Nuur', 'Xasan', 'Dahab', 'Garaad',
  'Kheyre', 'Sharmaarke', 'Ducaale', 'Cigaal', 'Samatar', 'Koosar', 'Fadxi', 'Bootaan', 'Fiqi', 'Hartuun',
  'Catoosh', 'Gedi', 'Dalmar', 'Rage', 'Heled', 'Cadaani', 'Guled', 'Shirwac', 'Looyaan', 'Faarax',
  'Maxamed', 'Darood', 'Samakab', 'Xirsi', 'Hufane', 'Kadiye', 'Xalane', 'Galaydh', 'Hiraabe', 'Warsama'
];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=200'
];

const classesList = [
  { grade: 'Grade 7', section: 'A' },
  { grade: 'Grade 7', section: 'B' },
  { grade: 'Grade 8', section: 'A' },
  { grade: 'Grade 8', section: 'B' },
  { grade: 'Grade 9', section: 'A' },
  { grade: 'Grade 9', section: 'B' },
  { grade: 'Grade 10', section: 'A' },
  { grade: 'Grade 10', section: 'B' },
  { grade: 'Grade 11', section: 'A' },
  { grade: 'Grade 11', section: 'B' },
  { grade: 'Grade 12', section: 'A' },
  { grade: 'Grade 12', section: 'B' }
];

export const INITIAL_STUDENTS: Student[] = [];

const usedNames = new Set<string>();

let studentCount = 1;
classesList.forEach((cls) => {
  for (let i = 1; i <= 10; i++) {
    const id = `STU${String(studentCount).padStart(3, '0')}`;
    
    // Generate secure and 100% unique three-part Somali names
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let fullName = '';
    let offset = 0;
    while (true) {
      const fIdx = (studentCount * 13 + offset) % SOMALI_FIRST_NAMES.length;
      const mIdx = (studentCount * 29 + offset * 3 + 7) % SOMALI_FIRST_NAMES.length;
      const lIdx = (studentCount * 47 + offset * 7 + 19) % SOMALI_LAST_NAMES.length;
      
      firstName = SOMALI_FIRST_NAMES[fIdx];
      middleName = SOMALI_FIRST_NAMES[mIdx];
      if (middleName === firstName) {
        middleName = SOMALI_FIRST_NAMES[(mIdx + 1) % SOMALI_FIRST_NAMES.length];
      }
      lastName = SOMALI_LAST_NAMES[lIdx];
      fullName = `${firstName} ${middleName} ${lastName}`;
      if (!usedNames.has(fullName)) {
        usedNames.add(fullName);
        break;
      }
      offset++;
    }

    const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const email = `${cleanName}@ibnukhuzeyma.edu`;
    
    const isPaidFirst = studentCount % 3 === 0;
    const outstandingFees = isPaidFirst ? 0 : 1500;
    const paidFees = isPaidFirst ? 5000 : 3500;
    const attendanceRate = Math.round((90 + (studentCount % 10) * 1) * 10) / 10;
    const gpa = Math.round((2.5 + (studentCount % 15) * 0.1) * 100) / 100;
    
    // Parent matches Somali naming custom where parent is Father (MiddleName LastName)
    const parentName = `${middleName} ${lastName}`;

    INITIAL_STUDENTS.push({
      id,
      name: fullName,
      grade: cls.grade,
      section: cls.section,
      email,
      phone: `(252) 61-${2500000 + studentCount}`,
      avatar: AVATARS[studentCount % AVATARS.length],
      attendanceRate,
      outstandingFees,
      paidFees,
      gpa,
      status: 'Active',
      parentName,
      parentEmail: `${parentName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
      address: `${200 + studentCount} Maka Al Mukarama St, Mogadishu, Somalia`
    });

    studentCount++;
  }
});

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'TCH001',
    name: 'Bashiir Maxamed Ali',
    subject: 'Mathematics',
    assignedClass: 'Grade 10 - A',
    email: 'bashiir@ibnukhuzeyma.edu',
    phone: '(252) 61-512-4022',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 7500,
    hireDate: '2021-08-15'
  },
  {
    id: 'TCH002',
    name: 'Ahmed Maxamed',
    subject: 'Computer Science',
    assignedClass: 'Grade 10 - B',
    email: 'ahmed@ibnukhuzeyma.edu',
    phone: '(252) 61-831-2940',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 8200,
    hireDate: '2019-09-01'
  },
  {
    id: 'TCH003',
    name: 'Cabdisalaan Nuur',
    subject: 'English Literature',
    assignedClass: 'Grade 8 - B',
    email: 'cabdisalaan@ibnukhuzeyma.edu',
    phone: '(252) 61-441-2098',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6800,
    hireDate: '2022-01-10'
  },
  {
    id: 'TCH004',
    name: 'Nimco Yaasin',
    subject: 'Biology',
    assignedClass: 'Grade 7 - A',
    email: 'nimco@ibnukhuzeyma.edu',
    phone: '(252) 61-334-1189',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 7000,
    hireDate: '2020-03-12'
  },
  {
    id: 'TCH005',
    name: 'Maxamed Cumar',
    subject: 'Physics',
    assignedClass: 'Grade 7 - B',
    email: 'maxamed@ibnukhuzeyma.edu',
    phone: '(252) 61-998-3412',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 7600,
    hireDate: '2021-05-18'
  },
  {
    id: 'TCH006',
    name: 'Sahra Abdi',
    subject: 'Chemistry',
    assignedClass: 'Grade 8 - A',
    email: 'sahra@ibnukhuzeyma.edu',
    phone: '(252) 61-771-4566',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 7100,
    hireDate: '2022-07-22'
  },
  {
    id: 'TCH007',
    name: 'Cismaan Cali',
    subject: 'History',
    assignedClass: 'Grade 9 - A',
    email: 'cismaan@ibnukhuzeyma.edu',
    phone: '(252) 61-551-2290',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6500,
    hireDate: '2023-01-15'
  },
  {
    id: 'TCH008',
    name: 'Xaliimo Maxamuud',
    subject: 'Geography',
    assignedClass: 'Grade 9 - B',
    email: 'xaliimo@ibnukhuzeyma.edu',
    phone: '(252) 61-123-4567',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6300,
    hireDate: '2023-04-10'
  },
  {
    id: 'TCH009',
    name: 'Cali Maxamed Nuur',
    subject: 'Somali Language',
    assignedClass: 'Grade 11 - A',
    email: 'cali@ibnukhuzeyma.edu',
    phone: '(252) 61-711-2233',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6000,
    hireDate: '2018-10-05'
  },
  {
    id: 'TCH010',
    name: 'Cabdiraxmaan Cilmi',
    subject: 'Arabic Studies',
    assignedClass: 'Grade 11 - B',
    email: 'cabdiraxmaan@ibnukhuzeyma.edu',
    phone: '(252) 61-988-7766',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6200,
    hireDate: '2020-11-12'
  },
  {
    id: 'TCH011',
    name: 'Maryan Yaasiin',
    subject: 'Islamic Studies',
    assignedClass: 'Grade 12 - A',
    email: 'maryan@ibnukhuzeyma.edu',
    phone: '(252) 61-555-8888',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6900,
    hireDate: '2019-02-14'
  },
  {
    id: 'TCH012',
    name: 'Deeqa Axmed',
    subject: 'Business Studies',
    assignedClass: 'Grade 12 - B',
    email: 'deeqa@ibnukhuzeyma.edu',
    phone: '(252) 61-333-2222',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    salary: 6700,
    hireDate: '2021-09-01'
  }
];

const classSubjectMap: Record<string, string> = {
  'Grade 7 - A': 'Biology',
  'Grade 7 - B': 'Physics',
  'Grade 8 - A': 'Chemistry',
  'Grade 8 - B': 'English Literature',
  'Grade 9 - A': 'History',
  'Grade 9 - B': 'Geography',
  'Grade 10 - A': 'Mathematics',
  'Grade 10 - B': 'Computer Science',
  'Grade 11 - A': 'Somali Language',
  'Grade 11 - B': 'Arabic Studies',
  'Grade 12 - A': 'Islamic Studies',
  'Grade 12 - B': 'Business Studies'
};

export const INITIAL_GRADES: Grade[] = [];
const SUBJECT_SEEDS = ['TARBIYO', 'ARABIC', 'SOMALI', 'MATH', 'TECHNOLOGY', 'BUSSINESS', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH', 'TARIIKH', 'JOGURAFI'];

INITIAL_STUDENTS.forEach((student, index) => {
  SUBJECT_SEEDS.forEach((subject, subIndex) => {
    // ---- 1) Sannad-Dugsiyeedkii Hore (2025-2026) ----
    const midScoreOld = 23 + ((index * 13 + subIndex * 11) % 24); // generates scores ~23-46
    const midPctOld = (midScoreOld / 50) * 100;
    const midLetterOld = midPctOld >= 90 ? 'A' : (midPctOld >= 80 ? 'B' : (midPctOld >= 70 ? 'C' : (midPctOld >= 60 ? 'D' : 'F')));
    INITIAL_GRADES.push({
      id: `GRD-MID-OLD-${student.id}-${subIndex}`,
      studentId: student.id,
      subject: subject,
      score: midScoreOld,
      gradeLetter: midLetterOld,
      examType: 'Midterm',
      date: '2025-06-10',
      academicYear: '2025-2026'
    });

    const finScoreOld = 24 + ((index * 11 + subIndex * 17) % 22); // generates scores ~24-45
    const finPctOld = (finScoreOld / 50) * 100;
    const finLetterOld = finPctOld >= 90 ? 'A' : (finPctOld >= 80 ? 'B' : (finPctOld >= 70 ? 'C' : (finPctOld >= 60 ? 'D' : 'F')));
    INITIAL_GRADES.push({
      id: `GRD-FIN-OLD-${student.id}-${subIndex}`,
      studentId: student.id,
      subject: subject,
      score: finScoreOld,
      gradeLetter: finLetterOld,
      examType: 'Final',
      date: '2025-06-15',
      academicYear: '2025-2026'
    });

    // ---- 2) Sannad-Dugsiyeedkii Hadda Jira / Sanadkan (2026-2027) ----
    const midScore = 28 + ((index * 17 + subIndex * 13) % 22); // Generates score between 28 and 49
    const midPct = (midScore / 50) * 100;
    const midLetter = midPct >= 90 ? 'A' : (midPct >= 80 ? 'B' : (midPct >= 70 ? 'C' : (midPct >= 60 ? 'D' : 'F')));
    INITIAL_GRADES.push({
      id: `GRD-MID-${student.id}-${subIndex}`,
      studentId: student.id,
      subject: subject,
      score: midScore,
      gradeLetter: midLetter,
      examType: 'Midterm',
      date: '2026-06-10',
      academicYear: '2026-2027'
    });

    const finScore = 30 + ((index * 13 + subIndex * 19) % 20); // Generates score between 30 and 49
    const finPct = (finScore / 50) * 100;
    const finLetter = finPct >= 90 ? 'A' : (finPct >= 80 ? 'B' : (finPct >= 70 ? 'C' : (finPct >= 60 ? 'D' : 'F')));
    INITIAL_GRADES.push({
      id: `GRD-FIN-${student.id}-${subIndex}`,
      studentId: student.id,
      subject: subject,
      score: finScore,
      gradeLetter: finLetter,
      examType: 'Final',
      date: '2026-06-15',
      academicYear: '2026-2027'
    });
  });
});

export const INITIAL_FEES: FeeInvoice[] = [];
INITIAL_STUDENTS.forEach((student, index) => {
  if (index % 3 === 0) {
    INITIAL_FEES.push({
      id: `INV${100 + index}`,
      studentId: student.id,
      title: 'Tuition Fee - Spring Semester Q1',
      amount: 2500,
      dueDate: '2026-04-15',
      status: 'Paid',
      paidDate: '2026-04-10',
      paymentMethod: 'Cash'
    });
  } else {
    INITIAL_FEES.push({
      id: `INV${100 + index}`,
      studentId: student.id,
      title: 'Tuition Fee - Spring Semester Q1',
      amount: 2500,
      dueDate: '2026-04-15',
      status: 'Unpaid'
    });
  }
});

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANC001',
    title: 'Haddad Kulul: Hakinta Hawlaha Dibadda',
    content: 'Sababo la xiriira saadaasha hawada kulul ee ka sarreysa 100°F berrito, dhammaan fasallada PE iyo ciyaaraha dibadda waxaa lagu qaban doonaa gudaha qolka jimicsiga ee qaboojiyaha leh.',
    category: 'Urgent',
    date: '2026-06-13',
    author: 'Admin Office',
    targetAudience: 'All'
  },
  {
    id: 'ANC002',
    title: 'Bandhig Faneedka & Muusigga Dugsiga 2026',
    content: 'Waxaan si farxad leh ugu martiqaadeynaa dhammaan waalidiinta, ardayda iyo barayaasha xafladda sanadlaha ah ee ka dhici doonta Hoolka Weyn Jimcaha soo socda 6:30 PM.',
    category: 'Event',
    date: '2026-06-10',
    author: 'Fine Arts Dept',
    targetAudience: 'All'
  }
];

export const INITIAL_MESSAGES: DirectMessage[] = [
  { id: 'MSG001', studentId: 'STU001', sender: 'Parent', text: "Hello, I wanted to follow up on the class activities.", timestamp: "2026-06-11 09:15 AM" }
];

const generateAttendanceHistory = (students: Student[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const startYear = 2026;
  const startMonth = 5; // June is index 5
  // Loop from June 1st to June 23rd
  for (let day = 1; day <= 23; day++) {
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(startYear, startMonth, day);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday, 2 is Tuesday, 3 is Wednesday, 4 is Thursday, 5 is Friday, 6 is Saturday
    // In Somalia, school days are Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4).
    // Let's exclude Friday (5) and Saturday (6).
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      continue;
    }

    students.forEach((stu, idx) => {
      // Deterministic attendance: mostly Present (90%), occasionally Late or Absent based on student count and day
      let status: 'Present' | 'Absent' | 'Late' = 'Present';
      const hash = (idx * 7 + day * 13) % 100;
      if (hash < 5) {
        status = 'Absent';
      } else if (hash < 12) {
        status = 'Late';
      }

      records.push({
        id: `ATT-${stu.id}-${dateStr}`,
        date: dateStr,
        studentId: stu.id,
        status,
        remarks: status === 'Absent' ? 'Wax sabab ah lama sheegin' : status === 'Late' ? 'Gaadiidka' : ''
      });
    });
  }
  return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = generateAttendanceHistory(INITIAL_STUDENTS);

export const INITIAL_USERS: UserCredential[] = [
  {
    id: 'ADMIN-USER',
    username: 'admin',
    password: '********',
    role: 'Admin',
    name: 'MUSAB ABDI',
    status: 'Active'
  },
  ...INITIAL_TEACHERS.map((t) => {
    let cleanName = t.name.toLowerCase();
    // Remove prefixes and clean spaces
    const username = cleanName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    return {
      id: t.id,
      username: username,
      password: '********',
      role: 'Teacher' as const,
      name: t.name,
      status: 'Active' as const
    };
  }),
  ...INITIAL_STUDENTS.map((s) => {
    return {
      id: s.id,
      username: s.id.toLowerCase(),
      password: '********',
      role: 'Student' as const,
      name: s.name,
      status: 'Active' as const,
      email: s.email
    };
  })
];

export const INITIAL_LOGS: SystemActivityLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    operator: 'Macallin Maxamed',
    role: 'Teacher',
    category: 'Attendance',
    description: 'Ayaa logs-gareeyay Xadirinta maanta ee Fasal 12-A. Dhammaan ardaydu waa joogaan marka laga reebo 2 arday.',
    academicYear: '2026-2027',
    status: 'Completed'
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    operator: 'Aamina Hooyo',
    role: 'Parent',
    category: 'Payment',
    description: 'Waxay bixisay ujrada dugsiga ($1,500) ee ardayga STU045 iyadoo adeegsanaysa kaarka E-DAHAB.',
    academicYear: '2026-2027',
    status: 'Completed'
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    operator: 'Macallin Cabdi',
    role: 'Teacher',
    category: 'Grade',
    description: 'Wuxuu xareeyay Natiijada Nus-Sanadka (Midterm Exams) ee Maadada Tarbiyada ee ardayda Fasal 10-B.',
    academicYear: '2025-2026',
    status: 'Completed'
  },
  {
    id: 'LOG-004',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    operator: 'Maamule Saynab',
    role: 'Admin',
    category: 'System',
    description: 'Waxay dhalisay xiriir war bixin sanadeed oo loogu talagalay Wasaaradda Waxbarashada ee Mogadishu, Somalia.',
    academicYear: '2026-2027',
    status: 'Completed'
  },
  {
    id: 'LOG-005',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    operator: 'Macallin Yasmin',
    role: 'Teacher',
    category: 'Attendance',
    description: 'Waxay dhammaystirtay xadirinta fasalka Grade 8-B. Wadarta: 18 arday oo Present ah, 2 Absent oo fasax leh.',
    academicYear: '2026-2027',
    status: 'In Progress'
  }
];

export const INITIAL_DOCUMENTS: DocumentMaterial[] = [
  {
    id: 'DOC001',
    title: 'Imtixaanaadkii Hore ee Maadada Tarbiyada Grade 10',
    subject: 'TARBIYO',
    grade: 'Grade 10',
    content: 'Manhajkaan wuxuu xambaarsan yahay dhamaan imtixaanadii hore ee laga soo qaaday dugsiga oo la xaliyay si ardayda ugu diyaargarowdo imtixaanada.',
    url: 'https://ais-pre-ctsa52aqwrvtg4dnvlg2ni-545813521853.europe-west1.run.app/assets/tarbiyo_grade10_pastpapers.pdf',
    date: '2026-06-15',
    author: 'Maryan Yaasiin'
  },
  {
    id: 'DOC002',
    title: 'Mathematics Algebra Formula Sheet Guide',
    subject: 'MATH',
    grade: 'Grade 12',
    content: 'Comprehensive reference of standard trigonometry equations, logarithmic properties, and linear transformation formula sheets.',
    url: 'https://ais-pre-ctsa52aqwrvtg4dnvlg2ni-545813521853.europe-west1.run.app/assets/math_grade12_algebra.pdf',
    date: '2026-06-18',
    author: 'Bashiir Maxamed Ali'
  },
  {
    id: 'DOC003',
    title: 'Naxwaha iyo Suugaanta Soomaaliga ee Dugsiyada Sare',
    subject: 'SOMALI',
    grade: 'Grade 11',
    content: 'Buug-gacmeedka barashada Naxwaha Af-soomaaliga oo si casri ah loo nashqadeeyay, looguna talagalay fasalada 11aad ee dugsiga sare.',
    url: 'https://ais-pre-ctsa52aqwrvtg4dnvlg2ni-545813521853.europe-west1.run.app/assets/somali_grammar_grade11.pdf',
    date: '2026-06-20',
    author: 'Cali Maxamed Nuur'
  }
];

export const INITIAL_QNAS: QnaItem[] = [
  {
    id: 'QNA001',
    question: 'Sidee ayaan u bixin karaa khidmada bisha anoo jooga guriga?',
    answer: 'Waxaad ku bixin kartaa qaab online ah adigoo isticmaalaya badanka E-Dahab / Kaamil. Iskuulka waxaa ku dhex dhisay Mobile Money API rastiidkana wuxuu ku soo baxayaa si toos ah dhamaan profiles-ka iskuulka.',
    subject: 'Lacagaha (Tuition Fees)',
    askedBy: 'Amina Yusuf (Waalidka Salim)',
    answeredBy: 'Maamulka Iskoolka',
    date: '2026-06-19',
    category: 'Finance'
  },
  {
    id: 'QNA002',
    question: 'Goorma ayuu bilaabanayaa Imtixaanka Dhexe ee Midterm-ka?',
    answer: 'Sida ku xusan jadwalka sanad-dugsiyeedka rasmiga ah oo ku dhex jira halkan iyo announcements-ka, imtixaanadu waxay bilaabanayaan November 10, 2026.',
    subject: 'Jadwalka Tacliinta (Calendar)',
    askedBy: 'Khaalid Warsame (Arday)',
    answeredBy: 'Dr. Sarah Sterling',
    date: '2026-06-21',
    category: 'Academics'
  }
];

export const INITIAL_VIRTUAL_CLASSES: VirtualClass[] = [
  {
    id: 'VCLASS001',
    subject: 'TARBIYO',
    grade: 'Grade 10',
    teacherName: 'Maryan Yaasiin',
    topic: 'Casharka 4aad: Akhlaaqda iyo Dhaqanka Islaamka',
    dateTime: 'Live (Hadda)',
    meetUrl: 'https://meet.google.com/ais-live-tarbiyo',
    isLive: true
  },
  {
    id: 'VCLASS002',
    subject: 'MATH',
    grade: 'Grade 12',
    teacherName: 'Bashiir Maxamed Ali',
    topic: 'Advanced Integral Calculus & Derivatives',
    dateTime: '2:30 PM (Maanta)',
    meetUrl: 'https://meet.google.com/ais-live-math',
    isLive: false
  }
];

export const INITIAL_SCHEDULES: SchedulePeriod[] = (() => {
  const DAYS_OF_WEEK = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco"];
  const SUBJECTS_LIST = ["TARBIYO", "MATH", "SOMALI", "ENGLISH", "PHYSICS", "CHEMISTRY", "ISLAMIC"];
  const TEACHERS_POOL = [
    "Bashiir Maxamed Ali", "Ahmed Maxamed", "Cabdisalaan Nuur", 
    "Nimco Yaasin", "Maxamed Cumar", "Sahra Abdi", 
    "Cismaan Cali", "Xaliimo Maxamuud", "Cali Maxamed Nuur", 
    "Cabdiraxmaan Cilmi", "Maryan Yaasiin", "Deeqa Axmed"
  ];

  const list: SchedulePeriod[] = [];
  classesList.forEach((cls) => {
    const classKey = `${cls.grade} - ${cls.section}`;
    DAYS_OF_WEEK.forEach((day, dayIndex) => {
      for (let p = 1; p <= 7; p++) {
        const subjectIndex = (dayIndex + p + cls.section.charCodeAt(0)) % SUBJECTS_LIST.length;
        const teacherIndex = (dayIndex * 3 + p + cls.grade.charCodeAt(6)) % TEACHERS_POOL.length;
        
        list.push({
          id: `SCH-${cls.grade.replace(' ', '')}-${cls.section}-${dayIndex}-${p}`,
          grade: classKey,
          academicYear: "2026-2027",
          day: day,
          periodIndex: p,
          subject: SUBJECTS_LIST[subjectIndex],
          teacherName: TEACHERS_POOL[teacherIndex]
        });
      }
    });
  });
  return list;
})();

const STORAGE_KEYS = {
  students: 'school_system_students',
  teachers: 'school_system_teachers',
  grades: 'school_system_grades',
  fees: 'school_system_fees',
  announcements: 'school_system_announcements',
  messages: 'school_system_messages',
  attendance: 'school_system_attendance',
  users: 'school_system_users',
  logs: 'school_system_logs',
  documents: 'school_system_documents',
  qna: 'school_system_qna',
  virtualClasses: 'school_system_virtual_classes',
  schedules: 'school_system_schedules'
};

export function getStoredData() {
  try {
    const students = localStorage.getItem(STORAGE_KEYS.students);
    const teachers = localStorage.getItem(STORAGE_KEYS.teachers);
    const grades = localStorage.getItem(STORAGE_KEYS.grades);
    const fees = localStorage.getItem(STORAGE_KEYS.fees);
    const announcements = localStorage.getItem(STORAGE_KEYS.announcements);
    const messages = localStorage.getItem(STORAGE_KEYS.messages);
    const attendance = localStorage.getItem(STORAGE_KEYS.attendance);
    const users = localStorage.getItem(STORAGE_KEYS.users);
    const logs = localStorage.getItem(STORAGE_KEYS.logs);
    const documents = localStorage.getItem(STORAGE_KEYS.documents);
    const qna = localStorage.getItem(STORAGE_KEYS.qna);
    const virtualClasses = localStorage.getItem(STORAGE_KEYS.virtualClasses);
    const schedules = localStorage.getItem(STORAGE_KEYS.schedules);

    const parsedStudents: Student[] = students ? JSON.parse(students) : INITIAL_STUDENTS;
    const parsedTeachers: Teacher[] = teachers ? JSON.parse(teachers) : INITIAL_TEACHERS;
    const parsedGrades: Grade[] = grades ? JSON.parse(grades) : INITIAL_GRADES;
    const parsedFees: FeeInvoice[] = fees ? JSON.parse(fees) : INITIAL_FEES;
    const parsedAnnouncements: Announcement[] = announcements ? JSON.parse(announcements) : INITIAL_ANNOUNCEMENTS;
    const parsedMessages: DirectMessage[] = messages ? JSON.parse(messages) : INITIAL_MESSAGES;
    const parsedAttendance: AttendanceRecord[] = attendance ? JSON.parse(attendance) : INITIAL_ATTENDANCE;
    const parsedUsers: UserCredential[] = users ? JSON.parse(users) : INITIAL_USERS;
    const parsedLogs: SystemActivityLog[] = logs ? JSON.parse(logs) : INITIAL_LOGS;
    const parsedDocuments: DocumentMaterial[] = documents ? JSON.parse(documents) : INITIAL_DOCUMENTS;
    const parsedQnas: QnaItem[] = qna ? JSON.parse(qna) : INITIAL_QNAS;
    const parsedVirtualClasses: VirtualClass[] = virtualClasses ? JSON.parse(virtualClasses) : INITIAL_VIRTUAL_CLASSES;
    const parsedSchedules: SchedulePeriod[] = schedules ? JSON.parse(schedules) : INITIAL_SCHEDULES;

    // IF total teachers is less than 12 OR students are not fully seeded (less than 120) OR grades are low OR have old 100-scale grades,
    // OR if attendance records are minimal (meaning old seed was used)
    // FORCE-SEED to ensure the user gets exactly what they requested (unique names, full coverage)
    const hasOldGrades = parsedGrades.some(g => (g.examType === 'Midterm' || g.examType === 'Final') && g.score > 50);
    if (parsedTeachers.length < 12 || parsedStudents.length < 120 || parsedGrades.length < 2800 || hasOldGrades || parsedAttendance.length < 100) {
      console.log("Force seeding 12 teachers, 120 students, and rich 23-day historical attendance.");
      saveStoredData({
        students: INITIAL_STUDENTS,
        teachers: INITIAL_TEACHERS,
        grades: INITIAL_GRADES,
        fees: INITIAL_FEES,
        announcements: INITIAL_ANNOUNCEMENTS,
        messages: INITIAL_MESSAGES,
        attendance: INITIAL_ATTENDANCE,
        users: INITIAL_USERS,
        logs: INITIAL_LOGS,
        documents: INITIAL_DOCUMENTS,
        qna: INITIAL_QNAS,
        virtualClasses: INITIAL_VIRTUAL_CLASSES,
        schedules: INITIAL_SCHEDULES
      });
      return {
        students: INITIAL_STUDENTS,
        teachers: INITIAL_TEACHERS,
        grades: INITIAL_GRADES,
        fees: INITIAL_FEES,
        announcements: INITIAL_ANNOUNCEMENTS,
        messages: INITIAL_MESSAGES,
        attendance: INITIAL_ATTENDANCE,
        users: INITIAL_USERS,
        logs: INITIAL_LOGS,
        documents: INITIAL_DOCUMENTS,
        qna: INITIAL_QNAS,
        virtualClasses: INITIAL_VIRTUAL_CLASSES,
        schedules: INITIAL_SCHEDULES
      };
    }

    return {
      students: parsedStudents,
      teachers: parsedTeachers,
      grades: parsedGrades,
      fees: parsedFees,
      announcements: parsedAnnouncements,
      messages: parsedMessages,
      attendance: parsedAttendance,
      users: parsedUsers,
      logs: parsedLogs,
      documents: parsedDocuments,
      qna: parsedQnas,
      virtualClasses: parsedVirtualClasses,
      schedules: parsedSchedules
    };
  } catch (error) {
    console.error('Error parsing localStorage database', error);
    return {
      students: INITIAL_STUDENTS,
      teachers: INITIAL_TEACHERS,
      grades: INITIAL_GRADES,
      fees: INITIAL_FEES,
      announcements: INITIAL_ANNOUNCEMENTS,
      messages: INITIAL_MESSAGES,
      attendance: INITIAL_ATTENDANCE,
      users: INITIAL_USERS,
      logs: INITIAL_LOGS,
      documents: INITIAL_DOCUMENTS,
      qna: INITIAL_QNAS,
      virtualClasses: INITIAL_VIRTUAL_CLASSES,
      schedules: INITIAL_SCHEDULES
    };
  }
}

export function saveStoredData(data: {
  students: Student[];
  teachers: Teacher[];
  grades: Grade[];
  fees: FeeInvoice[];
  announcements: Announcement[];
  messages: DirectMessage[];
  attendance: AttendanceRecord[];
  users: UserCredential[];
  logs?: SystemActivityLog[];
  documents?: DocumentMaterial[];
  qna?: QnaItem[];
  virtualClasses?: VirtualClass[];
  schedules?: SchedulePeriod[];
}) {
  try {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(data.students));
    localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(data.teachers));
    localStorage.setItem(STORAGE_KEYS.grades, JSON.stringify(data.grades));
    localStorage.setItem(STORAGE_KEYS.fees, JSON.stringify(data.fees));
    localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(data.announcements));
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(data.messages));
    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(data.attendance));
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(data.users));
    if (data.logs) {
      localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(data.logs));
    }
    if (data.documents) {
      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(data.documents));
    }
    if (data.qna) {
      localStorage.setItem(STORAGE_KEYS.qna, JSON.stringify(data.qna));
    }
    if (data.virtualClasses) {
      localStorage.setItem(STORAGE_KEYS.virtualClasses, JSON.stringify(data.virtualClasses));
    }
    if (data.schedules) {
      localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(data.schedules));
    }
  } catch (error) {
    console.error('Error saving database states to localStorage', error);
  }
}

export function resetDatabase() {
  try {
    localStorage.removeItem(STORAGE_KEYS.students);
    localStorage.removeItem(STORAGE_KEYS.teachers);
    localStorage.removeItem(STORAGE_KEYS.grades);
    localStorage.removeItem(STORAGE_KEYS.fees);
    localStorage.removeItem(STORAGE_KEYS.announcements);
    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.attendance);
    localStorage.removeItem(STORAGE_KEYS.users);
    localStorage.removeItem(STORAGE_KEYS.logs);
    localStorage.removeItem(STORAGE_KEYS.documents);
    localStorage.removeItem(STORAGE_KEYS.qna);
    localStorage.removeItem(STORAGE_KEYS.virtualClasses);
    localStorage.removeItem(STORAGE_KEYS.schedules);
  } catch (error) {
    console.error('Error resetting databases', error);
  }
}
