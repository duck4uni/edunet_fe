import { useState, useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { EVENT_TYPE_CONFIG } from '../constants/scheduleData';
import type { ScheduleEvent, ApiSchedule } from '../types/schedule';
import { useGetMySchedulesQuery } from '../services/learningApi';

type MaybePaginatedSchedules = {
  rows?: ApiSchedule[];
  count?: number;
};

const normalizeSchedules = (payload: unknown): ApiSchedule[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as ApiSchedule[];

  if (typeof payload === 'object' && payload !== null) {
    const maybePaginated = payload as MaybePaginatedSchedules;
    if (Array.isArray(maybePaginated.rows)) return maybePaginated.rows;
  }

  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Type mapping: backend enum → frontend display type
// Backend:  class | exam | assignment | event
// Frontend: class | quiz | meeting    | assignment | deadline
// ─────────────────────────────────────────────────────────────────────────────
const mapBackendType = (
  backendType: string,
): ScheduleEvent['type'] => {
  switch (backendType) {
    case 'class':       return 'class';
    case 'exam':        return 'quiz';      // exam maps to quiz display
    case 'assignment':  return 'assignment';
    case 'event':       return 'meeting';   // event maps to meeting display
    default:            return 'class';
  }
};

/** Derive a display status from the event date and backend status */
const deriveStatus = (
  dateStr: string,
  startTime: string,
  endTime: string,
  backendStatus?: string,
): ScheduleEvent['status'] => {
  if (backendStatus === 'cancelled' || backendStatus === 'postponed') return 'cancelled';
  const now = dayjs();
  const eventDate = dayjs(dateStr);
  const start = dayjs(`${eventDate.format('YYYY-MM-DD')} ${startTime}`);
  const end   = dayjs(`${eventDate.format('YYYY-MM-DD')} ${endTime}`);

  if (now.isBefore(start))  return 'upcoming';
  if (now.isAfter(end))     return 'completed';
  return 'ongoing';
};

/** Map a raw backend Schedule object to the frontend ScheduleEvent display model */
export const mapApiScheduleToEvent = (s: ApiSchedule): ScheduleEvent => {
  const type = mapBackendType(s.type);
  const config = EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG];

  const instructor = s.course?.teacher
    ? [s.course.teacher.firstName, s.course.teacher.lastName].filter(Boolean).join(' ')
    : undefined;

  return {
    id: s.id,
    title: s.title,
    courseId: s.courseId ?? '',
    courseName: s.course?.title ?? '',
    type,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    description: s.description,
    instructor: instructor || undefined,
    location: s.location,
    meetingLink: s.meetingLink,
    isOnline: s.isOnline,
    status: deriveStatus(s.date, s.startTime, s.endTime, s.status),
    color: config?.color,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export const useSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [filterType, setFilterType]     = useState<string>('all');

  // ── API calls ──────────────────────────────────────────────────────────────
  // Fetch personal schedules for courses the user is enrolled in
  const {
    data: mySchedulesData,
    isLoading: isSchedulesLoading,
    isError: isSchedulesError,
  } = useGetMySchedulesQuery();

  const isLoading = isSchedulesLoading;
  const isError   = isSchedulesError;

  // ── Derived data ───────────────────────────────────────────────────────────
  /** All schedule events mapped to the display model */
  const allEvents = useMemo<ScheduleEvent[]>(() => {
    const rows = normalizeSchedules(mySchedulesData?.data);
    return rows.map(mapApiScheduleToEvent);
  }, [mySchedulesData]);

  /** Personalized event source for calendar rendering */
  const calendarEvents = useMemo<ScheduleEvent[]>(() => allEvents, [allEvents]);

  // ── Filtered views ─────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return calendarEvents;
    return calendarEvents.filter(e => e.type === filterType);
  }, [calendarEvents, filterType]);

  const getEventsForDate = useCallback(
    (date: Dayjs): ScheduleEvent[] => {
      return filteredEvents.filter(
        e => dayjs(e.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'),
      );
    },
    [filteredEvents],
  );

  const todayEvents = useMemo(() => getEventsForDate(dayjs()), [getEventsForDate]);

  const upcomingEvents = useMemo(() => {
    return calendarEvents
      .filter(e => filterType === 'all' || e.type === filterType)
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      .slice(0, 5);
  }, [calendarEvents, filterType]);

  /** Summary statistics from all loaded events (unfiltered) */
  const stats = useMemo(
    () => ({
      total:       calendarEvents.length,
      classes:     calendarEvents.filter(e => e.type === 'class').length,
      assignments: calendarEvents.filter(e => e.type === 'assignment').length,
      quizzes:     calendarEvents.filter(e => e.type === 'quiz').length,
    }),
    [calendarEvents],
  );

  // ── Event handlers ─────────────────────────────────────────────────────────
  const openEventModal = useCallback((event: ScheduleEvent | null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      setSelectedDate(date);
      const events = getEventsForDate(date);
      if (events.length === 1) {
        setSelectedEvent(events[0]);
        setIsModalOpen(true);
      } else if (events.length > 1) {
        setSelectedEvent(null);
        setIsModalOpen(true);
      }
    },
    [getEventsForDate],
  );

  return {
    selectedDate,
    setSelectedDate,
    isModalOpen,
    selectedEvent,
    filterType,
    setFilterType,
    getEventsForDate,
    upcomingEvents,
    todayEvents,
    stats,
    openEventModal,
    closeModal,
    handleDateSelect,
    isLoading,
    isError,
  };
};
