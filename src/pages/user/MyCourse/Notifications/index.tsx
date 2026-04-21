import React, { useEffect, useMemo, useState } from 'react';
import {
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ReadOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Empty, List, Segmented, Spin, Tag, Typography } from 'antd';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetProfileQuery } from '../../../../services/authApi';
import { useGetCourseByIdQuery, useGetEnrollmentsByCourseQuery } from '../../../../services/courseApi';
import {
  useGetAssignmentsByCourseQuery,
  useGetMaterialsByCourseQuery,
  useGetQuizzesByCourseQuery,
} from '../../../../services/learningApi';

const { Title, Text } = Typography;

type NotificationFilter = 'all' | 'unread';
type NotificationPriority = 'high' | 'medium' | 'low';
type NotificationType = 'enrollment' | 'assignment' | 'grade' | 'material' | 'quiz' | 'reminder';

type CourseNotification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  priority: NotificationPriority;
  type: NotificationType;
};

const SORT_BY_NEWEST = (a: CourseNotification, b: CourseNotification) => {
  return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
};

const getPriorityColor = (priority: NotificationPriority): 'red' | 'orange' | 'blue' => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    default:
      return 'blue';
  }
};

const getTypeIcon = (type: NotificationType): React.ReactNode => {
  switch (type) {
    case 'enrollment':
      return <TeamOutlined className="text-blue-500" />;
    case 'assignment':
      return <FileTextOutlined className="text-orange-500" />;
    case 'grade':
      return <CheckCircleOutlined className="text-green-500" />;
    case 'material':
      return <BookOutlined className="text-cyan-500" />;
    case 'quiz':
      return <ReadOutlined className="text-purple-500" />;
    default:
      return <WarningOutlined className="text-red-500" />;
  }
};

const formatDateTime = (value: string): string => {
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return '-';
  }

  return parsed.format('DD/MM/YYYY HH:mm');
};

const NotificationCenter: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [readMap, setReadMap] = useState<Record<string, true>>({});
  const [hydrated, setHydrated] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const user = profileData?.data;
  const userRole = user?.role === 'teacher' ? 'teacher' : 'student';

  const { data: courseData, isLoading: isCourseLoading } = useGetCourseByIdQuery(
    { id: courseId || '', include: 'teacher' },
    { skip: !courseId },
  );

  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useGetEnrollmentsByCourseQuery(courseId || '', {
    skip: !courseId || userRole !== 'teacher',
  });

  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useGetAssignmentsByCourseQuery(courseId || '', {
    skip: !courseId,
  });

  const { data: materialsData, isLoading: isMaterialsLoading } = useGetMaterialsByCourseQuery(courseId || '', {
    skip: !courseId,
  });

  const { data: quizzesData, isLoading: isQuizzesLoading } = useGetQuizzesByCourseQuery(courseId || '', {
    skip: !courseId,
  });

  const storageKey = useMemo(() => {
    if (!user?.id || !courseId) {
      return null;
    }

    return `course-notification-read:${user.id}:${courseId}`;
  }, [courseId, user?.id]);

  const notifications = useMemo(() => {
    const builtNotifications: CourseNotification[] = [];
    const now = dayjs();

    if (userRole === 'teacher') {
      const pendingEnrollments = (enrollmentsData?.data || []).filter((enrollment) => enrollment.status === 'pending');

      pendingEnrollments.forEach((enrollment) => {
        const studentName = enrollment.user
          ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
          : 'Một học viên';

        builtNotifications.push({
          id: `enrollment-pending-${enrollment.id}`,
          title: 'Có yêu cầu tham gia lớp mới',
          description: `${studentName} vừa gửi yêu cầu tham gia khóa học.`,
          createdAt: enrollment.createdAt,
          priority: 'high',
          type: 'enrollment',
        });
      });

      const submittedAssignments = (assignmentsData?.data || []).filter((assignment) => assignment.status === 'submitted');

      submittedAssignments.forEach((assignment) => {
        builtNotifications.push({
          id: `assignment-submitted-${assignment.id}`,
          title: 'Có bài tập đã nộp',
          description: `Bài tập "${assignment.title}" vừa có bài nộp mới.`,
          createdAt: assignment.submittedAt || assignment.createdAt,
          priority: 'medium',
          type: 'assignment',
        });
      });
    }

    if (userRole === 'student') {
      (assignmentsData?.data || []).forEach((assignment) => {
        if (assignment.status === 'graded' && typeof assignment.grade === 'number') {
          builtNotifications.push({
            id: `assignment-graded-${assignment.id}`,
            title: 'Bài tập đã có điểm',
            description: `"${assignment.title}" đã được chấm: ${assignment.grade}/${assignment.maxGrade}.`,
            createdAt: assignment.submittedAt || assignment.createdAt,
            priority: 'medium',
            type: 'grade',
          });
          return;
        }

        if (assignment.status === 'overdue') {
          builtNotifications.push({
            id: `assignment-overdue-${assignment.id}`,
            title: 'Bài tập quá hạn',
            description: `"${assignment.title}" đã quá hạn nộp.`,
            createdAt: assignment.dueDate,
            priority: 'high',
            type: 'reminder',
          });
          return;
        }

        if (assignment.status === 'pending') {
          const dueAt = dayjs(assignment.dueDate);
          const remainingDays = dueAt.diff(now, 'day');

          if (remainingDays >= 0 && remainingDays <= 3) {
            builtNotifications.push({
              id: `assignment-due-soon-${assignment.id}`,
              title: 'Sắp đến hạn nộp bài',
              description: `"${assignment.title}" còn ${remainingDays} ngày tới hạn nộp.`,
              createdAt: assignment.dueDate,
              priority: 'high',
              type: 'reminder',
            });
          }
        }
      });

      const recentMaterials = [...(materialsData?.data || [])]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 6);

      recentMaterials.forEach((material) => {
        builtNotifications.push({
          id: `material-${material.id}`,
          title: 'Tài liệu mới trong khóa học',
          description: `Giảng viên vừa thêm tài liệu "${material.title}".`,
          createdAt: material.createdAt,
          priority: 'low',
          type: 'material',
        });
      });

      const recentQuizzes = [...(quizzesData?.data || [])]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 6);

      recentQuizzes.forEach((quiz) => {
        builtNotifications.push({
          id: `quiz-${quiz.id}`,
          title: 'Bài kiểm tra mới',
          description: `Bài kiểm tra "${quiz.title}" đã sẵn sàng.`,
          createdAt: quiz.createdAt,
          priority: 'medium',
          type: 'quiz',
        });
      });
    }

    return builtNotifications.sort(SORT_BY_NEWEST);
  }, [assignmentsData?.data, enrollmentsData?.data, materialsData?.data, quizzesData?.data, userRole]);

  useEffect(() => {
    if (!storageKey) {
      setHydrated(true);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setReadMap({});
      } else {
        const ids = JSON.parse(raw) as string[];
        const normalized = ids.reduce<Record<string, true>>((accumulator, itemId) => {
          accumulator[itemId] = true;
          return accumulator;
        }, {});
        setReadMap(normalized);
      }
    } catch {
      setReadMap({});
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setReadMap((prevMap) => {
      const nextMap = notifications.reduce<Record<string, true>>((accumulator, item) => {
        if (prevMap[item.id]) {
          accumulator[item.id] = true;
        }
        return accumulator;
      }, {});

      return nextMap;
    });
  }, [hydrated, notifications]);

  useEffect(() => {
    if (!hydrated || !storageKey) {
      return;
    }

    const ids = Object.keys(readMap);
    localStorage.setItem(storageKey, JSON.stringify(ids));
  }, [hydrated, readMap, storageKey]);

  const notificationsWithReadState = useMemo(() => {
    return notifications.map((item) => ({
      ...item,
      isRead: !!readMap[item.id],
    }));
  }, [notifications, readMap]);

  const unreadCount = useMemo(() => {
    return notificationsWithReadState.filter((item) => !item.isRead).length;
  }, [notificationsWithReadState]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notificationsWithReadState.filter((item) => !item.isRead);
    }

    return notificationsWithReadState;
  }, [filter, notificationsWithReadState]);

  const markAsRead = (id: string) => {
    setReadMap((prevMap) => {
      if (prevMap[id]) {
        return prevMap;
      }

      return {
        ...prevMap,
        [id]: true,
      };
    });
  };

  const markAllAsRead = () => {
    const allReadMap = notifications.reduce<Record<string, true>>((accumulator, item) => {
      accumulator[item.id] = true;
      return accumulator;
    }, {});

    setReadMap(allReadMap);
  };

  const isLoading =
    isCourseLoading ||
    isAssignmentsLoading ||
    isMaterialsLoading ||
    isQuizzesLoading ||
    (userRole === 'teacher' && isEnrollmentsLoading);

  if (!courseId) {
    return (
      <div className="mycourse-shell">
        <div className="mycourse-container">
          <Empty description="Không tìm thấy khóa học" />
        </div>
      </div>
    );
  }

  return (
    <div className="mycourse-shell">
      <div className="mycourse-container">
        <Card className="rounded-2xl border-0 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Title level={2} className="!mb-1 !text-[#012643]">
                <BellOutlined className="mr-2 text-pink-500" />
                Thông báo khóa học
              </Title>
              <Text className="text-gray-500">
                {courseData?.data?.title || 'Khóa học'} - {userRole === 'teacher' ? 'Bảng thông báo giảng viên' : 'Bảng thông báo học viên'}
              </Text>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/my-course/detail/${courseId}`}>
                <Button>Quay lại khóa học</Button>
              </Link>
              <Button type="primary" onClick={markAllAsRead} disabled={unreadCount === 0} className="!bg-[#012643] !border-[#012643]">
                Đánh dấu đã đọc tất cả
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Segmented
              value={filter}
              onChange={(value) => setFilter(value as NotificationFilter)}
              options={[
                { label: `Tất cả (${notificationsWithReadState.length})`, value: 'all' },
                { label: `Chưa đọc (${unreadCount})`, value: 'unread' },
              ]}
            />
            <Text className="text-sm text-gray-500">Tự động tổng hợp từ lớp học, bài tập, tài liệu và bài kiểm tra</Text>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-14">
              <Spin size="large" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12">
              <Empty
                description={
                  filter === 'unread' ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo nào cho khóa học này'
                }
              />
            </div>
          ) : (
            <List
              className="mt-4"
              dataSource={filteredNotifications}
              itemLayout="horizontal"
              renderItem={(item) => (
                <List.Item
                  className={`cursor-pointer rounded-xl px-3 py-3 transition ${item.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  onClick={() => markAsRead(item.id)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getTypeIcon(item.type)} className="!bg-white !shadow-sm" />}
                    title={
                      <div className="flex flex-wrap items-center gap-2">
                        <Text strong className={item.isRead ? 'text-gray-700' : 'text-[#012643]'}>
                          {item.title}
                        </Text>
                        {!item.isRead && <Tag color="blue">Mới</Tag>}
                        <Tag color={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Ưu tiên cao' : item.priority === 'medium' ? 'Trung bình' : 'Thông tin'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <Text className="block text-gray-600">{item.description}</Text>
                        <Text className="text-xs text-gray-400">{formatDateTime(item.createdAt)}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenter;