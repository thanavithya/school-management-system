import {
  Student,
  Teacher,
  ClassSection,
  AttendanceRecord,
  Examination,
  ExamSubjectMark,
  ClassFeeStructure,
  FeePayment,
  TimetableSlot,
  Announcement,
  ExamScheduleItem,
  SchoolProfile,
  AppDatabase,
} from '../types';

export type { AppDatabase };

const STORAGE_KEY = 'schoolpro_master_db_v2';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  name: 'SchoolPro International Academy',
  motto: 'Inspiring Excellence, Fostering Leadership',
  code: 'SCH-PRO-2026',
  email: 'contact@schoolpro.edu',
  phone: '+1 (555) 234-5678',
  address: '100 Academic Boulevard, Suite 400, Education City, CA 90210',
  academicYear: '2026-2027',
  principalName: 'Dr. Evelyn Sterling, Ph.D.',
  currencySymbol: '$',
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'TCH-101',
    name: 'Sarah Jenkins',
    email: 's.jenkins@schoolpro.edu',
    phone: '+1 (555) 101-2001',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    subjects: ['Mathematics', 'Statistics'],
    assignedClasses: ['5-A', '6-A', '10-A'],
    joiningDate: '2021-08-15',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'TCH-102',
    name: 'Robert Vance',
    email: 'r.vance@schoolpro.edu',
    phone: '+1 (555) 101-2002',
    qualification: 'M.Sc. Physics, M.Ed.',
    subjects: ['Physics', 'General Science'],
    assignedClasses: ['7-A', '8-B', '10-A'],
    joiningDate: '2020-07-01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'TCH-103',
    name: 'Elena Rostova',
    email: 'e.rostova@schoolpro.edu',
    phone: '+1 (555) 101-2003',
    qualification: 'M.A. English Literature',
    subjects: ['English', 'Literature'],
    assignedClasses: ['5-A', '5-B', '6-A'],
    joiningDate: '2022-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'TCH-104',
    name: 'Marcus Chen',
    email: 'm.chen@schoolpro.edu',
    phone: '+1 (555) 101-2004',
    qualification: 'M.C.A., B.Sc. Computer Science',
    subjects: ['Computer Science', 'Robotics'],
    assignedClasses: ['8-A', '9-A', '10-A'],
    joiningDate: '2023-03-20',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'TCH-105',
    name: 'Amara Patel',
    email: 'a.patel@schoolpro.edu',
    phone: '+1 (555) 101-2005',
    qualification: 'M.Sc. Chemistry, B.Ed.',
    subjects: ['Chemistry', 'Environmental Studies'],
    assignedClasses: ['7-B', '9-B', '10-B'],
    joiningDate: '2022-09-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'TCH-106',
    name: 'David Miller',
    email: 'd.miller@schoolpro.edu',
    phone: '+1 (555) 101-2006',
    qualification: 'M.A. History, B.P.Ed.',
    subjects: ['Social Science', 'Physical Education'],
    assignedClasses: ['5-A', '6-B', '8-A'],
    joiningDate: '2019-11-12',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-1001',
    fullName: 'Liam Alexander Hayes',
    dob: '2015-04-12',
    gender: 'Male',
    classNum: '5',
    section: 'A',
    parentName: 'Christopher Hayes',
    parentPhone: '+1 (555) 301-4401',
    email: 'c.hayes@parentmail.com',
    address: '422 Willow Creek Way, Education City',
    admissionDate: '2021-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1002',
    fullName: 'Sophia Marie Bennett',
    dob: '2015-08-25',
    gender: 'Female',
    classNum: '5',
    section: 'A',
    parentName: 'Victoria Bennett',
    parentPhone: '+1 (555) 301-4402',
    email: 'v.bennett@parentmail.com',
    address: '18 Elm Street, Apt 3B, Education City',
    admissionDate: '2021-08-22',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1003',
    fullName: 'Noah Benjamin Reed',
    dob: '2015-02-18',
    gender: 'Male',
    classNum: '5',
    section: 'A',
    parentName: 'Jonathan Reed',
    parentPhone: '+1 (555) 301-4403',
    email: 'j.reed@parentmail.com',
    address: '904 Cedar Ridge Lane, Education City',
    admissionDate: '2022-01-15',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1004',
    fullName: 'Emma Grace Martinez',
    dob: '2015-11-04',
    gender: 'Female',
    classNum: '5',
    section: 'B',
    parentName: 'Carlos Martinez',
    parentPhone: '+1 (555) 301-4404',
    email: 'c.martinez@parentmail.com',
    address: '512 Sunrise Terrace, Education City',
    admissionDate: '2021-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1005',
    fullName: 'Ethan Gabriel Walker',
    dob: '2014-06-30',
    gender: 'Male',
    classNum: '6',
    section: 'A',
    parentName: 'Melissa Walker',
    parentPhone: '+1 (555) 301-4405',
    email: 'm.walker@parentmail.com',
    address: '33 Maple Avenue, Education City',
    admissionDate: '2020-08-18',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1006',
    fullName: 'Ava Charlotte Kim',
    dob: '2014-09-14',
    gender: 'Female',
    classNum: '6',
    section: 'A',
    parentName: 'Daniel Kim',
    parentPhone: '+1 (555) 301-4406',
    email: 'd.kim@parentmail.com',
    address: '772 Highland Drive, Education City',
    admissionDate: '2020-08-19',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1007',
    fullName: 'Lucas Daniel Brooks',
    dob: '2013-05-19',
    gender: 'Male',
    classNum: '7',
    section: 'A',
    parentName: 'Rachel Brooks',
    parentPhone: '+1 (555) 301-4407',
    email: 'r.brooks@parentmail.com',
    address: '88 Meadowbrook Court, Education City',
    admissionDate: '2019-08-15',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1008',
    fullName: 'Mia Isabella Foster',
    dob: '2013-12-08',
    gender: 'Female',
    classNum: '7',
    section: 'B',
    parentName: 'Gregory Foster',
    parentPhone: '+1 (555) 301-4408',
    email: 'g.foster@parentmail.com',
    address: '144 Whispering Pines, Education City',
    admissionDate: '2019-08-16',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1009',
    fullName: 'Mason William Diaz',
    dob: '2012-03-22',
    gender: 'Male',
    classNum: '8',
    section: 'A',
    parentName: 'Laura Diaz',
    parentPhone: '+1 (555) 301-4409',
    email: 'l.diaz@parentmail.com',
    address: '601 Sycamore Way, Education City',
    admissionDate: '2018-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1010',
    fullName: 'Harper Evelyn Watson',
    dob: '2012-07-15',
    gender: 'Female',
    classNum: '8',
    section: 'B',
    parentName: 'Simon Watson',
    parentPhone: '+1 (555) 301-4410',
    email: 's.watson@parentmail.com',
    address: '290 Parkview Plaza, Education City',
    admissionDate: '2018-08-22',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1011',
    fullName: 'James Oliver Morgan',
    dob: '2011-01-11',
    gender: 'Male',
    classNum: '9',
    section: 'A',
    parentName: 'Patricia Morgan',
    parentPhone: '+1 (555) 301-4411',
    email: 'p.morgan@parentmail.com',
    address: '150 Riverdale Crescent, Education City',
    admissionDate: '2017-08-21',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1012',
    fullName: 'Amelia Rose Howard',
    dob: '2011-10-05',
    gender: 'Female',
    classNum: '9',
    section: 'B',
    parentName: 'Arthur Howard',
    parentPhone: '+1 (555) 301-4412',
    email: 'a.howard@parentmail.com',
    address: '810 Brookside Drive, Education City',
    admissionDate: '2017-08-25',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1013',
    fullName: 'Benjamin Isaac Hughes',
    dob: '2010-04-18',
    gender: 'Male',
    classNum: '10',
    section: 'A',
    parentName: 'Eleanor Hughes',
    parentPhone: '+1 (555) 301-4413',
    email: 'e.hughes@parentmail.com',
    address: '320 Oxford Lane, Education City',
    admissionDate: '2016-08-15',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1014',
    fullName: 'Chloe Victoria Sanchez',
    dob: '2010-08-29',
    gender: 'Female',
    classNum: '10',
    section: 'A',
    parentName: 'Mateo Sanchez',
    parentPhone: '+1 (555) 301-4414',
    email: 'm.sanchez@parentmail.com',
    address: '705 Laurel Canyon, Education City',
    admissionDate: '2016-08-16',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1015',
    fullName: 'Henry Scott Richardson',
    dob: '2016-05-14',
    gender: 'Male',
    classNum: '4',
    section: 'A',
    parentName: 'Claire Richardson',
    parentPhone: '+1 (555) 301-4415',
    email: 'c.richardson@parentmail.com',
    address: '94 Forest View, Education City',
    admissionDate: '2022-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1016',
    fullName: 'Zoe Madison King',
    dob: '2017-02-19',
    gender: 'Female',
    classNum: '3',
    section: 'A',
    parentName: 'Brandon King',
    parentPhone: '+1 (555) 301-4416',
    email: 'b.king@parentmail.com',
    address: '411 Crestline Blvd, Education City',
    admissionDate: '2023-08-21',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1017',
    fullName: 'Leo Anthony Cooper',
    dob: '2018-09-03',
    gender: 'Male',
    classNum: '2',
    section: 'A',
    parentName: 'Teresa Cooper',
    parentPhone: '+1 (555) 301-4417',
    email: 't.cooper@parentmail.com',
    address: '16 Oakwood Court, Education City',
    admissionDate: '2024-08-18',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1018',
    fullName: 'Maya Lillian Ward',
    dob: '2019-06-12',
    gender: 'Female',
    classNum: '1',
    section: 'A',
    parentName: 'Stephen Ward',
    parentPhone: '+1 (555) 301-4418',
    email: 's.ward@parentmail.com',
    address: '58 Sunnybrook Road, Education City',
    admissionDate: '2025-08-22',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1019',
    fullName: 'Elijah Thomas Price',
    dob: '2015-03-31',
    gender: 'Male',
    classNum: '5',
    section: 'C',
    parentName: 'Hannah Price',
    parentPhone: '+1 (555) 301-4419',
    email: 'h.price@parentmail.com',
    address: '883 Timberland Trail, Education City',
    admissionDate: '2021-08-21',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1020',
    fullName: 'Lily Samantha Flores',
    dob: '2010-12-14',
    gender: 'Female',
    classNum: '10',
    section: 'B',
    parentName: 'Oscar Flores',
    parentPhone: '+1 (555) 301-4420',
    email: 'o.flores@parentmail.com',
    address: '221 Bayside Harbor, Education City',
    admissionDate: '2016-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'STU-1021',
    fullName: 'Samuel Caleb Morris',
    dob: '2014-04-09',
    gender: 'Male',
    classNum: '6',
    section: 'B',
    parentName: 'Diana Morris',
    parentPhone: '+1 (555) 301-4421',
    email: 'd.morris@parentmail.com',
    address: '614 Evergreen Street, Education City',
    admissionDate: '2020-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
  },
];

export const INITIAL_CLASSES: ClassSection[] = [
  // Class 1 to 10 with sections A, B, C
  { id: 'CLS-1-A', classNum: '1', section: 'A', classTeacherId: 'TCH-103', roomNumber: 'Room 101' },
  { id: 'CLS-1-B', classNum: '1', section: 'B', classTeacherId: 'TCH-106', roomNumber: 'Room 102' },
  { id: 'CLS-1-C', classNum: '1', section: 'C', classTeacherId: 'TCH-101', roomNumber: 'Room 103' },
  { id: 'CLS-2-A', classNum: '2', section: 'A', classTeacherId: 'TCH-105', roomNumber: 'Room 104' },
  { id: 'CLS-2-B', classNum: '2', section: 'B', classTeacherId: 'TCH-102', roomNumber: 'Room 105' },
  { id: 'CLS-2-C', classNum: '2', section: 'C', classTeacherId: 'TCH-103', roomNumber: 'Room 106' },
  { id: 'CLS-3-A', classNum: '3', section: 'A', classTeacherId: 'TCH-106', roomNumber: 'Room 201' },
  { id: 'CLS-3-B', classNum: '3', section: 'B', classTeacherId: 'TCH-101', roomNumber: 'Room 202' },
  { id: 'CLS-3-C', classNum: '3', section: 'C', classTeacherId: 'TCH-104', roomNumber: 'Room 203' },
  { id: 'CLS-4-A', classNum: '4', section: 'A', classTeacherId: 'TCH-105', roomNumber: 'Room 204' },
  { id: 'CLS-4-B', classNum: '4', section: 'B', classTeacherId: 'TCH-102', roomNumber: 'Room 205' },
  { id: 'CLS-4-C', classNum: '4', section: 'C', classTeacherId: 'TCH-103', roomNumber: 'Room 206' },
  { id: 'CLS-5-A', classNum: '5', section: 'A', classTeacherId: 'TCH-101', roomNumber: 'Room 301' },
  { id: 'CLS-5-B', classNum: '5', section: 'B', classTeacherId: 'TCH-103', roomNumber: 'Room 302' },
  { id: 'CLS-5-C', classNum: '5', section: 'C', classTeacherId: 'TCH-106', roomNumber: 'Room 303' },
  { id: 'CLS-6-A', classNum: '6', section: 'A', classTeacherId: 'TCH-101', roomNumber: 'Room 304' },
  { id: 'CLS-6-B', classNum: '6', section: 'B', classTeacherId: 'TCH-106', roomNumber: 'Room 305' },
  { id: 'CLS-6-C', classNum: '6', section: 'C', classTeacherId: 'TCH-102', roomNumber: 'Room 306' },
  { id: 'CLS-7-A', classNum: '7', section: 'A', classTeacherId: 'TCH-102', roomNumber: 'Room 401' },
  { id: 'CLS-7-B', classNum: '7', section: 'B', classTeacherId: 'TCH-105', roomNumber: 'Room 402' },
  { id: 'CLS-7-C', classNum: '7', section: 'C', classTeacherId: 'TCH-104', roomNumber: 'Room 403' },
  { id: 'CLS-8-A', classNum: '8', section: 'A', classTeacherId: 'TCH-104', roomNumber: 'Room 404' },
  { id: 'CLS-8-B', classNum: '8', section: 'B', classTeacherId: 'TCH-102', roomNumber: 'Room 405' },
  { id: 'CLS-8-C', classNum: '8', section: 'C', classTeacherId: 'TCH-105', roomNumber: 'Room 406' },
  { id: 'CLS-9-A', classNum: '9', section: 'A', classTeacherId: 'TCH-104', roomNumber: 'Room 501' },
  { id: 'CLS-9-B', classNum: '9', section: 'B', classTeacherId: 'TCH-105', roomNumber: 'Room 502' },
  { id: 'CLS-9-C', classNum: '9', section: 'C', classTeacherId: 'TCH-106', roomNumber: 'Room 503' },
  { id: 'CLS-10-A', classNum: '10', section: 'A', classTeacherId: 'TCH-102', roomNumber: 'Room 504' },
  { id: 'CLS-10-B', classNum: '10', section: 'B', classTeacherId: 'TCH-105', roomNumber: 'Room 505' },
  { id: 'CLS-10-C', classNum: '10', section: 'C', classTeacherId: 'TCH-101', roomNumber: 'Room 506' },
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: 'EXAM-2026-T1',
    name: 'First Term Examination 2026',
    academicYear: '2026-2027',
    startDate: '2026-09-10',
    endDate: '2026-09-22',
  },
  {
    id: 'EXAM-2026-MID',
    name: 'Mid-Term Assessment 2026',
    academicYear: '2026-2027',
    startDate: '2026-11-05',
    endDate: '2026-11-18',
  },
  {
    id: 'EXAM-2027-FIN',
    name: 'Final Annual Examination 2027',
    academicYear: '2026-2027',
    startDate: '2027-03-08',
    endDate: '2027-03-24',
  },
];

export const INITIAL_FEE_STRUCTURES: ClassFeeStructure[] = [
  // Class 1-5
  { id: 'FEE-1-TUI', classNum: '5', category: 'Tuition Fee', amount: 450, frequency: 'Monthly' },
  { id: 'FEE-1-TRA', classNum: '5', category: 'Transport Fee', amount: 120, frequency: 'Monthly' },
  { id: 'FEE-1-LIB', classNum: '5', category: 'Library Fee', amount: 40, frequency: 'Annual' },
  { id: 'FEE-1-SPO', classNum: '5', category: 'Sports Fee', amount: 50, frequency: 'Annual' },
  { id: 'FEE-1-EXA', classNum: '5', category: 'Examination Fee', amount: 60, frequency: 'Term' },
  // Class 6-8
  { id: 'FEE-6-TUI', classNum: '6', category: 'Tuition Fee', amount: 520, frequency: 'Monthly' },
  { id: 'FEE-6-TRA', classNum: '6', category: 'Transport Fee', amount: 130, frequency: 'Monthly' },
  { id: 'FEE-6-LIB', classNum: '6', category: 'Library Fee', amount: 50, frequency: 'Annual' },
  { id: 'FEE-6-SPO', classNum: '6', category: 'Sports Fee', amount: 60, frequency: 'Annual' },
  { id: 'FEE-6-EXA', classNum: '6', category: 'Examination Fee', amount: 70, frequency: 'Term' },
  // Class 9-10
  { id: 'FEE-10-TUI', classNum: '10', category: 'Tuition Fee', amount: 650, frequency: 'Monthly' },
  { id: 'FEE-10-TRA', classNum: '10', category: 'Transport Fee', amount: 150, frequency: 'Monthly' },
  { id: 'FEE-10-LIB', classNum: '10', category: 'Library Fee', amount: 60, frequency: 'Annual' },
  { id: 'FEE-10-SPO', classNum: '10', category: 'Sports Fee', amount: 75, frequency: 'Annual' },
  { id: 'FEE-10-EXA', classNum: '10', category: 'Examination Fee', amount: 100, frequency: 'Term' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'Annual Science & Technology Exhibition 2026',
    message: 'We are thrilled to announce the Annual Science Fair scheduled for next Friday in the main auditorium. Students from Classes 5 to 10 are encouraged to submit project briefs to their science instructors by Wednesday.',
    targetAudience: 'All Classes',
    publicationDate: '2026-10-22',
    priority: 'Important',
    author: 'Principal Office',
  },
  {
    id: 'ANN-002',
    title: 'Parent-Teacher Conference (PTC) for Term 1',
    message: 'The Term 1 Parent-Teacher Meeting will be held on Saturday from 9:00 AM to 1:00 PM. Individual appointment slots have been circulated via student diaries and parent portal.',
    targetAudience: 'All Classes',
    publicationDate: '2026-10-18',
    priority: 'Important',
    author: 'Academic Coordinator',
  },
  {
    id: 'ANN-003',
    title: 'Class 10 Board Exam Orientation & Prep Camp',
    message: 'Mandatory orientation session for all Class 10 students and guardians regarding exam schedules, paper patterns, and laboratory practical assessments.',
    targetAudience: 'Class 10',
    publicationDate: '2026-10-15',
    priority: 'Urgent',
    author: 'Dr. Evelyn Sterling',
  },
  {
    id: 'ANN-004',
    title: 'Inter-House Sports Tournament Inauguration',
    message: 'The annual athletics, football, and badminton qualifiers commence this Monday. Students are requested to report in designated house tracksuits.',
    targetAudience: 'All Classes',
    publicationDate: '2026-10-10',
    priority: 'Normal',
    author: 'Physical Education Dept',
  },
];

export const INITIAL_EXAM_SCHEDULES: ExamScheduleItem[] = [
  {
    id: 'SCH-101',
    examId: 'EXAM-2026-MID',
    examName: 'Mid-Term Assessment 2026',
    classNum: '5',
    subject: 'Mathematics',
    examDate: '2026-11-05',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Hall A (Room 301)',
  },
  {
    id: 'SCH-102',
    examId: 'EXAM-2026-MID',
    examName: 'Mid-Term Assessment 2026',
    classNum: '5',
    subject: 'General Science',
    examDate: '2026-11-07',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Hall A (Room 301)',
  },
  {
    id: 'SCH-103',
    examId: 'EXAM-2026-MID',
    examName: 'Mid-Term Assessment 2026',
    classNum: '5',
    subject: 'English Literature',
    examDate: '2026-11-09',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Hall A (Room 301)',
  },
  {
    id: 'SCH-104',
    examId: 'EXAM-2026-MID',
    examName: 'Mid-Term Assessment 2026',
    classNum: '10',
    subject: 'Physics',
    examDate: '2026-11-05',
    startTime: '09:00',
    endTime: '12:00',
    room: 'Auditorium East',
  },
  {
    id: 'SCH-105',
    examId: 'EXAM-2026-MID',
    examName: 'Mid-Term Assessment 2026',
    classNum: '10',
    subject: 'Mathematics',
    examDate: '2026-11-08',
    startTime: '09:00',
    endTime: '12:00',
    room: 'Auditorium East',
  },
];

// Helper to generate seed marks
function generateSeedMarks(): ExamSubjectMark[] {
  const marks: ExamSubjectMark[] = [];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Science', 'Computer Science'];
  
  // Provide marks for Class 5-A students
  const class5A = ['STU-1001', 'STU-1002', 'STU-1003'];
  class5A.forEach((studentId, sIdx) => {
    subjects.forEach((subj, subIdx) => {
      const base = 75 + (sIdx * 6) + (subIdx * 3);
      const score = Math.min(98, Math.max(55, base % 100));
      let grade: ExamSubjectMark['grade'] = 'B';
      if (score >= 90) grade = 'A+';
      else if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 40) grade = 'D';
      else grade = 'Fail';

      marks.push({
        id: `MRK-5A-${studentId}-${subIdx}`,
        examId: 'EXAM-2026-T1',
        studentId,
        classNum: '5',
        section: 'A',
        subject: subj,
        maxMarks: 100,
        obtainedMarks: score,
        grade,
        remarks: score >= 85 ? 'Outstanding analytical grasp' : 'Steady performance',
      });
    });
  });

  // Provide marks for Class 10-A students
  const class10A = ['STU-1013', 'STU-1014'];
  const subjects10 = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
  class10A.forEach((studentId, sIdx) => {
    subjects10.forEach((subj, subIdx) => {
      const score = 82 + ((sIdx + subIdx) * 3);
      marks.push({
        id: `MRK-10A-${studentId}-${subIdx}`,
        examId: 'EXAM-2026-T1',
        studentId,
        classNum: '10',
        section: 'A',
        subject: subj,
        maxMarks: 100,
        obtainedMarks: Math.min(100, score),
        grade: score >= 90 ? 'A+' : 'A',
        remarks: 'Consistent excellence',
      });
    });
  });

  return marks;
}

// Helper to generate seed attendance
function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

  INITIAL_STUDENTS.forEach((student, idx) => {
    // Today
    records.push({
      id: `ATT-${today}-${student.id}`,
      date: today,
      classNum: student.classNum,
      section: student.section,
      studentId: student.id,
      status: idx % 9 === 0 ? 'Absent' : 'Present',
      markedBy: 'Admin (Automated)',
    });

    // Yesterday
    records.push({
      id: `ATT-${yesterday}-${student.id}`,
      date: yesterday,
      classNum: student.classNum,
      section: student.section,
      studentId: student.id,
      status: idx % 11 === 0 ? 'Absent' : 'Present',
      markedBy: 'Admin (Automated)',
    });

    // 2 days ago
    records.push({
      id: `ATT-${twoDaysAgo}-${student.id}`,
      date: twoDaysAgo,
      classNum: student.classNum,
      section: student.section,
      studentId: student.id,
      status: idx % 14 === 0 ? 'Absent' : 'Present',
      markedBy: 'Admin (Automated)',
    });
  });

  return records;
}

// Helper to generate seed timetable
function generateSeedTimetable(): TimetableSlot[] {
  const days: TimetableSlot['weekday'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots: TimetableSlot[] = [];

  // Weekly timetable for Class 5-A
  const periods = [
    { p: 1, start: '08:30', end: '09:15', subj: 'Mathematics', teacher: 'TCH-101' },
    { p: 2, start: '09:15', end: '10:00', subj: 'English', teacher: 'TCH-103' },
    { p: 3, start: '10:15', end: '11:00', subj: 'General Science', teacher: 'TCH-102' },
    { p: 4, start: '11:00', end: '11:45', subj: 'Social Science', teacher: 'TCH-106' },
    { p: 5, start: '12:30', end: '01:15', subj: 'Computer Science', teacher: 'TCH-104' },
    { p: 6, start: '01:15', end: '02:00', subj: 'Physical Education', teacher: 'TCH-106' },
  ];

  days.forEach((day, dIdx) => {
    periods.forEach((per, pIdx) => {
      slots.push({
        id: `TT-5A-${day}-${per.p}`,
        classNum: '5',
        section: 'A',
        weekday: day,
        periodNumber: per.p,
        startTime: per.start,
        endTime: per.end,
        subject: per.subj,
        teacherId: per.teacher,
        room: 'Room 301',
      });
    });
  });

  return slots;
}

// Helper to generate seed payments
function generateSeedPayments(): FeePayment[] {
  return [
    {
      id: 'PAY-1001',
      receiptNumber: 'REC-2026-001',
      studentId: 'STU-1001',
      studentName: 'Liam Alexander Hayes',
      classNum: '5',
      section: 'A',
      category: 'Tuition Fee',
      amountPaid: 450,
      paymentMethod: 'UPI',
      paymentDate: '2026-10-02',
      notes: 'Term 1 Tuition payment confirmed',
    },
    {
      id: 'PAY-1002',
      receiptNumber: 'REC-2026-002',
      studentId: 'STU-1001',
      studentName: 'Liam Alexander Hayes',
      classNum: '5',
      section: 'A',
      category: 'Transport Fee',
      amountPaid: 120,
      paymentMethod: 'Bank Transfer',
      paymentDate: '2026-10-02',
      notes: 'Quarter 1 School Bus service',
    },
    {
      id: 'PAY-1003',
      receiptNumber: 'REC-2026-003',
      studentId: 'STU-1002',
      studentName: 'Sophia Marie Bennett',
      classNum: '5',
      section: 'A',
      category: 'Tuition Fee',
      amountPaid: 450,
      paymentMethod: 'Cash',
      paymentDate: '2026-10-05',
      notes: 'Monthly receipt issued by finance office',
    },
    {
      id: 'PAY-1004',
      receiptNumber: 'REC-2026-004',
      studentId: 'STU-1013',
      studentName: 'Benjamin Isaac Hughes',
      classNum: '10',
      section: 'A',
      category: 'Tuition Fee',
      amountPaid: 650,
      paymentMethod: 'Bank Transfer',
      paymentDate: '2026-10-06',
      notes: 'Senior secondary tuition fee',
    },
    {
      id: 'PAY-1005',
      receiptNumber: 'REC-2026-005',
      studentId: 'STU-1014',
      studentName: 'Chloe Victoria Sanchez',
      classNum: '10',
      section: 'A',
      category: 'Examination Fee',
      amountPaid: 100,
      paymentMethod: 'UPI',
      paymentDate: '2026-10-11',
      notes: 'Board examination registration clearance',
    },
    {
      id: 'PAY-1006',
      receiptNumber: 'REC-2026-006',
      studentId: 'STU-1005',
      studentName: 'Ethan Gabriel Walker',
      classNum: '6',
      section: 'A',
      category: 'Tuition Fee',
      amountPaid: 260,
      paymentMethod: 'Cash',
      paymentDate: '2026-10-15',
      notes: 'Partial payment (50%)',
    },
  ];
}

export const INITIAL_ACTIVITIES = [
  { id: 'ACT-1', timestamp: '10 minutes ago', title: 'Fee payment receipt #REC-2026-006 recorded for Ethan Walker', category: 'Fees' },
  { id: 'ACT-2', timestamp: '1 hour ago', title: 'Daily morning attendance completed for Class 5-A (95% present)', category: 'Attendance' },
  { id: 'ACT-3', timestamp: '3 hours ago', title: 'New announcement published: Annual Science & Technology Exhibition', category: 'Announcement' },
  { id: 'ACT-4', timestamp: 'Yesterday', title: 'Term 1 Exam Marks entered for Class 5-A Mathematics', category: 'Examination' },
  { id: 'ACT-5', timestamp: '2 days ago', title: 'New student admission registered: Samuel Caleb Morris (Class 6-B)', category: 'Registration' },
];

export function getInitialDatabase(): AppDatabase {
  return {
    schoolProfile: INITIAL_SCHOOL_PROFILE,
    students: INITIAL_STUDENTS,
    teachers: INITIAL_TEACHERS,
    classes: INITIAL_CLASSES,
    attendance: generateSeedAttendance(),
    examinations: INITIAL_EXAMINATIONS,
    marks: generateSeedMarks(),
    feeStructures: INITIAL_FEE_STRUCTURES,
    feePayments: generateSeedPayments(),
    timetable: generateSeedTimetable(),
    announcements: INITIAL_ANNOUNCEMENTS,
    examSchedules: INITIAL_EXAM_SCHEDULES,
    activities: INITIAL_ACTIVITIES,
  };
}

// Storage Manager
export const StorageService = {
  load(): AppDatabase {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Basic schema guard
        if (parsed.students && parsed.teachers && parsed.classes) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse database from localStorage, initializing fresh', e);
    }
    const fresh = getInitialDatabase();
    this.save(fresh);
    return fresh;
  },

  save(db: AppDatabase): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  },

  reset(): AppDatabase {
    const fresh = getInitialDatabase();
    this.save(fresh);
    return fresh;
  },

  exportJSON(): string {
    const db = this.load();
    return JSON.stringify(db, null, 2);
  },

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.students && Array.isArray(parsed.students) && parsed.teachers) {
        this.save(parsed);
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON', e);
    }
    return false;
  },
};
