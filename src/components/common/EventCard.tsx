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
  
  return (
    <div 
      className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor} cursor-pointer hover:shadow-md transition-all`}
      onClick={() => onClick?.(event)}
    >
      <div className="flex items-start gap-3">
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.textColor}`} 
          style={{ backgroundColor: `${config.color}20` }}
        >
          {getEventIcon(event.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge color={config.color} className="!rounded-full !text-xs !m-0">
              {config.label}
            </Badge>
            <Text className="text-xs text-gray-400">
              {dayjs(event.date).format('MMM D')}
            </Text>
          </div>
          <Text className="font-semibold text-[#012643] block truncate">{event.title}</Text>
          {!compact && (
            <>
              <Text className="text-sm text-gray-500 block truncate">{event.courseName}</Text>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined />
                  {event.startTime} - {event.endTime}
                </span>
                {event.instructor && (
                  <span className="flex items-center gap-1">
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
