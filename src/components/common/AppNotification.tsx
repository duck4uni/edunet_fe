import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { subscribeNotification, type NotifyType } from '../../utils/notify';

type ToastItem = {
  id: string;
  type: NotifyType;
  text: string;
  duration: number;
};

const TYPE_ICON_MAP: Record<NotifyType, React.ReactNode> = {
  success: <CheckCircleFilled />,
  error: <CloseCircleFilled />,
  info: <InfoCircleFilled />,
  warning: <ExclamationCircleFilled />,
};

const TYPE_CLASS_MAP: Record<NotifyType, string> = {
  success: 'app-notify-item is-success',
  error: 'app-notify-item is-error',
  info: 'app-notify-item is-info',
  warning: 'app-notify-item is-warning',
};

const AppNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeNotification((command) => {
      if (command.action === 'clear') {
        setToasts([]);
        return;
      }

      const { payload } = command;

      setToasts((previous) => [payload, ...previous].slice(0, 5));

      if (payload.duration > 0) {
        window.setTimeout(() => {
          removeToast(payload.id);
        }, payload.duration * 1000);
      }
    });

    return unsubscribe;
  }, [removeToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="app-notify-root" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={TYPE_CLASS_MAP[toast.type]}>
          <span className="app-notify-icon">{TYPE_ICON_MAP[toast.type]}</span>
          <div className="app-notify-content">{toast.text}</div>
          <button type="button" className="app-notify-close" onClick={() => removeToast(toast.id)}>
            <CloseOutlined />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AppNotification;
