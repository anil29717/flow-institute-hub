# InstiFlow — Features, Flows & Role Connections

## 1. Role Hierarchy

```
Super Admin (platform-level)
  └── Institute Owner (institute-level)
        └── Teacher (assigned by owner)
              └── Student (created by owner, managed by teacher)
```

---

## 2. Registration & Login Flows

### 2.1 Super Admin Creation
- **Method**: Edge function `seed-admin`
- **Flow**:
  1. Call `seed-admin` with email, password, firstName, lastName
  2. Creates auth user (email auto-confirmed)
  3. Creates profile via `handle_new_user` trigger
  4. Assigns `admin` role in `user_roles` table
- **Login**: `/admin/login` → redirects to `/admin` dashboard
- **Validation**: No plan check — admins bypass all plan restrictions

### 2.2 Institute Owner Registration
- **Method**: Self-registration via `/register` page → calls `register-owner` edge function
- **Flow**:
  1. Owner fills form: institute name, code, address, phone, email + owner credentials
  2. Edge function validates:
     - All required fields present
     - Password ≥ 6 characters
     - Institute code is unique
     - Email is not already registered
  3. Creates auth user (email auto-confirmed)
  4. Creates institute record with `is_approved = false`
  5. Assigns `owner` role in `user_roles`
  6. Updates profile with `institute_id` and phone
- **Login**: `/login`
- **Validation at login**:
  1. Checks `is_approved` status (admin must approve first)
  2. Checks `plan_id` exists on institute
  3. Checks `is_active = true`
  4. Checks `plan_expires_at` is not past
  5. If any fail → returns `NO_ACTIVE_PLAN` error, signs out immediately

### 2.3 Teacher Creation
- **Method**: Owner creates via UI → calls `create-teacher` edge function
- **Flow**:
  1. Owner fills form: email, password, name, phone, qualification, specialization, experience, salary details
  2. Edge function validates:
     - Caller has `owner` role
     - Institute plan is not expired
     - Teacher count < plan's `max_teachers` limit
  3. Auto-generates `employee_id`: `{INST_CODE}-TEA-{random4digit}`
  4. Creates auth user (email auto-confirmed)
  5. Assigns `teacher` role in `user_roles`
  6. Updates profile with phone and `institute_id`
  7. Creates `teachers` record with salary info, qualification, etc.
- **Login**: `/login` (same as owner)
- **Validation at login**: Same plan check as owner (via `institute_id` lookup through teachers table)

### 2.4 Student Creation
- **Method**: Owner creates via Students page UI
- **Flow**:
  1. Owner fills form: name, phone, email, guardian info, school, class, DOB, batch, course, fees
  2. Auto-generates `student_id`: `{INST_CODE}-STU-{random4digit}`
  3. Inserts into `students` table with `institute_id` from owner's profile
  4. Sets `fee_status` based on payment (paid/partial/pending)
- **No auth user created** — students don't log in
- **Validation**: Plan limit check (`currentStudents < max_students`)

---

## 3. Admin Features

### 3.1 Dashboard (`/admin`)
- Overview stats: total institutes, students, teachers, revenue
- Pending institute approvals list

### 3.2 Institute Management
- View all institutes (approved & pending)
- **Approve/Reject** new institute registrations (`is_approved` flag)
- **Activate/Deactivate** institutes (`is_active` flag)
- Assign/change plans for institutes

### 3.3 Plan Management (`/admin/plans`)
- CRUD on plans table
- Each plan defines:
  - `name` (e.g., Free, Silver, Gold)
  - `price`
  - `max_students` — cap on students per institute
  - `max_teachers` — cap on teachers per institute
  - `max_days` — plan validity in days
  - `is_active` — whether plan is available for assignment

### 3.4 Plan Assignment Flow
1. Admin selects institute → assigns a plan
2. Sets `plan_id`, `plan_started_at`, `plan_expires_at` on institutes table
3. Creates record in `plan_history` (audit trail):
   - `plan_name`, `amount_paid`, `payment_mode`, `started_at`, `expires_at`, `changed_by`, `notes`

### 3.5 Admin Students/Teachers/Fees (`/admin/students`, `/admin/teachers`, `/admin/fees`)
- Cross-institute view of all students, teachers, and fee records
- Read-only or management depending on implementation

---

## 4. Institute Owner Features

### 4.1 Dashboard (`/dashboard`)
- Stats: total students, teachers, active batches, revenue, attendance rate, pending fees, pending leaves

### 4.2 Teacher Management (`/teachers`)
- Create teachers (via edge function — see §2.3)
- View/edit teacher details
- Track salary info (amount, type: per_month/per_lecture, payment frequency)

### 4.3 Student Management (`/students`)
- Create/edit/deactivate students
- Assign to batch and course
- Track fee status (paid/partial/pending)
- View fee payment history

### 4.4 Batch Management (`/batches`)
- Create batches linked to a course and teacher
- Fields: name, course, teacher, start/end date, max students, status (upcoming/ongoing/completed)
- Assign students to batches

### 4.5 Attendance (`/attendance`)
- Mark daily attendance for students per batch
- View attendance records

### 4.6 Fee Management (`/fees`)
- Record fee payments (`fee_payments` table)
- Track per-student: `total_fee`, `fee_paid`, `fee_status`
- Payment modes: cash, bank_transfer, UPI, etc.

### 4.7 Salary Management (`/salary`)
- Record salary payments for teachers (`salary_payments` table)
- Fields: amount, payment_date, payment_mode, period_label, notes

### 4.8 Leave Management (`/leaves`)
- View teacher leave requests
- Approve/reject pending leaves
- Leave types: sick, casual, earned, emergency

### 4.9 Tests & Marks (`/tests`)
- Create tests (name, subject, date, time)
- Assign tests to batches (`test_batches`) and students (`test_students`)
- Enter marks per student per test (`marks` table)

### 4.10 Settings (`/settings`)
- Institute profile settings (name, address, phone, email, logo)

---

## 5. Teacher Features

### 5.1 Dashboard (`/dashboard`)
- Personal stats: assigned batches, student count, upcoming tests, leave status

### 5.2 My Students (`/students`)
- View students in assigned batches (read-only)
- Student profile card (name, contact, guardian, fees, batch info)

### 5.3 Attendance (`/attendance`)
- Mark attendance only for students in **assigned batches**
- RLS enforced: `batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid()))`

### 5.4 Tests & Marks (`/tests`)
- Create tests (linked to `created_by = auth.uid()`)
- Assign batches and students to tests
- Enter/update marks for own tests only

### 5.5 Leaves (`/leaves`)
- Submit leave requests
- View own leave history
- Can update only pending leaves

### 5.6 Salary History (`/salary`)
- View own salary payment records (read-only)

### 5.7 Profile (`/profile`)
- View/edit own profile details

---

## 6. Data Relationships

```
institutes
  ├── profiles (via institute_id)
  ├── teachers (via institute_id)
  ├── students (via institute_id)
  ├── tests (via institute_id)
  └── plans (via plan_id → plans table)

profiles
  ├── user_roles (via user_id → auth.users.id)
  └── teachers (via profile_id)

teachers
  ├── batches (via teacher_id)
  ├── salary_payments (via teacher_id)
  ├── leave_requests (via teacher_id)
  ├── teacher_attendance (via teacher_id)
  └── feedback (via teacher_id)

batches
  ├── students (via batch_id)
  ├── attendance (via batch_id)
  ├── test_batches (via batch_id)
  └── courses (via course_id)

students
  ├── attendance (via student_id)
  ├── fee_payments (via student_id)
  ├── marks (via student_id)
  └── test_students (via student_id)

tests
  ├── test_batches (via test_id)
  ├── test_students (via test_id)
  └── marks (via test_id)
```

---

## 7. ID Generation Patterns

| Entity    | Format                        | Example          |
|-----------|-------------------------------|------------------|
| Institute | UUID (auto)                   | `abc-def-...`    |
| Teacher   | `{INST_CODE}-TEA-{4digits}`   | `MYINST-TEA-3847`|
| Student   | `{INST_CODE}-STU-{4digits}`   | `MYINST-STU-1294`|
| All other | UUID v4 (auto via `gen_random_uuid()`) | — |

---

## 8. Security Model (RLS)

- **Admin**: Full access to ALL tables via `has_role(auth.uid(), 'admin')`
- **Owner**: Full access scoped to own institute via `institute_id = get_user_institute_id(auth.uid())`
- **Teacher**: Read access scoped to own institute; write access only for:
  - Attendance in assigned batches
  - Tests they created
  - Own leave requests
  - Own profile
- **Students**: No auth account — no direct database access

### Key Security Functions
- `has_role(_user_id, _role)` — checks user_roles table (SECURITY DEFINER)
- `get_teacher_id(_user_id)` — resolves auth user → teacher record ID
- `get_user_institute_id(_user_id)` — resolves auth user → institute_id (checks profiles first, then teachers)

---

## 9. Plan Enforcement

### At Login (AuthContext)
1. Sign in with email/password
2. Fetch role from `user_roles`
3. If not admin → fetch `institute_id` from profile (or teachers table for teachers)
4. Check institute: `plan_id` exists, `is_active = true`, `plan_expires_at > now()`
5. If any check fails → sign out + return `NO_ACTIVE_PLAN`

### At Action Time (usePlanLimits hook)
- Before adding student: `currentStudents < plan.max_students`
- Before adding teacher: `currentTeachers < plan.max_teachers`
- Edge functions also enforce limits server-side

### Auto-Deactivation
- DB function `deactivate_expired_institutes()` sets `is_active = false` for expired plans
