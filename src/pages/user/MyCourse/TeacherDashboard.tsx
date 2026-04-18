import React, { useMemo, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useGetProfileQuery } from '../../../services/authApi';
import {
  useCreateCourseMutation,
  useGetCategoriesQuery,
  useGetCoursesQuery,
  useSubmitCourseForReviewMutation,
  useUpdateCourseMutation,
} from '../../../services/courseApi';
import { useCreateRecurringScheduleMutation } from '../../../services/learningApi';
import type { Course } from '../../../services/courseApi';
import CourseEditorDrawer, { type CourseDrawerFormValues } from './components/CourseEditorDrawer';
import { notify } from '../../../utils/notify';

const { Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; isWarning?: boolean }> = {
  draft: { label: 'Bản nháp', icon: <FileTextOutlined /> },
  pending: { label: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
  approved: { label: 'Đã duyệt', icon: <CheckCircleOutlined /> },
  published: { label: 'Đã xuất bản', icon: <CheckCircleOutlined /> },
  rejected: { label: 'Bị từ chối', icon: <CloseCircleOutlined />, isWarning: true },
  archived: { label: 'Đã lưu trữ', icon: <ClockCircleOutlined />, isWarning: true },
};

const TeacherDashboard: React.FC = () => {
  const { data: profileResponse } = useGetProfileQuery();
  const user = profileResponse?.data;
  const isTeacher = user?.role === 'teacher';

  const { data: coursesData, isLoading, refetch } = useGetCoursesQuery({
    filter: user?.id ? `teacherId:eq:${user.id}` : undefined,
    include: 'category',
    sort: 'createdAt:desc',
  });

  const { data: categoriesData } = useGetCategoriesQuery();

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [createRecurringSchedule, { isLoading: isCreatingSchedule }] = useCreateRecurringScheduleMutation();
  const [submitForReview, { isLoading: isSubmitting }] = useSubmitCourseForReviewMutation();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [form] = Form.useForm<CourseDrawerFormValues>();
  const thumbnailUrl = Form.useWatch('thumbnail', form) as string | undefined;

  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const myCourses = coursesData?.data?.rows || [];

  const filteredCourses = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return myCourses.filter((course) => {
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      const matchesSearch =
        !keyword ||
        course.title?.toLowerCase().includes(keyword) ||
        course.category?.name?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [myCourses, searchText, statusFilter]);

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data?.rows ?? []).map((category) => ({
        id: String(category.id),
        name: category.name || '',
      })),
    [categoriesData],
  );

  const uploadThumbnailToCloudinary = async (file: File): Promise<string> => {
    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      throw new Error('Thiếu cấu hình Cloudinary. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryUploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data?.secure_url) {
      throw new Error(data?.error?.message || 'Không thể tải ảnh lên Cloudinary');
    }

    return data.secure_url as string;
  };

  const beforeThumbnailUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image/')) {
      notify.error('Chỉ chấp nhận file ảnh');
      return Upload.LIST_IGNORE;
    }

    const isUnder5Mb = file.size / 1024 / 1024 < 5;
    if (!isUnder5Mb) {
      notify.error('Kích thước ảnh phải nhỏ hơn 5MB');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleThumbnailUpload: UploadProps['customRequest'] = async (options) => {
    const rawFile = options.file as File;

    try {
      setThumbnailUploading(true);
      const uploadedUrl = await uploadThumbnailToCloudinary(rawFile);
      form.setFieldValue('thumbnail', uploadedUrl);
      notify.success('Tải ảnh lên Cloudinary thành công');
      options.onSuccess?.({ secure_url: uploadedUrl });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải ảnh lên Cloudinary';
      notify.error(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleOpenModal = (record?: Course) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? dayjs(record.startDate) : undefined,
        createTimetable: false,
        timetableType: 'class',
        timetableTitle: `${record.title} - Lịch học`,
        weekDays: [1, 3, 5],
        isOnline: false,
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        createTimetable: false,
        timetableType: 'class',
        weekDays: [1, 3, 5],
        isOnline: false,
      });
    }

    setIsModalVisible(true);
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      await submitForReview(courseId).unwrap();
      notify.success('Đã gửi khóa học để xét duyệt');
      refetch();
    } catch {
      notify.error('Không thể gửi xét duyệt, vui lòng thử lại');
    }
  };

  const handleFinish = async (values: CourseDrawerFormValues) => {
    try {
      const {
        createTimetable,
        timetableTitle,
        timetableDescription,
        timetableType,
        recurrenceStartDate,
        recurrenceEndDate,
        weekDays,
        scheduleStartTime,
        scheduleEndTime,
        isOnline,
        location,
        meetingLink,
        ...courseValues
      } = values;

      if (createTimetable) {
        if (!recurrenceStartDate || !recurrenceEndDate || !scheduleStartTime || !scheduleEndTime || !weekDays?.length) {
          notify.error('Vui lòng nhập đầy đủ thông tin thời khóa biểu');
          return;
        }

        if (recurrenceEndDate.isBefore(recurrenceStartDate, 'day')) {
          notify.error('Ngày kết thúc lịch học phải sau hoặc bằng ngày bắt đầu');
          return;
        }

        if (scheduleEndTime.isSame(scheduleStartTime) || scheduleEndTime.isBefore(scheduleStartTime)) {
          notify.error('Giờ kết thúc phải sau giờ bắt đầu');
          return;
        }
      }

      const payload = {
        ...courseValues,
        price: courseValues.price ? Number(courseValues.price) : 0,
        discountPrice: courseValues.discountPrice ? Number(courseValues.discountPrice) : undefined,
        totalLessons: courseValues.totalLessons ? Number(courseValues.totalLessons) : 0,
        startDate: courseValues.startDate ? courseValues.startDate.toISOString() : undefined,
      };

      let courseId = editingId;

      if (editingId) {
        await updateCourse({ id: editingId, data: payload }).unwrap();
        notify.success('Cập nhật thành công');
      } else {
        const createdCourse = await createCourse({
          ...payload,
          teacherId: user?.id,
        }).unwrap();
        courseId = createdCourse.data?.id;
        notify.success('Tạo khóa học thành công, khóa học đang chờ xét duyệt');
      }

      if (createTimetable && courseId) {
        const recurringResult = await createRecurringSchedule({
          title: timetableTitle?.trim() || `${payload.title} - Buổi học`,
          type: timetableType || 'class',
          description: timetableDescription?.trim() || undefined,
          startDate: recurrenceStartDate!.format('YYYY-MM-DD'),
          recurrenceEndDate: recurrenceEndDate!.format('YYYY-MM-DD'),
          weekDays: weekDays!,
          startTime: scheduleStartTime!.format('HH:mm'),
          endTime: scheduleEndTime!.format('HH:mm'),
          isOnline: !!isOnline,
          location: isOnline ? undefined : location?.trim() || undefined,
          meetingLink: isOnline ? meetingLink?.trim() || undefined : undefined,
          courseId,
          teacherId: user?.id,
        }).unwrap();

        notify.success(`Đã tạo thời khóa biểu: ${recurringResult.data.count} buổi học`);
      }

      setIsModalVisible(false);
      refetch();
    } catch (error) {
      console.error('Failed to save course:', error);
      notify.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const canEdit = (course: Course) => course.status === 'draft' || course.status === 'rejected';
  const canSubmit = (course: Course) => course.status === 'draft' || course.status === 'rejected';

  const getCourseCount = (course: Course, numberKeys: string[], arrayKeys: string[] = []): number => {
    const rawCourse = course as unknown as Record<string, unknown>;

    for (const key of numberKeys) {
      const value = rawCourse[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }

    for (const key of arrayKeys) {
      const value = rawCourse[key];
      if (Array.isArray(value)) {
        return value.length;
      }
    }

    return 0;
  };

  if (!isTeacher) {
    return <Empty description="Bạn không có quyền truy cập." />;
  }

  const columns: ColumnsType<Course> = [
    {
      title: 'KHÓA HỌC',
      dataIndex: 'title',
      key: 'title',
      render: (_title, record) => (
        <div className="mycourse-course-cell">
          <img
            src={record.thumbnail || 'https://placehold.co/320x180?text=Course'}
            alt={record.title}
            className="mycourse-thumbnail"
          />
          <div className="mycourse-course-info">
            <Text strong className="mycourse-course-name">
              {record.title}
            </Text>
            <Text className="mycourse-subtext">{record.category?.name || 'Chưa phân loại'}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'HỌC VIÊN',
      key: 'studentCount',
      width: 90,
      align: 'center',
      render: (_value, record) => <Text>{getCourseCount(record, ['totalStudents', 'studentCount', 'studentsCount'], ['students'])}</Text>,
    },
    {
      title: 'BÀI TẬP',
      key: 'assignmentCount',
      width: 90,
      align: 'center',
      render: (_value, record) => <Text>{getCourseCount(record, ['totalAssignments', 'assignmentCount', 'assignmentsCount'], ['assignments'])}</Text>,
    },
    {
      title: 'QUIZZ',
      key: 'quizCount',
      width: 90,
      align: 'center',
      render: (_value, record) => <Text>{getCourseCount(record, ['totalQuizzes', 'quizCount', 'quizzesCount'], ['quizzes'])}</Text>,
    },
    {
      title: 'TÀI LIỆU',
      key: 'materialCount',
      width: 90,
      align: 'center',
      render: (_value, record) => <Text>{getCourseCount(record, ['totalMaterials', 'materialCount', 'materialsCount'], ['materials'])}</Text>,
    },
    {
      title: 'GIÁ',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (price: number) => <Text>{Number(price || 0).toLocaleString('vi-VN')} đ</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
        return <span className={`mycourse-pill ${config.isWarning ? 'is-warning' : ''}`}>{config.label}</span>;
      },
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => <Text>{dayjs(createdAt).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 280,
      render: (_value, record) => (
        <Space size={6} wrap>
          {canEdit(record) && (
            <Tooltip title="Chỉnh sửa thông tin">
              <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>
                Sửa
              </Button>
            </Tooltip>
          )}

          {canSubmit(record) && (
            <Popconfirm
              title="Gửi khóa học để xét duyệt?"
              description="Admin sẽ xem xét và phê duyệt khóa học của bạn."
              onConfirm={() => handleSubmitForReview(record.id)}
              okText="Gửi"
              cancelText="Hủy"
            >
              <Button size="small" type="primary" icon={<SendOutlined />} loading={isSubmitting}>
                Gửi duyệt
              </Button>
            </Popconfirm>
          )}

          <Link to={`/my-course/manage-course/${record.id}`}>
            <Button size="small" icon={<SettingOutlined />}>
              Nội dung
            </Button>
          </Link>

          {(record.status === 'published' || record.status === 'approved') && (
            <Link to={`/course/${record.id}`} target="_blank">
              <Button size="small" icon={<EyeOutlined />}>
                Xem
              </Button>
            </Link>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="mycourse-shell">
      <div className="mycourse-container">
        <div className="mycourse-toolbar teacher-dashboard-toolbar">
          <h1 className="mycourse-main-title">QUẢN LÝ KHÓA HỌC GIẢNG VIÊN</h1>

          <div className="teacher-dashboard-toolbar-controls">
            <div className="mycourse-toolbar-left">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Tìm kiếm theo tên khóa học hoặc danh mục..."
                allowClear
                className="mycourse-search-input"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="mycourse-status-select"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'draft', label: 'Bản nháp' },
                  { value: 'pending', label: 'Chờ duyệt' },
                  { value: 'approved', label: 'Đã duyệt' },
                  { value: 'published', label: 'Đã xuất bản' },
                  { value: 'rejected', label: 'Bị từ chối' },
                  { value: 'archived', label: 'Đã lưu trữ' },
                ]}
              />
            </div>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              Tạo khóa học
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="mycourse-loading">
            <Spin size="large" tip="Đang tải danh sách..." />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="mycourse-empty-wrap">
            <Empty description="Không có khóa học phù hợp.">
              <Button type="primary" onClick={() => handleOpenModal()}>
                Tạo khóa học đầu tiên
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="mycourse-table-shell">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredCourses}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: 1250 }}
            />
          </div>
        )}
      </div>

      <CourseEditorDrawer
        open={isModalVisible}
        editingId={editingId}
        form={form}
        onClose={() => setIsModalVisible(false)}
        onFinish={handleFinish}
        categories={categoryOptions}
        isSubmitting={isCreating || isUpdating || isCreatingSchedule}
        thumbnailUploading={thumbnailUploading}
        thumbnailUrl={thumbnailUrl}
        beforeThumbnailUpload={beforeThumbnailUpload}
        onThumbnailUpload={handleThumbnailUpload}
        onRemoveThumbnail={() => form.setFieldValue('thumbnail', undefined)}
      />
    </div>
  );
};

export default TeacherDashboard;
