export type UserRole = 'admin' | 'teacher' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  linkedStudentId?: string; // For parents
  teacherId?: string; // For teachers
}

export interface Student {
  id: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  classNum: string; // "1" to "10"
  section: 'A' | 'B' | 'C';
  parentName: string;
  parentPhone: string;
  email: string;
  address: string;
  admissionDate: string;
  photoUrl: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  subjects: string[];
  assignedClasses: string[]; // e.g. ["5-A", "6-B"]
  joiningDate: string;
  avatarUrl?: string;
}

export interface ClassSection {
  id: string;
  classNum: string; // "1" to "10"
  section: 'A' | 'B' | 'C';
  classTeacherId: string; // Teacher ID
  roomNumber: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classNum: string;
  section: 'A' | 'B' | 'C';
  studentId: string;
  status: 'Present' | 'Absent';
  markedBy?: string;
}

export interface Examination {
  id: string;
  name: string; // e.g. "Term 1 Mid-Term", "Final Annual Examination"
  academicYear: string;
  startDate: string;
  endDate: string;
}

export interface ExamSubjectMark {
  id: string;
  examId: string;
  studentId: string;
  classNum: string;
  section: 'A' | 'B' | 'C';
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'Fail';
  remarks?: string;
}

export type FeeCategory = 'Tuition Fee' | 'Transport Fee' | 'Library Fee' | 'Sports Fee' | 'Examination Fee';

export interface ClassFeeStructure {
  id: string;
  classNum: string;
  category: FeeCategory;
  amount: number;
  frequency: 'Annual' | 'Term' | 'Monthly';
}

export interface FeePayment {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  classNum: string;
  section: string;
  category: FeeCategory;
  amountPaid: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  paymentDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  classNum: string;
  section: 'A' | 'B' | 'C';
  weekday: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  startTime: string; // "09:00"
  endTime: string;   // "09:45"
  subject: string;
  teacherId: string;
  room?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: string; // "All Classes" | "Class 1" ... "Class 10"
  publicationDate: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  author: string;
}

export interface ExamScheduleItem {
  id: string;
  examId: string;
  examName: string;
  classNum: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface SchoolProfile {
  name: string;
  motto: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  academicYear: string;
  principalName: string;
  currencySymbol: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  title: string;
  category: string;
}

export interface AppDatabase {
  schoolProfile: SchoolProfile;
  students: Student[];
  teachers: Teacher[];
  classes: ClassSection[];
  attendance: AttendanceRecord[];
  examinations: Examination[];
  marks: ExamSubjectMark[];
  feeStructures: ClassFeeStructure[];
  feePayments: FeePayment[];
  timetable: TimetableSlot[];
  announcements: Announcement[];
  examSchedules: ExamScheduleItem[];
  activities: ActivityItem[];
}

