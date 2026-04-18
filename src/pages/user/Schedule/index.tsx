import React from 'react';
import {
  Calendar,
  Card,
  Modal,
  Typography,
  Button,
  Row,
  Col,
  Select,
  Empty,
  Spin,
  Alert,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { EVENT_TYPE_CONFIG } from '../../../constants/scheduleData';
import { useSchedule } from '../../../hooks';
import { EventCard, getEventIcon } from '../../../components/common';
import Badge from '../../../components/common/Tag';

const { Title, Text } = Typography;

const Schedule: React.FC = () => {
  const {
    selectedDate,
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
  } = useSchedule();

  const formatHourMinute = (time?: string) => {
    if (!time) return '--:--';
    const parts = time.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return time;
  };

  const dateCellRender = (value: Dayjs) => {
    const events = getEventsForDate(value);
    return (
      <ul className="list-none p-0 m-0">
        {events.slice(0, 2).map((event) => {
          const config = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG];
          return (
            <li
              key={event.id}
              className={`mb-1 text-xs cursor-pointer rounded px-1.5 py-1 ${config.bgColor} ${config.textColor} hover:opacity-80 transition-opacity`}
              onClick={(e) => {
                e.stopPropagation();
                openEventModal(event);
              }}
            >
              <div className="font-medium leading-tight truncate">{event.title}</div>
              <div className="leading-tight truncate opacity-85">{event.courseName || 'Chưa có môn'}</div>
              <div className="leading-tight opacity-85">
                {formatHourMinute(event.startTime)} - {formatHourMinute(event.endTime)}
              </div>
            </li>
          );
        })}
        {events.length > 2 && (
          <li className="text-xs text-gray-400">+{events.length - 2} thêm</li>
        )}
      </ul>
    );
  };

  const onSelect = (value: Dayjs) => {
    handleDateSelect(value);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Đang tải lịch học...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Error banner — non-blocking, shows above content */}
        {isError && (
          <Alert
            type="warning"
            message="Không thể tải dữ liệu lịch học từ máy chủ. Vui lòng thử lại sau."
            showIcon
            className="mb-4 rounded-xl"
            closable
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={2} className="!text-[#012643] !mb-1 flex items-center gap-3">
              <CalendarOutlined className="text-blue-500" />
              Lịch học của tôi
            </Title>
            <Text className="text-gray-500">Quản lý lịch học và các sự kiện sắp tới</Text>
          </div>
          <div className="flex gap-3">
            <Select
              value={filterType}
              onChange={setFilterType}
              className="!w-44"
              options={[
                { value: 'all', label: 'Tất cả sự kiện' },
                { value: 'class', label: 'Lớp học' },
                { value: 'assignment', label: 'Bài tập' },
                { value: 'quiz', label: 'Kiểm tra' },
                { value: 'meeting', label: 'Cuộc họp' },
                { value: 'deadline', label: 'Hạn chót' },
              ]}
            />
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#012643]">{stats.total}</div>
                <div className="text-gray-500 text-sm">Tổng sự kiện</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.classes}</div>
                <div className="text-gray-500 text-sm">Lớp học</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.assignments}</div>
                <div className="text-gray-500 text-sm">Bài tập</div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.quizzes}</div>
                <div className="text-gray-500 text-sm">Kiểm tra</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Calendar */}
          <Col xs={24} lg={16}>
            <Card className="rounded-2xl border-0 shadow-md">
              <Calendar
                cellRender={(date, info) => {
                  if (info.type === 'date') return dateCellRender(date);
                  return info.originNode;
                }}
                onSelect={onSelect}
                className="custom-calendar"
                headerRender={({ value, onChange }) => (
                  <div className="flex items-center justify-between mb-4 px-2">
                    <Button
                      type="text"
                      icon={<LeftOutlined />}
                      onClick={() => onChange(value.subtract(1, 'month'))}
                    />
                    <Title level={4} className="!mb-0 !text-[#012643]">
                      {value.format('MMMM YYYY')}
                    </Title>
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      onClick={() => onChange(value.add(1, 'month'))}
                    />
                  </div>
                )}
              />
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Today's Events */}
            <Card className="rounded-2xl border-0 shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <Title level={5} className="!mb-0 !text-[#012643]">Lịch hôm nay</Title>
                <Badge color="blue" className="!rounded-full">{todayEvents.length} sự kiện</Badge>
              </div>
              {todayEvents.length === 0 ? (
                <Empty
                  description="Không có sự kiện hôm nay"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="!my-4"
                />
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <EventCard key={event.id} event={event} compact onClick={openEventModal} />
                  ))}
                </div>
              )}
            </Card>

            {/* Upcoming Events */}
            <Card className="rounded-2xl border-0 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Title level={5} className="!mb-0 !text-[#012643]">Sự kiện sắp tới</Title>
              </div>
              {upcomingEvents.length === 0 ? (
                <Empty
                  description="Không có sự kiện sắp tới"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="!my-4"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} onClick={openEventModal} />
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Event Detail Modal */}
        <Modal
          title={selectedEvent ? 'Chi tiết sự kiện' : `Sự kiện ngày ${selectedDate.format('DD/MM/YYYY')}`}
          open={isModalOpen}
          onCancel={closeModal}
          footer={
            selectedEvent
              ? [
                  <Button key="close" onClick={closeModal}>Đóng</Button>,
                  selectedEvent.type === 'class' && (
                    <Button
                      key="join"
                      type="primary"
                      icon={<VideoCameraOutlined />}
                      className="!bg-[#012643]"
                      href={selectedEvent.meetingLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tham gia lớp
                    </Button>
                  ),
                ]
              : null
          }
          width={500}
        >
          {selectedEvent ? (
            <div className="space-y-4">
              {/* Event Header */}
              <div className={`p-4 rounded-xl ${EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].bgColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].textColor}`}
                    style={{ backgroundColor: `${EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].color}20` }}
                  >
                    {getEventIcon(selectedEvent.type)}
                  </div>
                  <div>
                    <Badge
                      color={EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].color}
                      className="!rounded-full"
                    >
                      {EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].label}
                    </Badge>
                  </div>
                </div>
                <Title level={4} className="!mb-1 !text-[#012643]">{selectedEvent.title}</Title>
                {selectedEvent.courseName && (
                  <Text className="text-gray-600">{selectedEvent.courseName}</Text>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarOutlined className="text-gray-400" />
                  <Text>{dayjs(selectedEvent.date).format('dddd, MMMM D, YYYY')}</Text>
                </div>
                <div className="flex items-center gap-3">
                  <ClockCircleOutlined className="text-gray-400" />
                  <Text>{selectedEvent.startTime} - {selectedEvent.endTime}</Text>
                </div>
                {selectedEvent.instructor && (
                  <div className="flex items-center gap-3">
                    <UserOutlined className="text-gray-400" />
                    <Text>{selectedEvent.instructor}</Text>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-3">
                    <EnvironmentOutlined className="text-gray-400" />
                    <Text>{selectedEvent.location}</Text>
                  </div>
                )}
                {selectedEvent.meetingLink && (
                  <div className="flex items-center gap-3">
                    <LinkOutlined className="text-gray-400" />
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {selectedEvent.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="pt-3 border-t border-gray-100">
                  <Text className="text-gray-500 text-sm block mb-1">Mô tả</Text>
                  <Text>{selectedEvent.description}</Text>
                </div>
              )}
            </div>
          ) : (
            // Multiple events view
            <div className="space-y-3">
              {getEventsForDate(selectedDate).length === 0 ? (
                <Empty description="Không có sự kiện trong ngày này" />
              ) : (
                getEventsForDate(selectedDate).map(event => (
                  <EventCard key={event.id} event={event} onClick={openEventModal} />
                ))
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Schedule;
