import dayjs from 'dayjs';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format);
};

/**
 * Format a date and time to a readable string
 */
export const formatDateTime = (date: string | Date, format: string = 'DD/MM/YYYY HH:mm'): string => {
  return dayjs(date).format(format);
};

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(date);
};

/**
 * Format a number to currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'VND',
  locale: string = 'vi-VN'
): string => {
  if (currency === 'VND') {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (num: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format percentage with optional decimal places
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};
