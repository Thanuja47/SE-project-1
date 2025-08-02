import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ManageSchools = React.lazy(() => import('./views/schools/ManageSchools'))
const ManageCourses = React.lazy(() => import('./views/courses/ManageCourses'))
const AddCourse = React.lazy(() => import('./views/courses/AddCourse'))
const EditCourse = React.lazy(() => import('./views/courses/EditCourse'))
const ManageStudents = React.lazy(() => import('./views/students/ManageStudents'))
const ClassScheduling = React.lazy(() => import('./views/classes/ClassScheduling'))
const AttendanceManagement = React.lazy(() => import('./views/classes/AttendanceManagement'))
const FeeStructure = React.lazy(() => import('./views/financials/FeeStructure'))
const PaymentManagement = React.lazy(() => import('./views/financials/PaymentManagement'))
const AssignGrades = React.lazy(() => import('./views/grading/AssignGrades'))
const PerformanceReports = React.lazy(() => import('./views/grading/Grades'))
const AdminNotifications = React.lazy(() => import('./views/notifications/AdminNotifications'))
const StudentNotifications = React.lazy(() => import('./views/notifications/StudentNotifications'))
const ViewReports = React.lazy(() => import('./views/reports/ViewReports'))
const SystemAnalytics = React.lazy(() => import('./views/reports/SystemAnalytics'))
const UserRolesPermissions = React.lazy(() => import('./views/settings/UserRolesPermissions'))
const SystemSettings = React.lazy(() => import('./views/settings/SystemSettings'))
const AddNewSchool = React.lazy(() => import('./views/schools/AddNewSchool'))
const EditSchool = React.lazy(() => import('./views/schools/EditSchool'))
const EditStudent = React.lazy(() => import('./views/students/EditStudent'))
const EditSchedule = React.lazy(() => import('./views/classes/EditSchedule'))
const PaymentOverview = React.lazy(() => import('./views/financials/PaymentOverview'))
const UserManagement = React.lazy(() => import('./views/admin/users'))
const UserProfile = React.lazy(() => import('./views/user/UserProfile'))
const PaymentForm = React.lazy(() => import('./views/financials/PaymentForm'))
const EnrolledClasses = React.lazy(() => import('./views/classes/EnrolledClasses'))
const ClassSchedule = React.lazy(() => import('./views/classes/ClassSchedule'))
const EnrollClass = React.lazy(() => import('./views/classes/EnrollClass'))
const Grades = React.lazy(() => import('./views/grading/Grades'))
const EditPayment = React.lazy(() => import('./views/financials/EditPaymentPage'))

const routes = [
  {
    path: '/',
    exact: true,
    name: 'Home',
    element: Dashboard,
    allowedRoles: ['admin', 'instructor', 'student'],
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: Dashboard,
    allowedRoles: ['admin', 'instructor', 'student'],
  },
  { path: '/schools', name: 'Manage Schools', element: ManageSchools, allowedRoles: ['admin'] },
  {
    path: '/courses',
    name: 'Manage Courses',
    element: ManageCourses,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/courses/add',
    name: 'Add Course',
    element: AddCourse,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/courses/edit/:id',
    name: 'Edit Course',
    element: EditCourse,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/students/manage',
    name: 'Manage Students',
    element: ManageStudents,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/classes/schedule',
    name: 'Class Scheduling',
    element: ClassScheduling,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/classes/attendance',
    name: 'Attendance Management',
    element: AttendanceManagement,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/financials/fees',
    name: 'Fee Structure',
    element: FeeStructure,
    allowedRoles: ['admin'],
  },
  {
    path: '/financials/payments',
    name: 'Payment Management',
    element: PaymentManagement,
    allowedRoles: ['admin', 'student'],
  },
  {
    path: '/grading/assign',
    name: 'Assign Grades',
    element: AssignGrades,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/grading/reports',
    name: 'Performance Reports',
    element: PerformanceReports,
    allowedRoles: ['admin', 'instructor', 'student'],
  },
  {
    path: '/notifications/admin',
    name: 'Admin Notifications',
    element: AdminNotifications,
    allowedRoles: ['admin'],
  },
  {
    path: '/notifications/student',
    name: 'Student Notifications',
    element: StudentNotifications,
    allowedRoles: ['student'],
  },
  { path: '/reports/view', name: 'View Reports', element: ViewReports, allowedRoles: ['admin'] },
  {
    path: '/reports/analytics',
    name: 'System Analytics',
    element: SystemAnalytics,
    allowedRoles: ['admin'],
  },
  {
    path: '/settings/roles',
    name: 'User Roles & Permissions',
    element: UserRolesPermissions,
    allowedRoles: ['admin'],
  },
  {
    path: '/settings/system',
    name: 'System Settings',
    element: SystemSettings,
    allowedRoles: ['admin'],
  },
  {
    path: '/schools/add',
    name: 'Add New School',
    element: AddNewSchool,
    allowedRoles: ['admin'],
  },
  {
    path: '/schools/edit/:id',
    name: 'Edit School',
    element: EditSchool,
    allowedRoles: ['admin'],
  },
  {
    path: '/students/edit/:id',
    name: 'Edit Student',
    element: EditStudent,
    allowedRoles: ['admin', 'instructor', 'student'],
  },
  {
    path: '/classes/edit/:id',
    name: 'Edit Schedule',
    element: EditSchedule,
    allowedRoles: ['admin', 'instructor'],
  },
  {
    path: '/financials/overview',
    name: 'Payment Overview',
    element: PaymentOverview,
    allowedRoles: ['admin', 'student'],
  },
  {
    path: '/admin/users',
    name: 'User Management',
    element: UserManagement,
    allowedRoles: ['admin'],
  },
  {
    path: '/user/profile',
    name: 'User Profile',
    element: UserProfile,
    allowedRoles: ['admin', 'instructor', 'student'],
  },
  {
    path: '/financials/payment',
    name: 'Payment Form',
    element: PaymentForm,
    allowedRoles: ['admin', 'student'],
  },
  {
    path: '/EnrolledClasses',
    name: 'Enrolled Classes',
    element: EnrolledClasses,
    allowedRoles: ['student'],
  },
  {
    path: '/shedule',
    name: 'Class Schedule',
    element: ClassSchedule,
    allowedRoles: ['student'],
  },
  {
    path: '/Enroll',
    name: 'Enroll Class',
    element: EnrollClass,
    allowedRoles: ['student'],
  },
  {
    path: '/Grades',
    name: 'Grades',
    element: Grades,
    allowedRoles: ['student'],
  },
  {
    path: '/financials/EditPayment',
    name: 'Edit Payment',
    element: EditPayment,
    allowedRoles: ['admin'],
  },
]

export default routes
