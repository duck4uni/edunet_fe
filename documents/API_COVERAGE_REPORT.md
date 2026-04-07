# EduNet — Báo cáo tổng hợp API Backend & Frontend Coverage

> **Ngày tạo:** 07/04/2026  
> **Tổng số API Backend:** 93 endpoints (16 controllers)  
> **Tổng số API Frontend gọi:** 91 endpoints  
> **API chưa được FE sử dụng:** 2 endpoints  

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Chi tiết API theo từng module](#2-chi-tiết-api-theo-từng-module)
   - [2.1 App](#21-app-api)
   - [2.2 Auth](#22-auth-apiauth)
   - [2.3 Courses](#23-courses-apicourses)
   - [2.4 Enrollments](#24-enrollments-apienrollments)
   - [2.5 Lessons](#25-lessons-apilessons)
   - [2.6 Materials](#26-materials-apimaterials)
   - [2.7 Assignments](#27-assignments-apiassignments)
   - [2.8 Quizzes](#28-quizzes-apiquizzes)
   - [2.9 Reviews](#29-reviews-apireviews)
   - [2.10 Schedules](#210-schedules-apischedules)
   - [2.11 Students](#211-students-apistudents)
   - [2.12 Teachers](#212-teachers-apiteachers)
   - [2.13 Users](#213-users-apiusers)
   - [2.14 Support Tickets](#214-support-tickets-apisupport-tickets)
   - [2.15 Chatbot](#215-chatbot-apichatbot)
   - [2.16 Categories](#216-categories-apicategories)
3. [Mapping FE Services → BE Endpoints](#3-mapping-fe-services--be-endpoints)
4. [API chưa được FE sử dụng](#4-api-chưa-được-fe-sử-dụng)
5. [Thống kê tổng hợp](#5-thống-kê-tổng-hợp)

---

## 1. Tổng quan kiến trúc

### Backend (NestJS)
- **Global prefix:** `/api`
- **Authentication:** JWT Bearer Token (`AuthGuard`)
- **Authorization:** Role-based (`RolesGuard`) — roles: `STUDENT`, `TEACHER`, `ADMIN`
- **Pagination:** Hỗ trợ `page`, `limit`, `sort`, `filter`, `include` trên tất cả GET list endpoints

### Frontend (React + RTK Query)
- **Base URL:** `VITE_API_BASE_URL` (mặc định: `http://localhost:3000/api`)
- **HTTP Client:** Axios thông qua `axiosBaseQuery` (RTK Query)
- **Token:** Tự động đính kèm `Authorization: Bearer <token>` từ localStorage
- **Service files:**
  - `authApi.ts` — Auth & Profile
  - `courseApi.ts` — Courses, Categories, Teachers, Lessons, Enrollments, Reviews
  - `learningApi.ts` — Materials, Assignments, Quizzes, Schedules
  - `supportApi.ts` — Support Tickets
  - `chatbotApi.ts` — Chatbot AI
  - `userApi.ts` — Users & Students
  - `s3Service.ts` — AWS S3 upload (client-side, không qua BE)

---

## 2. Chi tiết API theo từng module

### 2.1 App (`/api`)

| Method | Endpoint | Auth | Payload | Response | FE Hook |
|--------|----------|------|---------|----------|---------|
| GET | `/api` | ❌ | — | `string` ("Hello World") | ❌ Không gọi |
| GET | `/api/health` | ❌ | — | `{ status, timestamp }` | ❌ Không gọi |

> ℹ️ Đây là 2 endpoint hệ thống (health check), FE không cần gọi.

---

### 2.2 Auth (`/api/auth`)

| Method | Endpoint | Auth | Payload | Response | FE Hook |
|--------|----------|------|---------|----------|---------|
| POST | `/api/auth/login` | ❌ | `LoginDto` | `CommonResponse<LoginResponse>` | ✅ `useLoginMutation` |
| POST | `/api/auth/register` | ❌ | `RegisterDto` | `CommonResponse<LoginResponse>` | ✅ `useRegisterMutation` |
| POST | `/api/auth/register/teacher` | ❌ | `RegisterTeacherDto` + `cv` file | `CommonResponse<{ message }>` | ✅ `useRegisterTeacherMutation` |
| GET | `/api/auth/profile` | ✅ | — | `CommonResponse<User>` | ✅ `useGetProfileQuery` |
| POST | `/api/auth/refresh` | ❌ | `{ refreshToken }` | `CommonResponse<{ accessToken }>` | ✅ `useRefreshTokenMutation` |
| POST | `/api/auth/logout` | ✅ | `{ refreshToken }` | `CommonResponse` | ✅ `useLogoutMutation` |
| POST | `/api/auth/forgot-password` | ❌ | `{ email }` | `CommonResponse` | ✅ `useForgotPasswordMutation` |
| POST | `/api/auth/reset-password` | ❌ | `{ token, password }` | `CommonResponse` | ✅ `useResetPasswordMutation` |

**LoginDto:**
| Field | Type | Required |
|-------|------|----------|
| `email` | string (email) | ✅ |
| `password` | string (min 6) | ✅ |

**RegisterDto:**
| Field | Type | Required |
|-------|------|----------|
| `firstName` | string | ✅ |
| `lastName` | string | ❌ |
| `email` | string (email) | ✅ |
| `password` | string (min 6) | ✅ |
| `phone` | string | ❌ |
| `role` | UserRole enum | ❌ |

**RegisterTeacherDto (multipart/form-data):**
| Field | Type | Required |
|-------|------|----------|
| `firstName` | string | ✅ |
| `lastName` | string | ❌ |
| `email` | string (email) | ✅ |
| `password` | string (min 6) | ✅ |
| `phone` | string | ❌ |
| `qualification` | string | ❌ |
| `specialization` | string[] | ❌ |
| `experience` | number | ❌ |
| `bio` | string | ❌ |
| `cv` | File (PDF, max 5MB) | ✅ |

---

### 2.3 Courses (`/api/courses`)

| Method | Endpoint | Auth | Roles | Payload | FE Hook |
|--------|----------|------|-------|---------|---------|
| POST | `/api/courses` | ✅ | TEACHER, ADMIN | `CreateCourseDto` | ✅ `useCreateCourseMutation` |
| GET | `/api/courses` | ❌ | — | Pagination query | ✅ `useGetCoursesQuery` |
| GET | `/api/courses/:id` | ❌ | — | `include` query | ✅ `useGetCourseByIdQuery` |
| PATCH | `/api/courses/:id` | ✅ | TEACHER, ADMIN | `UpdateCourseDto` | ✅ `useUpdateCourseMutation` |
| PATCH | `/api/courses/:id/submit` | ✅ | TEACHER | — | ✅ `useSubmitCourseForReviewMutation` |
| PATCH | `/api/courses/:id/review` | ✅ | ADMIN | `UpdateCourseStatusDto` | ✅ `useReviewCourseMutation` |
| PATCH | `/api/courses/:id/publish` | ✅ | ADMIN | — | ✅ `usePublishCourseByIdMutation` |
| DELETE | `/api/courses/:id` | ✅ | TEACHER, ADMIN | — | ✅ `useDeleteCourseMutation` |

**CreateCourseDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `thumbnail` | string | ❌ |
| `price` | number | ❌ |
| `discountPrice` | number | ❌ |
| `duration` | string | ❌ |
| `level` | CourseLevel enum | ❌ |
| `language` | string | ❌ |
| `tags` | string[] | ❌ |
| `goal` | string | ❌ |
| `schedule` | string[] | ❌ |
| `startDate` | string (ISO date) | ❌ |
| `teacherId` | UUID | ❌ |
| `categoryId` | UUID | ❌ |

**UpdateCourseStatusDto:**
| Field | Type | Required |
|-------|------|----------|
| `status` | `'approved'` \| `'rejected'` | ✅ |
| `rejectionReason` | string | ❌ |

---

### 2.4 Enrollments (`/api/enrollments`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/enrollments` | ✅ | `CreateEnrollmentDto` | ✅ `useEnrollCourseMutation` |
| POST | `/api/enrollments/enroll` | ✅ | `{ courseId }` | ✅ `useEnrollMeMutation` |
| GET | `/api/enrollments/my-enrollments` | ✅ | — | ✅ `useGetMyEnrollmentsQuery` |
| GET | `/api/enrollments/check/:courseId` | ✅ | — | ✅ `useCheckEnrollmentQuery` |
| GET | `/api/enrollments` | ✅ | Pagination query | ✅ `useGetEnrollmentsQuery` |
| GET | `/api/enrollments/course/:courseId` | ✅ | — | ✅ `useGetEnrollmentsByCourseQuery` |
| GET | `/api/enrollments/:id` | ✅ | — | ✅ `useGetEnrollmentByIdQuery` |
| GET | `/api/enrollments/user/:userId` | ✅ | — | ✅ `useGetUserEnrollmentsQuery` |
| PATCH | `/api/enrollments/:id` | ✅ | `UpdateEnrollmentDto` | ✅ `useUpdateEnrollmentMutation` |
| PATCH | `/api/enrollments/:id/approve` | ✅ | — | ✅ `useApproveEnrollmentMutation` |
| PATCH | `/api/enrollments/:id/reject` | ✅ | — | ✅ `useRejectEnrollmentMutation` |
| PATCH | `/api/enrollments/:id/progress` | ✅ | `{ progress }` | ✅ `useUpdateEnrollmentProgressMutation` |
| DELETE | `/api/enrollments/:id` | ✅ | — | ✅ `useDeleteEnrollmentMutation` |

**CreateEnrollmentDto:**
| Field | Type | Required |
|-------|------|----------|
| `userId` | UUID | ✅ |
| `courseId` | UUID | ✅ |
| `progress` | number | ❌ |
| `status` | EnrollmentStatus enum | ❌ |

---

### 2.5 Lessons (`/api/lessons`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/lessons` | ✅ | `CreateLessonDto` | ✅ `useCreateLessonMutation` |
| GET | `/api/lessons` | ❌ | Pagination query | ✅ `useGetLessonsQuery` |
| GET | `/api/lessons/:id` | ❌ | — | ✅ `useGetLessonByIdQuery` |
| GET | `/api/lessons/course/:courseId` | ❌ | — | ✅ `useGetLessonsByCourseQuery` |
| PATCH | `/api/lessons/:id` | ✅ | `UpdateLessonDto` | ✅ `useUpdateLessonMutation` |
| DELETE | `/api/lessons/:id` | ✅ | — | ✅ `useDeleteLessonMutation` |

**CreateLessonDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `type` | LessonType enum | ❌ |
| `content` | string | ❌ |
| `videoUrl` | string | ❌ |
| `duration` | string | ❌ |
| `order` | number | ❌ |
| `isFree` | boolean | ❌ |
| `courseId` | UUID | ✅ |

---

### 2.6 Materials (`/api/materials`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/materials` | ✅ | `CreateMaterialDto` | ✅ `useCreateMaterialMutation` |
| GET | `/api/materials` | ❌ | Pagination query | ✅ `useGetMaterialsQuery` |
| GET | `/api/materials/:id` | ❌ | — | ✅ `useGetMaterialByIdQuery` |
| GET | `/api/materials/course/:courseId` | ❌ | — | ✅ `useGetMaterialsByCourseQuery` |
| PATCH | `/api/materials/:id` | ✅ | `UpdateMaterialDto` | ✅ `useUpdateMaterialMutation` |
| DELETE | `/api/materials/:id` | ✅ | — | ✅ `useDeleteMaterialMutation` |

**CreateMaterialDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `type` | MaterialType enum | ❌ |
| `downloadUrl` | string | ✅ |
| `size` | string | ❌ |
| `courseId` | UUID | ✅ |

---

### 2.7 Assignments (`/api/assignments`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/assignments` | ✅ | `CreateAssignmentDto` | ✅ `useCreateAssignmentMutation` |
| GET | `/api/assignments` | ❌ | Pagination query | ✅ `useGetAssignmentsQuery` |
| GET | `/api/assignments/:id` | ❌ | — | ✅ `useGetAssignmentByIdQuery` |
| GET | `/api/assignments/student/:studentId` | ✅ | — | ✅ `useGetMyAssignmentsQuery` |
| GET | `/api/assignments/course/:courseId` | ❌ | — | ✅ `useGetAssignmentsByCourseQuery` |
| PATCH | `/api/assignments/:id` | ✅ | `UpdateAssignmentDto` | ✅ `useUpdateAssignmentMutation` |
| POST | `/api/assignments/:id/submit` | ✅ | `{ submissionUrl }` | ✅ `useSubmitAssignmentMutation` |
| POST | `/api/assignments/:id/grade` | ✅ | `{ grade, feedback? }` | ✅ `useGradeAssignmentMutation` |
| DELETE | `/api/assignments/:id` | ✅ | — | ✅ `useDeleteAssignmentMutation` |

**CreateAssignmentDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `dueDate` | string (ISO date) | ✅ |
| `status` | AssignmentStatus enum | ❌ |
| `grade` | number | ❌ |
| `maxGrade` | number | ❌ |
| `attachments` | object | ❌ |
| `feedback` | string | ❌ |
| `submissionUrl` | string | ❌ |
| `courseId` | UUID | ✅ |
| `studentId` | UUID | ❌ |

---

### 2.8 Quizzes (`/api/quizzes`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/quizzes` | ✅ | `CreateQuizDto` | ✅ `useCreateQuizMutation` |
| GET | `/api/quizzes` | ❌ | Pagination query | ✅ `useGetQuizzesQuery` |
| GET | `/api/quizzes/:id` | ❌ | — | ✅ `useGetQuizByIdQuery` |
| GET | `/api/quizzes/course/:courseId` | ❌ | — | ✅ `useGetQuizzesByCourseQuery` |
| PATCH | `/api/quizzes/:id` | ✅ | `UpdateQuizDto` | ✅ `useUpdateQuizMutation` |
| DELETE | `/api/quizzes/:id` | ✅ | — | ✅ `useDeleteQuizMutation` |
| POST | `/api/quizzes/:id/start` | ✅ | — | ✅ `useStartQuizAttemptMutation` |
| POST | `/api/quizzes/attempts/:attemptId/submit` | ✅ | `{ answers, score, correctAnswers }` | ✅ `useSubmitQuizAttemptMutation` |
| GET | `/api/quizzes/attempts/:attemptId` | ✅ | — | ✅ `useGetQuizAttemptByIdQuery` |
| GET | `/api/quizzes/:id/attempts` | ✅ | — | ✅ `useGetQuizAttemptsQuery` |
| GET | `/api/quizzes/:id/best-score` | ✅ | — | ✅ `useGetQuizBestScoreQuery` |

**CreateQuizDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `duration` | number | ❌ |
| `questions` | any[] | ❌ |
| `totalQuestions` | number | ❌ |
| `maxAttempts` | number | ❌ |
| `passingScore` | number | ❌ |
| `shuffleQuestions` | boolean | ❌ |
| `showCorrectAnswers` | boolean | ❌ |
| `courseId` | UUID | ✅ |

---

### 2.9 Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/reviews` | ✅ | `CreateReviewDto` | ✅ `useCreateReviewMutation` |
| GET | `/api/reviews` | ❌ | Pagination query | ✅ `useGetReviewsQuery` |
| GET | `/api/reviews/:id` | ❌ | — | ⚠️ **CHƯA GỌI** |
| GET | `/api/reviews/course/:courseId` | ❌ | — | ✅ `useGetReviewsByCourseQuery` |
| GET | `/api/reviews/course/:courseId/stats` | ❌ | — | ✅ `useGetCourseReviewStatsQuery` |
| PATCH | `/api/reviews/:id` | ✅ | `UpdateReviewDto` | ✅ `useUpdateReviewMutation` |
| DELETE | `/api/reviews/:id` | ✅ | — | ✅ `useDeleteReviewMutation` |
| PATCH | `/api/reviews/:id/toggle-visibility` | ✅ | — | ✅ `useToggleReviewVisibilityMutation` |

**CreateReviewDto:**
| Field | Type | Required |
|-------|------|----------|
| `rating` | number (1–5) | ✅ |
| `comment` | string | ❌ |
| `courseId` | UUID | ✅ |

---

### 2.10 Schedules (`/api/schedules`)

| Method | Endpoint | Auth | Roles | Payload | FE Hook |
|--------|----------|------|-------|---------|---------|
| GET | `/api/schedules` | ❌ | — | Pagination query | ✅ `useGetSchedulesQuery` |
| GET | `/api/schedules/my` | ✅ | — | — | ✅ `useGetMySchedulesQuery` |
| GET | `/api/schedules/weekly` | ❌ | — | `weekStart`, `courseId?`, `teacherId?` | ✅ `useGetWeeklySchedulesQuery` |
| GET | `/api/schedules/upcoming` | ❌ | — | `days?` | ✅ `useGetUpcomingSchedulesQuery` |
| GET | `/api/schedules/date-range` | ❌ | — | `startDate`, `endDate` | ✅ `useGetSchedulesByDateRangeQuery` |
| GET | `/api/schedules/course/:courseId` | ❌ | — | — | ✅ `useGetSchedulesByCourseQuery` |
| GET | `/api/schedules/teacher/:teacherId` | ❌ | — | — | ✅ `useGetSchedulesByTeacherQuery` |
| GET | `/api/schedules/:id` | ❌ | — | — | ✅ `useGetScheduleByIdQuery` |
| POST | `/api/schedules` | ✅ | TEACHER, ADMIN | `CreateScheduleDto` | ✅ `useCreateScheduleMutation` |
| POST | `/api/schedules/recurring` | ✅ | TEACHER, ADMIN | `CreateRecurringScheduleDto` | ✅ `useCreateRecurringScheduleMutation` |
| PATCH | `/api/schedules/:id/cancel` | ✅ | TEACHER, ADMIN | `CancelScheduleDto` | ✅ `useCancelScheduleMutation` |
| PATCH | `/api/schedules/:id/postpone` | ✅ | TEACHER, ADMIN | `PostponeScheduleDto` | ✅ `usePostponeScheduleMutation` |
| PATCH | `/api/schedules/:id` | ✅ | TEACHER, ADMIN | `UpdateScheduleDto` | ✅ `useUpdateScheduleMutation` |
| DELETE | `/api/schedules/:id` | ✅ | ADMIN | — | ✅ `useDeleteScheduleMutation` |

**CreateScheduleDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `type` | ScheduleType enum | ❌ |
| `date` | string (ISO date) | ✅ |
| `startTime` | string (HH:mm) | ✅ |
| `endTime` | string (HH:mm) | ✅ |
| `location` | string | ❌ |
| `meetingLink` | string | ❌ |
| `isOnline` | boolean | ❌ |
| `courseId` | UUID | ❌ |
| `teacherId` | UUID | ❌ |

**CancelScheduleDto:**
| Field | Type | Required |
|-------|------|----------|
| `cancelReason` | string | ❌ |

**PostponeScheduleDto:**
| Field | Type | Required |
|-------|------|----------|
| `newDate` | string (YYYY-MM-DD) | ✅ |
| `newStartTime` | string (HH:mm) | ✅ |
| `newEndTime` | string (HH:mm) | ✅ |
| `notes` | string | ❌ |

**CreateRecurringScheduleDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ❌ |
| `type` | ScheduleType enum | ❌ |
| `startDate` | string (YYYY-MM-DD) | ✅ |
| `recurrenceEndDate` | string (YYYY-MM-DD) | ✅ |
| `weekDays` | number[] (0=Sun..6=Sat) | ✅ |
| `startTime` | string (HH:mm) | ✅ |
| `endTime` | string (HH:mm) | ✅ |
| `location` | string | ❌ |
| `meetingLink` | string | ❌ |
| `isOnline` | boolean | ❌ |
| `courseId` | UUID | ❌ |
| `teacherId` | UUID | ❌ |

---

### 2.11 Students (`/api/students`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/students` | ✅ | `CreateStudentDto` | ✅ `useCreateStudentMutation` |
| GET | `/api/students` | ✅ | Pagination query | ✅ `useGetStudentsQuery` |
| GET | `/api/students/:id` | ✅ | — | ✅ `useGetStudentByIdQuery` |
| PATCH | `/api/students/:id` | ✅ | `UpdateStudentDto` | ✅ `useUpdateStudentMutation` |
| DELETE | `/api/students/:id` | ✅ | — | ✅ `useDeleteStudentMutation` |

**CreateStudentDto:**
| Field | Type | Required |
|-------|------|----------|
| `userId` | UUID | ✅ |
| `school` | string | ❌ |
| `grade` | string | ❌ |

---

### 2.12 Teachers (`/api/teachers`)

| Method | Endpoint | Auth | Roles | Payload | FE Hook |
|--------|----------|------|-------|---------|---------|
| POST | `/api/teachers` | ✅ | ADMIN | `CreateTeacherDto` | ✅ `useCreateTeacherMutation` |
| GET | `/api/teachers` | ✅ | ADMIN | Pagination query | ✅ `useGetTeachersQuery` |
| GET | `/api/teachers/:id` | ✅ | — | — | ✅ `useGetTeacherByIdQuery` |
| PATCH | `/api/teachers/:id/approve` | ✅ | ADMIN | — | ✅ `useApproveTeacherMutation` |
| PATCH | `/api/teachers/:id/reject` | ✅ | ADMIN | `RejectTeacherDto` | ✅ `useRejectTeacherMutation` |
| PATCH | `/api/teachers/:id` | ✅ | ADMIN, TEACHER | `UpdateTeacherDto` | ✅ `useUpdateTeacherMutation` |
| DELETE | `/api/teachers/:id` | ✅ | ADMIN | — | ✅ `useDeleteTeacherMutation` |

**CreateTeacherDto:**
| Field | Type | Required |
|-------|------|----------|
| `userId` | UUID | ✅ |
| `specialization` | string[] | ❌ |
| `qualification` | string | ❌ |
| `experience` | number | ❌ |
| `status` | string | ❌ |
| `bio` | string | ❌ |
| `socialLinks` | `{ linkedin?, twitter?, website? }` | ❌ |

**RejectTeacherDto:**
| Field | Type | Required |
|-------|------|----------|
| `rejectionReason` | string | ❌ |

---

### 2.13 Users (`/api/users`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| GET | `/api/users` | ✅ | Pagination query | ✅ `useGetUsersQuery` |
| GET | `/api/users/:id` | ✅ | — | ✅ `useGetUserByIdQuery` |
| PATCH | `/api/users/:id` | ✅ | `UpdateUserDto` | ✅ `useUpdateUserMutation` + `useUpdateProfileMutation` |
| DELETE | `/api/users/:id` | ✅ | — | ✅ `useDeleteUserMutation` |

**UpdateUserDto:**
| Field | Type | Required |
|-------|------|----------|
| `firstName` | string | ❌ |
| `lastName` | string | ❌ |
| `phone` | string | ❌ |
| `avatar` | string | ❌ |
| `bio` | string | ❌ |
| `dateOfBirth` | string (ISO date) | ❌ |
| `gender` | Gender enum | ❌ |
| `address` | string | ❌ |
| `city` | string | ❌ |
| `country` | string | ❌ |
| `isActive` | boolean | ❌ |

---

### 2.14 Support Tickets (`/api/support-tickets`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/support-tickets` | ✅ | `CreateSupportTicketDto` | ✅ `useCreateTicketMutation` |
| GET | `/api/support-tickets` | ✅ | Pagination query | ✅ `useGetTicketsQuery` |
| GET | `/api/support-tickets/stats` | ✅ | — | ✅ `useGetTicketStatsQuery` |
| GET | `/api/support-tickets/my-tickets` | ✅ | — | ✅ `useGetMyTicketsQuery` |
| GET | `/api/support-tickets/status/:status` | ✅ | — | ✅ `useGetTicketsByStatusQuery` |
| GET | `/api/support-tickets/:id` | ✅ | — | ✅ `useGetTicketByIdQuery` |
| PATCH | `/api/support-tickets/:id` | ✅ | `UpdateSupportTicketDto` | ✅ `useUpdateTicketMutation` |
| POST | `/api/support-tickets/:id/respond` | ✅ | `{ response, assignedToId? }` | ✅ `useRespondToTicketMutation` |
| POST | `/api/support-tickets/:id/resolve` | ✅ | — | ✅ `useResolveTicketMutation` |
| POST | `/api/support-tickets/:id/close` | ✅ | — | ✅ `useCloseTicketMutation` |
| DELETE | `/api/support-tickets/:id` | ✅ | — | ✅ `useDeleteTicketMutation` |

**CreateSupportTicketDto:**
| Field | Type | Required |
|-------|------|----------|
| `subject` | string | ✅ |
| `message` | string | ✅ |
| `priority` | TicketPriority enum | ❌ |
| `category` | TicketCategory enum | ❌ |
| `attachments` | object | ❌ |

---

### 2.15 Chatbot (`/api/chatbot`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| GET | `/api/chatbot` | ❌ | `page`, `limit` | ✅ `useGetChatDataListQuery` |
| POST | `/api/chatbot/ask` | ❌ | `AskChatbotDto` | ✅ `useAskChatbotMutation` |
| POST | `/api/chatbot` | ❌ | `CreateChatDataDto` | ✅ `useCreateChatDataMutation` |
| GET | `/api/chatbot/:id` | ❌ | — | ⚠️ **CHƯA GỌI** |
| PATCH | `/api/chatbot/:id` | ❌ | `UpdateChatDataDto` | ✅ `useUpdateChatDataMutation` |
| DELETE | `/api/chatbot/:id` | ❌ | — | ✅ `useDeleteChatDataMutation` |

**AskChatbotDto:**
| Field | Type | Required |
|-------|------|----------|
| `question` | string | ✅ |

**CreateChatDataDto:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `content` | string | ✅ |
| `fileType` | ChatDataFileType enum | ❌ |
| `htmlContent` | string | ❌ |
| `imageCount` | number | ❌ |
| `date` | string | ❌ |

---

### 2.16 Categories (`/api/categories`)

| Method | Endpoint | Auth | Payload | FE Hook |
|--------|----------|------|---------|---------|
| POST | `/api/categories` | ✅ | `CreateCategoryDto` | ✅ `useCreateCategoryMutation` |
| GET | `/api/categories` | ❌ | Pagination query | ✅ `useGetCategoriesQuery` |
| GET | `/api/categories/:id` | ❌ | — | ✅ `useGetCategoryByIdQuery` |
| PATCH | `/api/categories/:id` | ✅ | `UpdateCategoryDto` | ✅ `useUpdateCategoryMutation` |
| DELETE | `/api/categories/:id` | ✅ | — | ✅ `useDeleteCategoryMutation` |

**CreateCategoryDto:**
| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `description` | string | ❌ |
| `image` | string | ❌ |
| `slug` | string | ❌ |
| `order` | number | ❌ |
| `isActive` | boolean | ❌ |

---

## 3. Mapping FE Services → BE Endpoints

| FE Service File | Module | Endpoints Covered |
|-----------------|--------|-------------------|
| `authApi.ts` | Auth (8) + Users PATCH (1) | 9 |
| `courseApi.ts` | Courses (8) + Categories (5) + Teachers (7) + Lessons (6) + Enrollments (13) + Reviews (7) | 46 |
| `learningApi.ts` | Materials (6) + Assignments (9) + Quizzes (11) + Schedules (14) | 40 |
| `supportApi.ts` | Support Tickets (11) | 11 |
| `chatbotApi.ts` | Chatbot (5) | 5 |
| `userApi.ts` | Users (4) + Students (5) | 9 |
| **Tổng FE** | | **91** (không tính 2 App endpoints) |

---

## 4. API chưa được FE sử dụng

### ⚠️ Chưa có FE hook (2 endpoints)

| # | Method | Endpoint | Module | Lý do / Ghi chú |
|---|--------|----------|--------|------------------|
| 1 | GET | `/api/reviews/:id` | Reviews | Chưa có `useGetReviewByIdQuery`. FE hiện chỉ lấy review theo course hoặc list, chưa xem chi tiết 1 review. |
| 2 | GET | `/api/chatbot/:id` | Chatbot | Chưa có `useGetChatDataByIdQuery`. FE chỉ lấy danh sách chatbot data, chưa xem chi tiết 1 item. |

### ℹ️ Endpoints hệ thống (không cần FE gọi)

| # | Method | Endpoint | Lý do |
|---|--------|----------|-------|
| 1 | GET | `/api` | Health check — chỉ trả về "Hello World" |
| 2 | GET | `/api/health` | Health check — dùng cho monitoring/DevOps |

---

## 5. Thống kê tổng hợp

| Metric | Giá trị |
|--------|---------|
| **Tổng BE endpoints** | 93 |
| **Endpoints hệ thống (health check)** | 2 |
| **Endpoints nghiệp vụ** | 91 |
| **FE đã gọi** | 89 |
| **FE chưa gọi** | **2** (`GET /reviews/:id`, `GET /chatbot/:id`) |
| **Tỷ lệ coverage** | **97.8%** (89/91) |

### Phân bổ theo HTTP Method

| Method | BE Count | FE Called |
|--------|----------|-----------|
| GET | 51 | 49 |
| POST | 22 | 22 |
| PATCH | 18 | 18 |
| DELETE | 12 | 12 |

### Phân bổ theo Module

| Module | BE Endpoints | FE Called | Missing |
|--------|-------------|-----------|---------|
| App | 2 | 0 | 0 (system) |
| Auth | 8 | 8 | 0 |
| Courses | 8 | 8 | 0 |
| Enrollments | 13 | 13 | 0 |
| Lessons | 6 | 6 | 0 |
| Materials | 6 | 6 | 0 |
| Assignments | 9 | 9 | 0 |
| Quizzes | 11 | 11 | 0 |
| Reviews | 8 | 7 | **1** |
| Schedules | 15 | 14 | 0 |
| Students | 5 | 5 | 0 |
| Teachers | 7 | 7 | 0 |
| Users | 4 | 4 | 0 |
| Support Tickets | 11 | 11 | 0 |
| Chatbot | 6 | 5 | **1** |
| Categories | 5 | 5 | 0 |

---

> **Kết luận:** Frontend đã gọi gần như toàn bộ API của Backend (97.8%). Chỉ còn 2 endpoint GET chi tiết đơn lẻ (`GET /reviews/:id` và `GET /chatbot/:id`) chưa được implement ở FE — đây là các endpoint phụ trợ, không ảnh hưởng đến luồng chính của ứng dụng.
