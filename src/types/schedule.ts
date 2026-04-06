// Schedule page types
export interface ScheduleEvent {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  type: 'class' | 'assignment' | 'quiz' | 'meeting' | 'deadline';
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  instructor?: string;
  location?: string;
  meetingLink?: string;
  isOnline?: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  color?: string;
}

export interface ScheduleFilter {
  type: string[];
  course: string[];
}

/** Backend schedule status */
export type ApiScheduleStatus = 'scheduled' | 'cancelled' | 'postponed';

/** Raw shape returned by the backend Schedule entity (with optional relation includes) */
export interface ApiSchedule {
  id: string;
  title: string;
  description?: string;
  /** Backend enum: 'class' | 'exam' | 'assignment' | 'event' */
  type: string;
  /** Backend status */
  status?: ApiScheduleStatus;
  cancelReason?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  isOnline: boolean;
  courseId?: string;
  teacherId?: string;
  course?: {
    id: string;
    title: string;
    thumbnail?: string;
    teacher?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

/** Response shape for GET /schedules/weekly */
export interface WeeklyScheduleResponse {
  weekStart: string;
  weekEnd: string;
  byDay: Record<string, ApiSchedule[]>;
}

/** Body for POST /schedules/recurring */
export interface RecurringScheduleRequest {
  title: string;
  type?: string;
  description?: string;
  startDate: string;
  recurrenceEndDate: string;
  /** 0=Sunday … 6=Saturday */
  weekDays: number[];
  startTime: string;
  endTime: string;
  isOnline?: boolean;
  location?: string;
  meetingLink?: string;
  courseId: string;
  teacherId?: string;
}

/** Response shape for POST /schedules/recurring */
export interface RecurringScheduleResponse {
  count: number;
  sessions: ApiSchedule[];
}

/** Body for PATCH /schedules/:id/postpone */
export interface PostponeScheduleRequest {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  notes?: string;
}
