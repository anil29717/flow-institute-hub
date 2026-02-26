export type UserRole = 'owner' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePic?: string;
  isActive: boolean;
}

export interface Teacher extends User {
  employeeId: string;
  qualification?: string;
  specialization?: string[];
  experienceYears?: number;
  joinDate: string;
}

export interface Student extends User {
  studentId: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  enrollmentDate: string;
  courseName?: string;
  batchName?: string;
  feeStatus: 'paid' | 'partial' | 'pending';
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  durationWeeks: number;
  totalFee: number;
  isActive: boolean;
  studentsEnrolled: number;
}

export interface Batch {
  id: string;
  courseName: string;
  name: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  batchName: string;
}

export interface FeeRecord {
  id: string;
  studentName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptNo?: string;
}

export interface LeaveRequest {
  id: string;
  teacherName: string;
  leaveType: 'sick' | 'casual' | 'earned' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
  attendanceRate: number;
  pendingFees: number;
  activeBatches: number;
  pendingLeaves: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
