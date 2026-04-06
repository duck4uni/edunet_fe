// Stats Card Component
import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: string;
  loading?: boolean;
  tooltip?: string;
  onClick?: () => void;
  formatter?: (value: number | string) => string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  trend,
  trendLabel,
  color = '#1890ff',
  loading = false,
  tooltip,
  onClick,
  formatter,
}) => {
  const formattedValue = formatter ? formatter(value) : value;
  
  const trendColor = trend && trend > 0 ? '#52c41a' : trend && trend < 0 ? '#f5222d' : '#8c8c8c';
  const TrendIcon = trend && trend > 0 ? ArrowUpOutlined : ArrowDownOutlined;

  return (
    <Card
      className={`stats-card transition-all duration-300 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      style={{ borderTop: `3px solid ${color}` }}
      loading={loading}
      onClick={onClick}
      hoverable={!!onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-sm font-medium">
              {title}
            </span>
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            )}
          </div>
          <Statistic
            value={formattedValue}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ 
              fontSize: '28px', 
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.88)',
            }}
          />
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <TrendIcon style={{ color: trendColor, fontSize: '12px' }} />
              <span style={{ color: trendColor, fontSize: '13px', fontWeight: 500 }}>
                {Math.abs(trend).toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="text-gray-400 text-xs ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <span style={{ color, fontSize: '24px' }}>{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
