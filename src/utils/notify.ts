export type NotifyType = 'success' | 'error' | 'info' | 'warning';

type NotifyInput =
  | string
  | {
      content?: string;
      message?: string;
      description?: string;
      duration?: number;
      type?: NotifyType;
    };

type NotifyPayload = {
  id: string;
  type: NotifyType;
  text: string;
  duration: number;
};

type NotifyCommand =
  | {
      action: 'push';
      payload: NotifyPayload;
    }
  | {
      action: 'clear';
    };

type NotifyListener = (command: NotifyCommand) => void;

const listeners = new Set<NotifyListener>();

const DEFAULT_DURATION_SECONDS = 3;

const normalizeInput = (input: NotifyInput): { text: string; duration: number; type?: NotifyType } => {
  if (typeof input === 'string') {
    return {
      text: input,
      duration: DEFAULT_DURATION_SECONDS,
    };
  }

  const text = input.content || input.message || input.description || '';

  return {
    text,
    duration: input.duration ?? DEFAULT_DURATION_SECONDS,
    type: input.type,
  };
};

const publish = (command: NotifyCommand): void => {
  listeners.forEach((listener) => listener(command));
};

const pushNotification = (type: NotifyType, input: NotifyInput): void => {
  const normalized = normalizeInput(input);

  if (!normalized.text) {
    return;
  }

  publish({
    action: 'push',
    payload: {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: normalized.type || type,
      text: normalized.text,
      duration: normalized.duration,
    },
  });
};

export const showAlertNotification = (input: NotifyInput, type: NotifyType = 'info'): void => {
  pushNotification(type, input);
};

export const notify = {
  success: (input: NotifyInput): void => pushNotification('success', input),
  error: (input: NotifyInput): void => pushNotification('error', input),
  info: (input: NotifyInput): void => pushNotification('info', input),
  warning: (input: NotifyInput): void => pushNotification('warning', input),
  open: (input: NotifyInput): void => {
    const normalized = normalizeInput(input);
    pushNotification(normalized.type || 'info', input);
  },
  loading: (input: NotifyInput): void => {
    const normalized = normalizeInput(input);
    pushNotification('info', normalized.text || 'Đang xử lý...');
  },
  destroy: (): void => {
    publish({ action: 'clear' });
  },
};

export const subscribeNotification = (listener: NotifyListener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
