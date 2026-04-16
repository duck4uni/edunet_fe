// Export all API services and hooks

// Chatbot API
export {
  chatbotApi,
  useAskChatbotMutation,
} from './chatbotApi';

export type { ChatData, AskChatbotRequest, AskChatbotResponse } from './chatbotApi';

// Auth API
export {
  authApi,
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} from './authApi';

export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
  PaginatedResponse,
} from './authApi';

// Course API
export {
  courseApi,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetLessonsQuery,
  useGetLessonsByCourseQuery,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetEnrollmentsQuery,
  useGetUserEnrollmentsQuery,
  useGetMyEnrollmentsQuery,
  useGetEnrollmentsByCourseQuery,
  useCheckEnrollmentQuery,
  useEnrollMeMutation,
  useEnrollCourseMutation,
  useUpdateEnrollmentMutation,
  useUpdateEnrollmentProgressMutation,
  useGetEnrollmentByIdQuery,
  useDeleteEnrollmentMutation,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
  useGetReviewsQuery,
  useGetReviewsByCourseQuery,
  useGetCourseReviewStatsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation,
} from './courseApi';

export type {
  Course,
  CourseTeacher,
  Category,
  Teacher,
  Lesson,
  Enrollment,
  Review,
  QueryParams,
} from './courseApi';

// Learning API
export {
  learningApi,
  useGetMaterialsQuery,
  useGetMaterialsByCourseQuery,
  useGetMaterialByIdQuery,
  useCreateMaterialMutation,
  useDeleteMaterialMutation,
  useUpdateMaterialMutation,
  useGetAssignmentsQuery,
  useGetAssignmentsByCourseQuery,
  useGetMyAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useSubmitAssignmentMutation,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGradeAssignmentMutation,
  useGetQuizzesQuery,
  useGetQuizzesByCourseQuery,
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useStartQuizAttemptMutation,
  useSubmitQuizAttemptMutation,
  useGetQuizAttemptsQuery,
  useGetQuizAttemptByIdQuery,
  useGetQuizBestScoreQuery,
  useGetSchedulesQuery,
  useGetUpcomingSchedulesQuery,
  useGetSchedulesByDateRangeQuery,
  useGetSchedulesByCourseQuery,
  useGetScheduleByIdQuery,
  useGetSchedulesByTeacherQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetMySchedulesQuery,
  useGetWeeklySchedulesQuery,
  useCancelScheduleMutation,
  usePostponeScheduleMutation,
  useCreateRecurringScheduleMutation,
} from './learningApi';

export type {
  Material,
  Assignment,
  Quiz,
  QuizAttempt,
  Schedule,
} from './learningApi';

// Support API
export {
  supportApi,
  useGetTicketsQuery,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketsByStatusQuery,
  useGetTicketStatsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useRespondToTicketMutation,
  useResolveTicketMutation,
  useCloseTicketMutation,
  useDeleteTicketMutation,
} from './supportApi';

export type {
  SupportTicket,
  CreateTicketRequest,
  TicketStats,
} from './supportApi';

// Axios utilities
export {
  axiosBaseQuery,
  API_BASE_URL,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './axiosBaseQuery';

// User API
export {
  userApi,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} from './userApi';

export type {
  Student,
} from './userApi';

// Friend & Chat API
export {
  friendChatApi,
  useLazySearchUsersQuery,
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
  useSendFriendRequestMutation,
  useRespondToFriendRequestMutation,
  useUnfriendMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetUnreadCountsQuery,
  useMarkAsReadMutation,
} from './friendChatApi';

// Socket service
export { socketService } from './socketService';
