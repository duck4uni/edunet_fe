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
  Space,
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
  FileTextOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { EVENT_TYPE_CONFIG } from '../../../constants/scheduleData';
import { useSchedule } from '../../../hooks';
import { EventCard, getEventIcon } from '../../../components/common';
import Badge from '../../../components/common/Tag';
import './schedule.css';

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

  const selectedDateEvents = getEventsForDate(selectedDate);

  const statCards = [
    {
      key: 'total',
      label: 'Tổng sự kiện',
      value: stats.total,
      icon: <ReadOutlined />,
      colorClass: 'is-total',
    },
    {
      key: 'classes',
      label: 'Lớp học',
      value: stats.classes,
      icon: <VideoCameraOutlined />,
      colorClass: 'is-class',
    },
    {
      key: 'assignments',
      label: 'Bài tập',
      value: stats.assignments,
      icon: <FileTextOutlined />,
      colorClass: 'is-assignment',
    },
    {
      key: 'quizzes',
      label: 'Kiểm tra',
      value: stats.quizzes,
      icon: <QuestionCircleOutlined />,
      colorClass: 'is-quiz',
    },
  ];

  const dateCellRender = (value: Dayjs) => {
    const events = getEventsForDate(value);

    if (events.length === 0) {
      return null;
    }

    return (
      <ul className="schedule-cell-list">
        {events.slice(0, 2).map((event) => {
          const config = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG];
          return (
            <li
              key={event.id}
              className="schedule-cell-event"
              style={{
                borderColor: `${config.color}4D`,
                backgroundColor: `${config.color}14`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                openEventModal(event);
              }}
            >
              <span
                className="schedule-cell-event-dot"
                style={{ backgroundColor: config.color }}
              />
              <div className="schedule-cell-event-content">
                <div className="schedule-cell-event-title">{event.title}</div>
                <div className="schedule-cell-event-time">
                {formatHourMinute(event.startTime)} - {formatHourMinute(event.endTime)}
                </div>
              </div>
            </li>
          );
        })}
        {events.length > 2 && (
          <li className="schedule-cell-more">+{events.length - 2} sự kiện</li>
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
      <div className="schedule-page schedule-page-loading">
        <div className="schedule-loading-box">
          <Spin size="large" />
          <div className="schedule-loading-text">Đang tải lịch học...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <div className="schedule-page__inner">
        {/* Error banner — non-blocking, shows above content */}
        {isError && (
          <Alert
            type="warning"
            message="Không thể tải dữ liệu lịch học từ máy chủ. Vui lòng thử lại sau."
            showIcon
            className="schedule-alert"
            closable
          />
        )}

        {/* Header */}
        <section className="schedule-hero">
          <div className="schedule-hero__left">
            <div className="schedule-hero__icon">
              <CalendarOutlined />
            </div>
            <div>
              <Title level={2} className="schedule-hero__title">
                Lịch học của tôi
              </Title>
              <Text className="schedule-hero__subtitle">
                Theo dõi lớp học, bài tập và mốc quan trọng theo từng ngày.
              </Text>
            </div>
          </div>

          <div className="schedule-hero__actions">
            <div className="schedule-selected-date-pill">
              <CalendarOutlined />
              {selectedDate.format('DD/MM/YYYY')}
            </div>
            <Select
              value={filterType}
              onChange={setFilterType}
              className="schedule-filter-select"
              options={[
                { value: 'all', label: 'Tất cả sự kiện' },
                { value: 'class', label: 'Lớp học' },
                { value: 'assignment', label: 'Bài tập' },
                { value: 'quiz', label: 'Kiểm tra' },
                { value: 'meeting', label: 'Cuộc họp' },
                { value: 'deadline', label: 'Hạn chót' },
              ]}
            />
            <Button
              className="schedule-today-btn"
              onClick={() => handleDateSelect(dayjs())}
            >
              Về hôm nay
            </Button>
          </div>
        </section>

        {/* Stats */}
        <Row gutter={[14, 14]} className="schedule-stats-grid">
          {statCards.map((item) => (
            <Col xs={12} sm={6} key={item.key}>
              <Card className={`schedule-stat-card ${item.colorClass}`}>
                <div className="schedule-stat-card__body">
                  <div className="schedule-stat-card__icon">{item.icon}</div>
                  <div>
                    <div className="schedule-stat-card__value">{item.value}</div>
                    <div className="schedule-stat-card__label">{item.label}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[18, 18]} className="schedule-content-grid">
          {/* Calendar */}
          <Col xs={24} lg={16}>
            <Card className="schedule-card schedule-calendar-card">
              <div className="schedule-card-head">
                <div>
                  <Title level={4} className="schedule-card-title">
                    Lịch tháng
                  </Title>
                  <Text className="schedule-card-subtitle">
                    Nhấn vào ngày để xem nhanh danh sách sự kiện.
                  </Text>
                </div>
                <Badge color="processing" className="schedule-card-badge">
                  {selectedDateEvents.length} sự kiện ngày đã chọn
                </Badge>
              </div>

              <Calendar
                cellRender={(date, info) => {
                  if (info.type === 'date') return dateCellRender(date);
                  return info.originNode;
                }}
                onSelect={onSelect}
                className="schedule-calendar"
                headerRender={({ value, onChange }) => (
                  <div className="schedule-calendar-header">
                    <Button
                      type="text"
                      icon={<LeftOutlined />}
                      className="schedule-month-nav-btn"
                      onClick={() => onChange(value.subtract(1, 'month'))}
                    />
                    <Title level={4} className="schedule-month-title">
                      {value.format('MMMM YYYY')}
                    </Title>
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      className="schedule-month-nav-btn"
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
            <Card className="schedule-card schedule-side-card">
              <div className="schedule-side-head">
                <Title level={5} className="schedule-side-title">Lịch hôm nay</Title>
                <Badge color="blue" className="schedule-side-badge">{todayEvents.length} sự kiện</Badge>
              </div>
              {todayEvents.length === 0 ? (
                <Empty
                  description="Không có sự kiện hôm nay"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="schedule-empty"
                />
              ) : (
                <div className="schedule-event-feed">
                  {todayEvents.map(event => (
                    <EventCard key={event.id} event={event} compact onClick={openEventModal} />
                  ))}
                </div>
              )}
            </Card>

            {/* Upcoming Events */}
            <Card className="schedule-card schedule-side-card schedule-upcoming-card">
              <div className="schedule-side-head">
                <Title level={5} className="schedule-side-title">Sự kiện sắp tới</Title>
                <Space size={4} className="schedule-upcoming-link">
                  <span>Xem nhanh</span>
                  <ArrowRightOutlined />
                </Space>
              </div>
              {upcomingEvents.length === 0 ? (
                <Empty
                  description="Không có sự kiện sắp tới"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="schedule-empty"
                />
              ) : (
                <div className="schedule-event-feed">
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
          className="schedule-event-modal"
          footer={
            selectedEvent
              ? [
                  <Button key="close" onClick={closeModal}>Đóng</Button>,
                  selectedEvent.type === 'class' && (
                    <Button
                      key="join"
                      type="primary"
                      icon={<VideoCameraOutlined />}
                      className="schedule-join-btn"
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
            <div className="schedule-event-modal-content">
              {/* Event Header */}
              <div
                className="schedule-event-modal-head"
                style={{
                  backgroundColor: `${EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].color}14`,
                  borderColor: `${EVENT_TYPE_CONFIG[selectedEvent.type as keyof typeof EVENT_TYPE_CONFIG].color}33`,
                }}
              >
                <div className="schedule-event-modal-head-top">
                  <div
                    className="schedule-event-modal-icon"
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
                <Title level={4} className="schedule-event-modal-title">{selectedEvent.title}</Title>
                {selectedEvent.courseName && (
                  <Text className="schedule-event-modal-course">{selectedEvent.courseName}</Text>
                )}
              </div>

              {/* Event Details */}
              <div className="schedule-event-modal-details">
                <div className="schedule-event-modal-row">
                  <CalendarOutlined className="schedule-event-modal-row-icon" />
                  <Text>{dayjs(selectedEvent.date).format('dddd, MMMM D, YYYY')}</Text>
                </div>
                <div className="schedule-event-modal-row">
                  <ClockCircleOutlined className="schedule-event-modal-row-icon" />
                  <Text>{selectedEvent.startTime} - {selectedEvent.endTime}</Text>
                </div>
                {selectedEvent.instructor && (
                  <div className="schedule-event-modal-row">
                    <UserOutlined className="schedule-event-modal-row-icon" />
                    <Text>{selectedEvent.instructor}</Text>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="schedule-event-modal-row">
                    <EnvironmentOutlined className="schedule-event-modal-row-icon" />
                    <Text>{selectedEvent.location}</Text>
                  </div>
                )}
                {selectedEvent.meetingLink && (
                  <div className="schedule-event-modal-row">
                    <LinkOutlined className="schedule-event-modal-row-icon" />
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="schedule-event-link"
                    >
                      {selectedEvent.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="schedule-event-description">
                  <Text className="schedule-event-description-label">Mô tả</Text>
                  <Text>{selectedEvent.description}</Text>
                </div>
              )}
            </div>
          ) : (
            // Multiple events view
            <div className="schedule-event-feed">
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
