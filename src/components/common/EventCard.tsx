import React from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import {
  ClockCircleOutlined,
  VideoCameraOutlined,
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { EVENT_TYPE_CONFIG } from '../../constants/scheduleData';
import type { ScheduleEvent } from '../../types/schedule';
import Badge from './Tag';

const { Text } = Typography;

export const getEventIcon = (type: string) => {
  switch (type) {
    case 'class': return <VideoCameraOutlined />;
    case 'assignment': return <FileTextOutlined />;
    case 'quiz': return <QuestionCircleOutlined />;
    case 'meeting': return <TeamOutlined />;
    case 'deadline': return <ExclamationCircleOutlined />;
    default: return <BookOutlined />;
  }
};

interface EventCardProps {
  event: ScheduleEvent;
  compact?: boolean;
  onClick?: (event: ScheduleEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, compact = false, onClick }) => {
  const config = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG];
  const cardStyle: React.CSSProperties = {
    borderColor: `${config.color}4D`,
    backgroundColor: `${config.color}14`,
  };
  
  return (
    <div
      className={`schedule-event-card ${compact ? 'is-compact' : ''}`}
      style={cardStyle}
      onClick={() => onClick?.(event)}
    >
      <div className="schedule-event-card__inner">
        <div
          className="schedule-event-card__icon"
          style={{ backgroundColor: `${config.color}24`, color: config.color }}
        >
          {getEventIcon(event.type)}
        </div>
        <div className="schedule-event-card__content">
          <div className="schedule-event-card__top">
            <Badge color={config.color} className="schedule-event-card__badge">
              {config.label}
            </Badge>
            <Text className="schedule-event-card__date">
              {dayjs(event.date).format('MMM D')}
            </Text>
          </div>
          <Text className="schedule-event-card__title">{event.title}</Text>

          <div className="schedule-event-card__time-row">
            <span className="schedule-event-card__time-item">
              <ClockCircleOutlined />
              {event.startTime} - {event.endTime}
            </span>
          </div>

          {!compact && (
            <>
              <Text className="schedule-event-card__course">{event.courseName}</Text>
              <div className="schedule-event-card__meta">
                {event.instructor && (
                  <span className="schedule-event-card__meta-item">
                    <UserOutlined />
                    {event.instructor}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
