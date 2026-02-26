import { Teacher, Student, Course, Batch, FeeRecord, LeaveRequest, DashboardStats } from '@/types/crm';

export const mockStats: DashboardStats = {
  totalStudents: 847,
  totalTeachers: 42,
  totalCourses: 18,
  totalRevenue: 2345000,
  attendanceRate: 92.5,
  pendingFees: 156000,
  activeBatches: 24,
  pendingLeaves: 5,
};

export const mockTeachers: Teacher[] = [
  { id: '1', email: 'rajesh.kumar@instiflow.com', role: 'teacher', firstName: 'Rajesh', lastName: 'Kumar', phone: '+91 98765 43210', isActive: true, employeeId: 'TCH-001', qualification: 'M.Tech, IIT Delhi', specialization: ['Data Structures', 'Algorithms'], experienceYears: 12, joinDate: '2020-03-15' },
  { id: '2', email: 'priya.sharma@instiflow.com', role: 'teacher', firstName: 'Priya', lastName: 'Sharma', phone: '+91 98765 43211', isActive: true, employeeId: 'TCH-002', qualification: 'M.Sc Mathematics', specialization: ['Calculus', 'Linear Algebra'], experienceYears: 8, joinDate: '2021-07-01' },
  { id: '3', email: 'amit.patel@instiflow.com', role: 'teacher', firstName: 'Amit', lastName: 'Patel', phone: '+91 98765 43212', isActive: true, employeeId: 'TCH-003', qualification: 'MBA, IIM Ahmedabad', specialization: ['Business Studies', 'Economics'], experienceYears: 15, joinDate: '2019-01-10' },
  { id: '4', email: 'sunita.verma@instiflow.com', role: 'teacher', firstName: 'Sunita', lastName: 'Verma', phone: '+91 98765 43213', isActive: false, employeeId: 'TCH-004', qualification: 'Ph.D Physics', specialization: ['Quantum Mechanics', 'Optics'], experienceYears: 20, joinDate: '2018-06-20' },
  { id: '5', email: 'vikram.singh@instiflow.com', role: 'teacher', firstName: 'Vikram', lastName: 'Singh', phone: '+91 98765 43214', isActive: true, employeeId: 'TCH-005', qualification: 'M.A English Literature', specialization: ['Creative Writing', 'Grammar'], experienceYears: 6, joinDate: '2022-09-01' },
];

export const mockStudents: Student[] = [
  { id: '1', email: 'arjun.m@student.com', role: 'student', firstName: 'Arjun', lastName: 'Mehta', isActive: true, studentId: 'STU-001', enrollmentDate: '2024-01-15', courseName: 'Full Stack Development', batchName: 'Batch A - Morning', feeStatus: 'paid' },
  { id: '2', email: 'neha.g@student.com', role: 'student', firstName: 'Neha', lastName: 'Gupta', isActive: true, studentId: 'STU-002', enrollmentDate: '2024-01-20', courseName: 'Data Science', batchName: 'Batch B - Evening', feeStatus: 'partial' },
  { id: '3', email: 'rohan.j@student.com', role: 'student', firstName: 'Rohan', lastName: 'Joshi', isActive: true, studentId: 'STU-003', enrollmentDate: '2024-02-01', courseName: 'Full Stack Development', batchName: 'Batch A - Morning', feeStatus: 'pending' },
  { id: '4', email: 'ananya.r@student.com', role: 'student', firstName: 'Ananya', lastName: 'Reddy', isActive: true, studentId: 'STU-004', enrollmentDate: '2024-02-10', courseName: 'UI/UX Design', batchName: 'Batch C - Afternoon', feeStatus: 'paid' },
  { id: '5', email: 'karan.s@student.com', role: 'student', firstName: 'Karan', lastName: 'Shah', isActive: false, studentId: 'STU-005', enrollmentDate: '2023-11-05', courseName: 'Digital Marketing', batchName: 'Batch D - Weekend', feeStatus: 'overdue' as any },
  { id: '6', email: 'divya.p@student.com', role: 'student', firstName: 'Divya', lastName: 'Pandey', isActive: true, studentId: 'STU-006', enrollmentDate: '2024-03-01', courseName: 'Data Science', batchName: 'Batch B - Evening', feeStatus: 'paid' },
];

export const mockCourses: Course[] = [
  { id: '1', name: 'Full Stack Development', description: 'Complete MERN stack with deployment', durationWeeks: 24, totalFee: 45000, isActive: true, studentsEnrolled: 120 },
  { id: '2', name: 'Data Science & ML', description: 'Python, ML, Deep Learning, NLP', durationWeeks: 20, totalFee: 55000, isActive: true, studentsEnrolled: 95 },
  { id: '3', name: 'UI/UX Design', description: 'Figma, Adobe XD, Design Systems', durationWeeks: 16, totalFee: 35000, isActive: true, studentsEnrolled: 78 },
  { id: '4', name: 'Digital Marketing', description: 'SEO, SEM, Social Media, Analytics', durationWeeks: 12, totalFee: 25000, isActive: true, studentsEnrolled: 65 },
  { id: '5', name: 'Cloud Computing', description: 'AWS, Azure, DevOps, Kubernetes', durationWeeks: 18, totalFee: 50000, isActive: false, studentsEnrolled: 45 },
];

export const mockBatches: Batch[] = [
  { id: '1', courseName: 'Full Stack Development', name: 'Batch A - Morning', teacherName: 'Rajesh Kumar', startDate: '2024-01-15', endDate: '2024-07-15', maxStudents: 30, currentStudents: 28, status: 'ongoing' },
  { id: '2', courseName: 'Data Science & ML', name: 'Batch B - Evening', teacherName: 'Priya Sharma', startDate: '2024-02-01', endDate: '2024-07-01', maxStudents: 25, currentStudents: 22, status: 'ongoing' },
  { id: '3', courseName: 'UI/UX Design', name: 'Batch C - Afternoon', teacherName: 'Vikram Singh', startDate: '2024-03-01', endDate: '2024-07-01', maxStudents: 20, currentStudents: 18, status: 'ongoing' },
  { id: '4', courseName: 'Full Stack Development', name: 'Batch D - Weekend', teacherName: 'Rajesh Kumar', startDate: '2024-04-01', endDate: '2024-10-01', maxStudents: 30, currentStudents: 12, status: 'upcoming' },
];

export const mockFees: FeeRecord[] = [
  { id: '1', studentName: 'Arjun Mehta', amount: 45000, dueDate: '2024-02-01', paidDate: '2024-01-28', status: 'paid', receiptNo: 'RCP-001' },
  { id: '2', studentName: 'Neha Gupta', amount: 55000, dueDate: '2024-02-15', status: 'pending' },
  { id: '3', studentName: 'Rohan Joshi', amount: 45000, dueDate: '2024-01-30', status: 'overdue' },
  { id: '4', studentName: 'Ananya Reddy', amount: 35000, dueDate: '2024-03-01', paidDate: '2024-02-28', status: 'paid', receiptNo: 'RCP-004' },
  { id: '5', studentName: 'Karan Shah', amount: 25000, dueDate: '2024-01-15', status: 'overdue' },
];

export const mockLeaves: LeaveRequest[] = [
  { id: '1', teacherName: 'Rajesh Kumar', leaveType: 'sick', startDate: '2024-03-10', endDate: '2024-03-12', reason: 'Flu and fever', status: 'pending' },
  { id: '2', teacherName: 'Priya Sharma', leaveType: 'casual', startDate: '2024-03-15', endDate: '2024-03-15', reason: 'Personal work', status: 'approved' },
  { id: '3', teacherName: 'Amit Patel', leaveType: 'earned', startDate: '2024-04-01', endDate: '2024-04-05', reason: 'Family vacation', status: 'pending' },
  { id: '4', teacherName: 'Vikram Singh', leaveType: 'emergency', startDate: '2024-03-08', endDate: '2024-03-09', reason: 'Family emergency', status: 'approved' },
];

export const revenueData = [
  { month: 'Sep', revenue: 180000 },
  { month: 'Oct', revenue: 220000 },
  { month: 'Nov', revenue: 195000 },
  { month: 'Dec', revenue: 310000 },
  { month: 'Jan', revenue: 420000 },
  { month: 'Feb', revenue: 380000 },
];

export const attendanceData = [
  { day: 'Mon', present: 92, absent: 8 },
  { day: 'Tue', present: 88, absent: 12 },
  { day: 'Wed', present: 95, absent: 5 },
  { day: 'Thu', present: 90, absent: 10 },
  { day: 'Fri', present: 85, absent: 15 },
  { day: 'Sat', present: 78, absent: 22 },
];

export const courseDistribution = [
  { name: 'Full Stack', students: 120, fill: 'hsl(222, 60%, 22%)' },
  { name: 'Data Science', students: 95, fill: 'hsl(175, 60%, 40%)' },
  { name: 'UI/UX', students: 78, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Marketing', students: 65, fill: 'hsl(0, 72%, 51%)' },
  { name: 'Cloud', students: 45, fill: 'hsl(270, 50%, 50%)' },
];
