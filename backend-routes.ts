import express from 'express';
import { Router } from 'express';

// Initialize the main router
const router = Router();

// ==========================================
// 1. Authentication Routes
// ==========================================
const authRouter = Router();
authRouter.post('/register-owner', /* registerOwnerController */);
authRouter.post('/create-institute', /* createInstituteController */); // for admin
authRouter.post('/login', /* loginController */);
authRouter.get('/me', /* requireAuth, getMeController */);

// ==========================================
// 2. Institute Routes
// ==========================================
const instituteRouter = Router();
instituteRouter.get('/', /* getInstitutes */);
instituteRouter.get('/:id', /* getInstituteById */);
instituteRouter.put('/:id', /* updateInstitute */);

// ==========================================
// 3. Profiles & Users
// ==========================================
const usersRouter = Router();
usersRouter.get('/', /* requireAdminOrOwner, getAllUsers */);
usersRouter.get('/:id', /* getUserProfile */);
usersRouter.put('/:id', /* updateUserProfile */);

// ==========================================
// 4. Teachers
// ==========================================
const teachersRouter = Router();
teachersRouter.post('/', /* requireOwner, createTeacher */);
teachersRouter.get('/', /* getTeachers */);
teachersRouter.get('/:id', /* getTeacherById */);
teachersRouter.put('/:id', /* requireOwner, updateTeacher */);
teachersRouter.delete('/:id', /* requireOwner, deleteTeacher */);

// ==========================================
// 5. Students
// ==========================================
const studentsRouter = Router();
studentsRouter.post('/', /* createStudent */);
studentsRouter.get('/', /* getStudents */);
studentsRouter.get('/:id', /* getStudentById */);
studentsRouter.put('/:id', /* updateStudent */);
studentsRouter.delete('/:id', /* deleteStudent */);

// ==========================================
// 6. Courses & Batches
// ==========================================
const coursesRouter = Router();
coursesRouter.post('/', /* createCourse */);
coursesRouter.get('/', /* getCourses */);

const batchesRouter = Router();
batchesRouter.post('/', /* createBatch */);
batchesRouter.get('/', /* getBatches */);
batchesRouter.get('/:id/students', /* getBatchStudents */);

// ==========================================
// 7. Attendance
// ==========================================
const attendanceRouter = Router();
attendanceRouter.post('/student', /* markStudentAttendance */);
attendanceRouter.get('/student', /* getStudentAttendance */);

attendanceRouter.post('/teacher', /* markTeacherAttendance */);
attendanceRouter.get('/teacher', /* getTeacherAttendance */);

// ==========================================
// 8. Fees & Salary
// ==========================================
const feesRouter = Router();
feesRouter.post('/', /* collectFee */);
feesRouter.get('/', /* getFees */);

const salaryRouter = Router();
salaryRouter.post('/', /* paySalary */);
salaryRouter.get('/', /* getSalaryHistory */);

// ==========================================
// 9. Leave Requests
// ==========================================
const leavesRouter = Router();
leavesRouter.post('/', /* requestLeave */);
leavesRouter.get('/', /* getLeaveRequests */);
leavesRouter.patch('/:id/status', /* updateLeaveStatus (approve/reject) */);

// ==========================================
// 10. Tests & Marks
// ==========================================
const testsRouter = Router();
testsRouter.post('/', /* createTest */);
testsRouter.get('/', /* getTests */);
testsRouter.post('/:id/marks', /* submitMarks */);
testsRouter.get('/:id/marks', /* getMarks */);


// ==========================================
// Register all routes
// ==========================================
router.use('/auth', authRouter);
router.use('/institutes', instituteRouter);
router.use('/users', usersRouter);
router.use('/teachers', teachersRouter);
router.use('/students', studentsRouter);
router.use('/courses', coursesRouter);
router.use('/batches', batchesRouter);
router.use('/attendance', attendanceRouter);
router.use('/fees', feesRouter);
router.use('/salary', salaryRouter);
router.use('/leaves', leavesRouter);
router.use('/tests', testsRouter);

export default router;
